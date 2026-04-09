/**
 * Stripe Service
 *
 * Responsibilities:
 *  1. Create/retrieve Stripe Customers for users
 *  2. Create SetupIntents for saving card details via Stripe Elements (frontend)
 *  3. Create Financial Connections sessions for linking bank accounts (ACH)
 *  4. Charge users monthly via their stored payment method (TWO charges: donation + service fee)
 *  5. Handle failed payments: retry logic, pause account on second failure
 *  6. Process Stripe webhooks to confirm payment outcomes
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── Fee config ───────────────────────────────────────────────────────────────
// The service fee is charged as a SEPARATE PaymentIntent — 100% of round-ups
// go to the user's chosen charity. The fee is PocketCache's platform revenue.
const FEE_CONFIG = {
  ach:       { rate: 0.05, min: 2.00, max: 5.00 },   // 5%, $2–$5
  apple_pay: { rate: 0.10, min: 2.00, max: 5.00 },   // 10%, $2–$5
  card:      { rate: 0.10, min: 2.00, max: 5.00 },   // 10%, $2–$5
};

/**
 * Calculate the platform service fee for a given gross amount and payment method.
 * Fee is separate from the donation — the full gross amount goes to charity.
 *
 * @param {number} grossAmount - donation amount in dollars
 * @param {string} paymentMethod - 'ach' | 'apple_pay' | 'card'
 * @returns {number} fee in dollars (floored to 2 decimal places)
 */
export function calculatePlatformFee(grossAmount, paymentMethod = 'card') {
  const config = FEE_CONFIG[paymentMethod] ?? FEE_CONFIG.card;
  const raw = grossAmount * config.rate;
  return Math.min(config.max, Math.max(config.min, parseFloat(raw.toFixed(2))));
}

/**
 * Create or retrieve a Stripe Customer for a user.
 * Idempotent — call freely, it won't create duplicates if stripe_customer_id is stored.
 */
export async function getOrCreateCustomer(userId, email, name) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { pocketcache_user_id: userId },
  });
  return customer.id;
}

/**
 * Step 1 for card (CC) payment method:
 * Create a SetupIntent so the frontend (Stripe Elements) can securely collect card details.
 * The frontend calls stripe.confirmCardSetup(clientSecret) — card never touches our server.
 */
export async function createSetupIntent(stripeCustomerId) {
  const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    usage: 'off_session',  // we'll charge them without them being present (monthly sweep)
  });
  return { clientSecret: setupIntent.client_secret };
}

/**
 * Step 1 for ACH payment method:
 * Create a Financial Connections session so the frontend can link a bank account.
 * Returns a client_secret the frontend passes to Stripe Financial Connections.
 */
export async function createFinancialConnectionsSession(stripeCustomerId) {
  const session = await stripe.financialConnections.sessions.create({
    account_holder: { type: 'customer', customer: stripeCustomerId },
    permissions: ['payment_method', 'balances'],
  });
  return { clientSecret: session.client_secret };
}

/**
 * After the frontend completes Stripe Elements / Financial Connections,
 * they send us the resulting payment_method ID. Attach it to the customer
 * so we can charge them off-session in the future.
 */
export async function attachPaymentMethod(paymentMethodId, stripeCustomerId) {
  await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
  // Set as default for future charges
  await stripe.customers.update(stripeCustomerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });
}

/**
 * Monthly charge: two separate PaymentIntents.
 *
 * Flow:
 *   1. Charge #1 — full gross_amount → 100% goes to charity via Endaoment
 *   2. Charge #2 — platform service fee (separate charge, PocketCache revenue)
 *
 * The fee is NEVER deducted from the donation. The user is billed separately.
 */
export async function chargeUser(stripeCustomerId, paymentMethodId, grossAmount, paymentMethod, chargeId) {
  const platformFee = calculatePlatformFee(grossAmount, paymentMethod);
  const grossCents = Math.round(grossAmount * 100);
  const feeCents = Math.round(platformFee * 100);

  // Charge 1: full donation amount — goes entirely to charity
  const donationIntent = await stripe.paymentIntents.create({
    amount: grossCents,
    currency: 'usd',
    customer: stripeCustomerId,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
    metadata: {
      pocketcache_charge_id: chargeId,
      charge_type: 'donation',
    },
    description: `PocketCache monthly round-up donation`,
  });

  // Charge 2: platform service fee — separate charge, PocketCache revenue
  const feeIntent = await stripe.paymentIntents.create({
    amount: feeCents,
    currency: 'usd',
    customer: stripeCustomerId,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
    metadata: {
      pocketcache_charge_id: chargeId,
      charge_type: 'service_fee',
    },
    description: `PocketCache monthly service fee`,
  });

  return {
    paymentIntentId: donationIntent.id,
    feePaymentIntentId: feeIntent.id,
    status: donationIntent.status,
    platformFeeCents: feeCents,
    netCents: grossCents,  // full amount goes to charity
  };
}

/**
 * Webhook handler: called by Express when Stripe sends an event.
 * Verifies the signature then routes to the right handler.
 */
export function constructWebhookEvent(payload, signature) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

export { stripe };
