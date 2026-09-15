// TiptapContent renders directly from JSON attrs (no HTML string, so no
// sanitize-html pass) — this is what stands in for its URL-scheme check.
// A relative URL (no scheme) is always safe; anything with a scheme must
// be one of these three.
const ALLOWED_SCHEMES = new Set(["http", "https", "mailto"]);

export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!schemeMatch) return true; // relative URL, e.g. "/foo" or "foo.png"

  return ALLOWED_SCHEMES.has(schemeMatch[1].toLowerCase());
}
