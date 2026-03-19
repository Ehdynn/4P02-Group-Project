const formatSimilarityScore = (score) => {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "N/A";
  }

  return `${score.toFixed(2)}%`;
};

const ComparisonViewer = ({ comparison, loading, outputs, selectedSubmissionId, onSelectSubmission }) => {
  if (loading) {
    return <div className="box-wrapper">Loading comparison details...</div>;
  }

  if (!comparison) {
    return <div className="box-wrapper">No comparison selected.</div>;
  }

  return (
    <div className="box-wrapper">
      <h2 className="h2-large">Comparison Details</h2>
      <p className="text-sm">Status: {comparison.status}</p>
      <p className="text-sm">
        Created: {comparison.created_at ? new Date(comparison.created_at).toLocaleString() : "N/A"}
      </p>
      <p className="text-sm">Students Submitted: {comparison.number_of_students ?? 0}</p>
      {comparison.error_message ? (
        <p className="error mt-2">Error: {comparison.error_message}</p>
      ) : null}
      <h3 className="mt-3 font-semibold">Submitted Students</h3>
      {outputs?.length ? (
        <ul className="mt-2 space-y-2">
          {outputs.map((output) => (
            <li key={output.path}>
              <button
                type="button"
                className={`w-full rounded border px-3 py-2 text-left ${
                  selectedSubmissionId === output.submissionId
                    ? "border-slate-900 bg-slate-100"
                    : "border-slate-200 bg-white"
                }`}
                onClick={() => onSelectSubmission(
                  selectedSubmissionId === output.submissionId ? null : output.submissionId
                )}
              >
                <p className="font-medium">{output.studentName}</p>
                <p className="text-xs text-slate-500">Student Number: {output.studentNumber}</p>
                <p className="text-xs text-slate-500">
                  Similarity: {formatSimilarityScore(output.data?.similarity_score)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600 mt-2">No student submissions loaded for this comparison.</p>
      )}
    </div>
  )
}

export default ComparisonViewer
