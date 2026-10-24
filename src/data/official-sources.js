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
    grade: "primary-4",
    subject: "english",
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
    grade: "primary-5",
    subject: "arabic",
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
    "id": "onps-primary-english-year-3",
    "publisher": "ONPS",
    "kind": "books",
    "levels": [
      "primary"
    ],
    "grade": "primary-3",
    "subject": "english",
    "pageType": "publication",
    "checkedOn": "2026-10-23",
    "url": "https://www.onps.dz/1764",
    "title": {
      "ar": "كتابي في اللغة الإنجليزية — السنة الثالثة ابتدائي",
      "fr": "Manuel d’anglais — 3e année primaire",
      "en": "English textbook — Primary Year 3"
    },
    "description": {
      "ar": "صفحة منشور لدى الديوان الوطني للمطبوعات المدرسية. الصفحة تعرّف بالكتاب؛ لم يتم تأكيد تنزيل PDF مباشر أو صلاحية النسخة للبرنامج الحالي.",
      "fr": "Fiche de publication de l’ONPS. Elle identifie le manuel ; le téléchargement PDF direct et l’adéquation au programme actuel ne sont pas confirmés.",
      "en": "ONPS publication entry. It identifies the textbook; a direct PDF download and applicability to the current curriculum are not confirmed."
    }
  },
  {
    "id": "onps-middle-french-year-4",
    "publisher": "ONPS",
    "kind": "books",
    "levels": [
      "middle"
    ],
    "grade": "middle-4",
    "subject": "french",
    "pageType": "publication",
    "checkedOn": "2026-10-23",
    "url": "https://www.onps.dz/521",
    "title": {
      "ar": "كتاب اللغة الفرنسية — السنة الرابعة متوسط",
      "fr": "Manuel de français — 4e année moyenne",
      "en": "French textbook — Middle School Year 4"
    },
    "description": {
      "ar": "صفحة كتاب رسمية لدى الديوان، تشير إلى غلاف نسخة 2022–2023. تحقق من ملاءمة الطبعة للبرنامج الحالي؛ لا يوجد تأكيد على تنزيل PDF مباشر.",
      "fr": "Fiche officielle de l’ONPS montrant une couverture de l’édition 2022–2023. Vérifiez l’adéquation au programme actuel ; aucun PDF direct n’est confirmé.",
      "en": "Official ONPS entry showing a 2022–2023 edition cover. Check current curriculum applicability; a direct PDF download is not confirmed."
    }
  },
  {
    "id": "onps-middle-physics-year-4",
    "publisher": "ONPS",
    "kind": "books",
    "levels": [
      "middle"
    ],
    "grade": "middle-4",
    "subject": "physics",
    "pageType": "publication",
    "checkedOn": "2026-10-23",
    "url": "https://www.onps.dz/480",
    "title": {
      "ar": "كتاب العلوم الفيزيائية والتكنولوجيا — السنة الرابعة متوسط",
      "fr": "Manuel de physique et technologie — 4e année moyenne",
      "en": "Physics and Technology textbook — Middle School Year 4"
    },
    "description": {
      "ar": "صفحة كتاب رسمية لدى الديوان، تشير إلى غلاف نسخة 2022–2023. تحقق من ملاءمة الطبعة للبرنامج الحالي؛ لا يوجد تأكيد على تنزيل PDF مباشر.",
      "fr": "Fiche officielle de l’ONPS montrant une couverture de l’édition 2022–2023. Vérifiez l’adéquation au programme actuel ; aucun PDF direct n’est confirmé.",
      "en": "Official ONPS entry showing a 2022–2023 edition cover. Check current curriculum applicability; a direct PDF download is not confirmed."
    }
  },
  {
    "id": "onps-secondary-islamic-studies-year-1",
    "publisher": "ONPS",
    "kind": "books",
    "levels": [
      "secondary"
    ],
    "grade": "secondary-1",
    "subject": "islamic-studies",
    "pageType": "publication",
    "checkedOn": "2026-10-23",
    "url": "https://www.onps.dz/598",
    "title": {
      "ar": "كتاب العلوم الإسلامية — السنة الأولى ثانوي، جذع مشترك آداب",
      "fr": "Manuel d’études islamiques — 1re année secondaire, tronc commun lettres",
      "en": "Islamic Studies textbook — Secondary Year 1, Arts common core"
    },
    "description": {
      "ar": "صفحة منشور رسمية للكتاب في جذع الآداب المشترك. تحقق من الشعبة والطبعة قبل الاستعمال؛ لا يوجد تأكيد على تنزيل PDF مباشر.",
      "fr": "Fiche officielle du manuel pour le tronc commun lettres. Vérifiez la filière et l’édition avant utilisation ; aucun PDF direct n’est confirmé.",
      "en": "Official publication entry for the Arts common core. Verify stream and edition before use; a direct PDF download is not confirmed."
    }
  },
  {
    "id": "onps-secondary-history-year-1",
    "publisher": "ONPS",
    "kind": "books",
    "levels": [
      "secondary"
    ],
    "grade": "secondary-1",
    "subject": "history",
    "pageType": "publication",
    "checkedOn": "2026-10-23",
    "url": "https://www.onps.dz/596",
    "title": {
      "ar": "كتاب التاريخ — السنة الأولى ثانوي، جذع مشترك آداب",
      "fr": "Manuel d’histoire — 1re année secondaire, tronc commun lettres",
      "en": "History textbook — Secondary Year 1, Arts common core"
    },
    "description": {
      "ar": "صفحة منشور رسمية للكتاب في جذع الآداب المشترك. تحقق من الشعبة والطبعة قبل الاستعمال؛ لا يوجد تأكيد على تنزيل PDF مباشر.",
      "fr": "Fiche officielle du manuel pour le tronc commun lettres. Vérifiez la filière et l’édition avant utilisation ; aucun PDF direct n’est confirmé.",
      "en": "Official publication entry for the Arts common core. Verify stream and edition before use; a direct PDF download is not confirmed."
    }
  },
  {
    id: "onps-digital-library-guide",
    publisher: "ONPS",
    kind: "books",
    levels: ["primary"],
    pageType: "guide",
    publishedOn: "2023-09-25",
    checkedOn: "2026-10-23",
    url: "https://www.onps.dz/1581",
    title: {
      ar: "دليل الوصول إلى الكتب المدرسية الرقمية",
      fr: "Guide officiel d’accès aux manuels numériques",
      en: "Official digital textbook access guide"
    },
    description: {
      ar: "صفحة إرشادية رسمية تشرح تطبيق مكتبتي الرقمية وتفعيله على أندرويد أو ويندوز. ليست ملف PDF لكتاب مدرسي، وتذكر أن التفعيل مرتبط بجهاز واحد.",
      fr: "Page officielle expliquant l’application Ma Bibliothèque numérique et son activation sur Android ou Windows. Ce n’est pas un manuel PDF ; la page indique une activation limitée à un appareil.",
      en: "Official guide to the My Digital Library app and activation on Android or Windows. This is not a textbook PDF; the page states activation is limited to one device."
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
  },
{
  "id": "onps-catalog-primary-1",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "primary"
  ],
  "grade": "primary-1",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/primaire_sco/1primaire",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الأولى ابتدائي",
    "fr": "Catalogue ONPS — 1re année primaire",
    "en": "ONPS catalogue — Primary Year 1"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
},
{
  "id": "onps-catalog-primary-2",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "primary"
  ],
  "grade": "primary-2",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/primaire_sco/2primaire",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الثانية ابتدائي",
    "fr": "Catalogue ONPS — 2e année primaire",
    "en": "ONPS catalogue — Primary Year 2"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
},
{
  "id": "onps-catalog-primary-3",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "primary"
  ],
  "grade": "primary-3",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/primaire_sco/3primaire",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الثالثة ابتدائي",
    "fr": "Catalogue ONPS — 3e année primaire",
    "en": "ONPS catalogue — Primary Year 3"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
},
{
  "id": "onps-catalog-primary-4",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "primary"
  ],
  "grade": "primary-4",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/primaire_sco/4primaire",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الرابعة ابتدائي",
    "fr": "Catalogue ONPS — 4e année primaire",
    "en": "ONPS catalogue — Primary Year 4"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
},
{
  "id": "onps-catalog-primary-5",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "primary"
  ],
  "grade": "primary-5",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/primaire_sco/5primaire",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الخامسة ابتدائي",
    "fr": "Catalogue ONPS — 5e année primaire",
    "en": "ONPS catalogue — Primary Year 5"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
},
{
  "id": "onps-catalog-middle-1",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "middle"
  ],
  "grade": "middle-1",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/cem/1cem",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الأولى متوسط",
    "fr": "Catalogue ONPS — 1re année moyenne",
    "en": "ONPS catalogue — Middle School Year 1"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
},
{
  "id": "onps-catalog-middle-2",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "middle"
  ],
  "grade": "middle-2",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/cem/2cem",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الثانية متوسط",
    "fr": "Catalogue ONPS — 2e année moyenne",
    "en": "ONPS catalogue — Middle School Year 2"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
},
{
  "id": "onps-catalog-middle-3",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "middle"
  ],
  "grade": "middle-3",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/cem/3cem",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الثالثة متوسط",
    "fr": "Catalogue ONPS — 3e année moyenne",
    "en": "ONPS catalogue — Middle School Year 3"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
},
{
  "id": "onps-catalog-middle-4",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "middle"
  ],
  "grade": "middle-4",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/cem/4cem",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الرابعة متوسط",
    "fr": "Catalogue ONPS — 4e année moyenne",
    "en": "ONPS catalogue — Middle School Year 4"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
},
{
  "id": "onps-catalog-secondary-1",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "secondary"
  ],
  "grade": "secondary-1",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/lycee/1lycee",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الأولى ثانوي",
    "fr": "Catalogue ONPS — 1re année secondaire",
    "en": "ONPS catalogue — Secondary Year 1"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
},
{
  "id": "onps-catalog-secondary-2",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "secondary"
  ],
  "grade": "secondary-2",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/lycee/2lycee",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الثانية ثانوي",
    "fr": "Catalogue ONPS — 2e année secondaire",
    "en": "ONPS catalogue — Secondary Year 2"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
},
{
  "id": "onps-catalog-secondary-3",
  "publisher": "ONPS",
  "kind": "books",
  "levels": [
    "secondary"
  ],
  "grade": "secondary-3",
  "pageType": "catalog",
  "checkedOn": "2026-10-24",
  "url": "https://www.onps.dz/category/%D8%A7%D9%84%D9%83%D8%AA%D8%A8/scolaires/lycee/3lycee",
  "title": {
    "ar": "فهرس الكتب المدرسية — السنة الثالثة ثانوي",
    "fr": "Catalogue ONPS — 3e année secondaire",
    "en": "ONPS catalogue — Secondary Year 3"
  },
  "description": {
    "ar": "فهرس رسمي لكتب هذا المستوى على موقع الديوان الوطني للمطبوعات المدرسية. هذه صفحة فهرس وليست ملف PDF مباشرًا؛ تحقق من عنوان الكتاب والطبعة داخل الصفحة.",
    "fr": "Catalogue officiel ONPS pour cette année scolaire. Il s’agit d’une page de catalogue, pas d’un PDF direct ; vérifiez le titre et l’édition sur la page source.",
    "en": "Official ONPS catalogue for this school year. This is a catalogue page, not a direct PDF; verify the textbook title and edition on the source page."
  }
}
];

function isValidISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

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
    if (!["catalog", "publication", "archive", "guide"].includes(source.pageType)) fail("invalid page type");
    const allowedGrades = ["primary-1", "primary-2", "primary-3", "primary-4", "primary-5", "middle-1", "middle-2", "middle-3", "middle-4", "secondary-1", "secondary-2", "secondary-3"];
    const allowedSubjects = ["arabic", "english", "french", "physics", "islamic-studies", "history"];
    if (source.grade !== undefined && !allowedGrades.includes(source.grade)) fail("invalid grade");
    if (source.subject !== undefined && !allowedSubjects.includes(source.subject)) fail("invalid subject");
    if (source.pageType !== "catalog" && (source.grade === undefined) !== (source.subject === undefined)) fail("grade and subject must be provided together");
    if (source.pageType === "publication" && (!source.grade || !source.subject)) fail("publication entries require grade and subject metadata");
    if (source.grade && !source.levels?.includes(source.grade.split("-")[0])) fail("grade does not match declared school levels");
    if (source.pageType === "publication" && (!source.grade || !source.subject)) fail("publication entries require grade and subject metadata");
    if (typeof source.url !== "string") fail("URL is required");
    else {
      try {
        const url = new URL(source.url);
        if (url.protocol !== "https:" || !["www.onps.dz", "www.education.gov.dz"].includes(url.hostname)) fail("source URL must use an approved official HTTPS domain");
      } catch { fail("invalid source URL"); }
    }
    if (!isValidISODate(source.checkedOn)) fail("checkedOn must use a valid YYYY-MM-DD date");
    if (source.publishedOn !== undefined && !isValidISODate(source.publishedOn)) fail("publishedOn must use a valid YYYY-MM-DD date");
    for (const language of ["ar", "fr", "en"]) {
      if (typeof source.title?.[language] !== "string" || !source.title[language].trim()) fail(`missing ${language} title`);
      if (typeof source.description?.[language] !== "string" || !source.description[language].trim()) fail(`missing ${language} description`);
    }
  });
  return { valid: errors.length === 0, errors };
}
