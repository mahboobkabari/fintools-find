import { useState, useMemo } from 'preact/hooks';
import { calculateLifeInsuranceNeeds } from '../../../calculators/insurance/life-insurance-needs-calculator';
import { LIFE_INSURANCE_NEEDS_CONFIG } from '../../../calculators/configs/life-insurance-needs-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function LifeInsuranceNeedsFlagshipWidget() {
  const [age, setAge] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.age);
  const [annualIncome, setAnnualIncome] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.annualIncome);
  const [replacementPeriodYears, setReplacementPeriodYears] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.replacementPeriodYears);
  const [mortgageBalance, setMortgageBalance] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.mortgageBalance);
  const [otherDebts, setOtherDebts] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.otherDebts);
  const [finalExpenses, setFinalExpenses] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.finalExpenses);
  const [educationGoals, setEducationGoals] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.educationGoals);
  const [otherFutureGoals, setOtherFutureGoals] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.otherFutureGoals);
  const [existingLifeInsurance, setExistingLifeInsurance] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.existingLifeInsurance);
  const [savingsAndCash, setSavingsAndCash] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.savingsAndCash);
  const [investments, setInvestments] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.investments);
  const [otherResources, setOtherResources] = useState(LIFE_INSURANCE_NEEDS_CONFIG.defaultInputs.otherResources);

  // Scenario Assumptions
  const [annualIncomeGrowthRate, setAnnualIncomeGrowthRate] = useState(0.05);
  const [discountRate, setDiscountRate] = useState(0.06);

  // Compute Needs Analysis
  const results = useMemo(() => {
    return calculateLifeInsuranceNeeds({
      age,
      annualIncome,
      replacementPeriodYears,
      mortgageBalance,
      otherDebts,
      finalExpenses,
      educationGoals,
      otherFutureGoals,
      existingLifeInsurance,
      savingsAndCash,
      investments,
      otherResources,
      annualIncomeGrowthRate,
      discountRate,
    });
  }, [
    age,
    annualIncome,
    replacementPeriodYears,
    mortgageBalance,
    otherDebts,
    finalExpenses,
    educationGoals,
    otherFutureGoals,
    existingLifeInsurance,
    savingsAndCash,
    investments,
    otherResources,
    annualIncomeGrowthRate,
    discountRate,
  ]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = LIFE_INSURANCE_NEEDS_CONFIG.scenarios[presetKey];
    if (p) {
      setAge(p.age);
      setAnnualIncome(p.annualIncome);
      setReplacementPeriodYears(p.replacementPeriodYears);
      setMortgageBalance(p.mortgageBalance);
      setOtherDebts(p.otherDebts);
      setFinalExpenses(p.finalExpenses);
      setEducationGoals(p.educationGoals);
      setOtherFutureGoals(p.otherFutureGoals);
      setExistingLifeInsurance(p.existingLifeInsurance);
      setSavingsAndCash(p.savingsAndCash);
      setInvestments(p.investments);
      setOtherResources(p.otherResources);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
              🛡️ DIME & Human Life Value Protection Engine
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Term Life Insurance Needs Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Calculate your family's estimated additional term life coverage need by analyzing debt obligations, income replacement, future milestone goals, and existing financial resources.
            </p>
          </div>

          <div class="bg-blue-900/50 border border-blue-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Estimated Additional Coverage
            </span>
            <span class={`text-3xl sm:text-4xl font-black mt-1 block font-mono ${results.isFullyCovered ? 'text-emerald-400' : 'text-blue-400'}`}>
              {fmt(results.estimatedAdditionalCoverage)}
            </span>
            <span class="text-xs text-blue-200 mt-1 block font-mono">
              {results.isFullyCovered ? '✓ Fully Covered by Existing Resources' : `Total Need: ${fmt(results.totalGrossNeed)}`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Family Presets Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Illustrative Profile Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(LIFE_INSURANCE_NEEDS_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left group"
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
          {/* Step 1: Household Profile */}
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-primary text-xs rounded-md">Step 1</span>
              Household & Income Profile
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="age"
                label="Age of Primary Earner (Years)"
                value={age}
                onChange={(v) => setAge(v)}
                min={LIFE_INSURANCE_NEEDS_CONFIG.fieldLimits.age.min}
                max={LIFE_INSURANCE_NEEDS_CONFIG.fieldLimits.age.max}
                step={1}
                helpText="Target age for coverage estimation (18–75)."
              />

              <FormInputNumber
                id="annualIncome"
                label="Annual Take-Home Income (₹)"
                value={annualIncome}
                onChange={(v) => setAnnualIncome(v)}
                min={LIFE_INSURANCE_NEEDS_CONFIG.fieldLimits.annualIncome.min}
                max={LIFE_INSURANCE_NEEDS_CONFIG.fieldLimits.annualIncome.max}
                step={LIFE_INSURANCE_NEEDS_CONFIG.fieldLimits.annualIncome.step}
                prefix="₹"
                helpText="Current net annual family income."
              />
            </div>

            <FormInputNumber
              id="replacementPeriodYears"
              label="Income Replacement Period (Years)"
              value={replacementPeriodYears}
              onChange={(v) => setReplacementPeriodYears(v)}
              min={LIFE_INSURANCE_NEEDS_CONFIG.fieldLimits.replacementPeriodYears.min}
              max={LIFE_INSURANCE_NEEDS_CONFIG.fieldLimits.replacementPeriodYears.max}
              step={1}
              helpText="Number of years your family requires income continuity (e.g., until children graduate)."
            />
          </div>

          {/* Step 2: Financial Obligations */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-600 text-xs rounded-md">Step 2</span>
              Financial Obligations & Debts
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="mortgageBalance"
                label="Outstanding Mortgage / Home Loan (₹)"
                value={mortgageBalance}
                onChange={(v) => setMortgageBalance(v)}
                min={0}
                max={100000000}
                step={50000}
                prefix="₹"
                helpText="Home loan balance to be paid off."
              />

              <FormInputNumber
                id="otherDebts"
                label="Other Debt Obligations (₹)"
                value={otherDebts}
                onChange={(v) => setOtherDebts(v)}
                min={0}
                max={50000000}
                step={25000}
                prefix="₹"
                helpText="Personal loans, car loans, credit cards."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="educationGoals"
                label="Children Education Fund (₹)"
                value={educationGoals}
                onChange={(v) => setEducationGoals(v)}
                min={0}
                max={50000000}
                step={100000}
                prefix="₹"
                helpText="Future higher education reserve."
              />

              <FormInputNumber
                id="otherFutureGoals"
                label="Other Milestone Goals (₹)"
                value={otherFutureGoals}
                onChange={(v) => setOtherFutureGoals(v)}
                min={0}
                max={50000000}
                step={100000}
                prefix="₹"
                helpText="Family marriage or critical reserves."
              />
            </div>

            <FormInputNumber
              id="finalExpenses"
              label="Estimated Final & Administrative Expenses (₹)"
              value={finalExpenses}
              onChange={(v) => setFinalExpenses(v)}
              min={0}
              max={10000000}
              step={25000}
              prefix="₹"
              helpText="Funeral and medical administrative reserves."
            />
          </div>

          {/* Step 3: Existing Financial Resources */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-xs rounded-md">Step 3</span>
              Existing Resources & Active Policies
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="existingLifeInsurance"
                label="Existing Active Term Life Cover (₹)"
                value={existingLifeInsurance}
                onChange={(v) => setExistingLifeInsurance(v)}
                min={0}
                max={200000000}
                step={500000}
                prefix="₹"
                helpText="Current active term insurance policies."
              />

              <FormInputNumber
                id="savingsAndCash"
                label="Liquid Savings & Bank Balances (₹)"
                value={savingsAndCash}
                onChange={(v) => setSavingsAndCash(v)}
                min={0}
                max={100000000}
                step={50000}
                prefix="₹"
                helpText="Bank deposits and emergency cash."
              />
            </div>

            <FormInputNumber
              id="investments"
              label="Investments & EPF / PPF Corpus (₹)"
              value={investments}
              onChange={(v) => setInvestments(v)}
              min={0}
              max={200000000}
              step={100000}
              prefix="₹"
              helpText="Mutual funds, stocks, and EPF balances available for family support."
            />
          </div>

          {/* Step 4: Scenario Assumptions */}
          <div class="pt-4 border-t border-hairline space-y-3">
            <h3 class="text-xs font-bold text-muted uppercase tracking-wider">
              Scenario Growth & Discount Assumptions
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[11px] font-semibold text-muted block mb-1">Assumed Income Growth Rate (% p.a.)</label>
                <input
                  type="number"
                  value={Number((annualIncomeGrowthRate * 100).toFixed(1))}
                  onInput={(e) => setAnnualIncomeGrowthRate(Number(e.currentTarget.value) / 100)}
                  step="0.5"
                  min="0"
                  max="20"
                  class="w-full text-xs font-mono p-2 rounded-lg bg-surface-soft border border-hairline text-ink"
                />
              </div>
              <div>
                <label class="text-[11px] font-semibold text-muted block mb-1">Assumed Discount / Return Rate (% p.a.)</label>
                <input
                  type="number"
                  value={Number((discountRate * 100).toFixed(1))}
                  onInput={(e) => setDiscountRate(Number(e.currentTarget.value) / 100)}
                  step="0.5"
                  min="1"
                  max="20"
                  class="w-full text-xs font-mono p-2 rounded-lg bg-surface-soft border border-hairline text-ink"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Needs Breakdown, Insights, and Visualization (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {/* Component Breakdown Panel */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <h3 class="text-sm font-bold uppercase tracking-wider text-muted">
              Needs & Resource Composition
            </h3>

            {/* Income Replacement Need */}
            <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-ink">Income Replacement ({replacementPeriodYears} Yrs)</span>
                <span class="text-sm font-mono font-extrabold text-blue-600 dark:text-blue-400">
                  {fmt(results.incomeReplacementNeed)}
                </span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                Accounts for {results.incomeRatioPercent}% of your gross financial protection need.
              </p>
            </div>

            {/* Debt Settlement Need */}
            <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-ink">Debt & Mortgage Settlement</span>
                <span class="text-sm font-mono font-extrabold text-rose-600">
                  {fmt(results.debtNeeds)}
                </span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                Accounts for {results.debtRatioPercent}% of your total need (Mortgage: {fmt(results.breakdown.mortgage)}).
              </p>
            </div>

            {/* Milestone Goals Need */}
            <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-ink">Future Milestone Goals</span>
                <span class="text-sm font-mono font-extrabold text-purple-600">
                  {fmt(results.futureGoalNeeds)}
                </span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                Accounts for {results.goalRatioPercent}% of your total need (Education & Marriage).
              </p>
            </div>

            {/* Existing Resources Offset */}
            <div class="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/40 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Existing Resources</span>
                <span class="text-sm font-mono font-extrabold text-emerald-600">
                  {fmt(results.totalExistingResources)}
                </span>
              </div>
              <p class="text-[11px] text-emerald-700/80 dark:text-emerald-400 leading-relaxed">
                Existing policies and liquid wealth offset {results.resourceOffsetPercent}% of total gross needs.
              </p>
            </div>

            {/* Restrained Need Breakdown Bar */}
            <div class="pt-2 space-y-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-primary font-bold">Gross Need: {fmt(results.totalGrossNeed)}</span>
                <span class="text-emerald-600 font-bold">Offset: {fmt(results.totalExistingResources)}</span>
              </div>
              <div class="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  class="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, results.resourceOffsetPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Insight Card */}
          <div class="p-5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded-2xl space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              💡 Protection Planning Insight
            </span>
            <p class="text-xs text-ink leading-relaxed">
              {results.incomeReplacementNeed > results.debtNeeds
                ? `Your largest coverage driver is income replacement (${results.incomeRatioPercent}% of total need), ensuring your family receives ${replacementPeriodYears} years of living expense continuity.`
                : `Your largest coverage driver is debt settlement (${results.debtRatioPercent}% of total need), ensuring outstanding mortgage loans are immediately paid off upon demise.`}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Share Actions & Financial Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Term Life Insurance Needs Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational financial planning model. Insurance needs estimates depend on user-configured assumptions and do not constitute an insurance quote, medical underwriting determination, or personalized advice.
        </p>
      </div>
    </div>
  );
}
