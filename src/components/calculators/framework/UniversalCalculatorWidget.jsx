import { useState, useMemo } from 'preact/hooks';
import { formatCurrency } from '@utils/formatters.js';
import { calculatePercentage } from '@utils/mathHelpers.js';
import GenericInputRenderer from './GenericInputRenderer';
import ResultRatioBar from '../primitives/ResultRatioBar';
import AmortizationTable from '../primitives/AmortizationTable';

export default function UniversalCalculatorWidget({ config }) {
  const {
    title = 'Calculator Details',
    currency = 'INR',
    inputs = [],
    calculateFn,
    primaryResult = {},
    ratioBarItems = [],
    summaryItems = [],
    hasAmortizationTable = false,
    hasYearlySchedule = false,
  } = config;

  // Initialize form state from input config defaults
  const initialValues = useMemo(() => {
    const vals = {};
    inputs.forEach((input) => {
      vals[input.id] = input.default ?? 0;
      if (input.type === 'tenure') {
        vals[`${input.id}Type`] = input.defaultTenureType || 'years';
      }
    });
    return vals;
  }, [inputs]);

  const [formValues, setFormValues] = useState(initialValues);
  const [showTable, setShowTable] = useState(false);

  const handleInputChange = (fieldId, value) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Run calculation dynamically
  const results = useMemo(() => {
    return calculateFn(formValues);
  }, [formValues, calculateFn]);

  // Compute visual ratio bar percentages
  const ratioItems = useMemo(() => {
    if (!ratioBarItems || ratioBarItems.length === 0) return [];
    const totalVal = results.totalPayment || results.maturityValue || results.totalValue || 0;
    return ratioBarItems.map((item) => {
      const val = results[item.key] || 0;
      const pct = calculatePercentage(val, totalVal);
      return {
        label: item.label,
        percentage: pct,
        colorClass: item.colorClass || 'bg-primary',
      };
    });
  }, [ratioBarItems, results]);

  return (
    <div class="space-y-8">
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Input Controls Panel */}
        <div class="lg:col-span-7 bg-canvas border border-hairline rounded-xl p-6 md:p-8 space-y-6" aria-label="Calculator input parameters">
          <h3 class="text-lg font-semibold text-ink border-b border-hairline pb-3">{title}</h3>

          {inputs.map((inputConfig) => (
            <GenericInputRenderer
              key={inputConfig.id}
              inputConfig={inputConfig}
              values={formValues}
              onChange={handleInputChange}
            />
          ))}
        </div>

        {/* Sticky Result Summary Card */}
        <div class="lg:col-span-5 bg-canvas border border-hairline rounded-xl p-6 md:p-8 shadow-soft space-y-6 sticky top-24" aria-label="Calculation output summary">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">
              {primaryResult.label || 'Result'}
            </span>
            <div class="typography-result-mega text-ink font-mono" aria-live="polite">
              {formatCurrency(results[primaryResult.key] || 0, currency)}
            </div>
          </div>

          {/* Segmented Ratio Progress Bar */}
          {ratioItems.length > 0 && <ResultRatioBar items={ratioItems} />}

          {/* Summary Items Breakdown */}
          {summaryItems.length > 0 && (
            <div class="space-y-3 pt-4 border-t border-hairline text-sm">
              {summaryItems.map((item) => {
                const val = results[item.key] || 0;
                return (
                  <div
                    key={item.key}
                    class={`flex justify-between items-center ${
                      item.isTotal ? 'pt-2 border-t border-hairline-soft font-semibold' : ''
                    }`}
                  >
                    <span class={item.isTotal ? 'text-ink' : 'text-body'}>{item.label}</span>
                    <span
                      class={`font-mono ${item.isTotal ? 'text-ink text-base' : 'font-medium'} ${
                        item.class || 'text-ink'
                      }`}
                    >
                      {formatCurrency(val, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Toggle Schedule Table Button */}
          {(hasAmortizationTable || hasYearlySchedule) && (
            <button
              type="button"
              onClick={() => setShowTable(!showTable)}
              aria-expanded={showTable}
              aria-controls="calculator-schedule-table-container"
              class="w-full button-secondary-light text-center"
            >
              {showTable ? 'Hide Schedule Table' : 'View Full Schedule'}
            </button>
          )}
        </div>
      </div>

      {/* Amortization Table */}
      {showTable && hasAmortizationTable && results.schedule && (
        <div id="calculator-schedule-table-container">
          <AmortizationTable schedule={results.schedule} currency={currency} />
        </div>
      )}

      {/* Yearly Growth Schedule Table */}
      {showTable && hasYearlySchedule && results.yearlyBreakdown && (
        <div id="calculator-schedule-table-container" class="bg-canvas border border-hairline rounded-xl p-6 overflow-hidden">
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
