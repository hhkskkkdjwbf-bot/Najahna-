// Only explicitly declared direct PDF files may be opened in the embedded reader.
// Catalogue pages and ordinary web pages are deliberately rejected.
export function getDirectPdfUrl(resource) {
  if (!resource || typeof resource !== "object") return null;
  const candidate = typeof resource.pdfUrl === "string" ? resource.pdfUrl.trim() : "";
  if (!candidate || /[\r\n]/.test(candidate)) return null;
  if (!/\.pdf(?:[?#].*)?$/i.test(candidate)) return null;
  if (/^https:\/\//i.test(candidate)) return candidate;
  if (/^(?:\.\/|\.\.\/|\/)[^\s]*\.pdf(?:[?#].*)?$/i.test(candidate)) return candidate;
  return null;
}
