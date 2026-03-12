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
              
              <li className="border rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer" key={assignment.id}>
                <Link
                  to={`/Assignment/${assignment.id}`}
                  className="text-slate-900 underline hover:text-slate-700"
                >
                  {assignment.name ?? `Assignment ${assignment.id}`}
                </Link>
                
                <p className="text-sm text-gray-600 mt-1">
                  Due: {new Date(assignment.due_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short"
                  })}
                </p>
                
              </li>
              
          ))}
          </ul>
        ) : null}
      </section>
  )
}

export default AssignmentList