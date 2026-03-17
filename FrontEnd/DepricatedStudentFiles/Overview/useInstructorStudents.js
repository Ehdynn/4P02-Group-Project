import { useEffect, useCallback, useState } from "react";
import { getEnrolled } from "../../../utils/DatabaseInteractions/Instructor/getEnrolled";

const normalizeStudentList = (data) => {
  if (Array.isArray(data?.students)) {
    return data.students;
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
};

export function useInstructorStudents(selectedCourse, instructorId, onError) {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!selectedCourse || !instructorId) {
      setStudents([]);
      return;
    }

    try {
      setLoadingStudents(true);
      const data = await getEnrolled(selectedCourse, instructorId);
      setStudents(normalizeStudentList(data));
      return normalizeStudentList(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load enrolled students.";

      if (onError) {
        onError(message);
      }
      setStudents([]);
      return [];
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedCourse, instructorId, onError]);

  useEffect(() => {
    let cancelled = false;

    async function fetchStudents() {
      if (!selectedCourse || !instructorId) {
        if (!cancelled) {
          setStudents([]);
        }
        return;
      }

      const result = await loadStudents();
      if (cancelled) {
        return;
      }

      if (result) {
        setStudents(result);
      }
    }

    fetchStudents();

    return () => {
      cancelled = true;
    };
  }, [selectedCourse, instructorId, loadStudents]);

  return {
    students,
    loadingStudents,
    loadStudents,
  };
}
