import getAssignmentDetails from "../../../utils/DatabaseInteractions/Instructor/getAssignmentDetails";
import { useEffect, useState } from "react";

export function useLoadInstructorAssignment(aid, setFormData){
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  // Load assignment details when component mounts or aid changes
  useEffect(() => {
    let cancelled = false;

    async function loadAssignment() {
      try {
        // Reset state before loading
        setLoading(true);
        setError("");
        setNotFound(false);

        // Fetch assignment details
        const data = await getAssignmentDetails(aid);

        // If the component is still mounted, update state with fetched data
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
