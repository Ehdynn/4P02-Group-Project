import { useState, useEffect } from "react";
import { useParams, useNavigate} from "react-router-dom";

import { useLoadInstructorAssignment } from "./hooks/useLoadInstructorAssignment";
import { useUpdateAssignment } from "./hooks/useUpdateAssignment";
import AssignmentDetails from "./AssignmentDetails";
import ComparisonModal from "./ComparisonModal";
import UpdateForm from "./UpdateForm";
import PageNotFound from "../../Pages/PageNotFound";
import { checkForComparison } from "../../utils/DatabaseInteractions/Instructor/checkForComparison";
import { createComparison } from "../../utils/DatabaseInteractions/Instructor/createComparison";
import { getNumberOfSubmissions } from "../../utils/DatabaseInteractions/Instructor/getNumberOfSubmissions";

const InstructorAssignment = () => {
  const navigate = useNavigate();
  const { aid } = useParams();
  const [comparisonAvailable, setComparisonAvailable] = useState(true);
  const [comparisonError, setComparisonError] = useState("");
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [submissionCounts, setSubmissionCounts] = useState({
    submissionCount: 0,
    uniqueStudentSubmissionCount: 0,
  });
  const [submissionError, setSubmissionError] = useState("");
  const [formData, setFormData] = useState({
        name: "",
        dueDate: "",
        description: "",
      });

  const {details, setDetails, loading, error, notFound} = useLoadInstructorAssignment(aid, setFormData);
  const {onChange, handleSubmit, submitted, loadingUpdate, updateError} = useUpdateAssignment(aid, formData, setFormData, setDetails);
  
  useEffect(() => {
    let cancelled = false;

    async function loadSubmissionCounts() {
      try {
        const counts = await getNumberOfSubmissions(aid);
        if (!cancelled) {
          setSubmissionCounts(counts);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load submission counts.";
          setSubmissionError(message);
        }
      }
    }

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

    loadSubmissionCounts();
    checkComparisonStatus();
    return () => {
      cancelled = true;
    };
  }, [aid]);

  const handleCreateComparison = async (boilerPlateFileId = null, repositoryId = null) => {
    try {
      setComparisonError("");
      await createComparison(aid, boilerPlateFileId, repositoryId);
      setComparisonAvailable(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create comparison.";
      setComparisonError(message);
      throw err;
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
          <div className="box-wrapper">
            <h2 className="h2-large">Submission Counts</h2>
            {submissionError ? <p className="error">{submissionError}</p> : null}
            <p>Submissions: {submissionCounts.submissionCount}</p>
            <p>Unique Student Submissions: {submissionCounts.uniqueStudentSubmissionCount}</p>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="box-wrapper">
            <h2 className="h2-large">Similarity Comparison</h2>
            {comparisonError ? <p className="error">{comparisonError}</p> : null}
            <button className="submit-button"
                    onClick={() => setComparisonModalOpen(true)}>
              {!comparisonAvailable ? "Run Similarity Comparison" : "Run Similarity Comparison Again"}
            </button>
            {comparisonAvailable ? 
              <button className="submit-button"
                      onClick={() => navigate(`/Comparison/${aid}`)}
              >View Results</button>
            : null}
         </div>
        </div>
      </div>
      <ComparisonModal
        aid={aid}
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        onRunComparison={handleCreateComparison}
      />
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
