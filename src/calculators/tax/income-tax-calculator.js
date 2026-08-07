/**
 * Institutional Income Tax Calculator Engine (FY 2025-26 / AY 2026-27)
 *
 * Computes exact tax liability under New Tax Regime (Budget 2025-26 Slabs) vs Old Tax Regime,
 * calculates Section 87A rebates, 4% Health & Education Cess, Tax Efficiency Score (0-100),
 * marginal tax brackets, and ranked tax optimization opportunities.
 *
 * @param {Object} inputs
 * @param {number} inputs.grossIncome - Annual gross salary / taxable income
 * @param {number} [inputs.sec80c=0] - Section 80C investments (ELSS, PPF, EPF) (Max ₹1.5L)
 * @param {number} [inputs.sec24b=0] - Section 24(b) Home Loan Interest (Max ₹2L)
 * @param {number} [inputs.sec80d=0] - Section 80D Health Insurance Premium (Max ₹75K)
 * @param {number} [inputs.nps80ccd=0] - Section 80CCD(1B) Additional NPS (Max ₹50K)
 * @param {number} [inputs.hraExemption=0] - HRA Exemption claimed under Old Regime
 * @param {number} [inputs.otherDeductions=0] - Other deductions (80E, 80G, LTA, etc.)
 * @param {number} [inputs.standardDeductionNew=75000] - Standard deduction New Regime (₹75,000)
 * @param {number} [inputs.standardDeductionOld=50000] - Standard deduction Old Regime (₹50,000)
 * @param {boolean} [inputs.isRecursive=false] - Prevent recursive stack overflow
 */
export function calculateIncomeTax(inputs = {}) {
  const {
    grossIncome = 1200000,
    sec80c = 0,
    sec24b = 0,
    sec80d = 0,
    nps80ccd = 0,
    hraExemption = 0,
    otherDeductions = 0,
    standardDeductionNew = 75000,
    standardDeductionOld = 50000,
    isRecursive = false,
  } = inputs;

  const gross = Math.max(0, Number(grossIncome) || 0);

  // Capped Deduction Limits under Old Regime
  const capped80C = Math.min(150000, Math.max(0, Number(sec80c) || 0));
  const capped24B = Math.min(200000, Math.max(0, Number(sec24b) || 0));
  const capped80D = Math.min(75000, Math.max(0, Number(sec80d) || 0));
  const cappedNPS = Math.min(50000, Math.max(0, Number(nps80ccd) || 0));
  const cappedHRA = Math.max(0, Number(hraExemption) || 0);
  const cappedOther = Math.max(0, Number(otherDeductions) || 0);

  // 1. NEW TAX REGIME CALCULATION (FY 2025-26 Budget Slabs)
  const stdDedNew = Math.max(0, Number(standardDeductionNew) || 75000);
  const taxableIncomeNew = Math.max(0, gross - stdDedNew);

  let rawTaxNew = computeNewRegimeTaxSlabs(taxableIncomeNew);
  // Section 87A Rebate: Full rebate if taxable income <= 7,00,000 under New Regime
  if (taxableIncomeNew <= 700000) {
    rawTaxNew = 0;
  }

  const baseTaxNew = Math.round(rawTaxNew);
  const cessNew = Math.round(baseTaxNew * 0.04);
  const totalTaxNew = baseTaxNew + cessNew;
  const netTakeHomeNew = Math.max(0, gross - totalTaxNew);
  const monthlyTakeHomeNew = Math.round(netTakeHomeNew / 12);
  const effectiveRateNew = gross > 0 ? Number(((totalTaxNew / gross) * 100).toFixed(2)) : 0;

  // 2. OLD TAX REGIME CALCULATION
  const stdDedOld = Math.max(0, Number(standardDeductionOld) || 50000);
  const totalDeductionsOld = stdDedOld + capped80C + capped24B + capped80D + cappedNPS + cappedHRA + cappedOther;
  const taxableIncomeOld = Math.max(0, gross - totalDeductionsOld);

  let rawTaxOld = computeOldRegimeTaxSlabs(taxableIncomeOld);
  // Section 87A Rebate: Full rebate up to ₹12,500 if taxable income <= 5,00,000 under Old Regime
  if (taxableIncomeOld <= 500000) {
    rawTaxOld = 0;
  }

  const baseTaxOld = Math.round(rawTaxOld);
  const cessOld = Math.round(baseTaxOld * 0.04);
  const totalTaxOld = baseTaxOld + cessOld;
  const netTakeHomeOld = Math.max(0, gross - totalTaxOld);
  const monthlyTakeHomeOld = Math.round(netTakeHomeOld / 12);
  const effectiveRateOld = gross > 0 ? Number(((totalTaxOld / gross) * 100).toFixed(2)) : 0;

  // 3. DECISION ENGINE & COMPARISON WINNER
  const isNewBetter = totalTaxNew <= totalTaxOld;
  const recommendedRegime = isNewBetter ? 'new' : 'old';
  const taxSavingsAmount = Math.abs(totalTaxOld - totalTaxNew);
  const winnerTax = isNewBetter ? totalTaxNew : totalTaxOld;
  const winnerTakeHome = isNewBetter ? netTakeHomeNew : netTakeHomeOld;
  const winnerMonthlyTakeHome = isNewBetter ? monthlyTakeHomeNew : monthlyTakeHomeOld;
  const winnerEffectiveRate = isNewBetter ? effectiveRateNew : effectiveRateOld;

  // Hero Decision Banner Message
  let heroDecisionTitle = '';
  let heroDecisionSubtitle = '';
  if (taxSavingsAmount === 0) {
    heroDecisionTitle = 'Both Tax Regimes result in identical tax outgo.';
    heroDecisionSubtitle = 'You can select either regime; tax liability is equal under current deductions.';
  } else if (isNewBetter) {
    heroDecisionTitle = `New Tax Regime saves you ₹${taxSavingsAmount.toLocaleString('en-IN')} this year.`;
    heroDecisionSubtitle = `The New Regime offers lower tax slabs with standard deduction of ₹75,000 without needing complex investments.`;
  } else {
    heroDecisionTitle = `Old Tax Regime saves you ₹${taxSavingsAmount.toLocaleString('en-IN')} this year.`;
    heroDecisionSubtitle = `Your active tax deductions (₹${totalDeductionsOld.toLocaleString('en-IN')}) exceed the threshold needed to outperform the New Regime.`;
  }

  // 4. MARGINAL TAX BRACKET & MARGINAL SALARY INCREMENT (+₹1 Lakh)
  let incrementalTaxOn1L = 0;
  let marginalRatePct = 0;

  if (!isRecursive) {
    const marginalSalaryTest = gross + 100000;
    const marginalTestResult = calculateIncomeTax({
      ...inputs,
      grossIncome: marginalSalaryTest,
      isRecursive: true,
    });
    incrementalTaxOn1L = Math.max(0, marginalTestResult.totalTaxPayable - winnerTax);
    marginalRatePct = Math.round((incrementalTaxOn1L / 100000) * 100);
  }

  // 5. TAX EFFICIENCY SCORE (0-100) & REASON BREAKDOWN
  let score = 50; // Base score
  const scoreReasons = [];

  if (capped80C >= 150000) {
    score += 15;
    scoreReasons.push('✓ Section 80C fully maximized (₹1.5 Lakhs).');
  } else {
    const gap = 150000 - capped80C;
    scoreReasons.push(`• Section 80C unused limit: ₹${gap.toLocaleString('en-IN')}.`);
  }

  if (capped24B >= 200000) {
    score += 15;
    scoreReasons.push('✓ Section 24(b) Home Loan Interest fully claimed (₹2.0 Lakhs).');
  } else if (capped24B > 0) {
    score += 8;
    scoreReasons.push('✓ Partial Section 24(b) Home Loan Interest claimed.');
  } else {
    scoreReasons.push('• Home loan interest deduction unclaimed.');
  }

  if (cappedNPS >= 50000) {
    score += 10;
    scoreReasons.push('✓ Section 80CCD(1B) NPS benefit claimed (₹50,000).');
  } else {
    scoreReasons.push('• NPS additional ₹50,000 deduction available.');
  }

  if (capped80D >= 25000) {
    score += 10;
    scoreReasons.push('✓ Section 80D Health Insurance claimed.');
  } else {
    scoreReasons.push('• Health insurance deduction unclaimed.');
  }

  if (isNewBetter && taxSavingsAmount > 10000) {
    score += 10;
    scoreReasons.push('✓ Optimized on New Tax Regime for maximum tax savings.');
  } else if (!isNewBetter) {
    score += 10;
    scoreReasons.push('✓ Successfully utilizing deductions to beat New Regime tax outgo.');
  }

  const taxScore = Math.min(100, Math.max(20, score));

  // 6. RANKED TAX-SAVING OPPORTUNITIES (Ranked by Rupee Savings Impact)
  const opportunities = [];

  if (!isRecursive) {
    // Opportunity 1: NPS 80CCD(1B)
    if (cappedNPS < 50000) {
      const addNPS = 50000 - cappedNPS;
      const testResult = calculateIncomeTax({ ...inputs, nps80ccd: 50000, isRecursive: true });
      const savings = Math.max(0, totalTaxOld - testResult.oldRegime.totalTax);
      if (savings > 0) {
        opportunities.push({
          id: 'nps',
          title: `Contribute ₹${addNPS.toLocaleString('en-IN')} into NPS (Sec 80CCD 1B)`,
          estimatedSavings: savings,
          description: `Claim additional tax deduction up to ₹50,000 dedicated for National Pension System under Old Regime.`,
        });
      }
    }

    // Opportunity 2: Maximize Section 80C
    if (capped80C < 150000) {
      const add80C = 150000 - capped80C;
      const testResult = calculateIncomeTax({ ...inputs, sec80c: 150000, isRecursive: true });
      const savings = Math.max(0, totalTaxOld - testResult.oldRegime.totalTax);
      if (savings > 0) {
        opportunities.push({
          id: '80c',
          title: `Maximize Section 80C by investing ₹${add80C.toLocaleString('en-IN')}`,
          estimatedSavings: savings,
          description: `Invest in ELSS mutual funds, PPF, or EPF to utilize full ₹1.5 Lakhs limit under Old Regime.`,
        });
      }
    }

    // Opportunity 3: Section 80D Health Insurance
    if (capped80D < 25000) {
      const add80D = 25000 - capped80D;
      const testResult = calculateIncomeTax({ ...inputs, sec80d: 25000, isRecursive: true });
      const savings = Math.max(0, totalTaxOld - testResult.oldRegime.totalTax);
      if (savings > 0) {
        opportunities.push({
          id: '80d',
          title: `Claim Health Insurance Premium (Sec 80D) ₹${add80D.toLocaleString('en-IN')}`,
          estimatedSavings: savings,
          description: `Protect your family with health insurance while saving income tax under Sec 80D.`,
        });
      }
    }

    // Opportunity 4: Home Loan Interest Sec 24(b)
    if (capped24B < 200000) {
      const testResult = calculateIncomeTax({ ...inputs, sec24b: 200000, isRecursive: true });
      const savings = Math.max(0, totalTaxOld - testResult.oldRegime.totalTax);
      if (savings > 0) {
        opportunities.push({
          id: '24b',
          title: `Claim Home Loan Interest (Sec 24b) up to ₹2.0 Lakhs`,
          estimatedSavings: savings,
          description: `Deduct home loan interest payments against taxable income under Old Regime.`,
        });
      }
    }

    // Sort opportunities by estimated savings descending (highest financial impact first)
    opportunities.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
  }

  // 7. STRUCTURED INSIGHTS ARRAY FOR UI
  const insights = [
    {
      id: 'effective-rate',
      label: 'Effective Tax Rate',
      value: `${winnerEffectiveRate}%`,
      labelColor: 'text-primary',
      desc: `You pay ${winnerEffectiveRate}% of your total gross annual salary in income tax.`,
    },
    {
      id: 'monthly-takehome',
      label: 'Monthly Net Take-Home',
      value: `₹${winnerMonthlyTakeHome.toLocaleString('en-IN')}`,
      labelColor: 'text-semantic-success',
      valueColor: 'text-semantic-success',
      desc: `Net in-hand monthly salary after deducting income tax and cess.`,
    },
    {
      id: 'marginal-tax',
      label: 'Marginal Tax Increment (+₹1L)',
      value: `₹${incrementalTaxOn1L.toLocaleString('en-IN')}`,
      labelColor: 'text-accent-amber',
      desc: `If your salary increases by ₹1 Lakh, your additional tax will be approximately ₹${incrementalTaxOn1L.toLocaleString('en-IN')} (${marginalRatePct}% rate).`,
    },
  ];

  return {
    // Legacy properties for backward compatibility
    grossIncome: gross,
    standardDeduction: stdDedNew,
    taxableIncome: taxableIncomeNew,
    baseTax: baseTaxNew,
    healthEduCess: cessNew,
    totalTaxPayable: totalTaxNew,
    netTakeHome: netTakeHomeNew,

    // Flagship Institutional Properties
    newRegime: {
      standardDeduction: stdDedNew,
      taxableIncome: taxableIncomeNew,
      baseTax: baseTaxNew,
      cess: cessNew,
      totalTax: totalTaxNew,
      netTakeHome: netTakeHomeNew,
      monthlyTakeHome: monthlyTakeHomeNew,
      effectiveRate: effectiveRateNew,
    },
    oldRegime: {
      standardDeduction: stdDedOld,
      totalDeductions: totalDeductionsOld,
      taxableIncome: taxableIncomeOld,
      baseTax: baseTaxOld,
      cess: cessOld,
      totalTax: totalTaxOld,
      netTakeHome: netTakeHomeOld,
      monthlyTakeHome: monthlyTakeHomeOld,
      effectiveRate: effectiveRateOld,
    },
    heroDecision: {
      isNewBetter,
      recommendedRegime,
      taxSavingsAmount,
      heroDecisionTitle,
      heroDecisionSubtitle,
    },
    winner: {
      regime: recommendedRegime,
      totalTax: winnerTax,
      annualTakeHome: winnerTakeHome,
      monthlyTakeHome: winnerMonthlyTakeHome,
      effectiveRate: winnerEffectiveRate,
    },
    marginal: {
      incrementalTaxOn1L,
      marginalRatePct,
    },
    taxScore: {
      score: taxScore,
      reasons: scoreReasons,
    },
    opportunities,
    insights,
  };
}

/**
 * Helper: Compute New Regime Tax Slabs (FY 2025-26 Budget)
 */
function computeNewRegimeTaxSlabs(taxableIncome) {
  let tax = 0;
  if (taxableIncome > 300000) {
    if (taxableIncome <= 700000) {
      tax += (taxableIncome - 300000) * 0.05;
    } else {
      tax += 400000 * 0.05; // 20,000
      if (taxableIncome <= 1000000) {
        tax += (taxableIncome - 700000) * 0.1;
      } else {
        tax += 300000 * 0.1; // 30,000
        if (taxableIncome <= 1200000) {
          tax += (taxableIncome - 1000000) * 0.15;
        } else {
          tax += 200000 * 0.15; // 30,000
          if (taxableIncome <= 1500000) {
            tax += (taxableIncome - 1200000) * 0.2;
          } else {
            tax += 300000 * 0.2; // 60,000
            tax += (taxableIncome - 1500000) * 0.3;
          }
        }
      }
    }
  }
  return tax;
}

/**
 * Helper: Compute Old Regime Tax Slabs
 */
function computeOldRegimeTaxSlabs(taxableIncome) {
  let tax = 0;
  if (taxableIncome > 250000) {
    if (taxableIncome <= 500000) {
      tax += (taxableIncome - 250000) * 0.05;
    } else {
      tax += 250000 * 0.05; // 12,500
      if (taxableIncome <= 1000000) {
        tax += (taxableIncome - 500000) * 0.2;
      } else {
        tax += 500000 * 0.2; // 1,00,000
        tax += (taxableIncome - 1000000) * 0.3;
      }
    }
  }
  return tax;
}