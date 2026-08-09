/**
 * Debt Snowball vs Debt Avalanche Financial Decision Engine
 * 
 * Pure mathematical calculation engine for multi-debt repayment simulation.
 * Compares Debt Snowball (lowest balance first), Debt Avalanche (highest interest rate first),
 * and Minimum Payments Only baseline.
 * 
 * Strictly decoupled from presentation layer & framework components.
 */

/**
 * Sanitizes input debt item array.
 * Max 10 debts supported.
 */
export function sanitizeDebts(debts = []) {
  if (!Array.isArray(debts)) return [];

  return debts
    .slice(0, 10)
    .map((d, index) => ({
      id: d.id || `debt_${index + 1}`,
      name: (d.name || `Debt ${index + 1}`).trim(),
      balance: Math.max(0, Number(d.balance) || 0),
      annualRate: Math.max(0, Number(d.annualRate) || 0),
      minPayment: Math.max(0, Number(d.minPayment) || 0),
    }))
    .filter((d) => d.balance > 0);
}

/**
 * Determines target priority order for applying extra payments.
 * 
 * @param {Array} debtList - Active non-zero balance debts
 * @param {'snowball' | 'avalanche'} strategy 
 * @returns {Array<string>} Array of debt IDs in priority order
 */
export function getPriorityOrder(debtList, strategy) {
  const sorted = [...debtList];

  if (strategy === 'snowball') {
    // Lowest balance first; tie-breaker: highest APR
    sorted.sort((a, b) => a.balance - b.balance || b.annualRate - a.annualRate);
  } else if (strategy === 'avalanche') {
    // Highest APR first; tie-breaker: lowest balance
    sorted.sort((a, b) => b.annualRate - a.annualRate || a.balance - b.balance);
  }

  return sorted.map((d) => d.id);
}

/**
 * Simulates multi-debt repayment under a specific strategy.
 * 
 * @param {Array} rawDebts - List of debt objects
 * @param {number} extraMonthlyPayment - Additional monthly payment budget
 * @param {'snowball' | 'avalanche' | 'minimum_only'} strategy 
 * @returns {Object} Strategy payoff result
 */
export function simulatePayoffStrategy(rawDebts, extraMonthlyPayment = 0, strategy = 'snowball') {
  const activeDebts = sanitizeDebts(rawDebts);
  const extraPayment = Math.max(0, Number(extraMonthlyPayment) || 0);

  if (activeDebts.length === 0) {
    return {
      strategy,
      totalMonths: 0,
      estimatedDebtFreeYears: 0,
      totalPrincipalPaid: 0,
      totalInterestPaid: 0,
      totalAmountPaid: 0,
      payoffOrder: [],
      individualDebts: [],
      monthlySchedule: [],
      isImpossible: false,
    };
  }

  const initialTotalPrincipal = activeDebts.reduce((sum, d) => sum + d.balance, 0);

  // Initialize tracking states for each debt
  let debtStates = activeDebts.map((d) => ({
    id: d.id,
    name: d.name,
    startBalance: d.balance,
    balance: d.balance,
    annualRate: d.annualRate,
    minPayment: d.minPayment,
    payoffMonth: null,
    totalInterestPaid: 0,
    totalPaid: 0,
  }));

  const maxSafetyMonths = 600; // 50 years max safety limit
  let month = 0;
  const monthlySchedule = [];
  const payoffOrder = [];
  let isImpossible = false;

  while (debtStates.some((d) => d.balance > 0) && month < maxSafetyMonths) {
    month++;
    let extraPool = strategy === 'minimum_only' ? 0 : extraPayment;

    // Phase 1: Accrue interest and pay required minimum payments for all active debts
    let monthInterestAccrued = 0;
    let monthTotalPaid = 0;

    // Collect rollover minimum payments from debts paid off in PRIOR months
    if (strategy !== 'minimum_only') {
      for (const d of debtStates) {
        if (d.payoffMonth !== null && d.payoffMonth < month) {
          extraPool += d.minPayment;
        }
      }
    }

    // Process minimum payments and interest
    for (const d of debtStates) {
      if (d.balance <= 0) continue;

      const monthlyRate = d.annualRate / 1200;
      const interestForMonth = d.balance * monthlyRate;

      // Check if minimum payment is less than interest accrued (infinite growth check)
      d.balance += interestForMonth;
      d.totalInterestPaid += interestForMonth;
      monthInterestAccrued += interestForMonth;

      const minPay = Math.min(d.balance, d.minPayment);
      d.balance -= minPay;
      d.totalPaid += minPay;
      monthTotalPaid += minPay;

      if (d.balance <= 0) {
        d.balance = 0;
        d.payoffMonth = month;
        payoffOrder.push({ id: d.id, name: d.name, month, annualRate: d.annualRate, startBalance: d.startBalance });
        // Rollover unused min payment portion if payoff min payment was smaller than minPayment
        if (minPay < d.minPayment && strategy !== 'minimum_only') {
          extraPool += (d.minPayment - minPay);
        }
      }
    }

    // Phase 2: Apply extraPool to target debts according to strategy priority
    if (strategy !== 'minimum_only' && extraPool > 0) {
      const activePriorityOrder = getPriorityOrder(
        debtStates.filter((d) => d.balance > 0),
        strategy
      );

      for (const targetId of activePriorityOrder) {
        if (extraPool <= 0) break;
        const targetDebt = debtStates.find((d) => d.id === targetId && d.balance > 0);
        if (!targetDebt) continue;

        const extraPay = Math.min(targetDebt.balance, extraPool);
        targetDebt.balance -= extraPay;
        targetDebt.totalPaid += extraPay;
        monthTotalPaid += extraPay;
        extraPool -= extraPay;

        if (targetDebt.balance <= 0) {
          targetDebt.balance = 0;
          targetDebt.payoffMonth = month;
          payoffOrder.push({
            id: targetDebt.id,
            name: targetDebt.name,
            month,
            annualRate: targetDebt.annualRate,
            startBalance: targetDebt.startBalance,
          });
        }
      }
    }

    // Snapshot monthly schedule record
    const debtBalancesSnapshot = {};
    debtStates.forEach((d) => {
      debtBalancesSnapshot[d.id] = Math.round(d.balance);
    });

    const totalRemaining = debtStates.reduce((sum, d) => sum + d.balance, 0);

    monthlySchedule.push({
      month,
      totalBalanceRemaining: Math.round(totalRemaining),
      totalInterestPaidThisMonth: Math.round(monthInterestAccrued),
      totalPaidThisMonth: Math.round(monthTotalPaid),
      debtBalances: debtBalancesSnapshot,
    });
  }

  // Safety check for impossible repayment (debt exceeds max safety months)
  if (month >= maxSafetyMonths && debtStates.some((d) => d.balance > 0)) {
    isImpossible = true;
  }

  const totalInterestPaid = Math.round(debtStates.reduce((sum, d) => sum + d.totalInterestPaid, 0));
  const totalAmountPaid = Math.round(initialTotalPrincipal + totalInterestPaid);

  return {
    strategy,
    totalMonths: month,
    estimatedDebtFreeYears: Number((month / 12).toFixed(1)),
    totalPrincipalPaid: Math.round(initialTotalPrincipal),
    totalInterestPaid,
    totalAmountPaid,
    payoffOrder,
    individualDebts: debtStates.map((d) => ({
      id: d.id,
      name: d.name,
      startBalance: Math.round(d.startBalance),
      annualRate: d.annualRate,
      minPayment: Math.round(d.minPayment),
      payoffMonth: d.payoffMonth || month,
      totalInterestPaid: Math.round(d.totalInterestPaid),
      totalPaid: Math.round(d.totalPaid),
    })),
    monthlySchedule,
    isImpossible,
  };
}

/**
 * Main Multi-Debt Calculation Function
 * 
 * Computes Snowball, Avalanche, and Minimum Payments Only strategies,
 * and generates comparative savings metrics.
 * 
 * @param {Array} debts - Array of debt objects
 * @param {number} extraMonthlyPayment - Additional monthly payment budget
 * @returns {Object} Comprehensive multi-strategy debt comparison
 */
export function calculateDebtPayoff(debts = [], extraMonthlyPayment = 0) {
  const sanitized = sanitizeDebts(debts);
  const extraPay = Math.max(0, Number(extraMonthlyPayment) || 0);

  const snowball = simulatePayoffStrategy(sanitized, extraPay, 'snowball');
  const avalanche = simulatePayoffStrategy(sanitized, extraPay, 'avalanche');
  const minimumOnly = simulatePayoffStrategy(sanitized, 0, 'minimum_only');

  // Comparative Savings Metrics
  const avalancheInterestSaved = Math.max(0, minimumOnly.totalInterestPaid - avalanche.totalInterestPaid);
  const avalancheMonthsSaved = Math.max(0, minimumOnly.totalMonths - avalanche.totalMonths);

  const snowballInterestSaved = Math.max(0, minimumOnly.totalInterestPaid - snowball.totalInterestPaid);
  const snowballMonthsSaved = Math.max(0, minimumOnly.totalMonths - snowball.totalMonths);

  const snowballVsAvalancheInterestDiff = snowball.totalInterestPaid - avalanche.totalInterestPaid;
  const snowballVsAvalancheMonthsDiff = snowball.totalMonths - avalanche.totalMonths;

  let fastestStrategy = 'equal';
  if (avalanche.totalMonths < snowball.totalMonths) fastestStrategy = 'avalanche';
  else if (snowball.totalMonths < avalanche.totalMonths) fastestStrategy = 'snowball';

  let cheapestStrategy = 'equal';
  if (avalanche.totalInterestPaid < snowball.totalInterestPaid) cheapestStrategy = 'avalanche';
  else if (snowball.totalInterestPaid < avalanche.totalInterestPaid) cheapestStrategy = 'snowball';

  return {
    debtsCount: sanitized.length,
    totalInitialDebt: sanitized.reduce((sum, d) => sum + d.balance, 0),
    totalMinimumMonthlyPayment: sanitized.reduce((sum, d) => sum + d.minPayment, 0),
    extraMonthlyPayment: extraPay,
    totalMonthlyPaymentBudget: sanitized.reduce((sum, d) => sum + d.minPayment, 0) + extraPay,
    snowball,
    avalanche,
    minimumOnly,
    comparison: {
      snowballVsAvalancheInterestDiff: Math.round(snowballVsAvalancheInterestDiff),
      snowballVsAvalancheMonthsDiff,
      fastestStrategy,
      cheapestStrategy,
      avalancheInterestSaved: Math.round(avalancheInterestSaved),
      avalancheMonthsSaved,
      snowballInterestSaved: Math.round(snowballInterestSaved),
      snowballMonthsSaved,
    },
  };
}
