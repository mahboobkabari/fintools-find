/**
 * Flagship Voluntary Provident Fund (VPF) Math & Decision Engine (V3)
 * Implements Employees' Provident Fund Organisation (EPFO) & Income Tax Act Section 10(11) provisions:
 * - EPFO-notified annual interest rate (e.g. 8.25% p.a. for FY 2023-24 / FY 2024-25, compounded annually)
 * - Mandatory EPF (12% basic) + Voluntary VPF (up to 88% basic) contribution model
 * - Income Tax Section 10(11) Audit: ₹2,50,000 annual employee-contribution tax-free threshold
 * - Excess contribution interest taxability tracking under investor's marginal tax slab
 * - Section 80C upfront tax deduction eligibility (capped at ₹1.5 Lakhs)
 * - Annual salary increment compounding model
 * - VPF vs Public Provident Fund (PPF @ 7.1%) & National Pension System (NPS @ 10%) comparisons
 * - Inflation-adjusted real purchasing power retirement corpus
 * - Year-by-year retirement growth schedule table generation
 *
 * @param {Object} inputs
 * @param {number} [inputs.monthlyBasicSalary=50000] - Monthly Basic Salary + DA (₹)
 * @param {number} [inputs.epfPercent=12] - Mandatory EPF contribution rate (%)
 * @param {number} [inputs.vpfPercent=10] - Voluntary VPF contribution rate (%)
 * @param {number} [inputs.currentAge=30] - Current age of subscriber (Years)
 * @param {number} [inputs.retirementAge=58] - Target retirement age (Years)
 * @param {number} [inputs.rate=8.25] - EPFO notified annual interest rate (% p.a.)
 * @param {number} [inputs.salaryGrowth=5.0] - Annual salary increment rate (% p.a.)
 * @param {number} [inputs.marginalTaxRate=30] - Investor marginal tax slab rate (%)
 * @param {number} [inputs.ppfRate=7.1] - PPF benchmark interest rate (% p.a.)
 * @param {number} [inputs.npsRate=10.0] - NPS benchmark return rate (% p.a.)
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (%)
 * @param {string} [inputs.currency='INR'] - Currency code ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {Object} Structured VPF retirement decision model
 */
export function calculateVpfCalculator(inputs = {}) {
  const {
    monthlyBasicSalary = 50000,
    epfPercent = 12,
    vpfPercent = 10,
    currentAge = 30,
    retirementAge = 58,
    rate = 8.25,
    salaryGrowth = 5.0,
    marginalTaxRate = 30,
    ppfRate = 7.1,
    npsRate = 10.0,
    inflationRate = 5.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION
  const rawSalary = Math.max(0, Number(monthlyBasicSalary) || 0);
  const epfPct = Math.max(0, Math.min(20, Number(epfPercent) || 0));
  const vpfPct = Math.max(0, Math.min(100 - epfPct, Number(vpfPercent) || 0));
  const ageStart = Math.max(18, Math.min(65, Number(currentAge) || 30));
  const ageRetire = Math.max(ageStart + 1, Math.min(75, Number(retirementAge) || 58));
  const epfoRate = Math.max(0, Math.min(20, Number(rate) || 0));
  const salGrowthPct = Math.max(0, Math.min(30, Number(salaryGrowth) || 0));
  const taxSlabPct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const inflPct = Math.max(0, Math.min(20, Number(inflationRate) || 0));

  const tenureYears = ageRetire - ageStart;

  // Handle Edge Case: Zero Salary or Zero Tenure
  if (rawSalary === 0 || tenureYears <= 0) {
    return createZeroVpfResult(currency);
  }

  // 2. MONTHLY & ANNUAL CONTRIBUTION BASELINES
  const monthlyEpf = Math.round(rawSalary * (epfPct / 100));
  const monthlyVpf = Math.round(rawSalary * (vpfPct / 100));
  const monthlyTotalEmployee = monthlyEpf + monthlyVpf;
  const annualEmployeeY1 = monthlyTotalEmployee * 12;

  // 3. YEAR-BY-YEAR ACCUMULATION & SECTION 10(11) TAX AUDIT
  // Section 10(11) Threshold: Employee contributions (EPF + VPF) up to ₹2.5L/year earn 100% tax-free interest.
  // Interest on employee contributions above ₹2.5L/year is taxable at marginal tax slab.
  const sec10_11Cap = 250000;
  const yearlySchedule = [];

  let currentSalary = rawSalary;
  let taxFreeBalance = 0;
  let taxableBalance = 0;

  let totalEmployeeContribution = 0;
  let totalTaxFreeInterest = 0;
  let totalTaxableInterest = 0;
  let sec10_11CapExceeded = false;

  for (let y = 1; y <= tenureYears; y++) {
    const annualBasicSalary = currentSalary * 12;
    const annualEmployeeContrib = Math.round(annualBasicSalary * ((epfPct + vpfPct) / 100));
    totalEmployeeContribution += annualEmployeeContrib;

    const nonTaxableContrib = Math.min(sec10_11Cap, annualEmployeeContrib);
    const excessContrib = Math.max(0, annualEmployeeContrib - sec10_11Cap);

    if (excessContrib > 0) {
      sec10_11CapExceeded = true;
    }

    // Mid-year contribution interest compounding approximation
    const taxFreeInterestY = Math.round((taxFreeBalance + nonTaxableContrib / 2) * (epfoRate / 100));
    const taxableInterestY = Math.round((taxableBalance + excessContrib / 2) * (epfoRate / 100));

    totalTaxFreeInterest += taxFreeInterestY;
    totalTaxableInterest += taxableInterestY;

    taxFreeBalance += nonTaxableContrib + taxFreeInterestY;
    taxableBalance += excessContrib + taxableInterestY;

    const endBalance = taxFreeBalance + taxableBalance;

    yearlySchedule.push({
      year: y,
      age: ageStart + y,
      monthlyBasic: Math.round(currentSalary),
      annualContrib: annualEmployeeContrib,
      nonTaxableContrib,
      excessContrib,
      taxFreeInterestY,
      taxableInterestY,
      endBalance,
    });

    // Apply annual salary increment for next year
    currentSalary = currentSalary * (1 + salGrowthPct / 100);
  }

  const maturityCorpus = taxFreeBalance + taxableBalance;
  const totalInterestEarned = totalTaxFreeInterest + totalTaxableInterest;

  // 4. SECTION 80C INITIAL TAX SAVED
  const sec80cEligible = Math.min(150000, annualEmployeeY1);
  const sec80cYear1Saved = Math.round(sec80cEligible * (taxSlabPct / 100));

  // 5. TAX ESTIMATE ON EXCESS INTEREST UNDER SECTION 10(11)
  const totalTaxPayableOnInterest = Math.round(totalTaxableInterest * (taxSlabPct / 100));
  const netRetirementCorpusAfterTax = maturityCorpus - totalTaxPayableOnInterest;

  // 6. COMPARISON MODELS (vs PPF & NPS)
  const ppfCorpus = runSimulatedCorpus(rawSalary, epfPct, vpfPct, tenureYears, Number(ppfRate) || 7.1, salGrowthPct, 150000);
  const npsCorpus = runSimulatedCorpus(rawSalary, epfPct, vpfPct, tenureYears, Number(npsRate) || 10.0, salGrowthPct, Infinity);

  const vpfVsPpfDelta = Math.max(0, maturityCorpus - ppfCorpus);
  const npsVsVpfDelta = Math.max(0, npsCorpus - maturityCorpus);

  // 7. INFLATION-ADJUSTED REAL PURCHASING POWER AT RETIREMENT AGE
  const purchasingPowerCorpus = Math.round(maturityCorpus / Math.pow(1 + inflPct / 100, tenureYears));

  // 8. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: 'Selected VPF (' + vpfPct + '%)',
      vpfPercent: vpfPct,
      rate: epfoRate,
      totalEmployeeContribution,
      maturityCorpus,
    },
    {
      id: 'optimal_10pct',
      label: 'Optimal 10% VPF',
      vpfPercent: 10,
      rate: epfoRate,
      ...runQuickVpfSim(rawSalary, epfPct, 10, tenureYears, epfoRate, salGrowthPct),
    },
    {
      id: 'aggressive_30pct',
      label: 'Aggressive 30% VPF',
      vpfPercent: 30,
      rate: epfoRate,
      ...runQuickVpfSim(rawSalary, epfPct, 30, tenureYears, epfoRate, salGrowthPct),
    },
    {
      id: 'zero_vpf',
      label: 'EPF Only (0% VPF)',
      vpfPercent: 0,
      rate: epfoRate,
      ...runQuickVpfSim(rawSalary, epfPct, 0, tenureYears, epfoRate, salGrowthPct),
    },
  ];

  // 9. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const heroText = `Your VPF contribution of ${vpfPct}% (plus ${epfPct}% mandatory EPF) on a Basic Salary of ${currencySymbol}${rawSalary.toLocaleString()} at ${epfoRate.toFixed(2)}% p.a. EPFO notified rate accumulates to a total retirement corpus of ${currencySymbol}${maturityCorpus.toLocaleString()} at age ${ageRetire} (${currencySymbol}${totalInterestEarned.toLocaleString()} interest earned).`;

  return {
    monthlyBasicSalary: rawSalary,
    epfPercent: epfPct,
    vpfPercent: vpfPct,
    currentAge: ageStart,
    retirementAge: ageRetire,
    tenureYears,
    rate: epfoRate,
    salaryGrowth: salGrowthPct,
    marginalTaxRate: taxSlabPct,
    inflationRate: inflPct,
    currency,

    // Primary Outputs
    primaryOutput: maturityCorpus,
    maturityCorpus,
    totalEmployeeContribution,
    totalInterestEarned,
    monthlyVpfContribution: monthlyVpf,
    monthlyEpfContribution: monthlyEpf,
    monthlyTotalEmployeeContribution: monthlyTotalEmployee,

    // Section 10(11) & Tax Audit
    sec10_11CapExceeded,
    taxFreeInterest: totalTaxFreeInterest,
    taxableInterest: totalTaxableInterest,
    totalTaxPayableOnInterest,
    netRetirementCorpusAfterTax,
    sec80cEligible,
    sec80cYear1Saved,

    // Comparisons & Purchasing Power
    ppfCorpus,
    npsCorpus,
    vpfVsPpfDelta,
    npsVsVpfDelta,
    purchasingPowerCorpus,

    // Schedules & Scenarios
    yearlySchedule,
    scenarios,
    heroText,
  };
}

/**
 * Quick Helper for VPF Scenario Calculations
 */
function runQuickVpfSim(monthlyBasic, epfPct, vpfPct, tenureYears, rate, salaryGrowth) {
  let sal = monthlyBasic;
  let balance = 0;
  let totalContrib = 0;

  for (let y = 1; y <= tenureYears; y++) {
    const annualContrib = Math.round(sal * 12 * ((epfPct + vpfPct) / 100));
    totalContrib += annualContrib;
    const interest = Math.round((balance + annualContrib / 2) * (rate / 100));
    balance += annualContrib + interest;
    sal *= (1 + salaryGrowth / 100);
  }

  return { totalEmployeeContribution: totalContrib, maturityCorpus: balance };
}

/**
 * Helper to Simulate Comparison Corpora (e.g. PPF, NPS)
 */
function runSimulatedCorpus(monthlyBasic, epfPct, vpfPct, tenureYears, rate, salaryGrowth, annualContribCap) {
  let sal = monthlyBasic;
  let balance = 0;

  for (let y = 1; y <= tenureYears; y++) {
    const rawAnnualContrib = Math.round(sal * 12 * ((epfPct + vpfPct) / 100));
    const annualContrib = Math.min(annualContribCap, rawAnnualContrib);
    const interest = Math.round((balance + annualContrib / 2) * (rate / 100));
    balance += annualContrib + interest;
    sal *= (1 + salaryGrowth / 100);
  }

  return balance;
}

/**
 * Fallback Engine Result for Zero Input
 */
function createZeroVpfResult(currency = 'INR') {
  return {
    monthlyBasicSalary: 0,
    epfPercent: 12,
    vpfPercent: 10,
    currentAge: 30,
    retirementAge: 58,
    tenureYears: 28,
    rate: 8.25,
    salaryGrowth: 5.0,
    marginalTaxRate: 30,
    inflationRate: 5.0,
    currency,

    primaryOutput: 0,
    maturityCorpus: 0,
    totalEmployeeContribution: 0,
    totalInterestEarned: 0,
    monthlyVpfContribution: 0,
    monthlyEpfContribution: 0,
    monthlyTotalEmployeeContribution: 0,

    sec10_11CapExceeded: false,
    taxFreeInterest: 0,
    taxableInterest: 0,
    totalTaxPayableOnInterest: 0,
    netRetirementCorpusAfterTax: 0,
    sec80cEligible: 0,
    sec80cYear1Saved: 0,

    ppfCorpus: 0,
    npsCorpus: 0,
    vpfVsPpfDelta: 0,
    npsVsVpfDelta: 0,
    purchasingPowerCorpus: 0,

    yearlySchedule: [],
    scenarios: [],
    heroText: 'Please enter a valid monthly basic salary to compute your Voluntary Provident Fund retirement growth.',
  };
}
