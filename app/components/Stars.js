export default function Stars({ value = 0, outOf = 10 }) {
  const safe = Math.max(0, Math.min(outOf, Number(value) || 0));
  const filled = "★".repeat(safe);
  const empty = "☆".repeat(outOf - safe);
  return (
    <div className="inline-flex items-center text-yellow-500 text-lg" aria-label={`${safe}/${outOf} stars`}>
      <span>{filled}</span>
      <span className="text-gray-300">{empty}</span>
      <span className="ml-2 text-gray-600 text-sm">{safe}/{outOf}</span>
    </div>
  );
}
