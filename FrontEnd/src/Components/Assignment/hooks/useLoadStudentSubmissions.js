import { useEffect, useState } from "react";
import { getSubmissions } from "../../../utils/DatabaseInteractions/Student/getSubmissions";

export function useLoadStudentSubmissions(aid, uid, setLoading, setError, setShowUploader){
    const [submissions, setSubmissions] = useState(null);
    useEffect(() => {
    let cancelled = false;

    async function loadSubmissions() {
      try {
        setLoading(true);
        setError("");
        const result = await getSubmissions(aid, uid);
        if (!cancelled) {
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