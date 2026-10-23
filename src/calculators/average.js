/** Calculate a coefficient-weighted average from grades out of 20. */
export function calculateWeightedAverage(items) {
  if (!Array.isArray(items) || items.length === 0) throw new TypeError("At least one grade is required.");
  let weightedTotal = 0;
  let totalCoefficient = 0;
  for (const item of items) {
    const rawGrade = item?.grade;
    const rawCoefficient = item?.coefficient;
    if (rawGrade === null || rawGrade === undefined || String(rawGrade).trim() === "") throw new RangeError("Grades must be between 0 and 20.");
    if (rawCoefficient === null || rawCoefficient === undefined || String(rawCoefficient).trim() === "") throw new RangeError("Coefficients must be positive numbers.");
    const grade = Number(rawGrade);
    const coefficient = Number(rawCoefficient);
    if (!Number.isFinite(grade) || grade < 0 || grade > 20) throw new RangeError("Grades must be between 0 and 20.");
    if (!Number.isFinite(coefficient) || coefficient <= 0) throw new RangeError("Coefficients must be positive numbers.");
    weightedTotal += grade * coefficient;
    totalCoefficient += coefficient;
  }
  return weightedTotal / totalCoefficient;
}
