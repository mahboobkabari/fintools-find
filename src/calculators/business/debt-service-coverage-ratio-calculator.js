/**
 * Flagship Debt Service Coverage Ratio (DSCR) Intelligence Engine (Math Engine V2)
 * Comprehensive Commercial Real Estate & Corporate Debt Underwriting Framework:
 * 1. Direct NOI vs Itemized Revenue / OPEX / EBITDA Mode
 * 2. Total Annual Debt Service (Principal + Interest + Financing Leases)
 * 3. Exact DSCR Calculation & Bank Underwriting Rating
 * 4. Maximum Borrowing Capacity (Max Loan at Required Lender DSCR Benchmark)
 * 5. Breakeven Revenue & Occupancy Decline Tolerance %
 * 6. Interest Coverage Ratio (ICR) & Net Free Cash Flow Buffer
 * 7. Multi-Scenario Stress Testing (Revenue Shock, OPEX Inflation, Interest Rate Hike).
 * 
 * @param {Object} inputs
 * @param {string} [inputs.calculationMode='direct'] - 'direct' | 'itemized' | 'real_estate'
 * @param {number} [inputs.netOperatingIncome=6000000] - Net Operating Income (NOI) / CFADS (e.g. ₹60 Lakhs)
 * @param {number} [inputs.grossRevenue=10000000] - Gross Scheduled Revenue / Rent (e.g. ₹1 Crore)
 * @param {number} [inputs.vacancyLossPct=5] - Vacancy & Credit Loss % (e.g. 5%)
 * @param {number} [inputs.operatingExpenses=3500000] - Operating Expenses (OPEX / Maintenance / Property Tax / Management)
 * @param {number} [inputs.annualPrincipal=2500000] - Annual Principal Debt Repayments (e.g. ₹25 Lakhs)
 * @param {number} [inputs.annualInterest=1500000] - Annual Interest Expense (e.g. ₹15 Lakhs)
 * @param {number} [inputs.annualLeaseObligations=0] - Annual Capital Lease / Other Debt Obligations
 * @param {number} [inputs.targetDscrBenchmark=1.25] - Minimum Lender DSCR Covenant (e.g. 1.20x - 1.35x)
 * @param {number} [inputs.loanInterestRate=8.5] - Prevailing / Benchmark Loan Interest Rate %
 * @param {number} [inputs.loanTenureYears=10] - Amortization Tenure in Years
 * @param {string} [inputs.currencySymbol='₹'] - Currency symbol
 */

export const DEFAULT_DSCR_INPUTS = {
  calculationMode: 'direct',
  netOperatingIncome: 6000000,
  grossRevenue: 10000000,
  vacancyLossPct: 5,
  operatingExpenses: 3500000,
  annualPrincipal: 2500000,
  annualInterest: 1500000,
  annualLeaseObligations: 0,
  targetDscrBenchmark: 1.25,
  loanInterestRate: 8.5,
  loanTenureYears: 10,
  currencySymbol: '₹',
};

export function calculateDebtServiceCoverageRatioCalculator(inputs = {}) {
  const merged = { ...DEFAULT_DSCR_INPUTS, ...inputs };

  // 1. Input Sanitization & Clamping
  const calculationMode = merged.calculationMode || 'direct';

  const rawGross = Number(merged.grossRevenue);
  const grossRevenue = isNaN(rawGross) ? 10000000 : Math.max(0, rawGross);

  const rawVacancy = Number(merged.vacancyLossPct);
  const vacancyLossPct = isNaN(rawVacancy) ? 5 : Math.max(0, Math.min(100, rawVacancy));

  const rawOpex = Number(merged.operatingExpenses);
  const operatingExpenses = isNaN(rawOpex) ? 3500000 : Math.max(0, rawOpex);

  const rawDirectNoi = Number(merged.netOperatingIncome);
  const directNoi = isNaN(rawDirectNoi) ? 6000000 : Math.max(0, rawDirectNoi);

  // Derive Effective Net Operating Income (NOI) based on calculation mode
  let effectiveNoi = directNoi;
  let effectiveGrossRevenue = grossRevenue;
  let vacancyLossAmount = 0;

  if (calculationMode === 'real_estate' || calculationMode === 'itemized') {
    vacancyLossAmount = Math.round(grossRevenue * (vacancyLossPct / 100));
    const effectiveGrossIncome = Math.max(0, grossRevenue - vacancyLossAmount);
    effectiveNoi = Math.max(0, effectiveGrossIncome - operatingExpenses);
    effectiveGrossRevenue = grossRevenue;
  }

  // Debt Service Components
  const rawPrincipal = Number(merged.annualPrincipal);
  const annualPrincipal = isNaN(rawPrincipal) ? 2500000 : Math.max(0, rawPrincipal);

  const rawInterest = Number(merged.annualInterest);
  const annualInterest = isNaN(rawInterest) ? 1500000 : Math.max(0, rawInterest);

  const rawLease = Number(merged.annualLeaseObligations);
  const annualLeaseObligations = isNaN(rawLease) ? 0 : Math.max(0, rawLease);

  const totalDebtService = annualPrincipal + annualInterest + annualLeaseObligations;

  const rawBenchmark = Number(merged.targetDscrBenchmark);
  const targetDscrBenchmark = isNaN(rawBenchmark) || rawBenchmark <= 0 ? 1.25 : Math.max(0.5, Math.min(5.0, rawBenchmark));

  const rawRate = Number(merged.loanInterestRate);
  const loanInterestRate = isNaN(rawRate) ? 8.5 : Math.max(0.1, Math.min(40, rawRate));

  const rawTenure = Number(merged.loanTenureYears);
  const loanTenureYears = isNaN(rawTenure) ? 10 : Math.max(1, Math.min(40, Math.round(rawTenure)));

  const currencySymbol = merged.currencySymbol || '₹';

  // 2. Exact DSCR Calculation
  // DSCR = NOI / Total Debt Service
  const dscr = totalDebtService > 0 ? Math.round((effectiveNoi / totalDebtService) * 100) / 100 : effectiveNoi > 0 ? 99.99 : 0;

  // 3. Cash Flow Cushion & Surplus / Deficit
  const cashFlowSurplus = effectiveNoi - totalDebtService;

  // 4. Interest Coverage Ratio (ICR = NOI / Annual Interest)
  const icr = annualInterest > 0 ? Math.round((effectiveNoi / annualInterest) * 100) / 100 : effectiveNoi > 0 ? 99.99 : 0;

  // 5. Maximum Borrowing Capacity (Max Loan Supported at Target DSCR)
  // Max Annual Debt Service = NOI / Target DSCR
  const maxSupportableAnnualDebtService = targetDscrBenchmark > 0 ? Math.round(effectiveNoi / targetDscrBenchmark) : 0;
  
  // Present Value of Annuity: PV = PMT * [(1 - (1+r)^-n) / r]
  const annualRate = loanInterestRate / 100;
  const annuityFactor = (1 - Math.pow(1 + annualRate, -loanTenureYears)) / annualRate;
  const maxSupportableLoanAmount = Math.round(maxSupportableAnnualDebtService * annuityFactor);

  // Current Estimated Loan Amount Supported by existing Debt Service
  const currentEstimatedLoanPrincipal = totalDebtService > 0 ? Math.round(totalDebtService * annuityFactor) : 0;

  // Additional Borrowing Capacity headroom / (shortfall)
  const additionalBorrowingHeadroom = maxSupportableLoanAmount - currentEstimatedLoanPrincipal;

  // 6. Breakeven Revenue / Occupancy Decline Tolerance %
  // Total obligations = Total Debt Service + Operating Expenses
  // Breakeven Gross Revenue = (Total Debt Service + OPEX) / (1 - Vacancy%)
  const totalOutflows = totalDebtService + operatingExpenses;
  let revenueDeclineTolerancePct = 0;
  let breakevenGrossRevenue = 0;

  if (effectiveGrossRevenue > 0) {
    const vacancyRetention = Math.max(0.01, 1 - vacancyLossPct / 100);
    breakevenGrossRevenue = Math.round(totalOutflows / vacancyRetention);
    const maxDrop = effectiveGrossRevenue - breakevenGrossRevenue;
    revenueDeclineTolerancePct = Math.round((maxDrop / effectiveGrossRevenue) * 1000) / 10;
  }

  // 7. Underwriting Health & Covenant Verdict
  let healthVerdict = 'HEALTHY';
  let healthTitle = 'Prime Coverage (Meets Institutional Lenders)';
  let healthColor = 'text-semantic-success';

  if (dscr < 1.0) {
    healthVerdict = 'DEFAULT_RISK';
    healthTitle = 'Critical Cash Flow Deficit (DSCR < 1.00x - Loan Default Risk)';
    healthColor = 'text-rose-600';
  } else if (dscr < targetDscrBenchmark) {
    healthVerdict = 'BELOW_COVENANT';
    healthTitle = `Below Lender Covenant (DSCR ${dscr}x < ${targetDscrBenchmark}x Target)`;
    healthColor = 'text-amber-600';
  } else if (dscr >= 1.50) {
    healthVerdict = 'STRONG_PRIME';
    healthTitle = 'Excellent Tier-1 Coverage (DSCR ≥ 1.50x)';
    healthColor = 'text-emerald-600';
  }

  // 8. Multi-Scenario Stress Testing Matrix
  // Scenario A: Mild Stress (-10% Revenue / NOI, +5% OPEX)
  const stressNoiA = Math.max(0, Math.round(effectiveNoi * 0.90));
  const stressDscrA = totalDebtService > 0 ? Math.round((stressNoiA / totalDebtService) * 100) / 100 : 0;

  // Scenario B: Moderate Stress (-20% Revenue / Occupancy Shock)
  const stressNoiB = Math.max(0, Math.round(effectiveNoi * 0.80));
  const stressDscrB = totalDebtService > 0 ? Math.round((stressNoiB / totalDebtService) * 100) / 100 : 0;

  // Scenario C: Interest Rate Hike (+200 bps on Interest)
  const stressInterestC = Math.round(annualInterest * 1.25);
  const stressDebtServiceC = annualPrincipal + stressInterestC + annualLeaseObligations;
  const stressDscrC = stressDebtServiceC > 0 ? Math.round((effectiveNoi / stressDebtServiceC) * 100) / 100 : 0;

  const stressScenarios = [
    {
      scenario: 'Base Case (Current Performance)',
      noi: effectiveNoi,
      debtService: totalDebtService,
      dscr: dscr,
      status: dscr >= targetDscrBenchmark ? 'Passed' : 'Covenant Breach',
      statusColor: dscr >= targetDscrBenchmark ? 'text-semantic-success' : 'text-rose-600',
    },
    {
      scenario: 'Scenario 1: -10% Revenue Drop',
      noi: stressNoiA,
      debtService: totalDebtService,
      dscr: stressDscrA,
      status: stressDscrA >= targetDscrBenchmark ? 'Passed' : stressDscrA >= 1.0 ? 'Tight' : 'Default',
      statusColor: stressDscrA >= targetDscrBenchmark ? 'text-semantic-success' : stressDscrA >= 1.0 ? 'text-amber-600' : 'text-rose-600',
    },
    {
      scenario: 'Scenario 2: -20% Occupancy Shock',
      noi: stressNoiB,
      debtService: totalDebtService,
      dscr: stressDscrB,
      status: stressDscrB >= targetDscrBenchmark ? 'Passed' : stressDscrB >= 1.0 ? 'Tight' : 'Default',
      statusColor: stressDscrB >= targetDscrBenchmark ? 'text-semantic-success' : stressDscrB >= 1.0 ? 'text-amber-600' : 'text-rose-600',
    },
    {
      scenario: 'Scenario 3: +200 bps Interest Rate Hike',
      noi: effectiveNoi,
      debtService: stressDebtServiceC,
      dscr: stressDscrC,
      status: stressDscrC >= targetDscrBenchmark ? 'Passed' : stressDscrC >= 1.0 ? 'Tight' : 'Default',
      statusColor: stressDscrC >= targetDscrBenchmark ? 'text-semantic-success' : stressDscrC >= 1.0 ? 'text-amber-600' : 'text-rose-600',
    },
  ];

  // 9. Debt & NOI Breakdown Chart Items
  const debtBreakdownList = [
    { label: 'Annual Principal Repayment', amount: annualPrincipal, colorClass: 'bg-primary' },
    { label: 'Annual Interest Expense', amount: annualInterest, colorClass: 'bg-amber-500' },
    { label: 'Annual Lease / Other Obligations', amount: annualLeaseObligations, colorClass: 'bg-indigo-500' },
    { label: 'Free Cash Flow Surplus', amount: Math.max(0, cashFlowSurplus), colorClass: 'bg-emerald-500' },
  ];

  // 10. Strategic Recommendations
  const recommendations = [
    {
      rank: 1,
      title: 'Lender Covenant & Borrowing Capacity',
      savings: Math.abs(additionalBorrowingHeadroom),
      action: dscr >= targetDscrBenchmark
        ? `Your DSCR of ${dscr}x exceeds the bank requirement of ${targetDscrBenchmark}x by ${(dscr - targetDscrBenchmark).toFixed(2)}x. Based on your current NOI of ${currencySymbol}${effectiveNoi.toLocaleString()}, your business can support up to ${currencySymbol}${maxSupportableLoanAmount.toLocaleString()} in total senior debt.`
        : `Your DSCR of ${dscr}x is below the required ${targetDscrBenchmark}x lender covenant. To qualify without collateral enhancement, debt service must be reduced by ${currencySymbol}${Math.round(totalDebtService - maxSupportableAnnualDebtService).toLocaleString()}/year or NOI must increase to ${currencySymbol}${Math.round(totalDebtService * targetDscrBenchmark).toLocaleString()}.`,
    },
    {
      rank: 2,
      title: 'Revenue Cushion & Breakeven Safety Margin',
      savings: Math.max(0, cashFlowSurplus),
      action: revenueDeclineTolerancePct > 0
        ? `Your revenue can decline by up to ${revenueDeclineTolerancePct}% before operational cash flow fails to cover mandatory debt service payments (Breakeven Revenue: ${currencySymbol}${breakevenGrossRevenue.toLocaleString()}).`
        : `Your business has zero safety buffer. Current revenue is insufficient to cover combined OPEX and debt service, creating an immediate cash shortfall of ${currencySymbol}${Math.abs(cashFlowSurplus).toLocaleString()}.`,
    },
    {
      rank: 3,
      title: 'Interest Rate Sensitivity & Refinancing',
      savings: annualInterest,
      action: `Interest expense represents ${totalDebtService > 0 ? Math.round((annualInterest / totalDebtService) * 100) : 0}% of your total annual debt service. An Interest Coverage Ratio (ICR) of ${icr}x indicates ${icr >= 2.5 ? 'strong' : 'vulnerable'} operating earnings relative to interest obligations.`,
    },
  ];

  // 11. Hero Text
  const heroText = `Your Debt Service Coverage Ratio is ${dscr}x (Lender Target: ${targetDscrBenchmark}x), generating ${currencySymbol}${cashFlowSurplus.toLocaleString()} in annual net free cash flow after servicing ${currencySymbol}${totalDebtService.toLocaleString()} in annual debt.`;

  return {
    primaryOutput: dscr,
    dscr,
    effectiveNoi,
    directNoi,
    grossRevenue,
    vacancyLossPct,
    vacancyLossAmount,
    operatingExpenses,
    annualPrincipal,
    annualInterest,
    annualLeaseObligations,
    totalDebtService,
    cashFlowSurplus,
    icr,
    targetDscrBenchmark,
    loanInterestRate,
    loanTenureYears,
    maxSupportableAnnualDebtService,
    maxSupportableLoanAmount,
    currentEstimatedLoanPrincipal,
    additionalBorrowingHeadroom,
    breakevenGrossRevenue,
    revenueDeclineTolerancePct,
    stressScenarios,
    debtBreakdownList,
    recommendations,
    healthVerdict,
    healthTitle,
    healthColor,
    heroText,
    calculationMode,
    currencySymbol,
  };
}

export const calculateDebtServiceCoverageRatioTool = calculateDebtServiceCoverageRatioCalculator;
export const calculateDscrCalculator = calculateDebtServiceCoverageRatioCalculator;
