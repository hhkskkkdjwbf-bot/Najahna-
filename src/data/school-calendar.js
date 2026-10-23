export const schoolCalendarSource = "https://www.education.gov.dz/%D8%A7%D9%84%D8%B1%D8%B2%D9%86%D8%A7%D9%85%D8%A9/";

export const schoolCalendarEvents = [
  { id:"autumn-break-2026", category:"holiday", startDate:"2026-10-28", endDate:"2026-11-02", title:{ar:"عطلة الخريف",fr:"Vacances d’automne",en:"Autumn break"} },
  { id:"first-term-exams-2026", category:"exam", startDate:"2026-12-06", endDate:"2026-12-10", title:{ar:"اختبارات الفصل الأول",fr:"Évaluations du premier trimestre",en:"First-term exams"} },
  { id:"winter-break-2026", category:"holiday", startDate:"2026-12-18", endDate:"2027-01-03", title:{ar:"عطلة الشتاء",fr:"Vacances d’hiver",en:"Winter break"} },
  { id:"second-term-exams-2027", category:"exam", startDate:"2027-03-02", endDate:"2027-03-08", title:{ar:"اختبارات الفصل الثاني",fr:"Évaluations du deuxième trimestre",en:"Second-term exams"} },
  { id:"spring-break-2027", category:"holiday", startDate:"2027-03-19", endDate:"2027-04-04", title:{ar:"عطلة الربيع",fr:"Vacances de printemps",en:"Spring break"} },
  { id:"bem-2027", category:"national-exam", startDate:"2027-05-09", endDate:"2027-05-11", title:{ar:"امتحان شهادة التعليم المتوسط (BEM)",fr:"Brevet d’enseignement moyen (BEM)",en:"Middle School Certificate (BEM)"} },
  { id:"bac-2027", category:"national-exam", startDate:"2027-05-09", endDate:"2027-05-13", title:{ar:"امتحان شهادة البكالوريا",fr:"Examen du baccalauréat",en:"Baccalaureate examination"} },
  { id:"third-term-exams-2027", category:"exam", startDate:"2027-05-23", endDate:"2027-05-27", title:{ar:"اختبارات الفصل الثالث",fr:"Évaluations du troisième trimestre",en:"Third-term exams"} },
  { id:"remedial-exams-2027", category:"exam", startDate:"2027-06-22", endDate:"2027-06-23", title:{ar:"الاختبارات الاستدراكية",fr:"Évaluations de rattrapage",en:"Remedial exams"} }
];

const allowedCategories = ["holiday", "exam", "national-exam"];
const validDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + "T12:00:00Z"));

export function validateSchoolCalendar(events = schoolCalendarEvents) {
  const errors = [];
  const ids = new Set();
  if (!Array.isArray(events)) return { valid:false, errors:["events must be an array"] };
  events.forEach((event, index) => {
    const fail = message => errors.push({ index, id:event?.id ?? null, message });
    if (!event || typeof event !== "object") { fail("event must be an object"); return; }
    if (typeof event.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event.id)) fail("invalid event id");
    if (ids.has(event.id)) fail("duplicate event id");
    ids.add(event.id);
    if (!allowedCategories.includes(event.category)) fail("invalid category");
    if (!validDate(event.startDate) || !validDate(event.endDate)) fail("invalid date");
    else if (event.endDate < event.startDate) fail("end date precedes start date");
    for (const language of ["ar", "fr", "en"]) {
      if (typeof event.title?.[language] !== "string" || !event.title[language].trim()) fail("missing translated title");
    }
  });
  return { valid:errors.length === 0, errors };
}

export function getUpcomingSchoolEvents(today = new Date(), limit = 6, events = schoolCalendarEvents) {
  const date = typeof today === "string" ? today : [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
  return events
    .filter(event => event.endDate >= date)
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id))
    .slice(0, Math.max(0, limit));
}
