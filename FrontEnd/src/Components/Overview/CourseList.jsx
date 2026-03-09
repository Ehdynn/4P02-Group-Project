import { useNavigate } from "react-router-dom";

const CourseList = ({
  courses,
  selectedCourse,
  setSelectedCourse,
  loadingCourses,
  error,
}) => {
  const courseList = Array.isArray(courses) ? courses : [];

  const getCourseId = (course) => String(course?.cid ?? course ?? "");

  const getCourseLabel = (course) =>
    String(course?.name ?? `Course ${getCourseId(course)}`);

  const navigate = useNavigate();

  return (
    <section className="box-wrapper">
      <label className="label-default">
        <h2 className="h2-large">Course</h2>
        <select
          name="cid"
          value={selectedCourse}
          onChange={(event) => {
            setSelectedCourse(event.target.value);
            navigate(`/Overview/${getCourseId(event.target.value)}`, {replace: true})
          }}
          className="field-default"
          disabled={loadingCourses || courseList.length === 0}
        >
          {loadingCourses ? <option value="">Loading courses...</option> : null}
          {!loadingCourses && courseList.length === 0 ? <option value="">No courses available</option> : null}
          {!loadingCourses
            ? courseList.map((course) => {
                const courseId = getCourseId(course);
                return (
                  <option key={`course-${courseId}`} value={courseId}>
                    {getCourseLabel(course)}
                  </option>
                );
              })
            : null}
        </select>
      </label>

      {error ? <p className="error">{error}</p> : null}
    </section>
  );
};

export default CourseList;
