import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ComparisonList from "../../Components/Comparison/ComparisonList";
import ComparisonViewer from "../../Components/Comparison/ComparisonViewer";
import ComparisonStats from "../../Components/Comparison/ComparisonStats";
import Viewer from "../../Components/Comparison/Viewer";
import { getComparisons } from "../../utils/DatabaseInteractions/Instructor/getComparisons";
import { getComparisonOutputs } from "../../utils/DatabaseInteractions/Instructor/getComparisonOutputs";
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
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [outputsLoading, setOutputsLoading] = useState(false);
  const [outputsError, setOutputsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    let cancelled = false;

    async function loadComparisonOutputs() {
      if (!selectedComparison?.id) {
        setComparisonOutputs([]);
        setSelectedSubmissionId(null);
        setOutputsError("");
        setOutputsLoading(false);
        return;
      }

      try {
        setOutputsLoading(true);
        setOutputsError("");
        const outputs = await getComparisonOutputs(selectedComparison.id, aid, assignmentKey);

        if (!cancelled) {
          setComparisonOutputs(outputs);
          setSelectedSubmissionId((currentSelectedId) => {
            if (currentSelectedId && outputs.some((output) => output.submissionId === currentSelectedId)) {
              return currentSelectedId;
            }

            return null;
          });
        }
      } catch (err) {
        if (!cancelled) {
          setComparisonOutputs([]);
          setSelectedSubmissionId(null);
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
  }, [aid, assignmentKey, selectedComparison?.id]);

  const selectedOutput = comparisonOutputs.find((output) => output.submissionId === selectedSubmissionId)
    ?? null;

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
            onSelectSubmission={setSelectedSubmissionId}
          />
          {outputsLoading ? <div className="box-wrapper">Loading comparison output files...</div> : null}
          {outputsError ? <p className="error">{outputsError}</p> : null}
          {!outputsLoading && !outputsError && comparisonOutputs.length === 0 && selectedComparison ? (
            <div className="box-wrapper">No comparison JSON files found for this run.</div>
          ) : null}
          {selectedOutput ? (
            <div key={selectedOutput.path} className="mt-6">
              <Viewer
                data={selectedOutput.data}
                title={`${selectedOutput.studentName} (${selectedOutput.studentNumber})`}
                onSelectSubmission={setSelectedSubmissionId}
              />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default Comparison
