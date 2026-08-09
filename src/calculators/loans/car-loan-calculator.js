import { calculateLoan } from '../core/loanEngine.js';
import { CAR_LOAN_CONFIG } from '../configs/carLoanConfig.js';
import { inflationAdjustedValue, wealthMultiplier } from '../core/investmentUtils.js';

/**
 * Institutional Flagship Car Buying & Loan Decision Engine (Math Engine V3)
 * Computes vehicle down payment, loan EMI, 5-year total cost of ownership, fuel/EV electricity costs,
 * Section 80EEB EV tax benefits, FOIR affordability, down payment coach, and reverse target EMI solvers.
 *
 * @param {Object} inputs
 * @param {number} [inputs.vehiclePrice=1200000] - Total on-road vehicle price (₹)
 * @param {number} [inputs.downPaymentPct=20] - Down payment percentage (e.g. 20%)
 * @param {number} [inputs.rate=9.0] - Annual interest rate (% p.a.)
 * @param {number} [inputs.tenure=5] - Loan tenure in years (e.g. 5)
 * @param {number} [inputs.monthlyIncome=100000] - Net monthly salary income (₹)
 * @param {string} [inputs.fuelType='petrol'] - 'petrol' | 'diesel' | 'hybrid' | 'ev'
 * @param {number} [inputs.annualKm=12000] - Estimated annual driving distance (km)
 * @param {number} [inputs.processingFeePct=1] - Processing fee percentage (%)
 * @param {number} [inputs.marginalTaxRate=30] - Marginal tax rate for Sec 80EEB (%)
 * @param {boolean} [inputs.isSec80EEBEligible=false] - Section 80EEB EV loan tax benefit eligibility
 * @param {string} [inputs.calculationMode='forward'] - Mode: 'forward' | 'reverse_emi'
 * @param {number} [inputs.targetEmi=20000] - Target monthly EMI for reverse solver (₹/mo)
 * @param {number} [inputs.inflationRate=6] - Expected annual inflation rate (%)
 * @returns {Object} Complete structured Car Loan analytical model
 */
export function calculateCarLoan(inputs = {}) {
  const {
    vehiclePrice = 1200000,
    downPaymentPct = 20,
    rate = CAR_LOAN_CONFIG.defaultInterestRate,
    tenure = 5,
    monthlyIncome = 100000,
    fuelType = 'petrol',
    annualKm = 12000,
    processingFeePct = 1,
    marginalTaxRate = 30,
    isSec80EEBEligible = false,
    calculationMode = 'forward',
    targetEmi = 20000,
    inflationRate = 6,
  } = inputs;

  // 1. INPUT SANITIZATION & VALIDATION
  const rawPrice = Math.max(0, Number(vehiclePrice) || 0);
  const dpPct = Math.min(90, Math.max(0, Number(downPaymentPct) || 0));
  const intRate = Math.max(0.1, Math.min(30, Number(rate) || 9.0));
  const loanTenure = Math.max(1, Math.min(10, Number(tenure) || 5));
  const income = Math.max(1, Number(monthlyIncome) || 100000);
  const kmPerYear = Math.max(0, Number(annualKm) || 0);
  const feePct = Math.max(0, Number(processingFeePct) || 0);
  const taxRatePct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const targetEmiVal = Math.max(1000, Number(targetEmi) || 20000);
  const infRate = Math.max(0, Math.min(25, Number(inflationRate) || 0));

  // Handle Edge Case: Zero Vehicle Price
  if (rawPrice === 0 && calculationMode !== 'reverse_emi') {
    return createZeroCarResult();
  }

  // 2. REVERSE TARGET EMI SOLVER MODE
  let effectivePrice = rawPrice;
  if (calculationMode === 'reverse_emi' && targetEmiVal > 0) {
    effectivePrice = solveVehiclePriceFromTargetEmiInternal({
      targetEmi: targetEmiVal,
      downPaymentPct: dpPct,
      rate: intRate,
      tenure: loanTenure,
    });
  }

  // 3. FORWARD CAR LOAN SIMULATION EXECUTION
  const simResult = runCarLoanSimulation({
    vehiclePrice: effectivePrice,
    downPaymentPct: dpPct,
    rate: intRate,
    tenure: loanTenure,
    monthlyIncome: income,
    fuelType,
    annualKm: kmPerYear,
    processingFeePct: feePct,
    marginalTaxRate: taxRatePct,
    isSec80EEBEligible,
  });

  // 4. DOWN PAYMENT COACH ("What if +1 Lakh DP?")
  const extraDp = 100000;
  const newDp = Math.min(effectivePrice, simResult.downPaymentAmount + extraDp);
  const newLoanAmount = effectivePrice - newDp;
  const dpCoachSim = calculateLoan({
    amount: newLoanAmount,
    rate: intRate,
    tenure: loanTenure,
    tenureType: 'years',
  });
  const emiReductionDp = simResult.emi - dpCoachSim.emi;
  const interestSavedDp = simResult.totalInterest - dpCoachSim.totalInterest;

  // 5. 4-SCENARIO TENURE & DP GRID (3Y Fast Track vs 5Y Standard vs 7Y Long Term vs 20% DP Boost)
  const scenarios = [
    { id: 'fast_track_3y', label: '3-Year Fast-Track', tenureYears: 3, dpPctOverride: dpPct },
    { id: 'standard_5y', label: '5-Year Standard', tenureYears: 5, dpPctOverride: dpPct },
    { id: 'long_term_7y', label: '7-Year Long-Term', tenureYears: 7, dpPctOverride: dpPct },
    { id: 'boost_dp_30', label: '30% Down Payment Boost', tenureYears: loanTenure, dpPctOverride: 30 },
  ].map((sc) => {
    const scSim = runCarLoanSimulation({
      vehiclePrice: effectivePrice,
      downPaymentPct: sc.dpPctOverride,
      rate: intRate,
      tenure: sc.tenureYears,
      monthlyIncome: income,
      fuelType,
      annualKm: kmPerYear,
      processingFeePct: feePct,
      marginalTaxRate: taxRatePct,
      isSec80EEBEligible,
    });
    return {
      id: sc.id,
      label: sc.label,
      tenure: sc.tenureYears,
      downPaymentPct: sc.dpPctOverride,
      emi: scSim.emi,
      totalInterest: scSim.totalInterest,
      totalOwnershipCost5Yr: scSim.totalOwnershipCost5Yr,
      foirPct: scSim.foirPct,
    };
  });

  // 6. RATE SENSITIVITY ANALYSIS (-1.0%, -0.5%, Base, +0.5%, +1.0%)
  const sensitivityScenarios = [-1.0, -0.5, 0, 0.5, 1.0].map((delta) => {
    const scRate = Math.max(0.1, intRate + delta);
    const scLoan = calculateLoan({
      amount: simResult.loanAmount,
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

  // 7. INFLATION REAL PURCHASING POWER
  const realValResult = inflationAdjustedValue(
    simResult.totalOwnershipCost5Yr,
    infRate,
    loanTenure
  );

  const multiplier = wealthMultiplier(simResult.totalOwnershipCost5Yr, effectivePrice);

  // Hero Summary Text
  let heroText = '';
  if (calculationMode === 'reverse_emi') {
    heroText = `For a target monthly EMI of ₹${targetEmiVal.toLocaleString(
      'en-IN'
    )}/mo, your maximum affordable car price is approximately ₹${effectivePrice.toLocaleString(
      'en-IN'
    )} (with a ${dpPct}% down payment of ₹${simResult.downPaymentAmount.toLocaleString(
      'en-IN'
    )}).`;
  } else {
    heroText = `A ${dpPct}% down payment (₹${simResult.downPaymentAmount.toLocaleString(
      'en-IN'
    )}) keeps your car loan EMI at ₹${simResult.emi.toLocaleString(
      'en-IN'
    )}/mo (${simResult.foirPct}% of income) with a total 5-year ownership cost of ₹${simResult.totalOwnershipCost5Yr.toLocaleString(
      'en-IN'
    )}.`;
  }

  return {
    vehiclePrice: effectivePrice,
    downPaymentPct: dpPct,
    downPaymentAmount: simResult.downPaymentAmount,
    loanAmount: simResult.loanAmount,
    rate: intRate,
    tenure: loanTenure,
    monthlyIncome: income,
    fuelType,
    annualKm: kmPerYear,
    processingFeePct: feePct,
    marginalTaxRate: taxRatePct,
    isSec80EEBEligible,
    calculationMode,
    targetEmi: targetEmiVal,
    inflationRate: infRate,

    // Primary Loan & Ownership Outputs
    primaryOutput: simResult.emi,
    emi: simResult.emi,
    totalInterest: simResult.totalInterest,
    totalPayment: simResult.totalPayment,
    processingFee: simResult.processingFee,
    registrationFee: simResult.registrationFee,
    fuel5Yr: simResult.fuel5Yr,
    insurance5Yr: simResult.insurance5Yr,
    maintenance5Yr: simResult.maintenance5Yr,
    totalOwnershipCost5Yr: simResult.totalOwnershipCost5Yr,

    // FOIR & Affordability Verdict
    foirPct: simResult.foirPct,
    affordabilityStatus: simResult.affordabilityStatus,
    affordabilityColor: simResult.affordabilityColor,
    affordabilityDesc: simResult.affordabilityDesc,

    // Section 80EEB EV Tax Relief
    sec80EEB_eligibleInterest: simResult.sec80EEB_eligibleInterest,
    sec80EEB_taxSavings: simResult.sec80EEB_taxSavings,
    effectiveNetCostAfterEvTax: simResult.totalOwnershipCost5Yr - simResult.sec80EEB_taxSavings,

    // Down Payment Coach
    dpCoach: {
      extraDp,
      emiReduction: emiReductionDp,
      interestSavedDp,
      newLoanAmount,
    },

    // Real Inflation Value
    realValue: realValResult.realValue,

    // Scenarios & Sensitivity
    scenarios,
    sensitivityScenarios,
    schedule: simResult.schedule,

    // Health Score & Status
    heroText,
    score: computeCarLoanHealthScore(simResult.foirPct, dpPct),
    healthStatus: simResult.affordabilityStatus,
  };
}

/**
 * Pure Simulation Engine for Car Loan & 5-Year Ownership Costs
 */
function runCarLoanSimulation({
  vehiclePrice,
  downPaymentPct,
  rate,
  tenure,
  monthlyIncome,
  fuelType,
  annualKm,
  processingFeePct,
  marginalTaxRate,
  isSec80EEBEligible,
}) {
  const downPaymentAmount = Math.round((vehiclePrice * downPaymentPct) / 100);
  const loanAmount = Math.max(0, vehiclePrice - downPaymentAmount);

  const processingFee = Math.round((loanAmount * processingFeePct) / 100);
  const registrationFee = Math.round(vehiclePrice * (CAR_LOAN_CONFIG.benchmarks.registrationTaxPct / 100));

  const loanResult = calculateLoan({
    amount: loanAmount,
    rate,
    tenure,
    tenureType: 'years',
  });

  const emi = loanResult.emi;
  const totalInterest = loanResult.totalInterest;
  const totalPayment = loanResult.totalPayment;

  // 5-Year Operational Costs (Fuel, Insurance, Maintenance)
  const fuelCostPerKm = CAR_LOAN_CONFIG.fuelCostPerKm[fuelType.toLowerCase()] || 7.5;
  const totalKm5Yr = annualKm * 5;
  const fuel5Yr = Math.round(totalKm5Yr * fuelCostPerKm);
  const insurance5Yr = Math.round(vehiclePrice * (CAR_LOAN_CONFIG.benchmarks.annualInsurancePct / 100) * 5);
  const maintenance5Yr = Math.round(vehiclePrice * (CAR_LOAN_CONFIG.benchmarks.annualMaintenancePct / 100) * 5);

  const totalOwnershipCost5Yr =
    vehiclePrice + totalInterest + processingFee + registrationFee + fuel5Yr + insurance5Yr + maintenance5Yr;

  // FOIR Affordability Verdict
  const foirPct = Math.round((emi / monthlyIncome) * 100);

  let affordabilityStatus = 'Comfortable';
  let affordabilityColor = 'text-semantic-success';
  let affordabilityDesc = `Your EMI is ${foirPct}% of monthly income. Leaves healthy room for savings.`;

  if (foirPct > 35 && foirPct <= 45) {
    affordabilityStatus = 'Moderate Stretch';
    affordabilityColor = 'text-accent-amber';
    affordabilityDesc = `Your EMI is ${foirPct}% of monthly income. Keep secondary expenses light.`;
  } else if (foirPct > 45) {
    affordabilityStatus = 'High Risk';
    affordabilityColor = 'text-semantic-danger';
    affordabilityDesc = `Your EMI consumes ${foirPct}% of monthly income. Consider increasing down payment.`;
  }

  // Section 80EEB EV Tax Deduction
  let sec80EEB_eligibleInterest = 0;
  let sec80EEB_taxSavings = 0;

  if (fuelType.toLowerCase() === 'ev' && isSec80EEBEligible) {
    // Sum interest in first 5 years (60 months) capped at ₹1.5L per year
    if (loanResult.schedule && loanResult.schedule.length > 0) {
      let annualInterestAccumulator = 0;
      let yearlyCount = 0;
      loanResult.schedule.forEach((row, idx) => {
        annualInterestAccumulator += row.interestPaid || 0;
        if ((idx + 1) % 12 === 0 || idx === loanResult.schedule.length - 1) {
          sec80EEB_eligibleInterest += Math.min(
            annualInterestAccumulator,
            CAR_LOAN_CONFIG.benchmarks.sec80EEB_maxDeduction
          );
          annualInterestAccumulator = 0;
          yearlyCount++;
        }
      });
    } else {
      sec80EEB_eligibleInterest = Math.min(
        totalInterest,
        CAR_LOAN_CONFIG.benchmarks.sec80EEB_maxDeduction * tenure
      );
    }

    sec80EEB_taxSavings = Math.round(sec80EEB_eligibleInterest * (marginalTaxRate / 100));
  }

  return {
    downPaymentAmount,
    loanAmount,
    processingFee,
    registrationFee,
    emi,
    totalInterest,
    totalPayment,
    fuel5Yr,
    insurance5Yr,
    maintenance5Yr,
    totalOwnershipCost5Yr,
    foirPct,
    affordabilityStatus,
    affordabilityColor,
    affordabilityDesc,
    sec80EEB_eligibleInterest,
    sec80EEB_taxSavings,
    schedule: loanResult.schedule,
  };
}

/**
 * Pure Binary Search Solver for Maximum Affordable Vehicle Price
 */
function solveVehiclePriceFromTargetEmiInternal({
  targetEmi,
  downPaymentPct,
  rate,
  tenure,
}) {
  if (targetEmi <= 0) return 0;

  let low = 100000;
  let high = 50000000; // ₹5 Crore max search space
  let bestPrice = high;

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const dpAmount = (mid * downPaymentPct) / 100;
    const loanAmount = mid - dpAmount;

    const sim = calculateLoan({
      amount: loanAmount,
      rate,
      tenure,
      tenureType: 'years',
    });

    if (Math.abs(sim.emi - targetEmi) < 10) {
      bestPrice = mid;
      break;
    }

    if (sim.emi < targetEmi) {
      low = mid;
    } else {
      high = mid;
      bestPrice = mid;
    }
  }

  return Math.round(bestPrice);
}

function computeCarLoanHealthScore(foirPct, dpPct) {
  let score = 100;
  if (foirPct > 45) score -= 40;
  else if (foirPct > 35) score -= 20;

  if (dpPct < 15) score -= 15;

  return Math.min(100, Math.max(0, Math.round(score)));
}

function createZeroCarResult() {
  return {
    vehiclePrice: 0,
    downPaymentPct: 20,
    downPaymentAmount: 0,
    loanAmount: 0,
    rate: 9.0,
    tenure: 5,
    monthlyIncome: 100000,
    fuelType: 'petrol',
    annualKm: 12000,
    processingFeePct: 1,
    marginalTaxRate: 30,
    isSec80EEBEligible: false,
    calculationMode: 'forward',
    targetEmi: 0,
    inflationRate: 6,
    primaryOutput: 0,
    emi: 0,
    totalInterest: 0,
    totalPayment: 0,
    processingFee: 0,
    registrationFee: 0,
    fuel5Yr: 0,
    insurance5Yr: 0,
    maintenance5Yr: 0,
    totalOwnershipCost5Yr: 0,
    foirPct: 0,
    affordabilityStatus: 'Zero Input',
    affordabilityColor: 'text-slate-500',
    affordabilityDesc: 'Please enter a valid vehicle price.',
    sec80EEB_eligibleInterest: 0,
    sec80EEB_taxSavings: 0,
    effectiveNetCostAfterEvTax: 0,
    dpCoach: { extraDp: 100000, emiReduction: 0, interestSavedDp: 0, newLoanAmount: 0 },
    realValue: 0,
    scenarios: [],
    sensitivityScenarios: [],
    schedule: [],
    heroText: 'Please enter a valid vehicle price to calculate your car loan EMI.',
    score: 0,
    healthStatus: 'Zero Price Input',
  };
}