import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import SubmissionList from "../Submissions/SubmissionList";
import { useLoadInstructorAssignment } from "./hooks/useLoadInstructorAssignment";
import { useUpdateAssignment } from "./hooks/useUpdateAssignment";

const InstructorAssignment = () => {
  const { aid } = useParams();
  const [formData, setFormData] = useState({
        name: "",
        dueDate: "",
        description: "",
      });

  const {details, setDetails, loading, error} = useLoadInstructorAssignment(aid, setFormData);
  const {onChange, handleSubmit, submitted, loadingUpdate, updateError} = useUpdateAssignment(aid, formData, setFormData, setDetails);
  
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
    <main className="center-box outer-container">
      <div className="box-wrapper">
        <h1 className="h1-default text-center">{details.name ?? "Assignment"}</h1>
        <p className="">Due on {details.due_date ? (new Date(details.due_date).toLocaleString('en-US', {dateStyle: "medium"}) + " " + new Date(details.due_date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })) : "No Due Date Provided"}</p>
        <div className="box-wrapper-square">
          <h2 className="h2-large text-center">Description</h2>
          <hr className="h-px my-8 bg-neutral-quaternary border-sm border-gray-500"/>
          <p>{details.description ?? "No description provided."}</p>
        </div>
      </div>
      <div className="box-wrapper">
        <h1 className="h1-default text-center">Update</h1>
        <form onSubmit={handleSubmit} className="form-default">
          <label className="label-default">
            <span className="span-default">Assignment Name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Assignment One"
              className="field-default"
            />
          </label>

            <label className="label-default">
              <span className="span-default">Due Date</span>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={onChange}
                className="field-default"
              />
            </label>

            <label className="label-default">
              <span className="span-default">Description</span>
              <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => {
                      onChange(e);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  rows={1}
                  className="field-default overflow-hidden resize-none"
              />
            </label>

          {updateError ? <p className="error">{updateError}</p> : null}
          {submitted ? <p className="success">Assignment Updated!</p> : null}

          <button
            type="submit"
            disabled={loadingUpdate}
            className="submit-button"
          >
            {loadingUpdate ? "Updating..." : "Update Assignment"}
          </button>     
      </form>
      </div>
      <SubmissionList aid={aid} courseId={details.course} />

    </main>
  );
};

export default InstructorAssignment;
