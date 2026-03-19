import { useState } from "react";
import { submitAssignment } from "../../utils/DatabaseInteractions/Student/submitAssignment";
import useUser from "../../context/useUser";

const Uploader = ({ aid, assignmentKey }) => {
  const supportedExtensions = [".pdf", ".zip", ".py", ".cpp", ".java"];
  const [selectedFile, setSelectedFile] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [badFileType, setBadFileType] = useState(false);
  const { user } = useUser();

  const hasSupportedExtension = (file) => {
    const fileName = String(file?.name ?? "").toLowerCase();
    return supportedExtensions.some((extension) => fileName.endsWith(extension));
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setBadFileType(file ? !hasSupportedExtension(file) : false);
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
    if (!studentName.trim() || !studentNumber.trim()) {
      setErrorMessage("Please enter your student name and number before uploading.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await submitAssignment(
        selectedFile,
        studentName.trim(),
        studentNumber,
        aid,
        assignmentKey,
      );
      setSuccessMessage(result.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="outer-container">
      <form onSubmit={onFileUpload} className="box-wrapper">
        <h1 className="h1-default">Submit Assignment</h1>
        <label className="label-default">
          <span className="span-default">Name</span>
           <input
            type="text"
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            placeholder="Enter your full name"
            className="field-default"
          />
        </label>
        <label className="label-default">
          <span className="span-default">Student Number</span>
          <input
            type="text"
            value={studentNumber}
            onChange={(event) => setStudentNumber(event.target.value)}
            placeholder="Enter your student number"
            className="field-default"
            inputMode="numeric"
          />
        </label>

        <label className="label-default">
          <span className="span-default">Assignment File</span>
          <input
            type="file"
            onChange={onFileChange}
            accept=".pdf,.zip,.py,.cpp,.java"
            className="field-default file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
          />
        </label>

        {selectedFile ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p><span className="font-medium">File:</span> {selectedFile.name}</p>
            <p><span className="font-medium">Type:</span> {selectedFile.type || "Unknown"}</p>
          </div>
        ) : null}

        {errorMessage ? <p className="error">{errorMessage}</p> : null}
        {successMessage ? <p className="success">{successMessage}</p> : null}
        {badFileType && (
        <p style={{ color: "red" }}>
          Unsupported file type. Please submit a .zip, .py, .cpp, .java or .pdf
        </p>
      )}
        <button
          type="submit"
          disabled={isUploading || badFileType}
          className="submit-button disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {isUploading ? "Uploading..." : "Upload Submission"}
        </button>
      </form>
    </div>
  );
};

export default Uploader
