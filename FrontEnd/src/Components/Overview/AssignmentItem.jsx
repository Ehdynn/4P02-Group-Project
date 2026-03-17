import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useUser from "../../context/useUser";

function AssignmentItem({ assignment }) {
  const { user, isProfessor, roleReady } = useUser();

  return (
    <li className="border-slate-100 rounded-xl py-6 px-5 hover:bg-blue-50 transition cursor-pointer bg-white shadow-sm border mb-4">
      <Link
        to={`/Assignment/${assignment.id}`}
        className="text-lg text-slate-900 underline hover:text-slate-700 font-bold"
      >
        {assignment.name ?? `Assignment ${assignment.id}`}
      </Link>

      <p className="text-gray-600">
        Due Date:{" "}
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
    </li>
  );
}

export default AssignmentItem;
