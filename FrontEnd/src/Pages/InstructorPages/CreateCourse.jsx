import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../../utils/DatabaseInteractions/Instructor/createCourse";
import useUser from "../../context/useUser"
const CreateCourse = () => {
  const {user} = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    joinCode: "",
    startDate: "",
    endDate: "",
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
    const { name, joinCode, startDate, endDate } = formData;

    if (!name.trim()) {
      setError("Course name required.");
      return;
    }

    if (!startDate) {
      setError("Start date required.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("Course end date must be after the start date.");
      return;
    }

    setLoading(true);
    setError("");

    let createdCourse = null;
    try {
      createdCourse = await createCourse(user.id, formData.name, joinCode, startDate, endDate);
    } catch (createError) {
      const errorMessage =
        createError instanceof Error ? createError.message : "Unable to create course.";
      setError(errorMessage);
      setSubmitted(false);
      setLoading(false);
      return;
    }

    setLoading(false);

    setSubmitted(true);
    setFormData({
      name: "",
      joinCode: "",
      startDate: "",
      endDate: "",
    });
    navigate("/Overview", { state: { courseId: createdCourse?.cid ?? null } });
  };

  return (
    <main className="outer-container">
      <h1 className="h1-default">Create Course</h1>
      <h2 className="h2-default">Set the course name and a code students can use to join.</h2>

      <form onSubmit={handleSubmit} className="form-default">
        <label className="label-default">
          <span className="span-default">Course Name</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Software Design 101"
            className="field-default"
          />
        </label>

        <label className="label-default">
          <span className="span-default">Join Code</span>
          <input
            type="text"
            name="joinCode"
            value={formData.joinCode}
            onChange={onChange}
            placeholder="4P02-W26"
            className="field-default"
          />
        </label>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="label-default">
            <span className="span-default">Start Date</span>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={onChange}
              className="field-default"
            />
          </label>

          <label className="label-default">
            <span className="span-default">End Date</span>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={onChange}
              className="field-default"
            />
          </label>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {submitted ? <p className="success">Course Created!</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>
    </main>
  );
};

export default CreateCourse;
