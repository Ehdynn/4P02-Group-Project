import { useState } from "react";
import supabase from "../../../utils/DatabaseInteractions/supabase";

const JoinCourse = () => {
  const [formData, setFormData] = useState({
    joinCode: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);


  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { joinCode } = formData;

    if (!joinCode) {
      setError("Please enter a join code.");
      return;
    }

    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setLoading(false);
      setError(userError.message || "Unable to validate current user");
      return;
    }

    if (!user) {
      setLoading(false);
      setError("You must be logged in to join a course.");
      return;
    }

    const { data: invokeData, error: invokeError } = await supabase.functions.invoke("addStudentToCourse", {
      body: {
        join_code: joinCode.trim(),
      },
    });

    setLoading(false);

    if (invokeError) {
      const isInvalidCourseCode = invokeError.message?.includes("Cannot coerce the result to a single JSON object");
      let errorMessage = isInvalidCourseCode? "Invalid course code.": invokeError.message || "Unable to join course.";
      if (invokeError.context && !isInvalidCourseCode) {
        try {
          const payload = await invokeError.context.json();
          errorMessage = payload?.error || errorMessage;
        } catch {
          // Keep default message if response is not JSON.
        }
      }
      setError(errorMessage);
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
    setFormData({
      joinCode: "",
    });
  };

  return (
    <div className="outer-container">
      <h1 className="h1-default">Join Course</h1>
      <form onSubmit={handleSubmit} className="form-default">
        <label className="label-default">
          <span className="span-default">Join Code</span>
          <input
            type="text"
            name="joinCode"
            value={formData.joinCode}
            onChange={onChange}
            placeholder=""
            className="field-default"
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        {submitted ? <p className="success">Course Joined!</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? "Joining..." : "Join Course"}
        </button>
      </form>
    </div>
  );
};

export default JoinCourse;
