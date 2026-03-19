import { useState } from "react";
import supabase from "../utils/DatabaseInteractions/supabase.js";
import { getAssignmentByKey } from '../utils/DatabaseInteractions/Student/getAssignmentByKey.js';
import { Navigate } from "react-router-dom";
import StudentAssignment from "../Components/Assignment/StudentAssignment.jsx";

const SubmitAssignment = () => {
  const [formData, setFormData] = useState({
    assignmentKey: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [assignmentKey, setAssignmentKey] = useState('')
  const [aid, setAid] = useState(0)


  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    
  };
  
  const fetchCid = async () => {
    event.preventDefault();
    console.log("pls");
    const { assignmentKey } = formData;

    if (!assignmentKey) {
      setError("Please enter an assignment key.");
      return;
    }
    if (!assignmentKey.trim()) return

    setLoading(true);
    setError(null);
    setAid(null);

    const { data, error } =  await getAssignmentByKey(assignmentKey);

    if (error) {
      setError('No assignment found with that key.');
      console.log(error);
    } else {
      console.log(data);
      setAid(data.id);
      setSubmitted(true);
    }
    setLoading(false)
  }

  return (
    <div className="outer-container">
      <h1 className="h1-default text-center">Submit Assignment</h1>
      <form onSubmit={fetchCid} className="form-default">
        <label className="label-default">
          <span className="span-default">Assignment Key</span>
          <input
            type="text"
            name="assignmentKey"
            value={formData.assignmentKey}
            onChange={onChange}
            placeholder=""
            className="field-default"
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        {submitted ? <p className="success">Assignment Found</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? "Searching..." : "Search for assignment"}
        </button>
      </form>
      {submitted && <StudentAssignment aid={aid} />}
    </div>

    
  
    
  );
};

export default SubmitAssignment;
