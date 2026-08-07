import { createInsightContract } from '../contracts/index.js';

export function processInsights(normalizedData, customData = {}) {
  const customInsights = customData.insights || customData.structuredInsights || [];
  if (customInsights.length > 0) {
    return customInsights.map((ins, idx) =>
      createInsightContract({
        id: ins.id || `insight-${idx}`,
        label: ins.label || ins.title || '',
        value: ins.value || '',
        labelColor: ins.labelColor || 'text-primary',
        valueColor: ins.valueColor || ins.labelColor || 'text-primary',
        desc: ins.desc || ins.description || '',
      })
    );
  }

  const defaultList = [];
  if (normalizedData.tax.effectiveTaxRatePct > 0) {
    defaultList.push(
      createInsightContract({
        id: 'ins-tax-rate',
        label: 'Effective Tax Rate',
        value: `${normalizedData.tax.effectiveTaxRatePct}%`,
        labelColor: 'text-primary',
        desc: 'Net proportion of gross salary paid in income tax.',
      })
    );
  }

  if (normalizedData.futureValue > 0) {
    defaultList.push(
      createInsightContract({
        id: 'ins-wealth',
        label: 'Projected Wealth Gain',
        value: `₹${Math.round(normalizedData.wealthGain).toLocaleString('en-IN')}`,
        labelColor: 'text-semantic-success',
        desc: 'Estimated compounding growth over investment period.',
      })
    );
  }

  return defaultList;
}
