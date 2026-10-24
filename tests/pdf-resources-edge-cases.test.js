import test from "node:test";
import assert from "node:assert/strict";
import { getDirectPdfUrl } from "../src/utils/pdf-resources.js";

test("direct PDF URLs reject unsafe schemes, catalogue pages and malformed candidates", () => {
  for (const pdfUrl of ["https://onps.dz/category/books", "https://example.org/lesson.html", "javascript:alert(1)", "data:application/pdf,abc", "//example.org/lesson.pdf", "lesson.pdf", "https://example.org/not.pdf/", "https://example.org/lesson.pdf\nhttps://evil.example/"]) {
    assert.equal(getDirectPdfUrl({ pdfUrl }), null, JSON.stringify(pdfUrl));
  }
});

test("direct PDF URLs accept declared HTTPS and local PDF paths without rewriting them", () => {
  for (const pdfUrl of ["https://cdn.example.org/lesson.PDF", "https://cdn.example.org/lesson.pdf?download=1", "https://cdn.example.org/lesson.pdf#page=3", "./assets/pdfs/math.pdf", "/Najahna-/assets/pdfs/math.pdf"]) {
    assert.equal(getDirectPdfUrl({ pdfUrl }), pdfUrl);
  }
});

test("direct PDF helper rejects non-object records and absent values", () => {
  assert.equal(getDirectPdfUrl(null), null);
  assert.equal(getDirectPdfUrl("https://example.org/lesson.pdf"), null);
  assert.equal(getDirectPdfUrl({}), null);
});
