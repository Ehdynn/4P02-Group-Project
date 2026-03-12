import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ComparisonList from "../../Components/Comparison/ComparisonList";
import ComparisonViewer from "../../Components/Comparison/ComparisonViewer";
import ComparisonStats from "../../Components/Comparison/ComparisonStats";
import { getComparisons } from "../../utils/DatabaseInteractions/Instructor/getComparisons";
import getAssignmentDetails from "../../utils/DatabaseInteractions/Instructor/getAssignmentDetails";
import { getEnrolled } from "../../utils/DatabaseInteractions/Instructor/getEnrolled";
import useUser from "../../context/useUser";

const Comparison = () => {
  const { aid } = useParams();
  const { user } = useUser();
  const [comparisons, setComparisons] = useState([]);
  const [selectedComparisonId, setSelectedComparisonId] = useState(null);
  const [assignmentName, setAssignmentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadComparisonData() {
      try {
        setLoading(true);
        setError("");
        const [comparisonRows, assignmentDetails] = await Promise.all([
          getComparisons(aid),
          getAssignmentDetails(aid),
        ]);
        const resolvedAssignmentName = assignmentDetails?.name?.trim?.() ?? "";

        const enrolledRows = assignmentDetails?.course && user?.id
          ? await getEnrolled(assignmentDetails.course, user.id)
          : [];

        const nameBySuid = new Map();
        enrolledRows.forEach((student) => {
          if (student?.suid) {
            nameBySuid.set(String(student.suid), student?.student_name?.trim() || "Unknown Student");
          }
        });

        const resolvedComparisons = comparisonRows.map((comparison) => {
          const students = Array.isArray(comparison.students_compared)
            ? comparison.students_compared
            : [];

          return {
            ...comparison,
            students,
            studentsWithNames: students.map((suid) => {
              const normalizedSuid = String(suid);
              return {
                suid: normalizedSuid,
                student_name: nameBySuid.get(normalizedSuid) ?? normalizedSuid,
              };
            }),
          };
        });

        if (!cancelled) {
          setAssignmentName(resolvedAssignmentName);
          setComparisons(resolvedComparisons);
          setSelectedComparisonId(resolvedComparisons[0]?.id ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setAssignmentName("");
          setComparisons([]);
          setSelectedComparisonId(null);
          setError(err instanceof Error ? err.message : "Failed to load comparison data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadComparisonData();
    return () => {
      cancelled = true;
    };
  }, [aid, user?.id]);

  const selectedComparison = comparisons.find((comparison) => comparison.id === selectedComparisonId)
    ?? comparisons[0]
    ?? null;

  
  return (
    <main className="outer-container-fw">
      <h1 className="h1-default text-center">
        {assignmentName || `Assignment ${aid}`} Comparison
      </h1>
      {error ? <p className="error text-center">{error}</p> : null}
      <div className="flex w-full space-x-5 flex-col md:flex-row">
        <div className="flex-1 min-w-0">
          <ComparisonList
            comparisons={comparisons}
            loading={loading}
            selectedComparisonId={selectedComparison?.id ?? null}
            onSelectComparison={setSelectedComparisonId}
          />
        </div>
        <div className="flex-4 min-w-0">
          <ComparisonStats comparisons={comparisons} loading={loading} />
          <ComparisonViewer comparison={selectedComparison} loading={loading} />
        </div>
      </div>
    </main>
  )
}

export default Comparison
