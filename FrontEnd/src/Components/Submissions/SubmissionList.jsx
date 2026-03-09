import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getSubmissionList } from "../../utils/DatabaseInteractions/Instructor/getSubmissionList";
import { getEnrolled } from "../../utils/DatabaseInteractions/Instructor/getEnrolled";
import useUser from "../../context/useUser";
import { downloadSubmission } from "../../utils/DatabaseInteractions/Instructor/downloadSubmission";
import { downloadAllSubmissions } from "../../utils/DatabaseInteractions/Instructor/downloadAllSubmissions";

const SubmissionList = ({ aid, courseId }) => {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const buildNameBySuid = (enrolledStudents) => {
    const nameBySuid = new Map();

    enrolledStudents.forEach((student) => {
      if (student?.suid) {
        nameBySuid.set(student.suid, student?.student_name?.trim() || "Unknown Student");
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
            submissions: [],
          };

          const resolvedName = studentNameByUid.get(uid) ?? existing.student_name;

          groupedBySuid.set(uid, {
            ...existing,
            student_name: resolvedName,
            submissions: [...existing.submissions, submission],
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

  const handleDownload = async (submission) => {
    try {
      setDownloadingId(submission.id);
      const { signedUrl } = await downloadSubmission(submission);
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate download link.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setDownloadingAll(true);
      setError("");
      if (!selectedStudent) {
        return;
      }
      await downloadAllSubmissions(selectedStudent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate submissions zip.");
    } finally {
      setDownloadingAll(false);
    }
  };


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
            {submissions.map((submission) => (
              <tr key={submission.suid}>
                <td className="border border-slate-300 px-3 py-2">{submission.student_name}</td>
                <td className="border border-slate-300 px-3 py-2">{submission.submission_count}</td>
                <td className="border border-slate-300 px-3 py-2">
                  <button
                    type="button"
                    className="submit-button"
                    onClick={() => setSelectedStudent(submission)}
                  >
                    View Submissions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedStudent && typeof window !== "undefined"
        ? createPortal(
        (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="h2-large">{selectedStudent.student_name}</h2>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-2 py-1 border rounded"
              >
                Close
              </button>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {selectedStudent.submission_count} submission(s)
            </p>

            <div className="mt-3 max-h-96 overflow-y-auto">
              <table className="w-full border border-slate-300 text-left">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 px-3 py-2">File</th>
                    <th className="border border-slate-300 px-3 py-2">Submitted</th>
                    <th className="border border-slate-300 px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="border border-slate-300 px-3 py-2">{submission.file_name}</td>
                      <td className="border border-slate-300 px-3 py-2">
                        {new Date(submission.created_at).toLocaleString()}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        <button
                          type="button"
                          className="px-3 py-1 bg-slate-900 text-white rounded"
                          disabled={downloadingId === submission.id}
                          onClick={() => handleDownload(submission)}
                        >
                          {downloadingId === submission.id ? "Downloading..." : "Download"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-slate-900 text-white rounded"
                disabled={downloadingAll || downloadingId !== null}
                onClick={handleDownloadAll}
              >
                {downloadingAll ? "Preparing Zip..." : "Download All (Zip)"}
              </button>
            </div>
          </div>
        </div>
        ),
        document.body)
      : null}
    </div>
  );
};

export default SubmissionList;
