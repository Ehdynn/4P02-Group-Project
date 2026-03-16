import { useState } from "react";
import { useParams } from "react-router-dom";
import Uploader from '../../Components/Uploader/Uploader'
import useUser from "../../context/useUser";
import PageNoteFound from '../../Pages/PageNotFound';
import { useLoadStudentAssignment } from "./hooks/useLoadStudentAssignment";
import { useLoadStudentSubmissions } from "./hooks/useLoadStudentSubmissions";
import AssignmentDetails from "./AssignmentDetails";

const StudentAssignment = () => {
  const { aid } = useParams();
  const {user} = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const {details, pastDueDate, notFound} = useLoadStudentAssignment(aid, setLoading, setError);
  const {submissions} = useLoadStudentSubmissions(aid, user.id, setLoading, setError, setShowUploader);
  
  if (loading) {
    return <div>Loading assignment...</div>;
  }

  if (error) {
    if (notFound) {
      return <PageNoteFound />;
    }
    return <div>{error}</div>;
  }

  if (!details) {
    return (<PageNoteFound />)
  }

  const submissionCount = submissions?.length ?? 0;

  return (
    <div className="center-box outer-container">
      <div className="box-wrapper">
        <AssignmentDetails details={details} />
        
        {submissionCount > 0 ? <p>{submissionCount} Submission(s) made.</p> : null}
        {!pastDueDate && !showUploader && submissionCount > 0 ? <button onClick={() => setShowUploader(true)}>Upload More</button> : null}
        {showUploader ? <Uploader aid={aid}/> : null}
        
      </div>
    </div>
  );
};

export default StudentAssignment;
