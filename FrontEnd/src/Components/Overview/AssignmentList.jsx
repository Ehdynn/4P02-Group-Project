import { Link } from "react-router-dom";
import useUser from "../../context/useUser";
import AssignmentItem from "../Components/Assignment/AssignmentItem.jsx";
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
              <AssignmentItem key={assignment.id} assignment={assignment} />
            ))}
          <h2 className="h2-large">Completed</h2>
          {(assignments || [])
            .filter((assignment) => new Date(assignment.due_date) < now)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .map((assignment) => (
              <AssignmentItem key={assignment.id} assignment={assignment} />
            ))}
        </ul>
      ) : null}
    </section>
  );
};

export default AssignmentList;