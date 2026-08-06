import { useState, useMemo } from 'preact/hooks';
import { formatCurrency } from '@utils/formatters.js';
import { calculatePercentage } from '@utils/mathHelpers.js';
import { getCurrencySymbol } from '../../../constants/currencies.js';
import FormInputNumber from './FormInputNumber';
import ResultRatioBar from './ResultRatioBar';

export default function BaseInvestmentWidget({
  title = 'Investment Details',
  currency = 'INR',
  currencySymbol,
  monthlyConfig = { id: 'sip-monthly', label: 'Monthly Investment', min: 500, max: 1000000, step: 500, minLabel: '₹500', maxLabel: '₹10L', default: 5000 },
  rateConfig = { id: 'sip-rate', label: 'Expected Return Rate (p.a.)', min: 1, max: 30, step: 0.5, suffix: '%', minLabel: '1%', maxLabel: '30%', default: 12 },
  tenureConfig = { id: 'sip-tenure', label: 'Investment Period (Years)', min: 1, max: 40, step: 1, minLabel: '1 Yr', maxLabel: '40 Yrs', default: 10 },
  calculateFn,
}) {
  const symbol = currencySymbol || getCurrencySymbol(currency);
  const [monthlyInvestment, setMonthlyInvestment] = useState(monthlyConfig.default);
  const [expectedReturnRate, setExpectedReturnRate] = useState(rateConfig.default);
  const [tenureYears, setTenureYears] = useState(tenureConfig.default);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const results = useMemo(() => {
    return calculateFn({ monthlyInvestment, expectedReturnRate, tenureYears });
  }, [monthlyInvestment, expectedReturnRate, tenureYears, calculateFn]);

  const investedPct = useMemo(() => {
    return calculatePercentage(results.totalInvested, results.maturityValue);
  }, [results]);

  const returnsPct = 100 - investedPct;

  const ratioBarItems = [
    { label: 'Invested Amount', percentage: investedPct, colorClass: 'bg-primary' },
    { label: 'Est. Returns', percentage: returnsPct, colorClass: 'bg-semantic-up' },
  ];

  return (
    <div class="space-y-8">
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Input Controls Panel */}
        <div class="lg:col-span-7 bg-canvas border border-hairline rounded-xl p-6 md:p-8 space-y-6" aria-label="Investment calculator inputs">
          <h3 class="text-lg font-semibold text-ink border-b border-hairline pb-3">{title}</h3>

          {/* Monthly Investment Input */}
          <FormInputNumber
            id={monthlyConfig.id}
            label={monthlyConfig.label}
            value={monthlyInvestment}
            min={monthlyConfig.min}
            max={monthlyConfig.max}
            step={monthlyConfig.step}
            prefix={symbol}
            onChange={setMonthlyInvestment}
            minLabel={monthlyConfig.minLabel}
            maxLabel={monthlyConfig.maxLabel}
          />

          {/* Expected Return Rate Input */}
          <FormInputNumber
            id={rateConfig.id}
            label={rateConfig.label}
            value={expectedReturnRate}
            min={rateConfig.min}
            max={rateConfig.max}
            step={rateConfig.step}
            suffix={rateConfig.suffix || '%'}
            onChange={setExpectedReturnRate}
            minLabel={rateConfig.minLabel}
            maxLabel={rateConfig.maxLabel}
          />

          {/* Tenure Years Input */}
          <FormInputNumber
            id={tenureConfig.id}
            label={tenureConfig.label}
            value={tenureYears}
            min={tenureConfig.min}
            max={tenureConfig.max}
            step={tenureConfig.step}
            suffix="Yrs"
            onChange={setTenureYears}
            minLabel={tenureConfig.minLabel}
            maxLabel={tenureConfig.maxLabel}
          />
        </div>

        {/* Sticky Result Summary Card */}
        <div class="lg:col-span-5 bg-canvas border border-hairline rounded-xl p-6 md:p-8 shadow-soft space-y-6 sticky top-24" aria-label="Investment growth summary">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">Expected Maturity Value</span>
            <div class="typography-result-mega text-ink font-mono" aria-live="polite">
              {formatCurrency(results.maturityValue, currency)}
            </div>
          </div>

          {/* Invested vs Returns Segmented Ratio Bar */}
          <ResultRatioBar items={ratioBarItems} />

          {/* Summary Breakdown */}
          <div class="space-y-3 pt-4 border-t border-hairline text-sm">
            <div class="flex justify-between items-center">
              <span class="text-body">Total Invested Amount</span>
              <span class="font-mono font-medium text-ink">{formatCurrency(results.totalInvested, currency)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-body">Estimated Wealth Gain</span>
              <span class="font-mono font-medium text-semantic-up">{formatCurrency(results.estReturns, currency)}</span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-hairline-soft font-semibold">
              <span class="text-ink">Total Maturity Corpus</span>
              <span class="font-mono text-ink text-base">{formatCurrency(results.maturityValue, currency)}</span>
            </div>
          </div>

          {results.yearlyBreakdown && results.yearlyBreakdown.length > 0 && (
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              aria-expanded={showBreakdown}
              aria-controls="yearly-breakdown-schedule-container"
              class="w-full button-secondary-light text-center"
            >
              {showBreakdown ? 'Hide Yearly Schedule' : 'View Yearly Growth Schedule'}
            </button>
          )}
        </div>
      </div>

      {/* Yearly Growth Schedule Table */}
      {showBreakdown && results.yearlyBreakdown && (
        <div id="yearly-breakdown-schedule-container" class="bg-canvas border border-hairline rounded-xl p-6 overflow-hidden">
          <h4 class="text-lg font-semibold text-ink mb-4">Yearly Wealth Growth Schedule</h4>
          <div class="overflow-x-auto max-h-96 overflow-y-auto">
            <table class="w-full text-left border-collapse text-xs font-mono">
              <thead class="sticky top-0 bg-surface-soft text-ink font-semibold">
                <tr>
                  <th class="p-3 border-b border-hairline">Year</th>
                  <th class="p-3 border-b border-hairline">Total Invested</th>
                  <th class="p-3 border-b border-hairline">Est. Returns</th>
                  <th class="p-3 border-b border-hairline">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyBreakdown.map((row) => (
                  <tr key={row.year} class="border-b border-hairline-soft hover:bg-surface-soft/50 transition-colors">
                    <td class="p-3 font-semibold text-ink">Yr {row.year}</td>
                    <td class="p-3 text-body">{formatCurrency(row.invested, currency)}</td>
                    <td class="p-3 text-semantic-up">{formatCurrency(row.returns, currency)}</td>
                    <td class="p-3 font-semibold text-ink">{formatCurrency(row.totalValue, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
