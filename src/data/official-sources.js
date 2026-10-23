export const officialSourceLevels = ["all", "primary", "middle", "secondary"];
export const officialSourceKinds = ["books", "exam-papers", "pedagogical-docs"];

// These records verify the publisher/source and the existence of an indexed page,
// not the currency, rights, or availability of every file linked from that page.
export const officialSources = [
  {
    id: "onps-school-books",
    publisher: "ONPS",
    kind: "books",
    levels: ["primary", "middle", "secondary"],
    pageType: "catalog",
    checkedOn: "2026-10-23",
    url: "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires",
    title: {
      ar: "فهرس الكتب المدرسية — جميع المراحل",
      fr: "Catalogue des manuels scolaires — tous niveaux",
      en: "School textbook catalogue — all levels"
    },
    description: {
      ar: "فهرس رسمي للديوان الوطني للمطبوعات المدرسية. افتح صفحة كل كتاب للتأكد من بياناته؛ هذا الفهرس ليس ملف PDF واحداً.",
      fr: "Catalogue officiel de l’Office national des publications scolaires. Ouvrez chaque fiche pour vérifier ses informations ; ce catalogue n’est pas un PDF unique.",
      en: "Official National Office for School Publications catalogue. Open each book entry to inspect its details; this catalogue is not a single PDF."
    }
  },
  {
    id: "onps-primary-year-5",
    publisher: "ONPS",
    kind: "books",
    levels: ["primary"],
    pageType: "catalog",
    checkedOn: "2026-10-23",
    url: "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/primaire_sco/5primaire",
    title: {
      ar: "كتب السنة الخامسة ابتدائي",
      fr: "Manuels de 5e année primaire",
      en: "Primary Year 5 textbooks"
    },
    description: {
      ar: "فهرس خاص بالسنة الخامسة ابتدائي، ويعرض عناوين كتب منها العربية والتاريخ والجغرافيا والتربية المدنية.",
      fr: "Index consacré à la 5e année primaire, avec des fiches de manuels dont l’arabe, l’histoire-géographie et l’éducation civique.",
      en: "An index for Primary Year 5 with book entries including Arabic, history and geography, and civics."
    }
  },
  {
    id: "onps-primary-year-4",
    publisher: "ONPS",
    kind: "books",
    levels: ["primary"],
    pageType: "catalog",
    checkedOn: "2026-10-23",
    url: "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/primaire_sco/4primaire",
    title: {
      ar: "كتب السنة الرابعة ابتدائي",
      fr: "Manuels de 4e année primaire",
      en: "Primary Year 4 textbooks"
    },
    description: {
      ar: "فهرس السنة الرابعة ابتدائي، ويتضمن صفحة كتاب اللغة الإنجليزية ومواد أخرى.",
      fr: "Index de la 4e année primaire, qui répertorie notamment le manuel d’anglais et d’autres matières.",
      en: "Primary Year 4 index, including the English textbook entry and other subjects."
    }
  },
  {
    id: "onps-middle-books",
    publisher: "ONPS",
    kind: "books",
    levels: ["middle"],
    pageType: "catalog",
    checkedOn: "2026-10-23",
    url: "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/cem",
    title: {
      ar: "كتب التعليم المتوسط",
      fr: "Manuels du cycle moyen",
      en: "Middle-school textbooks"
    },
    description: {
      ar: "فهرس كتب التعليم المتوسط، بما فيها كتب السنة الرابعة في الرياضيات والعلوم واللغات.",
      fr: "Catalogue des manuels du cycle moyen, notamment ceux de 4e année en mathématiques, sciences et langues.",
      en: "Middle-school textbook index, including Year 4 entries for mathematics, science, and languages."
    }
  },
  {
    id: "onps-primary-english-year-4",
    publisher: "ONPS",
    kind: "books",
    levels: ["primary"],
    pageType: "publication",
    checkedOn: "2026-10-23",
    url: "https://www.onps.dz/2219",
    title: {
      ar: "كتاب اللغة الإنجليزية — السنة الرابعة ابتدائي",
      fr: "Manuel d’anglais — 4e année primaire",
      en: "English textbook — Primary Year 4"
    },
    description: {
      ar: "صفحة منشور محدد لدى الديوان. الصفحة توثق عنوان الكتاب، لكنها لا تضمن وجود تنزيل PDF مباشر.",
      fr: "Fiche d’une publication précise de l’ONPS. Elle identifie le manuel, sans garantir un téléchargement PDF direct.",
      en: "An ONPS page for a specific publication. It identifies the textbook but does not guarantee a direct PDF download."
    }
  },
  {
    id: "onps-primary-arabic-year-5",
    publisher: "ONPS",
    kind: "books",
    levels: ["primary"],
    pageType: "publication",
    checkedOn: "2026-10-23",
    url: "https://www.onps.dz/265",
    title: {
      ar: "كتاب اللغة العربية — السنة الخامسة ابتدائي",
      fr: "Manuel d’arabe — 5e année primaire",
      en: "Arabic textbook — Primary Year 5"
    },
    description: {
      ar: "صفحة الكتاب في موقع الديوان الوطني للمطبوعات المدرسية. تحقق من النسخة والبرنامج قبل الاستعمال.",
      fr: "Fiche du manuel sur le site de l’ONPS. Vérifiez l’édition et le programme avant utilisation.",
      en: "The textbook entry on the ONPS website. Check the edition and applicable curriculum before use."
    }
  },
  {
    id: "ministry-bac-annals",
    publisher: "Ministry of National Education",
    kind: "exam-papers",
    levels: ["secondary"],
    pageType: "archive",
    checkedOn: "2026-10-23",
    url: "https://www.education.gov.dz/category/%D9%85%D9%88%D8%A7%D8%B1%D8%AF-%D8%AA%D8%B1%D8%A8%D9%88%D9%8A%D8%A9/%D8%AD%D9%88%D9%84%D9%8A%D8%A7%D8%AA/",
    title: {
      ar: "حوليات امتحانات شهادة البكالوريا",
      fr: "Archives des sujets du baccalauréat",
      en: "Baccalaureate past-paper archive"
    },
    description: {
      ar: "أرشيف وزارة التربية الذي يعرّف بمواضيع السنوات السابقة وحلولها. تحقق من توفر الملفات والسنة والمادة على الصفحة الأصلية.",
      fr: "Archive du ministère présentant des sujets antérieurs et leurs corrigés. Vérifiez sur la page d’origine les fichiers, l’année et la matière.",
      en: "Ministry archive describing past papers and corrections. Verify file availability, year, and subject on the original page."
    }
  },
  {
    id: "ministry-pedagogical-docs",
    publisher: "Ministry of National Education",
    kind: "pedagogical-docs",
    levels: ["primary", "middle"],
    pageType: "archive",
    checkedOn: "2026-10-23",
    url: "https://www.education.gov.dz/category/%D9%85%D9%88%D8%A7%D8%B1%D8%AF-%D8%AA%D8%B1%D8%A8%D9%88%D9%8A%D8%A9/%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%AA%D9%86%D8%B8%D9%8A%D9%85%D9%8A%D8%A9/",
    title: {
      ar: "الوثائق البيداغوجية والتنظيمية",
      fr: "Documents pédagogiques et réglementaires",
      en: "Pedagogical and regulatory documents"
    },
    description: {
      ar: "أرشيف رسمي لوثائق بيداغوجية وتنظيمية، بعض منشوراته قديمة؛ لا تعتمدها كبرنامج حالي دون تحقق.",
      fr: "Archive officielle de documents pédagogiques et réglementaires ; certaines publications sont anciennes et ne doivent pas être considérées comme le programme actuel sans vérification.",
      en: "Official archive of pedagogical and regulatory documents. Some entries are old and must not be treated as the current curriculum without checking."
    }
  }
];

export function validateOfficialSources(records = officialSources) {
  if (!Array.isArray(records)) return { valid: false, errors: ["sources must be an array"] };
  const errors = [];
  const ids = new Set();
  records.forEach((source, index) => {
    const fail = message => errors.push({ index, id: source?.id ?? null, message });
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      fail("source must be an object");
      return;
    }
    if (typeof source.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.id)) fail("invalid stable id");
    if (ids.has(source.id)) fail("duplicate source id");
    ids.add(source.id);
    if (!["ONPS", "Ministry of National Education"].includes(source.publisher)) fail("publisher must be an approved official publisher");
    if (!officialSourceKinds.includes(source.kind)) fail("unsupported source kind");
    if (!Array.isArray(source.levels) || !source.levels.length || source.levels.some(level => !["primary", "middle", "secondary"].includes(level))) fail("invalid school levels");
    if (!["catalog", "publication", "archive"].includes(source.pageType)) fail("invalid page type");
    if (typeof source.url !== "string") fail("URL is required");
    else {
      try {
        const url = new URL(source.url);
        if (url.protocol !== "https:" || !["www.onps.dz", "www.education.gov.dz"].includes(url.hostname)) fail("source URL must use an approved official HTTPS domain");
      } catch { fail("invalid source URL"); }
    }
    if (typeof source.checkedOn !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedOn)) fail("checkedOn must use YYYY-MM-DD");
    for (const language of ["ar", "fr", "en"]) {
      if (typeof source.title?.[language] !== "string" || !source.title[language].trim()) fail(`missing ${language} title`);
      if (typeof source.description?.[language] !== "string" || !source.description[language].trim()) fail(`missing ${language} description`);
    }
  });
  return { valid: errors.length === 0, errors };
}
