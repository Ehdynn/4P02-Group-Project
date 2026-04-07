import { useState, useEffect } from "react";
import { useParams, useNavigate} from "react-router-dom";

import { useLoadInstructorAssignment } from "./hooks/useLoadInstructorAssignment";
import { useUpdateAssignment } from "./hooks/useUpdateAssignment";
import AssignmentDetails from "./AssignmentDetails";
import ComparisonModal from "./ComparisonModal";
import UpdateForm from "./UpdateForm";
import PageNotFound from "../../Pages/PageNotFound";
import { checkForComparison } from "../../utils/DatabaseInteractions/Instructor/checkForComparison";
import { createComparison } from "../../utils/DatabaseInteractions/Instructor/createComparison";
import { getBoilerPlateUploads } from "../../utils/DatabaseInteractions/Instructor/getBoilerPlateUploads";
import { getNumberOfSubmissions } from "../../utils/DatabaseInteractions/Instructor/getNumberOfSubmissions";
import { getRepositories } from "../../utils/DatabaseInteractions/Instructor/getRepositories";
import { uploadBoilerPlateCode } from "../../utils/DatabaseInteractions/Instructor/uploadBoilerPlateCode";
import { uploadRepository } from "../../utils/DatabaseInteractions/Instructor/uploadRepository";
import { downloadExport } from "../../utils/DatabaseInteractions/Instructor/downloadExport";

function formatTimestamp(value) {
  return value ? new Date(value).toLocaleString() : "Unknown upload time";
}

function formatSelectedFile(file, fallbackText) {
  return String(file?.name ?? "").trim() || fallbackText;
}

const InstructorAssignment = () => {
  const navigate = useNavigate();
  const { aid } = useParams();
  const [comparisonAvailable, setComparisonAvailable] = useState(false);
  const [comparisonError, setComparisonError] = useState("");
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [submissionCounts, setSubmissionCounts] = useState({
    submissionCount: 0,
    uniqueStudentSubmissionCount: 0,
  });
  const [submissionError, setSubmissionError] = useState("");
  const [downloadingExport, setDownloadingExport] = useState(false);
  const [boilerPlateUploads, setBoilerPlateUploads] = useState([]);
  const [boilerPlateError, setBoilerPlateError] = useState("");
  const [boilerPlateFile, setBoilerPlateFile] = useState(null);
  const [uploadingBoilerPlate, setUploadingBoilerPlate] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [repositoryError, setRepositoryError] = useState("");
  const [repositoryFile, setRepositoryFile] = useState(null);
  const [uploadingRepository, setUploadingRepository] = useState(false);
  const [formData, setFormData] = useState({
        name: "",
        dueDate: "",
        description: "",
      });

  const {details, setDetails, loading, error, notFound} = useLoadInstructorAssignment(aid, setFormData);
  const {onChange, handleSubmit, submitted, loadingUpdate, updateError} = useUpdateAssignment(aid, formData, setFormData, setDetails);
  
  useEffect(() => {
    let cancelled = false;

    async function loadSubmissionCounts() {
      try {
        const counts = await getNumberOfSubmissions(aid);
        if (!cancelled) {
          setSubmissionCounts(counts);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load submission counts.";
          setSubmissionError(message);
        }
      }
    }

    async function loadBoilerPlateUploads() {
      try {
        const rows = await getBoilerPlateUploads(aid);
        if (!cancelled) {
          setBoilerPlateUploads(rows);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load boiler plate uploads.";
          setBoilerPlateError(message);
        }
      }
    }

    async function loadRepositories() {
      try {
        const rows = await getRepositories(aid);
        if (!cancelled) {
          setRepositories(rows);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load repositories.";
          setRepositoryError(message);
        }
      }
    }

    async function checkComparisonStatus() {
      try {
        const data = await checkForComparison(aid);
        if (!cancelled) {
          setComparisonAvailable(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to check comparison status.";
          setComparisonError(message);
        }
      }
    }

    loadSubmissionCounts();
    loadBoilerPlateUploads();
    loadRepositories();
    checkComparisonStatus();
    return () => {
      cancelled = true;
    };
  }, [aid]);

  const handleCreateComparison = async (boilerPlateFileId = null, repositoryId = null) => {
    try {
      setComparisonError("");
      await createComparison(aid, boilerPlateFileId, repositoryId);
      setComparisonAvailable(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create comparison.";
      setComparisonError(message);
      throw err;
    }
  };

  const handleUploadBoilerPlate = async () => {
    try {
      setUploadingBoilerPlate(true);
      setBoilerPlateError("");
      const upload = await uploadBoilerPlateCode(aid, boilerPlateFile);
      setBoilerPlateUploads((current) => [upload, ...current]);
      setBoilerPlateFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload boiler plate code.";
      setBoilerPlateError(message);
    } finally {
      setUploadingBoilerPlate(false);
    }
  };

  const handleUploadRepository = async () => {
    try {
      setUploadingRepository(true);
      setRepositoryError("");
      const upload = await uploadRepository(aid, repositoryFile);
      setRepositories((current) => [upload, ...current]);
      setRepositoryFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload repository.";
      setRepositoryError(message);
    } finally {
      setUploadingRepository(false);
    }
  };

  const handleDownloadExport = async () => {
    try {
      setDownloadingExport(true);
      setSubmissionError("");
      await downloadExport(aid);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to export submissions.";
      setSubmissionError(message);
    } finally {
      setDownloadingExport(false);
    }
  };


  if (loading) {return <div>Loading assignment...</div>;}

  if (error && notFound) { return <PageNotFound />; }

  if (error) { return <div>{error}</div>; }

  if (!details) {return <PageNotFound />;}

  return (
    <main className="center-box outer-container">
      <div className="box-wrapper">
        <AssignmentDetails details={details} />
      </div>
      <div className="flex w-full space-x-5 flex-col md:flex-row">
        <div className="flex-1 min-w-0">
          <div className="box-wrapper">
            <h2 className="h2-large">Submission Counts</h2>
            {submissionError ? <p className="error">{submissionError}</p> : null}
            <p>Submissions: {submissionCounts.submissionCount}</p>
            <p>Unique Student Submissions: {submissionCounts.uniqueStudentSubmissionCount}</p>
            <button
              className="submit-button mt-3"
              onClick={handleDownloadExport}
              disabled={downloadingExport || submissionCounts.uniqueStudentSubmissionCount === 0}
            >
              {downloadingExport ? "Preparing Export..." : "Download Latest Submission Export"}
            </button>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="box-wrapper">
            <h2 className="h2-large">Similarity Comparison</h2>
            {comparisonError ? <p className="error">{comparisonError}</p> : null}
            <button className="submit-button"
                    onClick={() => setComparisonModalOpen(true)}>
              {!comparisonAvailable ? "Run Similarity Comparison" : "Run Similarity Comparison Again"}
            </button>
            {comparisonAvailable ? 
              <button className="submit-button"
                      onClick={() => navigate(`/Comparison/${aid}`)}
              >View Results</button>
            : null}
         </div>
        </div>
      </div>
      <div className="flex w-full space-x-5 flex-col md:flex-row">
        <div className="flex-1 min-w-0">
          <div className="box-wrapper">
            <h2 className="h2-large">Boiler Plate Code</h2>
            {boilerPlateError ? <p className="error">{boilerPlateError}</p> : null}
            <label className="mt-3 block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 transition hover:border-slate-500 hover:bg-slate-100">
              <span className="block text-sm font-semibold text-slate-800">Choose Boiler Plate File</span>
              <span className="mt-1 block text-sm text-slate-500">
                {formatSelectedFile(boilerPlateFile, "No file selected")}
              </span>
              <input
                type="file"
                className="mt-3 block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-slate-700"
                accept=".py,.cpp,.java,.c,.txt"
                onChange={(event) => setBoilerPlateFile(event.target.files?.[0] ?? null)}
                disabled={uploadingBoilerPlate}
              />
            </label>
            <p className="mt-2 text-sm text-slate-500">
              Accepted formats: `.txt`, `.py`, `.cpp`, `.java`, `.c`
            </p>
            <button
              className="submit-button mt-3"
              onClick={handleUploadBoilerPlate}
              disabled={uploadingBoilerPlate || !boilerPlateFile}
            >
              {uploadingBoilerPlate ? "Uploading..." : "Upload Boiler Plate"}
            </button>
            <div className="mt-4">
              <h3 className="font-semibold">Uploaded Boiler Plate Files</h3>
              {boilerPlateUploads.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No boiler plate files uploaded yet.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {boilerPlateUploads.map((upload) => (
                    <li key={upload.id} className="rounded border border-slate-200 px-3 py-2">
                      <p className="font-medium">{upload.file_name}</p>
                      <p className="text-xs text-slate-500">{formatTimestamp(upload.created_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="box-wrapper">
            <h2 className="h2-large">Repositories</h2>
            {repositoryError ? <p className="error">{repositoryError}</p> : null}
            <label className="mt-3 block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 transition hover:border-slate-500 hover:bg-slate-100">
              <span className="block text-sm font-semibold text-slate-800">Choose Repository File</span>
              <span className="mt-1 block text-sm text-slate-500">
                {formatSelectedFile(repositoryFile, "No file selected")}
              </span>
              <input
                type="file"
                className="mt-3 block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-slate-700"
                accept=".zip"
                onChange={(event) => setRepositoryFile(event.target.files?.[0] ?? null)}
                disabled={uploadingRepository}
              />
            </label>
            <p className="mt-2 text-sm text-slate-500">
              Accepted format: `.zip`
            </p>
            <button
              className="submit-button mt-3"
              onClick={handleUploadRepository}
              disabled={uploadingRepository || !repositoryFile}
            >
              {uploadingRepository ? "Uploading..." : "Upload Repository"}
            </button>
            <div className="mt-4">
              <h3 className="font-semibold">Uploaded Repositories</h3>
              {repositories.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No repositories uploaded yet.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {repositories.map((repository) => (
                    <li key={repository.id} className="rounded border border-slate-200 px-3 py-2">
                      <p className="font-medium">{repository.repository_name}</p>
                      <p className="text-xs text-slate-500">{formatTimestamp(repository.created_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <ComparisonModal
        aid={aid}
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        onRunComparison={handleCreateComparison}
      />
      <div className="box-wrapper">
        <UpdateForm 
          handleSubmit={handleSubmit}
          formData={formData}
          onChange={onChange}
          updateError={updateError}
          submitted={submitted}
          loadingUpdate={loadingUpdate}
        />
      </div>
    </main>
  );
};

export default InstructorAssignment;
