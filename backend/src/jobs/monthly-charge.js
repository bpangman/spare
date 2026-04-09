/**
 * Monthly Charge Job
 * Schedule: runs on the 1st of every month at 6am (configured in server.js)
 *
 * What it does:
 *  1. For each active user, sum all un-swept round-ups from the past month
 *  2. If total >= $5.00 minimum, charge their payment method via Stripe (TWO charges)
 *  3. On success: mark round-ups as swept; full donation amount queued for Endaoment disbursement
 *  4. On failure: retry once after 3 days; if retry fails, pause account + notify user
 *
 * Fee model:
 *  - Donation charge = full round-up total → 100% goes to charity via Endaoment
 *  - Service fee charge = separate charge: 5% (ACH) or 10% (card/Apple Pay), $2 min, $5 max
 *  - PocketCache revenue = service fees only (never deducted from donations)
 */

import db from '../db/index.js';
import { chargeUser, calculatePlatformFee } from '../services/stripe.js';
import { randomUUID } from 'crypto';

// Minimum monthly round-up total before we charge. Balances below this roll over.
const MINIMUM_CHARGE = 5.00;

export async function runMonthlyCharge() {
  const period = getCurrentPeriod(); // 'YYYY-MM'
  console.log(`[monthly-charge] Starting for period ${period}...`);

  // Get all active users who have un-swept round-ups and a payment method
  const users = db.prepare(`
    SELECT
      u.id, u.payment_method,
      pm.stripe_customer_id, pm.stripe_payment_method_id, pm.last4,
      SUM(r.roundup) as total_roundup
    FROM users u
    JOIN payment_methods pm ON pm.user_id = u.id AND pm.is_default = 1
    JOIN roundups r ON r.user_id = u.id AND r.included_in IS NULL
    WHERE u.status = 'active'
    GROUP BY u.id
    HAVING total_roundup >= ?
  `).all(MINIMUM_CHARGE);

  console.log(`[monthly-charge] ${users.length} users to charge`);

  for (const user of users) {
    try {
      // Create the charge record first (so we have an ID for metadata)
      const chargeId = randomUUID();
      // Fee is a separate charge — does NOT reduce the donation amount
      const platformFee = calculatePlatformFee(user.total_roundup, user.payment_method);
      const donationAmount = user.total_roundup; // full amount goes to charity

      db.prepare(`
        INSERT INTO monthly_charges (id, user_id, period, gross_amount, platform_fee, net_amount)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(chargeId, user.id, period, user.total_roundup, platformFee, donationAmount);

      // Charge the user
      const result = await chargeUser(
        user.stripe_customer_id,
        user.stripe_payment_method_id,
        user.total_roundup,
        user.payment_method,
        chargeId
      );

      if (result.status === 'succeeded') {
        await onChargeSucceeded(chargeId, user, result, donationAmount);
      } else {
        // Payment requires further action or is processing async
        // The webhook handler will call onChargeSucceeded / onChargeFailed
        db.prepare(`UPDATE monthly_charges SET stripe_payment_intent_id = ? WHERE id = ?`)
          .run(result.paymentIntentId, chargeId);
        console.log(`[monthly-charge] User ${user.id}: charge ${result.status} — waiting for webhook`);
      }

    } catch (err) {
      console.error(`[monthly-charge] Error charging user ${user.id}:`, err.message);
      await onChargeFailed(user.id, err);
    }
  }

  console.log('[monthly-charge] Done.');
}

/**
 * Called after a successful charge (either immediately or via webhook).
 * donationAmount is the full round-up total — 100% of this goes to charity via Endaoment.
 * The service fee was already collected via the separate fee PaymentIntent.
 */
export async function onChargeSucceeded(chargeId, user, stripeResult, donationAmount) {
  // Mark round-ups as swept
  db.prepare(`
    UPDATE roundups SET included_in = ?
    WHERE user_id = ? AND included_in IS NULL
  `).run(chargeId, user.id);

  // Update charge record — net_amount = full donation (fee is separate)
  db.prepare(`
    UPDATE monthly_charges
    SET status = 'succeeded', stripe_payment_intent_id = ?, charged_at = unixepoch()
    WHERE id = ?
  `).run(stripeResult.paymentIntentId, chargeId);

  // No treasury deposit needed — the quarterly sweep job reads from monthly_charges
  // and submits the full donation amount directly to Endaoment via their API.
  console.log(`[monthly-charge] User ${user.id}: charged $${user.total_roundup} donation + $${stripeResult.platformFeeCents / 100} service fee`);
}

/**
 * Called on payment failure.
 * First failure: schedule retry for 3 days from now.
 * Second failure: pause account and notify user.
 */
export async function onChargeFailed(userId, error) {
  const charge = db.prepare(`
    SELECT * FROM monthly_charges
    WHERE user_id = ? AND status IN ('pending', 'retrying')
    ORDER BY created_at DESC LIMIT 1
  `).get(userId);

  if (!charge) return;

  if (charge.retry_count === 0) {
    // First failure — schedule retry in 3 days
    db.prepare(`
      UPDATE monthly_charges SET status = 'retrying', retry_count = 1 WHERE id = ?
    `).run(charge.id);

    console.log(`[monthly-charge] User ${userId}: charge failed, will retry in 3 days`);
    // TODO: Send "payment failed, will retry in 3 days" email to user via gogcli or email service

  } else {
    // Second failure — pause account
    db.prepare(`UPDATE monthly_charges SET status = 'failed' WHERE id = ?`).run(charge.id);
    db.prepare(`UPDATE users SET status = 'paused' WHERE id = ?`).run(userId);

    console.log(`[monthly-charge] User ${userId}: retry failed, account paused`);
    // TODO: Send "account paused, please update payment method" email to user
    // Round-ups continue accumulating. Account reactivates when user updates payment method.
  }
}

function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Allow running directly: node src/jobs/monthly-charge.js
if (process.argv[1].endsWith('monthly-charge.js')) {
  runMonthlyCharge().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
