import { useState, useMemo } from 'preact/hooks';
import { calculateCapRateDetails } from '../../../calculators/real-estate/cap-rate-calculator.js';
import { CAP_RATE_CONFIG } from '../../../calculators/configs/cap-rate-calculator.config.js';
import FormInputNumber from './FormInputNumber.jsx';
import ShareActions from '../../ui/ShareActions.jsx';
import { formatCurrency } from '@utils/formatters.js';

export default function CapRateFlagshipWidget() {
  const [propertyValue, setPropertyValue] = useState(CAP_RATE_CONFIG.defaultInputs.propertyValue);
  const [monthlyRent, setMonthlyRent] = useState(CAP_RATE_CONFIG.defaultInputs.monthlyRent);
  const [otherIncomeAnnual, setOtherIncomeAnnual] = useState(CAP_RATE_CONFIG.defaultInputs.otherIncomeAnnual);
  const [vacancyRatePct, setVacancyRatePct] = useState(CAP_RATE_CONFIG.defaultInputs.vacancyRatePct);

  // Operating Expenses
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState(CAP_RATE_CONFIG.defaultInputs.propertyTaxAnnual);
  const [insuranceAnnual, setInsuranceAnnual] = useState(CAP_RATE_CONFIG.defaultInputs.insuranceAnnual);
  const [maintenanceAnnual, setMaintenanceAnnual] = useState(CAP_RATE_CONFIG.defaultInputs.maintenanceAnnual);
  const [managementFeePct, setManagementFeePct] = useState(CAP_RATE_CONFIG.defaultInputs.managementFeePct);
  const [utilitiesAnnual, setUtilitiesAnnual] = useState(CAP_RATE_CONFIG.defaultInputs.utilitiesAnnual);
  const [hoaChargesAnnual, setHoaChargesAnnual] = useState(CAP_RATE_CONFIG.defaultInputs.hoaChargesAnnual);
  const [otherOpExAnnual, setOtherOpExAnnual] = useState(CAP_RATE_CONFIG.defaultInputs.otherOpExAnnual);

  // Valuation & Benchmark inputs
  const [targetCapRatePct, setTargetCapRatePct] = useState(CAP_RATE_CONFIG.defaultInputs.targetCapRatePct);
  const [mortgageInterestRate, setMortgageInterestRate] = useState(CAP_RATE_CONFIG.defaultInputs.mortgageInterestRate);

  // Results Calculation
  const results = useMemo(() => {
    return calculateCapRateDetails({
      propertyValue,
      monthlyRent,
      otherIncomeAnnual,
      vacancyRatePct,
      propertyTaxAnnual,
      insuranceAnnual,
      maintenanceAnnual,
      managementFeePct,
      utilitiesAnnual,
      hoaChargesAnnual,
      otherOpExAnnual,
      targetCapRatePct,
      mortgageInterestRate,
    });
  }, [
    propertyValue,
    monthlyRent,
    otherIncomeAnnual,
    vacancyRatePct,
    propertyTaxAnnual,
    insuranceAnnual,
    maintenanceAnnual,
    managementFeePct,
    utilitiesAnnual,
    hoaChargesAnnual,
    otherOpExAnnual,
    targetCapRatePct,
    mortgageInterestRate,
  ]);

  const handleApplyPreset = (presetKey) => {
    const s = CAP_RATE_CONFIG.scenarios[presetKey];
    if (s) {
      setPropertyValue(s.propertyValue);
      setMonthlyRent(s.monthlyRent);
      setOtherIncomeAnnual(s.otherIncomeAnnual);
      setVacancyRatePct(s.vacancyRatePct);
      setPropertyTaxAnnual(s.propertyTaxAnnual);
      setInsuranceAnnual(s.insuranceAnnual);
      setMaintenanceAnnual(s.maintenanceAnnual);
      setManagementFeePct(s.managementFeePct);
      setUtilitiesAnnual(s.utilitiesAnnual || 0);
      setHoaChargesAnnual(s.hoaChargesAnnual || 0);
      setOtherOpExAnnual(s.otherOpExAnnual || 0);
      setTargetCapRatePct(s.targetCapRatePct);
      setMortgageInterestRate(s.mortgageInterestRate);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-sky-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-300 text-xs font-semibold rounded-full border border-sky-500/30">
              🏢 Real Estate Yield & Valuation Engine
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Cap Rate Calculator (Capitalization Rate)
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Compute Net Operating Income (NOI), Capitalization Rate %, implied property valuations at target yields, and operating expense ratios for real estate investments.
            </p>
          </div>

          <div class="bg-sky-900/50 border border-sky-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-sky-300 font-bold block">
              Capitalization Rate (Cap Rate)
            </span>
            <span class="text-3xl sm:text-4xl font-black text-sky-400 mt-1 block font-mono">
              {results.isValid ? `${results.capRatePct.toFixed(2)}%` : '—'}
            </span>
            {results.isValid && (
              <span class="inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Annual NOI: {fmt(results.noi)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Accounting Disclosure */}
      <div class="p-4 bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 rounded-xl text-xs text-sky-900 dark:text-sky-200 space-y-1">
        <span class="font-bold flex items-center gap-1.5">
          ℹ️ Unleveraged Return & NOI Accounting Notice:
        </span>
        <p class="leading-relaxed">
          {CAP_RATE_CONFIG.disclaimers.educationalNotice} {CAP_RATE_CONFIG.disclaimers.noiNotice}
        </p>
      </div>

      {/* 2. Sample Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Real Estate Investment Scenarios
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(CAP_RATE_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-sky-500 hover:bg-sky-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-sky-600 block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Form & KPI Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Step 1: Property Value & Income */}
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md">Step 1</span>
              Property Value & Gross Income
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="propertyValue"
                label="Property Purchase Price / Value (₹)"
                value={propertyValue}
                onChange={(v) => setPropertyValue(v)}
                min={500000}
                max={1000000000}
                step={100000}
                prefix="₹"
                helpText="Estimated market value or acquisition price."
              />

              <FormInputNumber
                id="monthlyRent"
                label="Monthly Gross Rent (₹)"
                value={monthlyRent}
                onChange={(v) => setMonthlyRent(v)}
                min={0}
                max={10000000}
                step={5000}
                prefix="₹"
                helpText="Gross monthly rental collection."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <FormInputNumber
                id="otherIncomeAnnual"
                label="Other Annual Income (₹)"
                value={otherIncomeAnnual}
                onChange={(v) => setOtherIncomeAnnual(v)}
                min={0}
                max={10000000}
                step={5000}
                prefix="₹"
                helpText="Parking, laundry, storage fees."
              />

              <FormInputNumber
                id="vacancyRatePct"
                label="Vacancy & Credit Loss (%)"
                value={vacancyRatePct}
                onChange={(v) => setVacancyRatePct(v)}
                min={0}
                max={50}
                step={0.5}
                helpText="Expected tenant vacancy allowance."
              />
            </div>
          </div>

          {/* Step 2: Operating Expenses Breakdown */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 text-xs rounded-md">Step 2</span>
              Operating Expenses (OpEx)
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="propertyTaxAnnual"
                label="Annual Property Tax (₹)"
                value={propertyTaxAnnual}
                onChange={(v) => setPropertyTaxAnnual(v)}
                min={0}
                max={10000000}
                step={2000}
                prefix="₹"
                helpText="Municipal property taxes."
              />

              <FormInputNumber
                id="insuranceAnnual"
                label="Annual Insurance (₹)"
                value={insuranceAnnual}
                onChange={(v) => setInsuranceAnnual(v)}
                min={0}
                max={5000000}
                step={1000}
                prefix="₹"
                helpText="Building & hazard insurance."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <FormInputNumber
                id="maintenanceAnnual"
                label="Annual Repairs & Maintenance (₹)"
                value={maintenanceAnnual}
                onChange={(v) => setMaintenanceAnnual(v)}
                min={0}
                max={10000000}
                step={5000}
                prefix="₹"
                helpText="Routine maintenance costs."
              />

              <FormInputNumber
                id="managementFeePct"
                label="Property Management Fee (%)"
                value={managementFeePct}
                onChange={(v) => setManagementFeePct(v)}
                min={0}
                max={30}
                step={0.5}
                helpText="Management fee % of EGI."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <FormInputNumber
                id="hoaChargesAnnual"
                label="Annual HOA / Society Fee (₹)"
                value={hoaChargesAnnual}
                onChange={(v) => setHoaChargesAnnual(v)}
                min={0}
                max={5000000}
                step={2000}
                prefix="₹"
                helpText="HOA or maintenance charges."
              />

              <FormInputNumber
                id="otherOpExAnnual"
                label="Other Operating Expenses (₹)"
                value={otherOpExAnnual}
                onChange={(v) => setOtherOpExAnnual(v)}
                min={0}
                max={5000000}
                step={2000}
                prefix="₹"
                helpText="Utilities, legal, advertising."
              />
            </div>
          </div>

          {/* Step 3: Target Cap Rate & Mortgage Rate */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 text-xs rounded-md">Step 3</span>
              Valuation & Mortgage Benchmarks
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="targetCapRatePct"
                label="Target Cap Rate (%)"
                value={targetCapRatePct}
                onChange={(v) => setTargetCapRatePct(v)}
                min={1}
                max={25}
                step={0.25}
                helpText="Desired yield for valuation."
              />

              <FormInputNumber
                id="mortgageInterestRate"
                label="Mortgage Interest Rate (%)"
                value={mortgageInterestRate}
                onChange={(v) => setMortgageInterestRate(v)}
                min={0}
                max={25}
                step={0.25}
                helpText="For Cap Rate spread analysis."
              />
            </div>
          </div>
        </div>

        {/* Right Column: KPI Cards & Expense Breakdown (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {/* KPI Dashboard Cards */}
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Net Operating Income</span>
              <span class="text-lg font-mono font-black text-sky-600 block">{fmt(results.noi)}</span>
              <span class="text-[10px] text-muted block">Monthly: {fmt(results.monthlyNoi)}</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Target Valuation</span>
              <span class="text-lg font-mono font-black text-indigo-600 block">
                {results.impliedValuationAtTarget > 0 ? fmt(results.impliedValuationAtTarget) : '—'}
              </span>
              <span class="text-[10px] text-muted block">At {results.targetCapRatePct}% Cap Rate</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">OpEx Ratio (OER)</span>
              <span class="text-lg font-mono font-black text-rose-600 block">{results.operatingExpenseRatioPct.toFixed(1)}%</span>
              <span class="text-[10px] text-muted block">OpEx: {fmt(results.operatingExpenses.totalOpEx)}</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Cap Rate Spread</span>
              <span
                class={`text-lg font-mono font-black block ${
                  results.capRateSpreadPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {results.capRateSpreadPct > 0 ? `+${results.capRateSpreadPct.toFixed(2)}%` : `${results.capRateSpreadPct.toFixed(2)}%`}
              </span>
              <span class="text-[10px] text-muted block">vs {results.mortgageInterestRate}% Mortgage Rate</span>
            </div>
          </div>

          {/* Operating Income & Expense Breakdown Card */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
              Annual Income & Operating Expenses
            </h3>

            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-muted">Gross Potential Rent:</span>
                <span class="font-mono font-bold text-ink">{fmt(results.annualGrossRent)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-muted">Other Annual Income:</span>
                <span class="font-mono font-bold text-ink">{fmt(results.otherIncomeAnnual)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-muted">Gross Potential Income (GPI):</span>
                <span class="font-mono font-bold text-ink">{fmt(results.grossPotentialIncome)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-muted">Vacancy & Loss ({results.vacancyRatePct}%):</span>
                <span class="font-mono text-rose-600">−{fmt(results.vacancyLoss)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline bg-surface-soft px-2 rounded-md">
                <span class="font-bold text-ink">Effective Gross Income (EGI):</span>
                <span class="font-mono font-bold text-ink">{fmt(results.effectiveGrossIncome)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-muted">Total Operating Expenses (OpEx):</span>
                <span class="font-mono text-rose-600">−{fmt(results.operatingExpenses.totalOpEx)}</span>
              </div>
              <div class="flex justify-between py-2 bg-sky-50 dark:bg-sky-950/40 px-2 rounded-md border border-sky-200 dark:border-sky-800/40">
                <span class="font-extrabold text-sky-900 dark:text-sky-200">Net Operating Income (NOI):</span>
                <span class="font-mono font-black text-sky-600 text-sm">{fmt(results.noi)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Share Actions & Educational Footer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Cap Rate Calculator (Capitalization Rate) - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Real estate educational tool. Cap rate represents unleveraged property-level yield. Actual investor cash flow depends on financing terms, property taxes, tenant stability, and local market conditions.
        </p>
      </div>
    </div>
  );
}
