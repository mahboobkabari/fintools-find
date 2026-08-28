/**
 * Multi-Jurisdiction Cryptocurrency Tax Framework Reference Data
 * Tax Year: 2025 - 2026 Reference Baseline
 * 
 * Sourced from official tax authority guidance:
 * - United States: IRS Notice 2014-21, Rev. Rul. 2019-24, Rev. Rul. 2023-14 (Form 8949 / Schedule D)
 * - India: Income Tax Act, 1961 (Section 115BBH, Section 194S, Finance Act 2022-2024)
 * - United Kingdom: HMRC Cryptoassets Manual (CRYPTO20000, Section 104 Pooling)
 * - Germany: German Federal Ministry of Finance (BMF Guidance 2022, EStG § 23, § 22 Nr. 3)
 * - Australia: Australian Taxation Office (ATO Crypto Asset Guidelines, 50% CGT Discount)
 * - Generic: International baseline user-configurable framework
 * 
 * DISCLAIMER: Tax regulations vary by jurisdiction, filing status, and residency.
 * This data is for educational modeling only and does not constitute formal tax or legal advice.
 */

export const CRYPTO_TAX_JURISDICTIONS = {
  GENERIC: {
    id: 'GENERIC',
    name: 'Generic / Global (User-Defined Rates)',
    countryCode: 'GLOBAL',
    currency: 'USD',
    flag: '🌐',
    defaultShortTermRate: 30.0,
    defaultLongTermRate: 15.0,
    defaultIncomeRate: 25.0,
    holdingThresholdDays: 365,
    supportsLongTermDiscount: true,
    feesDeductible: true,
    lossOffsetAllowed: true,
    stakingTreatedAsIncome: true,
    notes: 'Configurable universal baseline for international modeling with customizable short-term and long-term tax rates.',
  },
  US: {
    id: 'US',
    name: 'United States (IRS Notice 2014-21)',
    countryCode: 'US',
    currency: 'USD',
    flag: '🇺🇸',
    defaultShortTermRate: 24.0, // Typical marginal bracket
    defaultLongTermRate: 15.0, // Standard LTCG rate (0%, 15%, 20%)
    defaultIncomeRate: 24.0,
    holdingThresholdDays: 365, // > 365 days is Long-Term
    supportsLongTermDiscount: true,
    feesDeductible: true,
    lossOffsetAllowed: true, // Capital losses offset gains + up to $3k ordinary income
    stakingTreatedAsIncome: true, // Ordinary income at FMV upon receipt (Rev. Rul. 2023-14)
    statuteReference: 'IRS Notice 2014-21, Rev. Rul. 2023-14, 26 U.S. Code § 1221',
    notes: 'Short-term gains (<=1 yr) taxed as ordinary income. Long-term gains (>1 yr) receive preferential capital gains rates (0%, 15%, 20%). Staking & mining rewards recognized as ordinary income at FMV.',
  },
  IN: {
    id: 'IN',
    name: 'India (Income Tax Act Sec 115BBH)',
    countryCode: 'IN',
    currency: 'INR',
    flag: '🇮🇳',
    defaultShortTermRate: 31.2, // 30% flat + 4% cess
    defaultLongTermRate: 31.2, // Flat 30% regardless of holding period
    defaultIncomeRate: 31.2,
    holdingThresholdDays: 0, // No holding period differentiation
    supportsLongTermDiscount: false, // Flat 30% across all tenures
    feesDeductible: false, // Strict Sec 115BBH: Only direct cost of acquisition allowed, no transfer/exchange fee deductions
    lossOffsetAllowed: false, // Strict Sec 115BBH(2)(b): Losses cannot be set off against any other income or other crypto gains
    tdsRatePct: 1.0, // 1% TDS under Section 194S
    tdsThreshold: 50000, // ₹50,000 annual threshold (₹10,000 for specified persons)
    stakingTreatedAsIncome: true, // Other sources under Sec 56(2)
    statuteReference: 'Income Tax Act, 1961 - Sections 115BBH, 194S, 56(2)(x)',
    notes: 'Flat 30% (+4% cess = 31.2%) tax on all VDA transfer gains. No deduction for transaction fees or expenses other than cost of acquisition. Zero loss set-off or carry-forward. 1% TDS under Sec 194S on transfers.',
  },
  UK: {
    id: 'UK',
    name: 'United Kingdom (HMRC Cryptoassets Manual)',
    countryCode: 'GB',
    currency: 'GBP',
    flag: '🇬🇧',
    defaultShortTermRate: 20.0, // Higher rate CGT for individuals
    defaultLongTermRate: 20.0, // UK applies CGT rates regardless of holding duration
    defaultIncomeRate: 40.0, // Higher rate income tax
    holdingThresholdDays: 0,
    supportsLongTermDiscount: false,
    annualExemptAmount: 3000, // £3,000 CGT allowance (2024-2026)
    feesDeductible: true,
    lossOffsetAllowed: true,
    stakingTreatedAsIncome: true, // Miscellaneous / trading income
    statuteReference: 'HMRC Cryptoassets Manual CRYPTO20000, TCGA 1992',
    notes: 'Disposals subject to Capital Gains Tax (10% basic / 20% higher rate) above the £3,000 Annual Exempt Amount. Staking and mining rewards taxed as Income Tax upon receipt.',
  },
  DE: {
    id: 'DE',
    name: 'Germany (EStG § 23 Private Sales)',
    countryCode: 'DE',
    currency: 'EUR',
    flag: '🇩🇪',
    defaultShortTermRate: 35.0, // Personal income tax bracket (up to 45%)
    defaultLongTermRate: 0.0, // 100% TAX FREE if held > 1 year!
    defaultIncomeRate: 35.0,
    holdingThresholdDays: 365, // 1-year holding period rule
    supportsLongTermDiscount: true,
    annualExemptionLimit: 1000, // €1,000 annual Freigrenze
    feesDeductible: true,
    lossOffsetAllowed: true,
    stakingTreatedAsIncome: true, // § 22 Nr. 3 EStG
    statuteReference: 'Einkommensteuergesetz (EStG) § 23 Abs. 1 Nr. 2, BMF Guidance 2022',
    notes: 'Holding period > 1 year is 100% TAX FREE (§ 23 EStG). For holding period <= 1 year, gains are taxed at personal income tax rate if total annual profits exceed €1,000.',
  },
  AU: {
    id: 'AU',
    name: 'Australia (ATO 50% CGT Discount)',
    countryCode: 'AU',
    currency: 'AUD',
    flag: '🇦🇺',
    defaultShortTermRate: 32.5, // Resident marginal tax rate
    defaultLongTermRate: 16.25, // 50% CGT discount (32.5% * 0.5)
    defaultIncomeRate: 32.5,
    holdingThresholdDays: 365, // 12-month rule
    supportsLongTermDiscount: true,
    cgtDiscountPct: 50.0, // 50% discount for assets held >= 12 months
    feesDeductible: true,
    lossOffsetAllowed: true,
    stakingTreatedAsIncome: true,
    statuteReference: 'ITAA 1997 Division 115, ATO Crypto Asset Guidelines',
    notes: 'Disposals held for 12+ months qualify for a 50% CGT discount for individual Australian residents. Staking and airdrop rewards taxed as ordinary income at FMV on receipt.',
  },
};

export const CRYPTO_TRANSACTION_TYPES = {
  SELL: {
    id: 'SELL',
    label: 'Sell / Fiat Disposal',
    description: 'Selling crypto for government fiat currency (USD, EUR, INR, GBP, etc.).',
    isTaxableDisposal: true,
    generatesIncomeTax: false,
  },
  SWAP: {
    id: 'SWAP',
    label: 'Crypto-to-Crypto Swap',
    description: 'Exchanging one cryptocurrency for another (e.g. BTC to ETH). Taxable disposal of sold asset at FMV.',
    isTaxableDisposal: true,
    generatesIncomeTax: false,
  },
  BUY: {
    id: 'BUY',
    label: 'Buy / Acquisition',
    description: 'Purchasing crypto with fiat. Not a taxable event; establishes cost basis and acquisition date.',
    isTaxableDisposal: false,
    generatesIncomeTax: false,
  },
  STAKING_REWARD: {
    id: 'STAKING_REWARD',
    label: 'Staking Reward / Yield',
    description: 'Receiving staking rewards. Taxed as ordinary income at FMV when received; sets cost basis for later sale.',
    isTaxableDisposal: false,
    generatesIncomeTax: true,
  },
  MINING_REWARD: {
    id: 'MINING_REWARD',
    label: 'Mining Reward',
    description: 'Receiving newly minted mining rewards. Recognized as taxable income upon receipt.',
    isTaxableDisposal: false,
    generatesIncomeTax: true,
  },
  AIRDROP: {
    id: 'AIRDROP',
    label: 'Airdrop / Hard Fork',
    description: 'Receiving promotional tokens. Recognized as ordinary income at FMV at receipt.',
    isTaxableDisposal: false,
    generatesIncomeTax: true,
  },
  TRANSFER: {
    id: 'TRANSFER',
    label: 'Internal Wallet Transfer',
    description: 'Moving crypto between personal wallets or exchanges. Non-taxable transfer.',
    isTaxableDisposal: false,
    generatesIncomeTax: false,
  },
};

export const COST_BASIS_METHODS = {
  FIFO: {
    id: 'FIFO',
    name: 'FIFO (First-In, First-Out)',
    description: 'Oldest acquired units are sold first.',
  },
  LIFO: {
    id: 'LIFO',
    name: 'LIFO (Last-In, First-Out)',
    description: 'Most recently acquired units are sold first.',
  },
  HIFO: {
    id: 'HIFO',
    name: 'HIFO (Highest-In, First-Out)',
    description: 'Highest purchase cost units are sold first to minimize current capital gains.',
  },
  SPECIFIC_ID: {
    id: 'SPECIFIC_ID',
    name: 'Specific Identification / Single Lot',
    description: 'Direct lot matching of a specific purchase lot against disposal.',
  },
};
