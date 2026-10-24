import test from "node:test";
import assert from "node:assert/strict";
import { getDirectPdfUrl } from "../src/utils/pdf-resources.js";

test("direct PDF reader accepts explicitly declared HTTPS PDF files", () => {
  assert.equal(getDirectPdfUrl({ pdfUrl: "https://cdn.example.org/lesson.pdf" }), "https://cdn.example.org/lesson.pdf");
  assert.equal(getDirectPdfUrl({ pdfUrl: "https://cdn.example.org/lesson.pdf?download=1" }), "https://cdn.example.org/lesson.pdf?download=1");
});

test("direct PDF reader accepts site-hosted PDF paths", () => {
  assert.equal(getDirectPdfUrl({ pdfUrl: "./assets/pdfs/math.pdf" }), "./assets/pdfs/math.pdf");
  assert.equal(getDirectPdfUrl({ pdfUrl: "/Najahna-/assets/pdfs/math.pdf" }), "/Najahna-/assets/pdfs/math.pdf");
});

test("catalogue pages, non-PDF URLs, unsafe schemes and missing values are rejected", () => {
  for (const pdfUrl of [undefined, "", "https://onps.dz/category/books", "https://example.org/lesson.html", "javascript:alert(1)", "data:application/pdf,abc", "//example.org/lesson.pdf", "lesson.pdf", "https://example.org/not.pdf/"]) {
    assert.equal(getDirectPdfUrl({ pdfUrl }), null, String(pdfUrl));
  }
  assert.equal(getDirectPdfUrl(null), null);
  assert.equal(getDirectPdfUrl("https://example.org/lesson.pdf"), null);
});
