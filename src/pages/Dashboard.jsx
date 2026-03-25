import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { ArrowUpRight, Zap, Heart, TrendingUp, X, Share2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useTheme } from '../store/ThemeContext';
import { TRANSACTIONS, MONTHLY_DATA } from '../data/transactions';
import OrgLogo from '../components/OrgLogo';
import CustomTooltip from '../components/CustomTooltip';

const MILESTONES = [
  { amount: 10, label: 'First $10', emoji: '🌱', achieved: true },
  { amount: 25, label: '$25 given', emoji: '⭐', achieved: true },
  { amount: 50, label: '$50 club', emoji: '🏆', achieved: true },
  { amount: 100, label: 'Century', emoji: '💎', achieved: false },
  { amount: 250, label: '$250 hero', emoji: '🦸', achieved: false },
];

function daysUntilQuarterEnd() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  // Find end of current quarter
  const quarterEndMonth = Math.ceil((m + 1) / 3) * 3; // 3, 6, 9, 12
  const qEnd = new Date(y, quarterEndMonth, 1); // first day of next quarter = last day of this one
  return Math.max(1, Math.ceil((qEnd - now) / (1000 * 60 * 60 * 24)));
}

function MilestoneToast({ milestone, onClose }) {
  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      className="absolute top-20 left-4 right-4 z-30 bg-white rounded-3xl p-4 shadow-2xl flex items-center gap-3"
    >
      <div className="text-3xl">{milestone.emoji}</div>
      <div className="flex-1">
        <p className="font-bold text-gray-900 text-sm">Milestone Unlocked!</p>
        <p className="text-gray-500 text-xs">{milestone.label} donated 🎉</p>
      </div>
      <button onClick={onClose}><X size={16} className="text-gray-300" /></button>
    </motion.div>
  );
}

export default function Dashboard() {
  const { selectedNonprofit, totalDonated, pendingRoundUps, setTab } = useApp();
  const brand = useTheme();
  const [showMilestone, setShowMilestone] = useState(true);
  const daysLeft = daysUntilQuarterEnd();
  const nextMilestone = MILESTONES.find(m => !m.achieved);
  const latestAchieved = [...MILESTONES].reverse().find(m => m.achieved);
  const progressToNext = nextMilestone
    ? Math.min((totalDonated / nextMilestone.amount) * 100, 100)
    : 100;

  // Safe short name for the payout label — avoid splitting mid-word or on punctuation
  function getShortName(np) {
    if (!np) return '';
    const words = np.name.split(' ');
    // If first word is a short prefix like "St." use first two words
    if (words[0].endsWith('.') && words.length > 1) return `${words[0]} ${words[1]}`;
    return words[0];
  }

  if (!selectedNonprofit) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Milestone toast */}
      <AnimatePresence>
        {showMilestone && latestAchieved && (
          <MilestoneToast milestone={latestAchieved} onClose={() => setShowMilestone(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        animate={{ background: brand.headerGradient }}
        transition={{ duration: 0.6 }}
        className="px-5 pt-14 pb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">Good morning, Alex 👋</p>
            <h1 className="text-white text-2xl font-bold mt-1" style={{ letterSpacing: '-0.3px' }}>
              {brand.appName}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border border-white/30">
            A
          </div>
        </div>
      </motion.div>

      <div className="flex-1 scrollable px-4 pb-28 space-y-4 pt-4">

        {/* Hero donation card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-6 text-white overflow-hidden relative"
          style={{ background: brand.gradient }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-black/10 translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-medium uppercase tracking-widest">Total Donated</p>
            <div className="mt-1">
              <span className="text-5xl font-bold">${totalDonated.toFixed(2)}</span>
            </div>
            <p className="text-white/60 text-sm mt-2">Since Jan 2026 · All time</p>
            <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                <OrgLogo nonprofit={selectedNonprofit} size={8} rounded="full" className="bg-white/20 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm leading-snug">{selectedNonprofit.name}</p>
                  <p className="text-white/60 text-xs">Your chosen cause</p>
                </div>
              </div>
              <button
                onClick={() => setTab('nonprofits')}
                className="bg-white/20 hover:bg-white/30 rounded-xl px-3 py-1.5 text-white text-xs font-semibold flex items-center gap-1"
              >
                Change <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Corporate match banner */}
        {selectedNonprofit.corporateMatch?.active && (() => {
          const m = selectedNonprofit.corporateMatch;
          const pct = Math.round((m.matched / m.maxAmount) * 100);
          return (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="rounded-3xl p-4 card-shadow"
              style={{ background: '#fffbeb', border: '1.5px solid #fde68a' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏢</span>
                  <div>
                    <p className="font-bold text-amber-900 text-sm">{m.company} Match Active</p>
                    <p className="text-amber-700 text-xs">Every dollar you donate is matched</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-900 text-sm">${(m.matched / 1000).toFixed(1)}K</p>
                  <p className="text-amber-600 text-xs">of ${(m.maxAmount / 1000).toFixed(0)}K used</p>
                </div>
              </div>
              <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full bg-amber-400 rounded-full"
                />
              </div>
              <p className="text-amber-700 text-xs mt-1.5">{pct}% of match pool used · ${((m.maxAmount - m.matched) / 1000).toFixed(1)}K remaining</p>
            </motion.div>
          );
        })()}

        {/* Stats row */}
        <div className="flex gap-3">
          {[
            { icon: <Zap size={18} />, label: 'Pending', value: `$${pendingRoundUps.toFixed(2)}`, sub: 'This month', color: brand.primary },
            { icon: <TrendingUp size={18} />, label: 'Avg/mo', value: '$10.10', sub: '+12% vs last', color: '#10b981' },
            { icon: <Heart size={18} />, label: 'Round-ups', value: '247', sub: 'All time', color: brand.secondary },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white rounded-3xl p-4 flex-1 card-shadow">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.color + '18' }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 leading-none">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1.5 font-medium">{s.label}</div>
              <div className="text-xs mt-1 font-semibold" style={{ color: s.color }}>{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Quarterly payout countdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5 card-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-gray-900 text-sm">Q1 Payout to {getShortName(selectedNonprofit)}</p>
              <p className="text-gray-400 text-xs mt-0.5">Funds sent on April 1, 2026</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-2xl" style={{ color: brand.primary }}>{daysLeft}</p>
              <p className="text-gray-400 text-xs">days left</p>
            </div>
          </div>
          <div className="h-2 bg-gray.100 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${100 - (daysLeft / 90) * 100}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full rounded-full"
              style={{ background: brand.gradient }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-gray-400 text-xs">Jan 1</p>
            <p className="text-xs font-semibold" style={{ color: brand.primary }}>${pendingRoundUps.toFixed(2)} ready to send</p>
            <p className="text-gray-400 text-xs">Apr 1</p>
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-3xl p-5 card-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base">Milestones</h3>
            {nextMilestone && (
              <span className="text-xs text-gray-400">${(nextMilestone.amount - totalDonated).toFixed(2)} to next</span>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto scrollable pb-1">
            {MILESTONES.map((m) => (
              <div key={m.amount} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                  m.achieved ? 'shadow-md' : 'opacity-30 grayscale'
                }`}
                  style={{ background: m.achieved ? brand.gradient : '#f3f4f6' }}>
                  {m.emoji}
                </div>
                <p className="text-xs text-gray-400 font-medium whitespace-nowrap">{m.label}</p>
              </div>
            ))}
          </div>
          {nextMilestone && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>${totalDonated.toFixed(0)}</span>
                <span>${nextMilestone.amount}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: '#f3f4f6' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: brand.gradient }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Monthly chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-5 card-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base">Monthly Giving</h3>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA} barSize={22}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="donated" radius={[8, 8, 0, 0]} fill={brand.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Impact card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl p-5 text-white relative overflow-hidden"
          style={{ background: brand.gradient }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3" />
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Your Impact</p>
          <p className="text-white font-bold text-base leading-snug relative z-10">
            "{selectedNonprofit.impact}"
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedNonprofit.logo}</span>
              <p className="text-white/70 text-xs">{selectedNonprofit.name}</p>
            </div>
            <button
              onClick={() => setTab('share')}
              className="bg-white/20 rounded-xl px-3 py-1.5 text-white text-xs font-semibold flex items-center gap-1"
            >
              <Share2 size={11} /> Share
            </button>
          </div>
        </motion.div>

        {/* Recent transactions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-5 card-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base">Recent Round-ups</h3>
            <button onClick={() => setTab('activity')} className="text-xs font-semibold" style={{ color: brand.primary }}>
              See all
            </button>
          </div>
          <div className="space-y-3">
            {TRANSACTIONS.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
                  {tx.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm font-semibold truncate">{tx.merchant}</p>
                  <p className="text-gray-400 text-xs">{tx.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-400 text-xs">${tx.amount.toFixed(2)}</p>
                  <p className="text-sm font-bold" style={{ color: brand.primary }}>+${tx.roundUp.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
