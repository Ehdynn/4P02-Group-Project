import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ComparisonList from "../../Components/Comparison/ComparisonList";
import ComparisonViewer from "../../Components/Comparison/ComparisonViewer";
import ComparisonStats from "../../Components/Comparison/ComparisonStats";
import Viewer from "../../Components/Comparison/Viewer";
import { getComparisons } from "../../utils/DatabaseInteractions/Instructor/getComparisons";
import {
  getComparisonOutputData,
  getComparisonOutputs,
} from "../../utils/DatabaseInteractions/Instructor/getComparisonOutputs";
import getAssignmentDetails from "../../utils/DatabaseInteractions/Instructor/getAssignmentDetails";
import useUser from "../../context/useUser";

const Comparison = () => {
  const { aid } = useParams();
  const { user } = useUser();
  const [comparisons, setComparisons] = useState([]);
  const [selectedComparisonId, setSelectedComparisonId] = useState(null);
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentKey, setAssignmentKey] = useState("");
  const [comparisonOutputs, setComparisonOutputs] = useState([]);
  const [outputDataByPath, setOutputDataByPath] = useState({});
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [secondarySelected, setSecondarySelected] = useState(null);
  const [secondaryNavigationTarget, setSecondaryNavigationTarget] = useState(null);
  const [outputsLoading, setOutputsLoading] = useState(false);
  const [outputsError, setOutputsError] = useState("");
  const [selectedOutputLoading, setSelectedOutputLoading] = useState(false);
  const [selectedOutputError, setSelectedOutputError] = useState("");
  const [secondaryOutputLoading, setSecondaryOutputLoading] = useState(false);
  const [secondaryOutputError, setSecondaryOutputError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const viewerSectionRef = useRef(null);
  const shouldScrollToViewerRef = useRef(false);

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
        const resolvedComparisons = comparisonRows ?? [];

        if (!cancelled) {
          setAssignmentName(resolvedAssignmentName);
          setAssignmentKey(String(assignmentDetails?.key ?? "").trim());
          setComparisons(Array.isArray(resolvedComparisons) ? resolvedComparisons : []);
          setSelectedComparisonId((currentSelectedId) => {
            if (
              currentSelectedId &&
              Array.isArray(resolvedComparisons) &&
              resolvedComparisons.some((comparison) => comparison.id === currentSelectedId)
            ) {
              return currentSelectedId;
            }

            return resolvedComparisons?.[0]?.id ?? null;
          });
        }
      } catch (err) {
        if (!cancelled) {
          setAssignmentName("");
          setAssignmentKey("");
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
  const isSelectedComparisonCompleted = String(selectedComparison?.status ?? "").toLowerCase() === "completed";

  const selectedOutput = comparisonOutputs.find((output) => output.submissionId === selectedSubmissionId) ?? null;
  const secondaryOutput = comparisonOutputs.find((output) => output.submissionId === secondarySelected) ?? null;
  const selectedOutputData = selectedOutput ? outputDataByPath[selectedOutput.path] ?? null : null;
  const secondaryOutputData = secondaryOutput ? outputDataByPath[secondaryOutput.path] ?? null : null;

  useEffect(() => {
    if (!shouldScrollToViewerRef.current || !selectedOutput) {
      return;
    }

    viewerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    shouldScrollToViewerRef.current = false;
  }, [selectedOutput, secondarySelected]);

  useEffect(() => {
    let cancelled = false;

    async function loadComparisonOutputs() {
      if (!selectedComparison?.id || !isSelectedComparisonCompleted) {
        setComparisonOutputs([]);
        setOutputDataByPath({});
        setSelectedSubmissionId(null);
        setSecondarySelected(null);
        setSecondaryNavigationTarget(null);
        setOutputsError("");
        setOutputsLoading(false);
        setSelectedOutputLoading(false);
        setSelectedOutputError("");
        setSecondaryOutputLoading(false);
        setSecondaryOutputError("");
        return;
      }

      try {
        setOutputsLoading(true);
        setOutputsError("");
        const outputs = await getComparisonOutputs(selectedComparison, aid, assignmentKey);

        if (!cancelled) {
          setComparisonOutputs(outputs);
          setOutputDataByPath({});
          setSelectedSubmissionId((currentSelectedId) => {
            if (currentSelectedId && outputs.some((output) => output.submissionId === currentSelectedId)) {
              return currentSelectedId;
            }

            return null;
          });
          setSecondarySelected((currentSecondaryId) => (
            currentSecondaryId && outputs.some((output) => output.submissionId === currentSecondaryId)
              ? currentSecondaryId
              : null
          ));
          setSecondaryNavigationTarget((currentTarget) => (
            currentTarget && outputs.some((output) => output.submissionId === currentTarget.submissionId)
              ? currentTarget
              : null
          ));
        }
      } catch (err) {
        if (!cancelled) {
          setComparisonOutputs([]);
          setOutputDataByPath({});
          setSelectedSubmissionId(null);
          setSecondarySelected(null);
          setSecondaryNavigationTarget(null);
          setOutputsError(err instanceof Error ? err.message : "Failed to load comparison output files.");
        }
      } finally {
        if (!cancelled) {
          setOutputsLoading(false);
        }
      }
    }

    loadComparisonOutputs();
    return () => {
      cancelled = true;
    };
  }, [aid, assignmentKey, isSelectedComparisonCompleted, selectedComparison?.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadSelectedOutputData() {
      if (!selectedOutput?.path) {
        setSelectedOutputLoading(false);
        setSelectedOutputError("");
        return;
      }

      if (outputDataByPath[selectedOutput.path]) {
        setSelectedOutputLoading(false);
        setSelectedOutputError("");
        return;
      }

      try {
        setSelectedOutputLoading(true);
        setSelectedOutputError("");
        const outputData = await getComparisonOutputData(selectedOutput.path);

        if (!cancelled) {
          setOutputDataByPath((current) => (
            current[selectedOutput.path]
              ? current
              : { ...current, [selectedOutput.path]: outputData }
          ));
        }
      } catch (err) {
        if (!cancelled) {
          setSelectedOutputError(err instanceof Error ? err.message : "Failed to load comparison output.");
        }
      } finally {
        if (!cancelled) {
          setSelectedOutputLoading(false);
        }
      }
    }

    loadSelectedOutputData();
    return () => {
      cancelled = true;
    };
  }, [outputDataByPath, selectedOutput?.path]);

  useEffect(() => {
    let cancelled = false;

    async function loadSecondaryOutputData() {
      if (!secondaryOutput?.path) {
        setSecondaryOutputLoading(false);
        setSecondaryOutputError("");
        return;
      }

      if (outputDataByPath[secondaryOutput.path]) {
        setSecondaryOutputLoading(false);
        setSecondaryOutputError("");
        return;
      }

      try {
        setSecondaryOutputLoading(true);
        setSecondaryOutputError("");
        const outputData = await getComparisonOutputData(secondaryOutput.path);

        if (!cancelled) {
          setOutputDataByPath((current) => (
            current[secondaryOutput.path]
              ? current
              : { ...current, [secondaryOutput.path]: outputData }
          ));
        }
      } catch (err) {
        if (!cancelled) {
          setSecondaryOutputError(err instanceof Error ? err.message : "Failed to load comparison output.");
        }
      } finally {
        if (!cancelled) {
          setSecondaryOutputLoading(false);
        }
      }
    }

    loadSecondaryOutputData();
    return () => {
      cancelled = true;
    };
  }, [outputDataByPath, secondaryOutput?.path]);

  function selectSubmission(submissionId, secondaryId, navigationTarget = null){
    if(submissionId){
      shouldScrollToViewerRef.current = true;
      setSelectedSubmissionId(submissionId);
      if(secondaryId){
        setSecondarySelected(secondaryId);
        setSecondaryNavigationTarget(navigationTarget);
      } else{setSecondarySelected(null);}
      if (!secondaryId) {
        setSecondaryNavigationTarget(null);
      }
    }
  }

  function selectSubmissionFromSecondary(newSecondary, navigationTarget = null){
    if(newSecondary){
      shouldScrollToViewerRef.current = true;
      setSelectedSubmissionId(secondarySelected);
      setSecondarySelected(newSecondary);
      setSecondaryNavigationTarget(navigationTarget);
    }
  }

  function closePrimaryViewer() {
    if (secondarySelected) {
      setSelectedSubmissionId(secondarySelected);
      setSecondarySelected(null);
      setSecondaryNavigationTarget(null);
      return;
    }

    setSelectedSubmissionId(null);
    setSecondarySelected(null);
    setSecondaryNavigationTarget(null);
  }

  function closeSecondaryViewer() {
    setSecondarySelected(null);
    setSecondaryNavigationTarget(null);
  }

  function openSecondaryViewer(submissionId, navigationTarget) {
    setSecondarySelected(submissionId);
    setSecondaryNavigationTarget(navigationTarget);
  }

  function clearSecondaryNavigationTarget() {
    setSecondaryNavigationTarget(null);
  }

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
          <ComparisonViewer
            comparison={selectedComparison}
            loading={loading}
            outputs={comparisonOutputs}
            selectedSubmissionId={selectedOutput?.submissionId ?? null}
            onSelectSubmission={selectSubmission}
          />
          {outputsLoading ? <div className="box-wrapper">Loading comparison output files...</div> : null}
          {outputsError ? <p className="error">{outputsError}</p> : null}
          {!outputsLoading && !outputsError && selectedComparison && !isSelectedComparisonCompleted ? (
            <div className="box-wrapper">Comparison output files are available after the run is completed.</div>
          ) : null}
          {!outputsLoading && !outputsError && comparisonOutputs.length === 0 && selectedComparison && isSelectedComparisonCompleted ? (
            <div className="box-wrapper">No comparison JSON files found for this run.</div>
          ) : null}
          {selectedOutput ? (
            <div ref={viewerSectionRef}>
              {!secondarySelected ? (
                <div key={selectedOutput.path} className="mt-6">
                  {selectedOutputLoading ? (
                    <div className="box-wrapper">Loading selected submission...</div>
                  ) : selectedOutputError ? (
                    <p className="error">{selectedOutputError}</p>
                  ) : selectedOutputData ? (
                    <Viewer
                      data={selectedOutputData}
                      title={`${selectedOutput.studentName} (${selectedOutput.studentNumber})`}
                      sourceLabel={selectedOutput.sourceLabel}
                      onClose={closePrimaryViewer}
                      onSelectSubmission={openSecondaryViewer}
                    />
                  ) : null}
                </div>
              ) : (
                <div className="flex w-full space-x-5 flex-col md:flex-row">
                  <div className="flex-1 min-w-0">
                    <div key={selectedOutput.path} className="mt-6">
                      {selectedOutputLoading ? (
                        <div className="box-wrapper">Loading selected submission...</div>
                      ) : selectedOutputError ? (
                        <p className="error">{selectedOutputError}</p>
                      ) : selectedOutputData ? (
                        <Viewer
                          data={selectedOutputData}
                          title={`${selectedOutput.studentName} (${selectedOutput.studentNumber})`}
                          sourceLabel={selectedOutput.sourceLabel}
                          onClose={closePrimaryViewer}
                          onSelectSubmission={openSecondaryViewer}
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div key={secondaryOutput?.path ?? secondaryOutput?.submissionId} className="mt-6">
                      {secondaryOutputLoading ? (
                        <div className="box-wrapper">Loading matching submission...</div>
                      ) : secondaryOutputError ? (
                        <p className="error">{secondaryOutputError}</p>
                      ) : secondaryOutputData ? (
                        <Viewer
                          data={secondaryOutputData}
                          title={`${secondaryOutput.studentName} (${secondaryOutput.studentNumber})`}
                          sourceLabel={secondaryOutput.sourceLabel}
                          navigationTarget={secondaryNavigationTarget}
                          onClose={closeSecondaryViewer}
                          onSelectSubmission={selectSubmissionFromSecondary}
                          onClearNavigationTarget={clearSecondaryNavigationTarget}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default Comparison
