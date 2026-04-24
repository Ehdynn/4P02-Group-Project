import { useEffect, useState } from "react";
import { getSubmissions } from "../../../utils/DatabaseInteractions/Student/getSubmissions";

export function useLoadStudentSubmissions(aid, uid, setLoading, setError, setShowUploader){

    // State to hold submissions data
    const [submissions, setSubmissions] = useState(null);
    useEffect(() => {
    let cancelled = false;

    async function loadSubmissions() {
      try {
        // Reset state before loading
        setLoading(true);
        setError("");

        // Fetch submissions
        const result = await getSubmissions(aid, uid);

        // If the component is still mounted, update state with fetched data
        if (!cancelled) {
          // Normalize result to always be an array
          const normalized = Array.isArray(result) ? result : [];
          setSubmissions(normalized);
          setShowUploader(normalized.length === 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load submissions.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSubmissions();
    return () => {
      cancelled = true;
    };
  }, [aid]);

  return{
    submissions
  };
}