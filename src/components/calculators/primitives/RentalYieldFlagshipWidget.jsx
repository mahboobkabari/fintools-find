import { useState, useMemo } from 'preact/hooks';
import { calculateRentalYield } from '../../../calculators/real-estate/rental-yield-calculator';
import { RENTAL_YIELD_CONFIG } from '../../../calculators/configs/rental-yield-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function RentalYieldFlagshipWidget() {
  const [propertyPurchasePrice, setPropertyPurchasePrice] = useState(RENTAL_YIELD_CONFIG.defaultInputs.propertyPurchasePrice);
  const [currentPropertyValue, setCurrentPropertyValue] = useState(RENTAL_YIELD_CONFIG.defaultInputs.currentPropertyValue);
  const [monthlyRent, setMonthlyRent] = useState(RENTAL_YIELD_CONFIG.defaultInputs.monthlyRent);
  const [vacancyRatePercent, setVacancyRatePercent] = useState(RENTAL_YIELD_CONFIG.defaultInputs.vacancyRatePercent);
  
  const [propertyTax, setPropertyTax] = useState(RENTAL_YIELD_CONFIG.defaultInputs.propertyTax);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState(RENTAL_YIELD_CONFIG.defaultInputs.monthlyMaintenance);
  const [insurance, setInsurance] = useState(RENTAL_YIELD_CONFIG.defaultInputs.insurance);
  const [managementFees, setManagementFees] = useState(RENTAL_YIELD_CONFIG.defaultInputs.managementFees);
  const [otherExpenses, setOtherExpenses] = useState(RENTAL_YIELD_CONFIG.defaultInputs.otherExpenses);

  const [isFinanced, setIsFinanced] = useState(RENTAL_YIELD_CONFIG.defaultInputs.isFinanced);
  const [loanAmount, setLoanAmount] = useState(RENTAL_YIELD_CONFIG.defaultInputs.loanAmount);
  const [interestRatePercent, setInterestRatePercent] = useState(RENTAL_YIELD_CONFIG.defaultInputs.interestRatePercent);
  const [loanTenureYears, setLoanTenureYears] = useState(RENTAL_YIELD_CONFIG.defaultInputs.loanTenureYears);
  const [existingMonthlyEmi, setExistingMonthlyEmi] = useState(RENTAL_YIELD_CONFIG.defaultInputs.existingMonthlyEmi);

  const [downPayment, setDownPayment] = useState(RENTAL_YIELD_CONFIG.defaultInputs.downPayment);
  const [acquisitionCosts, setAcquisitionCosts] = useState(RENTAL_YIELD_CONFIG.defaultInputs.acquisitionCosts);
  const [initialRenovation, setInitialRenovation] = useState(RENTAL_YIELD_CONFIG.defaultInputs.initialRenovation);
  const [annualAppreciationRatePercent, setAnnualAppreciationRatePercent] = useState(RENTAL_YIELD_CONFIG.defaultInputs.annualAppreciationRatePercent);
  const [holdingYears, setHoldingYears] = useState(RENTAL_YIELD_CONFIG.defaultInputs.holdingYears);

  // Compute Engine Results
  const results = useMemo(() => {
    return calculateRentalYield({
      propertyPurchasePrice,
      currentPropertyValue,
      monthlyRent,
      vacancyRatePercent,
      propertyTax,
      monthlyMaintenance,
      insurance,
      managementFees,
      otherExpenses,
      isFinanced,
      loanAmount,
      interestRatePercent,
      loanTenureYears,
      existingMonthlyEmi,
      downPayment,
      acquisitionCosts,
      initialRenovation,
      annualAppreciationRatePercent,
      holdingYears,
    });
  }, [
    propertyPurchasePrice,
    currentPropertyValue,
    monthlyRent,
    vacancyRatePercent,
    propertyTax,
    monthlyMaintenance,
    insurance,
    managementFees,
    otherExpenses,
    isFinanced,
    loanAmount,
    interestRatePercent,
    loanTenureYears,
    existingMonthlyEmi,
    downPayment,
    acquisitionCosts,
    initialRenovation,
    annualAppreciationRatePercent,
    holdingYears,
  ]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = RENTAL_YIELD_CONFIG.scenarios[presetKey];
    if (p) {
      setPropertyPurchasePrice(p.propertyPurchasePrice);
      setCurrentPropertyValue(p.currentPropertyValue);
      setMonthlyRent(p.monthlyRent);
      setVacancyRatePercent(p.vacancyRatePercent);
      setPropertyTax(p.propertyTax);
      setMonthlyMaintenance(p.monthlyMaintenance);
      setInsurance(p.insurance);
      setManagementFees(p.managementFees);
      setOtherExpenses(p.otherExpenses);
      setIsFinanced(p.isFinanced);
      setLoanAmount(p.loanAmount);
      setInterestRatePercent(p.interestRatePercent);
      setLoanTenureYears(p.loanTenureYears);
      setExistingMonthlyEmi(p.existingMonthlyEmi);
      setDownPayment(p.downPayment);
      setAcquisitionCosts(p.acquisitionCosts);
      setInitialRenovation(p.initialRenovation);
      setAnnualAppreciationRatePercent(p.annualAppreciationRatePercent);
      setHoldingYears(p.holdingYears);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-amber-950 to-orange-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-amber-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full border border-amber-500/30">
              🏢 Real Estate Yield & Performance Model
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rental Yield & Property ROI Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Evaluate Net Rental Yield %, Gross Rental Yield %, Net Operating Income (NOI), Cap Rate %, and Cash-on-Cash Return % for residential or commercial real estate.
            </p>
          </div>

          <div class="bg-amber-900/50 border border-amber-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-amber-300 font-bold block">
              Estimated Net Rental Yield
            </span>
            <span class="text-3xl sm:text-4xl font-black mt-1 block font-mono text-amber-400">
              {results.isValid ? `${results.netRentalYieldPercent}%` : '—'}
            </span>
            {results.isValid && (
              <span class="inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Gross Yield: {results.grossRentalYieldPercent}%
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
          Rental income, property appreciation, and cash flows are estimates based on user inputs and market assumptions. Actual rental yields, vacancy rates, operating costs, and financing terms vary by property, location, and market conditions.
        </p>
      </div>

      {/* 2. Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Illustrative Property Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(RENTAL_YIELD_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-amber-500 hover:bg-amber-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-primary block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Form & Analysis Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Step 1: Property Valuation & Rental Income */}
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 text-xs rounded-md">Step 1</span>
              Property Valuation & Rental Income
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="propertyPurchasePrice"
                label="Property Purchase Price (₹)"
                value={propertyPurchasePrice}
                onChange={(v) => setPropertyPurchasePrice(v)}
                min={0}
                max={1000000000}
                step={100000}
                prefix="₹"
                helpText="Original acquisition cost used as the denominator for rental yield."
              />

              <FormInputNumber
                id="currentPropertyValue"
                label="Current Estimated Property Value (₹)"
                value={currentPropertyValue}
                onChange={(v) => setCurrentPropertyValue(v)}
                min={0}
                max={1000000000}
                step={100000}
                prefix="₹"
                helpText="Current market value used as the denominator for Cap Rate %."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="monthlyRent"
                label="Expected Monthly Rent (₹)"
                value={monthlyRent}
                onChange={(v) => setMonthlyRent(v)}
                min={0}
                max={5000000}
                step={1000}
                prefix="₹"
                helpText="Gross monthly rental collection."
              />

              <FormInputNumber
                id="vacancyRatePercent"
                label="Estimated Vacancy Rate (%)"
                value={vacancyRatePercent}
                onChange={(v) => setVacancyRatePercent(v)}
                min={0}
                max={50}
                step={1}
                helpText="Expected annual vacancy loss percentage (e.g. 5%)."
              />
            </div>
          </div>

          {/* Step 2: Annual Operating Expenses */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-600 text-xs rounded-md">Step 2</span>
              Operating Expenses (Excludes Mortgage EMI)
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="propertyTax"
                label="Annual Property Tax (₹)"
                value={propertyTax}
                onChange={(v) => setPropertyTax(v)}
                min={0}
                max={1000000}
                step={1000}
                prefix="₹"
                helpText="Municipal property taxes paid per year."
              />

              <FormInputNumber
                id="monthlyMaintenance"
                label="Monthly Maintenance / Society Fees (₹)"
                value={monthlyMaintenance}
                onChange={(v) => setMonthlyMaintenance(v)}
                min={0}
                max={200000}
                step={500}
                prefix="₹"
                helpText="Society charges or routine property maintenance per month."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="insurance"
                label="Annual Property Insurance (₹)"
                value={insurance}
                onChange={(v) => setInsurance(v)}
                min={0}
                max={500000}
                step={1000}
                prefix="₹"
                helpText="Annual property structure/fire insurance."
              />

              <FormInputNumber
                id="managementFees"
                label="Annual Management / Broker Fees (₹)"
                value={managementFees}
                onChange={(v) => setManagementFees(v)}
                min={0}
                max={1000000}
                step={1000}
                prefix="₹"
                helpText="Annual property manager or tenant placement commissions."
              />
            </div>

            <FormInputNumber
              id="otherExpenses"
              label="Other Annual Operating Costs (₹)"
              value={otherExpenses}
              onChange={(v) => setOtherExpenses(v)}
              min={0}
              max={500000}
              step={1000}
              prefix="₹"
              helpText="Water, repairs, or misc property operating expenses."
            />
          </div>

          {/* Step 3: Mortgage Financing (Optional) */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <div class="flex items-center justify-between border-b border-hairline pb-2">
              <h3 class="text-sm font-bold text-ink flex items-center gap-2">
                <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 text-xs rounded-md">Step 3</span>
                Mortgage Financing (Optional)
              </h3>
              <label class="inline-flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFinanced}
                  onChange={(e) => setIsFinanced(e.target.checked)}
                  class="rounded text-amber-600 focus:ring-amber-500"
                />
                Property Financed via Home Loan
              </label>
            </div>

            {isFinanced && (
              <div class="space-y-4 pt-2">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormInputNumber
                    id="loanAmount"
                    label="Home Loan Amount (₹)"
                    value={loanAmount}
                    onChange={(v) => setLoanAmount(v)}
                    min={0}
                    max={1000000000}
                    step={100000}
                    prefix="₹"
                  />

                  <FormInputNumber
                    id="interestRatePercent"
                    label="Interest Rate (% p.a.)"
                    value={interestRatePercent}
                    onChange={(v) => setInterestRatePercent(v)}
                    min={0}
                    max={30}
                    step={0.1}
                  />

                  <FormInputNumber
                    id="loanTenureYears"
                    label="Loan Tenure (Years)"
                    value={loanTenureYears}
                    onChange={(v) => setLoanTenureYears(v)}
                    min={1}
                    max={30}
                    step={1}
                  />
                </div>

                <FormInputNumber
                  id="existingMonthlyEmi"
                  label="Existing Monthly EMI Override (₹)"
                  value={existingMonthlyEmi}
                  onChange={(v) => setExistingMonthlyEmi(v)}
                  min={0}
                  max={5000000}
                  step={1000}
                  prefix="₹"
                  helpText="Leave as 0 to auto-calculate EMI from loan terms above."
                />
              </div>
            )}
          </div>

          {/* Step 4: Upfront Cash & Appreciation */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-xs rounded-md">Step 4</span>
              Upfront Investment & Appreciation Scenario
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInputNumber
                id="downPayment"
                label="Down Payment (₹)"
                value={downPayment}
                onChange={(v) => setDownPayment(v)}
                min={0}
                max={1000000000}
                step={50000}
                prefix="₹"
              />

              <FormInputNumber
                id="acquisitionCosts"
                label="Stamp Duty / Legal Fees (₹)"
                value={acquisitionCosts}
                onChange={(v) => setAcquisitionCosts(v)}
                min={0}
                max={50000000}
                step={10000}
                prefix="₹"
              />

              <FormInputNumber
                id="initialRenovation"
                label="Renovation / Furnishing (₹)"
                value={initialRenovation}
                onChange={(v) => setInitialRenovation(v)}
                min={0}
                max={50000000}
                step={10000}
                prefix="₹"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="annualAppreciationRatePercent"
                label="Annual Property Appreciation (% p.a.)"
                value={annualAppreciationRatePercent}
                onChange={(v) => setAnnualAppreciationRatePercent(v)}
                min={0}
                max={25}
                step={0.5}
                helpText="Isolated capital appreciation scenario (excluded from operating yield)."
              />

              <FormInputNumber
                id="holdingYears"
                label="Holding Period (Years)"
                value={holdingYears}
                onChange={(v) => setHoldingYears(v)}
                min={1}
                max={40}
                step={1}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Key Outputs & Visual Cash Flow (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {!results.isValid ? (
            <div class="p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-center space-y-2">
              <span class="text-2xl">⚠️</span>
              <h4 class="font-bold text-amber-700 dark:text-amber-300 text-sm">Valid Property Price Required</h4>
              <p class="text-xs text-amber-600 dark:text-amber-400">{results.validationMessage}</p>
            </div>
          ) : (
            <>
              {/* Output Metrics Grid Card */}
              <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
                <h3 class="text-sm font-bold uppercase tracking-wider text-muted">
                  Performance Metrics Summary
                </h3>

                {/* Primary Metric: Net Rental Yield */}
                <div class="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/40 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-amber-900 dark:text-amber-300">Net Rental Yield</span>
                    <span class="text-xl font-mono font-black text-amber-600 dark:text-amber-400">
                      {results.netRentalYieldPercent}%
                    </span>
                  </div>
                  <p class="text-[11px] text-amber-700/80 dark:text-amber-400 leading-relaxed">
                    NOI ({fmt(results.noi)}) / Purchase Price ({fmt(results.propertyPurchasePrice)})
                  </p>
                </div>

                {/* KPI Grid */}
                <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 bg-surface-soft rounded-xl border border-hairline space-y-0.5">
                    <span class="text-[11px] text-muted font-medium block">Gross Rental Yield</span>
                    <span class="text-base font-mono font-bold text-ink block">{results.grossRentalYieldPercent}%</span>
                  </div>

                  <div class="p-3 bg-surface-soft rounded-xl border border-hairline space-y-0.5">
                    <span class="text-[11px] text-muted font-medium block">Cap Rate %</span>
                    <span class="text-base font-mono font-bold text-ink block">{results.capRatePercent}%</span>
                  </div>

                  <div class="p-3 bg-surface-soft rounded-xl border border-hairline space-y-0.5">
                    <span class="text-[11px] text-muted font-medium block">Monthly Net Cash Flow</span>
                    <span class={`text-base font-mono font-bold block ${results.monthlyNetCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {fmt(results.monthlyNetCashFlow)} / mo
                    </span>
                  </div>

                  <div class="p-3 bg-surface-soft rounded-xl border border-hairline space-y-0.5">
                    <span class="text-[11px] text-muted font-medium block">Cash-on-Cash Return</span>
                    <span class={`text-base font-mono font-bold block ${results.cashOnCashReturnPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {results.cashOnCashReturnPercent}%
                    </span>
                  </div>
                </div>

                {/* Cash Flow Waterfall Visual Breakdown */}
                <div class="pt-2 space-y-2">
                  <span class="text-xs font-bold text-muted uppercase tracking-wider block">
                    Cash Flow Waterfall Breakdown (Annual)
                  </span>
                  <div class="space-y-1.5 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="text-muted">Gross Annual Rent:</span>
                      <span class="font-mono font-bold text-ink">{fmt(results.annualGrossRent)}</span>
                    </div>
                    <div class="flex items-center justify-between text-rose-600">
                      <span>− Vacancy Loss ({vacancyRatePercent}%):</span>
                      <span class="font-mono">−{fmt(results.vacancyLoss)}</span>
                    </div>
                    <div class="flex items-center justify-between font-semibold">
                      <span>= Effective Gross Income (EGI):</span>
                      <span class="font-mono">{fmt(results.effectiveGrossIncome)}</span>
                    </div>
                    <div class="flex items-center justify-between text-rose-600">
                      <span>− Operating Expenses (Opex):</span>
                      <span class="font-mono">−{fmt(results.operatingExpenses)}</span>
                    </div>
                    <div class="flex items-center justify-between pt-1 border-t border-hairline font-bold text-amber-600">
                      <span>= Net Operating Income (NOI):</span>
                      <span class="font-mono">{fmt(results.noi)}</span>
                    </div>
                    {isFinanced && (
                      <div class="flex items-center justify-between text-rose-600">
                        <span>− Annual Mortgage Debt Service:</span>
                        <span class="font-mono">−{fmt(results.annualDebtService)}</span>
                      </div>
                    )}
                    <div class={`flex items-center justify-between pt-1 border-t border-hairline font-extrabold ${results.annualPreTaxCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <span>= Annual Pre-Tax Cash Flow:</span>
                      <span class="font-mono">{fmt(results.annualPreTaxCashFlow)}</span>
                    </div>
                  </div>
                </div>

                {/* Appreciation Scenario Box */}
                {annualAppreciationRatePercent > 0 && (
                  <div class="p-3 bg-surface-soft rounded-xl border border-hairline space-y-1">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-muted">Illustrative Value in {holdingYears} Yrs ({annualAppreciationRatePercent}% p.a.):</span>
                      <span class="font-mono font-bold text-emerald-600">{fmt(results.appreciationScenario.futureValue)}</span>
                    </div>
                    <p class="text-[10px] text-muted">
                      Estimated capital gain of {fmt(results.appreciationScenario.totalAppreciation)} over {holdingYears} years (kept separate from operating yields).
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Insight Card */}
              <div class="p-5 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-2xl space-y-2">
                <span class="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  💡 Educational Performance Analysis
                </span>
                <p class="text-xs text-ink leading-relaxed">
                  Your property generates a Net Operating Income (NOI) of {fmt(results.noi)} per year, representing a Net Rental Yield of {results.netRentalYieldPercent}% and a Cap Rate of {results.capRatePercent}%. {isFinanced ? `After subtracting annual mortgage debt service of ${fmt(results.annualDebtService)}, your estimated pre-tax cash flow is ${fmt(results.annualPreTaxCashFlow)} per year (${fmt(results.monthlyNetCashFlow)}/mo), yielding a Cash-on-Cash Return of ${results.cashOnCashReturnPercent}%.` : 'Since the property is 100% cash funded, your pre-tax cash flow equals your NOI.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Share Actions & Financial Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Rental Yield & Property ROI Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational real estate financial planning model. Yields and cash flows are estimates based on user inputs; actual rental income, property taxes, vacancy rates, and mortgage costs vary by individual property and jurisdiction.
        </p>
      </div>
    </div>
  );
}
