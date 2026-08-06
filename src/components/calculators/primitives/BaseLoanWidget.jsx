import { useState, useMemo } from 'preact/hooks';
import { formatCurrency } from '@utils/formatters.js';
import { calculatePercentage } from '@utils/mathHelpers.js';
import { getCurrencySymbol } from '../../../constants/currencies.js';
import FormInputNumber from './FormInputNumber';
import FormToggleSwitch from './FormToggleSwitch';
import AmortizationTable from './AmortizationTable';
import ResultRatioBar from './ResultRatioBar';

export default function BaseLoanWidget({
  title = 'Loan Details',
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

  const interestPct = useMemo(() => {
    return calculatePercentage(results.totalInterest, results.totalPayment);
  }, [results]);

  const principalPct = 100 - interestPct;

  const ratioBarItems = [
    { label: 'Principal', percentage: principalPct, colorClass: 'bg-primary' },
    { label: 'Interest', percentage: interestPct, colorClass: 'bg-accent-amber' },
  ];

  return (
    <div class="space-y-8">
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Input Controls Panel */}
        <div class="lg:col-span-7 bg-canvas border border-hairline rounded-xl p-6 md:p-8 space-y-6" aria-label="Calculator input parameters">
          <h3 class="text-lg font-semibold text-ink border-b border-hairline pb-3">{title}</h3>

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
                  { label: 'Yr', value: 'years' },
                  { label: 'Mo', value: 'months' },
                ]}
              />

              <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-md border border-hairline focus-within:border-primary">
                <input
                  type="number"
                  id={tenureConfig.id}
                  value={tenure}
                  onInput={(e) => setTenure(Number(e.currentTarget.value) || 1)}
                  min={1}
                  max={tenureType === 'years' ? (tenureConfig.maxYears || 30) : (tenureConfig.maxMonths || 360)}
                  step={1}
                  class="w-20 bg-transparent text-right font-mono text-sm font-semibold text-ink focus:outline-none"
                  aria-label={`${tenureConfig.label} quantity`}
                />
                <span class="text-xs font-mono text-muted ml-1">{tenureType === 'years' ? 'Yrs' : 'Mos'}</span>
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
              class="w-full h-2 bg-surface-strong rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label={`${tenureConfig.label} slider`}
            />
            <div class="flex justify-between text-[11px] font-mono text-muted mt-1">
              <span>1 {tenureType === 'years' ? 'Yr' : 'Mo'}</span>
              <span>{tenureType === 'years' ? `${tenureConfig.maxYears || 30} Yrs` : `${tenureConfig.maxMonths || 360} Mos`}</span>
            </div>
          </div>

          {/* Optional Extra Inputs Slot */}
          {extraInputs}
        </div>

        {/* Sticky Result Panel */}
        <div class="lg:col-span-5 bg-canvas border border-hairline rounded-xl p-6 md:p-8 shadow-soft space-y-6 sticky top-24" aria-label="Loan calculation summary">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">Monthly EMI</span>
            <div class="typography-result-mega text-ink font-mono" aria-live="polite">
              {formatCurrency(results.emi, currency)}
            </div>
          </div>

          {/* Principal vs Interest Visual Ratio Bar */}
          <ResultRatioBar items={ratioBarItems} />

          {/* Summary Breakdown */}
          <div class="space-y-3 pt-4 border-t border-hairline text-sm">
            <div class="flex justify-between items-center">
              <span class="text-body">Principal Amount</span>
              <span class="font-mono font-medium text-ink">{formatCurrency(results.principal, currency)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-body">Total Interest Payable</span>
              <span class="font-mono font-medium text-semantic-down">{formatCurrency(results.totalInterest, currency)}</span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-hairline-soft font-semibold">
              <span class="text-ink">Total Amount Payable</span>
              <span class="font-mono text-ink text-base">{formatCurrency(results.totalPayment, currency)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAmortization(!showAmortization)}
            aria-expanded={showAmortization}
            aria-controls="amortization-schedule-container"
            class="w-full button-secondary-light text-center"
          >
            {showAmortization ? 'Hide Amortization Table' : 'View Full Schedule'}
          </button>
        </div>
      </div>

      {/* Collapsible Amortization Table */}
      {showAmortization && (
        <div id="amortization-schedule-container">
          <AmortizationTable schedule={results.schedule} currency={currency} />
        </div>
      )}
    </div>
  );
}
