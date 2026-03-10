import { useState } from "react";
import { useParams } from "react-router-dom";
import Uploader from '../../Components/Uploader/Uploader'
import useUser from "../../context/useUser";
import PageNoteFound from '../../Pages/PageNotFound';
import { useLoadStudentAssignment } from "./hooks/useLoadStudentAssignment";
import { useLoadStudentSubmissions } from "./hooks/useLoadStudentSubmissions";

const StudentAssignment = () => {
  const { aid } = useParams();
  const {user} = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const {details, pastDueDate} = useLoadStudentAssignment(aid, setLoading, setError);
  const {submissions} = useLoadStudentSubmissions(aid, user.id, setLoading, setError, setShowUploader);
  
  if (loading) {
    return <div>Loading assignment...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!details) {
    return (<PageNoteFound />)
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
        {!pastDueDate && !showUploader && submissionCount > 0 ? <button onClick={() => setShowUploader(true)}>Upload More</button> : null}
        {showUploader ? <Uploader aid={aid}/> : null}
        
      </div>
    </div>
  );
};

export default StudentAssignment;
