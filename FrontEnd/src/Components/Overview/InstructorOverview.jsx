import { useEffect, useState } from "react";
import useUser from "../../context/useUser";
import ClassList from "./ClassList";
import CourseList from "./CourseList";
import { removeStudent } from "../../utils/DatabaseInteractions/Instructor/removeStudent";
import ConfirmPopup from "../common/ConfirmPopup";
import AssignmentList from "./AssignmentList";
import { useInstructorCourses } from "./hooks/useInstructorCourses";
import { useInstructorAssignments } from "./hooks/useInstructorAssignments";
import { useInstructorStudents } from "./hooks/useInstructorStudents";
import { updateCourse } from '../../utils/DatabaseInteractions/Instructor/updateCourse';

const InstructorOverview = () => {
  const { user } = useUser();
  const [error, setError] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const { courses, selectedCourse, setSelectedCourse, loadingCourses } =
    useInstructorCourses(user?.id, setError);
  const { assignments, loadingAssignments } = useInstructorAssignments(
    selectedCourse,
    setError
  );
  const { students, loadingStudents, loadStudents } = useInstructorStudents(
    selectedCourse,
    user?.id,
    setError
  );
  const handleRequestRemove = (studentInfo) => {
    setPendingRemoval(studentInfo || null);
  };

  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ joinCode: "" });
  const [submitted, setSubmitted] = useState(false);

  const selectedCourseObj = courses.find(
    (course) => String(course?.cid) === String(selectedCourse)
  );

  useEffect(() => {
    setFormData({ joinCode: selectedCourseObj?.join_code ?? "" });
    setSubmitted(false);
    setError("");
  }, [selectedCourse, courses]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { joinCode } = formData;

    if (!joinCode.trim()) {
      setError("New join code required.");
      return;
    }

    setUpdating(true);
    setError("");

    let updatedCode = null;
    try {
      updatedCode = await updateCourse(selectedCourse, joinCode);
    } catch (createError) {
      const errorMessage =
        createError instanceof Error ? createError.message : "Unable to update course.";
      setError(errorMessage);
      setSubmitted(false);
      setUpdating(false);
      return;
    }

    setUpdating(false);
    setSubmitted(true);
    setFormData({
      joinCode: updatedCode?.join_code ?? updatedCode,
    });
  };

  const handleConfirmRemove = async (confirmed) => {
    if (!confirmed || !pendingRemoval) {
      setPendingRemoval(null);
      return;
    }

    try {
      await removeStudent(selectedCourse, pendingRemoval.studentId, user?.id);
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove student.");
    } finally {
      setPendingRemoval(null);
    }
  };

  return (
    <main className="outer-container">
      <h1 className="h1-default">Instructor Overview</h1>

      <CourseList
        courses={courses}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        loadingCourses={loadingCourses}
        error={error}
      />

      {loadingStudents ? <h2 className="h2-default">Loading class list...</h2> : null}
      <AssignmentList assignments={assignments} loadingAssignments={loadingAssignments}/>

      <ClassList studentList={students} onRemoveRequest={handleRequestRemove} />

      <div className="box-wrapper">
        <h2 className="h2-large">Update Course Info</h2>
        <p className="text-xs">Leave this field blank when you update to turn off course enrollment.</p>

        <form onSubmit={handleSubmit} className="form-no-wrapper">

        <label className="label-default">
          <span className="span-default">Join Code</span>
          <input
            type="text"
            name="joinCode"
            value={formData.joinCode}
            onChange={onChange}
            className="field-default"
          />
        </label>

        {error ? <p className="error">{error}</p> : null}
        {submitted ? <p className="success">Join code updated!</p> : null}

        <button
          type="submit"
          disabled={updating}
          className="submit-button"
        >
          {updating ? "Updating..." : "Update Join Code"}
        </button>
      </form>
      </div>

      <ConfirmPopup
        isOpen={Boolean(pendingRemoval)}
        title="Remove Student"
        message={
          pendingRemoval
            ? `Remove ${pendingRemoval.studentName} (${pendingRemoval.studentNumber}) from this class?`
            : "Remove this student from this class?"
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onResponse={handleConfirmRemove}
      />
    </main>
  );
};

export default InstructorOverview;
