import { useState, useMemo } from 'preact/hooks';
import { calculateEmergencyFund } from '../../../calculators/savings/emergency-fund-calculator';
import { EMERGENCY_FUND_CONFIG } from '../../../calculators/configs/emergency-fund-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function EmergencyFundFlagshipWidget() {
  const [housingRentMortgage, setHousingRentMortgage] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.housingRentMortgage);
  const [utilities, setUtilities] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.utilities);
  const [groceriesFood, setGroceriesFood] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.groceriesFood);
  const [insurancePremiums, setInsurancePremiums] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.insurancePremiums);
  const [transportation, setTransportation] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.transportation);
  const [minimumDebtPayments, setMinimumDebtPayments] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.minimumDebtPayments);
  const [healthcare, setHealthcare] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.healthcare);
  const [childcareDependentCare, setChildcareDependentCare] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.childcareDependentCare);
  const [otherEssentials, setOtherEssentials] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.otherEssentials);
  
  const [targetMonths, setTargetMonths] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.targetMonths);
  const [incomeStability, setIncomeStability] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.incomeStability);
  const [dependentsCount, setDependentsCount] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.dependentsCount);
  const [currentEmergencySavings, setCurrentEmergencySavings] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.currentEmergencySavings);
  const [monthlyContribution, setMonthlyContribution] = useState(EMERGENCY_FUND_CONFIG.defaultInputs.monthlyContribution);

  // Compute Emergency Fund Engine
  const results = useMemo(() => {
    return calculateEmergencyFund({
      housingRentMortgage,
      utilities,
      groceriesFood,
      insurancePremiums,
      transportation,
      minimumDebtPayments,
      healthcare,
      childcareDependentCare,
      otherEssentials,
      targetMonths,
      incomeStability,
      dependentsCount,
      currentEmergencySavings,
      monthlyContribution,
    });
  }, [
    housingRentMortgage,
    utilities,
    groceriesFood,
    insurancePremiums,
    transportation,
    minimumDebtPayments,
    healthcare,
    childcareDependentCare,
    otherEssentials,
    targetMonths,
    incomeStability,
    dependentsCount,
    currentEmergencySavings,
    monthlyContribution,
  ]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = EMERGENCY_FUND_CONFIG.scenarios[presetKey];
    if (p) {
      setHousingRentMortgage(p.housingRentMortgage);
      setUtilities(p.utilities);
      setGroceriesFood(p.groceriesFood);
      setInsurancePremiums(p.insurancePremiums);
      setTransportation(p.transportation);
      setMinimumDebtPayments(p.minimumDebtPayments);
      setHealthcare(p.healthcare);
      setChildcareDependentCare(p.childcareDependentCare);
      setOtherEssentials(p.otherEssentials);
      setTargetMonths(p.targetMonths);
      setIncomeStability(p.incomeStability);
      setDependentsCount(p.dependentsCount);
      setCurrentEmergencySavings(p.currentEmergencySavings);
      setMonthlyContribution(p.monthlyContribution);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-emerald-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              🛡️ Educational Personal Liquidity Reserve Framework
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Emergency Fund Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Estimate your required liquid emergency reserve target based on essential monthly living commitments, family circumstances, and active savings.
            </p>
          </div>

          <div class="bg-emerald-900/50 border border-emerald-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
              Estimated Emergency Fund Target
            </span>
            <span class="text-3xl sm:text-4xl font-black mt-1 block font-mono text-emerald-400">
              {results.isValid ? fmt(results.targetAmount) : '—'}
            </span>
            {results.isValid && (
              <span class={`inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono ${
                results.isFullyFunded
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {results.isFullyFunded ? 'Fully Funded' : `Funding Gap: ${fmt(results.fundingGap)}`}
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
          This calculator provides an illustrative emergency-fund target based on the expenses, savings, and assumptions you enter. There is no single emergency-fund amount that applies to everyone. Actual needs vary with income stability, dependents, expenses, access to other resources, and personal circumstances.
        </p>
      </div>

      {/* 2. Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Illustrative Household Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(EMERGENCY_FUND_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-primary block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Form & Analysis Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Sections (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Section 1: Essential Monthly Expenses */}
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-xs rounded-md">Step 1</span>
              Essential Monthly Expenses
            </h3>
            <p class="text-xs text-muted">
              Enter recurring expenses that would reasonably need to continue during a financial disruption.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="housingRentMortgage"
                label="Housing / Rent / Mortgage (₹)"
                value={housingRentMortgage}
                onChange={(v) => setHousingRentMortgage(v)}
                min={0}
                max={1000000}
                step={1000}
                prefix="₹"
                helpText="House rent or home loan EMI payment."
              />

              <FormInputNumber
                id="utilities"
                label="Utilities (₹)"
                value={utilities}
                onChange={(v) => setUtilities(v)}
                min={0}
                max={200000}
                step={500}
                prefix="₹"
                helpText="Electricity, water, gas, and mobile/internet bills."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="groceriesFood"
                label="Groceries & Food (₹)"
                value={groceriesFood}
                onChange={(v) => setGroceriesFood(v)}
                min={0}
                max={500000}
                step={1000}
                prefix="₹"
                helpText="Essential food and household supplies."
              />

              <FormInputNumber
                id="insurancePremiums"
                label="Insurance Premiums (Monthly ₹)"
                value={insurancePremiums}
                onChange={(v) => setInsurancePremiums(v)}
                min={0}
                max={200000}
                step={500}
                prefix="₹"
                helpText="Pro-rated monthly health and life insurance premiums."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="transportation"
                label="Essential Transportation (₹)"
                value={transportation}
                onChange={(v) => setTransportation(v)}
                min={0}
                max={200000}
                step={500}
                prefix="₹"
                helpText="Fuel, transit passes, or vehicle upkeep."
              />

              <FormInputNumber
                id="minimumDebtPayments"
                label="Minimum Debt Payments / EMIs (₹)"
                value={minimumDebtPayments}
                onChange={(v) => setMinimumDebtPayments(v)}
                min={0}
                max={1000000}
                step={1000}
                prefix="₹"
                helpText="Car loans, personal loans, or credit card minimums."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="healthcare"
                label="Medical & Healthcare (₹)"
                value={healthcare}
                onChange={(v) => setHealthcare(v)}
                min={0}
                max={200000}
                step={500}
                prefix="₹"
                helpText="Regular prescriptions and healthcare costs."
              />

              <FormInputNumber
                id="childcareDependentCare"
                label="Childcare & Dependent Support (₹)"
                value={childcareDependentCare}
                onChange={(v) => setChildcareDependentCare(v)}
                min={0}
                max={300000}
                step={1000}
                prefix="₹"
                helpText="School tuition or elderly care expenses."
              />
            </div>

            <FormInputNumber
              id="otherEssentials"
              label="Other Mandatory Recurring Expenses (₹)"
              value={otherEssentials}
              onChange={(v) => setOtherEssentials(v)}
              min={0}
              max={200000}
              step={500}
              prefix="₹"
              helpText="Any other non-discretionary monthly commitments."
            />

            <div class="p-3 bg-surface-soft rounded-xl flex items-center justify-between border border-hairline">
              <span class="text-xs font-bold text-ink">Total Essential Monthly Expenses:</span>
              <span class="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">
                {fmt(results.essentialMonthlyExpenses)} / mo
              </span>
            </div>
          </div>

          {/* Section 2: Circumstances & Target Months */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 text-xs rounded-md">Step 2</span>
              Financial Circumstances & Target Months
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="incomeStability" class="text-xs font-bold text-ink block mb-1">
                  Income Stability Profile
                </label>
                <select
                  id="incomeStability"
                  value={incomeStability}
                  onChange={(e) => setIncomeStability(e.target.value)}
                  class="w-full px-3 py-2 text-sm bg-surface border border-hairline rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="stable">Salaried (Stable Corporate / Public Sector)</option>
                  <option value="variable">Salaried (Commission / Variable Bonus)</option>
                  <option value="freelance">Self-Employed / Freelancer / Business</option>
                </select>
              </div>

              <div>
                <label for="dependentsCount" class="text-xs font-bold text-ink block mb-1">
                  Number of Dependents
                </label>
                <select
                  id="dependentsCount"
                  value={dependentsCount}
                  onChange={(e) => setDependentsCount(Number(e.target.value))}
                  class="w-full px-3 py-2 text-sm bg-surface border border-hairline rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={0}>0 (Single / Dual Income No Kids)</option>
                  <option value={1}>1 Dependent</option>
                  <option value={2}>2 Dependents</option>
                  <option value={3}>3+ Dependents</option>
                </select>
              </div>
            </div>

            <FormInputNumber
              id="targetMonths"
              label="Selected Target Reserve Period (Months)"
              value={targetMonths}
              onChange={(v) => setTargetMonths(v)}
              min={1}
              max={36}
              step={1}
              helpText={`Selected planning duration. Illustrative benchmark for your profile is ${results.illustrativeScenarioMonths} months.`}
            />
          </div>

          {/* Section 3: Funding Plan */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-600 text-xs rounded-md">Step 3</span>
              Current Savings & Contribution Plan
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="currentEmergencySavings"
                label="Current Emergency Savings (₹)"
                value={currentEmergencySavings}
                onChange={(v) => setCurrentEmergencySavings(v)}
                min={0}
                max={100000000}
                step={5000}
                prefix="₹"
                helpText="Active liquid savings account balances and instant FDs."
              />

              <FormInputNumber
                id="monthlyContribution"
                label="Planned Monthly Contribution (₹)"
                value={monthlyContribution}
                onChange={(v) => setMonthlyContribution(v)}
                min={0}
                max={5000000}
                step={1000}
                prefix="₹"
                helpText="Monthly amount you can set aside toward the funding gap."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown & Visual Progress (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {!results.isValid ? (
            <div class="p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-center space-y-2">
              <span class="text-2xl">⚠️</span>
              <h4 class="font-bold text-amber-700 dark:text-amber-300 text-sm">Monthly Expenses Required</h4>
              <p class="text-xs text-amber-600 dark:text-amber-400">Please enter essential monthly expenses to compute your emergency fund target.</p>
            </div>
          ) : (
            <>
              {/* Output Summary Card */}
              <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
                <h3 class="text-sm font-bold uppercase tracking-wider text-muted">
                  Reserve Target Summary
                </h3>

                <div class="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/40 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-emerald-900 dark:text-emerald-300">Target Amount</span>
                    <span class="text-base font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {fmt(results.targetAmount)}
                    </span>
                  </div>
                  <p class="text-[11px] text-emerald-700/80 dark:text-emerald-400 leading-relaxed">
                    Based on {fmt(results.essentialMonthlyExpenses)} / mo essential expenses × {results.targetMonths} months.
                  </p>
                </div>

                <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-ink">Current Liquid Savings</span>
                    <span class="text-sm font-mono font-bold text-ink">
                      {fmt(results.currentEmergencySavings)}
                    </span>
                  </div>
                  <div class="flex items-center justify-between pt-1 border-t border-hairline text-xs">
                    <span class="text-muted">Funding Gap:</span>
                    <span class="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {results.isFullyFunded ? '₹0 (Funded)' : fmt(results.fundingGap)}
                    </span>
                  </div>
                </div>

                {/* Timeline Card */}
                <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-2">
                  <span class="text-xs font-bold text-muted uppercase tracking-wider block">
                    Funding Plan Timeline
                  </span>
                  {results.isFullyFunded ? (
                    <p class="text-xs text-emerald-600 font-bold">
                      🎉 Your current liquid savings fully meet your modeled target!
                    </p>
                  ) : results.monthsToTarget === null ? (
                    <p class="text-xs text-amber-600 font-bold">
                      ⚠️ Enter a monthly contribution above ₹0 to calculate an estimated completion timeline.
                    </p>
                  ) : (
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-muted">Estimated Time to Target:</span>
                      <span class="font-mono font-bold text-emerald-600">
                        {results.monthsToTarget} months (~{(results.monthsToTarget / 12).toFixed(1)} yrs)
                      </span>
                    </div>
                  )}
                </div>

                {/* Restrained Progress Indicator */}
                <div class="pt-2 space-y-2">
                  <div class="flex items-center justify-between text-xs font-mono text-muted">
                    <span>Funded: {results.progressPercent}%</span>
                    <span>Target: {fmt(results.targetAmount)}</span>
                  </div>
                  <div class="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex relative">
                    <div
                      class="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${results.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Insight Card */}
              <div class="p-5 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-2">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  💡 Educational Reserve Analysis
                </span>
                <p class="text-xs text-ink leading-relaxed">
                  Your essential monthly commitments are {fmt(results.essentialMonthlyExpenses)}. At {results.targetMonths} target months, your estimated reserve target is {fmt(results.targetAmount)}. {results.isFullyFunded ? 'You have met this target.' : `At a monthly contribution of ${fmt(results.monthlyContribution)}, the funding gap of ${fmt(results.fundingGap)} would take approximately ${results.monthsToTarget || '—'} months to fill.`}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Share Actions & Financial Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Emergency Fund Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational financial planning model. Emergency fund targets are estimates based on user inputs; actual liquidity requirements vary by personal circumstances and banking product terms.
        </p>
      </div>
    </div>
  );
}
