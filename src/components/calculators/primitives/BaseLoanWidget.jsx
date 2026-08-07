import { useState, useMemo } from 'preact/hooks';
import { formatCurrency } from '@utils/formatters.js';
import { getCurrencySymbol } from '../../../constants/currencies.js';
import FormInputNumber from './FormInputNumber';
import FormToggleSwitch from './FormToggleSwitch';
import AmortizationTable from './AmortizationTable';
import EmiDonutChart from './EmiDonutChart';

export default function BaseLoanWidget({
  title = 'Loan Repayment Parameters',
  currency = 'INR',
  currencySymbol,
  amountConfig = { id: 'amount', label: 'Loan Amount', min: 10000, max: 20000000, step: 10000, minLabel: '₹10K', maxLabel: '₹2 Cr', default: 1000000 },
  rateConfig = { id: 'rate', label: 'Interest Rate (p.a.)', min: 0, max: 30, step: 0.1, suffix: '%', minLabel: '0%', maxLabel: '30%', default: 8.5 },
  tenureConfig = { id: 'tenure', label: 'Tenure', maxYears: 30, maxMonths: 360, default: 20 },
  calculateFn,
  extraInputs,
}) {
  const symbol = currencySymbol || getCurrencySymbol(currency);
  const [amount, setAmount] = useState(amountConfig.default);
  const [rate, setRate] = useState(rateConfig.default);
  const [tenure, setTenure] = useState(tenureConfig.default);
  const [tenureType, setTenureType] = useState('years');
  const [showAmortization, setShowAmortization] = useState(false);

  const handleTenureTypeChange = (newType) => {
    if (newType === tenureType) return;
    if (newType === 'months') {
      setTenure(Math.min(tenureConfig.maxMonths || 360, tenure * 12));
    } else {
      setTenure(Math.max(1, Math.round(tenure / 12)));
    }
    setTenureType(newType);
  };

  const results = useMemo(() => {
    return calculateFn({ amount, rate, tenure, tenureType });
  }, [amount, rate, tenure, tenureType, calculateFn]);

  return (
    <div class="space-y-8">
      {/* Top Main Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-2xl p-6 md:p-8 space-y-6 shadow-soft" aria-label="Calculator input parameters">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">{title}</h3>
            <span class="text-xs font-mono font-medium text-primary bg-primary/10 px-3 py-1 rounded-pill">
              100% Client-Side
            </span>
          </div>

          {/* Amount Input */}
          <FormInputNumber
            id={amountConfig.id}
            label={amountConfig.label}
            value={amount}
            min={amountConfig.min}
            max={amountConfig.max}
            step={amountConfig.step}
            prefix={symbol}
            onChange={setAmount}
            minLabel={amountConfig.minLabel}
            maxLabel={amountConfig.maxLabel}
          />

          {/* Interest Rate Input */}
          <FormInputNumber
            id={rateConfig.id}
            label={rateConfig.label}
            value={rate}
            min={rateConfig.min}
            max={rateConfig.max}
            step={rateConfig.step}
            suffix={rateConfig.suffix || '%'}
            onChange={setRate}
            minLabel={rateConfig.minLabel}
            maxLabel={rateConfig.maxLabel}
          />

          {/* Tenure Input */}
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <FormToggleSwitch
                label={tenureConfig.label}
                value={tenureType}
                onChange={handleTenureTypeChange}
                options={[
                  { label: 'Years', value: 'years' },
                  { label: 'Months', value: 'months' },
                ]}
              />

              <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                <input
                  type="number"
                  id={tenureConfig.id}
                  value={tenure}
                  onInput={(e) => setTenure(Number(e.currentTarget.value) || 1)}
                  min={1}
                  max={tenureType === 'years' ? (tenureConfig.maxYears || 30) : (tenureConfig.maxMonths || 360)}
                  step={1}
                  class="w-20 bg-transparent text-right font-mono text-base font-bold text-ink focus:outline-none"
                  aria-label={`${tenureConfig.label} quantity`}
                />
                <span class="text-xs font-mono text-muted ml-1.5 font-semibold">{tenureType === 'years' ? 'Yrs' : 'Mos'}</span>
              </div>
            </div>
            <input
              type="range"
              id={`${tenureConfig.id}-slider`}
              min={1}
              max={tenureType === 'years' ? (tenureConfig.maxYears || 30) : (tenureConfig.maxMonths || 360)}
              step={1}
              value={tenure}
              onInput={(e) => setTenure(Number(e.currentTarget.value))}
              class="w-full h-2.5 bg-surface-strong rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label={`${tenureConfig.label} slider`}
            />
            <div class="flex justify-between text-[11px] font-mono text-muted mt-1.5 font-medium">
              <span>1 {tenureType === 'years' ? 'Year' : 'Month'}</span>
              <span>{tenureType === 'years' ? `${tenureConfig.maxYears || 30} Years` : `${tenureConfig.maxMonths || 360} Months`}</span>
            </div>
          </div>

          {extraInputs}
        </div>

        {/* Right Panel: Flagship Results & KPI Dashboard */}
        <div class="lg:col-span-6 space-y-6">
          {/* Monthly EMI Mega KPI Card */}
          <div class="p-6 md:p-8 bg-gradient-to-br from-primary to-primary-active text-white rounded-2xl shadow-glass space-y-3 relative overflow-hidden">
            <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-blue-100 font-heading">Monthly EMI Repayment</span>
              <span class="text-[11px] font-mono bg-white/20 px-2.5 py-0.5 rounded-pill font-semibold text-white">Fixed Monthly</span>
            </div>
            <div class="text-4xl md:text-5xl font-extrabold font-mono tracking-tight" aria-live="polite">
              {formatCurrency(results.emi, currency)}
            </div>
            <p class="text-xs text-blue-100 leading-relaxed pt-1">
              Your exact required monthly installment for {tenure} {tenureType} at {rate}% annual interest.
            </p>
          </div>

          {/* KPI Summary Cards Grid */}
          <div class="grid grid-cols-3 gap-3">
            <div class="p-4 bg-canvas border border-hairline rounded-xl shadow-soft">
              <span class="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Principal</span>
              <span class="text-sm md:text-base font-bold font-mono text-ink block truncate">{formatCurrency(results.principal, currency)}</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-xl shadow-soft">
              <span class="block text-[11px] font-semibold text-semantic-warning uppercase tracking-wider mb-1">Total Interest</span>
              <span class="text-sm md:text-base font-bold font-mono text-semantic-warning block truncate">{formatCurrency(results.totalInterest, currency)}</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-xl shadow-soft">
              <span class="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">Total Outflow</span>
              <span class="text-sm md:text-base font-bold font-mono text-ink block truncate">{formatCurrency(results.totalPayment, currency)}</span>
            </div>
          </div>

          {/* Animated Donut Ratio Breakdown */}
          <EmiDonutChart
            principal={results.principal}
            totalInterest={results.totalInterest}
            totalPayment={results.totalPayment}
            currency={currency}
          />

          {/* Schedule Action Button */}
          <button
            type="button"
            onClick={() => setShowAmortization(!showAmortization)}
            aria-expanded={showAmortization}
            aria-controls="amortization-schedule-container"
            class="w-full py-3.5 px-6 bg-surface-strong hover:bg-hairline text-ink font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-hairline"
          >
            <svg class={`w-4 h-4 text-primary transition-transform ${showAmortization ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
            <span>{showAmortization ? 'Hide Amortization Schedule' : 'View Full Amortization Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Amortization Table */}
      {showAmortization && (
        <div id="amortization-schedule-container" class="pt-4">
          <AmortizationTable schedule={results.schedule} currency={currency} />
        </div>
      )}
    </div>
  );
}
