/**
 * Flagship Public Provident Fund (PPF) Math & Decision Engine (V3)
 * Implements official Ministry of Finance PPF Scheme 2019 rules:
 * - 15-Year Statutory Maturity / Lock-in
 * - 5-Year Extension Blocks (With or Without Fresh Contributions)
 * - 5th-of-the-month Minimum Balance Interest Rule (Monthly calculation, March 31st compounding)
 * - Section 80C ₹1,50,000 Annual Deposit Limit Validation
 * - EEE (Exempt-Exempt-Exempt) Tax Benefit Breakdown & Section 80C Tax Savings
 * - Deposit Timing Loss Simulator (Before 5th vs After 5th)
 * - Goal / Reverse Solver for Target Corpus
 * - Inflation-Adjusted Purchasing Power
 *
 * @param {Object} inputs
 * @param {number} [inputs.annualDeposit=150000] - Annual deposit amount (₹)
 * @param {'yearly'|'monthly'} [inputs.depositFrequency='yearly'] - Contribution frequency
 * @param {'before_5th'|'after_5th'} [inputs.depositDay='before_5th'] - Deposit timing relative to 5th of month
 * @param {number} [inputs.interestRate=7.1] - Notified annual interest rate (% p.a.)
 * @param {number} [inputs.tenureYears=15] - Target tenure (15, 20, 25, 30)
 * @param {'with_contribution'|'without_contribution'} [inputs.extensionMode='with_contribution'] - Extension block contribution strategy
 * @param {number} [inputs.marginalTaxRate=30] - Investor marginal tax bracket (% for Sec 80C savings)
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (%) for purchasing power
 * @param {string} [inputs.currency='INR'] - Currency symbol code
 * @returns {Object} Structured PPF decision model
 */
export function calculatePpfCalculator(inputs = {}) {
  const {
    annualDeposit = 150000,
    depositFrequency = 'yearly',
    depositDay = 'before_5th',
    interestRate = 7.1,
    tenureYears = 15,
    extensionMode = 'with_contribution',
    marginalTaxRate = 30,
    inflationRate = 5.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & STATUTORY BOUNDARY AUDIT
  const rawDeposit = Math.max(0, Number(annualDeposit) || 0);
  const isCapExceeded = rawDeposit > 150000;
  const sanitizedDeposit = Math.min(150000, rawDeposit);
  const isBelowMin = sanitizedDeposit > 0 && sanitizedDeposit < 500;

  const rate = Math.max(0, Math.min(20, Number(interestRate) || 0));
  const rawTenure = Math.max(1, Math.min(50, Number(tenureYears) || 15));
  const taxBracketPct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const inflPct = Math.max(0, Math.min(20, Number(inflationRate) || 0));

  // Handle Edge Case: Zero Contribution
  if (sanitizedDeposit === 0) {
    return createZeroPpfResult(currency, rate, rawTenure);
  }

  // 2. PPF SCHEME 2019 COMPOUNDING ENGINE
  const yearlyRows = [];
  let runningBalance = 0;
  let totalDeposits = 0;
  let totalInterestEarned = 0;
  let contributionYearsCount = 0;

  for (let y = 1; y <= rawTenure; y++) {
    const isExtensionYear = y > 15;
    const allowsContribution = !isExtensionYear || extensionMode === 'with_contribution';
    const depositForYear = allowsContribution ? sanitizedDeposit : 0;

    if (allowsContribution) {
      contributionYearsCount++;
    }

    totalDeposits += depositForYear;
    const openingBal = runningBalance;

    // Monthly Interest Calculation for Year y
    let interestForYear = 0;
    const monthlyRate = (rate / 100) / 12;

    if (depositFrequency === 'yearly') {
      // Yearly Lump-Sum Deposit in April
      for (let m = 1; m <= 12; m++) {
        let minBalForMonth = openingBal;
        if (depositDay === 'before_5th') {
          minBalForMonth += depositForYear; // Deposited before April 5th -> Full 12 months interest
        } else {
          // Deposited after April 5th -> Included from May onwards (month 2..12)
          if (m > 1) {
            minBalForMonth += depositForYear;
          }
        }
        interestForYear += minBalForMonth * monthlyRate;
      }
    } else {
      // Monthly Installments
      const monthlyInstallment = depositForYear / 12;
      let cumMonthlyDeposits = 0;

      for (let m = 1; m <= 12; m++) {
        if (depositDay === 'before_5th') {
          cumMonthlyDeposits += monthlyInstallment;
          const minBalForMonth = openingBal + cumMonthlyDeposits;
          interestForYear += minBalForMonth * monthlyRate;
        } else {
          // Deposited after 5th -> Current month installment doesn't count
          const minBalForMonth = openingBal + cumMonthlyDeposits;
          interestForYear += minBalForMonth * monthlyRate;
          cumMonthlyDeposits += monthlyInstallment;
        }
      }
    }

    const roundedInterest = Math.round(interestForYear);
    totalInterestEarned += roundedInterest;
    runningBalance = openingBal + depositForYear + roundedInterest;

    // Section 80C Tax Savings for Year
    const yearTaxSaved = Math.round(depositForYear * (taxBracketPct / 100));

    yearlyRows.push({
      year: y,
      openingBalance: Math.round(openingBal),
      depositAmount: Math.round(depositForYear),
      interestEarned: roundedInterest,
      cumulativeInterest: Math.round(totalInterestEarned),
      endingBalance: Math.round(runningBalance),
      taxSaved80C: yearTaxSaved,
      isExtension: isExtensionYear,
    });
  }

  const finalBalance = Math.round(runningBalance);

  // 3. DEPOSIT TIMING LOSS / GAIN ANALYSIS (BEFORE 5TH vs AFTER 5TH)
  const altTimingResult = runPpfTimingSim(
    sanitizedDeposit,
    depositFrequency,
    depositDay === 'before_5th' ? 'after_5th' : 'before_5th',
    rate,
    rawTenure,
    extensionMode
  );
  const timingInterestDiff = Math.abs(totalInterestEarned - altTimingResult.totalInterestEarned);
  const timingLossIfLate = depositDay === 'after_5th' ? timingInterestDiff : 0;

  // 4. SECTION 80C TAX SAVINGS & EEE BREAKDOWN
  const annualSec80cTaxSaved = Math.round(sanitizedDeposit * (taxBracketPct / 100));
  const totalSec80cTaxSaved = Math.round(annualSec80cTaxSaved * contributionYearsCount);

  // 5. INFLATION-ADJUSTED PURCHASING POWER
  const purchasingPower = Math.round(finalBalance / Math.pow(1 + inflPct / 100, rawTenure));

  // 6. REVERSE GOAL SOLVER (How much annual deposit needed for ₹1 Crore / target)
  const targetCorpus1Cr = 10000000;
  const unitSim = runPpfTimingSim(1000, depositFrequency, depositDay, rate, rawTenure, extensionMode);
  const corpusPer1k = unitSim.finalBalance;
  const requiredAnnualDepositFor1Cr = corpusPer1k > 0 ? Math.min(150000, Math.round((targetCorpus1Cr / corpusPer1k) * 1000)) : 150000;

  // 7. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: 'Baseline Setup (15 Years)',
      annualDeposit: sanitizedDeposit,
      tenureYears: 15,
      depositDay,
      ...runPpfTimingSim(sanitizedDeposit, depositFrequency, depositDay, rate, 15, extensionMode),
    },
    {
      id: 'max_80c',
      label: 'Max Statutory Cap (₹1.5 Lakhs)',
      annualDeposit: 150000,
      tenureYears: 15,
      depositDay: 'before_5th',
      ...runPpfTimingSim(150000, 'yearly', 'before_5th', rate, 15, extensionMode),
    },
    {
      id: 'ext_20y',
      label: '20-Year Extended Block',
      annualDeposit: sanitizedDeposit,
      tenureYears: 20,
      depositDay,
      ...runPpfTimingSim(sanitizedDeposit, depositFrequency, depositDay, rate, 20, extensionMode),
    },
    {
      id: 'ext_25y',
      label: '25-Year Extended Block',
      annualDeposit: sanitizedDeposit,
      tenureYears: 25,
      depositDay,
      ...runPpfTimingSim(sanitizedDeposit, depositFrequency, depositDay, rate, 25, extensionMode),
    },
  ];

  // 8. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  let heroText = `Your PPF investment of ${currencySymbol}${sanitizedDeposit.toLocaleString()}/yr at ${rate.toFixed(1)}% p.a. grows to a 100% Tax-Free corpus of ${currencySymbol}${finalBalance.toLocaleString()} in ${rawTenure} years.`;

  return {
    annualDeposit: sanitizedDeposit,
    rawDeposit,
    isCapExceeded,
    isBelowMin,
    depositFrequency,
    depositDay,
    interestRate: rate,
    tenureYears: rawTenure,
    extensionMode,
    marginalTaxRate: taxBracketPct,
    inflationRate: inflPct,
    currency,

    // Primary Outputs
    primaryOutput: finalBalance,
    finalBalance,
    totalDeposits: Math.round(totalDeposits),
    totalInterestEarned: Math.round(totalInterestEarned),
    contributionYearsCount,

    // Tax & EEE Metrics
    annualSec80cTaxSaved,
    totalSec80cTaxSaved,
    isEeeTaxExempt: true,

    // Timing Analysis & Purchasing Power
    timingInterestDiff,
    timingLossIfLate,
    purchasingPower,
    requiredAnnualDepositFor1Cr,

    // Schedules & Scenarios
    yearlyRows,
    scenarios,
    heroText,
  };
}

/**
 * Quick Helper for PPF Timing & Scenario Calculations
 */
function runPpfTimingSim(annualDeposit, frequency, depositDay, rate, tenureYears, extensionMode) {
  let runningBalance = 0;
  let totalDeposits = 0;
  let totalInterest = 0;
  const monthlyRate = (rate / 100) / 12;

  for (let y = 1; y <= tenureYears; y++) {
    const isExtensionYear = y > 15;
    const allowsContribution = !isExtensionYear || extensionMode === 'with_contribution';
    const depositForYear = allowsContribution ? annualDeposit : 0;
    totalDeposits += depositForYear;
    const openingBal = runningBalance;

    let interestForYear = 0;
    if (frequency === 'yearly') {
      for (let m = 1; m <= 12; m++) {
        let minBal = openingBal;
        if (depositDay === 'before_5th') {
          minBal += depositForYear;
        } else if (m > 1) {
          minBal += depositForYear;
        }
        interestForYear += minBal * monthlyRate;
      }
    } else {
      const monthlyInstallment = depositForYear / 12;
      let cumMonthly = 0;
      for (let m = 1; m <= 12; m++) {
        if (depositDay === 'before_5th') {
          cumMonthly += monthlyInstallment;
          interestForYear += (openingBal + cumMonthly) * monthlyRate;
        } else {
          interestForYear += (openingBal + cumMonthly) * monthlyRate;
          cumMonthly += monthlyInstallment;
        }
      }
    }

    const roundedInt = Math.round(interestForYear);
    totalInterest += roundedInt;
    runningBalance = openingBal + depositForYear + roundedInt;
  }

  return {
    finalBalance: Math.round(runningBalance),
    totalDeposits: Math.round(totalDeposits),
    totalInterestEarned: Math.round(totalInterest),
  };
}

/**
 * Fallback Engine Result for Zero Contribution
 */
function createZeroPpfResult(currency = 'INR', rate = 7.1, tenure = 15) {
  return {
    annualDeposit: 0,
    rawDeposit: 0,
    isCapExceeded: false,
    isBelowMin: false,
    depositFrequency: 'yearly',
    depositDay: 'before_5th',
    interestRate: rate,
    tenureYears: tenure,
    extensionMode: 'with_contribution',
    marginalTaxRate: 30,
    inflationRate: 5.0,
    currency,

    primaryOutput: 0,
    finalBalance: 0,
    totalDeposits: 0,
    totalInterestEarned: 0,
    contributionYearsCount: 0,

    annualSec80cTaxSaved: 0,
    totalSec80cTaxSaved: 0,
    isEeeTaxExempt: true,

    timingInterestDiff: 0,
    timingLossIfLate: 0,
    purchasingPower: 0,
    requiredAnnualDepositFor1Cr: 150000,

    yearlyRows: [],
    scenarios: [],
    heroText: `Please enter a valid deposit amount to compute your 100% Tax-Free Public Provident Fund maturity balance.`,
  };
}
