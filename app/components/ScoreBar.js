export default function ScoreBar({ label, value = 0, outOf = 10 }) {
  const pct = Math.round((Math.max(0, Math.min(outOf, value)) / outOf) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-600">{value}/{outOf}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-2 bg-yellow-400" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}
