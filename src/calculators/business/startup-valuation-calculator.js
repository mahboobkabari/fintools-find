/**
 * Flagship Startup Valuation Intelligence Engine (Math Engine V2)
 * Supports Multi-Method Startup Valuation Synthesis:
 * 1. Scorecard Valuation Method (Bill Payne Method - Angel/Seed Standard)
 * 2. Berkus Method (Dave Berkus Pre-Revenue 5-Milestone Framework)
 * 3. Venture Capital (VC) Exit Method (Terminal Value / ROI Hurdle Rate / Dilution)
 * 4. Revenue / ARR Multiple Method (Current Revenue x Sector Multiple)
 * 5. Blended Synthesis Valuation (Weighted Average Range) & Dilution Analysis.
 * 
 * @param {Object} inputs
 * @param {string} [inputs.primaryMethod='scorecard'] - 'scorecard' | 'berkus' | 'vc_method' | 'arr_multiple' | 'blended'
 * @param {number} [inputs.basePreMoneyValuation=20000000] - Baseline Regional Pre-Money Valuation (e.g. ₹2 Crores)
 * @param {number} [inputs.investmentAsk=5000000] - Capital raising target in current round (e.g. ₹50 Lakhs)
 * @param {number} [inputs.annualRevenue=12000000] - Current Annual Recurring Revenue / Sales (e.g. ₹1.2 Cr)
 * @param {number} [inputs.arrMultiple=8] - Sector Revenue Multiple (e.g. 6x - 12x)
 * @param {number} [inputs.teamScore=110] - Management Team Score % (0-200%, Weight 30%)
 * @param {number} [inputs.marketSizeScore=115] - Market Opportunity Size % (0-200%, Weight 25%)
 * @param {number} [inputs.productScore=105] - Product / Technology Stage % (0-200%, Weight 15%)
 * @param {number} [inputs.competitionScore=100] - Competitive Environment % (0-200%, Weight 10%)
 * @param {number} [inputs.partnershipsScore=100] - Sales Channels / Partnerships % (0-200%, Weight 10%)
 * @param {number} [inputs.capitalNeedScore=100] - Need for Additional Capital % (0-200%, Weight 5%)
 * @param {number} [inputs.regulatoryScore=100] - Other / Regulatory Barriers % (0-200%, Weight 5%)
 * @param {number} [inputs.berkusSoundIdea=5000000] - Berkus Sound Idea value (0 - 5M)
 * @param {number} [inputs.berkusPrototype=5000000] - Berkus Prototype / Tech risk reduction (0 - 5M)
 * @param {number} [inputs.berkusQualityTeam=5000000] - Berkus Quality Management Team (0 - 5M)
 * @param {number} [inputs.berkusStrategicAlliances=4000000] - Berkus Strategic Partnerships (0 - 5M)
 * @param {number} [inputs.berkusProductRollout=3000000] - Berkus Commercial Traction / Sales (0 - 5M)
 * @param {number} [inputs.exitYearRevenue=100000000] - Projected Revenue at Exit Year (e.g. Year 5)
 * @param {number} [inputs.exitMultiple=6] - Expected Exit Valuation Multiple
 * @param {number} [inputs.targetRoiMultiple=10] - Investor Target ROI Hurdle (e.g. 10x)
 * @param {number} [inputs.futureDilutionPct=25] - Anticipated Future Dilution before exit %
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const DEFAULT_STARTUP_VALUATION_INPUTS = {
  primaryMethod: 'scorecard',
  basePreMoneyValuation: 20000000,
  investmentAsk: 5000000,
  annualRevenue: 12000000,
  arrMultiple: 8,
  teamScore: 110,
  marketSizeScore: 115,
  productScore: 105,
  competitionScore: 100,
  partnershipsScore: 100,
  capitalNeedScore: 100,
  regulatoryScore: 100,
  berkusSoundIdea: 5000000,
  berkusPrototype: 5000000,
  berkusQualityTeam: 5000000,
  berkusStrategicAlliances: 4000000,
  berkusProductRollout: 3000000,
  exitYearRevenue: 100000000,
  exitMultiple: 6,
  targetRoiMultiple: 10,
  futureDilutionPct: 25,
  currencySymbol: '₹',
};

export const SCORECARD_WEIGHTS = {
  team: 0.30,
  marketSize: 0.25,
  product: 0.15,
  competition: 0.10,
  partnerships: 0.10,
  capitalNeed: 0.05,
  regulatory: 0.05,
};

export function calculateStartupValuationCalculator(inputs = {}) {
  const merged = { ...DEFAULT_STARTUP_VALUATION_INPUTS, ...inputs };

  // 1. Input Sanitization & Clamping
  const rawBase = Number(merged.basePreMoneyValuation);
  const basePreMoneyValuation = isNaN(rawBase) ? 20000000 : Math.max(10000, rawBase);

  const rawAsk = Number(merged.investmentAsk);
  const investmentAsk = isNaN(rawAsk) ? 5000000 : Math.max(0, rawAsk);

  const rawRev = Number(merged.annualRevenue);
  const annualRevenue = isNaN(rawRev) ? 12000000 : Math.max(0, rawRev);

  const rawArrMult = Number(merged.arrMultiple);
  const arrMultiple = isNaN(rawArrMult) ? 8 : Math.max(1, Math.min(100, rawArrMult));

  const clampScore = (v, def) => {
    const num = Number(v);
    return isNaN(num) ? def : Math.max(0, Math.min(200, num));
  };

  const teamScore = clampScore(merged.teamScore, 110);
  const marketSizeScore = clampScore(merged.marketSizeScore, 115);
  const productScore = clampScore(merged.productScore, 105);
  const competitionScore = clampScore(merged.competitionScore, 100);
  const partnershipsScore = clampScore(merged.partnershipsScore, 100);
  const capitalNeedScore = clampScore(merged.capitalNeedScore, 100);
  const regulatoryScore = clampScore(merged.regulatoryScore, 100);

  const clampBerkus = (v, def) => {
    const num = Number(v);
    return isNaN(num) ? def : Math.max(0, num);
  };

  const berkusSoundIdea = clampBerkus(merged.berkusSoundIdea, 5000000);
  const berkusPrototype = clampBerkus(merged.berkusPrototype, 5000000);
  const berkusQualityTeam = clampBerkus(merged.berkusQualityTeam, 5000000);
  const berkusStrategicAlliances = clampBerkus(merged.berkusStrategicAlliances, 4000000);
  const berkusProductRollout = clampBerkus(merged.berkusProductRollout, 3000000);

  const rawExitRev = Number(merged.exitYearRevenue);
  const exitYearRevenue = isNaN(rawExitRev) ? 100000000 : Math.max(0, rawExitRev);

  const rawExitMult = Number(merged.exitMultiple);
  const exitMultiple = isNaN(rawExitMult) ? 6 : Math.max(1, Math.min(50, rawExitMult));

  const rawRoi = Number(merged.targetRoiMultiple);
  const targetRoiMultiple = isNaN(rawRoi) || rawRoi <= 0 ? 0 : Math.min(100, rawRoi);

  const rawDilution = Number(merged.futureDilutionPct);
  const futureDilutionPct = isNaN(rawDilution) ? 25 : Math.max(0, Math.min(90, rawDilution));

  const currencySymbol = merged.currencySymbol || '₹';

  // 2. Method 1: Scorecard Valuation Method (Bill Payne)
  const weightedScoreFactor = (
    (teamScore / 100) * SCORECARD_WEIGHTS.team +
    (marketSizeScore / 100) * SCORECARD_WEIGHTS.marketSize +
    (productScore / 100) * SCORECARD_WEIGHTS.product +
    (competitionScore / 100) * SCORECARD_WEIGHTS.competition +
    (partnershipsScore / 100) * SCORECARD_WEIGHTS.partnerships +
    (capitalNeedScore / 100) * SCORECARD_WEIGHTS.capitalNeed +
    (regulatoryScore / 100) * SCORECARD_WEIGHTS.regulatory
  );
  const scorecardValuation = Math.round(basePreMoneyValuation * weightedScoreFactor);

  // 3. Method 2: Berkus Method (Dave Berkus)
  const berkusValuation = (
    berkusSoundIdea +
    berkusPrototype +
    berkusQualityTeam +
    berkusStrategicAlliances +
    berkusProductRollout
  );

  // 4. Method 3: Venture Capital (VC) Exit Method
  // Terminal Exit Value = Exit Year Revenue * Exit Multiple
  const terminalExitValue = exitYearRevenue * exitMultiple;
  // Dilution retention factor = (1 - futureDilutionPct / 100)
  const retentionFactor = Math.max(0.05, 1 - futureDilutionPct / 100);
  // Post-Money Valuation = (Terminal Exit Value * Retention Factor) / Target ROI Multiple
  const vcPostMoneyValuation = targetRoiMultiple > 0
    ? Math.round((terminalExitValue * retentionFactor) / targetRoiMultiple)
    : 0;
  const vcPreMoneyValuation = Math.max(0, vcPostMoneyValuation - investmentAsk);

  // 5. Method 4: ARR / Revenue Multiple Method
  const arrMultipleValuation = Math.round(annualRevenue * arrMultiple);

  // 6. Blended Synthesis Valuation (Weighted Average)
  // Give equal 25% weight to each active realistic method
  const activeMethods = [];
  if (scorecardValuation > 0) activeMethods.push({ name: 'Scorecard Method', value: scorecardValuation });
  if (berkusValuation > 0) activeMethods.push({ name: 'Berkus Method', value: berkusValuation });
  if (vcPreMoneyValuation > 0) activeMethods.push({ name: 'VC Exit Method', value: vcPreMoneyValuation });
  if (arrMultipleValuation > 0) activeMethods.push({ name: 'ARR Multiple', value: arrMultipleValuation });

  const totalActiveSum = activeMethods.reduce((sum, m) => sum + m.value, 0);
  const blendedValuation = activeMethods.length > 0 ? Math.round(totalActiveSum / activeMethods.length) : basePreMoneyValuation;

  // Valuation Range (Min, Median/Blended, Max)
  const methodValues = [scorecardValuation, berkusValuation, vcPreMoneyValuation, arrMultipleValuation].filter(v => v > 0);
  const valuationMin = methodValues.length > 0 ? Math.min(...methodValues) : basePreMoneyValuation * 0.8;
  const valuationMax = methodValues.length > 0 ? Math.max(...methodValues) : basePreMoneyValuation * 1.2;

  // Selected Primary Pre-Money Valuation
  let selectedPreMoney = blendedValuation;
  if (merged.primaryMethod === 'scorecard') selectedPreMoney = scorecardValuation;
  else if (merged.primaryMethod === 'berkus') selectedPreMoney = berkusValuation;
  else if (merged.primaryMethod === 'vc_method') selectedPreMoney = vcPreMoneyValuation;
  else if (merged.primaryMethod === 'arr_multiple') selectedPreMoney = arrMultipleValuation;

  // 7. Investment & Post-Money Dilution Analysis
  const postMoneyValuation = selectedPreMoney + investmentAsk;
  const investorEquityPct = postMoneyValuation > 0
    ? Math.round((investmentAsk / postMoneyValuation) * 1000) / 10
    : 0;
  const founderRetainedPct = Math.round((100 - investorEquityPct) * 10) / 10;

  // 8. Valuation Synthesis Comparison Items
  const valuationMethodsList = [
    { method: 'Scorecard Method (Payne)', value: scorecardValuation, desc: `${Math.round(weightedScoreFactor * 100)}% of regional base`, colorClass: 'bg-primary' },
    { method: 'Berkus Method (5 Milestones)', value: berkusValuation, desc: 'Pre-revenue risk reduction', colorClass: 'bg-emerald-500' },
    { method: 'VC Exit Method', value: vcPreMoneyValuation, desc: `${targetRoiMultiple}x target ROI hurdle`, colorClass: 'bg-indigo-500' },
    { method: 'ARR Multiple Method', value: arrMultipleValuation, desc: `${arrMultiple}x Annual Revenue`, colorClass: 'bg-amber-500' },
  ];

  // 9. Health & Stage Verdict
  let healthVerdict = 'HEALTHY';
  let healthTitle = 'Balanced Institutional Valuation (15% - 25% Dilution)';
  let healthColor = 'text-semantic-success';

  if (investorEquityPct > 30) {
    healthVerdict = 'HEAVY_DILUTION';
    healthTitle = 'Heavy Dilution Warning (Investor Stake > 30%)';
    healthColor = 'text-rose-600';
  } else if (investorEquityPct < 10 && investmentAsk > 0) {
    healthVerdict = 'AGGRESSIVE';
    healthTitle = 'Aggressive Founder-Favorable Valuation (Dilution < 10%)';
    healthColor = 'text-indigo-600';
  }

  // 10. Strategic Recommendations
  const recommendations = [
    {
      rank: 1,
      title: 'Methodology Triangulation for Term Sheets',
      savings: Math.round(valuationMax - valuationMin),
      action: `Your startup valuation spans from ${currencySymbol}${valuationMin.toLocaleString()} to ${currencySymbol}${valuationMax.toLocaleString()} (Blended Synthesis: ${currencySymbol}${blendedValuation.toLocaleString()}). Anchor angel conversations around the Scorecard Method (${currencySymbol}${scorecardValuation.toLocaleString()}) and institutional VC negotiations around the VC Exit Method (${currencySymbol}${vcPreMoneyValuation.toLocaleString()}).`,
    },
    {
      rank: 2,
      title: 'Capital Ask & Dilution Right-Sizing',
      savings: investmentAsk,
      action: `Raising ${currencySymbol}${investmentAsk.toLocaleString()} at a ${currencySymbol}${selectedPreMoney.toLocaleString()} Pre-Money Valuation dilutes founders by ${investorEquityPct}%, leaving founders with ${founderRetainedPct}% ownership post-round.`,
    },
    {
      rank: 3,
      title: 'Scorecard Factor Optimization',
      savings: Math.round(basePreMoneyValuation * 0.15),
      action: `Management team strength (30% weight: ${teamScore}%) and addressable market size (25% weight: ${marketSizeScore}%) drive 55% of your Scorecard valuation. Adding a veteran technical co-founder or advisor can boost your pre-money valuation by 10-20%.`,
    },
  ];

  // 11. Hero Verdict
  const heroText = `Estimated Pre-Money Valuation is ${currencySymbol}${selectedPreMoney.toLocaleString()} (Blended Synthesis: ${currencySymbol}${blendedValuation.toLocaleString()}), resulting in a ${currencySymbol}${postMoneyValuation.toLocaleString()} Post-Money Valuation with ${investorEquityPct}% investor dilution.`;

  return {
    primaryOutput: selectedPreMoney,
    selectedPreMoney,
    postMoneyValuation,
    blendedValuation,
    scorecardValuation,
    berkusValuation,
    vcPreMoneyValuation,
    vcPostMoneyValuation,
    arrMultipleValuation,
    valuationMin,
    valuationMax,
    weightedScoreFactor: Math.round(weightedScoreFactor * 1000) / 1000,
    terminalExitValue,
    investorEquityPct,
    founderRetainedPct,
    basePreMoneyValuation,
    investmentAsk,
    annualRevenue,
    arrMultiple,
    teamScore,
    marketSizeScore,
    productScore,
    competitionScore,
    partnershipsScore,
    capitalNeedScore,
    regulatoryScore,
    berkusSoundIdea,
    berkusPrototype,
    berkusQualityTeam,
    berkusStrategicAlliances,
    berkusProductRollout,
    exitYearRevenue,
    exitMultiple,
    targetRoiMultiple,
    futureDilutionPct,
    valuationMethodsList,
    recommendations,
    healthVerdict,
    healthTitle,
    healthColor,
    heroText,
    currencySymbol,
  };
}

export const calculateStartupValuationTool = calculateStartupValuationCalculator;
