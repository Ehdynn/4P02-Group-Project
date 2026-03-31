import { useEffect, useState } from "react";
import { getBoilerPlateUploads } from "../../utils/DatabaseInteractions/Instructor/getBoilerPlateUploads";
import { uploadBoilerPlateCode } from "../../utils/DatabaseInteractions/Instructor/uploadBoilerPlateCode";
import { getRepositories } from "../../utils/DatabaseInteractions/Instructor/getRepositories";
import { uploadRepository } from "../../utils/DatabaseInteractions/Instructor/uploadRepository";

const defaultMode = "none";

function formatUploadLabel(upload, index) {
  const fileName = String(upload?.file_name ?? "").trim() || `Upload ${index + 1}`;
  const timestamp = upload?.created_at
    ? new Date(upload.created_at).toLocaleString()
    : "Unknown upload time";

  return `${fileName} (${timestamp})`;
}

function formatRepositoryLabel(repository, index) {
  const repositoryName = String(repository?.repository_name ?? "").trim() || `Repository ${index + 1}`;
  const timestamp = repository?.created_at
    ? new Date(repository.created_at).toLocaleString()
    : "Unknown upload time";

  return `${repositoryName} (${timestamp})`;
}

const ComparisonModal = ({
  aid,
  isOpen,
  onClose,
  onRunComparison,
}) => {
  const [mode, setMode] = useState(defaultMode);
  const [uploads, setUploads] = useState([]);
  const [selectedUploadId, setSelectedUploadId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [repositoryMode, setRepositoryMode] = useState(defaultMode);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState("");
  const [selectedRepositoryFile, setSelectedRepositoryFile] = useState(null);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !aid) {
      return;
    }

    let cancelled = false;

    async function loadUploads() {
      try {
        setLoadingUploads(true);
        setLoadingRepositories(true);
        setError("");
        const [rows, repositoryRows] = await Promise.all([
          getBoilerPlateUploads(aid),
          getRepositories(aid),
        ]);

        if (!cancelled) {
          setUploads(rows);
          setSelectedUploadId(rows[0]?.id ?? "");
          setMode(rows.length > 0 ? "existing" : defaultMode);
          setRepositories(repositoryRows);
          setSelectedRepositoryId(repositoryRows[0]?.id ?? "");
          setRepositoryMode(repositoryRows.length > 0 ? "existing" : defaultMode);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load comparison resources.";
          setError(message);
          setUploads([]);
          setSelectedUploadId("");
          setMode(defaultMode);
          setRepositories([]);
          setSelectedRepositoryId("");
          setRepositoryMode(defaultMode);
        }
      } finally {
        if (!cancelled) {
          setLoadingUploads(false);
          setLoadingRepositories(false);
        }
      }
    }

    loadUploads();

    return () => {
      cancelled = true;
    };
  }, [aid, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      let boilerPlateFileId = null;
      let repositoryId = null;

      if (mode === "existing") {
        if (!selectedUploadId) {
          throw new Error("Please select a previously uploaded boiler plate file.");
        }
        boilerPlateFileId = selectedUploadId;
      }

      if (mode === "new") {
        const upload = await uploadBoilerPlateCode(aid, selectedFile);
        boilerPlateFileId = upload.id;
      }

      if (repositoryMode === "existing") {
        if (!selectedRepositoryId) {
          throw new Error("Please select a previously uploaded repository.");
        }
        repositoryId = selectedRepositoryId;
      }

      if (repositoryMode === "new") {
        const repositoryUpload = await uploadRepository(aid, selectedRepositoryFile);
        repositoryId = repositoryUpload.id;
      }

      await onRunComparison(boilerPlateFileId, repositoryId);
      setSelectedFile(null);
      setSelectedRepositoryFile(null);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to run comparison.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="h2-large">Run Similarity Comparison</h2>
            <p className="mt-1 text-sm text-slate-600">
              Choose existing boiler plate code, upload a new file, or continue without one.
            </p>
          </div>
          <button
            type="button"
            className="rounded border px-3 py-2"
            onClick={onClose}
            disabled={submitting}
          >
            Close
          </button>
        </div>

        {error ? <p className="error mt-4">{error}</p> : null}

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block font-medium text-slate-700">Boiler plate source</span>
            <select
              className="input-default"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              disabled={submitting || loadingUploads || loadingRepositories}
            >
              <option value="none">No boiler plate code</option>
              <option value="existing" disabled={uploads.length === 0}>Use a previous upload</option>
              <option value="new">Upload new boiler plate code</option>
            </select>
          </label>

          {mode === "existing" ? (
            <label className="block">
              <span className="mb-1 block font-medium text-slate-700">Previous uploads</span>
              <select
                className="input-default"
                value={selectedUploadId}
                onChange={(event) => setSelectedUploadId(event.target.value)}
                disabled={submitting || loadingUploads || uploads.length === 0}
              >
                <option value="">Select a boiler plate upload</option>
                {uploads.map((upload, index) => (
                  <option key={upload.id} value={upload.id}>
                    {formatUploadLabel(upload, index)}
                  </option>
                ))}
              </select>
              {loadingUploads ? <p className="mt-2 text-sm text-slate-500">Loading uploads...</p> : null}
              {!loadingUploads && uploads.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No previous boiler plate uploads found.</p>
              ) : null}
            </label>
          ) : null}

          {mode === "new" ? (
            <label className="block">
              <span className="mb-1 block font-medium text-slate-700">Upload file</span>
              <input
                type="file"
                className="input-default"
                accept=".py,.cpp,.java,.c,.txt"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                disabled={submitting}
              />
              <p className="mt-2 text-sm text-slate-500">
                Accepted formats: `.txt`, `.py`, `.cpp`, `.java`, `.c`
              </p>
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1 block font-medium text-slate-700">Repository source</span>
            <select
              className="input-default"
              value={repositoryMode}
              onChange={(event) => setRepositoryMode(event.target.value)}
              disabled={submitting || loadingUploads || loadingRepositories}
            >
              <option value="none">No repository</option>
              <option value="existing" disabled={repositories.length === 0}>Use a previous repository</option>
              <option value="new">Upload new repository</option>
            </select>
          </label>

          {repositoryMode === "existing" ? (
            <label className="block">
              <span className="mb-1 block font-medium text-slate-700">Previous repositories</span>
              <select
                className="input-default"
                value={selectedRepositoryId}
                onChange={(event) => setSelectedRepositoryId(event.target.value)}
                disabled={submitting || loadingRepositories || repositories.length === 0}
              >
                <option value="">Select a repository</option>
                {repositories.map((repository, index) => (
                  <option key={repository.id} value={repository.id}>
                    {formatRepositoryLabel(repository, index)}
                  </option>
                ))}
              </select>
              {loadingRepositories ? <p className="mt-2 text-sm text-slate-500">Loading repositories...</p> : null}
              {!loadingRepositories && repositories.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No previous repositories found.</p>
              ) : null}
            </label>
          ) : null}

          {repositoryMode === "new" ? (
            <label className="block">
              <span className="mb-1 block font-medium text-slate-700">Upload repository</span>
              <input
                type="file"
                className="input-default"
                accept=".zip"
                onChange={(event) => setSelectedRepositoryFile(event.target.files?.[0] ?? null)}
                disabled={submitting}
              />
              <p className="mt-2 text-sm text-slate-500">
                Accepted format: `.zip`
              </p>
            </label>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded border px-4 py-2"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="submit-button"
            onClick={handleSubmit}
            disabled={submitting || loadingUploads || loadingRepositories}
          >
            {submitting ? "Starting Comparison..." : "Run Comparison"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
