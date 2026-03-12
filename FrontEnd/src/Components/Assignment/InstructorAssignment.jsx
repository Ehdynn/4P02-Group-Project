import { useState, useEffect } from "react";
import { useParams, useNavigate} from "react-router-dom";

import SubmissionList from "../Submissions/SubmissionList";
import { useLoadInstructorAssignment } from "./hooks/useLoadInstructorAssignment";
import { useUpdateAssignment } from "./hooks/useUpdateAssignment";
import AssignmentDetails from "./AssignmentDetails";
import UpdateForm from "./UpdateForm";
import PageNotFound from "../../Pages/PageNotFound";
import { checkForComparison } from "../../utils/DatabaseInteractions/Instructor/checkForComparison";
import { createComparison } from "../../utils/DatabaseInteractions/Instructor/createComparison";

const InstructorAssignment = () => {
  const navigate = useNavigate();
  const { aid } = useParams();
  const [comparisonAvailable, setComparisonAvailable] = useState(true);
  const [comparisonError, setComparisonError] = useState("");
  const [formData, setFormData] = useState({
        name: "",
        dueDate: "",
        description: "",
      });

  const {details, setDetails, loading, error, notFound} = useLoadInstructorAssignment(aid, setFormData);
  const {onChange, handleSubmit, submitted, loadingUpdate, updateError} = useUpdateAssignment(aid, formData, setFormData, setDetails);
  
  useEffect(() => {
    let cancelled = false;

    async function checkComparisonStatus() {
      try {
        const data = await checkForComparison(aid);
        if (!cancelled) {
          setComparisonAvailable(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to check comparison status.";
          setComparisonError(message);
        }
      }
    }

    checkComparisonStatus();
    return () => {
      cancelled = true;
    };
  }, [aid]);

  const handleCreateComparison = async () => {
    try {
      setComparisonError("");
      await createComparison(aid);
      setComparisonAvailable(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create comparison.";
      setComparisonError(message);
    }
  };


  if (loading) {return <div>Loading assignment...</div>;}

  if (error && notFound) { return <PageNotFound />; }

  if (error) { return <div>{error}</div>; }

  if (!details) {return <PageNotFound />;}

  return (
    <main className="center-box outer-container">
      <div className="box-wrapper">
        <AssignmentDetails details={details} />
      </div>
      <div className="flex w-full space-x-5 flex-col md:flex-row">
        <div className="flex-1 min-w-0">
          <SubmissionList aid={aid} courseId={details.course} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="box-wrapper">
          <h2 className="h2-large">Similarity Comparison</h2>
          {comparisonError ? <p className="error">{comparisonError}</p> : null}
          <button className="submit-button"
                  onClick={handleCreateComparison}>
            {!comparisonAvailable ? "Run Similarity Comparision" : "Run Similarity Comparision Again"}
          </button>
          {comparisonAvailable ? 
            <button className="submit-button"
                    onClick={() => navigate(`/Comparison/${aid}`)}
            >View Results</button>
          : null}
          
      </div>
        </div>
      </div>
      <div className="box-wrapper">
        <UpdateForm 
          handleSubmit={handleSubmit}
          formData={formData}
          onChange={onChange}
          updateError={updateError}
          submitted={submitted}
          loadingUpdate={loadingUpdate}
        />
      </div>
    </main>
  );
};

export default InstructorAssignment;
