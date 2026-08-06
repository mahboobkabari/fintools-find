/**
 * Provident Fund (EPF) Calculator Math Engine (EPFO Rules)
 * Computes EPF maturity balance, employee contributions (12%), employer contributions (3.67%), and annual compound interest.
 *
 * @param {Object} inputs
 * @param {number} [inputs.monthlyBasicSalary=30000] - Monthly Basic Salary + DA in Rupees (₹)
 * @param {number} [inputs.currentAge=25] - Current age in years
 * @param {number} [inputs.retirementAge=58] - Target retirement age in years (EPFO standard is 58)
 * @param {number} [inputs.epfInterestRate=8.25] - Declared EPFO annual interest rate (%)
 * @param {number} [inputs.annualSalaryIncrease=5] - Expected annual salary growth (%)
 * @param {number} [inputs.currentEpfBalance=0] - Existing EPF balance (₹)
 * @returns {{ primaryOutput: number, yearsInvested: number, totalEmployeeContribution: number, totalEmployerContribution: number, totalContribution: number, totalInterestEarned: number, finalEpfBalance: number }}
 */
export function calculateProvidentFundCalculator(inputs = {}) {
  const monthlyBasicSalary = inputs.monthlyBasicSalary ?? 30000;
  const currentAge = inputs.currentAge ?? 25;
  const retirementAge = inputs.retirementAge ?? 58;
  const epfInterestRate = inputs.epfInterestRate ?? 8.25;
  const annualSalaryIncrease = inputs.annualSalaryIncrease ?? 5;
  const currentEpfBalance = inputs.currentEpfBalance ?? 0;

  const numBasic = Math.max(1000, Number(monthlyBasicSalary));
  const numCurrentAge = Math.max(18, Number(currentAge));
  const numRetireAge = Math.max(numCurrentAge + 1, Number(retirementAge));
  const numRate = Math.max(1, Number(epfInterestRate));
  const numSalInc = Math.max(0, Number(annualSalaryIncrease));
  const numCurrentBal = Math.max(0, Number(currentEpfBalance));

  const yearsInvested = numRetireAge - numCurrentAge;
  const monthlyInterestRate = numRate / 100 / 12;

  let runningBalance = numCurrentBal;
  let currentBasic = numBasic;
  let totalEmployeeContrib = 0;
  let totalEmployerContrib = 0;

  for (let yr = 0; yr < yearsInvested; yr++) {
    const monthlyEmpContrib = currentBasic * 0.12; // 12% Employee EPF
    const monthlyEmpMatch = currentBasic * 0.0367; // 3.67% Employer EPF (8.33% goes to EPS)

    let yearEndInterest = 0;
    for (let m = 1; m <= 12; m++) {
      totalEmployeeContrib += monthlyEmpContrib;
      totalEmployerContrib += monthlyEmpMatch;
      runningBalance += monthlyEmpContrib + monthlyEmpMatch;
      yearEndInterest += runningBalance * monthlyInterestRate;
    }

    runningBalance += yearEndInterest;
    currentBasic = currentBasic * (1 + numSalInc / 100);
  }

  const finalEpfBalance = Math.round(runningBalance);
  const totalContribution = Math.round(totalEmployeeContrib + totalEmployerContrib);
  const totalInterestEarned = Math.max(0, finalEpfBalance - numCurrentBal - totalContribution);

  return {
    primaryOutput: finalEpfBalance,
    yearsInvested,
    totalEmployeeContribution: Math.round(totalEmployeeContrib),
    totalEmployerContribution: Math.round(totalEmployerContrib),
    totalContribution,
    totalInterestEarned: Math.round(totalInterestEarned),
    finalEpfBalance,
  };
}