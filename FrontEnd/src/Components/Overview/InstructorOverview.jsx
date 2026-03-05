import { useEffect, useState } from "react";
import useUser from "../../context/useUser";
import { getInstructorsCourses } from "../../utils/DatabaseInteractions/Instructor/getInstructorCourses";
import getInstructorAssignments from "../../utils/DatabaseInteractions/Instructor/getInstructorAssignments";
import { getEnrolled } from "../../utils/DatabaseInteractions/Instructor/getEnrolled";
import ClassList from "./ClassList";
import { removeStudent } from "../../utils/DatabaseInteractions/Instructor/removeStudent";
import ConfirmPopup from "../common/ConfirmPopup";
import AssignmentList from "./AssignmentList";

const InstructorOverview = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState(null);

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
        const data = await getInstructorsCourses(user.id);
        const normalized = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setCourses(normalized);
          setSelectedCourse(normalized.length > 0 ? String(normalized[0].cid) : "");
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

    async function loadEnrolledStudents() {
      if (!selectedCourse) {
        if (!cancelled) {
          setStudents([]);
        }
        return;
      }

      try {
        setLoadingStudents(true);
        const data = await getEnrolled(selectedCourse, user.id);
        const studentList = Array.isArray(data?.students)
          ? data.students
          : Array.isArray(data)
          ? data
          : [];

        if (!cancelled) {
          setStudents(studentList);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load enrolled students.");
          setStudents([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingStudents(false);
        }
      }
    }

    loadEnrolledStudents();
    return () => {
      cancelled = true;
    };
  }, [selectedCourse]);

  const reloadStudents = async () => {
    if (!selectedCourse || !user?.id) {
      setStudents([]);
      return;
    }

    try {
      const data = await getEnrolled(selectedCourse, user.id);
      const studentList = Array.isArray(data?.students)
        ? data.students
        : Array.isArray(data)
        ? data
        : [];
      setStudents(studentList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load enrolled students.");
      setStudents([]);
    }
  };

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
      await reloadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove student.");
    } finally {
      setPendingRemoval(null);
    }
  };

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
        const data = await getInstructorAssignments(selectedCourse);
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
