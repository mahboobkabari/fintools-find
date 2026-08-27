/**
 * Debt-to-Income (DTI) Ratio Financial Engine (Debt-Burden Analysis Engine)
 * 
 * Pure mathematical engine calculating Front-End (Housing) DTI, Back-End (Total Debt) DTI,
 * total recurring monthly debt obligations, illustrative additional EMI capacity at 36% and 43% DTI scenarios,
 * and educational debt-burden classifications.
 * 
 * Framework-decoupled, zero DOM dependency.
 */

/**
 * Sanitizes numeric input to a non-negative number.
 */
function sanitize(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.max(0, num) : defaultVal;
}

/**
 * Converts gross annual income to gross monthly income if required.
 */
export function calculateMonthlyIncome(grossMonthlyIncome = 0, grossAnnualIncome = 0) {
  const m = sanitize(grossMonthlyIncome);
  if (m > 0) return m;
  const a = sanitize(grossAnnualIncome);
  return Math.round(a / 12);
}

/**
 * Calculates total monthly housing obligations.
 */
export function calculateHousingObligations({
  mortgagePayment = 0,
  propertyTax = 0,
  homeInsurance = 0,
  hoaFees = 0,
} = {}) {
  const m = sanitize(mortgagePayment);
  const t = sanitize(propertyTax);
  const i = sanitize(homeInsurance);
  const h = sanitize(hoaFees);
  return Math.round(m + t + i + h);
}

/**
 * Calculates total monthly recurring debt obligations.
 */
export function calculateTotalMonthlyDebt({
  housingObligations = 0,
  autoLoanEmi = 0,
  personalLoanEmi = 0,
  studentLoanEmi = 0,
  creditCardMinimums = 0,
  otherRecurringDebt = 0,
} = {}) {
  const house = sanitize(housingObligations);
  const auto = sanitize(autoLoanEmi);
  const personal = sanitize(personalLoanEmi);
  const student = sanitize(studentLoanEmi);
  const cards = sanitize(creditCardMinimums);
  const other = sanitize(otherRecurringDebt);
  return Math.round(house + auto + personal + student + cards + other);
}

/**
 * Calculates Front-End (Housing) DTI ratio %.
 */
export function calculateFrontEndDti(housingObligations, grossMonthlyIncome) {
  const income = sanitize(grossMonthlyIncome);
  if (income <= 0) return 0;
  const housing = sanitize(housingObligations);
  return Number(((housing / income) * 100).toFixed(1));
}

/**
 * Calculates Back-End (Total Debt) DTI ratio %.
 */
export function calculateBackEndDti(totalMonthlyDebt, grossMonthlyIncome) {
  const income = sanitize(grossMonthlyIncome);
  if (income <= 0) return 0;
  const debt = sanitize(totalMonthlyDebt);
  return Number(((debt / income) * 100).toFixed(1));
}

/**
 * Classifies DTI ratio into educational reference debt-burden bands.
 */
export function classifyDtiForEducation(backEndDtiPercent) {
  const dti = Number(backEndDtiPercent) || 0;
  if (dti <= 36) {
    return {
      debtBurdenZone: 'Lower',
      colorClass: 'emerald',
      badgeLabel: 'Lower Modeled Debt Burden (≤ 36%)',
      description: 'Your modeled monthly debt payments represent a lower proportion of gross income. You maintain substantial financial flexibility.',
    };
  } else if (dti <= 43) {
    return {
      debtBurdenZone: 'Moderate',
      colorClass: 'blue',
      badgeLabel: 'Moderate Modeled Debt Burden (37% - 43%)',
      description: 'Your modeled debt payments represent a moderate proportion of gross income. Taking on additional major loans requires careful budget evaluation.',
    };
  } else if (dti <= 50) {
    return {
      debtBurdenZone: 'Higher',
      colorClass: 'amber',
      badgeLabel: 'Higher Modeled Debt Burden (44% - 50%)',
      description: 'Your modeled debt payments represent a higher proportion of gross income. Adding new debt commitments may significantly constrain monthly cash flow.',
    };
  } else {
    return {
      debtBurdenZone: 'Elevated',
      colorClass: 'rose',
      badgeLabel: 'Elevated Modeled Debt Burden (> 50%)',
      description: 'Over half of your gross monthly income is committed to debt payments. Focusing on debt payoff before new borrowing is strongly advised.',
    };
  }
}

/**
 * Main Debt-to-Income Ratio Calculator Engine.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.grossMonthlyIncome=0] - Gross monthly income before taxes (₹)
 * @param {number} [inputs.grossAnnualIncome=0] - Optional gross annual income (₹)
 * @param {number} [inputs.mortgagePayment=0] - Monthly home loan EMI or rent (₹)
 * @param {number} [inputs.propertyTax=0] - Monthly property tax (₹)
 * @param {number} [inputs.homeInsurance=0] - Monthly homeowners insurance (₹)
 * @param {number} [inputs.hoaFees=0] - Monthly HOA / maintenance fees (₹)
 * @param {number} [inputs.autoLoanEmi=0] - Monthly car loan EMI (₹)
 * @param {number} [inputs.personalLoanEmi=0] - Monthly personal loan EMI (₹)
 * @param {number} [inputs.studentLoanEmi=0] - Monthly education loan EMI (₹)
 * @param {number} [inputs.creditCardMinimums=0] - Monthly minimum credit card payments (₹)
 * @param {number} [inputs.otherRecurringDebt=0] - Other monthly recurring debt commitments (₹)
 * @returns {Object} Structured DTI Analysis Results
 */
export function calculateDebtToIncomeRatio({
  grossMonthlyIncome = 0,
  grossAnnualIncome = 0,
  mortgagePayment = 0,
  propertyTax = 0,
  homeInsurance = 0,
  hoaFees = 0,
  autoLoanEmi = 0,
  personalLoanEmi = 0,
  studentLoanEmi = 0,
  creditCardMinimums = 0,
  otherRecurringDebt = 0,
} = {}) {
  const monthlyIncome = calculateMonthlyIncome(grossMonthlyIncome, grossAnnualIncome);

  if (monthlyIncome <= 0) {
    return {
      isValid: false,
      validationMessage: 'Please enter a gross monthly income greater than 0.',
      grossMonthlyIncome: 0,
      housingObligations: 0,
      nonHousingDebt: 0,
      totalMonthlyDebt: 0,
      frontEndDtiPercent: 0,
      backEndDtiPercent: 0,
      classification: classifyDtiForEducation(0),
      illustrativeAdditionalEmi36Pct: 0,
      illustrativeAdditionalEmi43Pct: 0,
      breakdown: {
        housing: 0,
        auto: 0,
        personal: 0,
        student: 0,
        creditCards: 0,
        other: 0,
      },
    };
  }

  // 1. Compute Housing & Total Obligations
  const housingObligations = calculateHousingObligations({
    mortgagePayment,
    propertyTax,
    homeInsurance,
    hoaFees,
  });

  const totalMonthlyDebt = calculateTotalMonthlyDebt({
    housingObligations,
    autoLoanEmi,
    personalLoanEmi,
    studentLoanEmi,
    creditCardMinimums,
    otherRecurringDebt,
  });

  const nonHousingDebt = totalMonthlyDebt - housingObligations;

  // 2. Calculate DTI Percentages
  const frontEndDtiPercent = calculateFrontEndDti(housingObligations, monthlyIncome);
  const backEndDtiPercent = calculateBackEndDti(totalMonthlyDebt, monthlyIncome);

  // 3. Educational Reference Classification
  const classification = classifyDtiForEducation(backEndDtiPercent);

  // 4. Illustrative Additional EMI Capacity at 36% & 43% DTI Scenarios
  const scenarioDebt36 = Math.round(monthlyIncome * 0.36);
  const scenarioDebt43 = Math.round(monthlyIncome * 0.43);

  const illustrativeAdditionalEmi36Pct = Math.max(0, scenarioDebt36 - totalMonthlyDebt);
  const illustrativeAdditionalEmi43Pct = Math.max(0, scenarioDebt43 - totalMonthlyDebt);

  // 5. Debt Ratios
  const housingRatioOfDebt = totalMonthlyDebt > 0
    ? Number(((housingObligations / totalMonthlyDebt) * 100).toFixed(1))
    : 0;

  const nonHousingRatioOfDebt = totalMonthlyDebt > 0
    ? Number(((nonHousingDebt / totalMonthlyDebt) * 100).toFixed(1))
    : 0;

  return {
    isValid: true,
    validationMessage: '',
    grossMonthlyIncome: monthlyIncome,
    housingObligations,
    nonHousingDebt,
    totalMonthlyDebt,
    frontEndDtiPercent,
    backEndDtiPercent,
    classification,
    illustrativeAdditionalEmi36Pct,
    illustrativeAdditionalEmi43Pct,
    housingRatioOfDebt,
    nonHousingRatioOfDebt,
    breakdown: {
      mortgage: sanitize(mortgagePayment),
      propertyTax: sanitize(propertyTax),
      homeInsurance: sanitize(homeInsurance),
      hoaFees: sanitize(hoaFees),
      auto: sanitize(autoLoanEmi),
      personal: sanitize(personalLoanEmi),
      student: sanitize(studentLoanEmi),
      creditCards: sanitize(creditCardMinimums),
      other: sanitize(otherRecurringDebt),
    },
  };
}
