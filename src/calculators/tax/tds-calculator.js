/**
 * Institutional Flagship TDS Calculator (Tax Deducted at Source Engine V2)
 * Comprehensive statutory tax deduction modeling under Indian Income Tax Act, 1961
 * Compliant with Finance Act 2024 / FY 2025-26 CBDT Guidelines
 */

export const TDS_SECTIONS = {
  '194J_PROF': {
    code: 'Section 194J(b)',
    name: 'Professional Services (Doctors, CAs, Lawyers, Engineers, Consultants)',
    shortName: '194J Professional (10%)',
    category: 'Professional & Technical',
    statutoryRate: 10,
    threshold: 30000,
    thresholdType: 'annual',
    certificateForm: 'Form 16A',
    description: '10% TDS on fees for professional services exceeding ₹30,000 in a financial year.',
  },
  '194J_TECH': {
    code: 'Section 194J(a)',
    name: 'Technical Services, BPO & Call Center Operations',
    shortName: '194J Technical / BPO (2%)',
    category: 'Professional & Technical',
    statutoryRate: 2,
    threshold: 30000,
    thresholdType: 'annual',
    certificateForm: 'Form 16A',
    description: 'Concessional 2% TDS on technical fees, call center operations, and royalty for films.',
  },
  '194C_IND': {
    code: 'Section 194C (Individual/HUF)',
    name: 'Payment to Contractors & Sub-contractors (Individual / HUF)',
    shortName: '194C Contractor Individual (1%)',
    category: 'Contracts & Work',
    statutoryRate: 1,
    threshold: 30000,
    aggregateThreshold: 100000,
    thresholdType: 'single_or_aggregate',
    certificateForm: 'Form 16A',
    description: '1% TDS on contract payments to Individual/HUF (single bill > ₹30K or aggregate > ₹1 Lakh/year).',
  },
  '194C_CORP': {
    code: 'Section 194C (Company/Firm)',
    name: 'Payment to Contractors & Sub-contractors (Company, LLP, Firm)',
    shortName: '194C Contractor Corporate (2%)',
    category: 'Contracts & Work',
    statutoryRate: 2,
    threshold: 30000,
    aggregateThreshold: 100000,
    thresholdType: 'single_or_aggregate',
    certificateForm: 'Form 16A',
    description: '2% TDS on contract payments to corporate entities, LLPs, and partnership firms.',
  },
  '194A_FD': {
    code: 'Section 194A',
    name: 'Bank Fixed Deposit & Recurring Deposit Interest (General / Senior Citizen)',
    shortName: '194A Bank Interest (10%)',
    category: 'Interest & Banking',
    statutoryRate: 10,
    threshold: 40000,
    seniorThreshold: 50000,
    thresholdType: 'annual',
    certificateForm: 'Form 16A',
    description: '10% TDS by banks on annual deposit interest exceeding ₹40,000 (₹50,000 for Senior Citizens).',
  },
  '194I_RENT_PROP': {
    code: 'Section 194I(b)',
    name: 'Rent for Land, Building, Office or Furniture',
    shortName: '194I Rent Land/Building (10%)',
    category: 'Rent & Property',
    statutoryRate: 10,
    threshold: 240000,
    thresholdType: 'annual',
    certificateForm: 'Form 16A',
    description: '10% TDS on annual rent paid for land, building, or office space exceeding ₹2,40,000/year.',
  },
  '194I_RENT_MACH': {
    code: 'Section 194I(a)',
    name: 'Rent for Plant, Machinery or Industrial Equipment',
    shortName: '194I Rent Plant/Machinery (2%)',
    category: 'Rent & Property',
    statutoryRate: 2,
    threshold: 240000,
    thresholdType: 'annual',
    certificateForm: 'Form 16A',
    description: '2% TDS on hiring, leasing, or rent of plant, machinery, or equipment exceeding ₹2,40,000/year.',
  },
  '194IA_PROP_SALE': {
    code: 'Section 194IA',
    name: 'Purchase / Sale of Immovable Property (Buyer to Seller)',
    shortName: '194IA Property Sale (1%)',
    category: 'Rent & Property',
    statutoryRate: 1,
    threshold: 5000000,
    thresholdType: 'gross_consideration',
    certificateForm: 'Form 16B',
    description: '1% TDS deducted by property buyer on total consideration or stamp value exceeding ₹50 Lakhs.',
  },
  '194IB_RENT_IND': {
    code: 'Section 194IB',
    name: 'Rent Paid by Individuals / HUF (Not Liable to Tax Audit)',
    shortName: '194IB Individual Rent (5%)',
    category: 'Rent & Property',
    statutoryRate: 5,
    threshold: 50000, // per month
    thresholdType: 'monthly',
    certificateForm: 'Form 16C',
    description: '5% TDS deducted by individual tenants paying monthly residential/commercial rent > ₹50,000.',
  },
  '194H_COMM': {
    code: 'Section 194H',
    name: 'Commission or Brokerage Payments',
    shortName: '194H Commission (5%)',
    category: 'Commission & Agents',
    statutoryRate: 5,
    threshold: 15000,
    thresholdType: 'annual',
    certificateForm: 'Form 16A',
    description: '5% TDS on commission, brokerage, or agent incentives exceeding ₹15,000 in a financial year.',
  },
  '194M_IND_CONT': {
    code: 'Section 194M',
    name: 'Contract / Commission / Professional by Non-Audit Individuals',
    shortName: '194M High-Value Personal (5%)',
    category: 'Contracts & Work',
    statutoryRate: 5,
    threshold: 5000000,
    thresholdType: 'annual',
    certificateForm: 'Form 16D',
    description: '5% TDS on payments exceeding ₹50 Lakhs/year by individuals not covered under Section 44AB tax audit.',
  },
  '194Q_GOODS': {
    code: 'Section 194Q',
    name: 'Purchase of Goods (Buyer Turnover > ₹10 Crores)',
    shortName: '194Q Purchase of Goods (0.1%)',
    category: 'Commercial & Goods',
    statutoryRate: 0.1,
    threshold: 5000000,
    thresholdType: 'excess_over_threshold',
    certificateForm: 'Form 16A',
    description: '0.1% TDS on purchase value exceeding ₹50 Lakhs from a resident seller in a financial year.',
  },
  'CUSTOM': {
    code: 'Custom Rate',
    name: 'Custom TDS Rate / Other Section',
    shortName: 'Custom TDS Rate',
    category: 'Custom',
    statutoryRate: 10,
    threshold: 0,
    thresholdType: 'none',
    certificateForm: 'Form 16A',
    description: 'Custom user-specified TDS percentage rate for specialized sections or international agreements.',
  },
};

/**
 * Calculates statutory TDS deduction, net payout, non-PAN penalty, refund reconciliation, and compliance metrics.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.amount=100000] - Gross payment / invoice / interest amount (₹)
 * @param {string} [inputs.sectionKey='194J_PROF'] - Key from TDS_SECTIONS
 * @param {number} [inputs.customRate=10] - Custom TDS percentage if sectionKey is 'CUSTOM'
 * @param {boolean|string} [inputs.hasPan=true] - Whether deductee furnished valid PAN (triggers Sec 206AA if false)
 * @param {boolean|string} [inputs.isSeniorCitizen=false] - For Section 194A senior citizen threshold (₹50,000)
 * @param {boolean|string} [inputs.hasLowerRateCert=false] - Whether Section 197 Lower TDS certificate applies
 * @param {number} [inputs.lowerRatePercent=0] - Lower certificate rate (%)
 * @param {boolean|string} [inputs.isThresholdExempt=false] - If true, bypasses threshold check (e.g. cumulative payments)
 * @param {number} [inputs.recipientTaxSlab=30] - Recipient marginal tax slab rate (0, 5, 10, 15, 20, 30) for ITR reconciliation
 * @param {number} [inputs.delayMonthsDeposit=0] - Months of delay in depositing TDS to government (Sec 201(1A) penalty)
 */
export function calculateTdsCalculator(inputs = {}) {
  const {
    amount = 100000,
    sectionKey = '194J_PROF',
    customRate = 10,
    hasPan = true,
    isSeniorCitizen = false,
    hasLowerRateCert = false,
    lowerRatePercent = 0,
    isThresholdExempt = false,
    recipientTaxSlab = 30,
    delayMonthsDeposit = 0,
  } = inputs;

  const rawAmount = Math.max(0, Number(amount) || 0);
  const selectedSection = TDS_SECTIONS[sectionKey] || TDS_SECTIONS['194J_PROF'];
  const panProvided = hasPan === true || hasPan === 'true' || hasPan === 'yes';
  const senior = isSeniorCitizen === true || isSeniorCitizen === 'true' || isSeniorCitizen === 'yes';
  const lowerCert = hasLowerRateCert === true || hasLowerRateCert === 'true' || hasLowerRateCert === 'yes';
  const thresholdExempt = isThresholdExempt === true || isThresholdExempt === 'true' || isThresholdExempt === 'yes';
  const slab = Math.max(0, Math.min(30, Number(recipientTaxSlab) || 0));
  const delayMonths = Math.max(0, Number(delayMonthsDeposit) || 0);

  // 1. Determine Base Statutory Rate
  let baseRate = selectedSection.statutoryRate;
  if (sectionKey === 'CUSTOM') {
    baseRate = Math.max(0, Number(customRate) || 0);
  }

  // 2. Threshold Evaluation
  let threshold = selectedSection.threshold;
  if (sectionKey === '194A_FD' && senior) {
    threshold = selectedSection.seniorThreshold || 50000;
  }

  let isSubjectToTds = true;
  let taxableBaseAmount = rawAmount;

  if (!thresholdExempt && threshold > 0) {
    if (selectedSection.thresholdType === 'excess_over_threshold') {
      // e.g. Section 194Q applies only on value exceeding ₹50 Lakhs
      if (rawAmount <= threshold) {
        isSubjectToTds = false;
        taxableBaseAmount = 0;
      } else {
        taxableBaseAmount = rawAmount - threshold;
      }
    } else {
      // Standard threshold: if below threshold, 0 TDS
      if (rawAmount < threshold) {
        isSubjectToTds = false;
        taxableBaseAmount = 0;
      }
    }
  }

  // 3. Determine Effective Rate
  // Section 206AA: Higher rate of 20% applies if valid PAN is not furnished (5% for Sec 194Q)
  let effectiveRate = baseRate;
  let panPenaltyRate = 0;

  if (lowerCert) {
    effectiveRate = Math.max(0, Number(lowerRatePercent) || 0);
  } else if (!panProvided) {
    const nonPanFloor = sectionKey === '194Q_GOODS' ? 5.0 : 20.0;
    effectiveRate = Math.max(nonPanFloor, baseRate);
    panPenaltyRate = Math.max(0, effectiveRate - baseRate);
  }

  // 4. Calculate TDS & Net Payout
  let tdsAmount = 0;
  let panPenaltyAmount = 0;

  if (isSubjectToTds && taxableBaseAmount > 0) {
    tdsAmount = Math.round((taxableBaseAmount * effectiveRate) / 100);
    if (!panProvided && panPenaltyRate > 0) {
      panPenaltyAmount = Math.round((taxableBaseAmount * panPenaltyRate) / 100);
    }
  }

  const netPayout = Math.max(0, Math.round(rawAmount - tdsAmount));

  // 5. Final Income Tax Reconciliation (TDS vs Actual Tax Liability at ITR)
  // Effective Income Tax Rate with 4% Health & Education Cess
  const cessMultiplier = 1.04;
  const effectiveSlabRateWithCess = slab > 0 ? Number((slab * cessMultiplier).toFixed(2)) : 0;
  const estimatedFinalTax = Math.round((rawAmount * effectiveSlabRateWithCess) / 100);
  
  // Net Position: Positive = Refund from Govt; Negative = Balance Tax Due from Taxpayer
  const netTaxPosition = tdsAmount - estimatedFinalTax;
  const isRefund = netTaxPosition > 0;
  const refundAmount = isRefund ? netTaxPosition : 0;
  const balanceTaxDue = !isRefund ? Math.abs(netTaxPosition) : 0;

  // 6. Statutory Compliance & Late Deposit Penalties under Section 201(1A)
  // 1.5% per month or part of month for late deposit after deduction
  const lateInterestRatePerMonth = 1.5;
  const lateInterestAmount = delayMonths > 0 && tdsAmount > 0
    ? Math.round(tdsAmount * (lateInterestRatePerMonth / 100) * delayMonths)
    : 0;
  const totalPayableWithLateInterest = tdsAmount + lateInterestAmount;

  // 7. Multi-Section Comparison Matrix for this invoice amount
  const comparisonSections = [
    '194J_PROF',
    '194J_TECH',
    '194C_IND',
    '194C_CORP',
    '194I_RENT_PROP',
    '194H_COMM',
  ];

  const multiSectionComparison = comparisonSections.map((secKey) => {
    const sec = TDS_SECTIONS[secKey];
    let secEffectiveRate = panProvided ? sec.statutoryRate : Math.max(20, sec.statutoryRate);
    let secTds = 0;
    if (rawAmount >= sec.threshold || thresholdExempt) {
      secTds = Math.round((rawAmount * secEffectiveRate) / 100);
    }
    return {
      sectionKey: secKey,
      code: sec.code,
      name: sec.shortName,
      statutoryRate: sec.statutoryRate,
      effectiveRate: secEffectiveRate,
      threshold: sec.threshold,
      tdsAmount: secTds,
      netPayout: Math.round(rawAmount - secTds),
    };
  });

  // 8. B2B Invoice & Voucher Preview
  const b2bInvoicePreview = {
    headline: `${selectedSection.code} - Tax Deducted at Source (TDS) Payment Voucher`,
    grossAmount: Math.round(rawAmount),
    sectionCode: selectedSection.code,
    sectionName: selectedSection.name,
    statutoryRate: baseRate,
    effectiveRate,
    tdsDeducted: tdsAmount,
    netPayable: netPayout,
    certificateType: selectedSection.certificateForm,
    panStatus: panProvided ? 'Valid PAN Verified (Normal Rate)' : 'PAN Not Furnished (Sec 206AA Penal 20% Applied)',
    isAboveThreshold: isSubjectToTds,
  };

  // 9. Smart Actionable Recommendations
  const recommendations = [];

  if (!panProvided) {
    recommendations.push({
      rank: 1,
      type: 'warning',
      title: 'Submit PAN Card to Save Penal TDS',
      savings: panPenaltyAmount,
      action: `Furnishing a valid PAN immediately reduces TDS from ${effectiveRate}% to ${baseRate}%, saving ₹${panPenaltyAmount.toLocaleString('en-IN')} on this invoice.`,
    });
  }

  if (isRefund && refundAmount > 0) {
    recommendations.push({
      rank: 2,
      type: 'success',
      title: 'Claim 100% Tax Refund via ITR Filing',
      savings: refundAmount,
      action: `Your actual tax slab (${slab}%) is lower than TDS deducted (${effectiveRate}%). You are eligible to claim a refund of ₹${refundAmount.toLocaleString('en-IN')} with interest under Section 244A.`,
    });
  } else if (balanceTaxDue > 0) {
    recommendations.push({
      rank: 2,
      type: 'info',
      title: 'Pay Advance Tax to Avoid Sec 234B/234C Interest',
      savings: balanceTaxDue,
      action: `Since your tax bracket (${slab}%) exceeds the TDS rate, you will owe ₹${balanceTaxDue.toLocaleString('en-IN')} in balance tax. Pay quarterly advance tax to avoid penal interest.`,
    });
  }

  if (sectionKey === '194A_FD' && rawAmount <= 300000) {
    recommendations.push({
      rank: 3,
      type: 'info',
      title: 'Submit Form 15G / Form 15H for 0% TDS on FD',
      savings: tdsAmount,
      action: 'If your total taxable income for the year is zero, submit Form 15G (General) or Form 15H (Senior Citizen) to your bank branch to prevent TDS deduction.',
    });
  }

  if (rawAmount >= 500000 && !lowerCert) {
    recommendations.push({
      rank: 4,
      type: 'info',
      title: 'Apply for Lower TDS Certificate under Section 197',
      savings: tdsAmount,
      action: 'If your annual estimated tax liability is low, you can apply online on the Income Tax TRACES portal for a Form 13 Lower/NIL TDS Certificate.',
    });
  }

  // 10. Hero Decision Summary Text
  let heroText = '';
  if (!isSubjectToTds) {
    heroText = `Invoice of ₹${rawAmount.toLocaleString('en-IN')} is below statutory threshold (₹${threshold.toLocaleString('en-IN')}). TDS Deducted: ₹0 (100% Net Payout).`;
  } else if (!panProvided) {
    heroText = `Section 206AA Penal Rate Applied: 20% TDS of ₹${tdsAmount.toLocaleString('en-IN')} deducted. Net cash payout is ₹${netPayout.toLocaleString('en-IN')}.`;
  } else {
    heroText = `${selectedSection.code} (${effectiveRate}%) deducts ₹${tdsAmount.toLocaleString('en-IN')} TDS from ₹${rawAmount.toLocaleString('en-IN')}. Net Cash Payout: ₹${netPayout.toLocaleString('en-IN')}.`;
  }

  return {
    primaryOutput: tdsAmount,
    grossAmount: Math.round(rawAmount),
    sectionKey,
    section: selectedSection,
    baseRate,
    effectiveRate,
    tdsAmount,
    netPayout,
    threshold,
    isAboveThreshold: isSubjectToTds,
    hasPan: panProvided,
    panPenaltyRate,
    panPenaltyAmount,
    hasLowerRateCert: lowerCert,
    lowerRatePercent: Number(lowerRatePercent) || 0,
    isSeniorCitizen: senior,
    isThresholdExempt: thresholdExempt,
    taxReconciliation: {
      recipientTaxSlab: slab,
      cessRate: 4,
      effectiveSlabRateWithCess,
      estimatedFinalTax,
      netTaxPosition,
      isRefund,
      refundAmount,
      balanceTaxDue,
    },
    compliance: {
      depositDueDate: '7th of next month (30th April for March deductions)',
      certificateForm: selectedSection.certificateForm,
      quarterlyReturnForm: selectedSection.code.includes('Salary') ? 'Form 24Q' : 'Form 26Q',
      lateInterestRatePerMonth,
      delayMonths,
      lateInterestAmount,
      totalPayableWithLateInterest,
    },
    multiSectionComparison,
    b2bInvoicePreview,
    recommendations,
    heroText,
  };
}