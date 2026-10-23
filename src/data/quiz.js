/**
 * Short, original practice questions for demonstrating the quiz experience.
 * These are learning examples, not official exam questions.
 */
export const quizQuestions = [
  { id:"p-math-1", level:"primary", subject:"math", prompt:{ar:"ما ناتج 7 × 8؟",fr:"Combien font 7 × 8 ?",en:"What is 7 × 8?"}, choices:{ar:["54","56","64","48"],fr:["54","56","64","48"],en:["54","56","64","48"]}, answer:1, explanation:{ar:"7 مجموعات من 8 تساوي 56.",fr:"7 groupes de 8 font 56.",en:"7 groups of 8 equal 56."} },
  { id:"p-math-2", level:"primary", subject:"math", prompt:{ar:"ما ربع العدد 20؟",fr:"Quel est le quart de 20 ?",en:"What is one quarter of 20?"}, choices:{ar:["4","5","10","15"],fr:["4","5","10","15"],en:["4","5","10","15"]}, answer:1, explanation:{ar:"20 ÷ 4 = 5.",fr:"20 ÷ 4 = 5.",en:"20 ÷ 4 = 5."} },
  { id:"p-math-3", level:"primary", subject:"math", prompt:{ar:"كم دقيقة في ساعتين؟",fr:"Combien de minutes y a-t-il dans deux heures ?",en:"How many minutes are in two hours?"}, choices:{ar:["60","90","120","200"],fr:["60","90","120","200"],en:["60","90","120","200"]}, answer:2, explanation:{ar:"كل ساعة فيها 60 دقيقة، إذن 2 × 60 = 120.",fr:"Une heure compte 60 minutes, donc 2 × 60 = 120.",en:"Each hour has 60 minutes, so 2 × 60 = 120."} },
  { id:"m-math-1", level:"middle", subject:"math", prompt:{ar:"حل المعادلة: 3x = 21",fr:"Résolvez : 3x = 21",en:"Solve: 3x = 21"}, choices:{ar:["x = 6","x = 7","x = 18","x = 24"],fr:["x = 6","x = 7","x = 18","x = 24"],en:["x = 6","x = 7","x = 18","x = 24"]}, answer:1, explanation:{ar:"نقسم الطرفين على 3 فنحصل على x = 7.",fr:"On divise les deux membres par 3 : x = 7.",en:"Divide both sides by 3 to get x = 7."} },
  { id:"m-math-2", level:"middle", subject:"math", prompt:{ar:"ما مساحة مستطيل طوله 8 سم وعرضه 3 سم؟",fr:"Quelle est l’aire d’un rectangle de 8 cm sur 3 cm ?",en:"What is the area of a rectangle 8 cm by 3 cm?"}, choices:{ar:["11 سم²","22 سم²","24 سم²","16 سم²"],fr:["11 cm²","22 cm²","24 cm²","16 cm²"],en:["11 cm²","22 cm²","24 cm²","16 cm²"]}, answer:2, explanation:{ar:"المساحة = الطول × العرض = 8 × 3 = 24 سم².",fr:"Aire = longueur × largeur = 8 × 3 = 24 cm².",en:"Area = length × width = 8 × 3 = 24 cm²."} },
  { id:"m-math-3", level:"middle", subject:"math", prompt:{ar:"حوّل 0.75 إلى كسر مبسط.",fr:"Écrivez 0,75 sous forme de fraction simplifiée.",en:"Write 0.75 as a simplified fraction."}, choices:{ar:["1/2","2/3","3/4","4/5"],fr:["1/2","2/3","3/4","4/5"],en:["1/2","2/3","3/4","4/5"]}, answer:2, explanation:{ar:"0.75 = 75/100 = 3/4 بعد الاختزال.",fr:"0,75 = 75/100 = 3/4 après simplification.",en:"0.75 = 75/100 = 3/4 when simplified."} },
  { id:"s-math-1", level:"secondary", subject:"math", prompt:{ar:"إذا كان f(x) = 2x + 3، فما قيمة f(4)؟",fr:"Si f(x) = 2x + 3, quelle est la valeur de f(4) ?",en:"If f(x) = 2x + 3, what is f(4)?"}, choices:{ar:["8","10","11","14"],fr:["8","10","11","14"],en:["8","10","11","14"]}, answer:2, explanation:{ar:"نعوّض x بـ 4: f(4) = 2 × 4 + 3 = 11.",fr:"On remplace x par 4 : f(4) = 2 × 4 + 3 = 11.",en:"Substitute x = 4: f(4) = 2 × 4 + 3 = 11."} },
  { id:"s-math-2", level:"secondary", subject:"math", prompt:{ar:"ما مشتقة الدالة f(x) = x²؟",fr:"Quelle est la dérivée de f(x) = x² ?",en:"What is the derivative of f(x) = x²?"}, choices:{ar:["x","2x","x³","2"],fr:["x","2x","x³","2"],en:["x","2x","x³","2"]}, answer:1, explanation:{ar:"باستعمال قاعدة القوة، مشتقة x² هي 2x.",fr:"Avec la règle de puissance, la dérivée de x² est 2x.",en:"By the power rule, the derivative of x² is 2x."} },
  { id:"s-math-3", level:"secondary", subject:"math", prompt:{ar:"ما حلول x² = 9 ضمن الأعداد الحقيقية؟",fr:"Quelles sont les solutions réelles de x² = 9 ?",en:"What are the real solutions of x² = 9?"}, choices:{ar:["3 فقط","−3 فقط","−3 و3","9 و−9"],fr:["3 uniquement","−3 uniquement","−3 et 3","9 et −9"],en:["3 only","−3 only","−3 and 3","9 and −9"]}, answer:2, explanation:{ar:"كل من 3 و−3 مربعه يساوي 9.",fr:"Le carré de 3 et celui de −3 valent 9.",en:"Both 3 and −3 have a square equal to 9."} }
];

export function getQuizQuestions(level = "all") {
  const valid = new Set(["primary", "middle", "secondary"]);
  return quizQuestions.filter(question => level === "all" || (valid.has(level) && question.level === level));
}

export function gradeQuiz(questions, answers) {
  if (!Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
    throw new TypeError("Answers must match the question list.");
  }
  let score = 0;
  for (let i = 0; i < questions.length; i += 1) {
    if (!Number.isInteger(answers[i]) || answers[i] < 0 || answers[i] >= questions[i].choices.en.length) {
      throw new RangeError("Each answer must be a valid choice index.");
    }
    if (answers[i] === questions[i].answer) score += 1;
  }
  return { score, total: questions.length, percentage: questions.length ? Math.round(score / questions.length * 100) : 0 };
}
