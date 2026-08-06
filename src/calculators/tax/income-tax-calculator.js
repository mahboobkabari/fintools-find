/**
 * Income Tax Calculator Math Engine (New Tax Regime FY 2025-26)
 *
 * @param {Object} inputs
 * @param {number} inputs.grossIncome - Annual gross salary / taxable income
 * @param {number} [inputs.standardDeduction=75000] - Standard deduction (default ₹75,000)
 */
export function calculateIncomeTax(inputs = {}) {
  const { grossIncome = 1200000, standardDeduction = 75000 } = inputs;

  const gross = Math.max(0, Number(grossIncome) || 0);
  const stdDed = Math.max(0, Number(standardDeduction) || 0);
  const taxableIncome = Math.max(0, gross - stdDed);

  let tax = 0;

  // New Tax Regime Slabs (FY 2025-26 Budget)
  // Slab 1: Up to 3,00,000 -> 0%
  // Slab 2: 3,00,001 to 7,00,000 -> 5% (Max 20,000)
  // Slab 3: 7,00,001 to 10,00,000 -> 10% (Max 30,000)
  // Slab 4: 10,00,001 to 12,00,000 -> 15% (Max 30,000)
  // Slab 5: 12,00,001 to 15,00,000 -> 20% (Max 60,000)
  // Slab 6: Above 15,00,000 -> 30%

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

  // Section 87A Rebate: Full tax rebate if taxable income <= 7,00,000
  if (taxableIncome <= 700000) {
    tax = 0;
  }

  const roundedBaseTax = Math.round(tax);
  const healthEduCess = Math.round(roundedBaseTax * 0.04); // 4% Cess
  const totalTaxPayable = roundedBaseTax + healthEduCess;
  const netTakeHome = Math.max(0, gross - totalTaxPayable);

  return {
    grossIncome: gross,
    standardDeduction: stdDed,
    taxableIncome,
    baseTax: roundedBaseTax,
    healthEduCess,
    totalTaxPayable,
    netTakeHome,
  };
}