import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Search } from 'lucide-react';
import Logo from '../components/Logo';
import OrgLogo from '../components/OrgLogo';
import { useApp } from '../store/AppContext';
import { NONPROFITS } from '../data/nonprofits';

// Featured causes shown on the pick-your-cause screen
const FEATURED_IDS = ['bgca', 'stjude', 'wwf', 'khanacademy', 'feedamerica'];
const FEATURED = NONPROFITS.filter(n => FEATURED_IDS.includes(n.id));

const SLIDES = [
  {
    id: 0,
    bg: 'from-orange-500 to-amber-400',
    illustration: (
      <div className="relative flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center pulse-ring absolute" />
        <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
          <Logo size={72} />
        </div>
      </div>
    ),
    title: 'Welcome to\nPocketChange',
    subtitle: 'Turn everyday purchases into\nimpactful donations — automatically.',
    cta: 'Get Started',
  },
  {
    id: 1,
    bg: 'from-violet-600 to-indigo-500',
    illustration: (
      <div className="relative flex flex-col items-center gap-3">
        {[
          { icon: '☕', amount: '$4.75', round: '+$0.25', delay: 0 },
          { icon: '🛒', amount: '$23.40', round: '+$0.60', delay: 0.1 },
          { icon: '🚗', amount: '$11.85', round: '+$0.15', delay: 0.2 },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: item.delay + 0.3, duration: 0.4 }}
            className="flex items-center gap-3 bg-white/20 rounded-2xl px-5 py-3 w-72"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-white font-medium flex-1">{item.amount}</span>
            <span className="text-white/90 font-bold text-sm bg-white/25 rounded-full px-2.5 py-1">{item.round}</span>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-2 flex items-center gap-2 bg-white rounded-2xl px-6 py-3"
        >
          <span className="text-violet-600 font-bold text-lg">$1.00</span>
          <span className="text-gray-500 text-sm">donated to your cause ❤️</span>
        </motion.div>
      </div>
    ),
    title: 'Round Up Every\nPurchase',
    subtitle: 'We round up each transaction to the nearest dollar. The spare change goes straight to your chosen nonprofit.',
    cta: 'Next',
  },
  {
    id: 2,
    bg: 'from-emerald-500 to-teal-400',
    illustration: (
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl mb-2">🌍</div>
        <div className="grid grid-cols-3 gap-2">
          {['🏀', '📚', '🌾', '🏥', '🏠', '⚖️'].map((emoji, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.07 + 0.3, type: 'spring', stiffness: 300 }}
              className="w-16 h-16 rounded-2xl bg-white/25 flex items-center justify-center text-3xl"
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </div>
    ),
    title: 'Choose Your\nCause',
    subtitle: 'Pick from hundreds of verified nonprofits across the causes you care about most.',
    cta: 'Next',
  },
  {
    id: 3,
    bg: 'from-rose-500 to-pink-400',
    illustration: (
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-36 h-36 rounded-full bg-white/20 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-white font-bold text-4xl">$60</div>
            <div className="text-white/80 text-sm mt-1">donated</div>
          </div>
        </motion.div>
        <div className="flex gap-4 mt-2">
          {[
            { label: 'Transactions', value: '247' },
            { label: 'Avg/month', value: '$10.10' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-white/20 rounded-2xl px-5 py-3 text-center"
            >
              <div className="text-white font-bold text-xl">{stat.value}</div>
              <div className="text-white/70 text-xs mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    title: 'Watch Your\nImpact Grow',
    subtitle: 'Track every donation, see your cumulative impact, and share your generosity with others.',
    cta: 'Pick Your Cause',
  },
];

// ─── Cause selection screen ─────────────────────────────────────────────────

function CauseCard({ nonprofit, selected, onSelect }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(nonprofit)}
      className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left"
      style={selected
        ? { borderColor: nonprofit.brand.primary, background: nonprofit.brand.accentLight }
        : { borderColor: '#f3f4f6', background: '#f9fafb' }
      }
    >
      <OrgLogo nonprofit={nonprofit} size={12} rounded="xl" className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm leading-snug">{nonprofit.name}</p>
        <p className="text-gray-400 text-xs mt-0.5 truncate">{nonprofit.tagline}</p>
      </div>
      {selected && (
        <CheckCircle size={20} style={{ color: nonprofit.brand.primary }} className="shrink-0" />
      )}
    </motion.button>
  );
}

function CauseSelectionScreen({ onComplete }) {
  const { setSelectedNonprofit, setTab, setPage } = useApp();
  const [picked, setPicked] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');

  const searchResults = NONPROFITS.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  function handleConfirm() {
    if (!picked) return;
    setSelectedNonprofit(picked);
    setPage('home');
  }

  function handleBrowseAll(nonprofit) {
    setSelectedNonprofit(nonprofit);
    setPage('home');
    setTab('nonprofits');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-white"
    >
      {/* Header */}
      <div className="px-5 pt-14 pb-4"
        style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
        <div className="flex items-center gap-3 mb-3">
          <Logo size={32} />
          <span className="text-white font-bold text-lg">PocketChange</span>
        </div>
        <h1 className="text-white text-2xl font-bold leading-tight" style={{ letterSpacing: '-0.3px' }}>
          Pick your cause
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Your round-ups will go here. You can always change it later.
        </p>
      </div>

      <div className="flex-1 scrollable px-4 pt-4 pb-4 space-y-3">

        {!showSearch ? (
          <>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest px-1">Featured Causes</p>
            {FEATURED.map((nonprofit) => (
              <CauseCard
                key={nonprofit.id}
                nonprofit={nonprofit}
                selected={picked?.id === nonprofit.id}
                onSelect={setPicked}
              />
            ))}

            {/* Browse all option */}
            <button
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Search size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">Find a different cause</p>
                <p className="text-gray-400 text-xs">Search all verified nonprofits</p>
              </div>
              <ArrowRight size={16} className="text-gray-300 ml-auto shrink-0" />
            </button>
          </>
        ) : (
          <>
            {/* Search mode */}
            <button onClick={() => setShowSearch(false)} className="text-orange-500 text-sm font-semibold">
              ← Back to featured
            </button>
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search causes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              {searchResults.map(nonprofit => (
                <motion.button
                  key={nonprofit.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBrowseAll(nonprofit)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gray-50 text-left"
                >
                  <OrgLogo nonprofit={nonprofit} size={10} rounded="xl" className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{nonprofit.name}</p>
                    <p className="text-gray-400 text-xs">{nonprofit.category}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 shrink-0" />
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      {!showSearch && (
        <div className="px-5 pb-10 pt-3 bg-white border-t border-gray-100">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={!picked}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all"
            style={{
              background: picked
                ? picked.brand.gradient
                : 'linear-gradient(135deg, #d1d5db, #9ca3af)',
              opacity: picked ? 1 : 0.6,
            }}
          >
            {picked ? `Support ${picked.name.split(' ')[0]} ${picked.name.split(' ')[1] || ''}` : 'Select a cause to continue'}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main onboarding shell ───────────────────────────────────────────────────

export default function Onboarding() {
  const [slide, setSlide] = useState(0);
  const [showCausePicker, setShowCausePicker] = useState(false);

  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  function advance() {
    if (isLast) {
      setShowCausePicker(true);
    } else {
      setSlide(s => s + 1);
    }
  }

  if (showCausePicker) {
    return <CauseSelectionScreen />;
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`flex-1 bg-gradient-to-br ${current.bg} flex flex-col items-center justify-center px-8 pt-16 pb-6`}
        >
          {/* Illustration */}
          <div className="h-56 flex items-center justify-center">
            {current.illustration}
          </div>

          {/* Text */}
          <div className="mt-10 text-center">
            <h1 className="text-white font-bold text-4xl leading-tight whitespace-pre-line" style={{ letterSpacing: '-0.5px' }}>
              {current.title}
            </h1>
            <p className="text-white/80 text-base mt-4 leading-relaxed">
              {current.subtitle}
            </p>
          </div>

          {/* Dots */}
          <div className="flex gap-2 mt-8">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="w-full mt-8 flex flex-col gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={advance}
              className="w-full py-4 rounded-2xl bg-white font-bold text-base shadow-lg"
              style={{ color: slide === 0 ? '#f97316' : slide === 1 ? '#7c3aed' : slide === 2 ? '#059669' : '#e11d48' }}
            >
              {current.cta}
            </motion.button>
            {slide > 0 && (
              <button
                onClick={() => setShowCausePicker(true)}
                className="text-white/60 text-sm py-2"
              >
                Skip for now
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
