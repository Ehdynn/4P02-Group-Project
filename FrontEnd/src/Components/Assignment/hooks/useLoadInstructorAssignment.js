import getAssignmentDetails from "../../../utils/DatabaseInteractions/Instructor/getAssignmentDetails";
import { useEffect, useState } from "react";

export function useLoadInstructorAssignment(aid, setFormData){
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
          setFormData({name: data.name || "", dueDate:data.due_date ? data.due_date.slice(0, 16) : "", description: data.description || ""})
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
    setDetails,
    loading,
    error,
    notFound
  }
}
