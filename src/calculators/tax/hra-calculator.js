/**
 * HRA Calculator Math Engine (House Rent Allowance Tax Exemption under Section 10(13A))
 * Computes tax-exempt HRA and taxable HRA per Indian Income Tax Act Rule 2A.
 *
 * @param {Object} inputs
 * @param {number} [inputs.basicSalary=600000] - Annual Basic Salary + DA in Rupees (₹)
 * @param {number} [inputs.hraReceived=240000] - Annual HRA Received from employer in Rupees (₹)
 * @param {number} [inputs.rentPaid=300000] - Annual Rent Paid to landlord in Rupees (₹)
 * @param {boolean|string} [inputs.isMetro=true] - true / 'yes' for Metro cities (Mumbai, Delhi, Kolkata, Chennai), false for Non-Metro
 * @returns {{ primaryOutput: number, actualHra: number, rentMinusTenPercent: number, salaryPercentageLimit: number, exemptHra: number, taxableHra: number, isMetro: boolean }}
 */
export function calculateHraCalculator(inputs = {}) {
  const {
    basicSalary = 600000,
    hraReceived = 240000,
    rentPaid = 300000,
    isMetro = true,
  } = inputs;

  const numBasic = Math.max(0, Number(basicSalary) || 0);
  const numHra = Math.max(0, Number(hraReceived) || 0);
  const numRent = Math.max(0, Number(rentPaid) || 0);
  const metroBool = isMetro === true || isMetro === 'true' || isMetro === 'yes';

  const actualHra = numHra;
  const rentMinusTenPercent = Math.max(0, numRent - 0.10 * numBasic);
  const salaryPercentageLimit = numBasic * (metroBool ? 0.50 : 0.40);

  // Exemption is minimum of the three statutory values
  const exemptHra = Math.min(actualHra, rentMinusTenPercent, salaryPercentageLimit);
  const taxableHra = Math.max(0, actualHra - exemptHra);

  return {
    primaryOutput: Math.round(exemptHra),
    actualHra: Math.round(actualHra),
    rentMinusTenPercent: Math.round(rentMinusTenPercent),
    salaryPercentageLimit: Math.round(salaryPercentageLimit),
    exemptHra: Math.round(exemptHra),
    taxableHra: Math.round(taxableHra),
    isMetro: metroBool,
  };
}