/**
 * Retirement Corpus Calculator Math Engine
 * Computes inflation-adjusted future retirement expense, total required nest egg corpus, and required monthly SIP.
 *
 * @param {Object} inputs
 * @param {number} [inputs.currentAge=30] - Current age in years
 * @param {number} [inputs.retirementAge=60] - Expected retirement age in years
 * @param {number} [inputs.lifeExpectancy=85] - Life expectancy in years
 * @param {number} [inputs.monthlyExpenses=50000] - Current monthly living expenses in Rupees (₹)
 * @param {number} [inputs.inflationRate=6] - Expected annual inflation rate (%)
 * @param {number} [inputs.preRetirementReturn=12] - Expected annual investment return before retirement (%)
 * @param {number} [inputs.postRetirementReturn=8] - Expected annual investment return after retirement (%)
 * @returns {{ primaryOutput: number, yearsToRetirement: number, yearsInRetirement: number, futureMonthlyExpense: number, futureAnnualExpense: number, realPostReturn: number, requiredCorpus: number, requiredMonthlySip: number }}
 */
export function calculateRetirementCorpusCalculator(inputs = {}) {
  const currentAge = inputs.currentAge ?? 30;
  const retirementAge = inputs.retirementAge ?? 60;
  const lifeExpectancy = inputs.lifeExpectancy ?? 85;
  const monthlyExpenses = inputs.monthlyExpenses ?? 50000;
  const inflationRate = inputs.inflationRate ?? 6;
  const preRetirementReturn = inputs.preRetirementReturn ?? 12;
  const postRetirementReturn = inputs.postRetirementReturn ?? 8;

  const numCurrentAge = Math.max(18, Number(currentAge));
  const numRetireAge = Math.max(numCurrentAge + 1, Number(retirementAge));
  const numLifeExp = Math.max(numRetireAge + 1, Number(lifeExpectancy));
  const numExpenses = Math.max(0, Number(monthlyExpenses));
  const numInf = Math.max(0, Number(inflationRate));
  const numPreRet = Math.max(0, Number(preRetirementReturn));
  const numPostRet = Math.max(0, Number(postRetirementReturn));

  const yearsToRetirement = numRetireAge - numCurrentAge;
  const yearsInRetirement = numLifeExp - numRetireAge;

  // Inflation-adjusted monthly expenses at age of retirement
  const futureMonthlyExpense = numExpenses * Math.pow(1 + numInf / 100, yearsToRetirement);
  const futureAnnualExpense = futureMonthlyExpense * 12;

  // Real annual rate of return post-retirement
  const realPostReturn = (1 + numPostRet / 100) / (1 + numInf / 100) - 1;

  // Total required corpus at retirement (Present value of annuity in retirement)
  let requiredCorpus = 0;
  if (Math.abs(realPostReturn) < 0.0001) {
    requiredCorpus = futureAnnualExpense * yearsInRetirement;
  } else {
    requiredCorpus =
      futureAnnualExpense *
      ((1 - Math.pow(1 + realPostReturn, -yearsInRetirement)) / realPostReturn);
  }

  // Required monthly SIP contribution before retirement
  const monthsAccum = yearsToRetirement * 12;
  const iAccum = Math.pow(1 + numPreRet / 100, 1 / 12) - 1;

  let requiredMonthlySip = 0;
  if (iAccum > 0 && monthsAccum > 0) {
    requiredMonthlySip =
      (requiredCorpus * iAccum) / ((Math.pow(1 + iAccum, monthsAccum) - 1) * (1 + iAccum));
  } else if (monthsAccum > 0) {
    requiredMonthlySip = requiredCorpus / monthsAccum;
  }

  return {
    primaryOutput: Math.round(requiredCorpus),
    yearsToRetirement,
    yearsInRetirement,
    futureMonthlyExpense: Math.round(futureMonthlyExpense),
    futureAnnualExpense: Math.round(futureAnnualExpense),
    realPostReturn: Number((realPostReturn * 100).toFixed(2)),
    requiredCorpus: Math.round(requiredCorpus),
    requiredMonthlySip: Math.round(requiredMonthlySip),
  };
}