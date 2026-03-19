import { useState, useEffect} from "react";
import { getInstructorsCourses } from "../../utils/DatabaseInteractions/Instructor/getInstructorCourses";
import useUser from "../../context/useUser";
import { createAssignment } from "../../utils/DatabaseInteractions/Instructor/createAssignment";
import { useNavigate } from "react-router-dom";
import toTimestamptzIso from '../../utils/Timestamp/toTimestamptzIso';

const CreateAssignment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cid: "",
    name: "",
    dueDate: "",
    description: "",
    key: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const {user} = useUser();
  var noCoursesMSG = "Loading courses, please wait."

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const data = await getInstructorsCourses(user.id);
        const loadedCourses = Array.isArray(data) ? data : [];
        setCourses(loadedCourses);

        const firstCourseId = loadedCourses[0]?.cid;
        if (firstCourseId != null) {
          setFormData((previous) => ({ ...previous, cid: String(firstCourseId) }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load courses.");
      }
      noCoursesMSG = "No courses available";
    })();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { cid, dueDate, description, key } = formData;

    if (!cid || !formData.name.trim() || !key) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    const dueDateWithTimezone = toTimestamptzIso(dueDate);

    if (dueDate && !dueDateWithTimezone) {
      setLoading(false);
      setError("Invalid due date format.");
      return;
    }

    let assignmentData = null;
    try {
      assignmentData = await createAssignment(cid, formData.name, dueDateWithTimezone, description, key.trim());
    } catch (invokeError) {
      let errorMessage = invokeError instanceof Error ? invokeError.message : "Unable to create assignment";
      if (invokeError?.context) {
        try {
          const payload = await invokeError.context.json();
          errorMessage = payload?.error || errorMessage;
        } catch {
          // Keep default message if response is not JSON.
        }
      }
      setError(errorMessage);
      setSubmitted(false);
      setLoading(false);
      return;
    }

    if (!assignmentData?.id) {
      setLoading(false);
      setError("Assignment was created, but no assignment id was returned.");
      return;
    }

    setLoading(false);
    setSubmitted(true);
    setFormData({
      cid: "",
      name: "",
      dueDate: "",
      description: "",
    });
    navigate(`/Assignment/${assignmentData.id}`);
  };

  return (
    <main className="outer-container">
      <h1 className="h1-default">Create Assignment</h1>
      <h2 className="h2-default">FILL IN TEXT HERE</h2>

      <form onSubmit={handleSubmit} className="form-default">
        <label className="label-default">
            <span className="span-default">Course id</span>
            <select name="cid" value={formData.cid} onChange={onChange} className="field-default">
                {courses.length === 0 ? <option value="">{noCoursesMSG}</option> : 
                    courses.map((course, index) => {
                    const courseId = course?.cid;
                    if (courseId == null) {
                        return null;
                    }
                    const courseName = course?.name;
                    return (
                        <option key={`course-${courseId}-${index}`} value={String(courseId)}>
                        {courseName}
                        </option>
                    );
                    })
                }
            </select>
        </label>

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
          <span className="span-default">Submission Key</span>
          <p>This Cannot be changed once assignment is created.</p>
          <input
            type="text"
            name="key"
            value={formData.key}
            onChange={onChange}
            placeholder="xxVs2lK"
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

        {error ? <p className="error">{error}</p> : null}
        {submitted ? <p className="success">Assignment Created!</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? "Creating..." : "Create Assignment"}
        </button>
      </form>
    </main>
  );
};

export default CreateAssignment;
