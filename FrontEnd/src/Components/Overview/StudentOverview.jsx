import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useUser from "../../context/useUser";
import getStudentCourses from "../../utils/DatabaseInteractions/Student/getStudentCourses";
import getStudentAssignments from "../../utils/DatabaseInteractions/Student/getStudentAssingments";

const StudentOverview = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      if (!user?.id) {
        setLoadingCourses(false);
        return;
      }

      try {
        setLoadingCourses(true);
        setError("");
        const data = await getStudentCourses(user.id);
        const normalized = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setCourses(normalized);
          setSelectedCourse(normalized.length > 0 ? String(normalized[0]) : "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load courses.");
        }
      } finally {
        if (!cancelled) {
          setLoadingCourses(false);
        }
      }
    }

    loadCourses();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadAssignments() {
      if (!selectedCourse) {
        setAssignments([]);
        return;
      }

      try {
        setLoadingAssignments(true);
        setError("");
        const data = await getStudentAssignments(selectedCourse);
        if (!cancelled) {
          setAssignments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load assignments.");
        }
      } finally {
        if (!cancelled) {
          setLoadingAssignments(false);
        }
      }
    }

    loadAssignments();
    return () => {
      cancelled = true;
    };
  }, [selectedCourse]);

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

      <section className="box-wrapper">
        <h2 className="h2-large">Assignments</h2>

        {loadingAssignments ? <h2 className="h2-default">Loading assignments...</h2> : null}

        {!loadingAssignments && assignments.length === 0 ? (
          <h2 className="h2-default">No assignments found for this course.</h2>
        ) : null}

        {!loadingAssignments && assignments.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {assignments.map((assignment) => (
              <li key={assignment.id}>
                <Link to={`/StudentAssignment/${assignment.id}`} className="text-slate-900 underline hover:text-slate-700">
                  {assignment.name ?? `Assignment ${assignment.id}`}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
};

export default StudentOverview;
