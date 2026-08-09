import { COMPOUND_INTEREST_CONFIG } from '../configs/compound-interest-calculator.config.js';

/**
 * Flagship Compound Interest Financial & Decision Engine (V3)
 * Implements exact period-by-period compounding calculations supporting:
 * - Compounding Frequencies: Daily (365/yr), Monthly (12/yr), Quarterly (4/yr), Semi-Annually (2/yr), Annually (1/yr)
 * - Initial Principal & Recurring Monthly Contributions
 * - Contribution Timing: Beginning of Month vs End of Month
 * - Effective Annual Rate (EAR / APY) calculation
 * - Inflation-adjusted real purchasing power final corpus
 * - Year-by-year compounding growth schedule
 * - Cross-frequency yield comparison matrix
 *
 * @param {Object} inputs
 * @param {number} [inputs.principal=100000] - Initial principal deposit
 * @param {number} [inputs.monthlyDeposit=5000] - Additional monthly contribution
 * @param {number} [inputs.rate=10.0] - Nominal annual interest rate (% p.a.)
 * @param {number} [inputs.tenureYears=10] - Investment duration (Years)
 * @param {string} [inputs.compoundingFrequency='annually'] - Compounding frequency ('daily'|'monthly'|'quarterly'|'semi-annually'|'annually')
 * @param {string} [inputs.contributionTiming='end'] - Timing ('end'|'beginning')
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (% p.a.)
 * @param {string} [inputs.currency='INR'] - Currency code ('INR'|'USD'|'EUR'|'GBP')
 * @returns {Object} Structured compound interest decision model
 */
export function calculateCompoundInterestCalculator(inputs = {}) {
  const {
    principal = 100000,
    monthlyDeposit = 5000,
    rate = 10.0,
    tenureYears = 10,
    compoundingFrequency = 'annually',
    contributionTiming = 'end',
    inflationRate = 5.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY AUDIT
  const rawPrincipal = Math.max(0, Number(principal) || 0);
  const rawMonthlyDeposit = Math.max(0, Number(monthlyDeposit) || 0);
  const rawRate = Math.max(0, Number(rate) || 0);
  const rawTenure = Math.max(1, Math.min(50, Math.round(Number(tenureYears) || 10)));
  const rawInflation = Math.max(0, Math.min(20, Number(inflationRate) || 0));
  const timing = contributionTiming === 'beginning' ? 'beginning' : 'end';

  const freqObj =
    COMPOUND_INTEREST_CONFIG.frequencies.find((f) => f.id === compoundingFrequency) ||
    COMPOUND_INTEREST_CONFIG.frequencies.find((f) => f.id === 'annually');

  const n = freqObj.n; // Compounding frequency per year

  // 2. EFFECTIVE ANNUAL RATE (EAR / APY)
  const nominalDec = rawRate / 100;
  const earPct = nominalDec === 0 ? 0 : (Math.pow(1 + nominalDec / n, n) - 1) * 100;

  // 3. MONTHLY COMPOUNDING ITERATION ENGINE
  const monthlyRateMultiplier = nominalDec === 0 ? 0 : Math.pow(1 + nominalDec / n, n / 12) - 1;
  const totalMonths = rawTenure * 12;

  let currentBalance = rawPrincipal;
  let cumulativePrincipalPaid = rawPrincipal;
  let cumulativeInterestEarned = 0;

  const yearlySchedule = [];
  let yearStartBal = rawPrincipal;
  let yearContribAcc = 0;
  let yearInterestAcc = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const monthStartBal = currentBalance;
    let accrualBase = monthStartBal;
    let monthDepositPaid = rawMonthlyDeposit;

    if (timing === 'beginning') {
      accrualBase += monthDepositPaid;
    }

    const monthInterest = accrualBase * monthlyRateMultiplier;
    let monthEndBal = accrualBase + monthInterest;

    if (timing === 'end') {
      monthEndBal += monthDepositPaid;
    }

    currentBalance = monthEndBal;
    cumulativePrincipalPaid += monthDepositPaid;
    cumulativeInterestEarned += monthInterest;

    yearContribAcc += monthDepositPaid;
    yearInterestAcc += monthInterest;

    // End of year rollup
    if (m % 12 === 0) {
      const yearNum = m / 12;
      yearlySchedule.push({
        year: yearNum,
        startBalance: Math.round(yearStartBal),
        annualDeposit: Math.round(yearContribAcc),
        interestEarned: Math.round(yearInterestAcc),
        endBalance: Math.round(currentBalance),
        cumulativePrincipal: Math.round(cumulativePrincipalPaid),
        cumulativeInterest: Math.round(currentBalance - cumulativePrincipalPaid),
        isFinalRow: yearNum === rawTenure,
      });

      yearStartBal = currentBalance;
      yearContribAcc = 0;
      yearInterestAcc = 0;
    }
  }

  // 4. HEADLINE TOTALS
  const totalMonthlyDeposits = rawMonthlyDeposit * totalMonths;
  const totalPrincipal = rawPrincipal + totalMonthlyDeposits;
  const finalCorpus = Math.round(currentBalance);
  const totalInterestEarned = Math.max(0, finalCorpus - totalPrincipal);

  // Inflation-Adjusted Real Value
  const purchasingPowerCorpus = Math.round(finalCorpus / Math.pow(1 + rawInflation / 100, rawTenure));

  // 5. CROSS-FREQUENCY COMPARISON MATRIX
  const frequencyComparison = COMPOUND_INTEREST_CONFIG.frequencies.map((freq) => {
    const fn = freq.n;
    const fEarnPct = nominalDec === 0 ? 0 : (Math.pow(1 + nominalDec / fn, fn) - 1) * 100;
    const fMonthlyRate = nominalDec === 0 ? 0 : Math.pow(1 + nominalDec / fn, fn / 12) - 1;

    let fBal = rawPrincipal;
    for (let m = 1; m <= totalMonths; m++) {
      let acc = fBal;
      if (timing === 'beginning') acc += rawMonthlyDeposit;
      const mInt = acc * fMonthlyRate;
      fBal = acc + mInt + (timing === 'end' ? rawMonthlyDeposit : 0);
    }

    const fCorpus = Math.round(fBal);
    const fInterest = Math.max(0, fCorpus - totalPrincipal);

    return {
      id: freq.id,
      label: freq.label,
      n: freq.n,
      effectiveAnnualRate: Number(fEarnPct.toFixed(3)),
      finalCorpus: fCorpus,
      totalInterestEarned: fInterest,
      deltaVsAnnual: fCorpus - finalCorpus,
    };
  });

  // 6. SCENARIO COMPARISON MATRIX
  const scenarios = [
    {
      id: 'baseline',
      label: `Current (${freqObj.label})`,
      principal: rawPrincipal,
      monthlyDeposit: rawMonthlyDeposit,
      rate: rawRate,
      tenureYears: rawTenure,
      compoundingFrequency: freqObj.id,
      finalCorpus,
      totalInterestEarned,
    },
    {
      id: 'double_deposit',
      label: 'Double Monthly Deposit',
      principal: rawPrincipal,
      monthlyDeposit: rawMonthlyDeposit * 2,
      rate: rawRate,
      tenureYears: rawTenure,
      compoundingFrequency: freqObj.id,
      finalCorpus: calculateSimpleCorpus(rawPrincipal, rawMonthlyDeposit * 2, rawRate, rawTenure, n, timing),
      totalInterestEarned: calculateSimpleInterest(rawPrincipal, rawMonthlyDeposit * 2, rawRate, rawTenure, n, timing),
    },
    {
      id: 'higher_rate',
      label: 'Higher Interest (+2%)',
      principal: rawPrincipal,
      monthlyDeposit: rawMonthlyDeposit,
      rate: rawRate + 2.0,
      tenureYears: rawTenure,
      compoundingFrequency: freqObj.id,
      finalCorpus: calculateSimpleCorpus(rawPrincipal, rawMonthlyDeposit, rawRate + 2.0, rawTenure, n, timing),
      totalInterestEarned: calculateSimpleInterest(rawPrincipal, rawMonthlyDeposit, rawRate + 2.0, rawTenure, n, timing),
    },
    {
      id: 'longer_tenure',
      label: '5 Extra Years (+5 Yrs)',
      principal: rawPrincipal,
      monthlyDeposit: rawMonthlyDeposit,
      rate: rawRate,
      tenureYears: rawTenure + 5,
      compoundingFrequency: freqObj.id,
      finalCorpus: calculateSimpleCorpus(rawPrincipal, rawMonthlyDeposit, rawRate, rawTenure + 5, n, timing),
      totalInterestEarned: calculateSimpleInterest(rawPrincipal, rawMonthlyDeposit, rawRate, rawTenure + 5, n, timing),
    },
  ];

  // 7. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const heroText = `Investing ${currencySymbol}${rawPrincipal.toLocaleString()} initial principal plus ${currencySymbol}${rawMonthlyDeposit.toLocaleString()}/month at ${rawRate}% p.a. (${freqObj.label} compounding) accumulates a final corpus of ${currencySymbol}${finalCorpus.toLocaleString()} over ${rawTenure} years (${currencySymbol}${totalInterestEarned.toLocaleString()} total interest).`;

  return {
    principal: rawPrincipal,
    monthlyDeposit: rawMonthlyDeposit,
    rate: rawRate,
    tenureYears: rawTenure,
    compoundingFrequency: freqObj.id,
    compoundingFrequencyLabel: freqObj.label,
    contributionTiming: timing,
    inflationRate: rawInflation,
    currency,

    // Primary Outputs
    primaryOutput: finalCorpus,
    finalCorpus,
    totalPrincipal,
    totalMonthlyDeposits,
    totalInterestEarned,
    effectiveAnnualRate: Number(earPct.toFixed(3)),
    purchasingPowerCorpus,

    // Matrices & Schedules
    yearlySchedule,
    frequencyComparison,
    scenarios,
    heroText,
  };
}

/**
 * Fast helper to compute corpus for scenario matrix
 */
function calculateSimpleCorpus(p, pmt, r, t, n, timing) {
  const nom = r / 100;
  const mRate = nom === 0 ? 0 : Math.pow(1 + nom / n, n / 12) - 1;
  let bal = p;
  const mTotal = t * 12;

  for (let m = 1; m <= mTotal; m++) {
    let acc = bal;
    if (timing === 'beginning') acc += pmt;
    const mInt = acc * mRate;
    bal = acc + mInt + (timing === 'end' ? pmt : 0);
  }
  return Math.round(bal);
}

function calculateSimpleInterest(p, pmt, r, t, n, timing) {
  const corpus = calculateSimpleCorpus(p, pmt, r, t, n, timing);
  const totalP = p + pmt * 12 * t;
  return Math.max(0, corpus - totalP);
}
