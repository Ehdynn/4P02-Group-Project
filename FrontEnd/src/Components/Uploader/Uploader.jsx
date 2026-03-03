import { useState } from "react";
import { submitAssignment } from "../../utils/DatabaseInteractions/Student/submitAssignment";
import useUser from "../../context/useUser";

const Uploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useUser();

  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const onFileUpload = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedFile) {
      setErrorMessage("Please choose a file before uploading.");
      return;
    }
    if (!user?.id) {
      setErrorMessage("You must be logged in to upload a submission.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await submitAssignment(selectedFile, user.id, 1);
      setSuccessMessage(result.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <form onSubmit={onFileUpload} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Submit Assignment</h1>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Assignment File</span>
          <input
            type="file"
            onChange={onFileChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>

        {selectedFile ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p><span className="font-medium">File:</span> {selectedFile.name}</p>
            <p><span className="font-medium">Type:</span> {selectedFile.type || "Unknown"}</p>
          </div>
        ) : null}

        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

        <button
          type="submit"
          disabled={isUploading}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {isUploading ? "Uploading..." : "Upload Submission"}
        </button>
      </form>
    </div>
  );
};

export default Uploader
