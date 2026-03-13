import { useState } from "react";
import supabase from "../../utils/DatabaseInteractions/supabase";

const JoinCourse = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    joinCode: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setFormData({ joinCode: "" });
    setError("");
    setSubmitted(false);
    setLoading(false);
    if (onClose) {
      onClose();
    }
  };

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

    const { data: invokeData, error: invokeError } =
      await supabase.functions.invoke("addStudentToCourse", {
        body: {
          join_code: joinCode.trim().toUpperCase(),
        },
      });

    setLoading(false);

    if (invokeError) {
      const isInvalidCourseCode = invokeError.message?.includes(
        "Cannot coerce the result to a single JSON object"
      );
      let errorMessage = isInvalidCourseCode
        ? "Invalid course code."
        : invokeError.message || "Unable to join course.";
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
    setTimeout(handleClose, 1200);
  };
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={handleClose}
    >
      <div onMouseDown={(event) => event.stopPropagation()}>
        <form onSubmit={handleSubmit} className="form-default">
          <div className="flex items-center justify-end mb-3">
          
            <h2 className="text-xl font-bold text-slate-900 text-center">
              Join a Course!
            </h2>
            {/*This is really Stupid im sorry lol*/}
            <h2 className="text-xl font-bold text-white text-center">
              &nbsp;&nbsp;
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-slate-100 text-slate-400 flex justify-end"
              aria-label="Close"
            >
              ✕
            </button>
            
            
              
          </div>
          
          <label className="label-default">
            {/*<span className="span-default">Join Code</span>*/}
            <input
              type="text"
              name="joinCode"
              value={formData.joinCode}
              onChange={onChange}
              placeholder="Enter join code"
              className="field-default uppercase border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm"
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          {submitted ? <p className="success">Course Joined!</p> : null}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Joining..." : "Join Course"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinCourse;
