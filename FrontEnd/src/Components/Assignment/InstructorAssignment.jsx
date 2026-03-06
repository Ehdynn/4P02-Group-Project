import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getAssignmentDetails from "../../utils/DatabaseInteractions/Instructor/getAssignmentDetails";
import useUser from "../../context/useUser";

const InstructorAssignment = () => {
  const { aid } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;

    async function loadAssignment() {
      try {
        setLoading(true);
        setError("");
        const data = await getAssignmentDetails(aid);
        if (!cancelled) {
          setDetails(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load assignment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAssignment();
    return () => {
      cancelled = true;
    };
  }, [aid]);

  if (loading) {
    return <div>Loading assignment...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!details) {
    return <div>Assignment not found.</div>;
  }

  return (
    <div className="center-box outer-container">
      <div className="box-wrapper">
        <h1 className="h1-default text-center">{details.name ?? "Assignment"}</h1>
        <p>Due Date: {details.due_date ? (new Date(details.due_date).toDateString() + " " + new Date(details.due_date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })) : "No Due Date Provided"}</p>
        <div className="box-wrapper-square">
          <h2 className="h2-large text-center">Description</h2>
          <hr className="h-px my-8 bg-neutral-quaternary border-sm border-gray-500"/>
          <p>{details.description ?? "No description provided."}</p>
        </div>
        
      </div>
    </div>
  );
};

export default InstructorAssignment;
