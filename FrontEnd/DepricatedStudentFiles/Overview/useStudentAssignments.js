import { useEffect, useState } from "react";
import getStudentAssignments from "../../../utils/DatabaseInteractions/Student/getStudentAssignments";

const normalizeAssignments = (data) => {
  return Array.isArray(data) ? data : [];
};

export function useStudentAssignments(selectedCourse, onError) {
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAssignments() {
      if (!selectedCourse) {
        if (!cancelled) {
          setAssignments([]);
        }
        return;
      }

      try {
        setLoadingAssignments(true);
        if (onError) {
          onError("");
        }
        const data = await getStudentAssignments(selectedCourse);

        if (!cancelled) {
          setAssignments(normalizeAssignments(data));
        }
      } catch (err) {
        if (!cancelled) {
          if (onError) {
            onError(err instanceof Error ? err.message : "Unable to load assignments.");
          }
          setAssignments([]);
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
  }, [selectedCourse, onError]);

  return {
    assignments,
    loadingAssignments,
  };
}
