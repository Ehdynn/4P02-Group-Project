import { useState } from "react";
import { useParams } from "react-router-dom";

import SubmissionList from "../Submissions/SubmissionList";
import { useLoadInstructorAssignment } from "./hooks/useLoadInstructorAssignment";
import { useUpdateAssignment } from "./hooks/useUpdateAssignment";
import AssignmentDetails from "./AssignmentDetails";
import UpdateForm from "./UpdateForm";
import PageNotFound from "../../Pages/PageNotFound";

const InstructorAssignment = () => {
  const { aid } = useParams();
  const [formData, setFormData] = useState({
        name: "",
        dueDate: "",
        description: "",
      });

  const {details, setDetails, loading, error, notFound} = useLoadInstructorAssignment(aid, setFormData);
  const {onChange, handleSubmit, submitted, loadingUpdate, updateError} = useUpdateAssignment(aid, formData, setFormData, setDetails);
  
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
          <button className="submit-button">Run Similarity Comparision</button>
          <button className="submit-button">View Results</button>
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
