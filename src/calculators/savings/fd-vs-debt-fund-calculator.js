import { FD_VS_DEBT_FUND_CONFIG } from '../configs/fd-vs-debt-fund-calculator.config.js';

/**
 * Flagship FD vs Debt Mutual Fund Post-Tax Decision Engine
 * Compares multi-year post-tax yields across:
 * 1. Bank Fixed Deposit (Section 56 annual income slab taxing)
 * 2. Debt Mutual Fund (Section 50AA STCG slab taxing at redemption with tax deferral)
 * 3. Equity Arbitrage Fund (Section 112A 12.5% LTCG / Section 111A 20% STCG)
 *
 * @param {Object} inputs
 * @param {number} [inputs.depositAmount=500000] - Principal investment amount (₹)
 * @param {number} [inputs.tenureYears=3] - Investment horizon (Years)
 * @param {number} [inputs.fdInterestRate=7.0] - Bank FD annual interest rate (%)
 * @param {number} [inputs.debtFundReturnRate=7.5] - Debt Mutual Fund expected annual return (%)
 * @param {number} [inputs.arbitrageReturnRate=6.8] - Arbitrage Fund expected annual return (%)
 * @param {number} [inputs.taxSlabRate=30.0] - User income tax slab rate (%)
 * @param {number} [inputs.cessRate=4.0] - Health & Education Cess (%)
 * @param {boolean} [inputs.isSec50aaApplies=true] - Whether Section 50AA applies to Debt Fund
 * @param {string} [inputs.currency='INR'] - Currency code ('INR'|'USD'|'EUR'|'GBP')
 * @returns {Object} Structured post-tax fixed income decision model
 */
export function calculateFdVsDebtFundCalculator(inputs = {}) {
  const {
    depositAmount = 500000,
    tenureYears = 3,
    fdInterestRate = 7.0,
    debtFundReturnRate = 7.5,
    arbitrageReturnRate = 6.8,
    taxSlabRate = 30.0,
    cessRate = 4.0,
    isSec50aaApplies = true,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY AUDIT
  const P = Math.max(0, Number(depositAmount) || 0);
  const n = Math.max(1, Math.min(40, Math.round(Number(tenureYears) || 1)));
  const rFd = Math.max(0, Math.min(30, Number(fdInterestRate) || 0));
  const rDebt = Math.max(0, Math.min(30, Number(debtFundReturnRate) || 0));
  const rArb = Math.max(0, Math.min(30, Number(arbitrageReturnRate) || 0));
  const slabPct = Math.max(0, Math.min(50, Number(taxSlabRate) || 0));
  const cessPct = Math.max(0, Math.min(10, Number(cessRate) || 0));
  const isSec50aa = Boolean(isSec50aaApplies);

  // Effective Slab Tax Rate (Slab + Cess)
  const effectiveSlabRate = (slabPct / 100) * (1 + cessPct / 100);

  // 2. BANK FIXED DEPOSIT (FD) MODELING (Quarterly Compounding, Sec 56 Slab Tax)
  let grossFdValue = P;
  if (P > 0) {
    grossFdValue = Math.round(P * Math.pow(1 + (rFd / 400), 4 * n));
  }
  const grossFdInterest = Math.max(0, grossFdValue - P);
  const taxFdLiability = Math.round(grossFdInterest * effectiveSlabRate);
  const postTaxFdValue = Math.max(0, grossFdValue - taxFdLiability);
  const postTaxFdProfit = postTaxFdValue - P;
  const postTaxFdCagr = P > 0 ? (Math.pow(postTaxFdValue / P, 1 / n) - 1) * 100 : 0;
  const taxDragFd = Math.max(0, rFd - postTaxFdCagr);

  // 3. DEBT MUTUAL FUND MODELING (Sec 50AA Redemption Slab Tax with Tax Deferral)
  let grossDebtValue = P;
  if (P > 0) {
    grossDebtValue = Math.round(P * Math.pow(1 + (rDebt / 100), n));
  }
  const grossDebtGain = Math.max(0, grossDebtValue - P);
  const taxDebtLiability = Math.round(grossDebtGain * (isSec50aa ? effectiveSlabRate : effectiveSlabRate));
  const postTaxDebtValue = Math.max(0, grossDebtValue - taxDebtLiability);
  const postTaxDebtProfit = postTaxDebtValue - P;
  const postTaxDebtCagr = P > 0 ? (Math.pow(postTaxDebtValue / P, 1 / n) - 1) * 100 : 0;
  const taxDragDebt = Math.max(0, rDebt - postTaxDebtCagr);

  // 4. EQUITY ARBITRAGE FUND MODELING (Sec 112A LTCG 12.5% / Sec 111A STCG 20%)
  let grossArbValue = P;
  if (P > 0) {
    grossArbValue = Math.round(P * Math.pow(1 + (rArb / 100), n));
  }
  const grossArbGain = Math.max(0, grossArbValue - P);

  let taxArbLiability = 0;
  if (n <= 1) {
    // STCG: 20% + Cess
    const stcgRate = (20.0 / 100) * (1 + cessPct / 100);
    taxArbLiability = Math.round(grossArbGain * stcgRate);
  } else {
    // LTCG: 12.5% + Cess on gains exceeding ₹1,25,000 exemption limit
    const ltcgRate = (12.5 / 100) * (1 + cessPct / 100);
    const taxableGain = Math.max(0, grossArbGain - FD_VS_DEBT_FUND_CONFIG.taxRulesFY2526.ltcgExemptionLimit);
    taxArbLiability = Math.round(taxableGain * ltcgRate);
  }

  const postTaxArbValue = Math.max(0, grossArbValue - taxArbLiability);
  const postTaxArbProfit = postTaxArbValue - P;
  const postTaxArbCagr = P > 0 ? (Math.pow(postTaxArbValue / P, 1 / n) - 1) * 100 : 0;
  const taxDragArb = Math.max(0, rArb - postTaxArbCagr);

  // 5. COMPARISON RANKING & WINNER SELECTION
  const options = [
    {
      id: 'fd',
      name: 'Bank Fixed Deposit',
      grossValue: grossFdValue,
      postTaxValue: postTaxFdValue,
      postTaxProfit: postTaxFdProfit,
      postTaxCagr: Number(postTaxFdCagr.toFixed(2)),
      taxLiability: taxFdLiability,
      taxDrag: Number(taxDragFd.toFixed(2)),
      taxRule: 'Sec 56 Income Slab Tax (Quarterly Compound)',
    },
    {
      id: 'debt_fund',
      name: 'Debt Mutual Fund',
      grossValue: grossDebtValue,
      postTaxValue: postTaxDebtValue,
      postTaxProfit: postTaxDebtProfit,
      postTaxCagr: Number(postTaxDebtCagr.toFixed(2)),
      taxLiability: taxDebtLiability,
      taxDrag: Number(taxDragDebt.toFixed(2)),
      taxRule: 'Sec 50AA STCG Slab Tax (Redemption Tax Deferral)',
    },
    {
      id: 'arbitrage_fund',
      name: 'Equity Arbitrage Fund',
      grossValue: grossArbValue,
      postTaxValue: postTaxArbValue,
      postTaxProfit: postTaxArbProfit,
      postTaxCagr: Number(postTaxArbCagr.toFixed(2)),
      taxLiability: taxArbLiability,
      taxDrag: Number(taxDragArb.toFixed(2)),
      taxRule: n <= 1 ? 'Sec 111A STCG 20%' : 'Sec 112A LTCG 12.5% (>₹1.25L Exemption)',
    },
  ];

  options.sort((a, b) => b.postTaxValue - a.postTaxValue);
  const winner = options[0];
  const runnerUp = options[1];

  const postTaxAdvantage = winner.postTaxValue - runnerUp.postTaxValue;
  const postTaxFdAdvantage = postTaxDebtValue - postTaxFdValue;

  // 6. YEAR-BY-YEAR SCHEDULE ROLLUP
  const yearlySchedule = [];
  for (let y = 1; y <= n; y++) {
    const yrFdGross = P * Math.pow(1 + (rFd / 400), 4 * y);
    const yrFdGain = yrFdGross - P;
    const yrFdPost = yrFdGross - (yrFdGain * effectiveSlabRate);

    const yrDebtGross = P * Math.pow(1 + (rDebt / 100), y);
    const yrDebtGain = yrDebtGross - P;
    const yrDebtPost = yrDebtGross - (yrDebtGain * effectiveSlabRate);

    const yrArbGross = P * Math.pow(1 + (rArb / 100), y);
    const yrArbGain = yrArbGross - P;
    let yrArbTax = 0;
    if (y <= 1) {
      yrArbTax = yrArbGain * (0.20 * 1.04);
    } else {
      const yrTaxable = Math.max(0, yrArbGain - FD_VS_DEBT_FUND_CONFIG.taxRulesFY2526.ltcgExemptionLimit);
      yrArbTax = yrTaxable * (0.125 * 1.04);
    }
    const yrArbPost = yrArbGross - yrArbTax;

    yearlySchedule.push({
      year: y,
      fdGrossValue: Math.round(yrFdGross),
      fdPostTaxValue: Math.round(yrFdPost),
      debtGrossValue: Math.round(yrDebtGross),
      debtPostTaxValue: Math.round(yrDebtPost),
      arbGrossValue: Math.round(yrArbGross),
      arbPostTaxValue: Math.round(yrArbPost),
      isFinalRow: y === n,
    });
  }

  // 7. HERO SUMMARY TEXT
  const currencySymbol = currency === 'USD' ? '$' : '₹';
  const locale = currency === 'USD' ? 'en-US' : 'en-IN';
  const principalFormatted = `${currencySymbol}${P.toLocaleString(locale)}`;
  const winValFormatted = `${currencySymbol}${winner.postTaxValue.toLocaleString(locale)}`;
  const advFormatted = `${currencySymbol}${Math.abs(postTaxAdvantage).toLocaleString(locale)}`;

  const heroText = `For a ${slabPct}% tax slab investor putting ${principalFormatted} over ${n} years, ${winner.name.toUpperCase()} generates the highest post-tax maturity of ${winValFormatted} (${winner.postTaxCagr}% post-tax CAGR), offering ${advFormatted} MORE than ${runnerUp.name}.`;

  return {
    depositAmount: P,
    tenureYears: n,
    fdInterestRate: rFd,
    debtFundReturnRate: rDebt,
    arbitrageReturnRate: rArb,
    taxSlabRate: slabPct,
    cessRate: cessPct,
    isSec50aaApplies: isSec50aa,
    currency,

    // Primary Outputs
    primaryOutput: postTaxAdvantage,
    winningOption: winner.name,
    winningOptionId: winner.id,
    postTaxAdvantage,
    postTaxFdAdvantage,

    postTaxFdValue,
    postTaxDebtFundValue: postTaxDebtValue,
    postTaxArbitrageValue: postTaxArbValue,

    postTaxFdProfit,
    postTaxDebtProfit,
    postTaxArbitrageProfit: postTaxArbProfit,

    postTaxFdCagr: Number(postTaxFdCagr.toFixed(2)),
    postTaxDebtCagr: Number(postTaxDebtCagr.toFixed(2)),
    postTaxArbitrageCagr: Number(postTaxArbCagr.toFixed(2)),

    taxFdLiability,
    taxDebtLiability,
    taxArbLiability,

    taxDragFd: Number(taxDragFd.toFixed(2)),
    taxDragDebt: Number(taxDragDebt.toFixed(2)),
    taxDragArb: Number(taxDragArb.toFixed(2)),

    // Detailed Ranking & Schedule
    options,
    yearlySchedule,
    referenceData: FD_VS_DEBT_FUND_CONFIG.taxRulesFY2526,
    heroText,
  };
}
