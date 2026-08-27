import { useState, useMemo } from 'preact/hooks';
import { calculateDebtToIncomeRatio } from '../../../calculators/credit/debt-to-income-ratio-calculator';
import { DEBT_TO_INCOME_RATIO_CONFIG } from '../../../calculators/configs/debt-to-income-ratio-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function DebtToIncomeRatioFlagshipWidget() {
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState(DEBT_TO_INCOME_RATIO_CONFIG.defaultInputs.grossMonthlyIncome);
  const [mortgagePayment, setMortgagePayment] = useState(DEBT_TO_INCOME_RATIO_CONFIG.defaultInputs.mortgagePayment);
  const [propertyTax, setPropertyTax] = useState(DEBT_TO_INCOME_RATIO_CONFIG.defaultInputs.propertyTax);
  const [homeInsurance, setHomeInsurance] = useState(DEBT_TO_INCOME_RATIO_CONFIG.defaultInputs.homeInsurance);
  const [hoaFees, setHoaFees] = useState(DEBT_TO_INCOME_RATIO_CONFIG.defaultInputs.hoaFees);
  const [autoLoanEmi, setAutoLoanEmi] = useState(DEBT_TO_INCOME_RATIO_CONFIG.defaultInputs.autoLoanEmi);
  const [personalLoanEmi, setPersonalLoanEmi] = useState(DEBT_TO_INCOME_RATIO_CONFIG.defaultInputs.personalLoanEmi);
  const [studentLoanEmi, setStudentLoanEmi] = useState(DEBT_TO_INCOME_RATIO_CONFIG.defaultInputs.studentLoanEmi);
  const [creditCardMinimums, setCreditCardMinimums] = useState(DEBT_TO_INCOME_RATIO_CONFIG.defaultInputs.creditCardMinimums);
  const [otherRecurringDebt, setOtherRecurringDebt] = useState(DEBT_TO_INCOME_RATIO_CONFIG.defaultInputs.otherRecurringDebt);

  // Compute DTI Ratio
  const results = useMemo(() => {
    return calculateDebtToIncomeRatio({
      grossMonthlyIncome,
      mortgagePayment,
      propertyTax,
      homeInsurance,
      hoaFees,
      autoLoanEmi,
      personalLoanEmi,
      studentLoanEmi,
      creditCardMinimums,
      otherRecurringDebt,
    });
  }, [
    grossMonthlyIncome,
    mortgagePayment,
    propertyTax,
    homeInsurance,
    hoaFees,
    autoLoanEmi,
    personalLoanEmi,
    studentLoanEmi,
    creditCardMinimums,
    otherRecurringDebt,
  ]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = DEBT_TO_INCOME_RATIO_CONFIG.scenarios[presetKey];
    if (p) {
      setGrossMonthlyIncome(p.grossMonthlyIncome);
      setMortgagePayment(p.mortgagePayment);
      setPropertyTax(p.propertyTax);
      setHomeInsurance(p.homeInsurance);
      setHoaFees(p.hoaFees);
      setAutoLoanEmi(p.autoLoanEmi);
      setPersonalLoanEmi(p.personalLoanEmi);
      setStudentLoanEmi(p.studentLoanEmi);
      setCreditCardMinimums(p.creditCardMinimums);
      setOtherRecurringDebt(p.otherRecurringDebt);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
              📊 Educational Debt-Burden Analysis Framework
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Debt-to-Income (DTI) Ratio Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Calculate your Front-End (Housing) and Back-End (Total Debt) DTI ratios to analyze how much of your gross monthly income is currently committed to debt obligations.
            </p>
          </div>

          <div class="bg-indigo-900/50 border border-indigo-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-indigo-300 font-bold block">
              Back-End (Total) DTI Ratio
            </span>
            <span class="text-4xl font-black mt-1 block font-mono text-indigo-400">
              {results.isValid ? `${results.backEndDtiPercent}%` : '—'}
            </span>
            {results.isValid && (
              <span class={`inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono ${
                results.classification.debtBurdenZone === 'Lower'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : results.classification.debtBurdenZone === 'Moderate'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : results.classification.debtBurdenZone === 'Higher'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {results.classification.badgeLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Disclosure Alert */}
      <div class="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <span class="font-bold flex items-center gap-1.5">
          ℹ️ Important Disclosure:
        </span>
        <p class="leading-relaxed">
          These are illustrative DTI scenarios, not universal affordability or loan-approval limits. Actual DTI thresholds and debt definitions vary by lender, loan product, jurisdiction, and underwriting methodology.
        </p>
      </div>

      {/* 2. Debt Profile Presets Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Illustrative Household Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(DEBT_TO_INCOME_RATIO_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-primary block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Form & Analysis Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form Sections (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Section 1: Income */}
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-primary text-xs rounded-md">Step 1</span>
              Gross Monthly Income
            </h3>
            <FormInputNumber
              id="grossMonthlyIncome"
              label="Gross Monthly Income Before Taxes (₹)"
              value={grossMonthlyIncome}
              onChange={(v) => setGrossMonthlyIncome(v)}
              min={0}
              max={DEBT_TO_INCOME_RATIO_CONFIG.fieldLimits.grossMonthlyIncome.max}
              step={DEBT_TO_INCOME_RATIO_CONFIG.fieldLimits.grossMonthlyIncome.step}
              prefix="₹"
              helpText="Total gross monthly earnings including salary, bonuses, and side income before taxes."
            />
            <p class="text-[11px] text-muted font-mono">
              Equivalent Gross Annual Income: {fmt(grossMonthlyIncome * 12)} / year
            </p>
          </div>

          {/* Section 2: Housing Debt Obligations */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 text-xs rounded-md">Step 2</span>
              Monthly Housing Obligations (Front-End DTI)
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="mortgagePayment"
                label="Home Loan EMI or Rent Payment (₹)"
                value={mortgagePayment}
                onChange={(v) => setMortgagePayment(v)}
                min={0}
                max={5000000}
                step={1000}
                prefix="₹"
                helpText="Monthly mortgage principal + interest or house rent."
              />

              <FormInputNumber
                id="propertyTax"
                label="Monthly Property Tax (₹)"
                value={propertyTax}
                onChange={(v) => setPropertyTax(v)}
                min={0}
                max={500000}
                step={500}
                prefix="₹"
                helpText="Pro-rated monthly property tax."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="homeInsurance"
                label="Monthly Home / Renters Insurance (₹)"
                value={homeInsurance}
                onChange={(v) => setHomeInsurance(v)}
                min={0}
                max={500000}
                step={250}
                prefix="₹"
                helpText="Pro-rated monthly property insurance premium."
              />

              <FormInputNumber
                id="hoaFees"
                label="Monthly HOA / Maintenance Fees (₹)"
                value={hoaFees}
                onChange={(v) => setHoaFees(v)}
                min={0}
                max={200000}
                step={250}
                prefix="₹"
                helpText="Monthly society or maintenance charges."
              />
            </div>
          </div>

          {/* Section 3: Non-Housing Recurring Debt Obligations */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-600 text-xs rounded-md">Step 3</span>
              Other Recurring Monthly Debt Obligations
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="autoLoanEmi"
                label="Car / Vehicle Loan EMI (₹)"
                value={autoLoanEmi}
                onChange={(v) => setAutoLoanEmi(v)}
                min={0}
                max={1000000}
                step={500}
                prefix="₹"
                helpText="Monthly vehicle loan payment."
              />

              <FormInputNumber
                id="personalLoanEmi"
                label="Personal Loan EMI (₹)"
                value={personalLoanEmi}
                onChange={(v) => setPersonalLoanEmi(v)}
                min={0}
                max={1000000}
                step={500}
                prefix="₹"
                helpText="Unsecured personal loan payments."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="studentLoanEmi"
                label="Education Loan EMI (₹)"
                value={studentLoanEmi}
                onChange={(v) => setStudentLoanEmi(v)}
                min={0}
                max={1000000}
                step={500}
                prefix="₹"
                helpText="Monthly student loan payment."
              />

              <FormInputNumber
                id="creditCardMinimums"
                label="Credit Card Minimum Payments (₹)"
                value={creditCardMinimums}
                onChange={(v) => setCreditCardMinimums(v)}
                min={0}
                max={1000000}
                step={500}
                prefix="₹"
                helpText="Total minimum monthly credit card obligations."
              />
            </div>

            <FormInputNumber
              id="otherRecurringDebt"
              label="Other Recurring Monthly Commitments (₹)"
              value={otherRecurringDebt}
              onChange={(v) => setOtherRecurringDebt(v)}
              min={0}
              max={1000000}
              step={500}
              prefix="₹"
              helpText="Alimony, child support, or other mandatory debt commitments."
            />
          </div>
        </div>

        {/* Right Column: DTI Breakdown, Risk Gauge, and Insights (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {!results.isValid ? (
            <div class="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-2xl text-center space-y-2">
              <span class="text-2xl">⚠️</span>
              <h4 class="font-bold text-rose-700 dark:text-rose-300 text-sm">Valid Income Required</h4>
              <p class="text-xs text-rose-600 dark:text-rose-400">{results.validationMessage}</p>
            </div>
          ) : (
            <>
              {/* Component Breakdown Panel */}
              <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
                <h3 class="text-sm font-bold uppercase tracking-wider text-muted">
                  Debt-to-Income Breakdown
                </h3>

                {/* Back-End DTI Main Card */}
                <div class="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/40 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-indigo-900 dark:text-indigo-300">Back-End (Total) DTI Ratio</span>
                    <span class="text-base font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                      {results.backEndDtiPercent}%
                    </span>
                  </div>
                  <p class="text-[11px] text-indigo-700/80 dark:text-indigo-400 leading-relaxed">
                    Total Monthly Debt: {fmt(results.totalMonthlyDebt)} out of {fmt(results.grossMonthlyIncome)} Gross Income.
                  </p>
                </div>

                {/* Front-End DTI Card */}
                <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-ink">Front-End (Housing) DTI Ratio</span>
                    <span class="text-sm font-mono font-extrabold text-blue-600 dark:text-blue-400">
                      {results.frontEndDtiPercent}%
                    </span>
                  </div>
                  <p class="text-[11px] text-muted leading-relaxed">
                    Housing Obligations: {fmt(results.housingObligations)} per month.
                  </p>
                </div>

                {/* Illustrative Additional EMI Scenarios */}
                <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-2">
                  <span class="text-xs font-bold text-muted uppercase tracking-wider block">
                    Illustrative Scenario Benchmarks
                  </span>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-muted">Illustrative Additional EMI at 36% DTI:</span>
                    <span class="font-mono font-bold text-emerald-600">{fmt(results.illustrativeAdditionalEmi36Pct)} / mo</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-muted">Illustrative Additional EMI at 43% DTI:</span>
                    <span class="font-mono font-bold text-blue-600">{fmt(results.illustrativeAdditionalEmi43Pct)} / mo</span>
                  </div>
                </div>

                {/* DTI Gauge Indicator Bar */}
                <div class="pt-2 space-y-2">
                  <div class="flex items-center justify-between text-xs font-mono text-muted">
                    <span>0%</span>
                    <span class="text-emerald-600 font-bold">36% Benchmark</span>
                    <span class="text-blue-600 font-bold">43% Benchmark</span>
                    <span>100%+</span>
                  </div>
                  <div class="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex relative">
                    <div
                      class={`h-full transition-all duration-500 ${
                        results.backEndDtiPercent <= 36
                          ? 'bg-emerald-500'
                          : results.backEndDtiPercent <= 43
                          ? 'bg-blue-500'
                          : results.backEndDtiPercent <= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, results.backEndDtiPercent)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Insight Card */}
              <div class="p-5 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl space-y-2">
                <span class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  💡 Educational Debt Analysis
                </span>
                <p class="text-xs text-ink leading-relaxed">
                  Your modeled monthly debt payments of {fmt(results.totalMonthlyDebt)} represent {results.backEndDtiPercent}% of gross monthly income. {results.classification.description}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Share Actions & Financial Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Debt-to-Income (DTI) Ratio Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational financial planning model. DTI ratios and reference bands are informational estimates; actual credit underwriting policies, debt definitions, and loan approval decisions vary by individual bank and lending institution.
        </p>
      </div>
    </div>
  );
}
