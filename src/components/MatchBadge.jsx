export default function MatchBadge({ match, compact = false }) {
  if (!match?.active) return null;
  const pct = Math.round((match.matched / match.maxAmount) * 100);
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: '#fef3c7', color: '#92400e' }}>
        🏢 {match.companyShort} Match Active
      </span>
    );
  }
  return (
    <div className="rounded-2xl p-3 mt-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-amber-800">🏢 {match.company} Match Active</span>
        <span className="text-xs font-semibold text-amber-700">${(match.matched / 1000).toFixed(1)}K / ${(match.maxAmount / 1000).toFixed(0)}K matched</span>
      </div>
      <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-amber-700 text-xs mt-1.5">{match.description}</p>
    </div>
  );
}
