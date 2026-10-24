import { resources } from "../../src/data/resources.js";
import { schoolYears, subjectCatalog } from "../../src/data/curriculum.js";
import { filterResources } from "../../src/data/resource-filters.js";
import { getCollections, createCollection, moveResourceToCollection, removeResourceFromCollection, deleteCollection } from "../../src/utils/collections.js";
import { getNotes, saveNote, deleteNote, clearNotes } from "../../src/utils/notes.js";
import { createStudyTask, toggleStudyTask, removeStudyTask, clearCompletedStudyTasks, sortStudyTasks } from "../../src/utils/study-plan.js";
import { readJSON, writeJSON } from "../../src/utils/storage.js";
import { recordResourceView, getResourceHistory, clearResourceHistory } from "../../src/utils/history.js";
import { serializeBackup, restoreBackup } from "../../src/utils/backup.js";
import { toLocalDateISO, parseLocalCalendarDate } from "../../src/utils/dates.js";
import { calculateWeightedAverage } from "../../src/calculators/average.js";
import { getQuizQuestions, gradeQuiz } from "../../src/data/quiz.js";
import { getQuizHistory, recordQuizAttempt, clearQuizHistory, getQuizTrend } from "../../src/utils/quiz-history.js";
import { dailyChallengeBank } from "../../src/data/daily-challenge.js";
import { getDailyChallengeQuestions, gradeDailyChallenge } from "../../src/utils/daily-challenge.js";
import { getLearnerProfile, saveLearnerProfile, getDailyChallengeCompletion, saveDailyChallengeCompletion } from "../../src/utils/learner-profile.js";
import { officialSources } from "../../src/data/official-sources.js";
import { getDirectPdfUrl } from "../../src/utils/pdf-resources.js";
import { getUpcomingSchoolEvents, schoolCalendarSource } from "../../src/data/school-calendar.js";
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
let pendingInstallPrompt = null;
let quizState = { level: "primary", questions: [], index: 0, answers: [], submitted: false, resultSaved: false };
let dailyChallengeAnswers = {};

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
  $("[data-i18n-placeholder]").forEach(node => node.placeholder = t(node.dataset.i18nPlaceholder));
  $("[data-i18n-title]").forEach(node => node.title = t(node.dataset.i18nTitle));
  $("#level-filter option, #type-filter option, #study-plan-filter option, #official-source-level option, #official-source-kind option, #official-source-grade option, #official-source-subject option, #learner-grade option").forEach(option => { if (option.dataset.i18n) option.textContent = t(option.dataset.i18n); });
  renderLevelCounts();
  renderCatalogFilters();
  renderQuiz();
  renderDailyChallenge();
  renderQuizHistory();
  renderOfficialSources();
  renderSchoolCalendar();
  renderResources();
  renderFavorites();
  renderCollections();
  renderNotes();
  renderHistory();
  renderStudyPlan();
  if (activeResourceId && $("#resource-dialog").open) renderResourceDetails(activeResourceId);
  updateRemoveButtons();
}
function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("visible");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
}
function getFavorites() {
  try {
    const data = JSON.parse(localStorage.getItem("najahna-favorites") || "[]");
    return Array.isArray(data) ? [...new Set(data.filter(id => typeof id === "string" && id.trim()))] : [];
  } catch { return []; }
}
function saveFavorites(ids) {
  try {
    localStorage.setItem("najahna-favorites", JSON.stringify([...new Set(ids.filter(id => typeof id === "string" && id.trim()))]));
    return true;
  } catch { showToast(t("storageError")); return false; }
}
function typeLabel(type) { return t(({lesson:"typeLesson",summary:"typeSummary",exercise:"typeExercise",exam:"typeExam",book:"typeBook",flashcard:"typeFlashcard",mindmap:"typeMindmap","pedagogical-doc":"typePedagogicalDoc"})[type] || "typeBook"); }

function renderSchoolCalendar() {
  const root = $("#school-calendar-list");
  if (!root) return;
  const today = new Date();
  const todayISO = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
  const events = getUpcomingSchoolEvents(todayISO, 12);
  const locale = language === "fr" ? "fr-FR" : language === "ar" ? "ar-DZ" : "en";
  const dateLabel = value => new Date(value + "T12:00:00").toLocaleDateString(locale, { day:"numeric", month:"short", year:"numeric" });
  const categoryLabel = category => t(({holiday:"calendarHoliday",exam:"calendarSchoolExam","national-exam":"calendarNationalExam"})[category]);
  const dayGap = value => Math.round((Date.parse(value + "T12:00:00Z") - Date.parse(todayISO + "T12:00:00Z")) / 86400000);
  root.innerHTML = events.map(event => {
    const gap = dayGap(event.startDate);
    const status = gap < 0 ? t("calendarInProgress") : gap === 0 ? t("calendarToday") : t("calendarDaysLeft").replace("{count}", String(gap));
    const dateRange = event.startDate === event.endDate ? dateLabel(event.startDate) : dateLabel(event.startDate) + " – " + dateLabel(event.endDate);
    return `<article class="school-calendar-card">
      <div class="school-calendar-card-top"><span class="calendar-category">${escapeHTML(categoryLabel(event.category))}</span><span class="calendar-countdown">${escapeHTML(status)}</span></div>
      <h3>${escapeHTML(event.title[language])}</h3>
      <p class="calendar-date">${escapeHTML(dateRange)}</p>
    </article>`;
  }).join("");
  if (!events.length) root.innerHTML = `<p class="empty-state">${escapeHTML(t("calendarNoUpcoming"))}</p>`;
  root.dataset.source = schoolCalendarSource;
}

function renderOfficialSources() {
  const root = $("#official-source-grid");
  if (!root) return;
  const query = ($("#official-source-search")?.value || "").trim().toLocaleLowerCase();
  const level = $("#official-source-level")?.value || "all";
  const kind = $("#official-source-kind")?.value || "all";
  const grade = $("#official-source-grade")?.value || "all";
  const subject = $("#official-source-subject")?.value || "all";
  const normalize = value => String(value ?? "").normalize("NFD").replace(/\p{M}/gu, "").replace(/ـ/g, "").toLocaleLowerCase();
  const matches = officialSources.filter(source => {
    // Search all localized titles and descriptions so learners can find sources in another language.
    const localizedText = value => value && typeof value === "object" ? Object.values(value).filter(item => typeof item === "string") : [value];
    const searchable = [...localizedText(source.title), ...localizedText(source.description), source.publisher, source.kind, source.grade, source.subject].filter(Boolean).join(" ");
    return (level === "all" || source.levels.includes(level)) &&
      (kind === "all" || source.kind === kind) &&
      (grade === "all" || source.grade === grade || (!source.grade && source.levels.includes(grade.split("-")[0]))) &&
      (subject === "all" || source.subject === subject) &&
      (!query || normalize(searchable).includes(normalize(query)));
  });
  const kindLabel = kind => t(({books:"officialSourceBooks", "exam-papers":"officialSourceExamPapers", "pedagogical-docs":"officialSourcePedagogical"})[kind] || "officialSourceBooks");
  const levelLabel = levels => levels.map(item => t(({primary:"primary",middle:"middle",secondary:"secondary"})[item])).join(" · ");
  const gradeLabel = value => t(({ "primary-1":"gradePrimary1", "primary-2":"gradePrimary2", "primary-3":"gradePrimary3", "primary-4":"gradePrimary4", "primary-5":"gradePrimary5", "middle-1":"gradeMiddle1", "middle-2":"gradeMiddle2", "middle-3":"gradeMiddle3", "middle-4":"gradeMiddle4", "secondary-1":"gradeSecondary1", "secondary-2":"gradeSecondary2", "secondary-3":"gradeSecondary3" })[value] || "officialSourceAllGrades");
  const subjectLabel = value => t(({arabic:"subjectArabic",english:"subjectEnglish",french:"subjectFrench",math:"subjectMath",science:"subjectScience",physics:"subjectPhysics","islamic-studies":"subjectIslamicStudies",history:"subjectHistory",geography:"subjectGeography",civics:"subjectCivics",amazigh:"subjectAmazigh",technology:"subjectTechnology"})[value] || "officialSourceAllSubjects");
  const pageTypeLabel = source => t(({catalog:"officialSourceCatalogPage",publication:"officialSourcePublicationPage",archive:"officialSourceArchivePage",guide:"officialSourceGuidePage"})[source.pageType] || "officialSourceCatalogPage");
  const dateLabel = date => {
    const parsed = new Date(`${date}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(language === "fr" ? "fr-FR" : language === "ar" ? "ar-DZ" : "en", { year:"numeric", month:"short", day:"numeric" });
  };
  root.innerHTML = matches.map(source => `<article class="official-source-card">
    <div class="official-source-card-top"><span class="official-source-icon" aria-hidden="true">${source.kind === "books" ? "▤" : source.kind === "exam-papers" ? "✎" : "✓"}</span><span class="source-verified-label">${escapeHTML(t("officialSourceChecked"))}</span></div>
    <span class="official-source-kind">${escapeHTML(kindLabel(source.kind))} · ${escapeHTML(levelLabel(source.levels))}</span>
    <h3>${escapeHTML(source.title[language])}</h3><p>${escapeHTML(source.description[language])}</p>
    <div class="official-source-tags">${source.grade ? `<span>${escapeHTML(gradeLabel(source.grade))}</span>` : ""}${source.subject ? `<span>${escapeHTML(subjectLabel(source.subject))}</span>` : ""}<span>${escapeHTML(pageTypeLabel(source))}</span><span>${escapeHTML(t("officialSourceRightsUnknown"))}</span><span>${escapeHTML(t("officialSourcePageOnly"))}</span></div>
    <div class="official-source-meta"><span>${escapeHTML(source.publisher)}</span><span>${escapeHTML(t("officialSourceCheckedOn"))}: ${escapeHTML(dateLabel(source.checkedOn))}</span>${source.publishedOn ? `<span>${escapeHTML(t("officialSourcePublishedOn"))}: ${escapeHTML(dateLabel(source.publishedOn))}</span>` : ""}</div>
    <a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("openOfficialSource"))} ↗</a>
  </article>`).join("");
  $("#official-source-count").textContent = t("officialSourceCount").replace("{count}", String(matches.length));
  $("#official-source-empty").hidden = matches.length !== 0;
}
function renderStudyDashboard() {
  const root = $("#study-dashboard");
  if (!root) return;
  const tasks = getStudyTasks();
  const completedTasks = tasks.filter(task => task.completed);
  const attempts = getQuizHistory();
  const favoriteCount = getFavorites().filter(id => resources.some(item => item.id === id)).length;
  const completedMinutes = completedTasks.reduce((sum, task) => sum + Number(task.minutes || 0), 0);
  const average = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.percentage, 0) / attempts.length) : null;
  $("#dashboard-completed").textContent = `${completedTasks.length}/${tasks.length}`;
  $("#dashboard-quiz-average").textContent = average === null ? "—" : `${average}%`;
  $("#dashboard-favorites").textContent = String(favoriteCount);
  $("#dashboard-minutes").textContent = String(completedMinutes);
  const focus = $("#dashboard-focus");
  const today = toLocalDateISO();
  const pending = tasks.filter(task => !task.completed).sort((a, b) => a.date.localeCompare(b.date));
  const nextTask = pending.find(task => task.date <= today) || pending[0];
  if (nextTask) {
    const dueDate = parseLocalCalendarDate(nextTask.date);
    const dateLabel = dueDate ? dueDate.toLocaleDateString(language === "fr" ? "fr-FR" : language === "ar" ? "ar-DZ" : "en", { dateStyle: "medium" }) : nextTask.date;
    const messageKey = nextTask.date < today ? "dashboardOverdueTask" : nextTask.date === today ? "dashboardTodayTask" : "dashboardNextTask";
    const message = t(messageKey).replace("{subject}", escapeHTML(nextTask.subject)).replace("{minutes}", String(nextTask.minutes)).replace("{date}", escapeHTML(dateLabel));
    focus.innerHTML = `<div class="dashboard-focus-copy"><span class="dashboard-focus-icon" aria-hidden="true">✦</span><div><h3>${escapeHTML(t("dashboardFocusTitle"))}</h3><p>${message}</p></div></div><a class="button button-primary button-small" href="#tools">${escapeHTML(t("dashboardOpenPlan"))}</a>`;
    return;
  }
  const recentEntry = getResourceHistory().find(entry => resources.some(item => item.id === entry.resourceId));
  const recentResource = recentEntry ? resources.find(item => item.id === recentEntry.resourceId) : null;
  if (recentResource) {
    focus.innerHTML = `<div class="dashboard-focus-copy"><span class="dashboard-focus-icon" aria-hidden="true">↻</span><div><h3>${escapeHTML(t("dashboardFocusTitle"))}</h3><p>${escapeHTML(t("dashboardContinue").replace("{title}", recentResource.title[language]))}</p></div></div><button class="button button-primary button-small" type="button" data-dashboard-resource="${escapeHTML(recentResource.id)}">${escapeHTML(t("dashboardResume"))}</button>`;
  } else if (!attempts.length) {
    focus.innerHTML = `<div class="dashboard-focus-copy"><span class="dashboard-focus-icon" aria-hidden="true">✎</span><div><h3>${escapeHTML(t("dashboardFocusTitle"))}</h3><p>${escapeHTML(t("dashboardStartQuiz"))}</p></div></div><a class="button button-primary button-small" href="#practice">${escapeHTML(t("dashboardPractice"))}</a>`;
  } else {
    focus.innerHTML = `<div class="dashboard-focus-copy"><span class="dashboard-focus-icon" aria-hidden="true">☀</span><div><h3>${escapeHTML(t("dashboardFocusTitle"))}</h3><p>${escapeHTML(t("dashboardPlanPrompt"))}</p></div></div><a class="button button-primary button-small" href="#tools">${escapeHTML(t("dashboardOpenPlan"))}</a>`;
  }
}
function renderDailyChallenge() {
  const form = $("#learner-profile-form");
  const root = $("#daily-challenge-content");
  if (!form || !root) return;
  const profile = getLearnerProfile();
  const gradeSelect = $("#learner-grade");
  const nameInput = $("#learner-name");
  if (profile) {
    if (gradeSelect && gradeSelect.dataset.profileLoaded !== "true") gradeSelect.value = profile.gradeId;
    if (nameInput && nameInput.dataset.profileLoaded !== "true") nameInput.value = profile.name;
    if (gradeSelect) gradeSelect.dataset.profileLoaded = "true";
    if (nameInput) nameInput.dataset.profileLoaded = "true";
  }
  const saveButton = $("#learner-profile-save");
  if (saveButton) saveButton.textContent = profile ? t("learnerProfileUpdate") : t("learnerProfileSave");
  const status = $("#learner-profile-status");
  if (!profile) {
    status.textContent = t("learnerProfileNeeded");
    root.innerHTML = `<div class="daily-challenge-empty"><h3>${escapeHTML(t("dailyChallengeLockedTitle"))}</h3><p>${escapeHTML(t("dailyChallengeLockedText"))}</p></div>`;
    return;
  }
  const year = schoolYears.find(item => item.id === profile.gradeId);
  const today = toLocalDateISO();
  const completed = getDailyChallengeCompletion(today, profile.gradeId);
  const questions = getDailyChallengeQuestions(dailyChallengeBank, profile.gradeId, today);
  const subjectName = id => {
    const key = ({arabic:"subjectArabic",french:"subjectFrench",english:"subjectEnglish",math:"subjectMath",science:"subjectScience","history-geography":"subjectHistory","islamic-education":"subjectIslamicStudies","civic-education":"subjectCivics",tamazight:"subjectAmazigh","daily-life":"dailySubjectLife"})[id];
    if (key) return t(key);
    return id.replaceAll("-", " ");
  };
  if (status) status.textContent = t("learnerProfileCurrent").replace("{grade}", year?.label?.[language] || year?.label?.en || profile.gradeId);
  if (completed) {
    root.innerHTML = `<div class="daily-challenge-complete"><span class="daily-challenge-check" aria-hidden="true">✓</span><div><h3>${escapeHTML(t("dailyChallengeCompleted"))}</h3><p>${escapeHTML(t("dailyChallengeScore").replace("{score}", String(completed.score)).replace("{total}", String(completed.total)))}</p><p class="small-note">${escapeHTML(t("dailyChallengeTomorrow"))}</p></div></div>`;
    return;
  }
  if (!questions.length) {
    root.innerHTML = `<div class="daily-challenge-empty"><h3>${escapeHTML(t("dailyChallengeNoQuestions"))}</h3><p>${escapeHTML(t("dailyChallengeCoverageNote"))}</p></div>`;
    return;
  }
  const questionMarkup = questions.map((question, index) => {
    const selected = dailyChallengeAnswers[question.id];
    const prompt = question.prompt[language] || question.prompt.en;
    const choices = (question.choices[language] || question.choices.en).map((choice, optionIndex) => `<label class="daily-challenge-option"><input type="radio" name="daily-${escapeHTML(question.id)}" value="${optionIndex}" ${selected === optionIndex ? "checked" : ""}><span>${escapeHTML(choice)}</span></label>`).join("");
    return `<fieldset class="daily-challenge-question"><legend><span class="daily-question-number">${index + 1}</span><span class="daily-subject">${escapeHTML(subjectName(question.subject))}</span></legend><p>${escapeHTML(prompt)}</p><div class="daily-challenge-options">${choices}</div></fieldset>`;
  }).join("");
  root.innerHTML = `<div class="daily-challenge-heading"><div><h3>${escapeHTML(t("dailyChallengeFor").replace("{grade}", year?.label?.[language] || year?.label?.en || profile.gradeId))}</h3><p>${escapeHTML(t("dailyChallengeCount").replace("{count}", String(questions.length)))}</p></div><span class="daily-challenge-date">${escapeHTML(today)}</span></div><form id="daily-challenge-form">${questionMarkup}<button class="button button-primary" type="submit">${escapeHTML(t("dailyChallengeSubmit"))}</button></form><p class="small-note">${escapeHTML(t("dailyChallengeCoverageNote"))}</p>`;
}

function renderQuizHistory() {
  const root = $("#quiz-history");
  if (!root) return;
  const attempts = getQuizHistory();
  if (!attempts.length) {
    root.innerHTML = `<div class="quiz-history-empty"><h3>${escapeHTML(t("quizHistoryTitle"))}</h3><p>${escapeHTML(t("quizHistoryEmpty"))}</p></div>`;
    renderStudyDashboard();
    return;
  }
  const average = Math.round(attempts.reduce((sum, item) => sum + item.percentage, 0) / attempts.length);
  const best = Math.max(...attempts.map(item => item.percentage));
  const trend = getQuizTrend(attempts);
  const trendLabel = trend ? `${trend.change > 0 ? "+" : ""}${trend.change} pp` : "—";
  const levelName = level => t(({primary:"primary",middle:"middle",secondary:"secondary",all:"quizHistoryMixed"})[level] || "primary");
  const recent = attempts.slice(0, 5).map(item => {
    const date = new Date(item.completedAt);
    const dateLabel = Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(language === "fr" ? "fr-FR" : language === "ar" ? "ar-DZ" : "en", { day:"numeric", month:"short", year:"numeric" });
    return `<li class="quiz-attempt"><span><strong>${escapeHTML(levelName(item.level))}</strong><small>${escapeHTML(dateLabel)}</small></span><span class="quiz-attempt-score">${item.score}/${item.total}<small>${item.percentage}%</small></span></li>`;
  }).join("");
  root.innerHTML = `<div class="quiz-history-heading"><div><h3>${escapeHTML(t("quizHistoryTitle"))}</h3><p>${escapeHTML(t("quizHistoryRecent"))}</p></div><button type="button" class="button button-quiet button-small" data-clear-quiz-history>${escapeHTML(t("quizHistoryClear"))}</button></div><div class="quiz-history-metrics"><div><span>${escapeHTML(t("quizHistoryAttempts"))}</span><strong>${attempts.length}</strong></div><div><span>${escapeHTML(t("quizHistoryBest"))}</span><strong>${best}%</strong></div><div><span>${escapeHTML(t("quizHistoryAverage"))}</span><strong>${average}%</strong></div><div><span>${escapeHTML(t("quizHistoryTrend"))}</span><strong class="quiz-trend-${trend?.direction || "unknown"}">${escapeHTML(trendLabel)}</strong></div></div><ol class="quiz-attempt-list">${recent}</ol><p class="small-note">${escapeHTML(t("quizHistoryLocal"))}</p>`;
  renderStudyDashboard();
}
function renderQuiz() {
  const levelSelect = $("#quiz-level");
  const container = $("#quiz-content");
  if (!levelSelect || !container) return;
  quizState.level = levelSelect.value || "primary";
  quizState.questions = getQuizQuestions(quizState.level);
  quizState.index = Math.min(quizState.index, Math.max(0, quizState.questions.length - 1));
  const question = quizState.questions[quizState.index];
  $("#quiz-progress").textContent = t("quizQuestionProgress").replace("{current}", String(quizState.index + 1)).replace("{total}", String(quizState.questions.length));
  if (!question) { container.innerHTML = ""; return; }
  const prompt = escapeHTML(question.prompt[language]);
  const choices = question.choices[language].map((choice, index) => {
    const selected = quizState.answers[quizState.index] === index;
    const correct = quizState.submitted && index === question.answer;
    const wrong = quizState.submitted && selected && index !== question.answer;
    return `<button type="button" class="quiz-choice ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "incorrect" : ""}" data-quiz-answer="${index}" ${quizState.submitted ? "disabled" : ""} aria-pressed="${selected}"><span class="quiz-choice-letter">${String.fromCharCode(65 + index)}</span><span>${escapeHTML(choice)}</span><span class="quiz-choice-mark">${correct ? "✓" : wrong ? "×" : ""}</span></button>`;
  }).join("");
  const explanation = quizState.submitted ? `<div class="quiz-feedback" role="status"><strong>${t(quizState.answers[quizState.index] === question.answer ? "quizCorrect" : "quizIncorrect")}</strong><p>${escapeHTML(question.explanation[language])}</p></div>` : "";
  const final = quizState.submitted ? (quizState.index === quizState.questions.length - 1 ? `<div class="quiz-finish"><strong>${t("quizScore").replace("{score}", String(gradeQuiz(quizState.questions, quizState.answers).score)).replace("{total}", String(quizState.questions.length))}</strong><button type="button" class="button button-primary button-small" data-quiz-restart>${t("quizRestart")}</button></div>` : "") : `<div class="quiz-actions"><button type="button" class="button button-primary button-small" data-quiz-check ${quizState.answers[quizState.index] === undefined ? "disabled" : ""}>${t("quizCheck")}</button>${quizState.index > 0 ? `<button type="button" class="button button-quiet button-small" data-quiz-previous>${t("quizPrevious")}</button>` : ""}</div>`;
  const next = quizState.submitted && quizState.index < quizState.questions.length - 1 ? `<button type="button" class="button button-outline button-small" data-quiz-next>${t("quizNext")}</button>` : "";
  container.innerHTML = `<div class="quiz-question"><span class="quiz-question-number">${t("quizQuestionLabel")} ${quizState.index + 1}</span><h3>${prompt}</h3><div class="quiz-choices">${choices}</div>${explanation}<div class="quiz-actions">${final}${next}</div></div>`;
}
function resetQuiz(level = $("#quiz-level")?.value || "primary") {
  quizState = { level, questions: getQuizQuestions(level), index: 0, answers: [], submitted: false, resultSaved: false };
  renderQuiz();
}
function renderLevelCounts() {
  $("[data-level-count]").forEach(node => {
    const count = resources.filter(item => item.level === node.dataset.levelCount).length;
    node.textContent = t("sampleCount").replace("{count}", String(count));
  });
}
function renderYearCategories() {
  const root = $("#year-category-grid");
  if (!root) return;
  const level = $("#level-filter")?.value || "all";
  const selectedYear = $("#year-filter")?.value || "all";
  const years = level === "all" ? schoolYears : schoolYears.filter(item => item.level === level);
  root.innerHTML = years.map(item => {
    const value = `${item.level}:${item.year}`;
    const count = resources.filter(resource => resource.level === item.level && (resource.grades || []).includes(item.year)).length;
    const selected = selectedYear === value;
    return `<button type="button" class="year-category-card ${selected ? "active" : ""}" data-school-year="${value}" aria-pressed="${selected}"><span class="year-category-level">${escapeHTML(item.level === "primary" ? t("primary") : item.level === "middle" ? t("middle") : t("secondary"))}</span><strong>${escapeHTML(item.label[language])}</strong><span class="year-category-count">${escapeHTML(t("yearResourceCount").replace("{count}", String(count)))}</span></button>`;
  }).join("");
}
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
  renderYearCategories();
}
function syncQuickTypeFilters() {
  const selected = $("#type-filter")?.value || "all";
  $(".resource-quick-filter").forEach(button => {
    const active = button.dataset.quickType === selected;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
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
    <span class="resource-type">${escapeHTML(typeLabel(item.type))} · ${escapeHTML(getDirectPdfUrl(item) ? t("pdfAvailable") : t("sample"))}</span><h3>${escapeHTML(item.title[language])}</h3><p>${escapeHTML(item.description[language])}</p>
    <div class="resource-meta"><span>${escapeHTML(item.grade[language])}</span><span>${escapeHTML(subjectCatalog.find(subject => subject.id === item.subject)?.label?.[language] || item.subject)}</span></div><div class="resource-actions">${getDirectPdfUrl(item) ? '<button type="button" class="button button-primary button-small" data-read-pdf="' + item.id + '">' + t("readPdf") + '</button>' : ""}<button type="button" class="button button-outline button-small" data-details-resource="${item.id}">${t("viewDetails")}</button><button type="button" class="button button-outline button-small" data-view-resource="${item.id}">${t("markViewed")}</button><button type="button" class="button button-quiet button-small" data-collect-resource="${item.id}">${t("addToCollection")}</button></div></article>`).join("");
  $("#empty-state").hidden = filtered.length !== 0;
  $("#resource-count").textContent = t("resourceCount").replace("{count}", String(filtered.length));
  syncQuickTypeFilters();
}
function renderResourceDetails(id) {
  const item = resources.find(resource => resource.id === id);
  if (!item) return;
  activeResourceId = item.id;
  $("#resource-dialog-type").textContent = `${typeLabel(item.type)} · ${getDirectPdfUrl(item) ? t("pdfAvailable") : t("sample")}`;
  $("#resource-dialog-title").textContent = item.title[language];
  $("#resource-dialog-description").textContent = item.description[language];
  $("#resource-dialog-level").textContent = item.grade[language];
  const years = schoolYears.filter(year => year.level === item.level && (item.grades || []).includes(year.year));
  $("#resource-dialog-years").textContent = years.map(year => year.label[language]).join("، ") || "—";
  $("#resource-dialog-subject").textContent = subjectCatalog.find(subject => subject.id === item.subject)?.label?.[language] || item.subject;
  const pdfUrl = getDirectPdfUrl(item);
  $("#resource-dialog-availability").textContent = pdfUrl ? t("pdfAvailable") : t("sampleOnly");
  $("#resource-dialog-note").textContent = pdfUrl ? t("pdfDetailNote") : t("sampleDetailNote");
  const sourceLink = $("#resource-dialog-source");
  const sourceUrl = typeof item.officialSourceUrl === "string" ? item.officialSourceUrl.trim() : "";
  let safeSourceUrl = "";
  try {
    const parsedSourceUrl = new URL(sourceUrl);
    if (parsedSourceUrl.protocol === "https:" && ["education.gov.dz", "www.education.gov.dz"].includes(parsedSourceUrl.hostname)) safeSourceUrl = parsedSourceUrl.href;
  } catch {}
  sourceLink.hidden = !safeSourceUrl;
  if (safeSourceUrl) {
    sourceLink.href = safeSourceUrl;
    sourceLink.textContent = t("officialSourceLink");
  } else {
    sourceLink.removeAttribute("href");
    sourceLink.textContent = "";
  }

  const pdfFrame = $("#resource-dialog-pdf");
  const pdfDownload = $("#resource-dialog-download");
  pdfFrame.hidden = !pdfUrl;
  pdfFrame.removeAttribute("src");
  if (pdfUrl) {
    pdfFrame.src = pdfUrl;
    pdfFrame.title = item.title[language];
    pdfDownload.hidden = false;
    pdfDownload.href = pdfUrl;
    pdfDownload.download = "";
    pdfDownload.textContent = t("downloadPdf");
  } else {
    pdfDownload.hidden = true;
    pdfDownload.removeAttribute("href");
  }
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
  root.innerHTML = collections.length ? collections.map(collection => {
    const items = collection.resourceIds.map(id => resources.find(item => item.id === id)).filter(Boolean);
    const contents = items.length ? `<ul class="collection-resources">${items.map(item => `<li><span>${escapeHTML(item.title[language])}</span><button type="button" class="collection-remove-resource" data-remove-collection-resource="${escapeHTML(item.id)}" data-collection-id="${escapeHTML(collection.id)}" aria-label="${escapeHTML(t("removeFromCollection"))}">×</button></li>`).join("")}</ul>` : `<small>${escapeHTML(t("collectionEmpty"))}</small>`;
    return `<article class="collection-item"><div class="collection-item-heading"><strong>${escapeHTML(collection.name)}</strong><button type="button" class="collection-delete" data-delete-collection="${escapeHTML(collection.id)}">${escapeHTML(t("deleteCollection"))}</button></div><span>${items.length} · ${escapeHTML(t("resourcesCount"))}</span>${contents}</article>`;
  }).join("") : `<p class="small-note">${escapeHTML(t("noCollections"))}</p>`;
}
function renderHistory() {
  const root = $("#history-list");
  if (!root) return;
  const history = getResourceHistory().filter(entry => resources.some(resource => resource.id === entry.resourceId));
  root.innerHTML = history.length ? history.slice(0, 10).map(entry => {
    const resource = resources.find(item => item.id === entry.resourceId);
    if (!resource) return "";
    return `<div class="history-item"><div class="history-item-copy"><strong>${escapeHTML(resource.title[language])}</strong><small>${escapeHTML(new Date(entry.viewedAt).toLocaleString(language === "fr" ? "fr-FR" : language === "ar" ? "ar-DZ" : "en", { dateStyle:"medium", timeStyle:"short" }))}</small></div><button type="button" class="button button-outline button-small history-resume" data-history-resource="${escapeHTML(resource.id)}">${escapeHTML(t("historyResume"))}</button></div>`;
  }).join("") : `<p class="small-note">${t("historyEmpty")}</p>`;
  renderStudyDashboard();
}
function renderNotes() {
  const root = $("#notes-list");
  if (!root) return;
  const notes = getNotes();
  root.innerHTML = notes.length ? notes.slice(0, 8).map(note => `<article class="note-item"><strong>${escapeHTML(note.title)}</strong><p>${escapeHTML(note.body)}</p><div class="note-item-footer"><small>${escapeHTML(new Date(note.updatedAt).toLocaleDateString(language === "fr" ? "fr-FR" : language === "ar" ? "ar-DZ" : "en"))}</small><button type="button" class="button button-quiet button-small note-delete" data-delete-note="${escapeHTML(note.id)}" aria-label="${t("deleteNote")}">${t("deleteNote")}</button></div></article>`).join("") : `<p class="small-note">${t("noNotes")}</p>`;
}
function renderFavorites() {
  const ids = getFavorites();
  const saved = ids.map(id => resources.find(item => item.id === id)).filter(Boolean);
  $("#favorites-list").innerHTML = saved.length ? saved.map(item => `<div class="favorite-item"><span>${escapeHTML(item.title[language])}</span><button type="button" data-remove-favorite="${item.id}" aria-label="${t("removed")}">×</button></div>`).join("") : `<p>${t("noFavorites")}</p>`;
  renderStudyDashboard();
}
function getStudyTasks() {
  const value = readJSON("study-plan", []);
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter(task => {
    if (!task || typeof task !== "object" || Array.isArray(task) ||
        typeof task.id !== "string" || !task.id.trim() || seen.has(task.id) ||
        typeof task.subject !== "string" || !task.subject.trim() ||
        !parseLocalCalendarDate(task.date) || ![15, 25, 45, 60, 90].includes(Number(task.minutes))) return false;
    seen.add(task.id);
    return true;
  }).map(task => ({ ...task, completed: task.completed === true }));
}
function renderStudyPlan() {
  const list = $("#study-plan-list");
  if (!list) return;
  const today = toLocalDateISO();
  const allTasks = sortStudyTasks(getStudyTasks(), today);
  const completed = allTasks.filter(task => task.completed).length;
  const minutes = allTasks.filter(task => !task.completed).reduce((total, task) => total + Number(task.minutes || 0), 0);
  const completedMinutes = allTasks.filter(task => task.completed).reduce((total, task) => total + Number(task.minutes || 0), 0);
  const todayTasks = allTasks.filter(task => task.date === today);
  const todayDone = todayTasks.filter(task => task.completed).length;
  const completionRate = allTasks.length ? Math.round(completed / allTasks.length * 100) : 0;
  $("#study-plan-summary").textContent = t("studyPlanSummary").replace("{done}", String(completed)).replace("{total}", String(allTasks.length)).replace("{minutes}", String(minutes));
  const progress = $("#study-progress");
  const nextSevenDays = new Date();
  nextSevenDays.setDate(nextSevenDays.getDate() + 7);
  const nextSevenDaysISO = toLocalDateISO(nextSevenDays);
  const upcomingCount = allTasks.filter(task => !task.completed && task.date >= today && task.date <= nextSevenDaysISO).length;
  const overdueCount = allTasks.filter(task => !task.completed && task.date < today).length;
  if (progress) progress.innerHTML = [
    ["progressRate", `${completionRate}%`],
    ["progressCompleted", `${completed}/${allTasks.length}`],
    ["progressMinutes", String(completedMinutes)],
    ["progressToday", `${todayDone}/${todayTasks.length}`],
    ["progressNextWeek", String(upcomingCount)],
    ["progressOverdue", String(overdueCount)]
  ].map(([key, value]) => `<div class="progress-metric"><span>${escapeHTML(t(key))}</span><strong>${escapeHTML(value)}</strong></div>`).join("");
  const progressBar = $("#study-progress-bar");
  if (progressBar) {
    progressBar.setAttribute("aria-valuenow", String(completionRate));
    progressBar.setAttribute("aria-label", t("progressRate"));
    const fill = $("span", progressBar);
    if (fill) fill.style.width = `${completionRate}%`;
  }
  const filter = $("#study-plan-filter")?.value || "all";
  const tasks = allTasks.filter(task => filter === "completed" ? task.completed : filter === "pending" ? !task.completed : filter === "overdue" ? !task.completed && task.date < today : true);
  list.innerHTML = tasks.length ? tasks.map(task => {
    const parsedDate = parseLocalCalendarDate(task.date);
    const dateLabel = parsedDate ? parsedDate.toLocaleDateString(language === "fr" ? "fr-FR" : language === "ar" ? "ar-DZ" : "en", { dateStyle: "medium" }) : task.date;
    const taskStatus = task.completed ? "" : task.date < today ? `<em class="study-task-status is-overdue">${escapeHTML(t("studyTaskOverdue"))}</em>` : task.date === today ? `<em class="study-task-status is-today">${escapeHTML(t("studyTaskToday"))}</em>` : "";
    return `<article class="study-task ${task.completed ? "is-complete" : ""} ${!task.completed && task.date < today ? "is-overdue" : ""}"><label class="study-task-check"><input type="checkbox" data-study-toggle="${escapeHTML(task.id)}" ${task.completed ? "checked" : ""}><span class="sr-only">${escapeHTML(t("markStudyTaskDone"))}</span></label><div class="study-task-content"><strong>${escapeHTML(task.subject)}</strong><span>${escapeHTML(dateLabel)} · ${escapeHTML(String(task.minutes))} ${escapeHTML(t("minutesShort"))}</span>${taskStatus}</div><button type="button" class="study-task-delete" data-study-delete="${escapeHTML(task.id)}" aria-label="${escapeHTML(t("deleteStudyTask"))}">×</button></article>`;
  }).join("") : `<p class="small-note">${escapeHTML(allTasks.length ? t("studyPlanFilterEmpty") : t("studyPlanEmpty"))}</p>`;
  renderStudyDashboard();
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
  const grades = [];
  for (const row of rows) {
    const gradeInput = row.querySelector('[name="grade"]');
    const coefficientInput = row.querySelector('[name="coefficient"]');
    const grade = gradeInput.value;
    const coefficient = coefficientInput.value;
    if (grade.trim() === "" || coefficient.trim() === "" ||
        !Number.isFinite(Number(grade)) || Number(grade) < 0 || Number(grade) > 20 ||
        !Number.isInteger(Number(coefficient)) || Number(coefficient) < 1 || Number(coefficient) > 20) {
      showToast(t("invalidGrade"));
      (grade.trim() === "" || Number(grade) < 0 || Number(grade) > 20 ? gradeInput : coefficientInput).focus();
      return;
    }
    grades.push({ grade, coefficient });
  }
  let average;
  try { average = calculateWeightedAverage(grades); }
  catch { showToast(t("invalidGrade")); return; }
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
  $(".level-card").forEach(card => {
    card.classList.remove("active");
    card.setAttribute("aria-pressed", "false");
  });
  renderCatalogFilters();
  renderYearCategories();
  renderResources();
});
$("#reset-resource-filters-empty")?.addEventListener("click", () => $("#reset-resource-filters").click());
$("#resource-search").addEventListener("input", renderResources);
function isEditableTarget(target) {
  return Boolean(target?.closest?.("input, textarea, select, [contenteditable='true'], [role='textbox']"));
}

function openKeyboardHelp() {
  const dialog = $("#keyboard-shortcuts-dialog");
  if (dialog && !dialog.open) dialog.showModal();
}

$("#keyboard-help-button")?.addEventListener("click", openKeyboardHelp);
$("#keyboard-shortcuts-close")?.addEventListener("click", () => $("#keyboard-shortcuts-dialog")?.close());
$("#keyboard-shortcuts-close-secondary")?.addEventListener("click", () => $("#keyboard-shortcuts-dialog")?.close());
$("#keyboard-shortcuts-dialog")?.addEventListener("click", event => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();
  const search = $("#resource-search");
  const helpDialog = $("#keyboard-shortcuts-dialog");
  if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k") {
    event.preventDefault();
    search?.focus();
    search?.select();
    return;
  }
  if (event.key === "Escape") {
    if (helpDialog?.open) return; // Let the native dialog close itself accessibly.
    if (document.activeElement === search && search?.value) {
      search.value = "";
      renderResources();
    }
    return;
  }
  if (helpDialog?.open || event.ctrlKey || event.metaKey || event.altKey) {
    if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey) {
      const destinations = { r: "#resources", p: "#practice", t: "#tools", d: "#study-dashboard" };
      const destination = destinations[key];
      if (destination) {
        event.preventDefault();
        document.querySelector(destination)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    return;
  }
  if (isEditableTarget(event.target)) return;
  if (key === "/" && search) {
    event.preventDefault();
    search.focus();
  } else if (event.key === "?" || event.key === "؟") {
    event.preventDefault();
    openKeyboardHelp();
  }
});
$("#level-filter").addEventListener("change", () => { selectedLevel = $("#level-filter").value; renderCatalogFilters(); renderResources(); });
$("#year-filter")?.addEventListener("change", () => { renderYearCategories(); renderResources(); });
$("#year-category-grid")?.addEventListener("click", event => {
  const button = event.target.closest("[data-school-year]");
  if (!button) return;
  const [level, year] = button.dataset.schoolYear.split(":");
  $("#level-filter").value = level;
  selectedLevel = level;
  renderCatalogFilters();
  $("#year-filter").value = `${level}:${year}`;
  $(".level-card").forEach(card => {
    const active = card.dataset.level === level;
    card.classList.toggle("active", active);
    card.setAttribute("aria-pressed", String(active));
  });
  renderYearCategories();
  $("#official-source-grade").value = `${level}-${year}`;
  renderOfficialSources();
  renderResources();
});
$("#subject-filter")?.addEventListener("change", renderResources);
$("#type-filter").addEventListener("change", renderResources);
$("#resource-quick-filters")?.addEventListener("click", event => {
  const button = event.target.closest("[data-quick-type]");
  if (!button) return;
  $("#type-filter").value = button.dataset.quickType;
  renderResources();
  $("#resources").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("#study-dashboard")?.addEventListener("click", event => {
  const button = event.target.closest("[data-dashboard-resource]");
  if (!button) return;
  const resource = resources.find(item => item.id === button.dataset.dashboardResource);
  if (!resource) return;
  recordResourceView(resource.id);
  renderResourceDetails(resource.id);
  $("#resource-dialog").showModal();
  renderHistory();
});
$("#resource-grid").addEventListener("click", event => {
  const pdfButton = event.target.closest("[data-read-pdf]");
  if (pdfButton) { renderResourceDetails(pdfButton.dataset.readPdf); $("#resource-dialog").showModal(); $("#resource-dialog-pdf").scrollIntoView({ behavior: "smooth", block: "nearest" }); return; }
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
$("#history-list")?.addEventListener("click", event => {
  const button = event.target.closest("[data-history-resource]");
  if (!button) return;
  const resource = resources.find(item => item.id === button.dataset.historyResource);
  if (!resource) return;
  recordResourceView(resource.id);
  renderHistory();
  renderResourceDetails(resource.id);
  $("#resource-dialog").showModal();
});
$("#clear-history")?.addEventListener("click", () => {
  if (!window.confirm(t("confirmClearHistory"))) return;
  try {
    if (!clearResourceHistory()) throw new Error("Could not clear history");
    renderHistory();
    showToast(t("historyCleared"));
  } catch { showToast(t("saveFailed")); }
});
$("#favorites-list").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-favorite]"); if (!button) return;
  saveFavorites(getFavorites().filter(id => id !== button.dataset.removeFavorite)); renderResources(); renderFavorites(); showToast(t("removed"));
});
$("#clear-favorites").addEventListener("click", () => {
  if (!window.confirm(t("confirmClearFavorites"))) return;
  saveFavorites([]); renderResources(); renderFavorites(); showToast(t("cleared"));
});
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
$("#study-plan-filter")?.addEventListener("change", renderStudyPlan);
$("#clear-completed-study")?.addEventListener("click", () => {
  const tasks = getStudyTasks();
  const remaining = clearCompletedStudyTasks(tasks);
  if (remaining.length === tasks.length) { showToast(t("noCompletedStudy")); return; }
  if (!window.confirm(t("confirmClearCompletedStudy"))) return;
  if (!writeJSON("study-plan", remaining)) { showToast(t("saveFailed")); return; }
  renderStudyPlan();
  showToast(t("completedStudyCleared"));
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
$("#export-backup")?.addEventListener("click", () => {
  try {
    const blob = new Blob([serializeBackup()], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `najahna-backup-${toLocalDateISO()}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(t("backupExported"));
  } catch { showToast(t("backupFailed")); }
});
$("#import-backup")?.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (!window.confirm(t("backupConfirm"))) return;
    if (file.size > 5 * 1024 * 1024) throw new Error("Backup too large");
    restoreBackup(await file.text());
    showToast(t("backupImported"));
    window.location.reload();
  } catch { showToast(t("backupInvalid")); }
  finally { event.target.value = ""; }
});
$("#collection-form")?.addEventListener("submit", event => {
  event.preventDefault();
  try { createCollection($("#collection-name").value); $("#collection-name").value = ""; renderCollections(); showToast(t("collectionCreated")); }
  catch { showToast(t("saveFailed")); }
});
$("#collections-list")?.addEventListener("click", event => {
  const removeButton = event.target.closest("[data-remove-collection-resource]");
  const deleteButton = event.target.closest("[data-delete-collection]");
  try {
    if (removeButton) {
      if (removeResourceFromCollection(removeButton.dataset.removeCollectionResource, removeButton.dataset.collectionId)) {
        renderCollections();
        showToast(t("removedFromCollection"));
      }
      return;
    }
    if (deleteButton) {
      if (!window.confirm(t("confirmDeleteCollection"))) return;
      if (deleteCollection(deleteButton.dataset.deleteCollection)) {
        renderCollections();
        showToast(t("collectionDeleted"));
      }
    }
  } catch { showToast(t("saveFailed")); }
});
$("#clear-notes")?.addEventListener("click", () => {
  if (!window.confirm(t("confirmClearNotes"))) return;
  try {
    if (!clearNotes()) throw new Error("Could not clear notes");
    renderNotes();
    showToast(t("notesCleared"));
  } catch { showToast(t("saveFailed")); }
});
$("#notes-list")?.addEventListener("click", event => {
  const button = event.target.closest("[data-delete-note]");
  if (!button) return;
  try {
    if (deleteNote(button.dataset.deleteNote)) {
      renderNotes();
      showToast(t("noteDeleted"));
    }
  } catch { showToast(t("saveFailed")); }
});
$("#note-form")?.addEventListener("submit", event => {
  event.preventDefault();
  try { saveNote({ title: $("#note-title").value, body: $("#note-body").value }); $("#note-title").value = ""; $("#note-body").value = ""; renderNotes(); showToast(t("noteSaved")); }
  catch { showToast(t("saveFailed")); }
});
$$("[data-level]").forEach(button => button.addEventListener("click", () => {
  selectedLevel = button.dataset.level; $("#level-filter").value = selectedLevel; renderCatalogFilters();
  $(".level-card").forEach(card => {
    const active = card === button;
    card.classList.toggle("active", active);
    card.setAttribute("aria-pressed", String(active));
  });
  renderResources(); $("#resources").scrollIntoView({ behavior: "smooth" }); showToast(t("levelSelected"));
}));
$("#learner-profile-form")?.addEventListener("submit", event => {
  event.preventDefault();
  try {
    saveLearnerProfile({ name: $("#learner-name").value, gradeId: $("#learner-grade").value });
    dailyChallengeAnswers = {};
    $("#learner-grade").dataset.profileLoaded = "true";
    $("#learner-name").dataset.profileLoaded = "true";
    renderDailyChallenge();
    showToast(t("learnerProfileSaved"));
  } catch {
    showToast(t("storageError"));
  }
});
$("#daily-challenge-content")?.addEventListener("change", event => {
  const input = event.target.closest('input[type="radio"][name^="daily-"]');
  if (!input) return;
  const id = input.name.slice("daily-".length);
  dailyChallengeAnswers[id] = Number(input.value);
});
$("#daily-challenge-content")?.addEventListener("submit", event => {
  if (event.target.id !== "daily-challenge-form") return;
  event.preventDefault();
  const profile = getLearnerProfile();
  if (!profile) return;
  const questions = getDailyChallengeQuestions(dailyChallengeBank, profile.gradeId, toLocalDateISO());
  if (!questions.length) return;
  const answers = questions.map(question => dailyChallengeAnswers[question.id]);
  if (answers.some(answer => !Number.isInteger(answer))) {
    showToast(t("dailyChallengeAnswerAll"));
    return;
  }
  try {
    const result = gradeDailyChallenge(questions, answers);
    saveDailyChallengeCompletion(toLocalDateISO(), profile.gradeId, result.score, result.total);
    dailyChallengeAnswers = {};
    renderDailyChallenge();
    showToast(t("dailyChallengeSaved"));
  } catch {
    showToast(t("storageError"));
  }
});
document.body.classList.toggle("dark", localStorage.getItem("najahna-theme") === "dark");
$("#theme-toggle").textContent = document.body.classList.contains("dark") ? "☀" : "☾";
$("#year").textContent = new Date().getFullYear();
$("#quiz-level")?.addEventListener("change", event => resetQuiz(event.target.value));
$("#official-source-search")?.addEventListener("input", renderOfficialSources);
$("#official-source-level")?.addEventListener("change", renderOfficialSources);
$("#official-source-kind")?.addEventListener("change", renderOfficialSources);
$("#official-source-grade")?.addEventListener("change", renderOfficialSources);
$("#official-source-subject")?.addEventListener("change", renderOfficialSources);
$("#reset-official-source-filters")?.addEventListener("click", () => { $("#official-source-search").value = ""; $("#official-source-level").value = "all"; $("#official-source-kind").value = "all"; $("#official-source-grade").value = "all"; $("#official-source-subject").value = "all"; renderOfficialSources(); });
$("#quiz-content")?.addEventListener("click", event => {
  const answer = event.target.closest("[data-quiz-answer]");
  if (answer && !quizState.submitted) { quizState.answers[quizState.index] = Number(answer.dataset.quizAnswer); renderQuiz(); return; }
  if (event.target.closest("[data-quiz-check]")) { if (quizState.answers[quizState.index] === undefined) return; quizState.submitted = true; if (quizState.index === quizState.questions.length - 1 && !quizState.resultSaved) { try { const result = gradeQuiz(quizState.questions, quizState.answers); recordQuizAttempt({ level: quizState.level, score: result.score, total: result.total }); quizState.resultSaved = true; renderQuizHistory(); } catch { showToast(t("quizHistorySaveFailed")); } } renderQuiz(); return; }
  if (event.target.closest("[data-quiz-next]")) { quizState.index += 1; quizState.submitted = false; renderQuiz(); return; }
  if (event.target.closest("[data-quiz-previous]")) { quizState.index = Math.max(0, quizState.index - 1); quizState.submitted = false; renderQuiz(); return; }
  if (event.target.closest("[data-quiz-restart]")) resetQuiz();
  if (event.target.closest("[data-clear-quiz-history]")) { if (!window.confirm(t("quizHistoryClearConfirm"))) return; if (clearQuizHistory()) { renderQuizHistory(); showToast(t("quizHistoryCleared")); } else showToast(t("quizHistorySaveFailed")); }
});

const installButton = $("#install-app");
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  pendingInstallPrompt = event;
  if (installButton) installButton.hidden = false;
});
window.addEventListener("appinstalled", () => {
  pendingInstallPrompt = null;
  if (installButton) installButton.hidden = true;
  showToast(t("installSuccess"));
});
installButton?.addEventListener("click", async () => {
  if (!pendingInstallPrompt) return;
  pendingInstallPrompt.prompt();
  await pendingInstallPrompt.userChoice;
  pendingInstallPrompt = null;
  if (installButton) installButton.hidden = true;
});
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("../../service-worker.js", import.meta.url), {
      scope: new URL("../../", import.meta.url).pathname
    }).catch(() => showToast(t("offlineSetupFailed")));
  }, { once: true });
}

setLanguage(language);
renderOfficialSources();
renderSchoolCalendar();
renderQuizHistory();
renderCatalogFilters();
renderCollections();
renderNotes();
renderHistory();
renderStudyPlan();
updateRemoveButtons();
