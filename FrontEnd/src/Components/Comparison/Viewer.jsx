const noSpaceBefore = new Set([")", "]", "}", ",", ";", ".", ":"]);
const noSpaceAfter = new Set(["(", "[", "{", ".", "!", "~"]);

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

const Viewer = ({ data, title = "Comparison Output", onSelectSubmission }) => {
  const flaggedTokenMap = getFlaggedTokenMap(data.tokens, data.similarity_sequences);
  const codeLines = buildFormattedCodeLines(data.tokens);

  const renderLine = (line, lineIndex) => {
    const segments = [];
    let currentText = "";
    let currentHighlightKey = null;

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
          });
        }
        currentText = "";
        currentHighlightKey = highlightKey;
      }

      currentText += part.text;
    });

    if (currentText) {
      segments.push({
        text: currentText,
        highlightKey: currentHighlightKey,
      });
    }

    return (
      <div key={`line-${lineIndex}`}>
        {segments.map((segment, segmentIndex) => (
          segment.highlightKey != null ? (
            <span
              key={`segment-${lineIndex}-${segmentIndex}`}
              className="group relative inline-block bg-amber-300/30 text-amber-100"
            >
              {segment.text}
              <span className="absolute left-0 top-full z-20 hidden min-w-56 rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs text-slate-100 shadow-xl group-hover:block group-focus-within:block">
                <span className="block font-semibold text-amber-200">Flagged Token / Token Sequence</span>
                <span className="mt-1 block text-slate-300">
                  This code matches code present in another submission.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectSubmission(segment.highlightKey);
                  }}
                  disabled={segment.highlightKey === "multipleMatches"}
                  className="submit-button bg-amber-300 hover:bg-amber-200 text-slate-900"
                >
                  View Matching Submission
                </button>
              </span>
            </span>
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
