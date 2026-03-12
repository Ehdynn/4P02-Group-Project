import { Link } from "react-router-dom";
import useUser from "../../context/useUser";
import { useState } from "react";
import { useLoadStudentSubmissions } from "./hooks/useLoadStudentSubmissions";

function getDueStatus(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { text: "Overdue", className: "text-gray-500" };
  } else if (diffDays <= 3) {
    return {
      text: "(" + diffDays + " days left" + ")" + " - Due soon",
      className: "text-red-600 font-semibold"
    };
  } else {
    return {
      text: "(" + diffDays + " days left" + ")",
      className: "text-gray-600"
    };
  }
}
function subStatus(aid){
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const {submissions} = useLoadStudentSubmissions(aid, user.id, setLoading, setError, setShowUploader);
  
  try{
    if(submissions.length !== 0){
        return {
            text: "Submitted",
            className: "text-right text-green-600"
        };
    }
    else{
        return{
            text: "Incomplete",
            className: "text-right text-red-600"
        };
    }
  } catch(err){
    return "Incomplete";
  }
}
function AssignmentItem({ assignment }) {
  return (
    <li className="border rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer">
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

      <div className="flex justify-between items-center">
        <p className={getDueStatus(assignment.due_date).className}>
        {getDueStatus(assignment.due_date).text}
        </p>
        <div className="flex space-x-2">
            <p className="text-right font-semibold">Submission Status:</p>
            <p className={subStatus(assignment.id).className}>{subStatus(assignment.id).text}</p>    
        </div>
         
      </div>      
      
      
    </li>
    
  );
}

export default AssignmentItem;