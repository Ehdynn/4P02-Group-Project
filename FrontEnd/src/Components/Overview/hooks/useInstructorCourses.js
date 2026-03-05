import { useEffect, useState } from "react";
import { getInstructorsCourses } from "../../../utils/DatabaseInteractions/Instructor/getInstructorCourses";
import { useLocation } from "react-router-dom";

const normalizeCourseId = (value) => String(value ?? "");

export function useInstructorCourses(userId, onError) {
  const { state } = useLocation();
  const createdCourseId = state?.courseId ?? "";
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(createdCourseId);
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
        const data = await getInstructorsCourses(userId);
        const normalized = Array.isArray(data)
          ? data.map((course) => ({
              ...course,
              cid: normalizeCourseId(course?.cid),
            }))
          : [];

        if (cancelled) return;

        setCourses(normalized);
        setSelectedCourse((currentSelection) => {
          const normalizedSelection = normalizeCourseId(currentSelection);
          if (normalized.some((course) => String(course?.cid) === normalizedSelection)) {
            return normalizedSelection;
          }
          return normalized.length > 0 ? String(normalized[0].cid) : "";
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
