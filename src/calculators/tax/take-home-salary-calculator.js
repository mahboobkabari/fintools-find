/**
 * Take-Home Salary Calculator Math Engine (FY 2025-26 New Tax Regime Rules)
 * Computes net monthly take-home salary after income tax, standard deduction (₹75k), EPF, and professional tax.
 *
 * @param {Object} inputs
 * @param {number} [inputs.ctc=1200000] - Gross Annual Cost to Company (CTC) in Rupees (₹)
 * @param {number} [inputs.basicPercent=50] - Basic salary percentage of CTC (e.g. 50%)
 * @param {number} [inputs.professionalTax=2400] - Annual Professional Tax (₹)
 * @returns {{ primaryOutput: number, grossAnnualCtc: number, basicSalary: number, epfAnnual: number, standardDeduction: number, taxableIncome: number, baseTax: number, rebate87a: number, cessAmount: number, totalIncomeTax: number, totalDeductions: number, netAnnualTakeHome: number, netMonthlyTakeHome: number }}
 */
export function calculateTakeHomeSalaryCalculator(inputs = {}) {
  const { ctc = 1200000, basicPercent = 50, professionalTax = 2400 } = inputs;

  const numCtc = Math.max(0, Number(ctc) || 0);
  const numBasicPct = Math.max(10, Math.min(100, Number(basicPercent) || 50));
  const numPt = Math.max(0, Number(professionalTax) || 0);

  const basicSalary = numCtc * (numBasicPct / 100);
  const epfAnnual = basicSalary * 0.12; // 12% Employee Provident Fund
  const standardDeduction = 75000; // FY 2025-26 New Tax Regime standard deduction

  const taxableIncome = Math.max(0, numCtc - standardDeduction);

  // New Tax Regime Slabs FY 2025-26
  let baseTax = 0;
  if (taxableIncome > 1500000) {
    baseTax += (taxableIncome - 1500000) * 0.30;
    baseTax += 300000 * 0.20; // 12L-15L
    baseTax += 200000 * 0.15; // 10L-12L
    baseTax += 300000 * 0.10; // 7L-10L
    baseTax += 400000 * 0.05; // 3L-7L
  } else if (taxableIncome > 1200000) {
    baseTax += (taxableIncome - 1200000) * 0.20;
    baseTax += 200000 * 0.15;
    baseTax += 300000 * 0.10;
    baseTax += 400000 * 0.05;
  } else if (taxableIncome > 1000000) {
    baseTax += (taxableIncome - 1000000) * 0.15;
    baseTax += 300000 * 0.10;
    baseTax += 400000 * 0.05;
  } else if (taxableIncome > 700000) {
    baseTax += (taxableIncome - 700000) * 0.10;
    baseTax += 400000 * 0.05;
  } else if (taxableIncome > 300000) {
    baseTax += (taxableIncome - 300000) * 0.05;
  }

  // Section 87A Rebate: Zero tax for taxable income <= ₹7,00,000
  let rebate87a = 0;
  if (taxableIncome <= 700000) {
    rebate87a = baseTax;
  }

  const netBaseTax = Math.max(0, baseTax - rebate87a);
  const cessAmount = netBaseTax * 0.04;
  const totalIncomeTax = Math.round(netBaseTax + cessAmount);

  const totalDeductions = Math.round(totalIncomeTax + epfAnnual + numPt);
  const netAnnualTakeHome = Math.max(0, numCtc - totalDeductions);
  const netMonthlyTakeHome = Math.round(netAnnualTakeHome / 12);

  return {
    primaryOutput: netMonthlyTakeHome,
    grossAnnualCtc: Math.round(numCtc),
    basicSalary: Math.round(basicSalary),
    epfAnnual: Math.round(epfAnnual),
    standardDeduction,
    taxableIncome: Math.round(taxableIncome),
    baseTax: Math.round(baseTax),
    rebate87a: Math.round(rebate87a),
    cessAmount: Math.round(cessAmount),
    totalIncomeTax,
    totalDeductions,
    netAnnualTakeHome: Math.round(netAnnualTakeHome),
    netMonthlyTakeHome,
  };
}