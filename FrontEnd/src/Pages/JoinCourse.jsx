import { useState } from "react";
import supabase from "../utils/DatabaseInteractions/supabase";
import { getAssignmentByJoinCode } from '../utils/DatabaseInteractions/Student/getAssignmentByJoinCode.js';
import { Navigate } from "react-router-dom";
import StudentAssignment from "../Components/Assignment/StudentAssignment.jsx";

const JoinCourse = () => {
  const [formData, setFormData] = useState({
    joinCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [joinCode, setJoinCode] = useState('')
  const [aid, setAid] = useState(0)


  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    
  };
  
  const fetchCid = async () => {
    event.preventDefault();
    console.log("pls");
    const { joinCode } = formData;

    if (!joinCode) {
      setError("Please enter a join code.");
      return;
    }
    if (!joinCode.trim()) return

    setLoading(true);
    setError(null);
    setAid(null);

    const { data, error } =  await getAssignmentByJoinCode(joinCode);

    if (error) {
      setError('No course found with that join code.');
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
      <h1 className="h1-default">Join Course</h1>
      <form onSubmit={fetchCid} className="form-default">
        <label className="label-default">
          <span className="span-default">Join Code</span>
          <input
            type="text"
            name="joinCode"
            value={formData.joinCode}
            onChange={onChange}
            placeholder=""
            className="field-default uppercase"
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        {submitted ? <p className="success">Course Joined!</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? "Creating..." : "Join Course"}
        </button>
      </form>
      {submitted && <StudentAssignment aid={aid} />}
    </div>

    
  
    
  );
};

export default JoinCourse;
