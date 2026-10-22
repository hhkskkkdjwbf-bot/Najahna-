/** Calculate a coefficient-weighted average from grades out of 20. */
export function calculateWeightedAverage(items) {
  if (!Array.isArray(items) || items.length === 0) throw new TypeError("At least one grade is required.");
  let weightedTotal = 0;
  let coefficientTotal = 0;
  for (const item of items) {
    const grade = Number(item.grade);
    const coefficient = Number(item.coefficient);
    if (!Number.isFinite(grade) || grade < 0 || grade > 20) throw new RangeError("Grades must be between 0 and 20.");
    if (!Number.isInteger(coefficient) || coefficient < 1 || coefficient > 20) throw new RangeError("Coefficients must be integers between 1 and 20.");
    weightedTotal += grade * coefficient;
    coefficientTotal += coefficient;
  }
  return weightedTotal / coefficientTotal;
}
