import { useEffect, useState } from "react";
import getStudentCourses from "../../../utils/DatabaseInteractions/Student/getStudentCourses";

export function useStudentCourses(userId, onError) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      if (!userId) {
        if (!cancelled) {
          setCourses([]);
          setSelectedCourse("");
          setLoadingCourses(false);
        }
        return;
      }

      try {
        setLoadingCourses(true);
        if (onError) {
          onError("");
        }
        const data = await getStudentCourses(userId);
        const normalized = Array.isArray(data) ? data : [];

        if (cancelled) {
          return;
        }

        setCourses(normalized);
        setSelectedCourse((currentSelection) => {
          if (normalized.includes(currentSelection)) {
            return currentSelection;
          }
          return normalized.length > 0 ? String(normalized[0]) : "";
        });
      } catch (err) {
        if (!cancelled) {
          if (onError) {
            onError(err instanceof Error ? err.message : "Unable to load courses.");
          }
          setCourses([]);
          setSelectedCourse("");
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
  }, [userId, onError]);

  return {
    courses,
    selectedCourse,
    setSelectedCourse,
    loadingCourses,
  };
}
