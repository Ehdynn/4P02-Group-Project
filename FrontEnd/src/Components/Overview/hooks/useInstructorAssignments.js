import { useEffect, useState } from "react";
import getInstructorAssignments from "../../../utils/DatabaseInteractions/Instructor/getInstructorAssignments";


export function useInstructorAssignments(selectedCourse, onError) {
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
        const data = await getInstructorAssignments(selectedCourse);

        if (!cancelled) {
          setAssignments(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err.message ??  "Unable to load assignments.";

          if (onError) {
            onError(message);
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
