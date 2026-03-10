import getAssignmentDetails from "../../../utils/DatabaseInteractions/Student/getAssignmentDetails";
import { useEffect, useState } from "react";


export function useLoadStudentAssignment(aid, setLoading, setError){
  const [details, setDetails] = useState(null);
  const [pastDueDate, setPastDueDate] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAssignment() {
      try {
        setLoading(true);
        setError("");
        const data = await getAssignmentDetails(aid);
        if (!cancelled) {
          setDetails(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load assignment.");
        }
      } finally {
        if (!cancelled) {
          const isPastDueDate = details?.due_date ? new Date(details.due_date).getTime() < Date.now() : false;
          setPastDueDate(isPastDueDate);
          setLoading(false);
        }
      }
    }

    loadAssignment();
    return () => {
      cancelled = true;
    };
  }, [aid]);

  return{
    details,
    pastDueDate
  }
}