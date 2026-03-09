import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubmissionList } from "../../utils/DatabaseInteractions/Instructor/getSubmissionList";
import { getEnrolled } from "../../utils/DatabaseInteractions/Instructor/getEnrolled";
import useUser from "../../context/useUser";

const SubmissionList = ({ aid, courseId }) => {
  const {user} = useUser();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildNameBySuid = (enrolledStudents) => {
    const nameBySuid = new Map();

    enrolledStudents.forEach((student) => {
      const id = student?.suid;
      const name = student?.student_name?.trim();

      if (id) {
        nameBySuid.set(id, name || "Unknown Student");
      }
    });

    return nameBySuid;
  };

  useEffect(() => {
    let cancelled = false;

    async function loadSubmissions() {
      if (!aid) {
        setSubmissions([]);
        return;
      }

      setLoading(true);
      setError("");

    try {
        const submissionRows = await getSubmissionList(aid);
        const enrolledRows = courseId && user?.id ? await getEnrolled(courseId, user.id) : [];
        const studentNameByUid = buildNameBySuid(enrolledRows);
        const groupedBySuid = new Map();

        submissionRows.forEach((submission) => {
          const uid = submission.suid;
          const existing = groupedBySuid.get(uid) ?? {
            suid: uid,
            student_name: "Unknown Student",
            submission_count: 0,
          };
          const resolvedName = studentNameByUid.get(uid) ?? existing.student_name;

          groupedBySuid.set(uid, {
            ...existing,
            student_name: resolvedName,
            submission_count: existing.submission_count + 1,
          });
        });

        if (!cancelled) {
          setSubmissions(Array.from(groupedBySuid.values()));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load submissions.");
          setSubmissions([]);
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
  }, [aid, courseId, user?.id]);

  if (loading) {
    return (
      <div className="box-wrapper">
        <h1 className="h1-default">Submissions</h1>
        <p>Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="box-wrapper">
      <h1 className="h1-default">Submissions</h1>
      {error ? <p className="error">{error}</p> : null}
      {submissions.length === 0 ? (
        <p className="text-sm text-slate-600">No submissions yet.</p>
      ) : (
      <table className="w-full border border-slate-300 text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="border border-slate-300 px-3 py-2">Student</th>
              <th className="border border-slate-300 px-3 py-2">Submissions</th>
              <th className="border border-slate-300 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => {
              const displayName = submission.student_name;

              return (
                <tr key={`${submission.suid}-${index}`}>
                  <td className="border border-slate-300 px-3 py-2">{displayName}</td>
                  <td className="border border-slate-300 px-3 py-2">{submission.submission_count}</td>
                  <td className="border border-slate-300 px-3 py-2">
                    <button
                      type="button"
                      className="submit-button"
                      onClick={() => navigate("")}
                    >
                      View Submissions
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SubmissionList;
