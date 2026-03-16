import { useState } from "react";
import useUser from "../../context/useUser";
import AssignmentList from "./AssignmentList";
import { useInstructorCourses } from "./hooks/useInstructorCourses";
import { useInstructorAssignments } from "./hooks/useInstructorAssignments";
import { useUpdateCourse } from "./hooks/useUpdateCourse";
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
  const {updating, formData, submitted, handleSubmit, onChange} = useUpdateCourse(selectedCourse, courses ,setError);

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
        
      
    </main>
  );
};

export default InstructorOverview;

