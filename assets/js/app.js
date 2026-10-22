import { resources } from "../../src/data/resources.js";
import { schoolYears, subjectCatalog } from "../../src/data/curriculum.js";
import { filterResources } from "../../src/data/resource-filters.js";
import { getCollections, createCollection, moveResourceToCollection } from "../../src/utils/collections.js";
import { getNotes, saveNote } from "../../src/utils/notes.js";
import { createStudyTask, toggleStudyTask, removeStudyTask } from "../../src/utils/study-plan.js";
import { readJSON, writeJSON } from "../../src/utils/storage.js";
import { recordResourceView, getResourceHistory } from "../../src/utils/history.js";
import ar from "../../src/i18n/ar.js";
import fr from "../../src/i18n/fr.js";
import en from "../../src/i18n/en.js";

const translations = { ar, fr, en };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let language = localStorage.getItem("najahna-language") || "ar";
let selectedLevel = "all";
let activeResourceId = null;
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
  $("#level-filter option, #type-filter option").forEach(option => { if (option.dataset.i18n) option.textContent = t(option.dataset.i18n); });
  renderCatalogFilters();
  renderResources();
  renderFavorites();
  renderStudyPlan();
  if (activeResourceId && $("#resource-dialog").open) renderResourceDetails(activeResourceId);
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
function typeLabel(type) { return t(({lesson:"typeLesson",summary:"typeSummary",exercise:"typeExercise",exam:"typeExam",book:"typeBook",flashcard:"typeFlashcard",mindmap:"typeMindmap"})[type]); }
function renderCatalogFilters() {
  const level = $("#level-filter")?.value || "all";
  const yearSelect = $("#year-filter");
  const subjectSelect = $("#subject-filter");
  if (!yearSelect || !subjectSelect) return;
  const years = level === "all" ? schoolYears : schoolYears.filter(item => item.level === level);
  const subjects = level === "all" ? subjectCatalog : subjectCatalog.filter(item => item.levels.includes(level));
  const previousYear = yearSelect.value;
  const previousSubject = subjectSelect.value;
  // Year numbers repeat across levels, so use a level/year composite value.
  yearSelect.innerHTML = `<option value="all">${escapeHTML(t("allYears"))}</option>` + years.map(item => `<option value="${item.level}:${item.year}">${escapeHTML(item.label[language])}</option>`).join("");
  subjectSelect.innerHTML = `<option value="all">${escapeHTML(t("allSubjects"))}</option>` + subjects.map(item => `<option value="${item.id}">${escapeHTML(item.label[language])}</option>`).join("");
  if ([...yearSelect.options].some(option => option.value === previousYear)) yearSelect.value = previousYear;
  if ([...subjectSelect.options].some(option => option.value === previousSubject)) subjectSelect.value = previousSubject;
}
function renderResources() {
  const query = $("#resource-search").value.trim().toLocaleLowerCase();
  const level = $("#level-filter").value;
  const type = $("#type-filter").value;
  const year = $("#year-filter")?.value || "all";
  const subject = $("#subject-filter")?.value || "all";
  const favorites = getFavorites();
  const filtered = filterResources(resources, { query, level, type, year, subject, language, subjectCatalog });
  $("#resource-grid").innerHTML = filtered.map(item => `<article class="resource-card">
    <div class="resource-card-top"><span class="resource-icon" aria-hidden="true">${item.icon}</span><button class="favorite-button ${favorites.includes(item.id) ? "saved" : ""}" type="button" data-favorite="${item.id}" aria-label="${favorites.includes(item.id) ? t("removed") : t("saved")}" aria-pressed="${favorites.includes(item.id)}">${favorites.includes(item.id) ? "♥" : "♡"}</button></div>
    <span class="resource-type">${escapeHTML(typeLabel(item.type))} · ${escapeHTML(t("sample"))}</span><h3>${escapeHTML(item.title[language])}</h3><p>${escapeHTML(item.description[language])}</p>
    <div class="resource-meta"><span>${escapeHTML(item.grade[language])}</span><span>${escapeHTML(item.subject.toUpperCase())}</span></div><div class="resource-actions"><button type="button" class="button button-outline button-small" data-details-resource="${item.id}">${t("viewDetails")}</button><button type="button" class="button button-outline button-small" data-view-resource="${item.id}">${t("markViewed")}</button><button type="button" class="button button-quiet button-small" data-collect-resource="${item.id}">${t("addToCollection")}</button></div></article>`).join("");
  $("#empty-state").hidden = filtered.length !== 0;
  $("#resource-count").textContent = t("resourceCount").replace("{count}", String(filtered.length));
}
function renderResourceDetails(id) {
  const item = resources.find(resource => resource.id === id);
  if (!item) return;
  activeResourceId = item.id;
  $("#resource-dialog-type").textContent = `${typeLabel(item.type)} · ${t("sample")}`;
  $("#resource-dialog-title").textContent = item.title[language];
  $("#resource-dialog-description").textContent = item.description[language];
  $("#resource-dialog-level").textContent = item.grade[language];
  const years = schoolYears.filter(year => year.level === item.level && (item.grades || []).includes(year.year));
  $("#resource-dialog-years").textContent = years.map(year => year.label[language]).join("، ") || "—";
  $("#resource-dialog-subject").textContent = subjectCatalog.find(subject => subject.id === item.subject)?.label?.[language] || item.subject;
  $("#resource-dialog-availability").textContent = t("sampleOnly");
  $("#resource-dialog-note").textContent = t("sampleDetailNote");
  $("#resource-dialog-reviewed").textContent = t("markViewed");
  $("#resource-dialog-add").textContent = t("addToCollection");
  $("#resource-dialog-add").onclick = () => {
    const collections = getCollections();
    if (!collections.length) { showToast(t("createCollectionFirst")); return; }
    const chosen = window.prompt(t("chooseCollection") + "\n" + collections.map((entry, index) => `${index + 1}. ${entry.name}`).join("\n"));
    const index = Number(chosen) - 1;
    if (chosen && Number.isInteger(index) && collections[index]) {
      try { moveResourceToCollection(item.id, collections[index].id); renderCollections(); showToast(t("addedToCollection")); }
      catch { showToast(t("saveFailed")); }
    }
  };
  $("#resource-dialog-reviewed").onclick = () => {
    recordResourceView(item.id);
    renderHistory();
    $("#resource-dialog").close();
    showToast(t("viewRecorded"));
  };
}
function renderCollections() {
  const root = $("#collections-list");
  if (!root) return;
  const collections = getCollections();
  root.innerHTML = collections.map(collection => {
    const titles = collection.resourceIds.map(id => resources.find(item => item.id === id)).filter(Boolean).map(item => item.title[language]);
    return `<div class="collection-item"><strong>${escapeHTML(collection.name)}</strong><span>${collection.resourceIds.length} · ${escapeHTML(t("resourcesCount"))}</span>${titles.length ? `<small>${titles.map(escapeHTML).join("، ")}</small>` : ""}</div>`;
  }).join("");
}
function renderHistory() {
  const root = $("#history-list");
  if (!root) return;
  const history = getResourceHistory();
  root.innerHTML = history.length ? history.slice(0, 10).map(entry => {
    const resource = resources.find(item => item.id === entry.resourceId);
    if (!resource) return "";
    return `<div class="history-item"><span>${escapeHTML(resource.title[language])}</span><small>${escapeHTML(new Date(entry.viewedAt).toLocaleString(language === "fr" ? "fr-FR" : language === "ar" ? "ar-DZ" : "en", { dateStyle:"medium", timeStyle:"short" }))}</small></div>`;
  }).join("") : `<p class="small-note">${t("historyEmpty")}</p>`;
}
function renderNotes() {
  const root = $("#notes-list");
  if (!root) return;
  const notes = getNotes();
  root.innerHTML = notes.length ? notes.slice(0, 8).map(note => `<article class="note-item"><strong>${escapeHTML(note.title)}</strong><p>${escapeHTML(note.body)}</p><small>${escapeHTML(new Date(note.updatedAt).toLocaleDateString(language === "fr" ? "fr-FR" : language === "ar" ? "ar-DZ" : "en"))}</small></article>`).join("") : `<p class="small-note">${t("noNotes")}</p>`;
}
function renderFavorites() {
  const ids = getFavorites();
  const saved = ids.map(id => resources.find(item => item.id === id)).filter(Boolean);
  $("#favorites-list").innerHTML = saved.length ? saved.map(item => `<div class="favorite-item"><span>${escapeHTML(item.title[language])}</span><button type="button" data-remove-favorite="${item.id}" aria-label="${t("removed")}">×</button></div>`).join("") : `<p>${t("noFavorites")}</p>`;
}
function getStudyTasks() {
  const value = readJSON("study-plan", []);
  return Array.isArray(value) ? value.filter(task => task && typeof task.id === "string" && typeof task.subject === "string") : [];
}
function renderStudyPlan() {
  const list = $("#study-plan-list");
  if (!list) return;
  const tasks = getStudyTasks().sort((a, b) => a.date.localeCompare(b.date) || Number(a.completed) - Number(b.completed));
  const completed = tasks.filter(task => task.completed).length;
  const minutes = tasks.filter(task => !task.completed).reduce((total, task) => total + Number(task.minutes || 0), 0);
  $("#study-plan-summary").textContent = t("studyPlanSummary").replace("{done}", String(completed)).replace("{total}", String(tasks.length)).replace("{minutes}", String(minutes));
  list.innerHTML = tasks.length ? tasks.map(task => {
    const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(task.date) ? new Date(task.date + "T12:00:00").toLocaleDateString(language === "fr" ? "fr-FR" : language === "ar" ? "ar-DZ" : "en", { dateStyle: "medium" }) : task.date;
    return `<article class="study-task ${task.completed ? "is-complete" : ""}"><label class="study-task-check"><input type="checkbox" data-study-toggle="${escapeHTML(task.id)}" ${task.completed ? "checked" : ""}><span class="sr-only">${escapeHTML(t("markStudyTaskDone"))}</span></label><div class="study-task-content"><strong>${escapeHTML(task.subject)}</strong><span>${escapeHTML(dateLabel)} · ${escapeHTML(String(task.minutes))} ${escapeHTML(t("minutesShort"))}</span></div><button type="button" class="study-task-delete" data-study-delete="${escapeHTML(task.id)}" aria-label="${escapeHTML(t("deleteStudyTask"))}">×</button></article>`;
  }).join("") : `<p class="small-note">${escapeHTML(t("studyPlanEmpty"))}</p>`;
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
$("#resource-dialog-close").addEventListener("click", () => $("#resource-dialog").close());
$("#reset-resource-filters").addEventListener("click", () => {
  $("#resource-search").value = "";
  $("#level-filter").value = "all";
  $("#year-filter").value = "all";
  $("#subject-filter").value = "all";
  $("#type-filter").value = "all";
  selectedLevel = "all";
  $(".level-card").forEach(card => card.classList.remove("active"));
  renderCatalogFilters();
  renderResources();
});
$("#resource-search").addEventListener("input", renderResources);
$("#level-filter").addEventListener("change", () => { selectedLevel = $("#level-filter").value; renderCatalogFilters(); renderResources(); });
$("#year-filter")?.addEventListener("change", renderResources);
$("#subject-filter")?.addEventListener("change", renderResources);
$("#type-filter").addEventListener("change", renderResources);
$("#resource-grid").addEventListener("click", event => {
  const details = event.target.closest("[data-details-resource]");
  if (details) { renderResourceDetails(details.dataset.detailsResource); $("#resource-dialog").showModal(); return; }
  const viewed = event.target.closest("[data-view-resource]");
  if (viewed) { recordResourceView(viewed.dataset.viewResource); renderHistory(); showToast(t("viewRecorded")); return; }
  const collect = event.target.closest("[data-collect-resource]");
  if (collect) {
    const collections = getCollections();
    if (!collections.length) { showToast(t("createCollectionFirst")); return; }
    const chosen = window.prompt(t("chooseCollection") + "\n" + collections.map((item, i) => `${i + 1}. ${item.name}`).join("\n"));
    const index = Number(chosen) - 1;
    if (chosen && Number.isInteger(index) && collections[index]) {
      try { moveResourceToCollection(collect.dataset.collectResource, collections[index].id); renderCollections(); showToast(t("addedToCollection")); }
      catch { showToast(t("saveFailed")); }
    }
    return;
  }
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
$("#study-plan-form")?.addEventListener("submit", event => {
  event.preventDefault();
  try {
    const tasks = getStudyTasks();
    const task = createStudyTask({ id: globalThis.crypto?.randomUUID?.() || `study-${Date.now()}`, subject: $("#study-subject").value, date: $("#study-date").value, minutes: $("#study-duration").value });
    if (tasks.length >= 100) { showToast(t("studyPlanLimit")); return; }
    if (!writeJSON("study-plan", [...tasks, task])) { showToast(t("saveFailed")); return; }
    $("#study-subject").value = "";
    renderStudyPlan();
    showToast(t("studyTaskAdded"));
  } catch { showToast(t("studyPlanInvalid")); }
});
$("#study-plan-list")?.addEventListener("change", event => {
  const checkbox = event.target.closest("[data-study-toggle]");
  if (!checkbox) return;
  if (!writeJSON("study-plan", toggleStudyTask(getStudyTasks(), checkbox.dataset.studyToggle))) { showToast(t("saveFailed")); return; }
  renderStudyPlan();
});
$("#study-plan-list")?.addEventListener("click", event => {
  const button = event.target.closest("[data-study-delete]");
  if (!button) return;
  if (!writeJSON("study-plan", removeStudyTask(getStudyTasks(), button.dataset.studyDelete))) { showToast(t("saveFailed")); return; }
  renderStudyPlan();
});
$("#collection-form")?.addEventListener("submit", event => {
  event.preventDefault();
  try { createCollection($("#collection-name").value); $("#collection-name").value = ""; renderCollections(); showToast(t("collectionCreated")); }
  catch { showToast(t("saveFailed")); }
});
$("#note-form")?.addEventListener("submit", event => {
  event.preventDefault();
  try { saveNote({ title: $("#note-title").value, body: $("#note-body").value }); $("#note-title").value = ""; $("#note-body").value = ""; renderNotes(); showToast(t("noteSaved")); }
  catch { showToast(t("saveFailed")); }
});
$$("[data-level]").forEach(button => button.addEventListener("click", () => {
  selectedLevel = button.dataset.level; $("#level-filter").value = selectedLevel; renderCatalogFilters();
  $(".level-card").forEach(card => card.classList.toggle("active", card === button));
  renderResources(); $("#resources").scrollIntoView({ behavior: "smooth" }); showToast(t("levelSelected"));
}));
document.body.classList.toggle("dark", localStorage.getItem("najahna-theme") === "dark");
$("#theme-toggle").textContent = document.body.classList.contains("dark") ? "☀" : "☾";
$("#year").textContent = new Date().getFullYear();
setLanguage(language);
renderCatalogFilters();
renderCollections();
renderNotes();
renderHistory();
renderStudyPlan();
updateRemoveButtons();
