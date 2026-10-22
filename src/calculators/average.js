/** Calculate a coefficient-weighted average from grades out of 20. */
export function calculateWeightedAverage(items) {
  if (!Array.isArray(items) || items.length === 0) throw new TypeError("At least one grade is required.");
  let weightedTotal = 0;
  let totalCoefficient = 0;
  for (const item of items) {
    const grade = Number(item?.grade);
    const coefficient = Number(item?.coefficient);
    if (!Number.isFinite(grade) || grade < 0 || grade > 20) throw new RangeError("Grades must be between 0 and 20.");
    if (!Number.isFinite(coefficient) || coefficient <= 0) throw new RangeError("Coefficients must be positive numbers.");
    weightedTotal += grade * coefficient;
    totalCoefficient += coefficient;
  }
  return weightedTotal / totalCoefficient;
}
