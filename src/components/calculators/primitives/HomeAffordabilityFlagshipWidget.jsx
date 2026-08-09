import { useState, useMemo } from 'preact/hooks';
import { calculateHomeAffordability } from '../../../calculators/real-estate/home-affordability-calculator';
import { HOME_AFFORDABILITY_CONFIG } from '../../../calculators/configs/home-affordability-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import AmortizationTable from './AmortizationTable';
import EmiDonutChart from './EmiDonutChart';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function HomeAffordabilityFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    ...HOME_AFFORDABILITY_CONFIG.defaultInputs,
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);
  const [activePreset, setActivePreset] = useState('standard');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Compute affordability results
  const results = useMemo(() => {
    return calculateHomeAffordability(state);
  }, [state]);

  // Handle Preset Change
  const handlePresetSelect = (presetId) => {
    setActivePreset(presetId);
    const preset = HOME_AFFORDABILITY_CONFIG.scenarios[presetId];
    if (preset) {
      updateState('frontEndDtiRatio', preset.frontEndDtiRatio);
      updateState('backEndDtiRatio', preset.backEndDtiRatio);
    }
  };

  // Format Helper
  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
              🏠 Real Estate Home Affordability Decision Engine
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Maximum Affordable Home Price
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model maximum home purchasing power across gross household income, existing EMIs, down payment savings, RBI LTV ceilings, and lender DTI underwriting caps.
            </p>
          </div>
          <div class="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span class="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Estimated Max Home Price
            </span>
            <span class="text-3xl font-black text-emerald-400 mt-1 block">
              {fmt(results.maxAffordablePrice)}
            </span>
            <span class="text-xs text-blue-200 mt-1 block font-mono">
              ({fmt(results.maxLoanAmount)} Loan + {fmt(results.requiredDownPayment)} Down Payment)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Underwriting Scenario Presets */}
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold uppercase tracking-wider text-muted">
            Select Lender Underwriting Preset
          </label>
          <span class="text-xs text-primary font-semibold">
            Current: DTI {state.frontEndDtiRatio}% / FOIR {state.backEndDtiRatio}%
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(HOME_AFFORDABILITY_CONFIG.scenarios).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handlePresetSelect(s.id)}
              class={`p-4 rounded-xl border text-left transition-all ${
                activePreset === s.id
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-canvas border-hairline hover:border-blue-300'
              }`}
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-sm text-ink">{s.title}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-strong text-muted">
                  {s.badge}
                </span>
              </div>
              <p class="text-xs text-muted leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Input Controls & Results Dashboard Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <div class="lg:col-span-6 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          <h3 class="text-lg font-bold text-ink border-b border-hairline pb-3 flex items-center justify-between">
            <span>Income & Financing Inputs</span>
            <span class="text-xs font-normal text-muted">Step 1 of 2</span>
          </h3>

          <div class="space-y-4">
            <FormInputNumber
              id="grossMonthlyIncome"
              label="Gross Monthly Household Income"
              value={state.grossMonthlyIncome}
              onChange={(v) => updateState('grossMonthlyIncome', v)}
              min={10000}
              max={10000000}
              step={5000}
              prefix="₹"
              helpText="Pre-tax total monthly income of primary and co-borrowers."
            />

            <FormInputNumber
              id="existingMonthlyDebt"
              label="Existing Monthly EMIs & Obligations"
              value={state.existingMonthlyDebt}
              onChange={(v) => updateState('existingMonthlyDebt', v)}
              min={0}
              max={5000000}
              step={2000}
              prefix="₹"
              helpText="Car loans, personal loans, credit card minimums, etc."
            />

            <FormInputNumber
              id="downPaymentSavings"
              label="Available Down Payment Cash / Savings"
              value={state.downPaymentSavings}
              onChange={(v) => updateState('downPaymentSavings', v)}
              min={0}
              max={100000000}
              step={50000}
              prefix="₹"
              helpText="Liquid cash set aside for property down payment."
            />

            <div class="grid grid-cols-2 gap-4">
              <FormInputNumber
                id="annualInterestRate"
                label="Interest Rate (% p.a.)"
                value={state.annualInterestRate}
                onChange={(v) => updateState('annualInterestRate', v)}
                min={1.0}
                max={25.0}
                step={0.1}
                suffix="%"
              />

              <FormInputNumber
                id="tenureYears"
                label="Loan Tenure (Years)"
                value={state.tenureYears}
                onChange={(v) => updateState('tenureYears', v)}
                min={1}
                max={30}
                step={1}
                suffix="Yrs"
              />
            </div>
          </div>

          {/* Advanced Inputs Toggle */}
          <div class="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              class="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-blue-700 transition-colors"
            >
              <span>{showAdvanced ? '▼ Hide Advanced Assumptions' : '▶ Customize Property Taxes, Insurance & Closing Costs'}</span>
            </button>

            {showAdvanced && (
              <div class="mt-4 p-4 bg-surface-soft rounded-xl border border-hairline space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <FormInputNumber
                    id="propertyTaxRate"
                    label="Property Tax (% p.a.)"
                    value={state.propertyTaxRate}
                    onChange={(v) => updateState('propertyTaxRate', v)}
                    min={0}
                    max={5}
                    step={0.05}
                    suffix="%"
                  />

                  <FormInputNumber
                    id="insuranceRate"
                    label="Home Insurance (% p.a.)"
                    value={state.insuranceRate}
                    onChange={(v) => updateState('insuranceRate', v)}
                    min={0}
                    max={3}
                    step={0.05}
                    suffix="%"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <FormInputNumber
                    id="maintenanceRate"
                    label="Maintenance / HOA (% p.a.)"
                    value={state.maintenanceRate}
                    onChange={(v) => updateState('maintenanceRate', v)}
                    min={0}
                    max={5}
                    step={0.05}
                    suffix="%"
                  />

                  <FormInputNumber
                    id="closingCostRate"
                    label="Closing Costs & Stamp Duty (%)"
                    value={state.closingCostRate}
                    onChange={(v) => updateState('closingCostRate', v)}
                    min={0}
                    max={15}
                    step={0.5}
                    suffix="%"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Breakdown & Dashboard */}
        <div class="lg:col-span-6 space-y-6">
          {/* Binding Constraint Alert Banner */}
          <div
            class={`p-4 rounded-xl border ${
              results.bindingConstraint === 'ltv_down_payment'
                ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-200'
                : results.bindingConstraint === 'existing_debt'
                ? 'bg-purple-50 border-purple-300 text-purple-900 dark:bg-purple-950/40 dark:border-purple-700 dark:text-purple-200'
                : 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-200'
            }`}
          >
            <div class="flex items-start gap-3">
              <span class="text-xl">⚠️</span>
              <div>
                <h4 class="font-bold text-sm">
                  {results.bindingConstraint === 'ltv_down_payment'
                    ? 'Binding Constraint: Down Payment & RBI LTV Ceiling'
                    : results.bindingConstraint === 'existing_debt'
                    ? 'Binding Constraint: Existing Debt Obligations (FOIR Cap)'
                    : 'Binding Constraint: Monthly Income & DTI Limit'}
                </h4>
                <p class="text-xs mt-1 leading-relaxed opacity-90">
                  {results.bindingConstraint === 'ltv_down_payment'
                    ? `Your home purchase price is currently capped by your available down payment (${fmt(results.requiredDownPayment)}) under RBI's ${results.ltvPercent}% LTV limit.`
                    : results.bindingConstraint === 'existing_debt'
                    ? `Existing monthly debt payments (${fmt(state.existingMonthlyDebt)}) reduce your available monthly home loan EMI capacity to ${fmt(results.availableMonthlyEMI)}.`
                    : `Your monthly gross income (${fmt(state.grossMonthlyIncome)}) caps your maximum home loan EMI to ${fmt(results.availableMonthlyEMI)} under the selected DTI ratio.`}
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics Breakdown Grid */}
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-canvas border border-hairline rounded-xl">
              <span class="text-xs font-semibold text-muted block">Maximum Loan Amount</span>
              <span class="text-xl font-bold font-mono text-primary mt-1 block">{fmt(results.maxLoanAmount)}</span>
              <span class="text-[11px] text-muted block mt-0.5">{results.ltvPercent}% LTV Limit</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-xl">
              <span class="text-xs font-semibold text-muted block">Required Down Payment</span>
              <span class="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                {fmt(results.requiredDownPayment)}
              </span>
              <span class="text-[11px] text-muted block mt-0.5">{results.summary.downPaymentPct}% of Home Price</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-xl">
              <span class="text-xs font-semibold text-muted block">Estimated Closing Costs</span>
              <span class="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 block">
                {fmt(results.estimatedClosingCosts)}
              </span>
              <span class="text-[11px] text-muted block mt-0.5">{state.closingCostRate}% Stamp Duty & Legal</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-xl">
              <span class="text-xs font-semibold text-muted block">Total Upfront Cash Needed</span>
              <span class="text-xl font-bold font-mono text-ink mt-1 block">{fmt(results.upfrontCashRequired)}</span>
              <span class="text-[11px] text-muted block mt-0.5">Down Payment + Closing</span>
            </div>
          </div>

          {/* Monthly Ownership Cost Breakdown */}
          <div class="p-5 bg-surface-soft border border-hairline rounded-xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm text-ink">Total Monthly Ownership Cost</span>
              <span class="text-lg font-black font-mono text-primary">{fmt(results.totalMonthlyOwnershipCost)}/mo</span>
            </div>

            <div class="space-y-2 text-xs font-mono border-t border-hairline pt-3">
              <div class="flex justify-between text-body">
                <span>Home Loan Monthly EMI:</span>
                <span class="font-semibold text-ink">{fmt(results.actualMonthlyEMI)}</span>
              </div>
              <div class="flex justify-between text-body">
                <span>Est. Monthly Property Tax ({state.propertyTaxRate}%):</span>
                <span class="text-muted">{fmt(results.monthlyPropertyTax)}</span>
              </div>
              <div class="flex justify-between text-body">
                <span>Est. Monthly Insurance ({state.insuranceRate}%):</span>
                <span class="text-muted">{fmt(results.monthlyInsurance)}</span>
              </div>
              <div class="flex justify-between text-body">
                <span>Est. Monthly Maintenance ({state.maintenanceRate}%):</span>
                <span class="text-muted">{fmt(results.monthlyMaintenance)}</span>
              </div>
            </div>
          </div>

          {/* Visual Donut Chart */}
          <EmiDonutChart
            principal={results.maxLoanAmount}
            totalInterest={results.yearlySchedule.reduce((sum, r) => sum + r.interestPaid, 0)}
            totalPayment={results.maxLoanAmount + results.yearlySchedule.reduce((sum, r) => sum + r.interestPaid, 0)}
          />
        </div>
      </div>

      {/* 4. Sensitivity Analysis Section */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-canvas border border-hairline p-6 rounded-2xl">
        {/* Interest Rate Sensitivity Table */}
        <div class="space-y-3">
          <h4 class="font-bold text-sm text-ink flex items-center gap-2">
            <span>📈 Interest Rate Sensitivity (±1.0%)</span>
          </h4>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left font-mono">
              <thead class="bg-surface-soft text-ink font-semibold">
                <tr>
                  <th class="p-2">Rate (% p.a.)</th>
                  <th class="p-2">Max Loan</th>
                  <th class="p-2">Max Home Price</th>
                  <th class="p-2">Monthly EMI</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-hairline">
                {results.rateSensitivity.map((row) => (
                  <tr key={row.rate} class={row.isBase ? 'bg-blue-50 font-bold dark:bg-blue-950/50' : ''}>
                    <td class="p-2">{row.rate}% {row.isBase ? '(Base)' : ''}</td>
                    <td class="p-2">{fmt(row.maxLoanAmount)}</td>
                    <td class="p-2 text-emerald-600 font-bold">{fmt(row.maxAffordablePrice)}</td>
                    <td class="p-2">{fmt(row.monthlyEMI)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tenure Sensitivity Table */}
        <div class="space-y-3">
          <h4 class="font-bold text-sm text-ink flex items-center gap-2">
            <span>⏱️ Loan Tenure Sensitivity (15-30 Years)</span>
          </h4>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left font-mono">
              <thead class="bg-surface-soft text-ink font-semibold">
                <tr>
                  <th class="p-2">Tenure</th>
                  <th class="p-2">Max Loan</th>
                  <th class="p-2">Max Home Price</th>
                  <th class="p-2">Monthly EMI</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-hairline">
                {results.tenureSensitivity.map((row) => (
                  <tr key={row.tenureYears} class={row.isCurrent ? 'bg-blue-50 font-bold dark:bg-blue-950/50' : ''}>
                    <td class="p-2">{row.tenureYears} Yrs {row.isCurrent ? '(Current)' : ''}</td>
                    <td class="p-2">{fmt(row.maxLoanAmount)}</td>
                    <td class="p-2 text-emerald-600 font-bold">{fmt(row.maxAffordablePrice)}</td>
                    <td class="p-2">{fmt(row.monthlyEMI)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Year-by-Year Ownership Amortization Schedule */}
      <AmortizationTable schedule={results.yearlySchedule.map(r => ({
        month: r.year * 12,
        payment: r.principalPaid + r.interestPaid,
        principalPaid: r.principalPaid,
        interestPaid: r.interestPaid,
        remainingBalance: r.endingBalance
      }))} />

      {/* 6. Share Actions & Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Home Affordability Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Mathematical estimate for financial planning only. Final loan eligibility and interest rates are subject to credit score verification, property title audit, and formal lender underwriting approval.
        </p>
      </div>
    </div>
  );
}
