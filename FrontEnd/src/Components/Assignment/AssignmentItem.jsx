import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useUser from "../../context/useUser";
import { getSubmissions } from "../../utils/DatabaseInteractions/Student/getSubmissions";

function getDueStatus(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: "Overdue", className: "text-gray-500" };
  } else if (diffDays <= 3) {
    return {
      text: `(${diffDays} days left) - Due soon`,
      className: "text-red-600 font-semibold uppercase",
    };
  } else {
    return {
      text: `(${diffDays} days left)`,
      className: "text-slate-700",
    };
  }
}

function getSubmissionStatus(submissionCount) {
  if (submissionCount > 0) {
    return {
      text: "Submitted",
      className:
        "text-green-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm border-2 border-green-600 min-w-[100px] text-center",
    };
  }

  return {
    text: "Incomplete",
    className:
      "bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm min-w-[100px] text-center",
  };
}

function StudentSubmissionStatus({ assignmentId, userId }) {
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadSubmissions() {
      if (!userId) {
        if (!cancelled) {
          setSubmissionCount(0);
        }
        return;
      }

      try {
        const submissions = await getSubmissions(assignmentId, userId);
        if (!cancelled) {
          setSubmissionCount(Array.isArray(submissions) ? submissions.length : 0);
        }
      } catch {
        if (!cancelled) {
          setSubmissionCount(0);
        }
      }
    }

    loadSubmissions();

    return () => {
      cancelled = true;
    };
  }, [assignmentId, userId]);

  const submissionStatus = getSubmissionStatus(submissionCount);

  return (
    <div className="flex space-x-2 items-center leading-none">
      <p className="text-[14px] uppercase tracking-widest text-slate-400 font-bold leading-none relative top-[1px]">
        Submission Status:
      </p>
      <span className={submissionStatus.className}>{submissionStatus.text}</span>
    </div>
  );
}

function AssignmentItem({ assignment }) {
  const { user, isProfessor, roleReady } = useUser();
  const dueStatus = getDueStatus(assignment.due_date);
  const showStudentStatuses = roleReady && !isProfessor;

  return (
    <li className="border-slate-100 rounded-xl py-6 px-5 hover:bg-blue-50 transition cursor-pointer bg-white shadow-sm border mb-4">
      <Link
        to={`/Assignment/${assignment.id}`}
        className="text-lg text-slate-900 underline hover:text-slate-700 font-bold"
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

      <div className="flex justify-between items-center">
        {showStudentStatuses ? <p className={dueStatus.className}>{dueStatus.text}</p> : <span />}
        {showStudentStatuses ? (
          <StudentSubmissionStatus assignmentId={assignment.id} userId={user?.id} />
        ) : null}
      </div>
    </li>
  );
}

export default AssignmentItem;
