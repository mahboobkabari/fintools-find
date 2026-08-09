/**
 * Indian Capital Gains Tax Reference Data
 * Financial Year: FY 2025-26 (Assessment Year: AY 2026-27)
 * Effective Date: Transfers on or after July 23, 2024
 * Authoritative Basis: Income Tax Act, 1961 as amended by Finance Act 2024
 */

export const CAPITAL_GAINS_TAX_RATES_FY2025_26 = {
  financialYear: 'FY 2025-26',
  assessmentYear: 'AY 2026-27',
  effectiveDate: '2024-07-23',
  lawReference: 'Income Tax Act, 1961 (Finance Act 2024 Amendment)',

  cessRate: 0.04, // 4% Health & Education Cess

  sec112aExemptionLimit: 125000, // Annual ₹1.25 Lakh exemption limit for Listed Equity & Equity MFs under Section 112A

  assetClasses: {
    equity: {
      id: 'equity',
      name: 'Listed Equity Shares & Equity Mutual Funds',
      ltcgThresholdMonths: 12,
      stcgSection: 'Section 111A',
      stcgRateType: 'fixed',
      stcgFixedRate: 20.0, // Section 111A rate (Finance Act 2024)
      ltcgSection: 'Section 112A',
      ltcgRateType: 'fixed',
      ltcgFixedRate: 12.5, // Section 112A rate (Finance Act 2024)
      hasSec112aExemption: true,
      hasIndexation: false,
      description: 'Listed equity shares on recognized Indian stock exchanges and equity-oriented mutual fund schemes (>65% equity allocation).',
    },
    real_estate: {
      id: 'real_estate',
      name: 'Real Estate (Residential / Commercial Property)',
      ltcgThresholdMonths: 24,
      stcgSection: 'Section 45 / Normal Slabs',
      stcgRateType: 'slab',
      stcgFixedRate: null, // Taxed at taxpayer marginal slab rate
      ltcgSection: 'Section 112',
      ltcgRateType: 'fixed',
      ltcgFixedRate: 12.5, // Finance Act 2024 rate without indexation for post-23 July 2024 transfers
      hasSec112aExemption: false,
      hasIndexation: false,
      description: 'Land, residential apartments, or commercial property held as capital assets transferred after July 23, 2024.',
    },
    gold: {
      id: 'gold',
      name: 'Physical Gold, Digital Gold & Gold ETFs',
      ltcgThresholdMonths: 24,
      stcgSection: 'Section 45 / Normal Slabs',
      stcgRateType: 'slab',
      stcgFixedRate: null,
      ltcgSection: 'Section 112',
      ltcgRateType: 'fixed',
      ltcgFixedRate: 12.5, // Finance Act 2024 rate without indexation
      hasSec112aExemption: false,
      hasIndexation: false,
      description: 'Physical gold jewelry, gold bars, coins, digital gold, and gold ETFs.',
      limitationNote: 'Sovereign Gold Bonds (SGB) redeemed at maturity by individuals are 100% tax-exempt under Section 47(viib).',
    },
    unlisted_equity: {
      id: 'unlisted_equity',
      name: 'Unlisted Shares & Private Company Equity',
      ltcgThresholdMonths: 24,
      stcgSection: 'Section 45 / Normal Slabs',
      stcgRateType: 'slab',
      stcgFixedRate: null,
      ltcgSection: 'Section 112',
      ltcgRateType: 'fixed',
      ltcgFixedRate: 12.5, // Finance Act 2024 rate without indexation
      hasSec112aExemption: false,
      hasIndexation: false,
      description: 'Shares of unlisted Indian companies, startups, and private entities.',
    },
    debt_mf: {
      id: 'debt_mf',
      name: 'Specified Mutual Funds (Debt MFs per Sec 50AA)',
      ltcgThresholdMonths: null, // Deemed short-term capital asset under Sec 50AA regardless of duration
      stcgSection: 'Section 50AA',
      stcgRateType: 'slab',
      stcgFixedRate: null, // Taxed at taxpayer marginal slab rate
      ltcgSection: 'Section 50AA',
      ltcgRateType: 'slab',
      ltcgFixedRate: null, // Taxed at taxpayer marginal slab rate
      hasSec112aExemption: false,
      hasIndexation: false,
      description: 'Specified Mutual Fund schemes acquired on or after April 1, 2023 with <=35% investment in equity shares.',
    },
  },
};
