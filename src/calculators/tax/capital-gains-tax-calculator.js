/**
 * Institutional Capital Gains Tax Calculator Engine
 * Financial Year: FY 2025-26 | Assessment Year: AY 2026-27 (Finance Act 2024 Amendments)
 * Computes Short-Term Capital Gains (STCG) and Long-Term Capital Gains (LTCG) for
 * Listed Equity, Real Estate, Physical Gold, Unlisted Shares, and Debt Mutual Funds (Sec 50AA).
 *
 * All tax parameters sourced from src/data/tax-rates/capitalGainsTaxRates.js
 */

import { CAPITAL_GAINS_TAX_RATES_FY2025_26 } from '../../data/tax-rates/capitalGainsTaxRates.js';

/**
 * Primary pure calculation function for Capital Gains Tax.
 *
 * @param {Object} inputs
 * @param {number} [inputs.purchasePrice=100000] - Original purchase cost (₹)
 * @param {number} [inputs.salePrice=250000] - Gross sale price / redemption proceeds (₹)
 * @param {string} [inputs.assetType='equity'] - Asset class ID ('equity' | 'real_estate' | 'gold' | 'unlisted_equity' | 'debt_mf')
 * @param {number} [inputs.holdingPeriodMonths=18] - Holding period duration in months
 * @param {number} [inputs.transferExpenses=0] - Brokerage, stamp duty, transfer fees (₹)
 * @param {number} [inputs.improvementCost=0] - Cost of improvement / renovation (₹)
 * @param {number} [inputs.marginalTaxRate=30] - Taxpayer marginal income tax slab rate (%) for slab-taxed assets
 * @returns {Object} Structured numerical results and decision intelligence object
 */
export function calculateCapitalGainsTaxCalculator(inputs = {}) {
  const {
    purchasePrice = 100000,
    salePrice = 250000,
    assetType = 'equity',
    holdingPeriodMonths = 18,
    transferExpenses = 0,
    improvementCost = 0,
    marginalTaxRate = 30,
  } = inputs;

  const numPurchase = Math.max(0, Number(purchasePrice) || 0);
  const numSale = Math.max(0, Number(salePrice) || 0);
  const numHoldingMonths = Math.max(1, Number(holdingPeriodMonths) || 1);
  const numExpenses = Math.max(0, Number(transferExpenses) || 0);
  const numImprovement = Math.max(0, Number(improvementCost) || 0);
  const numMarginalRate = Math.max(0, Math.min(30, Number(marginalTaxRate) || 30));

  // 1. GROSS GAIN & NET CAPITAL GAIN FORMULATION
  const grossGain = numSale - numPurchase;
  const netConsideration = Math.max(0, numSale - numExpenses);
  const totalCostBasis = numPurchase + numImprovement;
  const rawNetCapitalGain = netConsideration - totalCostBasis;
  const isLossScenario = rawNetCapitalGain <= 0;
  const netCapitalGain = Math.max(0, rawNetCapitalGain);

  // 2. ASSET CLASSIFICATION & TAX SECTION DETERMINATION
  const assetConfig = CAPITAL_GAINS_TAX_RATES_FY2025_26.assetClasses[assetType] || CAPITAL_GAINS_TAX_RATES_FY2025_26.assetClasses.equity;
  const isDebtMf = assetType === 'debt_mf';

  let isLongTerm = false;
  let taxSection = '';
  let rateType = 'fixed';
  let applicableTaxRate = 0;
  let exemptionAmount = 0;
  let hasSec112aExemption = false;

  if (isDebtMf) {
    // Section 50AA: Specified Mutual Funds deemed short-term capital assets taxed at marginal slab rate regardless of duration
    isLongTerm = false;
    taxSection = assetConfig.stcgSection;
    rateType = assetConfig.stcgRateType; // 'slab'
    applicableTaxRate = numMarginalRate;
    exemptionAmount = 0;
  } else {
    const ltcgThresholdMonths = assetConfig.ltcgThresholdMonths || 24;
    isLongTerm = numHoldingMonths > ltcgThresholdMonths;

    if (isLongTerm) {
      taxSection = assetConfig.ltcgSection;
      rateType = assetConfig.ltcgRateType;
      applicableTaxRate = rateType === 'fixed' ? assetConfig.ltcgFixedRate : numMarginalRate;
      hasSec112aExemption = assetConfig.hasSec112aExemption === true;
      if (hasSec112aExemption && !isLossScenario) {
        exemptionAmount = CAPITAL_GAINS_TAX_RATES_FY2025_26.sec112aExemptionLimit; // ₹1,25,000 Section 112A threshold
      }
    } else {
      taxSection = assetConfig.stcgSection;
      rateType = assetConfig.stcgRateType;
      applicableTaxRate = rateType === 'fixed' ? assetConfig.stcgFixedRate : numMarginalRate;
      exemptionAmount = 0;
    }
  }

  // 3. TAXABLE GAIN & CESS COMPUTATION
  const taxableGain = isLossScenario ? 0 : Math.max(0, netCapitalGain - exemptionAmount);
  const baseTax = isLossScenario ? 0 : taxableGain * (applicableTaxRate / 100);
  const cessAmount = isLossScenario ? 0 : baseTax * CAPITAL_GAINS_TAX_RATES_FY2025_26.cessRate;
  const taxPayable = isLossScenario ? 0 : Math.round(baseTax + cessAmount);
  const netProfit = isLossScenario ? Math.round(rawNetCapitalGain) : Math.round(netCapitalGain - taxPayable);
  const netProceeds = Math.round(netConsideration - taxPayable);
  const effectiveTaxRatePct = netCapitalGain > 0 ? Number(((taxPayable / netCapitalGain) * 100).toFixed(2)) : 0;

  // 4. DECISION ENGINE & SCORES
  let score = 50;
  if (isLossScenario) {
    score = 30;
  } else {
    if (isLongTerm) score += 20;
    if (exemptionAmount > 0) score += 15;
    if (effectiveTaxRatePct <= 15) score += 15;
  }
  score = Math.min(100, Math.max(0, Math.round(score)));

  let healthStatus = 'Moderate Tax Impact';
  let healthColor = 'text-semantic-warning border-semantic-warning/30 bg-semantic-warning/10';
  if (isLossScenario) {
    healthStatus = 'Capital Loss Scenario (₹0 Tax)';
    healthColor = 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10';
  } else if (effectiveTaxRatePct <= 10) {
    healthStatus = 'Highly Tax Efficient';
    healthColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
  } else if (effectiveTaxRatePct > 20) {
    healthStatus = 'High Tax Impact';
    healthColor = 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10';
  }

  // Hero Descriptions
  let heroText = '';
  let healthDesc = '';

  if (isLossScenario) {
    heroText = `Your asset sale resulted in a capital loss of ₹${Math.abs(rawNetCapitalGain).toLocaleString('en-IN')} (₹0 Tax Payable).`;
    healthDesc = `Short-term and long-term capital losses can be carried forward or set off against taxable capital gains under Section 70/71 of the Income Tax Act.`;
  } else {
    heroText = `Estimated Capital Gains Tax payable is ₹${taxPayable.toLocaleString('en-IN')} (${effectiveTaxRatePct}% effective tax rate).`;
    healthDesc = `Under ${CAPITAL_GAINS_TAX_RATES_FY2025_26.financialYear} Budget 2024 rules (${taxSection}), your net capital gain of ₹${netCapitalGain.toLocaleString('en-IN')} yields ₹${netProfit.toLocaleString('en-IN')} in post-tax net profit.`;
  }

  // 5. HYPOTHETICAL 5-SCENARIO MODELS
  const createScenarioResult = (id, name, badge, sSale, sPurchase, sMonths, sExpenses, sImprovement) => {
    const sNetCons = Math.max(0, sSale - sExpenses);
    const sCostBasis = sPurchase + sImprovement;
    const sRawGain = sNetCons - sCostBasis;
    const sIsLoss = sRawGain <= 0;
    const sNetGain = Math.max(0, sRawGain);

    let sIsLtcg = false;
    let sSec = '';
    let sRate = 0;
    let sExempt = 0;

    if (isDebtMf) {
      sSec = 'Section 50AA';
      sRate = numMarginalRate;
    } else {
      const thresh = assetConfig.ltcgThresholdMonths || 24;
      sIsLtcg = sMonths > thresh;
      if (sIsLtcg) {
        sSec = assetConfig.ltcgSection;
        sRate = assetConfig.ltcgRateType === 'fixed' ? assetConfig.ltcgFixedRate : numMarginalRate;
        if (assetConfig.hasSec112aExemption && !sIsLoss) sExempt = CAPITAL_GAINS_TAX_RATES_FY2025_26.sec112aExemptionLimit;
      } else {
        sSec = assetConfig.stcgSection;
        sRate = assetConfig.stcgRateType === 'fixed' ? assetConfig.stcgFixedRate : numMarginalRate;
      }
    }

    const sTaxable = sIsLoss ? 0 : Math.max(0, sNetGain - sExempt);
    const sBaseTax = sIsLoss ? 0 : sTaxable * (sRate / 100);
    const sCess = sIsLoss ? 0 : sBaseTax * 0.04;
    const sTaxPayable = sIsLoss ? 0 : Math.round(sBaseTax + sCess);
    const sNetProceeds = Math.round(sNetCons - sTaxPayable);

    return {
      id,
      name,
      badge,
      salePrice: sSale,
      netCapitalGain: sNetGain,
      taxableGain: sTaxable,
      taxPayable: sTaxPayable,
      netProceeds: sNetProceeds,
      diffTaxFromBase: sTaxPayable - taxPayable,
      isHypothetical: id !== 'current',
    };
  };

  const sc1 = createScenarioResult('current', 'Current Asset Sale', 'Base Scenario', numSale, numPurchase, numHoldingMonths, numExpenses, numImprovement);
  const sc2 = createScenarioResult('sale_plus10', '+10% Higher Sale Price', 'Price Surge', Math.round(numSale * 1.1), numPurchase, numHoldingMonths, numExpenses, numImprovement);
  const sc3 = createScenarioResult('sale_minus10', '-10% Lower Sale Price', 'Price Drop', Math.round(numSale * 0.9), numPurchase, numHoldingMonths, numExpenses, numImprovement);

  // Scenario 4: Hold Longer (Qualify for LTCG or extend duration)
  const ltcgTargetMonths = (assetConfig.ltcgThresholdMonths || 24) + 1;
  const sc4Months = isLongTerm ? numHoldingMonths + 12 : ltcgTargetMonths;
  const sc4 = createScenarioResult('hold_longer', isLongTerm ? '+1 Year Longer Holding' : 'Hold to Qualify for LTCG', 'Duration Extension', numSale, numPurchase, sc4Months, numExpenses, numImprovement);

  // Scenario 5: Higher Transfer Costs (+2% of Sale Price)
  const sc5Expenses = numExpenses + Math.round(numSale * 0.02);
  const sc5 = createScenarioResult('higher_expenses', 'Higher Brokerage & Expenses', 'Transfer Fees', numSale, numPurchase, numHoldingMonths, sc5Expenses, numImprovement);

  const scenarios = [sc1, sc2, sc3, sc4, sc5];

  // 6. DYNAMIC INSIGHTS ARRAY
  const dynamicInsights = [
    {
      title: 'Holding Period Classification',
      value: isDebtMf ? 'Section 50AA Deemed STCG' : isLongTerm ? 'Long-Term Capital Asset (LTCG)' : 'Short-Term Capital Asset (STCG)',
      description: isDebtMf
        ? 'Debt mutual funds with <=35% equity are deemed short-term capital assets per Section 50AA.'
        : `Asset held for ${numHoldingMonths} months (${isLongTerm ? 'exceeds' : 'does not exceed'} ${assetConfig.ltcgThresholdMonths} months threshold for ${assetConfig.name}).`,
      icon: '⏱️',
    },
    {
      title: 'Tax Provision & Applicable Rate',
      value: `${taxSection} @ ${applicableTaxRate}%`,
      description: rateType === 'slab'
        ? `Taxed at taxpayer marginal slab rate (${applicableTaxRate}%) plus 4% Cess. (Estimated using an illustrative ${applicableTaxRate}% marginal tax-rate assumption).`
        : `Statutory fixed tax rate of ${applicableTaxRate}% under ${taxSection} plus 4% Cess.`,
      icon: '⚖️',
    },
    {
      title: 'Section 112A Exemption Deduction',
      value: exemptionAmount > 0 ? `₹${exemptionAmount.toLocaleString('en-IN')} Exempt` : '₹0 Exemption',
      description: exemptionAmount > 0
        ? `Applied annual ₹1.25 Lakh Section 112A exemption threshold for equity assets.`
        : 'Section 112A exemption applies exclusively to long-term listed equity shares and equity mutual funds.',
      icon: '🎁',
    },
    {
      title: 'Net Proceeds Kept After Tax',
      value: `₹${netProceeds.toLocaleString('en-IN')}`,
      description: `Out of gross sale proceeds of ₹${numSale.toLocaleString('en-IN')}, you retain ₹${netProceeds.toLocaleString('en-IN')} after transfer fees and estimated tax.`,
      icon: '💰',
    },
  ];

  return {
    purchasePrice: numPurchase,
    salePrice: numSale,
    holdingPeriodMonths: numHoldingMonths,
    transferExpenses: numExpenses,
    improvementCost: numImprovement,
    marginalTaxRate: numMarginalRate,
    assetType,
    assetName: assetConfig.name,
    primaryOutput: taxPayable,
    grossGain: Math.round(grossGain),
    netConsideration: Math.round(netConsideration),
    totalCostBasis,
    rawNetCapitalGain: Math.round(rawNetCapitalGain),
    netCapitalGain,
    isLongTerm,
    taxSection,
    rateType,
    applicableTaxRate,
    exemptionAmount,
    hasSec112aExemption,
    taxableGain,
    baseTax: Math.round(baseTax),
    cessAmount: Math.round(cessAmount),
    taxPayable,
    netProfit,
    netProceeds,
    effectiveTaxRatePct,
    score,
    healthStatus,
    healthColor,
    heroText,
    healthDesc,
    scenarios,
    dynamicInsights,
    financialYear: CAPITAL_GAINS_TAX_RATES_FY2025_26.financialYear,
    assessmentYear: CAPITAL_GAINS_TAX_RATES_FY2025_26.assessmentYear,
  };
}