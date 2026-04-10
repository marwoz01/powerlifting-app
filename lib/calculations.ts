/** Epley 1RM formula */
export const epley1RM = (weight: number, reps: number): number => {
  if (reps <= 0) return weight;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

/** Round weight to nearest 2.5 kg */
export const roundTo2_5 = (weight: number): number =>
  Math.round(weight / 2.5) * 2.5;

/** Get topset weight for a given 1RM and week percentage */
export const getTopsetWeight = (oneRepMax: number, percentage: number): number =>
  roundTo2_5(oneRepMax * percentage);

/** Get backoff weight (-12.5% from topset) */
export const getBackoffWeight = (topsetWeight: number): number =>
  roundTo2_5(topsetWeight * 0.875);

/** Get volume day weight (percentage - 10%, min 60%) */
export const getVolumeWeight = (oneRepMax: number, percentage: number): number =>
  roundTo2_5(oneRepMax * Math.max(percentage - 0.10, 0.60));

/** Get technical work weight (constant 65% 1RM) */
export const getTechnicalWeight = (oneRepMax: number): number =>
  roundTo2_5(oneRepMax * 0.65);

/** Wilks score (men's formula) */
export const wilksScore = (total: number, bodyWeight: number): number => {
  const a = -216.0475144;
  const b = 16.2606339;
  const c = -0.002388645;
  const d = -0.00113732;
  const e = 7.01863e-6;
  const f = -1.291e-8;
  const bw = bodyWeight;
  const coeff = 500 / (a + b * bw + c * bw ** 2 + d * bw ** 3 + e * bw ** 4 + f * bw ** 5);
  return Math.round(total * coeff * 10) / 10;
};

/**
 * Determine training level using both training age AND strength level (Wilks).
 * Training age alone is misleading — someone with 6 years but Wilks 280
 * has way more room to grow than someone with 3 years and Wilks 380.
 *
 * The effective level is the LOWER of the two signals:
 * - Training age: <2y beginner, 2-5y intermediate, 5y+ advanced
 * - Wilks score: <300 beginner, 300-370 intermediate, 370+ advanced
 *
 * This prevents someone with lots of years but modest numbers from
 * getting an aggressive advanced periodization they can't recover from,
 * while also preventing a strong newcomer from getting baby volume.
 */
export const getTrainingLevel = (
  years: number,
  bodyWeight?: number,
  total?: number
): 'beginner' | 'intermediate' | 'advanced' => {
  const levels = ['beginner', 'intermediate', 'advanced'] as const;

  // Level from training age
  let ageLevelIdx = years < 2 ? 0 : years < 5 ? 1 : 2;

  // Level from strength (Wilks) — if data available
  if (bodyWeight && total && bodyWeight > 0 && total > 0) {
    const wilks = wilksScore(total, bodyWeight);
    const strengthLevelIdx = wilks < 300 ? 0 : wilks < 370 ? 1 : 2;
    // Use the lower of the two — conservative approach
    return levels[Math.min(ageLevelIdx, strengthLevelIdx)];
  }

  return levels[ageLevelIdx];
};

/**
 * Estimated progress after a training cycle.
 * Uses strength-to-bodyweight ratio (Wilks-like) to determine realistic gains.
 * Someone with 6yr training but Wilks 280 still has huge room to grow.
 *
 * Benchmarks (men's Wilks):
 * < 300: early intermediate — expect 7-10% per cycle
 * 300-370: solid intermediate — expect 4-7%
 * 370-430: advanced — expect 2-4%
 * 430+: elite — expect 1-2%
 */
export const estimatedProgress = (
  current1RM: number,
  level: 'beginner' | 'intermediate' | 'advanced',
  bodyWeight?: number,
  total?: number
): number => {
  let gainPercent: number;

  if (bodyWeight && total && bodyWeight > 0) {
    const wilks = wilksScore(total, bodyWeight);
    if (wilks < 300) gainPercent = 0.085;
    else if (wilks < 370) gainPercent = 0.055;
    else if (wilks < 430) gainPercent = 0.03;
    else gainPercent = 0.015;
  } else {
    // Fallback to training level
    const gains = { beginner: 0.085, intermediate: 0.055, advanced: 0.03 };
    gainPercent = gains[level];
  }

  return roundTo2_5(current1RM * (1 + gainPercent));
};

/** Format weight for display (e.g. "142.5 kg") */
export const formatWeight = (weight: number): string => {
  return `${weight} kg`;
};
