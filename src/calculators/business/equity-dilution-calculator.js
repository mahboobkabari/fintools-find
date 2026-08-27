/**
 * Flagship Equity Dilution, Cap Table Waterfall & Option Pool Shuffle Engine (Math Engine V2)
 * Supports Pre-Money vs Post-Money Valuation, Pre-Round vs Post-Round ESOP Pool Shuffle,
 * Share Count & Share Price Mechanics, Founder Dilution %, Founder Equity Value Growth,
 * and Multi-Round Waterfall Trajectory (Seed, Series A, Series B).
 * 
 * @param {Object} inputs
 * @param {number} [inputs.preMoneyValuation=20000000] - Pre-Money Valuation (e.g. ₹2 Crores / 20M)
 * @param {number} [inputs.investmentAmount=5000000] - Investment capital raised in current round
 * @param {number} [inputs.founderInitialOwnershipPct=100] - Existing founder ownership % before round
 * @param {number} [inputs.targetEsopPoolPct=10] - Target unallocated ESOP pool % required by investors
 * @param {number} [inputs.existingEsopPoolPct=0] - Existing unallocated ESOP pool % before round
 * @param {string} [inputs.esopPoolTiming='pre_money'] - 'pre_money' (Investor Shuffle) or 'post_money' (Pro-Rata)
 * @param {number} [inputs.existingShares=10000000] - Existing fully diluted shares before round
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const DEFAULT_EQUITY_DILUTION_INPUTS = {
  preMoneyValuation: 20000000,
  investmentAmount: 5000000,
  founderInitialOwnershipPct: 100,
  targetEsopPoolPct: 10,
  existingEsopPoolPct: 0,
  esopPoolTiming: 'pre_money',
  existingShares: 10000000,
  currencySymbol: '₹',
};

export function calculateEquityDilutionCalculator(inputs = {}) {
  const merged = { ...DEFAULT_EQUITY_DILUTION_INPUTS, ...inputs };

  // 1. Input Sanitization & Clamping
  const rawPre = Number(merged.preMoneyValuation);
  const preMoneyValuation = isNaN(rawPre) ? 20000000 : Math.max(10000, rawPre);

  const rawInv = Number(merged.investmentAmount);
  const investmentAmount = isNaN(rawInv) ? 5000000 : Math.max(0, rawInv);

  const rawFounderOwn = Number(merged.founderInitialOwnershipPct);
  const founderInitialOwnershipPct = isNaN(rawFounderOwn) ? 100 : Math.max(1, Math.min(100, rawFounderOwn));

  const rawTargetEsop = Number(merged.targetEsopPoolPct);
  const targetEsopPoolPct = isNaN(rawTargetEsop) ? 10 : Math.max(0, Math.min(50, rawTargetEsop));

  const rawExistEsop = Number(merged.existingEsopPoolPct);
  const existingEsopPoolPct = isNaN(rawExistEsop) ? 0 : Math.max(0, Math.min(targetEsopPoolPct, rawExistEsop));

  const rawShares = Number(merged.existingShares);
  const existingShares = isNaN(rawShares) ? 10000000 : Math.max(100, rawShares);

  const esopPoolTiming = merged.esopPoolTiming === 'post_money' ? 'post_money' : 'pre_money';
  const currencySymbol = merged.currencySymbol || '₹';

  // 2. Post-Money Valuation
  const postMoneyValuation = preMoneyValuation + investmentAmount;
  const rawInvestorPct = postMoneyValuation > 0 ? (investmentAmount / postMoneyValuation) * 100 : 0;
  const esopExpansionPct = Math.max(0, targetEsopPoolPct - existingEsopPoolPct);

  // 3. Ownership & Option Pool Calculations
  let founderPostRoundPct = 0;
  let investorPostRoundPct = 0;
  let esopPostRoundPct = 0;
  let otherExistingPostRoundPct = 0;
  const otherExistingInitialPct = Math.max(0, 100 - founderInitialOwnershipPct - existingEsopPoolPct);

  let sharePrice = 0;
  let newSharesIssued = 0;
  let esopSharesIssued = 0;
  let totalPostRoundShares = 0;

  if (esopPoolTiming === 'pre_money') {
    // Standard VC "Option Pool Shuffle": Target pool is created out of pre-money equity,
    // diluting founders 100% for the ESOP expansion before investor capital enters.
    investorPostRoundPct = rawInvestorPct;
    esopPostRoundPct = targetEsopPoolPct;

    // Remaining ownership for existing shareholders
    const remainingForExisting = Math.max(0, 100 - investorPostRoundPct - esopPostRoundPct);
    const existingCombined = founderInitialOwnershipPct + otherExistingInitialPct;

    if (existingCombined > 0) {
      founderPostRoundPct = (founderInitialOwnershipPct / existingCombined) * remainingForExisting;
      otherExistingPostRoundPct = (otherExistingInitialPct / existingCombined) * remainingForExisting;
    } else {
      founderPostRoundPct = remainingForExisting;
      otherExistingPostRoundPct = 0;
    }

    // Share Price & Share Issuance in Pre-Money Shuffle:
    // Effective pre-round shares factoring in the pre-money option pool expansion
    const poolFraction = esopExpansionPct / 100;
    const effectivePreShares = poolFraction < 1 ? existingShares / (1 - poolFraction) : existingShares;
    sharePrice = effectivePreShares > 0 ? preMoneyValuation / effectivePreShares : 0;
    newSharesIssued = sharePrice > 0 ? Math.round(investmentAmount / sharePrice) : 0;
    esopSharesIssued = Math.max(0, Math.round(effectivePreShares - existingShares));
    totalPostRoundShares = existingShares + newSharesIssued + esopSharesIssued;
  } else {
    // Post-Money Option Pool: Pool expansion dilutes everyone pro-rata (investors + founders)
    const investorPreEsopPct = rawInvestorPct;
    const poolFactor = (100 - esopExpansionPct) / 100;

    investorPostRoundPct = investorPreEsopPct * poolFactor;
    founderPostRoundPct = founderInitialOwnershipPct * (1 - rawInvestorPct / 100) * poolFactor;
    otherExistingPostRoundPct = otherExistingInitialPct * (1 - rawInvestorPct / 100) * poolFactor;
    esopPostRoundPct = existingEsopPoolPct * (1 - rawInvestorPct / 100) * poolFactor + esopExpansionPct;

    sharePrice = existingShares > 0 ? preMoneyValuation / existingShares : 0;
    newSharesIssued = sharePrice > 0 ? Math.round(investmentAmount / sharePrice) : 0;
    const sharesBeforeEsop = existingShares + newSharesIssued;
    const esopFraction = esopExpansionPct / 100;
    esopSharesIssued = esopFraction < 1 ? Math.round((sharesBeforeEsop * esopFraction) / (1 - esopFraction)) : 0;
    totalPostRoundShares = sharesBeforeEsop + esopSharesIssued;
  }

  // Round percentages to 2 decimals for clean reporting
  founderPostRoundPct = Math.round(founderPostRoundPct * 100) / 100;
  investorPostRoundPct = Math.round(investorPostRoundPct * 100) / 100;
  esopPostRoundPct = Math.round(esopPostRoundPct * 100) / 100;
  otherExistingPostRoundPct = Math.round(otherExistingPostRoundPct * 100) / 100;

  // 4. Founder Dilution & Equity Valuation Creation
  const founderDilutionPct = founderInitialOwnershipPct > 0
    ? Math.round((1 - founderPostRoundPct / founderInitialOwnershipPct) * 1000) / 10
    : 0;

  const founderPreRoundValue = Math.round((founderInitialOwnershipPct / 100) * preMoneyValuation);
  const founderPostRoundValue = Math.round((founderPostRoundPct / 100) * postMoneyValuation);
  const founderNetValueAdded = founderPostRoundValue - founderPreRoundValue;
  const founderValueMultiple = founderPreRoundValue > 0
    ? Math.round((founderPostRoundValue / founderPreRoundValue) * 100) / 100
    : 1;

  // 5. Cap Table Distribution Array
  const capTable = [
    {
      stakeholder: 'Founding Team',
      preRoundPct: founderInitialOwnershipPct,
      postRoundPct: founderPostRoundPct,
      postRoundValue: founderPostRoundValue,
      colorClass: 'bg-primary',
    },
    {
      stakeholder: 'New Round Investors',
      preRoundPct: 0,
      postRoundPct: investorPostRoundPct,
      postRoundValue: Math.round((investorPostRoundPct / 100) * postMoneyValuation),
      colorClass: 'bg-emerald-500',
    },
    {
      stakeholder: 'ESOP Option Pool',
      preRoundPct: existingEsopPoolPct,
      postRoundPct: esopPostRoundPct,
      postRoundValue: Math.round((esopPostRoundPct / 100) * postMoneyValuation),
      colorClass: 'bg-indigo-500',
    },
  ];

  if (otherExistingInitialPct > 0 || otherExistingPostRoundPct > 0) {
    capTable.push({
      stakeholder: 'Prior Investors / Angels',
      preRoundPct: otherExistingInitialPct,
      postRoundPct: otherExistingPostRoundPct,
      postRoundValue: Math.round((otherExistingPostRoundPct / 100) * postMoneyValuation),
      colorClass: 'bg-amber-500',
    });
  }

  // 6. Multi-Round Forward Dilution Waterfall (Current -> Series A -> Series B)
  const forwardRounds = [
    {
      roundName: 'Current Round',
      preMoney: preMoneyValuation,
      raised: investmentAmount,
      postMoney: postMoneyValuation,
      founderPct: founderPostRoundPct,
      founderValue: founderPostRoundValue,
      investorPct: investorPostRoundPct,
      esopPct: esopPostRoundPct,
    },
    {
      roundName: 'Series A (Simulated)',
      preMoney: postMoneyValuation * 3,
      raised: postMoneyValuation * 0.75,
      postMoney: postMoneyValuation * 3.75,
      founderPct: Math.round(founderPostRoundPct * 0.75 * 100) / 100, // 20% round dilution + 5% pool top-up
      founderValue: Math.round(postMoneyValuation * 3.75 * (founderPostRoundPct * 0.75 / 100)),
      investorPct: 20,
      esopPct: Math.round(esopPostRoundPct * 0.8 + 5),
    },
    {
      roundName: 'Series B (Simulated)',
      preMoney: postMoneyValuation * 10,
      raised: postMoneyValuation * 2.5,
      postMoney: postMoneyValuation * 12.5,
      founderPct: Math.round(founderPostRoundPct * 0.75 * 0.78 * 100) / 100, // 18% round dilution + 4% pool top-up
      founderValue: Math.round(postMoneyValuation * 12.5 * (founderPostRoundPct * 0.75 * 0.78 / 100)),
      investorPct: 20,
      esopPct: Math.round(esopPostRoundPct * 0.7 + 7),
    },
  ];

  // 7. Dilution Health Classification
  let healthVerdict = 'OPTIMAL';
  let healthTitle = 'Founder-Friendly Clean Cap Table (Dilution < 25%)';
  let healthColor = 'text-semantic-success';

  if (founderDilutionPct > 35) {
    healthVerdict = 'HEAVY_DILUTION';
    healthTitle = 'Heavy Dilution Risk (Founder Dilution > 35%)';
    healthColor = 'text-rose-600';
  } else if (founderDilutionPct > 25) {
    healthVerdict = 'MODERATE';
    healthTitle = 'Standard Venture Dilution (25% - 35% Round Drag)';
    healthColor = 'text-amber-600';
  }

  // 8. Smart Strategic Recommendations
  const recommendations = [
    {
      rank: 1,
      title: esopPoolTiming === 'pre_money' ? 'Option Pool Shuffle Impact' : 'Pro-Rata ESOP Protection',
      savings: Math.round(postMoneyValuation * (esopExpansionPct / 100) * (rawInvestorPct / 100)),
      action: esopPoolTiming === 'pre_money'
        ? `Under the Pre-Money Option Pool Shuffle, the ${targetEsopPoolPct}% ESOP pool is carved entirely out of the founders' pre-money equity, increasing your effective round dilution to ${founderDilutionPct}%. Negotiate an unallocated pool right-sized to your 18-month hiring plan (e.g. 5-7%) rather than a flat 10-15%.`
        : `Under Post-Money ESOP structuring, incoming investors share pro-rata in the option pool expansion, preserving founder equity.`,
    },
    {
      rank: 2,
      title: 'Founder Value Multiplication',
      savings: Math.max(0, founderNetValueAdded),
      action: `While your percentage ownership decreases from ${founderInitialOwnershipPct}% to ${founderPostRoundPct}%, the value of your stake increases from ${currencySymbol}${founderPreRoundValue.toLocaleString()} to ${currencySymbol}${founderPostRoundValue.toLocaleString()} (+${currencySymbol}${Math.max(0, founderNetValueAdded).toLocaleString()} net wealth creation).`,
    },
    {
      rank: 3,
      title: 'Multi-Round Cap Table Runway',
      savings: 0,
      action: `Following simulated Series A and Series B rounds, your projected ownership will be approximately ${forwardRounds[2].founderPct}% with a projected equity value of ${currencySymbol}${forwardRounds[2].founderValue.toLocaleString()}.`,
    },
  ];

  // 9. Hero Verdict
  const heroText = `Founders retain ${founderPostRoundPct}% equity (diluted by ${founderDilutionPct}%), while your stake value grows to ${currencySymbol}${founderPostRoundValue.toLocaleString()} on a ${currencySymbol}${postMoneyValuation.toLocaleString()} Post-Money Valuation.`;

  return {
    primaryOutput: founderPostRoundPct,
    preMoneyValuation,
    investmentAmount,
    postMoneyValuation,
    founderInitialOwnershipPct,
    founderPostRoundPct,
    founderDilutionPct,
    investorPostRoundPct,
    esopPostRoundPct,
    targetEsopPoolPct,
    existingEsopPoolPct,
    esopExpansionPct,
    esopPoolTiming,
    otherExistingInitialPct,
    otherExistingPostRoundPct,
    existingShares,
    totalPostRoundShares,
    newSharesIssued,
    esopSharesIssued,
    sharePrice: Math.round(sharePrice * 100) / 100,
    founderPreRoundValue,
    founderPostRoundValue,
    founderNetValueAdded,
    founderValueMultiple,
    capTable,
    forwardRounds,
    healthVerdict,
    healthTitle,
    healthColor,
    recommendations,
    heroText,
    currencySymbol,
  };
}

export const calculateEquityDilutionTool = calculateEquityDilutionCalculator;
