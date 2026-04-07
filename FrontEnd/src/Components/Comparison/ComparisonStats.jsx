const ComparisonStats = ({ comparisons, loading }) => {
  const total = comparisons.length;
  const completed = comparisons.filter((comparison) => String(comparison.status).toLowerCase() === "completed").length;
  const pending = comparisons.filter((comparison) => String(comparison.status).toLowerCase() === "pending").length;
  const failed = comparisons.filter((comparison) => String(comparison.status).toLowerCase() === "failed").length;

  return (
    <div className="box-wrapper">
      <h2 className="h2-large">Comparison Stats</h2>
      {loading ? <p>Loading stats...</p> : null}
      {!loading ? (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>Total runs: {total}</p>
          <p>Completed: {completed}</p>
          <p>Pending: {pending}</p>
          <p>Failed: {failed}</p>
        </div>
      ) : null}
    </div>
  )
}

export default ComparisonStats
