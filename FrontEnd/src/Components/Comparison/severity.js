const severityRank = {
  low: 1,
  medium: 2,
  high: 3,
};

const severityBadgeClasses = {
  Low: "bg-emerald-100 text-emerald-800",
  Medium: "bg-amber-100 text-amber-800",
  High: "bg-rose-100 text-rose-800",
  Unknown: "bg-slate-100 text-slate-700",
};

export const normalizeSeverityLevel = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "low") {
    return "Low";
  }

  if (normalized === "medium") {
    return "Medium";
  }

  if (normalized === "high") {
    return "High";
  }

  return null;
};

export const getHighestSeverityLevel = (sequences) => {
  if (!Array.isArray(sequences) || sequences.length === 0) {
    return null;
  }

  let highestLevel = null;
  let highestRank = 0;

  sequences.forEach((sequence) => {
    const level = normalizeSeverityLevel(sequence?.severity_level);
    const rank = severityRank[String(level ?? "").toLowerCase()] ?? 0;

    if (rank > highestRank) {
      highestRank = rank;
      highestLevel = level;
    }
  });

  return highestLevel;
};

export const getSeverityBadgeClassName = (level) =>
  severityBadgeClasses[level] ?? severityBadgeClasses.Unknown;
