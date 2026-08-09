/**
 * Flagship Pension & Annuity Decision Engine (V3)
 * Implements Statutory EPFO EPS-95 Rules & Income Tax Section 10(10A) Commutation Provisions:
 * - Single Life, Joint Life (100% Spouse), Return of Purchase Price (ROP), and Guaranteed Period Annuities
 * - EPFO EPS-95 Statutory Pension Formula: Monthly Pension = (Pensionable Salary * Pensionable Service) / 70
 * - EPS-95 2-Year Service Bonus rule for Pensionable Service >= 20 years (Capped at ₹15,000 salary)
 * - Income Tax Section 10(10A) Pension Commutation Exemption Auditor:
 *   - Government Employees: 100% commuted lump sum tax-exempt
 *   - Private Sector (Covered by Gratuity): Up to 1/3rd (33.33%) commuted lump sum tax-exempt
 *   - Private Sector (Not Covered by Gratuity): Up to 1/2 (50.00%) commuted lump sum tax-exempt
 * - Inflation-Adjusted Real Purchasing Power Pension Engine
 * - Guaranteed Annuity vs Equity SWP Comparative Corpus Sustainability Simulator
 * - 20-Year Cash Flow Payout Schedule Generation
 *
 * @param {Object} inputs
 * @param {number} [inputs.pensionCorpus=5000000] - Initial retirement pension corpus (₹)
 * @param {number} [inputs.annuityRate=6.5] - Assumed benchmark annuity rate (% p.a.)
 * @param {'rop'|'single_life'|'joint_life'|'guaranteed_20y'} [inputs.annuityType='rop'] - Annuity payout variant
 * @param {'private_gratuity'|'private_non_gratuity'|'government'} [inputs.employmentType='private_gratuity'] - Employment tax category
 * @param {number} [inputs.commutationPct=0] - Percentage of corpus commuted as lump sum (0 to 100%)
 * @param {number} [inputs.epsSalary=15000] - EPS-95 pensionable monthly salary (capped at ₹15,000)
 * @param {number} [inputs.epsServiceYears=0] - EPFO pensionable service years
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (%) for real purchasing power
 * @param {number} [inputs.expectedSwpReturn=8.5] - Expected annual return (%) for SWP comparison
 * @param {string} [inputs.currency='INR'] - Currency code ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {Object} Structured Pension & Annuity decision model
 */
export function calculatePensionCalculator(inputs = {}) {
  const {
    pensionCorpus = 5000000,
    annuityRate = 6.5,
    annuityType = 'rop',
    employmentType = 'private_gratuity',
    commutationPct = 0,
    epsSalary = 15000,
    epsServiceYears = 0,
    inflationRate = 5.0,
    expectedSwpReturn = 8.5,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION
  const rawCorpus = Math.max(0, Number(pensionCorpus) || 0);
  const baseRate = Math.max(0, Math.min(20, Number(annuityRate) || 0));
  const commPct = Math.max(0, Math.min(100, Number(commutationPct) || 0));
  const rawEpsSalary = Math.max(0, Math.min(15000, Number(epsSalary) || 0)); // Statutory ceiling ₹15,000 under EPS-95
  const rawEpsYears = Math.max(0, Math.min(50, Number(epsServiceYears) || 0));
  const inflPct = Math.max(0, Math.min(20, Number(inflationRate) || 0));
  const swpReturnPct = Math.max(0, Math.min(25, Number(expectedSwpReturn) || 0));

  // Handle Zero Corpus & Zero EPS Edge Case
  if (rawCorpus === 0 && rawEpsYears === 0) {
    return createZeroPensionResult(currency);
  }

  // 2. SECTION 10(10A) COMMUTATION TAX AUDIT
  const rawCommutedLumpSum = Math.round(rawCorpus * (commPct / 100));
  const netAnnuityCorpus = Math.max(0, rawCorpus - rawCommutedLumpSum);

  let taxExemptCommutationFraction = 1 / 3;
  if (employmentType === 'government') {
    taxExemptCommutationFraction = 1.0; // 100% tax-free for Govt employees
  } else if (employmentType === 'private_non_gratuity') {
    taxExemptCommutationFraction = 1 / 2; // 50% tax-free if not covered by Gratuity Act
  } else {
    taxExemptCommutationFraction = 1 / 3; // 33.33% tax-free if covered by Gratuity Act
  }

  const maxTaxFreeCommutedAmount = Math.round(rawCorpus * taxExemptCommutationFraction);
  const exemptCommutedLumpSum = Math.min(rawCommutedLumpSum, maxTaxFreeCommutedAmount);
  const taxableCommutedLumpSum = Math.max(0, rawCommutedLumpSum - exemptCommutedLumpSum);

  // 3. ANNUITY PAYOUT CALCULATIONS BY VARIANT
  let rateAdjustment = 0;
  if (annuityType === 'single_life') {
    rateAdjustment = 0.5; // Single life pays higher annuity rate
  } else if (annuityType === 'joint_life') {
    rateAdjustment = -0.3; // Joint life pays slightly lower annuity rate
  } else if (annuityType === 'guaranteed_20y') {
    rateAdjustment = 0.2; // 20Y guaranteed annuity
  } else {
    rateAdjustment = 0.0; // Return of Purchase Price (ROP) baseline
  }

  const effectiveAnnuityRate = Math.max(0.1, baseRate + rateAdjustment);
  const annualAnnuityPension = Math.round(netAnnuityCorpus * (effectiveAnnuityRate / 100));
  const monthlyAnnuityPension = Math.round(annualAnnuityPension / 12);

  // 4. EPFO EPS-95 STATUTORY PENSION FORMULA
  // Minimum 10 years required for monthly pension payout
  const isEpsEligible = rawEpsYears >= 10;
  let effectiveServiceYears = rawEpsYears;

  if (isEpsEligible && rawEpsYears >= 20) {
    effectiveServiceYears = Math.min(37, rawEpsYears + 2); // 2-Year Bonus for >= 20Y service
  }

  let epsMonthlyPension = 0;
  if (isEpsEligible) {
    epsMonthlyPension = Math.round((rawEpsSalary * effectiveServiceYears) / 70);
  }
  const epsAnnualPension = epsMonthlyPension * 12;

  // 5. COMBINED MONTHLY & ANNUAL PENSION PAYOUTS
  const totalMonthlyIncome = monthlyAnnuityPension + epsMonthlyPension;
  const totalAnnualIncome = annualAnnuityPension + epsAnnualPension;

  // 6. INFLATION-ADJUSTED REAL PURCHASING POWER (20 YEARS)
  const purchasingPowerMonthly = Math.round(totalMonthlyIncome / Math.pow(1 + inflPct / 100, 20));

  // 7. PENSION ANNUITY vs EQUITY SWP COMPARISON (20-YEAR HORIZON)
  const swpMonthlyReturn = (swpReturnPct / 12) / 100;
  let swpBalance = netAnnuityCorpus;

  for (let m = 1; m <= 240; m++) {
    swpBalance = swpBalance * (1 + swpMonthlyReturn) - monthlyAnnuityPension;
  }
  const swpEndingBalance = Math.max(0, Math.round(swpBalance));
  const swpTotalWithdrawn = monthlyAnnuityPension * 240;

  // 8. 20-YEAR CASH FLOW PAYOUT SCHEDULE
  const yearlySchedule = [];
  let cumulativePensionRunning = 0;

  for (let y = 1; y <= 20; y++) {
    cumulativePensionRunning += totalAnnualIncome;
    const inflAdjustedAnnual = Math.round(totalAnnualIncome / Math.pow(1 + inflPct / 100, y));

    yearlySchedule.push({
      year: y,
      annualAnnuityPension,
      epsAnnualPension,
      totalAnnualIncome,
      cumulativePension: cumulativePensionRunning,
      inflationAdjustedAnnual: inflAdjustedAnnual,
    });
  }

  // 9. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline_rop',
      label: 'Return of Purchase Price (ROP)',
      corpus: rawCorpus,
      monthlyPension: monthlyAnnuityPension + epsMonthlyPension,
      annualPension: totalAnnualIncome,
      corpusPreserved: netAnnuityCorpus,
    },
    {
      id: 'single_life_max',
      label: 'Single Life Annuity (+0.5% Payout)',
      corpus: rawCorpus,
      monthlyPension: Math.round((netAnnuityCorpus * ((baseRate + 0.5) / 100)) / 12) + epsMonthlyPension,
      annualPension: Math.round(netAnnuityCorpus * ((baseRate + 0.5) / 100)) + epsAnnualPension,
      corpusPreserved: 0,
    },
    {
      id: 'joint_spouse',
      label: 'Joint Life Spouse Annuity (100% Spouse)',
      corpus: rawCorpus,
      monthlyPension: Math.round((netAnnuityCorpus * ((baseRate - 0.3) / 100)) / 12) + epsMonthlyPension,
      annualPension: Math.round(netAnnuityCorpus * ((baseRate - 0.3) / 100)) + epsAnnualPension,
      corpusPreserved: 0,
    },
  ];

  // 10. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  let heroText = '';
  if (rawCorpus > 0 && isEpsEligible) {
    heroText = `Your ${currencySymbol}${rawCorpus.toLocaleString()} corpus and ${rawEpsYears}Y EPS service generate a total guaranteed monthly pension of ${currencySymbol}${totalMonthlyIncome.toLocaleString()}/month (${currencySymbol}${totalAnnualIncome.toLocaleString()}/year).`;
  } else if (rawCorpus > 0) {
    heroText = `Your ${currencySymbol}${netAnnuityCorpus.toLocaleString()} net annuity corpus generates a guaranteed monthly pension of ${currencySymbol}${monthlyAnnuityPension.toLocaleString()}/month (${currencySymbol}${annualAnnuityPension.toLocaleString()}/year) at ${effectiveAnnuityRate.toFixed(2)}% p.a.`;
  } else {
    heroText = `Your ${rawEpsYears} years of EPFO pensionable service yields a statutory EPS-95 monthly pension of ${currencySymbol}${epsMonthlyPension.toLocaleString()}/month.`;
  }

  return {
    pensionCorpus: rawCorpus,
    annuityRate: baseRate,
    effectiveAnnuityRate,
    annuityType,
    employmentType,
    commutationPct: commPct,
    epsSalary: rawEpsSalary,
    epsServiceYears: rawEpsYears,
    inflationRate: inflPct,
    expectedSwpReturn: swpReturnPct,
    currency,

    // Primary Payout Outputs
    primaryOutput: totalMonthlyIncome,
    totalMonthlyIncome,
    totalAnnualIncome,
    monthlyAnnuityPension,
    annualAnnuityPension,

    // Section 10(10A) Commutation Tax Audit
    rawCommutedLumpSum,
    netAnnuityCorpus,
    taxExemptCommutationFraction,
    maxTaxFreeCommutedAmount,
    exemptCommutedLumpSum,
    taxableCommutedLumpSum,

    // EPFO EPS-95 Audit
    isEpsEligible,
    effectiveServiceYears,
    epsMonthlyPension,
    epsAnnualPension,

    // Purchasing Power & SWP Comparison
    purchasingPowerMonthly,
    swpEndingBalance,
    swpTotalWithdrawn,

    // Schedules & Matrix
    yearlySchedule,
    scenarios,
    heroText,
  };
}

/**
 * Fallback Engine Result for Zero Input
 */
function createZeroPensionResult(currency = 'INR') {
  return {
    pensionCorpus: 0,
    annuityRate: 6.5,
    effectiveAnnuityRate: 6.5,
    annuityType: 'rop',
    employmentType: 'private_gratuity',
    commutationPct: 0,
    epsSalary: 15000,
    epsServiceYears: 0,
    inflationRate: 5.0,
    expectedSwpReturn: 8.5,
    currency,

    primaryOutput: 0,
    totalMonthlyIncome: 0,
    totalAnnualIncome: 0,
    monthlyAnnuityPension: 0,
    annualAnnuityPension: 0,

    rawCommutedLumpSum: 0,
    netAnnuityCorpus: 0,
    taxExemptCommutationFraction: 1 / 3,
    maxTaxFreeCommutedAmount: 0,
    exemptCommutedLumpSum: 0,
    taxableCommutedLumpSum: 0,

    isEpsEligible: false,
    effectiveServiceYears: 0,
    epsMonthlyPension: 0,
    epsAnnualPension: 0,

    purchasingPowerMonthly: 0,
    swpEndingBalance: 0,
    swpTotalWithdrawn: 0,

    yearlySchedule: [],
    scenarios: [],
    heroText: 'Please enter your pension corpus or EPFO service years to compute your guaranteed monthly pension income.',
  };
}