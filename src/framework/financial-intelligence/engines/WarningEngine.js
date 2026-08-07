import { createWarningContract } from '../contracts/index.js';

export function processWarnings(normalizedData, customData = {}) {
  const warnings = [];

  // Longevity Exhaustion Warning
  if (normalizedData.risk.isExhaustedEarly) {
    const age = normalizedData.risk.longevityExhaustionAge;
    warnings.push(
      createWarningContract({
        id: 'warn-longevity',
        level: 'danger',
        title: 'Longevity Risk Warning',
        message: `At your current savings rate, your retirement corpus is projected to run out around age ${age}.`,
        actionText: 'Increase monthly SIP or delay retirement by 2-3 years.',
        severity: 'danger',
      })
    );
  }

  // FOIR Debt Stress Warning
  if (normalizedData.risk.foirPct > 50) {
    warnings.push(
      createWarningContract({
        id: 'warn-foir',
        level: 'warning',
        title: 'High FOIR Debt Stress Warning',
        message: `Fixed Monthly Debt Obligation is ${normalizedData.risk.foirPct}% of your monthly net income (Recommended: ≤ 40%).`,
        actionText: 'Increase down payment or extend tenure to reduce monthly EMI.',
        severity: 'warning',
      })
    );
  }

  return warnings;
}
