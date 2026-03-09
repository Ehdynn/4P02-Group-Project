import { useState } from "react";
import { submitAssignment } from "../../utils/DatabaseInteractions/Student/submitAssignment";
import useUser from "../../context/useUser";

const Uploader = ({aid}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [badFileType, setBadFileType] = useState(false);
  const { user } = useUser();
  const supportedTypes = ["application/pdf", "application/py", "application/x-zip-compressed","application/cpp", "application/java"];
  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
     if (supportedTypes.includes(event.target.files[0].type)) {
        setBadFileType(false);

     }
     else{
      setBadFileType(true);
     } 
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
      const result = await submitAssignment(selectedFile, user.id, aid);
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
