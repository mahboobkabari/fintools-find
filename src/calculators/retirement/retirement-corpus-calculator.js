/**
 * Institutional Retirement Corpus & Planning Decision Engine
 *
 * Computes inflation-adjusted future living expenses, required nest egg corpus, projected savings growth,
 * exact corpus gap, required monthly SIP, 4-category Retirement Health Subscores, longevity exhaustion age,
 * and ranked highest-impact financial actions.
 *
 * @param {Object} inputs
 * @param {number} [inputs.currentAge=30] - Current age in years
 * @param {number} [inputs.retirementAge=60] - Expected retirement age in years
 * @param {number} [inputs.lifeExpectancy=85] - Life expectancy in years
 * @param {number} [inputs.monthlyExpenses=50000] - Current monthly living expenses in Rupees (₹)
 * @param {number} [inputs.currentSavings=500000] - Existing retirement nest egg accumulated
 * @param {number} [inputs.monthlySip=10000] - Ongoing monthly SIP investment
 * @param {number} [inputs.inflationRate=6] - Expected annual inflation rate (%)
 * @param {number} [inputs.preRetirementReturn=12] - Expected annual return before retirement (%)
 * @param {number} [inputs.postRetirementReturn=8] - Expected annual return after retirement (%)
 */
export function calculateRetirementCorpusCalculator(inputs = {}) {
  const currentAge = Math.max(18, Number(inputs.currentAge ?? 30));
  const retirementAge = Math.max(currentAge + 1, Number(inputs.retirementAge ?? 60));
  const lifeExpectancy = Math.max(retirementAge + 1, Number(inputs.lifeExpectancy ?? 85));
  const monthlyExpenses = Math.max(0, Number(inputs.monthlyExpenses ?? 50000));
  const currentSavings = Math.max(0, Number(inputs.currentSavings ?? 500000));
  const monthlySip = Math.max(0, Number(inputs.monthlySip ?? 10000));
  const inflationRate = Math.max(0, Number(inputs.inflationRate ?? 6));
  const preRetirementReturn = Math.max(0, Number(inputs.preRetirementReturn ?? 12));
  const postRetirementReturn = Math.max(0, Number(inputs.postRetirementReturn ?? 8));

  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;
  const monthsAccum = yearsToRetirement * 12;

  // 1. Inflation-adjusted monthly expenses at retirement
  const futureMonthlyExpense = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
  const futureAnnualExpense = futureMonthlyExpense * 12;

  // Real annual rate of return post-retirement
  const realPostReturn = (1 + postRetirementReturn / 100) / (1 + inflationRate / 100) - 1;

  // 2. Required Nest Egg Corpus at Retirement
  let requiredCorpus = 0;
  if (Math.abs(realPostReturn) < 0.0001) {
    requiredCorpus = futureAnnualExpense * yearsInRetirement;
  } else {
    requiredCorpus =
      futureAnnualExpense *
      ((1 - Math.pow(1 + realPostReturn, -yearsInRetirement)) / realPostReturn);
  }

  // 3. Projected Corpus from Existing Savings & Ongoing Monthly SIP
  const iPreMonthly = Math.pow(1 + preRetirementReturn / 100, 1 / 12) - 1;
  
  // Future Value of Existing Lump Sum
  const fvExistingSavings = currentSavings * Math.pow(1 + preRetirementReturn / 100, yearsToRetirement);
  
  // Future Value of Ongoing Monthly SIP
  let fvOngoingSip = 0;
  if (iPreMonthly > 0 && monthsAccum > 0) {
    fvOngoingSip = monthlySip * ((Math.pow(1 + iPreMonthly, monthsAccum) - 1) / iPreMonthly) * (1 + iPreMonthly);
  } else {
    fvOngoingSip = monthlySip * monthsAccum;
  }

  const projectedCorpus = fvExistingSavings + fvOngoingSip;
  const corpusGap = Math.max(0, requiredCorpus - projectedCorpus);

  // 4. Total & Additional Monthly SIP Required to Bridge Gap
  let totalRequiredMonthlySip = 0;
  if (iPreMonthly > 0 && monthsAccum > 0) {
    totalRequiredMonthlySip =
      (requiredCorpus * iPreMonthly) / ((Math.pow(1 + iPreMonthly, monthsAccum) - 1) * (1 + iPreMonthly));
  } else if (monthsAccum > 0) {
    totalRequiredMonthlySip = requiredCorpus / monthsAccum;
  }

  let additionalMonthlySipNeeded = 0;
  if (iPreMonthly > 0 && monthsAccum > 0 && corpusGap > 0) {
    additionalMonthlySipNeeded =
      (corpusGap * iPreMonthly) / ((Math.pow(1 + iPreMonthly, monthsAccum) - 1) * (1 + iPreMonthly));
  } else if (monthsAccum > 0 && corpusGap > 0) {
    additionalMonthlySipNeeded = corpusGap / monthsAccum;
  }

  // 5. RETIREMENT READINESS SCORE (0-100) & HEALTH CATEGORIES
  const readinessPct = requiredCorpus > 0 ? Math.min(100, Math.round((projectedCorpus / requiredCorpus) * 100)) : 100;

  let readinessStatus = {
    level: 'Excellent',
    color: '#10B981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-600',
    badge: 'Fully On Track',
    desc: 'Your projected retirement corpus fully meets or exceeds your inflation-adjusted nest egg goal.',
  };

  if (readinessPct < 50) {
    readinessStatus = {
      level: 'Critical Gap',
      color: '#EF4444',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-600',
      badge: 'Critical Shortfall',
      desc: 'Your current savings and SIP cover less than 50% of your required retirement corpus.',
    };
  } else if (readinessPct < 85) {
    readinessStatus = {
      level: 'Needs Improvement',
      color: '#F59E0B',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-600',
      badge: 'Moderate Shortfall',
      desc: 'You are close, but an extra monthly investment is needed to ensure 100% retirement security.',
    };
  } else if (readinessPct < 99) {
    readinessStatus = {
      level: 'Good Progress',
      color: '#3B82F6',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-600',
      badge: 'Near Target',
      desc: 'You are within 15% of your target corpus. Minor step-up investments will close the gap.',
    };
  }

  // 4-Category Health Subscores (Rating out of 5 stars)
  const savingsProgressStars = Math.min(5, Math.max(1, Math.round((readinessPct / 100) * 5)));
  const inflationProtectionStars = preRetirementReturn > inflationRate + 4 ? 5 : preRetirementReturn > inflationRate ? 3 : 1;
  const withdrawalSafetyStars = postRetirementReturn >= inflationRate + 2 ? 5 : postRetirementReturn >= inflationRate ? 3 : 2;
  const investmentDisciplineStars = monthlySip >= monthlyExpenses * 0.2 ? 5 : monthlySip >= monthlyExpenses * 0.1 ? 3 : 2;

  // 6. RETIREMENT CONFIDENCE BANNER (Hero Output)
  let heroTitle = '';
  let heroSubtitle = '';
  if (readinessPct >= 99) {
    heroTitle = '🟢 You are fully on track for a comfortable retirement!';
    heroSubtitle = `Your projected savings of ₹${formatCorpusString(projectedCorpus)} at age ${retirementAge} will sustain your monthly living expenses throughout life expectancy (${lifeExpectancy} yrs).`;
  } else if (readinessPct >= 70) {
    heroTitle = `🟡 You are close, but increasing your monthly SIP by ₹${Math.round(additionalMonthlySipNeeded).toLocaleString('en-IN')}/mo will close the gap.`;
    heroSubtitle = `Projected corpus is ₹${formatCorpusString(projectedCorpus)} vs required target of ₹${formatCorpusString(requiredCorpus)} (Shortfall of ₹${formatCorpusString(corpusGap)}).`;
  } else {
    heroTitle = `🔴 Your current savings are unlikely to sustain full retirement at age ${retirementAge}.`;
    heroSubtitle = `Corpus gap is ₹${formatCorpusString(corpusGap)}. Increasing monthly SIP by ₹${Math.round(additionalMonthlySipNeeded).toLocaleString('en-IN')} or delaying retirement by 2-3 years bridges the deficit.`;
  }

  // 7. LONGEVITY ANALYSIS & CORPUS EXHAUSTION AGE
  // Estimate how many years projectedCorpus lasts at futureAnnualExpense
  let corpusSurvivalYears = 0;
  if (projectedCorpus > 0) {
    let balance = projectedCorpus;
    let currentAnnualExp = futureAnnualExpense;
    while (balance > 0 && corpusSurvivalYears < 60) {
      balance = balance * (1 + postRetirementReturn / 100) - currentAnnualExp;
      currentAnnualExp *= (1 + inflationRate / 100);
      if (balance > 0) corpusSurvivalYears++;
    }
  }

  const exhaustionAge = retirementAge + corpusSurvivalYears;
  const isExhaustedEarly = exhaustionAge < lifeExpectancy;

  // 8. RETIREMENT DELAY SIMULATOR (Retire at 55, 58, 60, 65)
  const delayOptions = [55, 58, 60, 65].map((targetAge) => {
    if (targetAge <= currentAge) return null;
    const yToRet = targetAge - currentAge;
    const yInRet = lifeExpectancy - targetAge;
    const futExp = monthlyExpenses * Math.pow(1 + inflationRate / 100, yToRet) * 12;
    
    let reqCorp = 0;
    if (Math.abs(realPostReturn) < 0.0001) {
      reqCorp = futExp * yInRet;
    } else {
      reqCorp = futExp * ((1 - Math.pow(1 + realPostReturn, -yInRet)) / realPostReturn);
    }

    const fvExist = currentSavings * Math.pow(1 + preRetirementReturn / 100, yToRet);
    const mAcc = yToRet * 12;
    let fvSip = 0;
    if (iPreMonthly > 0 && mAcc > 0) {
      fvSip = monthlySip * ((Math.pow(1 + iPreMonthly, mAcc) - 1) / iPreMonthly) * (1 + iPreMonthly);
    } else {
      fvSip = monthlySip * mAcc;
    }
    const projCorp = fvExist + fvSip;
    const gap = Math.max(0, reqCorp - projCorp);

    let reqSip = 0;
    if (iPreMonthly > 0 && mAcc > 0) {
      reqSip = (reqCorp * iPreMonthly) / ((Math.pow(1 + iPreMonthly, mAcc) - 1) * (1 + iPreMonthly));
    }

    return {
      retireAge: targetAge,
      yearsToRet: yToRet,
      requiredCorpus: Math.round(reqCorp),
      projectedCorpus: Math.round(projCorp),
      corpusGap: Math.round(gap),
      requiredMonthlySip: Math.round(reqSip),
      isWinner: targetAge === retirementAge,
    };
  }).filter(Boolean);

  // 9. HIGHEST-IMPACT ACTIONABLE RECOMMENDATIONS (Ranked by Financial Rupee Impact)
  const opportunities = [];

  // Action 1: Increase monthly SIP
  if (additionalMonthlySipNeeded > 0) {
    const sipIncreaseVal = Math.round(additionalMonthlySipNeeded);
    opportunities.push({
      id: 'increase-sip',
      rank: 1,
      title: `Increase Monthly SIP by ₹${sipIncreaseVal.toLocaleString('en-IN')}`,
      impactText: `Corpus grows by ₹${formatCorpusString(corpusGap)} to reach 100% target`,
      description: `Bridge the ₹${formatCorpusString(corpusGap)} shortfall by stepping up your monthly investment today.`,
    });
  }

  // Action 2: Delay Retirement by 2 Years
  if (retirementAge < 65) {
    const delayedAge = retirementAge + 2;
    const yToRet = delayedAge - currentAge;
    const fvExist = currentSavings * Math.pow(1 + preRetirementReturn / 100, yToRet);
    const mAcc = yToRet * 12;
    let fvSip = 0;
    if (iPreMonthly > 0 && mAcc > 0) {
      fvSip = monthlySip * ((Math.pow(1 + iPreMonthly, mAcc) - 1) / iPreMonthly) * (1 + iPreMonthly);
    }
    const projCorpDelayed = fvExist + fvSip;
    const corpusGain = Math.max(0, projCorpDelayed - projectedCorpus);

    opportunities.push({
      id: 'delay-retirement',
      rank: 2,
      title: `Delay Retirement by 2 Years (Age ${delayedAge})`,
      impactText: `Corpus target reduces & wealth grows by +₹${formatCorpusString(corpusGain)}`,
      description: `Extending your career by just 2 years gives compounding more time to work while shortening retirement duration.`,
    });
  }

  // Action 3: Optimize Asset Allocation (+1.5% Return)
  const higherReturn = preRetirementReturn + 1.5;
  const fvExistHigh = currentSavings * Math.pow(1 + higherReturn / 100, yearsToRetirement);
  const iHigh = Math.pow(1 + higherReturn / 100, 1 / 12) - 1;
  let fvSipHigh = 0;
  if (iHigh > 0 && monthsAccum > 0) {
    fvSipHigh = monthlySip * ((Math.pow(1 + iHigh, monthsAccum) - 1) / iHigh) * (1 + iHigh);
  }
  const projHighReturn = fvExistHigh + fvSipHigh;
  const returnGain = Math.max(0, projHighReturn - projectedCorpus);

  opportunities.push({
    id: 'boost-return',
    rank: 3,
    title: `Increase Investment Return by 1.5% (to ${higherReturn}%)`,
    impactText: `Adds ₹${formatCorpusString(returnGain)} to final corpus without extra savings`,
    description: `Rebalance portfolio toward diversified equity index/flexi-cap mutual funds to capture higher annual returns.`,
  });

  // 10. STRUCTURED INSIGHTS ARRAY FOR UI
  const insights = [
    {
      id: 'inflation-story',
      label: 'Inflation Purchasing Power Erosion',
      value: `₹${Math.round(futureMonthlyExpense).toLocaleString('en-IN')}/mo`,
      labelColor: 'text-accent-amber',
      desc: `Your current monthly expenses of ₹${monthlyExpenses.toLocaleString('en-IN')} will inflate to ₹${Math.round(futureMonthlyExpense).toLocaleString('en-IN')}/month in ${yearsToRetirement} years at ${inflationRate}% annual inflation.`,
    },
    {
      id: 'longevity-surv',
      label: 'Corpus Longevity Estimate',
      value: isExhaustedEarly ? `Exhausts at Age ${exhaustionAge}` : `${corpusSurvivalYears}+ Years`,
      labelColor: isExhaustedEarly ? 'text-semantic-warning' : 'text-semantic-success',
      valueColor: isExhaustedEarly ? 'text-semantic-warning' : 'text-semantic-success',
      desc: isExhaustedEarly
        ? `Warning: At current savings rate, your corpus will run out at age ${exhaustionAge} (${lifeExpectancy - exhaustionAge} years before life expectancy).`
        : `Your projected corpus will comfortably sustain monthly expenses past your life expectancy of ${lifeExpectancy} years.`,
    },
    {
      id: 'sip-gap',
      label: 'Monthly SIP Gap',
      value: `₹${Math.round(totalRequiredMonthlySip).toLocaleString('en-IN')}/mo`,
      labelColor: 'text-primary',
      desc: `Total monthly investment required from today is ₹${Math.round(totalRequiredMonthlySip).toLocaleString('en-IN')}/mo (Current SIP: ₹${monthlySip.toLocaleString('en-IN')}/mo).`,
    },
  ];

  return {
    // Legacy properties for backward compatibility
    primaryOutput: Math.round(requiredCorpus),
    yearsToRetirement,
    yearsInRetirement,
    futureMonthlyExpense: Math.round(futureMonthlyExpense),
    futureAnnualExpense: Math.round(futureAnnualExpense),
    realPostReturn: Number((realPostReturn * 100).toFixed(2)),
    requiredCorpus: Math.round(requiredCorpus),
    requiredMonthlySip: Math.round(totalRequiredMonthlySip),

    // Institutional Flagship Properties
    currentSavings,
    monthlySip,
    projectedCorpus: Math.round(projectedCorpus),
    corpusGap: Math.round(corpusGap),
    additionalMonthlySipNeeded: Math.round(additionalMonthlySipNeeded),
    readinessScore: readinessPct,
    readinessStatus,
    heroBanner: {
      heroTitle,
      heroSubtitle,
      levelColor: readinessStatus.color,
    },
    healthSubscores: {
      savingsProgressStars,
      inflationProtectionStars,
      withdrawalSafetyStars,
      investmentDisciplineStars,
    },
    longevity: {
      corpusSurvivalYears,
      exhaustionAge,
      isExhaustedEarly,
      yearsShortfall: isExhaustedEarly ? Math.max(0, lifeExpectancy - exhaustionAge) : 0,
    },
    delayOptions,
    opportunities,
    insights,
  };
}

/**
 * Helper: Format Indian Rupee Corpus String (e.g. ₹6.45 Crores or ₹85 Lakhs)
 */
function formatCorpusString(val) {
  const num = Math.round(val);
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} Lakhs`;
  }
  return num.toLocaleString('en-IN');
}