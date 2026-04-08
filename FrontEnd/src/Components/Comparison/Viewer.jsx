import { useEffect, useRef, useState } from "react";

const noSpaceBefore = new Set([")", "]", "}", ",", ";", ".", ":"]);
const noSpaceAfter = new Set(["(", "[", "{", ".", "!", "~"]);
const highlightPalettes = [
  {
    text: "text-sky-100",
    bg: "bg-sky-400/30",
    button: "bg-sky-300 hover:bg-sky-200 text-slate-900",
    label: "text-sky-200",
  },
  {
    text: "text-rose-100",
    bg: "bg-rose-400/30",
    button: "bg-rose-300 hover:bg-rose-200 text-slate-900",
    label: "text-rose-200",
  },
  {
    text: "text-emerald-100",
    bg: "bg-emerald-400/30",
    button: "bg-emerald-300 hover:bg-emerald-200 text-slate-900",
    label: "text-emerald-200",
  },
  {
    text: "text-violet-100",
    bg: "bg-violet-400/30",
    button: "bg-violet-300 hover:bg-violet-200 text-slate-900",
    label: "text-violet-200",
  },
  {
    text: "text-orange-100",
    bg: "bg-orange-400/30",
    button: "bg-orange-300 hover:bg-orange-200 text-slate-900",
    label: "text-orange-200",
  },
  {
    text: "text-cyan-100",
    bg: "bg-cyan-400/30",
    button: "bg-cyan-300 hover:bg-cyan-200 text-slate-900",
    label: "text-cyan-200",
  },
];

const multipleMatchPalette = {
  text: "text-amber-100",
  bg: "bg-amber-400/30",
  button: "bg-amber-300 hover:bg-amber-200 text-slate-900",
  label: "text-amber-200",
};

const getPaletteIndex = (value) => {
  const normalized = String(value ?? "");
  let hash = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
  }

  return hash % highlightPalettes.length;
};

const getHighlightPalette = (highlightKey) => {
  if (highlightKey === "multipleMatches") {
    return multipleMatchPalette;
  }

  return highlightPalettes[getPaletteIndex(highlightKey)];
};

const getFlaggedTokenMap = (tokens, sequences) => {
  const flaggedMap = Array.from({ length: tokens.length }, () => null);

  sequences.forEach((sequence) => {
    for (
      let index = sequence.sequence_start;
      index < sequence.sequence_start + sequence.sequence_length;
      index += 1
    ) {
      if (flaggedMap[index] == null) {
        flaggedMap[index] = sequence.flagged_submission;
      } else if (flaggedMap[index] !== sequence.flagged_submission) {
        flaggedMap[index] = "multipleMatches";
      }
    }
  });

  return flaggedMap;
};

const parseFlaggedCode = (flaggedCode) => {
  if (!flaggedCode) {
    return [];
  }

  return String(flaggedCode)
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(",");
      if (separatorIndex === -1) {
        return null;
      }

      return {
        token_type: line.slice(0, separatorIndex).trim(),
        token_value: line.slice(separatorIndex + 1).trimStart(),
      };
    })
    .filter(Boolean);
};

const tokensMatch = (leftToken, rightToken) => {
  if (!leftToken || !rightToken) {
    return false;
  }

  return (
    String(leftToken.token_type ?? "") === String(rightToken.token_type ?? "") &&
    String(leftToken.token_value ?? "") === String(rightToken.token_value ?? "")
  );
};

const findMatchingSequenceStart = (tokens, sequenceTokens) => {
  if (!Array.isArray(tokens) || !Array.isArray(sequenceTokens) || sequenceTokens.length === 0) {
    return null;
  }

  for (let startIndex = 0; startIndex <= tokens.length - sequenceTokens.length; startIndex += 1) {
    let isMatch = true;

    for (let offset = 0; offset < sequenceTokens.length; offset += 1) {
      if (!tokensMatch(tokens[startIndex + offset], sequenceTokens[offset])) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      return startIndex;
    }
  }

  return null;
};

const buildFormattedCodeLines = (tokens) => {
  let indentLevel = 0;
  let currentLine = [];
  let lineText = "";
  const lines = [];

  const pushText = (text, tokenIndex = null) => {
    currentLine.push({ text, tokenIndex });
    lineText += text;
  };

  const pushLine = () => {
    if (lineText.length > 0) {
      lines.push(currentLine);
    }
    currentLine = [];
    lineText = "";
  };

  const ensureIndent = () => {
    if (lineText.length === 0) {
      pushText("  ".repeat(Math.max(indentLevel, 0)));
    }
  };

  const appendToken = (value, tokenIndex) => {
    const token = String(value);

    ensureIndent();

    const trimmedLine = lineText.trimEnd();
    const previousChar = trimmedLine.slice(-1);
    const needsSpace =
      trimmedLine.length > 0 &&
      previousChar &&
      !/\s/.test(previousChar) &&
      !noSpaceBefore.has(token) &&
      !noSpaceAfter.has(previousChar);

    if (needsSpace) {
      pushText(" ");
    }

    pushText(token, tokenIndex);
  };

  tokens.forEach((token, tokenIndex) => {
    const value = token.token_value;

    if (value === "{") {
      appendToken(value, tokenIndex);
      pushLine();
      indentLevel += 1;
      return;
    }

    if (value === "}") {
      pushLine();
      indentLevel = Math.max(indentLevel - 1, 0);
      appendToken(value, tokenIndex);
      pushLine();
      return;
    }

    appendToken(value, tokenIndex);

    if (value === ";") {
      pushLine();
    }
  });

  pushLine();
  return lines;
};

const getTargetLineIndex = (codeLines, startTokenIndex) => {
  if (startTokenIndex == null) {
    return null;
  }

  for (let lineIndex = 0; lineIndex < codeLines.length; lineIndex += 1) {
    const hasToken = codeLines[lineIndex].some((part) => part.tokenIndex === startTokenIndex);
    if (hasToken) {
      return lineIndex;
    }
  }

  return null;
};

const getTargetLineRange = (codeLines, startTokenIndex, sequenceLength) => {
  if (startTokenIndex == null || !sequenceLength) {
    return { start: null, end: null };
  }

  const endTokenIndex = startTokenIndex + sequenceLength - 1;
  let startLineIndex = null;
  let endLineIndex = null;

  for (let lineIndex = 0; lineIndex < codeLines.length; lineIndex += 1) {
    const tokenIndexes = codeLines[lineIndex]
      .map((part) => part.tokenIndex)
      .filter((tokenIndex) => tokenIndex != null);

    if (!tokenIndexes.length) {
      continue;
    }

    if (startLineIndex == null && tokenIndexes.some((tokenIndex) => tokenIndex === startTokenIndex)) {
      startLineIndex = lineIndex;
    }

    if (tokenIndexes.some((tokenIndex) => tokenIndex === endTokenIndex)) {
      endLineIndex = lineIndex;
      break;
    }
  }

  return { start: startLineIndex, end: endLineIndex };
};

const getMatchingSequence = (sequences, submissionId, tokenIndex) => {
  if (!Array.isArray(sequences) || tokenIndex == null) {
    return null;
  }

  return sequences.find((sequence) => (
    String(sequence.flagged_submission) === String(submissionId) &&
    tokenIndex >= sequence.sequence_start &&
    tokenIndex < sequence.sequence_start + sequence.sequence_length
  )) ?? null;
};

const findNavigationSequence = (sequences, navigationTarget) => {
  if (!Array.isArray(sequences) || !navigationTarget) {
    return null;
  }

  const targetSubmissionId = String(navigationTarget.sourceSubmissionId ?? "");
  const targetSequenceTokens = navigationTarget.sourceSequenceTokens ?? [];

  return sequences.find((sequence) => {
    if (String(sequence.flagged_submission) !== targetSubmissionId) {
      return false;
    }

    if (!targetSequenceTokens.length) {
      return true;
    }

    const flaggedTokens = parseFlaggedCode(sequence.flagged_code);
    if (flaggedTokens.length !== targetSequenceTokens.length) {
      return false;
    }

    return flaggedTokens.every((token, index) => tokensMatch(token, targetSequenceTokens[index]));
  }) ?? null;
};

const Viewer = ({
  data,
  title = "Comparison Output",
  sourceLabel = null,
  navigationTarget = null,
  onSelectSubmission,
  onClearNavigationTarget = null,
  onClose = null,
}) => {
  const flaggedTokenMap = getFlaggedTokenMap(data.tokens, data.similarity_sequences);
  const codeLines = buildFormattedCodeLines(data.tokens);
  const lineRefs = useRef([]);
  const viewerBodyRef = useRef(null);
  const [activePopup, setActivePopup] = useState(null);
  const targetSequenceTokens = navigationTarget?.sequenceTokens ?? [];
  const targetSequenceLength = targetSequenceTokens.length;
  const exactTargetSequenceStart = (
    navigationTarget &&
    String(navigationTarget.submissionId) === String(data.submission_id)
  )
    ? navigationTarget.targetSequenceStart
    : null;
  const exactTargetSequenceLength = (
    navigationTarget &&
    String(navigationTarget.submissionId) === String(data.submission_id)
  )
    ? navigationTarget.targetSequenceLength
    : null;
  const mirroredNavigationSequence = (
    navigationTarget &&
    String(navigationTarget.submissionId) === String(data.submission_id)
  )
    ? findNavigationSequence(data.similarity_sequences, navigationTarget)
    : null;
  const targetTokenStart = (
    navigationTarget &&
    String(navigationTarget.submissionId) === String(data.submission_id)
  )
    ? exactTargetSequenceStart
      ?? mirroredNavigationSequence?.sequence_start
      ?? findMatchingSequenceStart(data.tokens, targetSequenceTokens)
    : null;
  const targetLineIndex = getTargetLineIndex(codeLines, targetTokenStart);
  const targetLineRange = getTargetLineRange(
    codeLines,
    targetTokenStart,
    exactTargetSequenceLength ?? mirroredNavigationSequence?.sequence_length ?? targetSequenceLength,
  );

  useEffect(() => {
    if (targetLineIndex == null) {
      return;
    }

    const lineElement = lineRefs.current[targetLineIndex];
    const viewerBody = viewerBodyRef.current;
    if (lineElement && viewerBody) {
      const scrollPadding = 24;
      const lineRect = lineElement.getBoundingClientRect();
      const viewerRect = viewerBody.getBoundingClientRect();
      const targetScrollTop = Math.max(
        viewerBody.scrollTop + (lineRect.top - viewerRect.top) - scrollPadding,
        0,
      );

      viewerBody.scrollTo({ top: targetScrollTop, behavior: "smooth" });
    }
  }, [targetLineIndex]);

  useEffect(() => {
    setActivePopup(null);
  }, [data.submission_id, navigationTarget]);

  useEffect(() => {
    if (!activePopup) {
      return undefined;
    }

    const handleDocumentMouseDown = () => {
      setActivePopup(null);
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [activePopup]);

  const renderLine = (line, lineIndex) => {
    const segments = [];
    let currentText = "";
    let currentHighlightKey = null;
    let currentStartTokenIndex = null;

    line.forEach((part, partIndex) => {
      const previousTokenIndex = [...line]
        .slice(0, partIndex)
        .reverse()
        .find((linePart) => linePart.tokenIndex != null)?.tokenIndex;
      const nextTokenIndex = line
        .slice(partIndex + 1)
        .find((linePart) => linePart.tokenIndex != null)?.tokenIndex;

      // Submission id of the similar submission if the last token was flagged
      const previousSubmission =
        previousTokenIndex != null ? flaggedTokenMap[previousTokenIndex] : null;

      // Submission id of the similar submission if the next token was flagged
      const nextSubmission =
        nextTokenIndex != null ? flaggedTokenMap[nextTokenIndex] : null;

      const bridgeSubmission =
        part.tokenIndex == null && // Not a token, like a whitespace
        previousSubmission != null && // Last token was flagged
        previousSubmission === nextSubmission // Next token was flagged and was flagged against the same submission
          ? previousSubmission
          : null;

      // Highlight if it is flagged, or if it isn't an actual token between two flagged tokens
      const highlightKey = (
        part.tokenIndex != null ? flaggedTokenMap[part.tokenIndex] : null
      ) ?? bridgeSubmission;

      if (highlightKey !== currentHighlightKey) {
        if (currentText) {
          segments.push({
            text: currentText,
            highlightKey: currentHighlightKey,
            startTokenIndex: currentStartTokenIndex,
          });
        }
        currentText = "";
        currentHighlightKey = highlightKey;
        currentStartTokenIndex = part.tokenIndex ?? previousTokenIndex ?? nextTokenIndex ?? null;
      }

      currentText += part.text;

      if (currentStartTokenIndex == null) {
        currentStartTokenIndex = part.tokenIndex ?? previousTokenIndex ?? nextTokenIndex ?? null;
      }
    });

    if (currentText) {
      segments.push({
        text: currentText,
        highlightKey: currentHighlightKey,
        startTokenIndex: currentStartTokenIndex,
      });
    }

    const isInTargetRange = (
      targetLineRange.start != null &&
      targetLineRange.end != null &&
      lineIndex >= targetLineRange.start &&
      lineIndex <= targetLineRange.end
    );
    const isTargetRangeStart = isInTargetRange && lineIndex === targetLineRange.start;
    const isTargetRangeEnd = isInTargetRange && lineIndex === targetLineRange.end;
    const targetRangeClassName = isInTargetRange
      ? [
        "bg-amber-300/10",
        "border-x-2 border-amber-300/80",
        isTargetRangeStart ? "border-t-2 border-t-amber-300/80 rounded-t-md" : "",
        isTargetRangeEnd ? "border-b-2 border-b-amber-300/80 rounded-b-md" : "",
        isTargetRangeStart && isTargetRangeEnd ? "shadow-[0_0_0_1px_rgba(252,211,77,0.5)]" : "",
      ].filter(Boolean).join(" ")
      : "";

    return (
      <div
        key={`line-${lineIndex}`}
        ref={(element) => {
          lineRefs.current[lineIndex] = element;
        }}
        className={[
          "w-full",
          lineIndex === targetLineIndex ? "bg-amber-300/15 ring-1 ring-amber-300/50" : "",
          targetRangeClassName,
        ].filter(Boolean).join(" ")}
      >
        {isTargetRangeStart ? (
          <div className="mb-2 px-3 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
            Matching Code
          </div>
        ) : null}
        {segments.map((segment, segmentIndex) => (
          segment.highlightKey != null ? (
            (() => {
              const palette = getHighlightPalette(segment.highlightKey);
              const matchingSequence = getMatchingSequence(
                data.similarity_sequences,
                segment.highlightKey,
                segment.startTokenIndex,
              );

              return (
                <span
                  key={`segment-${lineIndex}-${segmentIndex}`}
                  className={`inline-block cursor-pointer ${palette.bg} ${palette.text}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setActivePopup({
                      x: event.clientX,
                      y: event.clientY,
                      palette,
                      highlightKey: segment.highlightKey,
                      sequence: matchingSequence,
                      segmentStartTokenIndex: segment.startTokenIndex,
                    });
                  }}
                >
                  {segment.text}
                </span>
              );
            })()
          ) : (
            <span key={`segment-${lineIndex}-${segmentIndex}`}>
              {segment.text}
            </span>
          )
        ))}
      </div>
    );
  };

  return (
    <section className="box-wrapper relative">
      {onClose ? (
        <button
          type="button"
          aria-label="Close viewer"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md border border-slate-300 px-2 py-1 text-sm font-semibold leading-none text-slate-600 hover:bg-slate-100"
        >
          x
        </button>
      ) : null}
      <div className="flex flex-col gap-2 pr-14 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="h2-large">{title}</h2>
          <p className="text-sm text-slate-600">Submission ID: {String(data.submission_id)}</p>
          {sourceLabel ? <p className="text-sm text-slate-600">Source: {sourceLabel}</p> : null}
        </div>
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
          Similarity Score: {data.similarity_score.toFixed(2)}
        </div>
      </div>
      <div
        ref={viewerBodyRef}
        className="mt-3 h-128 overflow-auto rounded-xl border border-slate-200 bg-slate-950"
        onMouseDown={() => {
          setActivePopup(null);
          if (navigationTarget && onClearNavigationTarget) {
            onClearNavigationTarget();
          }
        }}
      >
        <pre className="min-h-full min-w-full px-5 pb-24 pt-5 text-sm leading-7 text-slate-100">
          <code className="block min-w-full w-max">
            {codeLines.map((line, lineIndex) => renderLine(line, lineIndex))}
          </code>
        </pre>
      </div>
      {activePopup ? (
        <div
          className="fixed z-30 min-w-56 rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs text-slate-100 shadow-xl"
          style={{
            left: `${activePopup.x}px`,
            top: `${activePopup.y + 12}px`,
            transform: "translateX(-50%)",
          }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <span className={`block font-semibold ${activePopup.palette.label}`}>
            Flagged Token / Token Sequence
          </span>
          <span className="mt-1 block text-slate-300">
            This code matches code present in another submission.
          </span>
          <button
            type="button"
            onClick={() => {
              onSelectSubmission(activePopup.highlightKey, {
                submissionId: activePopup.highlightKey,
                sourceSubmissionId: data.submission_id,
                sourceSequenceTokens: data.tokens.slice(
                  activePopup.sequence?.sequence_start ?? activePopup.segmentStartTokenIndex,
                  (activePopup.sequence?.sequence_start ?? activePopup.segmentStartTokenIndex)
                    + (activePopup.sequence?.sequence_length ?? 1),
                ),
                targetSequenceStart: activePopup.sequence?.flagged_sequence_start ?? null,
                targetSequenceLength: activePopup.sequence?.sequence_length ?? 1,
                sequenceTokens: parseFlaggedCode(activePopup.sequence?.flagged_code),
              });
              setActivePopup(null);
            }}
            disabled={activePopup.highlightKey === "multipleMatches"}
            className={`submit-button mt-3 ${activePopup.palette.button}`}
          >
            View Matching Submission
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default Viewer;
