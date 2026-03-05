import { useState } from "react";
import useUser from "../../context/useUser";
import AssignmentList from "./AssignmentList";
import { useStudentCourses } from "./hooks/useStudentCourses";
import { useStudentAssignments } from "./hooks/useStudentAssignments";

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
              ? courses.map((cid) => (
                  <option key={`course-${cid}`} value={String(cid)}>
                    Course {cid}
                  </option>
                ))
              : null}
          </select>
        </label>

        {error ? <p className="error">{error}</p> : null}
      </section>

      <AssignmentList assignments={assignments} loadingAssignments={loadingAssignments}/>
    </main>
  );
};

export default StudentOverview;
