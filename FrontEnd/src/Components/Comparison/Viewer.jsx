import { useEffect, useRef } from "react";

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

const Viewer = ({ data, title = "Comparison Output", navigationTarget = null, onSelectSubmission }) => {
  const flaggedTokenMap = getFlaggedTokenMap(data.tokens, data.similarity_sequences);
  const codeLines = buildFormattedCodeLines(data.tokens);
  const lineRefs = useRef([]);
  const targetSequenceTokens = navigationTarget?.sequenceTokens ?? [];
  const targetTokenStart = (
    navigationTarget &&
    String(navigationTarget.submissionId) === String(data.submission_id)
  )
    ? findMatchingSequenceStart(data.tokens, targetSequenceTokens)
    : null;
  const targetLineIndex = getTargetLineIndex(codeLines, targetTokenStart);

  useEffect(() => {
    if (targetLineIndex == null) {
      return;
    }

    const lineElement = lineRefs.current[targetLineIndex];
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [targetLineIndex]);

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

    return (
      <div
        key={`line-${lineIndex}`}
        ref={(element) => {
          lineRefs.current[lineIndex] = element;
        }}
        className={lineIndex === targetLineIndex ? "rounded bg-amber-300/15 ring-1 ring-amber-300/50" : ""}
      >
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
                  className={`group relative inline-block ${palette.bg} ${palette.text}`}
                >
                  {segment.text}
                  <span className="absolute left-0 top-full z-20 hidden min-w-56 rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs text-slate-100 shadow-xl group-hover:block group-focus-within:block">
                    <span className={`block font-semibold ${palette.label}`}>
                      Flagged Token / Token Sequence
                    </span>
                    <span className="mt-1 block text-slate-300">
                      This code matches code present in another submission.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSubmission(segment.highlightKey, {
                          submissionId: segment.highlightKey,
                          sequenceTokens: parseFlaggedCode(matchingSequence?.flagged_code),
                        });
                      }}
                      disabled={segment.highlightKey === "multipleMatches"}
                      className={`submit-button ${palette.button}`}
                    >
                      View Matching Submission
                    </button>
                  </span>
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
    <section className="box-wrapper">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="h2-large">{title}</h2>
          <p className="text-sm text-slate-600">Submission ID: {String(data.submission_id)}</p>
        </div>
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
          Similarity Score: {data.similarity_score.toFixed(2)}
        </div>
      </div>
      <div>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 px-5 pb-24 pt-5 text-sm leading-7 text-slate-100">
          <code>{codeLines.map((line, lineIndex) => renderLine(line, lineIndex))}</code>
        </pre>
      </div>
    </section>
  );
};

export default Viewer;
