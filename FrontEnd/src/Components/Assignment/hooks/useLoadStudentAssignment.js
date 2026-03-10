import getAssignmentDetails from "../../../utils/DatabaseInteractions/Student/getAssignmentDetails";
import { useEffect, useState } from "react";


export function useLoadStudentAssignment(aid, setLoading, setError){
  const [details, setDetails] = useState(null);
  const [pastDueDate, setPastDueDate] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAssignment() {
      try {
        setLoading(true);
        setError("");
        setNotFound(false);
        const data = await getAssignmentDetails(aid);
        if (!cancelled) {
          setDetails(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load assignment.";
          setError(message);
          setNotFound(err?.code === "PGRST116");
          setDetails(null);
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
    pastDueDate,
    notFound
  }
}
