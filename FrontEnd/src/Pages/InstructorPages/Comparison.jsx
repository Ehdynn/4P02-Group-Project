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
  const [secondarySelected, setSecondarySelected] = useState(null);
  const [secondaryNavigationTarget, setSecondaryNavigationTarget] = useState(null);
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
        setSecondarySelected(null);
        setSecondaryNavigationTarget(null);
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
  }, [aid, assignmentKey, selectedComparison?.id]);

  // Primary Output
  const selectedOutput = comparisonOutputs.find((output) => output.submissionId === selectedSubmissionId) ?? null;
  
  // Secondary output
  const secondaryOutput = comparisonOutputs.find((output) => output.submissionId === secondarySelected) ?? null;

  // Allows both the primary and secondary to be set at the same time,
  // Or just the primary if no secondary is provided. At which point the secondary is set to null.
  // If no secondary is given it closes the side by side view if it is open
  function selectSubmission(submissionId, secondaryId, navigationTarget = null){
    if(submissionId){
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

  // Swaps the secondary to the RHS and opens the new secondary on the LHS
  function selectSubmissionFromSecondary(newSecondary, navigationTarget = null){
    if(newSecondary){
      setSelectedSubmissionId(secondarySelected);
      setSecondarySelected(newSecondary);
      setSecondaryNavigationTarget(navigationTarget);
    }
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
          {!outputsLoading && !outputsError && comparisonOutputs.length === 0 && selectedComparison ? (
            <div className="box-wrapper">No comparison JSON files found for this run.</div>
          ) : null}
          {selectedOutput ? ( // A Submission is Selected
            !secondarySelected ? ( // Only One is Selected
              <div key={selectedOutput.path} className="mt-6">
                <Viewer
                  data={selectedOutput.data}
                  title={`${selectedOutput.studentName} (${selectedOutput.studentNumber})`}
                  onSelectSubmission={(submissionId, navigationTarget) => {
                    setSecondarySelected(submissionId);
                    setSecondaryNavigationTarget(navigationTarget);
                  }}
                />
              </div>
            ) : ( // Side by side view
              <div className="flex w-full space-x-5 flex-col md:flex-row">
                <div className="flex-1 min-w-0"> {/* RHS */}
                  <div key={selectedOutput.path} className="mt-6">
                    <Viewer
                      data={selectedOutput.data}
                      title={`${selectedOutput.studentName} (${selectedOutput.studentNumber})`}
                      onSelectSubmission={(submissionId, navigationTarget) => {
                        setSecondarySelected(submissionId);
                        setSecondaryNavigationTarget(navigationTarget);
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0"> {/* LHS */}
                  <div key={selectedOutput.path} className="mt-6">
                    <Viewer
                      data={secondaryOutput.data}
                      title={`${secondaryOutput.studentName} (${secondaryOutput.studentNumber})`}
                      navigationTarget={secondaryNavigationTarget}
                      onSelectSubmission={selectSubmissionFromSecondary}
                    />
                  </div>
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default Comparison
