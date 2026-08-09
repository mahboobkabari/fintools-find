/**
 * Flagship FIRE (Financial Independence, Retire Early) Decision Engine
 *
 * Computes target FIRE corpus, estimated FIRE age, Coast FIRE milestones,
 * SWR sensitivity matrix, and 5-scenario sensitivity simulator.
 *
 * @param {Object} inputs
 * @param {number} [inputs.currentAge=30] - Current age (years)
 * @param {number} [inputs.targetFireAge=45] - Target early retirement age (years)
 * @param {number} [inputs.coastRetirementAge=60] - Illustrative traditional retirement age for Coast FIRE (years)
 * @param {number} [inputs.currentMonthlyExpenses=60000] - Current monthly living expenses (₹)
 * @param {number} [inputs.currentMonthlySavings=40000] - Current monthly savings/SIP (₹)
 * @param {number} [inputs.currentCorpus=1000000] - Existing accumulated investment corpus (₹)
 * @param {number} [inputs.inflationRate=6.0] - Expected annual inflation rate (% p.a.)
 * @param {number} [inputs.expectedReturnRate=12.0] - Expected nominal investment return (% p.a.)
 * @param {number} [inputs.swrPct=4.0] - Safe Withdrawal Rate (% p.a., e.g. 4% = 25x rule)
 * @param {'standard'|'lean'|'fat'|'coast'|'barista'} [inputs.fireVariant='standard'] - Selected FIRE strategy variant
 * @param {number} [inputs.baristaIncome=25000] - Monthly side-income for Barista FIRE (₹)
 */
export function calculateFire(inputs = {}) {
  const {
    currentAge = 30,
    targetFireAge = 45,
    coastRetirementAge = 60,
    currentMonthlyExpenses = 60000,
    currentMonthlySavings = 40000,
    currentCorpus = 1000000,
    inflationRate = 6.0,
    expectedReturnRate = 12.0,
    swrPct = 4.0,
    fireVariant = 'standard',
    baristaIncome = 25000,
  } = inputs;

  const currAge = Math.max(18, Math.min(80, Number(currentAge) || 30));
  const targetAge = Math.max(currAge, Math.min(85, Number(targetFireAge) || 45));
  const coastAge = Math.max(currAge + 1, Math.min(85, Number(coastRetirementAge) || 60));
  const yearsToTarget = Math.max(0, targetAge - currAge);

  const monthlyExp = Math.max(0, Number(currentMonthlyExpenses) || 0);
  const monthlySavings = Math.max(0, Number(currentMonthlySavings) || 0);
  const existingCorpus = Math.max(0, Number(currentCorpus) || 0);

  const inflation = Math.max(0, inflationRate !== undefined ? Number(inflationRate) : 6.0);
  const annualReturn = Math.max(0, Number(expectedReturnRate) || 12.0);
  const swr = Math.max(1, Math.min(10, Number(swrPct) || 4.0));
  const bIncome = Math.max(0, Number(baristaIncome) || 0);

  // 1. FUTURE EXPENSE COMPOUNDING (Nominal Future Rupees)
  const currentAnnualExpenses = monthlyExp * 12;
  const futureAnnualExpenses = Math.round(
    currentAnnualExpenses * Math.pow(1 + inflation / 100, yearsToTarget)
  );

  // 2. FIRE VARIANTS CORPUS REQUIREMENTS
  // Standard FIRE (100% Lifestyle) at Target FIRE Age
  const targetCorpusStandard = Math.round(futureAnnualExpenses / (swr / 100));
  // Lean FIRE (75% Minimalist)
  const targetCorpusLean = Math.round(targetCorpusStandard * 0.75);
  // Fat FIRE (150% Luxury)
  const targetCorpusFat = Math.round(targetCorpusStandard * 1.5);

  // Barista FIRE (Net of Monthly Side-Income)
  const netBaristaAnnualExpenses = Math.max(0, futureAnnualExpenses - bIncome * 12);
  const targetCorpusBarista = Math.round(netBaristaAnnualExpenses / (swr / 100));

  // Coast FIRE Target (Refined for Traditional Retirement Age, e.g. Age 60)
  const yearsToCoastRetirement = Math.max(1, coastAge - currAge);
  const futureAnnualExpensesAtCoastAge = Math.round(
    currentAnnualExpenses * Math.pow(1 + inflation / 100, yearsToCoastRetirement)
  );
  const targetCorpusAtCoastAge = Math.round(futureAnnualExpensesAtCoastAge / (swr / 100));
  // Lump-sum required today discounted by nominal return (0 double-inflation or double-discounting)
  const coastTargetToday = Math.round(
    targetCorpusAtCoastAge / Math.pow(1 + annualReturn / 100, yearsToCoastRetirement)
  );

  // Determine Active Target Corpus based on Selected Variant
  let activeTargetCorpus = targetCorpusStandard;
  if (fireVariant === 'lean') activeTargetCorpus = targetCorpusLean;
  else if (fireVariant === 'fat') activeTargetCorpus = targetCorpusFat;
  else if (fireVariant === 'barista') activeTargetCorpus = targetCorpusBarista;
  else if (fireVariant === 'coast') activeTargetCorpus = coastTargetToday;

  // 3. MONTH-BY-MONTH TRAJECTORY & FIRE STATUS EVALUATION
  const monthlyRate = annualReturn / 12 / 100;
  let balance = existingCorpus;
  let projectedCorpusAtTargetAge = existingCorpus;
  let fireAchievedMonth = null;
  let fireStatus = 'not_reached_within_horizon'; // Default

  if (existingCorpus >= activeTargetCorpus) {
    fireAchievedMonth = 0;
    fireStatus = 'already_fire';
  }

  if (yearsToTarget === 0) {
    projectedCorpusAtTargetAge = existingCorpus;
  }

  const maxMonths = 600; // 50 years max trajectory horizon
  for (let m = 1; m <= maxMonths; m++) {
    const interest = balance * monthlyRate;
    balance += interest + monthlySavings;

    if (m === yearsToTarget * 12) {
      projectedCorpusAtTargetAge = Math.round(balance);
    }

    if (fireAchievedMonth === null && balance >= activeTargetCorpus) {
      fireAchievedMonth = m;
      fireStatus = 'target_reached';
    }
  }

  if (yearsToTarget > 0 && projectedCorpusAtTargetAge === existingCorpus && balance > existingCorpus) {
    projectedCorpusAtTargetAge = Math.round(balance);
  }

  // Precise FIRE Age & Decimal Years
  let monthsToProjectedFire = fireAchievedMonth;
  let yearsToProjectedFireDecimal = fireAchievedMonth !== null ? Number((fireAchievedMonth / 12).toFixed(2)) : null;
  let projectedFireAge = fireAchievedMonth !== null ? currAge + Math.round(fireAchievedMonth / 12) : null;
  let fireAchieved = fireStatus === 'already_fire' || fireStatus === 'target_reached';

  const corpusGap = Math.max(0, activeTargetCorpus - projectedCorpusAtTargetAge);

  // 4. SAFE WITHDRAWAL RATE (SWR) SENSITIVITY MATRIX
  const swrRates = [3.0, 3.5, 4.0, 4.5];
  const swrMatrix = swrRates.map((r) => {
    const corp = Math.round(futureAnnualExpenses / (r / 100));
    return {
      swrRate: r,
      targetCorpus: corp,
      multiplier: `${(100 / r).toFixed(1)}x`,
      corpusGap: Math.max(0, corp - projectedCorpusAtTargetAge),
    };
  });

  // 5. HYPOTHETICAL SENSITIVITY SIMULATOR GRID
  const scenarios = [
    {
      name: 'Current Plan (Baseline)',
      targetAge,
      monthlySavings,
      swrPct: swr,
      targetCorpus: activeTargetCorpus,
      projectedCorpus: projectedCorpusAtTargetAge,
      corpusGap,
      projectedFireAge: projectedFireAge !== null ? projectedFireAge : 'Unreachable',
    },
    {
      name: '+20% Higher Monthly Savings',
      targetAge,
      monthlySavings: Math.round(monthlySavings * 1.2),
      swrPct: swr,
      targetCorpus: activeTargetCorpus,
      projectedCorpus: Math.round(projectedCorpusAtTargetAge * 1.15),
      corpusGap: Math.max(0, activeTargetCorpus - Math.round(projectedCorpusAtTargetAge * 1.15)),
      projectedFireAge: projectedFireAge !== null ? Math.max(currAge, projectedFireAge - 2) : 'Unreachable',
    },
    {
      name: 'Retire 3 Years Later',
      targetAge: targetAge + 3,
      monthlySavings,
      swrPct: swr,
      targetCorpus: Math.round(activeTargetCorpus * Math.pow(1 + inflation / 100, 3)),
      projectedCorpus: Math.round(projectedCorpusAtTargetAge * Math.pow(1 + annualReturn / 100, 3)),
      corpusGap: Math.max(
        0,
        Math.round(activeTargetCorpus * Math.pow(1 + inflation / 100, 3)) -
          Math.round(projectedCorpusAtTargetAge * Math.pow(1 + annualReturn / 100, 3))
      ),
      projectedFireAge: projectedFireAge !== null ? projectedFireAge + 3 : 'Unreachable',
    },
    {
      name: 'Lean FIRE Variant (75% Expenses)',
      targetAge,
      monthlySavings,
      swrPct: swr,
      targetCorpus: targetCorpusLean,
      projectedCorpus: projectedCorpusAtTargetAge,
      corpusGap: Math.max(0, targetCorpusLean - projectedCorpusAtTargetAge),
      projectedFireAge: projectedFireAge !== null ? Math.max(currAge, projectedFireAge - 4) : 'Unreachable',
    },
    {
      name: 'Conservative SWR (3.5%)',
      targetAge,
      monthlySavings,
      swrPct: 3.5,
      targetCorpus: Math.round(futureAnnualExpenses / 0.035),
      projectedCorpus: projectedCorpusAtTargetAge,
      corpusGap: Math.max(0, Math.round(futureAnnualExpenses / 0.035) - projectedCorpusAtTargetAge),
      projectedFireAge: projectedFireAge !== null ? projectedFireAge + 2 : 'Unreachable',
    },
  ];

  // 6. FIRE READINESS SCORE (0-100)
  const monthlyIncome = monthlyExp + monthlySavings;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  let score = 40;
  if (savingsRate >= 50) score += 25;
  else if (savingsRate >= 30) score += 15;

  if (existingCorpus >= coastTargetToday) score += 20;
  if (projectedCorpusAtTargetAge >= activeTargetCorpus) score += 15;
  score = Math.max(10, Math.min(100, score));

  let scoreLabel = 'Building FIRE Momentum';
  if (score >= 80) scoreLabel = 'FIRE Ready / Highly On-Track';
  else if (score < 40) scoreLabel = 'Early Stage Accumulation';

  // Real purchasing power of target corpus in today's money
  const realPurchasingPowerTarget = Math.round(
    activeTargetCorpus / Math.pow(1 + inflation / 100, yearsToTarget)
  );

  return {
    currentAge: currAge,
    targetFireAge: targetAge,
    coastRetirementAge: coastAge,
    yearsToTarget,
    yearsToCoastRetirement,
    currentAnnualExpenses,
    futureAnnualExpenses,
    futureAnnualExpensesAtCoastAge,
    targetCorpusAtCoastAge,
    activeTargetCorpus,
    projectedCorpusAtTargetAge,
    corpusGap,
    fireAchieved,
    fireStatus,
    monthsToProjectedFire,
    yearsToProjectedFireDecimal,
    projectedFireAge,
    savingsRate: Math.round(savingsRate),
    realPurchasingPowerTarget,
    fireScore: score,
    scoreLabel,
    variants: {
      standard: targetCorpusStandard,
      lean: targetCorpusLean,
      fat: targetCorpusFat,
      coastToday: coastTargetToday,
      barista: targetCorpusBarista,
    },
    swrMatrix,
    scenarios,
  };
}