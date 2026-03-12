const ComparisonViewer = ({ comparison, loading }) => {
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
      {comparison.error_message ? (
        <p className="error mt-2">Error: {comparison.error_message}</p>
      ) : null}
      <h3 className="mt-3 font-semibold">Students</h3>
      {comparison.studentsWithNames?.length ? (
        <ul className="mt-2 space-y-1">
          {comparison.studentsWithNames.map((student) => (
            <li key={student.suid} className="rounded border border-slate-200 px-3 py-2">
              {student.student_name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600 mt-2">No students in this comparison.</p>
      )}
    </div>
  )
}

export default ComparisonViewer
