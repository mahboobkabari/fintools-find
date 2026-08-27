/**
 * Flagship Real Estate Stamp Duty & Registration Cost Decision Engine (Math Engine V2)
 * Supports State-wise statutory rate schedules, gender concessions, circle rate verification, and Section 80C tax deduction analysis.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.propertyValue=5000000] - Property Agreement Value or Purchase Consideration (₹)
 * @param {number} [inputs.circleRateValue=0] - Ready Reckoner / Circle Rate Minimum Valuation (₹)
 * @param {string} [inputs.state='maharashtra'] - State code ('maharashtra', 'delhi', 'karnataka', 'tamil_nadu', 'uttar_pradesh', 'west_bengal', 'telangana', 'custom')
 * @param {string} [inputs.gender='male'] - Buyer classification ('male', 'female', 'joint')
 * @param {string} [inputs.location='urban'] - 'urban' (within Municipal Corp) or 'rural'
 * @param {number} [inputs.customStampRate=5] - Custom Stamp Duty % (if state === 'custom')
 * @param {number} [inputs.customRegRate=1] - Custom Registration % (if state === 'custom')
 * @param {number} [inputs.advocateLegalFees=25000] - Legal, notary & documentation fees (₹)
 */

export const STATE_STAMP_SCHEDULES = {
  maharashtra: {
    name: 'Maharashtra',
    maleRate: 5.0,
    femaleRate: 4.0, // 1% concession on residential
    jointRate: 5.0,
    metroCess: 1.0, // 1% Metro / Transport surcharge in Mumbai/Pune/Nagpur/Thane
    registrationRate: 1.0,
    registrationCap: 30000, // Capped at ₹30,000 for properties > ₹30 Lakhs
    hasRegCap: true,
  },
  delhi: {
    name: 'Delhi NCR',
    maleRate: 6.0,
    femaleRate: 4.0, // 2% female concession
    jointRate: 5.0,
    metroCess: 0.0,
    registrationRate: 1.0,
    registrationCap: 0,
    hasRegCap: false,
  },
  karnataka: {
    name: 'Karnataka (Bangalore)',
    maleRate: 5.0,
    femaleRate: 5.0,
    jointRate: 5.0,
    metroCess: 0.6, // 2% surcharge + 3% cess on stamp duty = ~0.6% on consideration
    registrationRate: 1.0,
    registrationCap: 0,
    hasRegCap: false,
  },
  tamil_nadu: {
    name: 'Tamil Nadu (Chennai)',
    maleRate: 7.0,
    femaleRate: 7.0,
    jointRate: 7.0,
    metroCess: 0.0,
    registrationRate: 2.0, // Revised from 4% to 2%
    registrationCap: 0,
    hasRegCap: false,
  },
  uttar_pradesh: {
    name: 'Uttar Pradesh (Noida/Lucknow)',
    maleRate: 7.0,
    femaleRate: 6.0, // 1% rebate for women up to ₹10L
    jointRate: 6.5,
    metroCess: 0.0,
    registrationRate: 1.0,
    registrationCap: 20000,
    hasRegCap: true,
  },
  west_bengal: {
    name: 'West Bengal (Kolkata)',
    maleRate: 6.0, // 6% > ₹1 Cr, 5% <= ₹1 Cr
    femaleRate: 6.0,
    jointRate: 6.0,
    metroCess: 0.0,
    registrationRate: 1.0,
    registrationCap: 0,
    hasRegCap: false,
  },
  telangana: {
    name: 'Telangana (Hyderabad)',
    maleRate: 5.5,
    femaleRate: 5.5,
    jointRate: 5.5,
    metroCess: 1.5, // 1.5% Transfer Duty
    registrationRate: 0.5,
    registrationCap: 0,
    hasRegCap: false,
  },
};

export function calculateStampDutyCalculator(inputs = {}) {
  const {
    propertyValue = 5000000,
    circleRateValue = 0,
    state = 'maharashtra',
    gender = 'male',
    location = 'urban',
    customStampRate = 5,
    customRegRate = 1,
    advocateLegalFees = 25000,
  } = inputs;

  const rawPropVal = Math.max(0, Number(propertyValue) || 0);
  const rawCircleVal = Math.max(0, Number(circleRateValue) || 0);
  const legalFees = Math.max(0, Number(advocateLegalFees) || 0);

  // 1. Taxable Consideration Value (Higher of Agreement Value vs Circle Rate)
  const taxableValue = Math.max(rawPropVal, rawCircleVal);
  const isCircleRateHigher = rawCircleVal > rawPropVal;
  const valuationGap = isCircleRateHigher ? rawCircleVal - rawPropVal : 0;

  // 2. Determine Stamp Duty and Registration Rates
  let baseStampRate = 5.0;
  let metroCessRate = 0.0;
  let regRate = 1.0;
  let regCap = 0;
  let hasRegCap = false;
  let stateName = 'Custom State';

  const stateKey = state.toLowerCase();
  const genderKey = gender.toLowerCase();

  if (stateKey in STATE_STAMP_SCHEDULES) {
    const sched = STATE_STAMP_SCHEDULES[stateKey];
    stateName = sched.name;
    regRate = sched.registrationRate;
    regCap = sched.registrationCap;
    hasRegCap = sched.hasRegCap;

    if (genderKey === 'female') {
      baseStampRate = sched.femaleRate;
    } else if (genderKey === 'joint') {
      baseStampRate = sched.jointRate;
    } else {
      baseStampRate = sched.maleRate;
    }

    if (location === 'urban') {
      metroCessRate = sched.metroCess;
    }
  } else {
    // Custom state
    baseStampRate = Math.max(0, Number(customStampRate) || 0);
    regRate = Math.max(0, Number(customRegRate) || 0);
    stateName = 'Custom Rate';
  }

  const effectiveStampRate = baseStampRate + metroCessRate;

  // 3. Compute Stamp Duty Amount
  const baseStampDuty = Math.round(taxableValue * (baseStampRate / 100));
  const metroCessAmount = Math.round(taxableValue * (metroCessRate / 100));
  const totalStampDuty = baseStampDuty + metroCessAmount;

  // 4. Compute Registration Charges
  let rawRegCharge = Math.round(taxableValue * (regRate / 100));
  let registrationCharges = rawRegCharge;
  if (hasRegCap && regCap > 0 && rawRegCharge > regCap) {
    registrationCharges = regCap;
  }

  // 5. Total Government & Legal Outflows
  const totalGovernmentCharges = totalStampDuty + registrationCharges;
  const totalAcquisitionOverhead = totalGovernmentCharges + legalFees;
  const totalPropertyCost = rawPropVal + totalAcquisitionOverhead;

  // 6. Ratios & Percentages
  const overheadPercentage = rawPropVal > 0
    ? Math.round((totalAcquisitionOverhead / rawPropVal) * 10000) / 100
    : 0;

  const stampDutyPercentage = rawPropVal > 0
    ? Math.round((totalStampDuty / rawPropVal) * 10000) / 100
    : 0;

  // 7. Gender Concession Benefit Analysis (vs Male rate)
  let genderSavings = 0;
  if (stateKey in STATE_STAMP_SCHEDULES) {
    const maleFullRate = STATE_STAMP_SCHEDULES[stateKey].maleRate + metroCessRate;
    const maleStamp = Math.round(taxableValue * (maleFullRate / 100));
    genderSavings = Math.max(0, maleStamp - totalStampDuty);
  }

  // 8. Section 80C Tax Deduction Benefit (Eligible up to ₹1.5 Lakhs under Old Regime)
  const eligible80CDeduction = Math.min(150000, totalGovernmentCharges);
  const taxSavingsAt30Pct = Math.round(eligible80CDeduction * 0.312); // 30% slab + 4% cess

  // 9. Multi-State Scenario Comparison (Maharashtra, Delhi, Karnataka, Tamil Nadu)
  const scenarios = Object.entries(STATE_STAMP_SCHEDULES).map(([k, s]) => {
    const sRate = genderKey === 'female' ? s.femaleRate : genderKey === 'joint' ? s.jointRate : s.maleRate;
    const sMetro = location === 'urban' ? s.metroCess : 0;
    const sTotalStampRate = sRate + sMetro;
    const sStamp = Math.round(taxableValue * (sTotalStampRate / 100));
    let sReg = Math.round(taxableValue * (s.registrationRate / 100));
    if (s.hasRegCap && s.registrationCap > 0 && sReg > s.registrationCap) {
      sReg = s.registrationCap;
    }
    const sTotalGov = sStamp + sReg;
    return {
      stateKey: k,
      stateName: s.name,
      stampRate: sTotalStampRate,
      stampDuty: sStamp,
      registrationCharges: sReg,
      totalGovCharges: sTotalGov,
      diffFromCurrent: sTotalGov - totalGovernmentCharges,
    };
  });

  // 10. Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: genderSavings > 0 ? 'Female Buyer Stamp Duty Concession' : 'Explore Joint Ownership with Female Co-owner',
      savings: genderSavings > 0 ? genderSavings : Math.round(taxableValue * 0.01),
      action: genderSavings > 0
        ? `You saved ₹${genderSavings.toLocaleString('en-IN')} in stamp duty by registering under female/joint ownership in ${stateName}.`
        : `Registering property jointly with a female family member can reduce stamp duty by 1% to 2% in states like Delhi, Maharashtra, and UP.`,
    },
    {
      rank: 2,
      title: 'Claim Section 80C Tax Deduction (Up to ₹1.5 Lakh)',
      savings: taxSavingsAt30Pct,
      action: `You can claim up to ₹${eligible80CDeduction.toLocaleString('en-IN')} under Section 80C in the financial year of purchase, saving up to ₹${taxSavingsAt30Pct.toLocaleString('en-IN')} in income tax (Old Regime).`,
    },
    {
      rank: 3,
      title: isCircleRateHigher ? 'Circle Rate Valuation Warning' : 'Circle Rate Compliance Verified',
      savings: valuationGap,
      action: isCircleRateHigher
        ? `Property agreement value (₹${rawPropVal.toLocaleString('en-IN')}) is lower than circle rate (₹${rawCircleVal.toLocaleString('en-IN')}). Stamp duty must be paid on circle rate, and the ₹${valuationGap.toLocaleString('en-IN')} difference may attract Section 56(2)(x) tax.`
        : `Agreement value meets or exceeds the government circle rate valuation threshold. No penal stamp assessment risk.`,
    },
  ];

  // 11. Hero Decision Verdict Text
  const heroText = `Total Government & Registration charges for your ₹${rawPropVal.toLocaleString('en-IN')} property in ${stateName} are ₹${totalGovernmentCharges.toLocaleString('en-IN')} (${overheadPercentage}% of property value).`;

  return {
    primaryOutput: totalGovernmentCharges,
    propertyValue: rawPropVal,
    circleRateValue: rawCircleVal,
    taxableValue,
    state: stateKey,
    stateName,
    gender: genderKey,
    location,
    baseStampRate,
    metroCessRate,
    effectiveStampRate,
    regRate,
    baseStampDuty,
    metroCessAmount,
    totalStampDuty,
    registrationCharges,
    legalFees,
    totalGovernmentCharges,
    totalAcquisitionOverhead,
    totalPropertyCost,
    overheadPercentage,
    stampDutyPercentage,
    genderSavings,
    eligible80CDeduction,
    taxSavingsAt30Pct,
    isCircleRateHigher,
    valuationGap,
    scenarios,
    recommendations,
    heroText,
  };
}

export const calculateStampDutyTool = calculateStampDutyCalculator;
