import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getAssignmentDetails from "../../utils/DatabaseInteractions/Student/getAssignmentDetails";
import Uploader from '../../Components/Uploader/Uploader'

const StudentAssignment = () => {
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
    <div className="absolute top-[20%] justify-self-center section-default">
      <h1 className="h1-default">{details.name ?? "Assignment"}</h1>
      <p>Description:{details.description ?? "No description provided."}</p>
      <p>Due Date: {details.due_date ?? "No Due Date Provided"}</p>
      <Uploader/>
    </div>
  );
};

export default StudentAssignment;
