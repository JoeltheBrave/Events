/**
 * Fingerprint format: YYYY-MM-DD|normalizedVenue|normalizedTitle
 * Normalization: lowercase, remove punctuation, remove "live at", collapse whitespace, remove "the " prefix
 */
export function normalizeForFingerprint(s: string): string {
  return s
    .toLowerCase()
    .replace(/live at/gi, " ")
    .replace(/^the\s+/i, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildFingerprint(
  date: Date,
  venueName: string,
  title: string
): string {
  const dateStr = date.toISOString().slice(0, 10);
  const venue = normalizeForFingerprint(venueName);
  const titleNorm = normalizeForFingerprint(title);
  return `${dateStr}|${venue}|${titleNorm}`;
}
