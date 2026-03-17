import { useState } from "react";
import useUser from "../../context/useUser";
import AssignmentList from "./AssignmentList";
import { useInstructorCourses } from "./hooks/useInstructorCourses";
import { useInstructorAssignments } from "./hooks/useInstructorAssignments";
import  CourseList  from "./CourseList"

const InstructorOverview = () => {
  const { user } = useUser();
  const [error, setError] = useState("");
  const { courses, selectedCourse, setSelectedCourse, loadingCourses } =
    useInstructorCourses(user?.id, setError);
  const { assignments, loadingAssignments } = useInstructorAssignments(
    selectedCourse,
    setError
  );

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
      <AssignmentList assignments={assignments} loadingAssignments={loadingAssignments}/>
      
    </main>
  );
};

export default InstructorOverview;

