import { calculateLoan } from '../core/loanEngine.js';

/**
 * Flagship Loan Amortization Math Engine (V3)
 * Computes exact month-by-month and year-by-year amortization schedules,
 * recurring monthly and annual lump-sum extra prepayment simulations,
 * tenure reduction vs EMI reduction strategy comparisons, and tax deduction rollups (Sec 24b / Sec 80C).
 *
 * @param {Object} inputs
 * @param {number} [inputs.amount=1000000] - Principal loan balance (₹ or $)
 * @param {number} [inputs.rate=8.5] - Annual interest rate (% p.a.)
 * @param {number} [inputs.tenure=15] - Loan tenure
 * @param {string} [inputs.tenureType='years'] - 'years' or 'months'
 * @param {number} [inputs.prepaymentMonthly=0] - Extra recurring monthly principal payment
 * @param {number} [inputs.prepaymentAnnual=0] - Extra lump-sum principal payment made annually (Month 12, 24...)
 * @param {number} [inputs.prepaymentOneTime=0] - One-time lump sum principal payment
 * @param {number} [inputs.prepaymentOneTimeMonth=12] - Target month for one-time prepayment
 * @param {'tenure_reduction'|'emi_reduction'} [inputs.prepaymentStrategy='tenure_reduction'] - Strategy after prepayment
 * @param {number} [inputs.monthlyIncome=100000] - Net monthly income for FOIR calculation
 * @param {string} [inputs.currency='INR'] - Currency code ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {Object} Complete structured Amortization analytical model
 */
export function calculateLoanAmortization(inputs = {}) {
  const {
    amount = 1000000,
    rate = 8.5,
    tenure = 15,
    tenureType = 'years',
    prepaymentMonthly = 0,
    prepaymentAnnual = 0,
    prepaymentOneTime = 0,
    prepaymentOneTimeMonth = 12,
    prepaymentStrategy = 'tenure_reduction',
    monthlyIncome = 100000,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY CHECKS
  const principalAmount = Math.max(0, Number(amount) || 0);
  const annualRate = Math.max(0, Math.min(100, Number(rate) || 0));
  const rawTenure = Math.max(1, Number(tenure) || 1);
  const totalTenureMonths = tenureType === 'years' ? rawTenure * 12 : rawTenure;

  const extraMonthly = Math.max(0, Number(prepaymentMonthly) || 0);
  const extraAnnual = Math.max(0, Number(prepaymentAnnual) || 0);
  const extraOneTime = Math.max(0, Number(prepaymentOneTime) || 0);
  const oneTimeMonthTarget = Math.max(1, Math.min(totalTenureMonths, Number(prepaymentOneTimeMonth) || 12));
  const income = Math.max(1, Number(monthlyIncome) || 100000);

  // Handle Edge Case: Zero Loan Amount
  if (principalAmount === 0) {
    return createZeroAmortizationResult(currency);
  }

  // 2. BASELINE SIMULATION (Without Extra Prepayments)
  const baselineResult = calculateLoan({
    amount: principalAmount,
    rate: annualRate,
    tenure: totalTenureMonths,
    tenureType: 'months',
  });

  const baselineEmi = baselineResult.emi;
  const baselineTotalInterest = baselineResult.totalInterest;
  const baselineTotalPayment = baselineResult.totalPayment;
  const baselineTenureMonths = baselineResult.schedule.length;

  // 3. ADVANCED AMORTIZATION SIMULATION WITH PREPAYMENTS & FINAL-MONTH RECONCILIATION
  const monthlyRate = (annualRate / 12) / 100;
  let currentBalance = principalAmount;
  let currentEmi = baselineEmi;
  const schedule = [];

  let accumulatedInterest = 0;
  let accumulatedPrincipal = 0;
  let accumulatedExtra = 0;
  let accumulatedPayment = 0;

  for (let m = 1; m <= totalTenureMonths; m++) {
    if (currentBalance <= 0) break;

    // Monthly interest on opening balance
    const interestForMonth = annualRate === 0 ? 0 : Math.round(currentBalance * monthlyRate);

    // Calculate extra prepayments applicable this month
    let extraThisMonth = extraMonthly;
    if (m % 12 === 0) {
      extraThisMonth += extraAnnual;
    }
    if (m === oneTimeMonthTarget) {
      extraThisMonth += extraOneTime;
    }

    // Determine standard principal vs extra principal
    let scheduledPrincipal = Math.max(0, currentEmi - interestForMonth);

    // Final month or near-payoff balance reconciliation: ensure final balance hits exactly 0
    if (m === totalTenureMonths || currentBalance <= scheduledPrincipal + extraThisMonth) {
      scheduledPrincipal = Math.max(0, currentBalance - Math.min(currentBalance, extraThisMonth));
    }

    // Additional principal that can be paid towards remaining balance
    const remainingBalanceAfterStandard = Math.max(0, currentBalance - scheduledPrincipal);
    const actualExtraPaid = Math.min(remainingBalanceAfterStandard, extraThisMonth);

    const totalPrincipalPaid = scheduledPrincipal + actualExtraPaid;
    const totalMonthPayment = scheduledPrincipal + interestForMonth + actualExtraPaid;

    currentBalance = Math.max(0, currentBalance - totalPrincipalPaid);

    accumulatedInterest += interestForMonth;
    accumulatedPrincipal += totalPrincipalPaid;
    accumulatedExtra += actualExtraPaid;
    accumulatedPayment += totalMonthPayment;

    schedule.push({
      month: m,
      payment: Math.round(totalMonthPayment),
      principalPaid: Math.round(totalPrincipalPaid),
      scheduledPrincipal: Math.round(scheduledPrincipal),
      extraPaid: Math.round(actualExtraPaid),
      interestPaid: Math.round(interestForMonth),
      remainingBalance: Math.round(currentBalance),
      cumulativeInterest: Math.round(accumulatedInterest),
      cumulativePrincipal: Math.round(accumulatedPrincipal),
    });

    if (currentBalance <= 0) break;

    // Recalculate EMI if strategy is 'emi_reduction' and extra payment was made
    if (prepaymentStrategy === 'emi_reduction' && actualExtraPaid > 0 && currentBalance > 0) {
      const remainingMonths = totalTenureMonths - m;
      if (remainingMonths > 0 && monthlyRate > 0) {
        currentEmi = Math.round(
          currentBalance * (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / (Math.pow(1 + monthlyRate, remainingMonths) - 1)
        );
      }
    }
  }

  const actualPayoffMonths = schedule.length;
  const actualTotalInterest = Math.round(accumulatedInterest);
  const actualTotalPayment = Math.round(accumulatedPayment);
  const actualTotalExtraPaid = Math.round(accumulatedExtra);

  // 4. YEARLY ROLLUP AGGREGATION & TAX DEDUCTION BREAKDOWN
  const yearlyData = schedule.reduce((acc, row) => {
    const year = Math.ceil(row.month / 12);
    if (!acc[year]) {
      acc[year] = {
        year,
        totalPayment: 0,
        principalPaid: 0,
        interestPaid: 0,
        extraPaid: 0,
        endingBalance: row.remainingBalance,
        cumulativeInterest: row.cumulativeInterest,
      };
    }
    acc[year].totalPayment += row.payment;
    acc[year].principalPaid += row.principalPaid;
    acc[year].interestPaid += row.interestPaid;
    acc[year].extraPaid += row.extraPaid;
    acc[year].endingBalance = row.remainingBalance;
    acc[year].cumulativeInterest = row.cumulativeInterest;
    return acc;
  }, {});

  const yearlyRows = Object.values(yearlyData).map((y) => {
    const sec24bLimit = currency === 'INR' ? 200000 : Infinity;
    const sec80cLimit = currency === 'INR' ? 150000 : Infinity;

    return {
      ...y,
      taxDeductionInterest: Math.min(y.interestPaid, sec24bLimit),
      taxDeductionPrincipal: Math.min(y.principalPaid, sec80cLimit),
    };
  });

  // 5. COMPARISON & SAVINGS METRICS
  const interestSaved = Math.max(0, baselineTotalInterest - actualTotalInterest);
  const interestSavedPct = baselineTotalInterest > 0 ? Math.round((interestSaved / baselineTotalInterest) * 100) : 0;

  const tenureSavedMonths = Math.max(0, baselineTenureMonths - actualPayoffMonths);
  const tenureSavedYears = Number((tenureSavedMonths / 12).toFixed(1));
  const payoffYears = Number((actualPayoffMonths / 12).toFixed(1));

  // FOIR Affordability (Monthly EMI as % of Monthly Salary)
  const foirPct = Math.round((baselineEmi / income) * 100);

  // 6. SCENARIO MATRIX FOR COMPARISON GRID
  const scenarios = [
    {
      id: 'baseline',
      label: 'Baseline (No Prepayments)',
      monthlyEmi: baselineEmi,
      totalInterest: baselineTotalInterest,
      payoffMonths: baselineTenureMonths,
      interestSaved: 0,
      tenureSavedMonths: 0,
    },
    {
      id: 'extra_2k',
      label: '+₹2,000 / mo Extra',
      monthlyEmi: baselineEmi + 2000,
      ...runQuickPrepaymentSim(principalAmount, annualRate, totalTenureMonths, 2000, 0),
    },
    {
      id: 'extra_5k',
      label: '+₹5,000 / mo Extra',
      monthlyEmi: baselineEmi + 5000,
      ...runQuickPrepaymentSim(principalAmount, annualRate, totalTenureMonths, 5000, 0),
    },
    {
      id: 'lump_10pct',
      label: '10% One-Time Prepayment',
      monthlyEmi: baselineEmi,
      ...runQuickPrepaymentSim(principalAmount, annualRate, totalTenureMonths, 0, Math.round(principalAmount * 0.1)),
    },
  ];

  // 7. HERO SUMMARY TEXT
  let heroText = '';
  if (interestSaved > 0 || tenureSavedMonths > 0) {
    heroText = `Making extra prepayments saves ${currency === 'INR' ? '₹' : '$'}${interestSaved.toLocaleString()} in interest and reduces your loan payoff by ${tenureSavedYears} years (${tenureSavedMonths} months earlier).`;
  } else {
    heroText = `Your monthly EMI is ${currency === 'INR' ? '₹' : '$'}${baselineEmi.toLocaleString()}/mo over ${totalTenureMonths / 12} years, with a total interest outgo of ${currency === 'INR' ? '₹' : '$'}${baselineTotalInterest.toLocaleString()}.`;
  }

  return {
    principal: principalAmount,
    rate: annualRate,
    tenure: totalTenureMonths,
    tenureYears: totalTenureMonths / 12,
    currency,
    monthlyIncome: income,

    // Prepayment inputs
    prepaymentMonthly: extraMonthly,
    prepaymentAnnual: extraAnnual,
    prepaymentOneTime: extraOneTime,
    prepaymentOneTimeMonth: oneTimeMonthTarget,
    prepaymentStrategy,

    // Primary Outputs
    primaryOutput: baselineEmi,
    emi: baselineEmi,
    totalInterest: actualTotalInterest,
    totalPayment: actualTotalPayment,
    totalExtraPaid: actualTotalExtraPaid,

    // Baseline Comparisons
    baselineEmi,
    baselineTotalInterest,
    baselineTotalPayment,
    baselineTenureMonths,

    // Savings & Accelerated Payoff Metrics
    interestSaved,
    interestSavedPct,
    actualPayoffMonths,
    payoffYears,
    tenureSavedMonths,
    tenureSavedYears,
    foirPct,

    // Schedules & Scenarios
    schedule,
    yearlyRows,
    baselineSchedule: baselineResult.schedule,
    scenarios,
    heroText,
  };
}

/**
 * Quick Helper for Scenario Grid Prepayment Calculations
 */
function runQuickPrepaymentSim(principal, annualRate, tenureMonths, extraMonthly, lumpSumOneTime) {
  const monthlyRate = (annualRate / 12) / 100;
  const baseEmi = annualRate === 0
    ? Math.round(principal / tenureMonths)
    : Math.round(
        principal * (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1)
      );

  let bal = principal;
  let accumInterest = 0;
  let m = 0;

  while (bal > 0 && m < tenureMonths) {
    m++;
    const intMonth = annualRate === 0 ? 0 : Math.round(bal * monthlyRate);
    let stdPrin = Math.max(0, baseEmi - intMonth);
    let extra = extraMonthly;
    if (m === 12) extra += lumpSumOneTime;

    const totalPrin = Math.min(bal, stdPrin + extra);
    bal = Math.max(0, bal - totalPrin);
    accumInterest += intMonth;
  }

  const baselineInterest = Math.round(baseEmi * tenureMonths - principal);
  const actualInterest = Math.round(accumInterest);
  const interestSaved = Math.max(0, baselineInterest - actualInterest);
  const tenureSavedMonths = Math.max(0, tenureMonths - m);

  return {
    totalInterest: actualInterest,
    payoffMonths: m,
    interestSaved,
    tenureSavedMonths,
  };
}

/**
 * Fallback Engine Result for Zero Principal Input
 */
function createZeroAmortizationResult(currency = 'INR') {
  return {
    principal: 0,
    rate: 8.5,
    tenure: 180,
    tenureYears: 15,
    currency,
    monthlyIncome: 100000,

    prepaymentMonthly: 0,
    prepaymentAnnual: 0,
    prepaymentOneTime: 0,
    prepaymentOneTimeMonth: 12,
    prepaymentStrategy: 'tenure_reduction',

    primaryOutput: 0,
    emi: 0,
    totalInterest: 0,
    totalPayment: 0,
    totalExtraPaid: 0,

    baselineEmi: 0,
    baselineTotalInterest: 0,
    baselineTotalPayment: 0,
    baselineTenureMonths: 180,

    interestSaved: 0,
    interestSavedPct: 0,
    actualPayoffMonths: 0,
    payoffYears: 0,
    tenureSavedMonths: 0,
    tenureSavedYears: 0,
    foirPct: 0,

    schedule: [],
    yearlyRows: [],
    baselineSchedule: [],
    scenarios: [],
    heroText: `Please enter a valid loan principal amount to compute your amortization schedule.`,
  };
}