import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getAssignmentDetails from "../../utils/DatabaseInteractions/Instructor/getAssignmentDetails";
import useUser from "../../context/useUser";
import AssignmentDetails from "./AssignmentDetails";
import Uploader from '../Uploader/Uploader'


const StudentAssignment = ({ aid }) => {
  const [details, setDetails] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {user} = useUser();
  const [showUploader, setShowUploader] = useState(true);
  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [file, setFile] = useState(null);
  useEffect(() => {
    let cancelled = false;

    async function loadAssignment() {
      try {
        console.log(aid);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    ///mostly placeholder
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    console.log("File:", file);

  };

  return (
    <>
    <div className="box-wrapper">
        <AssignmentDetails details={details} />
        {showUploader ? <Uploader aid={aid} assignmentKey={details?.key} /> : null}
      </div>
      </>      
  );
};

export default StudentAssignment;
