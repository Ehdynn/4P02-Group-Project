import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getAssignmentDetails from "../../utils/DatabaseInteractions/Student/getAssignmentDetails";
import { getSubmissions } from "../../utils/DatabaseInteractions/Student/getSubmissions";
import Uploader from '../../Components/Uploader/Uploader'
import useUser from "../../context/useUser";

const StudentAssignment = () => {
  const { aid } = useParams();
  const [details, setDetails] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {user} = useUser();
  const [showUploader, setShowUploader] = useState(false);
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

    async function loadSubmissions() {
      try {
        setLoading(true);
        setError("");
        const result = await getSubmissions(aid, user.id);
        if (!cancelled) {
          const normalized = Array.isArray(result) ? result : [];
          setSubmissions(normalized);
          setShowUploader(normalized.length === 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load submissions.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAssignment();
    loadSubmissions();
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

  const submissionCount = submissions?.length ?? 0;

  return (
    <div className="center-box outer-container">
      <div className="box-wrapper">
        <h1 className="h1-default text-center">{details.name ?? "Assignment"}</h1>
        <p className="">Due on {details.due_date ? (new Date(details.due_date).toLocaleString('en-US', {dateStyle: "medium"}) + " " + new Date(details.due_date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })) : "No Due Date Provided"}</p>
        <div className="box-wrapper-square">
          <h2 className="h2-large text-center">Description</h2>
          <hr className="h-px my-8 bg-neutral-quaternary border-sm border-gray-500"/>
          <p>{details.description ?? "No description provided."}</p>
        </div>
        
        {submissionCount > 0 ? <p>{submissionCount} Submission(s) made.</p> : null}
        {!showUploader && submissionCount > 0 ? <button onClick={() => setShowUploader(true)}>Upload More</button> : null}
        {showUploader ? <Uploader/> : null}
        
      </div>
    </div>
  );
};

export default StudentAssignment;
