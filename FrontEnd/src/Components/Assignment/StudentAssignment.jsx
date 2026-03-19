import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getAssignmentDetails from "../../utils/DatabaseInteractions/Instructor/getAssignmentDetails";
import useUser from "../../context/useUser";

const StudentAssignment = ({ aid }) => {
  const [details, setDetails] = useState(null);
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {user} = useUser();
  const [showUploader, setShowUploader] = useState(false);
  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [file, setFile] = useState(null);
  useEffect(() => {
    let cancelled = false;

    async function loadAssignment() {
      try {
        console.log(aid);
        setLoading(true);
        setError("");
        const data = await getAssignmentDetails(aid);
        if (!cancelled) {
          setDetails(data);
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

  if (loading) {
    return <div>Loading assignment...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!details) {
    return <div>Assignment not found.</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    ///mostly placeholder
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    console.log("File:", file);

  };

  return (
    <div className="justify-self-center section-default">
      <h1 className="h1-default">{details.name ?? "Assignment"}</h1>
      <p>Description:{details.description ?? "No description provided."}</p>
      <p>Due Date: {details.due_date ?? "No Due Date Provided"}</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">

        <h2 className="text-xl font-semibold text-gray-800 mb-1">Student Submission</h2>
        <p className="text-sm text-gray-500 mb-6">Fill in your details and upload your file below.</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="file" className="text-sm font-medium text-gray-700">
              Upload File
            </label>
            <label
              htmlFor="file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300
                         rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            >
              {file ? (
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-blue-600 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Click to change file</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Zip File</p>
                </div>
              )}
              <input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
                className="hidden"
              />
            </label>
          </div>

          
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-slate-600 hover:bg-slate-300 active:bg-slate-800
                       text-white text-sm font-medium rounded-lg transition focus:outline-none
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>

        </form>
      </div>
    </div>

  );
};

export default StudentAssignment;
