import { resources } from "../../src/data/resources.js";
import ar from "../../src/i18n/ar.js";
import fr from "../../src/i18n/fr.js";
import en from "../../src/i18n/en.js";

const translations = { ar, fr, en };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let language = localStorage.getItem("najahna-language") || "ar";
let selectedLevel = "all";
let toastTimer;

function t(key) { return translations[language]?.[key] ?? translations.ar[key] ?? key; }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]); }
function setLanguage(next) {
  language = translations[next] ? next : "ar";
  localStorage.setItem("najahna-language", language);
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  $("#language").value = language;
  $$("[data-i18n]").forEach(node => {
    const value = t(node.dataset.i18n);
    if (node.dataset.i18n === "heroTitle") node.innerHTML = value;
    else node.textContent = value;
  });
  $$("[data-i18n-placeholder]").forEach(node => node.placeholder = t(node.dataset.i18nPlaceholder));
  $$("#level-filter option, #type-filter option").forEach(option => { if (option.dataset.i18n) option.textContent = t(option.dataset.i18n); });
  renderResources();
  renderFavorites();
  updateRemoveButtons();
}
function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("visible");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
}
function getFavorites() {
  try { const data = JSON.parse(localStorage.getItem("najahna-favorites") || "[]"); return Array.isArray(data) ? data : []; }
  catch { return []; }
}
function saveFavorites(ids) { localStorage.setItem("najahna-favorites", JSON.stringify([...new Set(ids)])); }
function typeLabel(type) { return t(({lesson:"typeLesson",summary:"typeSummary",exercise:"typeExercise",exam:"typeExam",book:"typeBook"})[type]); }
function renderResources() {
  const query = $("#resource-search").value.trim().toLocaleLowerCase();
  const level = $("#level-filter").value;
  const type = $("#type-filter").value;
  const favorites = getFavorites();
  const filtered = resources.filter(item => {
    const searchable = [item.title[language], item.description[language], item.subject, item.grade[language]].join(" ").toLocaleLowerCase();
    return (level === "all" || item.level === level) && (type === "all" || item.type === type) && (!query || searchable.includes(query));
  });
  $("#resource-grid").innerHTML = filtered.map(item => `<article class="resource-card">
    <div class="resource-card-top"><span class="resource-icon" aria-hidden="true">${item.icon}</span><button class="favorite-button ${favorites.includes(item.id) ? "saved" : ""}" type="button" data-favorite="${item.id}" aria-label="${favorites.includes(item.id) ? t("removed") : t("saved")}" aria-pressed="${favorites.includes(item.id)}">${favorites.includes(item.id) ? "♥" : "♡"}</button></div>
    <span class="resource-type">${escapeHTML(typeLabel(item.type))} · ${escapeHTML(t("sample"))}</span><h3>${escapeHTML(item.title[language])}</h3><p>${escapeHTML(item.description[language])}</p>
    <div class="resource-meta"><span>${escapeHTML(item.grade[language])}</span><span>${escapeHTML(item.subject.toUpperCase())}</span></div></article>`).join("");
  $("#empty-state").hidden = filtered.length !== 0;
}
function renderFavorites() {
  const ids = getFavorites();
  const saved = ids.map(id => resources.find(item => item.id === id)).filter(Boolean);
  $("#favorites-list").innerHTML = saved.length ? saved.map(item => `<div class="favorite-item"><span>${escapeHTML(item.title[language])}</span><button type="button" data-remove-favorite="${item.id}" aria-label="${t("removed")}">×</button></div>`).join("") : `<p>${t("noFavorites")}</p>`;
}
function updateRemoveButtons() {
  $$(".remove-grade").forEach(button => button.disabled = $$(".grade-row").length === 1);
}
function addGradeRow() {
  const rows = $$(".grade-row");
  if (rows.length >= 12) { showToast(t("maxSubjects")); return; }
  const row = document.createElement("div"); row.className = "grade-row";
  row.innerHTML = `<label><span>${t("subject")}</span><input name="subject" required maxlength="50" placeholder="${t("subjectExample")}"></label><label><span>${t("grade")}</span><input name="grade" type="number" min="0" max="20" step="0.25" required placeholder="15"></label><label><span>${t("coefficient")}</span><input name="coefficient" type="number" min="1" max="20" step="1" value="1" required></label><button class="remove-grade" type="button" aria-label="${t("removeSubject")}">×</button>`;
  $("#grade-rows").append(row); updateRemoveButtons(); row.querySelector('input[name="subject"]').focus();
}
function calculateAverage(event) {
  event.preventDefault();
  const rows = $$(".grade-row");
  if (!rows.length) { showToast(t("addAtLeastOne")); return; }
  let weightedTotal = 0, totalCoefficient = 0;
  for (const row of rows) {
    const grade = Number(row.querySelector('[name="grade"]').value);
    const coefficient = Number(row.querySelector('[name="coefficient"]').value);
    if (!Number.isFinite(grade) || grade < 0 || grade > 20 || !Number.isInteger(coefficient) || coefficient < 1 || coefficient > 20) {
      showToast(t("invalidGrade")); row.querySelector('[name="grade"]').focus(); return;
    }
    weightedTotal += grade * coefficient; totalCoefficient += coefficient;
  }
  const average = weightedTotal / totalCoefficient;
  $("#average-result").innerHTML = `${t("averageLabel")} <strong>${average.toLocaleString(language === "en" ? "en" : language === "fr" ? "fr-FR" : "ar-DZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / 20</strong>`;
  $("#average-result").hidden = false;
}
$("#language").addEventListener("change", event => setLanguage(event.target.value));
$("#theme-toggle").addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");
  localStorage.setItem("najahna-theme", dark ? "dark" : "light");
  $("#theme-toggle").textContent = dark ? "☀" : "☾";
  $("#theme-toggle").setAttribute("aria-pressed", String(dark));
  $("#theme-toggle").title = dark ? "Light mode" : "Dark mode";
});
$("#resource-search").addEventListener("input", renderResources);
$("#level-filter").addEventListener("change", () => { selectedLevel = $("#level-filter").value; renderResources(); });
$("#type-filter").addEventListener("change", renderResources);
$("#resource-grid").addEventListener("click", event => {
  const button = event.target.closest("[data-favorite]"); if (!button) return;
  const id = button.dataset.favorite; const favorites = getFavorites(); const exists = favorites.includes(id);
  saveFavorites(exists ? favorites.filter(item => item !== id) : [...favorites, id]);
  renderResources(); renderFavorites(); showToast(t(exists ? "removed" : "saved"));
});
$("#favorites-list").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-favorite]"); if (!button) return;
  saveFavorites(getFavorites().filter(id => id !== button.dataset.removeFavorite)); renderResources(); renderFavorites(); showToast(t("removed"));
});
$("#clear-favorites").addEventListener("click", () => { saveFavorites([]); renderResources(); renderFavorites(); showToast(t("cleared")); });
$("#grade-rows").addEventListener("click", event => { const button = event.target.closest(".remove-grade"); if (button && $$(".grade-row").length > 1) { button.closest(".grade-row").remove(); updateRemoveButtons(); } });
$("#add-grade").addEventListener("click", addGradeRow);
$("#average-form").addEventListener("submit", calculateAverage);
$$("[data-level]").forEach(button => button.addEventListener("click", () => {
  selectedLevel = button.dataset.level; $("#level-filter").value = selectedLevel;
  $$(".level-card").forEach(card => card.classList.toggle("active", card === button));
  renderResources(); $("#resources").scrollIntoView({ behavior: "smooth" }); showToast(t("levelSelected"));
}));
document.body.classList.toggle("dark", localStorage.getItem("najahna-theme") === "dark");
$("#theme-toggle").textContent = document.body.classList.contains("dark") ? "☀" : "☾";
$("#year").textContent = new Date().getFullYear();
setLanguage(language);
updateRemoveButtons();
