import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ComparisonList from "../../Components/Comparison/ComparisonList";
import ComparisonViewer from "../../Components/Comparison/ComparisonViewer";
import ComparisonStats from "../../Components/Comparison/ComparisonStats";
import { getComparisonStudents } from "../../utils/DatabaseInteractions/Instructor/getComparisonStudents";
import getAssignmentDetails from "../../utils/DatabaseInteractions/Instructor/getAssignmentDetails";
import { getEnrolled } from "../../utils/DatabaseInteractions/Instructor/getEnrolled";
import useUser from "../../context/useUser";

const Comparison = () => {
  const { aid } = useParams();
  const { user } = useUser();
  // Comparison list is an array of { suid, student_name }.
  const [comparisonList, setComparisonList] = useState([]);
  const [assignmentName, setAssignmentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadComparisonStudents() {
      try {
        setLoading(true);
        setError("");
        const [students, assignmentDetails] = await Promise.all([
          getComparisonStudents(aid),
          getAssignmentDetails(aid),
        ]);
        const resolvedAssignmentName = assignmentDetails?.name?.trim?.() ?? "";

        const enrolledRows = assignmentDetails?.course && user?.id
          ? await getEnrolled(assignmentDetails.course, user.id)
          : [];

        const nameBySuid = new Map();
        enrolledRows.forEach((student) => {
          if (student?.suid) {
            nameBySuid.set(student.suid, student?.student_name?.trim() || "Unknown Student");
          }
        });

        const resolvedStudents = students.map((suid) => ({
          suid,
          student_name: nameBySuid.get(suid) ?? suid,
        }));

        if (!cancelled) {
          setAssignmentName(resolvedAssignmentName);
          setComparisonList(resolvedStudents);
        }
      } catch (err) {
        if (!cancelled) {
          setAssignmentName("");
          setComparisonList([]);
          setError(err instanceof Error ? err.message : "Failed to load comparison list.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadComparisonStudents();
    return () => {
      cancelled = true;
    };
  }, [aid, user?.id]);

  
  return (
    <main className="outer-container-fw">
      <h1 className="h1-default text-center">
        {assignmentName || `Assignment ${aid}`} Comparison
      </h1>
      {error ? <p className="error text-center">{error}</p> : null}
      <div className="flex w-full space-x-5 flex-col md:flex-row">
        <div className="flex-1 min-w-0">
          <ComparisonList comparisonList={comparisonList} loading={loading} />
        </div>
        <div className="flex-4 min-w-0">
          <ComparisonStats />
          <ComparisonViewer />
        </div>
      </div>
    </main>
  )
}

export default Comparison
