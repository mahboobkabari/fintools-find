import { calculateLoan } from '../core/loanEngine.js';
import { PERSONAL_LOAN_CONFIG } from '../configs/personalLoanConfig.js';
import { inflationAdjustedValue, wealthMultiplier } from '../core/investmentUtils.js';

/**
 * Institutional Flagship Personal Borrowing & Debt Consolidation Decision Engine (Math Engine V3)
 * Computes personal loan EMIs, total interest outgo, effective APR (factoring 18% GST on processing fees),
 * credit card debt consolidation savings, FOIR affordability, borrow-less simulators, and reverse target EMI solvers.
 *
 * @param {Object} inputs
 * @param {number} [inputs.amount=500000] - Borrowed personal loan amount (₹)
 * @param {number} [inputs.rate=11.5] - Annual interest rate (% p.a.)
 * @param {number} [inputs.tenure=3] - Loan tenure in years (e.g. 3)
 * @param {number} [inputs.monthlyIncome=100000] - Net monthly salary income (₹)
 * @param {number} [inputs.processingFeePct=1] - Processing fee percentage (%)
 * @param {boolean} [inputs.includeInsurance=false] - Optional credit insurance inclusion
 * @param {number} [inputs.creditCardBalance=0] - Existing high-interest credit card balance (₹)
 * @param {number} [inputs.creditCardApr=36] - Existing credit card annual interest rate / APR (%)
 * @param {number} [inputs.marginalTaxRate=30] - Marginal tax rate (%)
 * @param {string} [inputs.calculationMode='forward'] - Mode: 'forward' | 'reverse_emi'
 * @param {number} [inputs.targetEmi=15000] - Target monthly EMI for reverse solver (₹/mo)
 * @param {number} [inputs.inflationRate=6] - Expected annual inflation rate (%)
 * @returns {Object} Complete structured Personal Loan analytical model
 */
export function calculatePersonalLoan(inputs = {}) {
  const {
    amount = 500000,
    rate = PERSONAL_LOAN_CONFIG.defaultInterestRate,
    tenure = 3,
    monthlyIncome = 100000,
    processingFeePct = 1,
    includeInsurance = false,
    creditCardBalance = 0,
    creditCardApr = PERSONAL_LOAN_CONFIG.benchmarks.creditCardAprDefault,
    marginalTaxRate = 30,
    calculationMode = 'forward',
    targetEmi = 15000,
    inflationRate = 6,
  } = inputs;

  // 1. INPUT SANITIZATION & VALIDATION
  const rawAmount = Math.max(0, Number(amount) || 0);
  const intRate = Math.max(0.1, Math.min(40, Number(rate) || 11.5));
  const loanTenure = Math.max(1, Math.min(10, Number(tenure) || 3));
  const income = Math.max(1, Number(monthlyIncome) || 100000);
  const feePct = Math.max(0, Math.min(10, Number(processingFeePct) || 0));
  const cardBal = Math.max(0, Number(creditCardBalance) || 0);
  const cardApr = Math.max(1, Math.min(60, Number(creditCardApr) || 36));
  const taxRatePct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const targetEmiVal = Math.max(1000, Number(targetEmi) || 15000);
  const infRate = Math.max(0, Math.min(25, Number(inflationRate) || 0));

  // Handle Edge Case: Zero Loan Amount
  if (rawAmount === 0 && cardBal === 0 && calculationMode !== 'reverse_emi') {
    return createZeroPersonalLoanResult();
  }

  // 2. REVERSE TARGET EMI SOLVER MODE
  let effectiveAmount = rawAmount;
  if (calculationMode === 'reverse_emi' && targetEmiVal > 0) {
    effectiveAmount = solvePersonalLoanAmountFromTargetEmiInternal({
      targetEmi: targetEmiVal,
      rate: intRate,
      tenure: loanTenure,
    });
  }

  // 3. FORWARD PERSONAL LOAN SIMULATION EXECUTION
  const simResult = runPersonalLoanSimulation({
    amount: effectiveAmount,
    rate: intRate,
    tenure: loanTenure,
    monthlyIncome: income,
    processingFeePct: feePct,
    includeInsurance,
  });

  // 4. CREDIT CARD DEBT CONSOLIDATION SIMULATOR
  let consolidationSim = null;
  if (cardBal > 0) {
    const cardMonthlyRate = cardApr / 1200;
    // Standard credit card 5% minimum payment
    const cardMinPay = Math.max(1000, Math.round(cardBal * 0.05));
    const cardTotalInterest = Math.round(cardBal * (cardApr / 100) * loanTenure);
    const cardTotalRepayment = cardBal + cardTotalInterest;

    // Personal Loan replacement for exact card balance
    const plConsolidationSim = runPersonalLoanSimulation({
      amount: cardBal,
      rate: intRate,
      tenure: loanTenure,
      monthlyIncome: income,
      processingFeePct: feePct,
      includeInsurance: false,
    });

    consolidationSim = {
      cardBalance: cardBal,
      cardApr,
      cardMinPay,
      cardTotalInterest,
      cardTotalRepayment,
      plEmi: plConsolidationSim.emi,
      plTotalInterest: plConsolidationSim.totalInterest,
      plTotalRepayment: plConsolidationSim.totalRepayment,
      monthlySavings: cardMinPay - plConsolidationSim.emi,
      interestSavings: Math.max(0, cardTotalInterest - plConsolidationSim.totalInterest),
      isConsolidationBeneficial: plConsolidationSim.totalInterest < cardTotalInterest,
    };
  }

  // 5. BORROW LESS SIMULATOR (-₹50K, -₹1L, -₹2L)
  const borrowLessScenarios = [50000, 100000, 200000]
    .filter((delta) => effectiveAmount - delta >= 50000)
    .map((delta) => {
      const newAmt = effectiveAmount - delta;
      const scSim = runPersonalLoanSimulation({
        amount: newAmt,
        rate: intRate,
        tenure: loanTenure,
        monthlyIncome: income,
        processingFeePct: feePct,
        includeInsurance,
      });
      return {
        delta,
        newAmt,
        newEmi: scSim.emi,
        emiSaved: simResult.emi - scSim.emi,
        interestSaved: simResult.totalInterest - scSim.totalInterest,
      };
    });

  // 6. 4-SCENARIO TENURE & BORROWING GRID (1Y Fast Track vs 3Y Standard vs 5Y Long Term vs Borrow 20% Less)
  const scenarios = [
    { id: 'fast_track_1y', label: '1-Year Fast-Track', tenureYears: 1, amountOverride: effectiveAmount },
    { id: 'standard_3y', label: '3-Year Standard', tenureYears: 3, amountOverride: effectiveAmount },
    { id: 'long_term_5y', label: '5-Year Long-Term', tenureYears: 5, amountOverride: effectiveAmount },
    { id: 'borrow_20_less', label: 'Borrow 20% Less', tenureYears: loanTenure, amountOverride: Math.round(effectiveAmount * 0.8) },
  ].map((sc) => {
    const scSim = runPersonalLoanSimulation({
      amount: sc.amountOverride,
      rate: intRate,
      tenure: sc.tenureYears,
      monthlyIncome: income,
      processingFeePct: feePct,
      includeInsurance,
    });
    return {
      id: sc.id,
      label: sc.label,
      tenure: sc.tenureYears,
      amount: sc.amountOverride,
      emi: scSim.emi,
      totalInterest: scSim.totalInterest,
      totalRepayment: scSim.totalRepayment,
      foirPct: scSim.foirPct,
    };
  });

  // 7. RATE SENSITIVITY ANALYSIS (-1.0%, -0.5%, Base, +0.5%, +1.0%)
  const sensitivityScenarios = [-1.0, -0.5, 0, 0.5, 1.0].map((delta) => {
    const scRate = Math.max(0.1, intRate + delta);
    const scLoan = calculateLoan({
      amount: effectiveAmount,
      rate: scRate,
      tenure: loanTenure,
      tenureType: 'years',
    });
    return {
      rate: scRate,
      label: `${scRate.toFixed(2)}% p.a.`,
      emi: scLoan.emi,
      totalInterest: scLoan.totalInterest,
    };
  });

  // 8. INFLATION REAL PURCHASING POWER
  const realValResult = inflationAdjustedValue(
    simResult.totalRepayment,
    infRate,
    loanTenure
  );

  const multiplier = wealthMultiplier(simResult.totalRepayment, effectiveAmount);

  // Hero Summary Text
  let heroText = '';
  const defaultLess = borrowLessScenarios.find((s) => s.delta === 100000) || borrowLessScenarios[0];

  if (calculationMode === 'reverse_emi') {
    heroText = `For a target monthly EMI of ₹${targetEmiVal.toLocaleString(
      'en-IN'
    )}/mo, your maximum affordable personal loan principal is approximately ₹${effectiveAmount.toLocaleString(
      'en-IN'
    )}.`;
  } else if (defaultLess) {
    heroText = `Borrowing ₹${(defaultLess.delta / 100000).toFixed(
      1
    )} Lakh less lowers your monthly EMI by ₹${defaultLess.emiSaved.toLocaleString(
      'en-IN'
    )}/mo and saves ₹${defaultLess.interestSaved.toLocaleString(
      'en-IN'
    )} in total interest outgo.`;
  } else {
    heroText = `Your monthly personal loan EMI is ₹${simResult.emi.toLocaleString(
      'en-IN'
    )}/mo, consuming ${simResult.foirPct}% of your net monthly salary.`;
  }

  return {
    loanAmount: effectiveAmount,
    rate: intRate,
    tenure: loanTenure,
    monthlyIncome: income,
    processingFeePct: feePct,
    includeInsurance,
    creditCardBalance: cardBal,
    creditCardApr: cardApr,
    marginalTaxRate: taxRatePct,
    calculationMode,
    targetEmi: targetEmiVal,
    inflationRate: infRate,

    // Primary Outputs
    primaryOutput: simResult.emi,
    emi: simResult.emi,
    totalInterest: simResult.totalInterest,
    rawProcessingFee: simResult.rawProcessingFee,
    feeGst: simResult.feeGst,
    processingFee: simResult.processingFee,
    insuranceFee: simResult.insuranceFee,
    netDisbursedAmount: simResult.netDisbursedAmount,
    totalRepayment: simResult.totalRepayment,
    effectiveApr: simResult.effectiveApr,

    // Budget & Health Status
    repayPer100: simResult.repayPer100,
    foirPct: simResult.foirPct,
    remainingIncome: simResult.remainingIncome,
    healthScore: simResult.healthScore,
    healthStatus: simResult.healthStatus,
    healthColor: simResult.healthColor,
    healthDesc: simResult.healthDesc,
    isDebtTrapRisk: simResult.isDebtTrapRisk,

    // Consolidation & Simulators
    consolidationSim,
    borrowLessScenarios,
    realValue: realValResult.realValue,

    // Scenarios & Sensitivity
    scenarios,
    sensitivityScenarios,
    schedule: simResult.schedule,

    // Health Score & Status
    heroText,
    score: simResult.healthScore,
  };
}

/**
 * Pure Simulation Engine for Personal Loan & Effective APR Computation
 */
function runPersonalLoanSimulation({
  amount,
  rate,
  tenure,
  monthlyIncome,
  processingFeePct,
  includeInsurance,
}) {
  const loanAmount = Math.max(0, amount);
  const rawProcessingFee = Math.round((loanAmount * processingFeePct) / 100);
  const feeGst = Math.round(rawProcessingFee * (PERSONAL_LOAN_CONFIG.benchmarks.processingFeeGstPct / 100));
  const processingFee = rawProcessingFee + feeGst; // Upfront fee includes 18% GST

  const insuranceFee = includeInsurance ? Math.round(loanAmount * 0.015) : 0;
  const netDisbursedAmount = Math.max(0, loanAmount - processingFee - insuranceFee);

  const loanResult = calculateLoan({
    amount: loanAmount,
    rate,
    tenure,
    tenureType: 'years',
  });

  const emi = loanResult.emi;
  const totalInterest = loanResult.totalInterest;
  const totalRepayment = loanResult.totalPayment + processingFee + insuranceFee;

  // Compute Effective APR (Factoring upfront processing fee + GST)
  const effectiveApr = solveEffectiveAprInternal({
    netDisbursedAmount,
    emi,
    tenureMonths: tenure * 12,
    nominalRate: rate,
  });

  // Budget & Health Calculations
  const repayPer100 = Math.round(((totalRepayment) / (loanAmount || 1)) * 100);
  const foirPct = Math.round((emi / monthlyIncome) * 100);
  const remainingIncome = Math.max(0, monthlyIncome - emi);

  let healthScore = 100;
  if (foirPct > 20) healthScore -= (foirPct - 20) * 1.5;
  if (totalInterest > loanAmount * 0.4) healthScore -= 15;
  if (tenure > 5) healthScore -= 10;
  healthScore = Math.max(10, Math.min(100, Math.round(healthScore)));

  let healthStatus = 'Comfortable';
  let healthColor = 'text-semantic-success';
  let healthDesc = 'Your EMI is less than 20% of monthly income. Highly comfortable!';

  if (healthScore >= 60 && healthScore < 80) {
    healthStatus = 'Moderate Stretch';
    healthColor = 'text-accent-sky';
    healthDesc = 'Reasonable debt commitment. Maintain emergency savings balance.';
  } else if (healthScore >= 40 && healthScore < 60) {
    healthStatus = 'Caution';
    healthColor = 'text-accent-amber';
    healthDesc = 'Your monthly loan payment uses over 35% of your income. Keep extra expenses light.';
  } else if (healthScore < 40) {
    healthStatus = 'High Risk';
    healthColor = 'text-semantic-danger';
    healthDesc = 'Your monthly payment uses almost half of your income. High budget risk!';
  }

  const isHighInterestBurden = totalInterest > loanAmount * 0.6;
  const isHighFoir = foirPct > 40;
  const isHighTenure = tenure >= 6;
  const isDebtTrapRisk = isHighInterestBurden || isHighFoir || isHighTenure;

  return {
    downPaymentAmount: 0,
    loanAmount,
    rawProcessingFee,
    feeGst,
    processingFee,
    insuranceFee,
    netDisbursedAmount,
    emi,
    totalInterest,
    totalRepayment,
    effectiveApr,
    repayPer100,
    foirPct,
    remainingIncome,
    healthScore,
    healthStatus,
    healthColor,
    healthDesc,
    isDebtTrapRisk,
    schedule: loanResult.schedule,
  };
}

/**
 * Pure Internal Solver for Effective APR (Annual Percentage Rate)
 */
function solveEffectiveAprInternal({
  netDisbursedAmount,
  emi,
  tenureMonths,
  nominalRate,
}) {
  if (netDisbursedAmount <= 0 || emi <= 0 || tenureMonths <= 0) return nominalRate;

  let low = 0.0001; // 0.1% monthly
  let high = 0.10; // 10% monthly (120% APR)
  let bestMonthlyRate = nominalRate / 1200;

  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    // Present value of monthly EMI annuity stream
    let pv = 0;
    for (let m = 1; m <= tenureMonths; m++) {
      pv += emi / Math.pow(1 + mid, m);
    }

    if (Math.abs(pv - netDisbursedAmount) < 1) {
      bestMonthlyRate = mid;
      break;
    }

    if (pv > netDisbursedAmount) {
      low = mid;
    } else {
      high = mid;
      bestMonthlyRate = mid;
    }
  }

  const aprPct = Number((bestMonthlyRate * 12 * 100).toFixed(2));
  return Math.max(nominalRate, aprPct);
}

/**
 * Pure Binary Search Solver for Maximum Affordable Personal Loan Amount
 */
function solvePersonalLoanAmountFromTargetEmiInternal({
  targetEmi,
  rate,
  tenure,
}) {
  if (targetEmi <= 0) return 0;

  let low = 10000;
  let high = 10000000; // ₹1 Crore max search space
  let bestAmount = high;

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const sim = calculateLoan({
      amount: mid,
      rate,
      tenure,
      tenureType: 'years',
    });

    if (Math.abs(sim.emi - targetEmi) < 10) {
      bestAmount = mid;
      break;
    }

    if (sim.emi < targetEmi) {
      low = mid;
    } else {
      high = mid;
      bestAmount = mid;
    }
  }

  return Math.round(bestAmount);
}

function createZeroPersonalLoanResult() {
  return {
    loanAmount: 0,
    rate: 11.5,
    tenure: 3,
    monthlyIncome: 100000,
    processingFeePct: 1,
    includeInsurance: false,
    creditCardBalance: 0,
    creditCardApr: 36,
    marginalTaxRate: 30,
    calculationMode: 'forward',
    targetEmi: 0,
    inflationRate: 6,
    primaryOutput: 0,
    emi: 0,
    totalInterest: 0,
    rawProcessingFee: 0,
    feeGst: 0,
    processingFee: 0,
    insuranceFee: 0,
    netDisbursedAmount: 0,
    totalRepayment: 0,
    effectiveApr: 11.5,
    repayPer100: 100,
    foirPct: 0,
    remainingIncome: 100000,
    healthScore: 0,
    healthStatus: 'Zero Input',
    healthColor: 'text-slate-500',
    healthDesc: 'Please enter a valid loan amount.',
    isDebtTrapRisk: false,
    consolidationSim: null,
    borrowLessScenarios: [],
    realValue: 0,
    scenarios: [],
    sensitivityScenarios: [],
    schedule: [],
    heroText: 'Please enter a valid personal loan amount to calculate your monthly EMI.',
    score: 0,
  };
}