import { Link } from "react-router-dom";

const AssignmentList = ({ assignments, loadingAssignments }) => {
  return (
    <section className="box-wrapper">
        <h2 className="h2-large">Assignments</h2>

        {loadingAssignments ? <h2 className="h2-default">Loading assignments...</h2> : null}
        {!loadingAssignments && assignments.length === 0 ? (
          <h2 className="h2-default">No assignments found for this course.</h2>
        ) : null}
        {!loadingAssignments && assignments.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {assignments.map((assignment) => (
              <li key={assignment.id}>
                <Link
                  to={`/Assignment/${assignment.id}`}
                  className="text-slate-900 underline hover:text-slate-700"
                >
                  {assignment.name ?? `Assignment ${assignment.id}`}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
  )
}

export default AssignmentList