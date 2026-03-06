import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getAssignmentDetails from "../../utils/DatabaseInteractions/Instructor/getAssignmentDetails";
import useUser from "../../context/useUser";
import toTimestamptzIso from "../../utils/Timestamp/toTimestamptzIso";
import { updateAssignment } from "../../utils/DatabaseInteractions/Instructor/updateAssignment";

const InstructorAssignment = () => {
  const { aid } = useParams();
  const {user} = useUser();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dueDate: "",
    description: "",
  });
  useEffect(() => {
    let cancelled = false;

    async function loadAssignment() {
      try {
        setLoading(true);
        setError("");
        const data = await getAssignmentDetails(aid);
        if (!cancelled) {
          setDetails(data);
          setFormData({name: data.name || "", dueDate:data.due_date ? data.due_date.slice(0, 16) : "", description: data.description || ""})
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load assignment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAssignment();
    return () => {
      cancelled = true;
    };
  }, [aid]);
  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(false);
    const {dueDate, description } = formData;

    if (!formData.name.trim()) {
      setUpdateError("Name field can not be blank.");
      return;
    }

    setLoadingUpdate(true);
    setUpdateError("");

    const dueDateWithTimezone = toTimestamptzIso(dueDate);

    if (dueDate && !dueDateWithTimezone) {
      setLoadingUpdate(false);
      setUpdateError("Invalid due date format.");
      return;
    }

    let assignmentData = null;
    try {
      assignmentData = await updateAssignment(aid, formData.name, dueDateWithTimezone, description);
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
      setUpdateError(errorMessage);
      setSubmitted(false);
      setLoadingUpdate(false);
      return;
    }

    setLoadingUpdate(false);
    setSubmitted(true);
    setDetails(assignmentData)
  };

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
    <div className="center-box outer-container">
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
    </div>
  );
};

export default InstructorAssignment;
