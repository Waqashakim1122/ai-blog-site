// TiptapContent renders directly from JSON attrs (no HTML string, so no
// sanitize-html pass) — this is what stands in for its URL-scheme check.
// A relative URL (no scheme) is always safe; anything with a scheme must
// be one of these three.
const ALLOWED_SCHEMES = new Set(["http", "https", "mailto"]);

export function isSafeUrl(url: string): boolean {
  // Per the WHATWG URL spec, browsers strip every ASCII tab/CR/LF from a
  // URL — anywhere in it, not just the ends — before parsing its scheme.
  // "java\tscript:alert(1)" is therefore indistinguishable to a browser
  // from "javascript:alert(1)"; stripping here first closes that gap
  // rather than relying on the literal string to contain a clean scheme.
  const trimmed = url.replace(/[\t\r\n]/g, "").trim();
  if (!trimmed) return false;

  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!schemeMatch) return true; // relative URL, e.g. "/foo" or "foo.png"

  return ALLOWED_SCHEMES.has(schemeMatch[1].toLowerCase());
}
