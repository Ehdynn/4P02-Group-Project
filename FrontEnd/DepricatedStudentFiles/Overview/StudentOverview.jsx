import { useState } from "react";
import useUser from "../../context/useUser";
import AssignmentList from "./AssignmentList";
import { useStudentCourses } from "./hooks/useStudentCourses";
import { useStudentAssignments } from "./hooks/useStudentAssignments";
import CourseList from "./CourseList";

const StudentOverview = () => {
  const { user } = useUser();
  const [error, setError] = useState("");
  const { courses, selectedCourse, setSelectedCourse, loadingCourses } =
    useStudentCourses(user?.id, setError);
  const { assignments, loadingAssignments } = useStudentAssignments(
    selectedCourse,
    setError
  );

  return (
    <main className="outer-container">
      <h1 className="h1-default">Student Overview</h1>

      <CourseList
        courses={courses}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        loadingCourses={loadingCourses}
        error={error}
      />

      <AssignmentList assignments={assignments} loadingAssignments={loadingAssignments}/>
    </main>
  );
};

export default StudentOverview;
