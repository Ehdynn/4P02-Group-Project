const ComparisonList = ({ comparisons, loading, selectedComparisonId, onSelectComparison }) => {
  return (
    <div className="box-wrapper">
      <h2 className="h2-large">Comparison Runs</h2>
      {loading ? <p>Loading comparisons...</p> : null}
      {!loading && comparisons.length === 0 ? <p>No comparison runs found.</p> : null}
      {!loading && comparisons.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {comparisons.map((comparison) => (
            <li key={comparison.id}>
              <button
                type="button"
                className={`w-full rounded border px-3 py-2 text-left ${
                  selectedComparisonId === comparison.id
                    ? "border-slate-900 bg-slate-100"
                    : "border-slate-200"
                }`}
                onClick={() => onSelectComparison(comparison.id)}
              >
                <p className="font-medium">{String(comparison.status).toUpperCase()}</p>
                <p className="text-xs text-slate-600">
                  {comparison.studentsWithNames?.length ?? 0} student(s)
                </p>
                <p className="text-xs text-slate-500">
                  {comparison.created_at ? new Date(comparison.created_at).toLocaleString() : "No timestamp"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default ComparisonList
