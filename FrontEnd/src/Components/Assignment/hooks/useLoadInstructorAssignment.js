import getAssignmentDetails from "../../../utils/DatabaseInteractions/Instructor/getAssignmentDetails";
import { useEffect, useState } from "react";


export function useLoadInstructorAssignment(aid, setFormData){
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAssignment() {
      try {
        setLoading(true);
        setError("");
        const data = await getAssignmentDetails(aid);
        if (!cancelled) {
          setDetails(data);
          setFormData({name: data.name || "", dueDate:data.due_date ? data.due_date.slice(0, 16) : "", description: data.description || ""})
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load assignment.");
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
    error
  }
}