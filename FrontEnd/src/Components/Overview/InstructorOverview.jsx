import { useState } from "react";
import useUser from "../../context/useUser";
import ClassList from "./ClassList";
import { removeStudent } from "../../utils/DatabaseInteractions/Instructor/removeStudent";
import ConfirmPopup from "../common/ConfirmPopup";
import AssignmentList from "./AssignmentList";
import { useInstructorCourses } from "./hooks/useInstructorCourses";
import { useInstructorAssignments } from "./hooks/useInstructorAssignments";
import { useInstructorStudents } from "./hooks/useInstructorStudents";

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

      <section className="box-wrapper">
        <label className="label-default">
          <h2 className="h2-large">Course</h2>
          <select
            name="cid"
            value={selectedCourse}
            onChange={(event) => setSelectedCourse(event.target.value)}
            className="field-default"
            disabled={loadingCourses || courses.length === 0}
          >
            {loadingCourses ? <option value="">Loading courses...</option> : null}
            {!loadingCourses && courses.length === 0 ? <option value="">No courses available</option> : null}
            {!loadingCourses
              ? courses.map((course) => (
                  <option key={`course-${course.cid}`} value={String(course.cid)}>
                    {course.name ?? `Course ${course.cid}`}
                  </option>
                ))
              : null}
          </select>
        </label>

        {error ? <p className="error">{error}</p> : null}
      </section>

      {loadingStudents ? <h2 className="h2-default">Loading class list...</h2> : null}
      <AssignmentList assignments={assignments} loadingAssignments={loadingAssignments}/>

      <ClassList studentList={students} onRemoveRequest={handleRequestRemove} />
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
