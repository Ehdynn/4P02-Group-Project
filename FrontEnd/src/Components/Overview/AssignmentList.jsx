import useUser from "../../context/useUser";
import AssignmentItem from "../../Components/Assignment/AssignmentItem.jsx";

const AssignmentList = ({ assignments, loadingAssignments }) => {
  const { isProfessor, roleReady } = useUser();
  const now = new Date();
  const normalizedAssignments = Array.isArray(assignments) ? assignments : [];
  const futureAssignments = normalizedAssignments
    .filter((assignment) => new Date(assignment.due_date) >= now)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const pastAssignments = normalizedAssignments
    .filter((assignment) => new Date(assignment.due_date) < now)
    .sort((a, b) => new Date(b.due_date) - new Date(a.due_date));

  const futureLabel = roleReady && isProfessor ? "Open Assignments" : "Upcoming";
  const pastLabel = roleReady && isProfessor ? "Closed Assignments" : "Past Due";
  const emptyMessage =
    roleReady && isProfessor
      ? "No assignments have been created for this course."
      : "No assignments found for this course.";

  return (
    <section className="box-wrapper">
      <h1 className="h1-default">Assignments</h1>

      {loadingAssignments ? (
        <h2 className="h2-default">Loading assignments...</h2>
      ) : null}
      {!loadingAssignments && normalizedAssignments.length === 0 ? (
        <h2 className="h2-default">{emptyMessage}</h2>
      ) : null}
      {!loadingAssignments && normalizedAssignments.length > 0 ? (
        <div className="mt-3 space-y-6">
          <div>
            <h2 className="h2-large">{futureLabel}</h2>
            {futureAssignments.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {futureAssignments.map((assignment) => (
                  <AssignmentItem key={assignment.id} assignment={assignment} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">None.</p>
            )}
          </div>
          <div>
            <h2 className="h2-large">{pastLabel}</h2>
            {pastAssignments.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {pastAssignments.map((assignment) => (
                  <AssignmentItem key={assignment.id} assignment={assignment} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">None.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default AssignmentList;
