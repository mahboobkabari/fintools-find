/**
 * Normalization Layer
 * Converts calculator-specific field names into generic normalized data structures.
 */

export function normalizeCalculatorOutput(calculatorSlug, inputs = {}, results = {}) {
  const normalized = {
    calculatorSlug,
    inputs: { ...inputs },
    results: { ...results },
    investment: {
      initialLumpSum: 0,
      monthlyContribution: 0,
      totalInvested: 0,
      expectedReturnRatePct: 0,
    },
    liability: {
      principalAmount: 0,
      monthlyCost: 0,
      interestRatePct: 0,
      tenureYears: 0,
      totalInterest: 0,
    },
    futureValue: 0,
    wealthGain: 0,
    risk: {
      foirPct: 0,
      longevityExhaustionAge: null,
      isExhaustedEarly: false,
    },
    tax: {
      grossIncome: 0,
      totalTaxPayable: 0,
      effectiveTaxRatePct: 0,
      winnerRegime: null,
      taxSaved: 0,
    },
    retirement: {
      currentAge: 30,
      retirementAge: 60,
      lifeExpectancy: 85,
      requiredCorpus: 0,
      projectedCorpus: 0,
      corpusGap: 0,
      readinessPct: 100,
    },
  };

  if (!results) return normalized;

  // EMI & Home Loan Normalization
  if (results.emi || results.monthlyEmi) {
    normalized.liability.monthlyCost = Number(results.emi || results.monthlyEmi) || 0;
    normalized.liability.totalInterest = Number(results.totalInterestPayable || results.totalInterest) || 0;
    normalized.liability.principalAmount = Number(inputs.loanAmount || inputs.homeValue || inputs.principal) || 0;
    normalized.liability.interestRatePct = Number(inputs.interestRate || inputs.rate) || 0;
    normalized.liability.tenureYears = Number(inputs.tenureYears || inputs.tenure) || 0;
    normalized.risk.foirPct = Number(results.foirPct || results.foir) || 0;
  }

  // SIP Normalization
  if (results.futureValue || results.totalInvestment) {
    normalized.investment.monthlyContribution = Number(inputs.monthlyInvestment || inputs.monthlySip) || 0;
    normalized.investment.totalInvested = Number(results.totalInvestment || results.totalInvested) || 0;
    normalized.investment.expectedReturnRatePct = Number(inputs.expectedReturnRate || inputs.returnRate) || 0;
    normalized.futureValue = Number(results.futureValue || results.totalValue) || 0;
    normalized.wealthGain = Number(results.wealthGained || results.estimatedReturns) || 0;
  }

  // Income Tax Normalization
  if (results.winner || results.heroDecision) {
    normalized.tax.grossIncome = Number(inputs.grossIncome || results.grossIncome) || 0;
    normalized.tax.totalTaxPayable = Number(results.winner?.totalTax || results.taxPayable) || 0;
    normalized.tax.effectiveTaxRatePct = Number(results.winner?.effectiveRate || results.effectiveRate) || 0;
    normalized.tax.winnerRegime = results.winner?.regime || (results.heroDecision?.isNewBetter ? 'new' : 'old');
    normalized.tax.taxSaved = Number(results.heroDecision?.taxSavingsAmount) || 0;
  }

  // Retirement Corpus Normalization
  if (results.requiredCorpus || results.readinessScore !== undefined) {
    normalized.retirement.currentAge = Number(inputs.currentAge) || 30;
    normalized.retirement.retirementAge = Number(inputs.retirementAge) || 60;
    normalized.retirement.lifeExpectancy = Number(inputs.lifeExpectancy) || 85;
    normalized.retirement.requiredCorpus = Number(results.requiredCorpus) || 0;
    normalized.retirement.projectedCorpus = Number(results.projectedCorpus) || 0;
    normalized.retirement.corpusGap = Number(results.corpusGap) || 0;
    normalized.retirement.readinessPct = Number(results.readinessScore) ?? 100;
    normalized.risk.longevityExhaustionAge = results.longevity?.exhaustionAge || null;
    normalized.risk.isExhaustedEarly = Boolean(results.longevity?.isExhaustedEarly);
  }

  return normalized;
}
