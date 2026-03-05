import { useState } from "react";
import useUser from "../../context/useUser";
import ClassList from "./ClassList";
import CourseList from "./CourseList";
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
