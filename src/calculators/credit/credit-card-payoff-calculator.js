/**
 * Credit Card Payoff & Debt Avalanche Financial Engine
 * 
 * Pure financial engine for calculating credit card debt payoff horizons,
 * comparing Minimum Payment Trap, Fixed Monthly Payment, Debt Avalanche (highest APR),
 * and Debt Snowball (lowest balance).
 * 
 * FINANCIAL METHODOLOGY RULES:
 * 1. User-entered minimum payments per card ALWAYS override illustrative default formulas.
 * 2. If no user value is supplied, an illustrative default is computed and explicitly marked.
 * 3. Negative amortization safety checks trigger warnings when monthly payment <= monthly interest.
 * 4. 0% APR promotional rates are supported with zero interest calculations.
 */

/**
 * Calculates an illustrative default minimum payment when user input is omitted.
 * Formula: MAX(Floor, MAX(5% of Balance, Interest + 1% Balance))
 */
export function calculateIllustrativeMinimumPayment(balance, aprPercent = 0, floor = 500) {
  const numBalance = Math.max(0, Number(balance) || 0);
  if (numBalance === 0) return 0;

  const numApr = Math.max(0, Number(aprPercent) || 0);
  const monthlyRate = numApr / 1200;
  const monthlyInterest = numBalance * monthlyRate;

  const percentMethod = numBalance * 0.05;
  const interestPlusPrincipalMethod = monthlyInterest + (numBalance * 0.01);
  const calculatedMin = Math.max(percentMethod, interestPlusPrincipalMethod);

  return Math.round(Math.max(floor, calculatedMin));
}

/**
 * Resolves effective minimum payment for a card, preserving user-entered minimum over illustrative default.
 */
export function resolveCardMinimumPayment(card) {
  const balance = Math.max(0, Number(card.balance) || 0);
  const aprPercent = Math.max(0, Number(card.aprPercent) || 0);
  const userMin = card.minPayment !== undefined && card.minPayment !== null && card.minPayment !== ''
    ? Number(card.minPayment)
    : NaN;

  if (!isNaN(userMin) && userMin > 0) {
    return {
      minPayment: userMin,
      isIllustrativeDefault: false,
      label: 'User-Specified Minimum Payment',
    };
  }

  const illustrativeMin = calculateIllustrativeMinimumPayment(balance, aprPercent);
  return {
    minPayment: illustrativeMin,
    isIllustrativeDefault: true,
    label: 'Illustrative Default Assumption',
  };
}

/**
 * Calculates single card payoff schedule and metrics for a target monthly payment.
 */
export function calculateSingleCardPayoff(params = {}) {
  const balance = Math.max(0, Number(params.balance) || 0);
  const aprPercent = Math.max(0, Number(params.aprPercent) || 0);
  
  if (balance === 0) {
    return {
      isValid: true,
      balance: 0,
      months: 0,
      totalInterestPaid: 0,
      totalAmountPaid: 0,
      schedule: [],
    };
  }

  const minInfo = resolveCardMinimumPayment({ balance, aprPercent, minPayment: params.minPayment });
  const payment = Number(params.targetMonthlyPayment) || minInfo.minPayment;

  const monthlyRate = aprPercent / 1200;
  const monthlyInterest = balance * monthlyRate;

  // Negative Amortization Check
  if (monthlyRate > 0 && payment <= monthlyInterest) {
    return {
      isValid: false,
      isNegativeAmortization: true,
      balance,
      aprPercent,
      monthlyInterest,
      payment,
      minPayment: minInfo.minPayment,
      isIllustrativeDefault: minInfo.isIllustrativeDefault,
      validationMessage: `Monthly payment of ₹${payment} is less than or equal to accrued monthly interest of ₹${Math.round(monthlyInterest)}. The debt balance will grow indefinitely or never be paid off.`,
    };
  }

  let currentBalance = balance;
  let totalInterestPaid = 0;
  let months = 0;
  const schedule = [];
  const MAX_MONTHS = 600; // 50 years cap

  while (currentBalance > 0.01 && months < MAX_MONTHS) {
    months++;
    const interestAccrued = currentBalance * monthlyRate;
    totalInterestPaid += interestAccrued;
    
    let actualPayment = payment;
    const totalDue = currentBalance + interestAccrued;
    if (actualPayment > totalDue) {
      actualPayment = totalDue;
    }

    const principalPaid = actualPayment - interestAccrued;
    currentBalance = Math.max(0, currentBalance - principalPaid);

    schedule.push({
      month: months,
      startingBalance: Math.round(currentBalance + principalPaid),
      interestAccrued: Math.round(interestAccrued),
      payment: Math.round(actualPayment),
      principalPaid: Math.round(principalPaid),
      endingBalance: Math.round(currentBalance),
    });
  }

  const totalAmountPaid = balance + totalInterestPaid;

  return {
    isValid: true,
    isNegativeAmortization: false,
    balance: Math.round(balance),
    aprPercent,
    targetMonthlyPayment: Math.round(payment),
    minPayment: Math.round(minInfo.minPayment),
    isIllustrativeDefault: minInfo.isIllustrativeDefault,
    months,
    totalInterestPaid: Math.round(totalInterestPaid),
    totalAmountPaid: Math.round(totalAmountPaid),
    schedule,
  };
}

/**
 * Simulates multi-card payoff using a specified sorting strategy ('avalanche' or 'snowball').
 */
export function simulateMultiCardPayoff(cards = [], monthlyPayoffBudget = 0, strategy = 'avalanche') {
  if (!Array.isArray(cards) || cards.length === 0) {
    return {
      isValid: false,
      validationMessage: 'At least one credit card is required for multi-card payoff strategy.',
    };
  }

  // Sanitize and resolve minimum payments
  const activeCards = cards
    .map((c, index) => {
      const balance = Math.max(0, Number(c.balance) || 0);
      const aprPercent = Math.max(0, Number(c.aprPercent) || 0);
      const minInfo = resolveCardMinimumPayment(c);
      return {
        id: c.id || `card_${index + 1}`,
        name: c.name || `Card ${index + 1}`,
        initialBalance: balance,
        currentBalance: balance,
        aprPercent,
        minPayment: minInfo.minPayment,
        isIllustrativeDefault: minInfo.isIllustrativeDefault,
        totalInterestPaid: 0,
      };
    })
    .filter((c) => c.initialBalance > 0);

  if (activeCards.length === 0) {
    return {
      isValid: true,
      months: 0,
      totalInterestPaid: 0,
      totalAmountPaid: 0,
      schedule: [],
      cards: [],
    };
  }

  const totalMinPayments = activeCards.reduce((sum, c) => sum + c.minPayment, 0);
  const budget = Number(monthlyPayoffBudget) || totalMinPayments;

  if (budget < totalMinPayments) {
    return {
      isValid: false,
      validationMessage: `Total monthly budget (₹${budget}) is less than the required minimum payments (₹${totalMinPayments}) across all cards.`,
    };
  }

  // Sort cards according to strategy
  const sortedCards = [...activeCards];
  if (strategy === 'avalanche') {
    // Highest APR first; tie-breaker: highest balance
    sortedCards.sort((a, b) => b.aprPercent - a.aprPercent || b.currentBalance - a.currentBalance);
  } else {
    // Lowest balance first (Debt Snowball); tie-breaker: highest APR
    sortedCards.sort((a, b) => a.currentBalance - b.currentBalance || b.aprPercent - a.aprPercent);
  }

  let months = 0;
  let totalInterestPaid = 0;
  const schedule = [];
  const MAX_MONTHS = 600;

  while (sortedCards.some((c) => c.currentBalance > 0.01) && months < MAX_MONTHS) {
    months++;
    let monthlyBudgetRemaining = budget;
    let monthlyInterestTotal = 0;

    // Step 1: Accrue monthly interest for all active cards
    sortedCards.forEach((card) => {
      if (card.currentBalance > 0.01) {
        const monthlyRate = card.aprPercent / 1200;
        const interest = card.currentBalance * monthlyRate;
        card.currentBalance += interest;
        card.totalInterestPaid += interest;
        totalInterestPaid += interest;
        monthlyInterestTotal += interest;
      }
    });

    // Step 2: Pay minimum required on each active card
    sortedCards.forEach((card) => {
      if (card.currentBalance > 0.01 && monthlyBudgetRemaining > 0) {
        const minReq = Math.min(card.minPayment, card.currentBalance);
        const payment = Math.min(minReq, monthlyBudgetRemaining);
        card.currentBalance -= payment;
        monthlyBudgetRemaining -= payment;
      }
    });

    // Step 3: Direct remaining extra budget to the top target active card
    if (monthlyBudgetRemaining > 0) {
      for (const card of sortedCards) {
        if (card.currentBalance > 0.01) {
          const extraPayment = Math.min(card.currentBalance, monthlyBudgetRemaining);
          card.currentBalance -= extraPayment;
          monthlyBudgetRemaining -= extraPayment;
          if (monthlyBudgetRemaining <= 0.01) break;
        }
      }
    }

    schedule.push({
      month: months,
      monthlyInterestTotal: Math.round(monthlyInterestTotal),
      totalRemainingBalance: Math.round(sortedCards.reduce((s, c) => s + c.currentBalance, 0)),
    });
  }

  const initialTotalBalance = activeCards.reduce((s, c) => s + c.initialBalance, 0);

  return {
    isValid: true,
    strategy,
    months,
    initialTotalBalance: Math.round(initialTotalBalance),
    totalInterestPaid: Math.round(totalInterestPaid),
    totalAmountPaid: Math.round(initialTotalBalance + totalInterestPaid),
    monthlyPayoffBudget: Math.round(budget),
    totalMinPayments: Math.round(totalMinPayments),
    cards: sortedCards.map((c) => ({
      id: c.id,
      name: c.name,
      initialBalance: Math.round(c.initialBalance),
      aprPercent: c.aprPercent,
      minPayment: Math.round(c.minPayment),
      isIllustrativeDefault: c.isIllustrativeDefault,
      totalInterestPaid: Math.round(c.totalInterestPaid),
    })),
    schedule,
  };
}

/**
 * Main integration function for Credit Card Payoff & Debt Avalanche Calculator.
 */
export function calculateCreditCardPayoff(inputs = {}) {
  const mode = inputs.mode || 'single';

  if (mode === 'single') {
    const singleRes = calculateSingleCardPayoff({
      balance: inputs.singleBalance,
      aprPercent: inputs.singleAprPercent,
      minPayment: inputs.singleMinPayment,
      targetMonthlyPayment: inputs.singleTargetPayment,
    });
    return {
      mode: 'single',
      ...singleRes,
    };
  }

  // Multi-card strategy mode
  const cards = inputs.cards || [];
  const budget = Number(inputs.monthlyPayoffBudget) || 0;

  const avalanche = simulateMultiCardPayoff(cards, budget, 'avalanche');
  const snowball = simulateMultiCardPayoff(cards, budget, 'snowball');

  if (!avalanche.isValid) {
    return {
      mode: 'multi',
      isValid: false,
      validationMessage: avalanche.validationMessage,
    };
  }

  const interestSavedVsSnowball = Math.max(0, snowball.totalInterestPaid - avalanche.totalInterestPaid);
  const monthsSavedVsSnowball = Math.max(0, snowball.months - avalanche.months);

  return {
    mode: 'multi',
    isValid: true,
    avalanche,
    snowball,
    interestSavedVsSnowball,
    monthsSavedVsSnowball,
    initialTotalBalance: avalanche.initialTotalBalance,
    monthlyPayoffBudget: avalanche.monthlyPayoffBudget,
    totalMinPayments: avalanche.totalMinPayments,
  };
}
