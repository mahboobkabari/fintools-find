/**
 * 401(k) Retirement Calculator Math Engine
 * Computes future 401(k) balance incorporating employee contributions, employer match, salary growth, and compound returns.
 *
 * @param {Object} inputs
 * @param {number} [inputs.currentAge=30] - Current age in years
 * @param {number} [inputs.retirementAge=65] - Expected retirement age in years
 * @param {number} [inputs.annualSalary=90000] - Current annual gross salary ($)
 * @param {number} [inputs.contributionPercent=8] - Employee salary contribution percentage (%)
 * @param {number} [inputs.employerMatchPercent=50] - Employer match percentage on eligible contribution (e.g. 50% match)
 * @param {number} [inputs.employerMatchLimit=6] - Maximum salary percentage eligible for employer match (e.g. up to 6%)
 * @param {number} [inputs.currentBalance=25000] - Existing 401(k) balance ($)
 * @param {number} [inputs.expectedReturn=7] - Expected annual investment return (%)
 * @param {number} [inputs.annualSalaryIncrease=3] - Expected annual salary growth (%)
 * @returns {{ primaryOutput: number, yearsInvested: number, totalEmployeeContributions: number, totalEmployerMatch: number, totalContributions: number, totalGrowth: number, finalBalance: number }}
 */
export function calculate401kCalculator(inputs = {}) {
  const currentAge = inputs.currentAge ?? 30;
  const retirementAge = inputs.retirementAge ?? 65;
  const annualSalary = inputs.annualSalary ?? 90000;
  const contributionPercent = inputs.contributionPercent ?? 8;
  const employerMatchPercent = inputs.employerMatchPercent ?? 50;
  const employerMatchLimit = inputs.employerMatchLimit ?? 6;
  const currentBalance = inputs.currentBalance ?? 25000;
  const expectedReturn = inputs.expectedReturn ?? 7;
  const annualSalaryIncrease = inputs.annualSalaryIncrease ?? 3;

  const numCurrentAge = Math.max(18, Number(currentAge));
  const numRetireAge = Math.max(numCurrentAge + 1, Number(retirementAge));
  const numSalary = Math.max(0, Number(annualSalary));
  const numEmpPct = Math.max(0, Math.min(100, Number(contributionPercent)));
  const numMatchPct = Math.max(0, Math.min(100, Number(employerMatchPercent)));
  const numMatchLimit = Math.max(0, Math.min(100, Number(employerMatchLimit)));
  const numCurrentBal = Math.max(0, Number(currentBalance));
  const numReturn = Math.max(0, Number(expectedReturn));
  const numSalaryInc = Math.max(0, Number(annualSalaryIncrease));

  const yearsInvested = numRetireAge - numCurrentAge;
  const irsLimit = 23500; // 2025/2026 IRS 401(k) elective deferral limit

  let runningBalance = numCurrentBal;
  let runningSalary = numSalary;
  let totalEmployeeContrib = 0;
  let totalEmployerMatch = 0;

  for (let year = 0; year < yearsInvested; year++) {
    // Employee contribution capped at IRS annual limit
    let empContribYear = runningSalary * (numEmpPct / 100);
    empContribYear = Math.min(empContribYear, irsLimit);

    // Employer match calculation
    const matchEligiblePct = Math.min(numEmpPct, numMatchLimit);
    const employerMatchYear = runningSalary * (matchEligiblePct / 100) * (numMatchPct / 100);

    totalEmployeeContrib += empContribYear;
    totalEmployerMatch += employerMatchYear;

    const annualTotalAdded = empContribYear + employerMatchYear;
    runningBalance = (runningBalance + annualTotalAdded) * (1 + numReturn / 100);
    runningSalary = runningSalary * (1 + numSalaryInc / 100);
  }

  const finalBalance = Math.round(runningBalance);
  const totalContributions = Math.round(totalEmployeeContrib + totalEmployerMatch);
  const totalGrowth = Math.max(0, finalBalance - numCurrentBal - totalContributions);

  return {
    primaryOutput: finalBalance,
    yearsInvested,
    totalEmployeeContributions: Math.round(totalEmployeeContrib),
    totalEmployerMatch: Math.round(totalEmployerMatch),
    totalContributions,
    totalGrowth,
    finalBalance,
  };
}