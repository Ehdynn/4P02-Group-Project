import { useState } from "react";
import useUser from "../../context/useUser";
import ClassList from "./ClassList";
import CourseList from "./CourseList";
import { removeStudent } from "../../utils/DatabaseInteractions/Instructor/removeStudent";
import ConfirmPopup from "../Common/ConfirmPopup";
import AssignmentList from "./AssignmentList";
import { useInstructorCourses } from "./hooks/useInstructorCourses";
import { useInstructorAssignments } from "./hooks/useInstructorAssignments";
import { useInstructorStudents } from "./hooks/useInstructorStudents";
import { useUpdateCourse } from "./hooks/useUpdateCourse";

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
  const {updating, formData, submitted, handleSubmit, onChange} = useUpdateCourse(selectedCourse, courses ,setError);
  const handleRequestRemove = (studentInfo) => {
    setPendingRemoval(studentInfo || null);
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
      <div className="flex w-full space-x-5 flex-col md:flex-row">
        <div className="flex-1 min-w-0">
          <AssignmentList assignments={assignments} loadingAssignments={loadingAssignments}/>
        </div>
        <div className="flex-1 min-w-0">
          <ClassList studentList={students} onRemoveRequest={handleRequestRemove} />
        </div>
      </div>
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

