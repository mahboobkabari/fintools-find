/**
 * Flagship Import Duty & Total Landed Cost Decision Engine (Sprint 80 / Flagship #87)
 * 
 * Implements WTO/GATT standard customs valuation, CIF vs. FOB assessable value models,
 * Basic Customs Duty (BCD), Social Welfare / Customs Surcharges, and Compounded Import GST/VAT.
 * 
 * Valuation Sequence:
 * 1. Product Value = Unit Price × Quantity
 * 2. Assessable Customs Value (CIF = Product + Freight + Insurance | FOB = Product)
 * 3. Basic Customs Duty = Assessable Value × (Duty Rate %)
 * 4. Additional Customs Surcharge = Basic Duty × (Surcharge Rate %) OR Assessable Value × (Levy %)
 * 5. Import GST / VAT Base = Assessable Value + Basic Duty + Surcharges
 * 6. Import GST / VAT Amount = Tax Base × (GST/VAT Rate %)
 * 7. Total Landed Cost = Product + Freight + Insurance + Duty + Surcharge + GST/VAT + Handling/Brokerage
 */

export const VALUATION_METHODS = {
  CIF: {
    id: 'CIF',
    name: 'CIF (Cost, Insurance & Freight)',
    desc: 'Standard international customs base (India, EU, UK, GCC). Duty applied to Product + Freight + Insurance.',
  },
  FOB: {
    id: 'FOB',
    name: 'FOB (Free on Board)',
    desc: 'US CBP standard base. Duty applied strictly to Product Value at port of export; freight and insurance added to final landed cost.',
  },
};

export const CURRENCY_METADATA = {
  INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
};

export const REFERENCE_METADATA = {
  baselineDate: '2026-08-27',
  valuationStandard: 'WTO Agreement on Customs Valuation (GATT 1994 Art. VII)',
  disclaimer: 'This calculator is an educational landed cost estimation tool. Official customs duties, classification codes (HS Codes), and anti-dumping levies are determined exclusively by the destination customs authority upon entry.',
};

/**
 * Calculates itemized import duty, customs surcharges, import VAT/GST, and total landed cost.
 * 
 * @param {Object} [inputs={}]
 * @param {number} [inputs.unitPrice=10000] - Unit price of imported good
 * @param {number} [inputs.quantity=1] - Number of units
 * @param {number} [inputs.shippingCost=2000] - International shipping/freight cost
 * @param {number} [inputs.insuranceCost=500] - Transit cargo insurance
 * @param {number} [inputs.dutyRate=10] - Basic Customs Duty (BCD) percentage (e.g. 10%)
 * @param {number} [inputs.surchargeRate=10] - Additional customs surcharge on duty % (e.g. 10% SWS in India)
 * @param {number} [inputs.vatGstRate=18] - Import GST or VAT percentage (e.g. 18% IGST / 20% VAT)
 * @param {number} [inputs.handlingFee=1000] - Customs clearance / courier brokerage fee
 * @param {string} [inputs.valuationMethod='CIF'] - 'CIF' | 'FOB'
 * @param {string} [inputs.currency='INR'] - Currency code
 * @param {string} [inputs.itemDescription='Imported Consumer Electronics']
 * @returns {Object} Structured landed cost analytics
 */
export function calculateImportDuty(inputs = {}) {
  const {
    unitPrice = 10000,
    quantity = 1,
    shippingCost = 2000,
    insuranceCost = 500,
    dutyRate = 10,
    surchargeRate = 10,
    vatGstRate = 18,
    handlingFee = 1000,
    valuationMethod = 'CIF',
    currency = 'INR',
    itemDescription = 'Imported Consumer Electronics',
  } = inputs;

  // 1. INPUT SANITIZATION & SAFEGUARDS
  const cleanUnitPrice = Math.max(0, Number(unitPrice) || 0);
  const cleanQuantity = Math.max(1, Number(quantity) || 1);
  const cleanShipping = Math.max(0, Number(shippingCost) || 0);
  const cleanInsurance = Math.max(0, Number(insuranceCost) || 0);
  const cleanDutyRate = Math.max(0, Math.min(100, Number(dutyRate) || 0));
  const cleanSurchargeRate = Math.max(0, Math.min(100, Number(surchargeRate) || 0));
  const cleanVatGstRate = Math.max(0, Math.min(100, Number(vatGstRate) || 0));
  const cleanHandling = Math.max(0, Number(handlingFee) || 0);

  const valMethod = String(valuationMethod).toUpperCase() === 'FOB' ? 'FOB' : 'CIF';
  const currKey = String(currency).trim().toUpperCase();
  const currMeta = CURRENCY_METADATA[currKey] || CURRENCY_METADATA.INR;
  const sym = currMeta.symbol;

  // 2. BASELINE PRODUCT & CUSTOMS VALUE
  const productValue = Math.round(cleanUnitPrice * cleanQuantity * 100) / 100;

  let assessableCustomsValue = 0;
  if (valMethod === 'CIF') {
    assessableCustomsValue = Math.round((productValue + cleanShipping + cleanInsurance) * 100) / 100;
  } else {
    // FOB Valuation: Assessable value is based solely on product price at export port
    assessableCustomsValue = productValue;
  }

  // 3. BASIC CUSTOMS DUTY (BCD)
  const basicDutyAmount = Math.round(assessableCustomsValue * (cleanDutyRate / 100) * 100) / 100;

  // 4. ADDITIONAL CUSTOMS SURCHARGE (e.g. Social Welfare Surcharge 10% of BCD)
  const surchargeAmount = Math.round(basicDutyAmount * (cleanSurchargeRate / 100) * 100) / 100;

  // 5. IMPORT VAT / GST CALCULATION
  // Statutory base for VAT/GST = Assessable Customs Value + Basic Duty + Surcharges
  const vatGstBase = Math.round((assessableCustomsValue + basicDutyAmount + surchargeAmount) * 100) / 100;
  const vatGstAmount = Math.round(vatGstBase * (cleanVatGstRate / 100) * 100) / 100;

  // 6. TOTAL TAX BURDEN & LANDED COST
  const totalTaxBurden = Math.round((basicDutyAmount + surchargeAmount + vatGstAmount) * 100) / 100;
  
  const totalLandedCost = Math.round((
    productValue +
    cleanShipping +
    cleanInsurance +
    totalTaxBurden +
    cleanHandling
  ) * 100) / 100;

  const costPerUnit = cleanQuantity > 0
    ? Math.round((totalLandedCost / cleanQuantity) * 100) / 100
    : totalLandedCost;

  // 7. RATIOS & EFFECTIVE PERCENTAGES
  const effectiveDutyOnProductPct = productValue > 0
    ? Number(((totalTaxBurden / productValue) * 100).toFixed(2))
    : 0;

  const dutyShareOfLandedPct = totalLandedCost > 0
    ? Number(((totalTaxBurden / totalLandedCost) * 100).toFixed(2))
    : 0;

  const productShareOfLandedPct = totalLandedCost > 0
    ? Number(((productValue / totalLandedCost) * 100).toFixed(2))
    : 0;

  const freightShareOfLandedPct = totalLandedCost > 0
    ? Number((((cleanShipping + cleanInsurance) / totalLandedCost) * 100).toFixed(2))
    : 0;

  const handlingShareOfLandedPct = totalLandedCost > 0
    ? Number(((cleanHandling / totalLandedCost) * 100).toFixed(2))
    : 0;

  // 8. DYNAMIC HERO VERDICT
  let heroText = '';
  if (totalTaxBurden === 0) {
    heroText = `Duty-Free Import: Total landed cost is ${sym}${totalLandedCost.toLocaleString()} (${sym}${costPerUnit.toLocaleString()}/unit).`;
  } else {
    heroText = `Total Duty & Import Taxes: ${sym}${totalTaxBurden.toLocaleString()} (+${effectiveDutyOnProductPct}% tax burden). Final landed cost is ${sym}${totalLandedCost.toLocaleString()}.`;
  }

  // 9. ACTIONABLE RECOMMENDATIONS & INSIGHTS
  const recommendations = [];

  if (effectiveDutyOnProductPct > 35) {
    recommendations.push({
      title: `High Tax Burden (+${effectiveDutyOnProductPct}% on Product Value)`,
      type: 'critical',
      description: `Cumulative duties, surcharges, and import GST total ${sym}${totalTaxBurden.toLocaleString()}. Compare domestic wholesale distributors to verify if local sourcing or bonded warehouse clearance is more cost-effective.`,
    });
  } else if (effectiveDutyOnProductPct === 0) {
    recommendations.push({
      title: 'Zero Duty / Free Trade Benefit',
      type: 'positive',
      description: `No customs duties or import taxes apply under current rates. Retain country-of-origin certificates and export documentation to prevent clearance disputes.`,
    });
  } else {
    recommendations.push({
      title: `Standard Import Tariff Corridor (${effectiveDutyOnProductPct}%)`,
      type: 'info',
      description: `Customs duties add ${sym}${totalTaxBurden.toLocaleString()} to your base order. If you are a registered business, verify whether the ${sym}${vatGstAmount.toLocaleString()} import GST/VAT qualifies for Input Tax Credit (ITC).`,
    });
  }

  if (cleanHandling > (productValue * 0.15) && productValue > 0) {
    recommendations.push({
      title: 'High Brokerage & Courier Handling Fee Ratio',
      type: 'warning',
      description: `Clearance handling fees (${sym}${cleanHandling.toLocaleString()}) represent over 15% of your item price. Consider consolidating multiple shipments or using self-clearing customs portals for high-frequency orders.`,
    });
  }

  recommendations.push({
    title: 'Customs Valuation Audit (CIF vs FOB)',
    type: 'info',
    description: `Calculations utilize ${valMethod} valuation base (${sym}${assessableCustomsValue.toLocaleString()}). Customs authorities may assess statutory exchange rates and freight minimums if invoices lack itemized documentation.`,
  });

  return {
    itemDescription,
    unitPrice: cleanUnitPrice,
    quantity: cleanQuantity,
    productValue,
    shippingCost: cleanShipping,
    insuranceCost: cleanInsurance,
    assessableCustomsValue,
    dutyRate: cleanDutyRate,
    basicDutyAmount,
    surchargeRate: cleanSurchargeRate,
    surchargeAmount,
    vatGstRate: cleanVatGstRate,
    vatGstBase,
    vatGstAmount,
    handlingFee: cleanHandling,
    totalTaxBurden,
    totalLandedCost,
    costPerUnit,
    valuationMethod: valMethod,
    currency: currKey,
    currencyMeta: currMeta,
    effectiveDutyOnProductPct,
    dutyShareOfLandedPct,
    productShareOfLandedPct,
    freightShareOfLandedPct,
    handlingShareOfLandedPct,
    heroText,
    recommendations,
    metadata: REFERENCE_METADATA,
  };
}

// Aliases
export const calculateImportDutyCalculator = calculateImportDuty;
export const calculateLandedCost = calculateImportDuty;
export const calculateCustomsDuty = calculateImportDuty;
