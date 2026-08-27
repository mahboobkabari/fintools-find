/**
 * Flagship Remittance Fee & True FX Cost Decision Engine (Sprint 81 / Flagship #88)
 * 
 * Accurately analyzes cross-border international remittances:
 * - Mid-market reference cross-rates vs dealer offered rates
 * - Explicit upfront transfer fees (fixed + variable percentage)
 * - Hidden FX markup / dealer spread costs
 * - Recipient bank & intermediary correspondent bank deductions
 * - True effective transfer fee % and effective net FX rate
 * - Reuses institutional reference exchange rates from currency-converter.js
 */

import {
  REFERENCE_EXCHANGE_RATES,
  REFERENCE_RATE_METADATA,
} from './currency-converter.js';

export const FEE_PAYMENT_MODES = {
  ADD_ON_TOP: {
    id: 'ADD_ON_TOP',
    name: 'Fee Paid On Top (Separate Outflow)',
    desc: 'Sender pays full send amount to recipient, plus fee charged separately.',
  },
  DEDUCT_FROM_SEND: {
    id: 'DEDUCT_FROM_SEND',
    name: 'Fee Deducted from Send Amount',
    desc: 'Transfer fee is deducted from the send amount before foreign currency conversion.',
  },
};

/**
 * Calculates itemized remittance fees, FX spread costs, net recipient amounts, and effective rates.
 * 
 * @param {Object} [inputs={}]
 * @param {number} [inputs.sendAmount=1000] - Amount sender wishes to remit
 * @param {string} [inputs.fromCurrency='USD'] - Source ISO currency code
 * @param {string} [inputs.toCurrency='INR'] - Destination ISO currency code
 * @param {number} [inputs.fixedFee=0] - Fixed transfer fee in sender currency
 * @param {number} [inputs.percentageFee=0] - Percentage transfer fee on send amount (%)
 * @param {number} [inputs.fxSpreadPct=1.2] - Exchange rate markup percentage (%)
 * @param {number} [inputs.recipientFee=0] - Recipient-side bank/cash pickup fee in recipient currency
 * @param {number} [inputs.intermediaryFee=0] - Correspondent / intermediary bank fee in recipient currency
 * @param {string} [inputs.feeMode='ADD_ON_TOP'] - 'ADD_ON_TOP' | 'DEDUCT_FROM_SEND'
 * @param {number} [inputs.customRate] - Optional user-overridden exchange rate
 * @returns {Object} Comprehensive remittance cost analytics
 */
export function calculateRemittanceFee(inputs = {}) {
  const {
    sendAmount = 1000,
    fromCurrency = 'USD',
    toCurrency = 'INR',
    fixedFee = 0,
    percentageFee = 0,
    fxSpreadPct = 1.2,
    recipientFee = 0,
    intermediaryFee = 0,
    feeMode = 'ADD_ON_TOP',
    customRate = null,
  } = inputs;

  // 1. INPUT SANITIZATION & METADATA
  const cleanSendAmount = Math.max(0, Number(sendAmount) || 0);
  const cleanFixedFee = Math.max(0, Number(fixedFee) || 0);
  const cleanPercentageFee = Math.max(0, Math.min(100, Number(percentageFee) || 0));
  const cleanFxSpreadPct = Math.max(0, Math.min(50, Number(fxSpreadPct) || 0));
  const cleanRecipientFee = Math.max(0, Number(recipientFee) || 0);
  const cleanIntermediaryFee = Math.max(0, Number(intermediaryFee) || 0);
  const cleanMode = String(feeMode).toUpperCase() === 'DEDUCT_FROM_SEND' ? 'DEDUCT_FROM_SEND' : 'ADD_ON_TOP';

  const fromKey = String(fromCurrency).trim().toUpperCase();
  const toKey = String(toCurrency).trim().toUpperCase();

  const fromMeta = REFERENCE_EXCHANGE_RATES[fromKey] || REFERENCE_EXCHANGE_RATES.USD;
  const toMeta = REFERENCE_EXCHANGE_RATES[toKey] || REFERENCE_EXCHANGE_RATES.INR;

  const fromSym = fromMeta.symbol;
  const toSym = toMeta.symbol;
  const toDecimals = toMeta.decimals !== undefined ? toMeta.decimals : 2;

  // 2. EXCHANGE RATE DERIVATION
  let midMarketRate = 1.0;
  if (fromMeta.code === toMeta.code) {
    midMarketRate = 1.0;
  } else {
    // Cross Rate (A -> B) = Rate(USD -> B) / Rate(USD -> A)
    midMarketRate = toMeta.rateToUsd / fromMeta.rateToUsd;
  }

  // Customer Offered Rate (Mid-market discounted by dealer spread)
  let customerRate = 0;
  if (customRate !== null && customRate !== undefined && Number(customRate) > 0) {
    customerRate = Number(customRate);
  } else if (fromMeta.code === toMeta.code) {
    customerRate = 1.0;
  } else {
    customerRate = midMarketRate * (1 - cleanFxSpreadPct / 100);
  }

  // 3. EXPLICIT SENDER FEES
  const variableFeeAmount = Math.round(cleanSendAmount * (cleanPercentageFee / 100) * 100) / 100;
  const totalSenderFee = Math.round((cleanFixedFee + variableFeeAmount) * 100) / 100;

  // 4. CONVERSION AMOUNTS BASED ON PAYMENT MODE
  let netSendAmount = cleanSendAmount;
  let totalSenderOutflow = cleanSendAmount;

  if (cleanMode === 'DEDUCT_FROM_SEND') {
    netSendAmount = Math.max(0, cleanSendAmount - totalSenderFee);
    totalSenderOutflow = cleanSendAmount;
  } else {
    // ADD_ON_TOP: Sender sends cleanSendAmount, pays fee separately
    netSendAmount = cleanSendAmount;
    totalSenderOutflow = Math.round((cleanSendAmount + totalSenderFee) * 100) / 100;
  }

  // 5. RECIPIENT GROSS & NET CONVERSIONS
  const idealGrossReceived = Math.round(netSendAmount * midMarketRate * 100) / 100;
  const actualGrossReceived = Math.round(netSendAmount * customerRate * 100) / 100;

  const totalRecipientSideDeductions = Math.round((cleanRecipientFee + cleanIntermediaryFee) * 100) / 100;
  const netRecipientAmount = Math.max(0, Math.round((actualGrossReceived - totalRecipientSideDeductions) * 100) / 100);

  // 6. HIDDEN FX SPREAD COST
  const fxLossInRecipientCurrency = Math.max(0, Math.round((idealGrossReceived - actualGrossReceived) * 100) / 100);
  const fxLossInSenderCurrency = midMarketRate > 0
    ? Math.round((fxLossInRecipientCurrency / midMarketRate) * 100) / 100
    : 0;

  // Recipient fees converted to sender currency for unified cost analysis
  const recipientFeesInSenderCurrency = midMarketRate > 0
    ? Math.round((totalRecipientSideDeductions / midMarketRate) * 100) / 100
    : 0;

  // 7. TOTAL REMITTANCE COST & EFFECTIVE PERCENTAGES
  const totalCostInSenderCurrency = Math.round((
    totalSenderFee +
    fxLossInSenderCurrency +
    recipientFeesInSenderCurrency
  ) * 100) / 100;

  const effectiveFeePct = cleanSendAmount > 0
    ? Number(((totalCostInSenderCurrency / cleanSendAmount) * 100).toFixed(2))
    : 0;

  const effectiveNetFxRate = cleanSendAmount > 0
    ? Number((netRecipientAmount / cleanSendAmount).toFixed(6))
    : Number(customerRate.toFixed(6));

  // Cost breakdown shares
  const upfrontFeeSharePct = totalCostInSenderCurrency > 0
    ? Number(((totalSenderFee / totalCostInSenderCurrency) * 100).toFixed(1))
    : 0;
  const fxSpreadSharePct = totalCostInSenderCurrency > 0
    ? Number(((fxLossInSenderCurrency / totalCostInSenderCurrency) * 100).toFixed(1))
    : 0;
  const recipientFeeSharePct = totalCostInSenderCurrency > 0
    ? Number(((recipientFeesInSenderCurrency / totalCostInSenderCurrency) * 100).toFixed(1))
    : 0;

  // 8. DYNAMIC HERO VERDICT
  let heroText = '';
  if (totalCostInSenderCurrency === 0) {
    heroText = `Zero Fee Transfer: Recipient receives ${toSym}${netRecipientAmount.toLocaleString(undefined, { minimumFractionDigits: toDecimals, maximumFractionDigits: toDecimals })} at mid-market rate.`;
  } else {
    heroText = `Recipient receives ${toSym}${netRecipientAmount.toLocaleString(undefined, { minimumFractionDigits: toDecimals, maximumFractionDigits: toDecimals })}. Total transfer cost is ${fromSym}${totalCostInSenderCurrency.toLocaleString()} (${effectiveFeePct}% effective fee).`;
  }

  // 9. ACTIONABLE RECOMMENDATIONS & INSIGHTS
  const recommendations = [];

  if (totalCostInSenderCurrency === 0 || effectiveFeePct < 0.5) {
    recommendations.push({
      title: 'Optimal Low-Cost Remittance Channel',
      type: 'positive',
      description: `Total friction is only ${effectiveFeePct}%, maximizing the payout delivered to your beneficiary.`,
    });
  } else if (effectiveFeePct > 4.0) {
    recommendations.push({
      title: `High Remittance Fee Corridor (${effectiveFeePct}%)`,
      type: 'critical',
      description: `Sending ${fromSym}${cleanSendAmount.toLocaleString()} incurs ${fromSym}${totalCostInSenderCurrency.toLocaleString()} in combined charges. For routine transfers, consider specialized cross-border fintech services or batched transfers to reduce fixed fee drag.`,
    });
  } else if (fxLossInSenderCurrency > totalSenderFee && fxLossInSenderCurrency > 0) {
    recommendations.push({
      title: 'Hidden FX Markup Dominates Transfer Cost',
      type: 'warning',
      description: `The exchange rate spread (${fromSym}${fxLossInSenderCurrency.toLocaleString()}) is higher than the upfront transfer fee (${fromSym}${totalSenderFee.toLocaleString()}). Look for digital transfer providers offering near mid-market rates rather than 'zero-fee' services with inflated FX margins.`,
    });
  } else {
    recommendations.push({
      title: `Standard Market Transfer Fee (${effectiveFeePct}%)`,
      type: 'info',
      description: `Total remittance cost of ${fromSym}${totalCostInSenderCurrency.toLocaleString()} reflects standard corridor pricing (${fromSym}${totalSenderFee.toLocaleString()} fee + ${fromSym}${fxLossInSenderCurrency.toLocaleString()} FX spread).`,
    });
  }

  if (totalRecipientSideDeductions > 0) {
    recommendations.push({
      title: 'Beneficiary Receiving / Intermediary Deductions',
      type: 'warning',
      description: `Recipient bank / correspondent charges deduct ${toSym}${totalRecipientSideDeductions.toLocaleString()} upon arrival. Verify whether your provider supports OUR/SHA SWIFT fee instructions or direct local clearing (IMPS/ACH/SEPA).`,
    });
  }

  recommendations.push({
    title: 'Mid-Market Rate Transparency',
    type: 'info',
    description: `Mid-market rate is 1 ${fromKey} = ${midMarketRate.toFixed(4)} ${toKey}. Your transfer rate is 1 ${fromKey} = ${customerRate.toFixed(4)} ${toKey} (${cleanFxSpreadPct}% margin).`,
  });

  return {
    sendAmount: cleanSendAmount,
    fromCurrency: fromKey,
    toCurrency: toKey,
    fromMeta,
    toMeta,
    fromSymbol: fromSym,
    toSymbol: toSym,
    toDecimals,
    feeMode: cleanMode,
    fixedFee: cleanFixedFee,
    percentageFee: cleanPercentageFee,
    totalSenderFee,
    fxSpreadPct: cleanFxSpreadPct,
    midMarketRate: Number(midMarketRate.toFixed(6)),
    customerRate: Number(customerRate.toFixed(6)),
    idealGrossReceived,
    actualGrossReceived,
    recipientFee: cleanRecipientFee,
    intermediaryFee: cleanIntermediaryFee,
    totalRecipientSideDeductions,
    netRecipientAmount,
    fxLossInRecipientCurrency,
    fxLossInSenderCurrency,
    recipientFeesInSenderCurrency,
    totalCostInSenderCurrency,
    totalSenderOutflow,
    effectiveFeePct,
    effectiveNetFxRate,
    upfrontFeeSharePct,
    fxSpreadSharePct,
    recipientFeeSharePct,
    heroText,
    recommendations,
    metadata: REFERENCE_RATE_METADATA,
  };
}

// Aliases
export const calculateRemittanceFeeCalculator = calculateRemittanceFee;
export const calculateMoneyTransferFee = calculateRemittanceFee;
export const calculateCrossBorderTransfer = calculateRemittanceFee;
