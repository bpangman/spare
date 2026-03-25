export default function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
        <p className="font-bold">${payload[0].value.toFixed(2)}</p>
        <p className="text-gray-400">{label}</p>
      </div>
    );
  }
  return null;
}
