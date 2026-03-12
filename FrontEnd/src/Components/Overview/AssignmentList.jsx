import { Link } from "react-router-dom";

function getDueStatus(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: "Overdue", className: "text-gray-500" };
  } else if (diffDays <= 3) {
    return {
      text: "(" + diffDays + " days left" + ")" + " - Due soon",
      className: "text-red-600 font-semibold",
    };
  } else {
    return {
      text: "(" + diffDays + " days left" + ")",
      color: "text-gray-600",
    };
  }
}

const AssignmentList = ({ assignments, loadingAssignments }) => {
  const now = new Date();
  return (
    <section className="box-wrapper">
      <h2 className="h2-large">Assignments</h2>

      {loadingAssignments ? (
        <h2 className="h2-default">Loading assignments...</h2>
      ) : null}
      {!loadingAssignments && assignments.length === 0 ? (
        <h2 className="h2-default">No assignments found for this course.</h2>
      ) : null}
      {!loadingAssignments && assignments.length > 0 ? (

        <ul className="mt-3 space-y-2">
          <h2 className="h2-large">Upcoming</h2>
          {(assignments || [])
            .filter((assignment) => new Date(assignment.due_date) > now)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .map((assignment) => (
              <li
                className="border rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer"
                key={assignment.id}
              >
                <Link
                  to={`/Assignment/${assignment.id}`}
                  className="text-black-900 underline hover:text-slate-700 font-bold"
                >
                  {assignment.name ?? `Assignment ${assignment.id}`}
                </Link>

                <p className="text-gray-600">
                  Due:{" "}
                  {new Date(assignment.due_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                  })}
                </p>

                <p className={getDueStatus(assignment.due_date).className}>
                  {getDueStatus(assignment.due_date).text}
                </p>
              </li>
            ))}
          <h2 className="h2-large">Completed</h2>
          {(assignments || [])
            .filter((assignment) => new Date(assignment.due_date) < now)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .map((assignment) => (
              <li
                className="border rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer"
                key={assignment.id}
              >
                <Link
                  to={`/Assignment/${assignment.id}`}
                  className="text-black-900 underline hover:text-slate-700 font-bold"
                >
                  {assignment.name ?? `Assignment ${assignment.id}`}
                </Link>

                <p className="text-gray-600">
                  Due:{" "}
                  {new Date(assignment.due_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                  })}
                </p>

                <p className={getDueStatus(assignment.due_date).className}>
                  {getDueStatus(assignment.due_date).text}
                </p>
              </li>
            ))}
        </ul>
      ) : null}
    </section>
  );
};

export default AssignmentList;