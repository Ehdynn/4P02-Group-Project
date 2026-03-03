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
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-slate-900">Student Overview</h1>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Course</span>
          <select
            name="cid"
            value={selectedCourse}
            onChange={(event) => setSelectedCourse(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
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

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Assignments</h2>

        {loadingAssignments ? <p className="mt-3 text-slate-600">Loading assignments...</p> : null}

        {!loadingAssignments && assignments.length === 0 ? (
          <p className="mt-3 text-slate-600">No assignments found for this course.</p>
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
