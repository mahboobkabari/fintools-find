import { calculateLoan } from '../core/loanEngine.js';
import { EDUCATION_LOAN_CONFIG } from '../configs/educationLoanConfig.js';
import { inflationAdjustedValue, wealthMultiplier } from '../core/investmentUtils.js';

/**
 * Institutional Flagship Education Loan Financial Decision Engine
 * Computes study-period simple interest accrual, capitalized vs monthly-paid moratorium interest,
 * post-graduation monthly EMI, Section 80E uncapped tax savings, reverse target EMI solver, and 4-scenario comparisons.
 *
 * @param {Object} inputs
 * @param {number} [inputs.amount=1000000] - Borrowed education loan principal (₹)
 * @param {number} [inputs.rate=9.5] - Annual interest rate (% p.a.)
 * @param {number} [inputs.tenure=10] - Post-graduation repayment tenure
 * @param {string} [inputs.tenureType='years'] - 'years' | 'months'
 * @param {number} [inputs.moratoriumYears=4] - Course duration + grace period (years)
 * @param {boolean} [inputs.payInterestDuringMoratorium=false] - Pay simple interest monthly during course
 * @param {number} [inputs.marginalTaxRate=30] - Marginal tax rate for Section 80E savings (%)
 * @param {string} [inputs.calculationMode='forward'] - Mode: 'forward' | 'reverse_emi'
 * @param {number} [inputs.targetEmi=20000] - Desired post-graduation monthly EMI for reverse solver (₹)
 * @param {number} [inputs.inflationRate=6] - Expected annual inflation rate (%)
 * @returns {Object} Complete structured Education Loan analytical model
 */
export function calculateEducationLoan(inputs = {}) {
  const {
    amount = 1000000,
    rate = EDUCATION_LOAN_CONFIG.defaultInterestRate,
    tenure = 10,
    tenureType = 'years',
    moratoriumYears = 4,
    payInterestDuringMoratorium = false,
    marginalTaxRate = 30,
    calculationMode = 'forward',
    targetEmi = 20000,
    inflationRate = 6,
  } = inputs;

  // 1. INPUT SANITIZATION & VALIDATION
  const numAmount = Math.max(0, Number(amount) || 0);
  const annualRate = Math.max(0, Math.min(30, Number(rate) || 0));
  const tenureNum = Math.max(1, Number(tenure) || 1);
  const morYears = Math.max(0, Math.min(10, Number(moratoriumYears) || 0));
  const taxRatePct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const targetEmiVal = Math.max(0, Number(targetEmi) || 0);
  const infRate = Math.max(0, Math.min(25, Number(inflationRate) || 0));

  // Handle Edge Case: Zero Loan Amount
  if (numAmount === 0 && calculationMode !== 'reverse_emi') {
    return createZeroLoanResult();
  }

  // 2. REVERSE TARGET EMI SOLVER MODE
  let solvedAmount = numAmount;
  if (calculationMode === 'reverse_emi' && targetEmiVal > 0) {
    solvedAmount = solveMaxAffordableLoanInternal({
      targetEmi: targetEmiVal,
      rate: annualRate,
      tenure: tenureNum,
      tenureType,
      moratoriumYears: morYears,
      payInterestDuringMoratorium,
    });
  }

  const effectiveAmount = solvedAmount;

  // 3. FORWARD TWO-PHASE EDUCATION LOAN SIMULATION
  const simResult = runEducationLoanSimulation({
    amount: effectiveAmount,
    rate: annualRate,
    tenure: tenureNum,
    tenureType,
    moratoriumYears: morYears,
    payInterestDuringMoratorium,
    marginalTaxRate: taxRatePct,
  });

  // 4. INFLATION REAL PURCHASING POWER
  const totalTenureYears = morYears + (tenureType === 'years' ? tenureNum : tenureNum / 12);
  const realValResult = inflationAdjustedValue(
    simResult.totalPayment,
    infRate,
    totalTenureYears
  );

  // 5. 4-SCENARIO COMPARISON GRID
  const scenarios = [
    {
      id: 'deferred_capitalized',
      label: 'Deferred Interest (Capitalized)',
      description: 'Interest accrues during study and is added to principal.',
      payInterest: false,
      tenureYears: 10,
    },
    {
      id: 'paid_monthly_study',
      label: 'Pay Interest Monthly during Study',
      description: 'Pay simple interest monthly during course to prevent compounding.',
      payInterest: true,
      tenureYears: 10,
    },
    {
      id: 'fast_track_7y',
      label: '7-Year Fast-Track Repayment',
      description: 'Shorter 7-year repayment tenure to save total interest.',
      payInterest: false,
      tenureYears: 7,
    },
    {
      id: 'long_term_15y',
      label: '15-Year Long-Term Repayment',
      description: 'Longer 15-year tenure for lowest monthly EMI.',
      payInterest: false,
      tenureYears: 15,
    },
  ].map((sc) => {
    const scSim = runEducationLoanSimulation({
      amount: effectiveAmount,
      rate: annualRate,
      tenure: sc.tenureYears,
      tenureType: 'years',
      moratoriumYears: morYears,
      payInterestDuringMoratorium: sc.payInterest,
      marginalTaxRate: taxRatePct,
    });

    return {
      id: sc.id,
      label: sc.label,
      description: sc.description,
      emi: scSim.emi,
      moratoriumInterest: scSim.moratoriumInterest,
      totalInterest: scSim.totalInterest,
      totalPayment: scSim.totalPayment,
      sec80E_taxSavings: scSim.sec80E_taxSavings,
      effectiveNetCost: scSim.effectiveNetCost,
    };
  });

  // 6. RATE SENSITIVITY ANALYSIS (Lower 8.5%, Base 9.5%, Higher 10.5%)
  const sensitivityScenarios = [-1.0, 0, 1.0].map((delta) => {
    const scRate = Math.max(0, annualRate + delta);
    const scSim = runEducationLoanSimulation({
      amount: effectiveAmount,
      rate: scRate,
      tenure: tenureNum,
      tenureType,
      moratoriumYears: morYears,
      payInterestDuringMoratorium,
      marginalTaxRate: taxRatePct,
    });
    return {
      rate: scRate,
      label: delta === 0 ? `Quoted Rate (${scRate}%)` : `${scRate}% p.a.`,
      emi: scSim.emi,
      totalInterest: scSim.totalInterest,
      totalPayment: scSim.totalPayment,
    };
  });

  // Hero Summary Text
  let heroText = '';
  const emiStartMonth = Math.round(morYears * 12);
  if (calculationMode === 'reverse_emi' && targetEmiVal > 0) {
    heroText = `To keep your post-graduation EMI at ₹${targetEmiVal.toLocaleString(
      'en-IN'
    )}/mo, you can borrow up to an estimated ₹${effectiveAmount.toLocaleString(
      'en-IN'
    )} education loan principal.`;
  } else {
    heroText = `Your post-graduation EMI will be ₹${simResult.emi.toLocaleString(
      'en-IN'
    )}/mo starting after month ${emiStartMonth}. Section 80E offers up to ₹${simResult.sec80E_taxSavings.toLocaleString(
      'en-IN'
    )} in estimated tax savings.`;
  }

  return {
    loanAmount: effectiveAmount,
    rate: annualRate,
    tenure: tenureNum,
    tenureType,
    moratoriumYears: morYears,
    moratoriumMonths: emiStartMonth,
    payInterestDuringMoratorium,
    marginalTaxRate: taxRatePct,
    calculationMode,
    targetEmi: targetEmiVal,
    inflationRate: infRate,

    // Primary Outputs
    primaryOutput: calculationMode === 'reverse_emi' ? effectiveAmount : simResult.emi,
    emi: simResult.emi,
    moratoriumInterest: simResult.moratoriumInterest,
    monthlyInterestDuringMoratorium: simResult.monthlyInterestDuringMoratorium,
    totalPrincipalAtRepayment: simResult.totalPrincipalAtRepayment,
    repaymentInterest: simResult.repaymentInterest,
    totalInterest: simResult.totalInterest,
    totalPayment: simResult.totalPayment,

    // Section 80E Tax Relief
    sec80E_eligibleInterest: simResult.sec80E_eligibleInterest,
    sec80E_taxSavings: simResult.sec80E_taxSavings,
    effectiveNetCost: simResult.effectiveNetCost,

    // Real Inflation Value
    realValue: realValResult.realValue,

    // Amortization Schedule & Scenarios
    schedule: simResult.schedule,
    scenarios,
    sensitivityScenarios,

    // Health Score & Status
    heroText,
    score: computeEducationLoanHealthScore(
      simResult.emi,
      simResult.totalInterest,
      effectiveAmount,
      payInterestDuringMoratorium
    ),
    healthStatus: payInterestDuringMoratorium
      ? 'Optimized Study Interest Savings'
      : 'Standard Capitalized Moratorium',
  };
}

/**
 * Pure Simulation Engine for Two-Phase Education Loan
 */
function runEducationLoanSimulation({
  amount,
  rate,
  tenure,
  tenureType,
  moratoriumYears,
  payInterestDuringMoratorium,
  marginalTaxRate,
}) {
  const loanAmount = Math.max(0, amount);
  const annualRate = Math.max(0, rate);
  const morYears = Math.max(0, moratoriumYears);

  // 1. Moratorium Phase Simple Interest
  const moratoriumInterest = Math.round(loanAmount * (annualRate / 100) * morYears);
  const monthlyInterestDuringMoratorium = Math.round(loanAmount * (annualRate / 12 / 100));

  // Principal at start of repayment phase
  const totalPrincipalAtRepayment = payInterestDuringMoratorium
    ? loanAmount
    : loanAmount + moratoriumInterest;

  // 2. Post-Graduation Repayment Phase via loanEngine
  const loanResult = calculateLoan({
    amount: totalPrincipalAtRepayment,
    rate: annualRate,
    tenure,
    tenureType,
  });

  const emi = loanResult.emi;
  const repaymentInterest = loanResult.totalInterest;

  // Total Interest & Total Outflow
  const totalInterest = payInterestDuringMoratorium
    ? moratoriumInterest + repaymentInterest
    : moratoriumInterest + repaymentInterest;

  const totalPayment = payInterestDuringMoratorium
    ? loanAmount + moratoriumInterest + repaymentInterest
    : loanAmount + moratoriumInterest + repaymentInterest;

  // 3. Section 80E Tax Savings Engine (First 8 Years = 96 Months)
  // Extract interest paid in first 96 months of repayment schedule
  let sec80E_eligibleInterest = 0;
  const maxSec80EMonths = EDUCATION_LOAN_CONFIG.statutoryRules.sec80E_maxYears * 12;

  if (loanResult.schedule && loanResult.schedule.length > 0) {
    const eligibleMonths = Math.min(loanResult.schedule.length, maxSec80EMonths);
    for (let i = 0; i < eligibleMonths; i++) {
      sec80E_eligibleInterest += loanResult.schedule[i].interestPaid || 0;
    }
  }

  // If interest was paid monthly during study, add study interest paid in eligible tax years
  if (payInterestDuringMoratorium && morYears > 0) {
    const studyInterestInSec80EWindow = Math.min(moratoriumInterest, moratoriumInterest * (8 / Math.max(1, morYears)));
    sec80E_eligibleInterest += studyInterestInSec80EWindow;
  }

  sec80E_eligibleInterest = Math.round(sec80E_eligibleInterest);
  const sec80E_taxSavings = Math.round(sec80E_eligibleInterest * (marginalTaxRate / 100));
  const effectiveNetCost = Math.max(0, totalPayment - sec80E_taxSavings);

  return {
    emi,
    moratoriumInterest,
    monthlyInterestDuringMoratorium,
    totalPrincipalAtRepayment,
    repaymentInterest,
    totalInterest,
    totalPayment,
    sec80E_eligibleInterest,
    sec80E_taxSavings,
    effectiveNetCost,
    schedule: loanResult.schedule,
  };
}

/**
 * Pure Binary Search Solver for Maximum Affordable Education Loan Amount
 */
function solveMaxAffordableLoanInternal({
  targetEmi,
  rate,
  tenure,
  tenureType,
  moratoriumYears,
  payInterestDuringMoratorium,
}) {
  if (targetEmi <= 0) return 0;

  let low = 10000;
  let high = 50000000; // ₹5 Crores max search space
  let bestAmount = high;

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const sim = runEducationLoanSimulation({
      amount: mid,
      rate,
      tenure,
      tenureType,
      moratoriumYears,
      payInterestDuringMoratorium,
      marginalTaxRate: 30,
    });

    if (Math.abs(sim.emi - targetEmi) < 5) {
      bestAmount = mid;
      break;
    }

    if (sim.emi < targetEmi) {
      low = mid;
      bestAmount = mid;
    } else {
      high = mid;
    }
  }

  return Math.round(bestAmount);
}

function computeEducationLoanHealthScore(emi, totalInterest, loanAmount, payInterestDuringMoratorium) {
  let score = 65;

  const interestRatio = totalInterest / Math.max(1, loanAmount);
  if (interestRatio < 0.5) score += 20;
  else if (interestRatio < 1.0) score += 10;
  else if (interestRatio > 1.5) score -= 15;

  if (payInterestDuringMoratorium) score += 15; // Reward paying interest during course

  return Math.min(100, Math.max(0, Math.round(score)));
}

function createZeroLoanResult() {
  return {
    loanAmount: 0,
    rate: 9.5,
    tenure: 10,
    tenureType: 'years',
    moratoriumYears: 4,
    moratoriumMonths: 48,
    payInterestDuringMoratorium: false,
    marginalTaxRate: 30,
    calculationMode: 'forward',
    targetEmi: 0,
    inflationRate: 6,

    primaryOutput: 0,
    emi: 0,
    moratoriumInterest: 0,
    monthlyInterestDuringMoratorium: 0,
    totalPrincipalAtRepayment: 0,
    repaymentInterest: 0,
    totalInterest: 0,
    totalPayment: 0,
    sec80E_eligibleInterest: 0,
    sec80E_taxSavings: 0,
    effectiveNetCost: 0,
    realValue: 0,

    schedule: [],
    scenarios: [],
    sensitivityScenarios: [],
    heroText: 'Please enter a valid loan principal amount to compute education loan repayments.',
    score: 0,
    healthStatus: 'Zero Loan Amount',
  };
}