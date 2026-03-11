const ComparisonList = ({ comparisonList, loading }) => {
  return (
    <div className="box-wrapper">
      <h2 className="h2-large">Students Compared</h2>
      {loading ? <p>Loading comparisons...</p> : null}
      {!loading && comparisonList.length === 0 ? <p>No compared students found.</p> : null}
      {!loading && comparisonList.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {comparisonList.map((student) => (
            <li key={student.suid} className="rounded border border-slate-200 px-3 py-2">
              <p className="font-medium">{student.student_name}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default ComparisonList
