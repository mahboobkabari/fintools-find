import { useState, useMemo } from 'preact/hooks';
import { calculateGrossRentMultiplier } from '../../../calculators/real-estate/gross-rent-multiplier-calculator.js';
import { GRM_CONFIG } from '../../../calculators/configs/gross-rent-multiplier-calculator.config.js';
import FormInputNumber from './FormInputNumber.jsx';
import ShareActions from '../../ui/ShareActions.jsx';
import { formatCurrency } from '@utils/formatters.js';

export default function GRMFlagshipWidget() {
  const [currentPropertyValue, setCurrentPropertyValue] = useState(GRM_CONFIG.defaultInputs.currentPropertyValue);
  const [monthlyGrossRent, setMonthlyGrossRent] = useState(GRM_CONFIG.defaultInputs.monthlyGrossRent);
  const [otherAnnualGrossIncome, setOtherAnnualGrossIncome] = useState(GRM_CONFIG.defaultInputs.otherAnnualGrossIncome);
  const [targetGRM, setTargetGRM] = useState(GRM_CONFIG.defaultInputs.targetGRM);
  const [comparablePropertyPrice, setComparablePropertyPrice] = useState('');
  const [comparableAnnualGrossRent, setComparableAnnualGrossRent] = useState('');
  const [showComparable, setShowComparable] = useState(false);

  const results = useMemo(() => {
    const inputs = {
      currentPropertyValue,
      monthlyGrossRent,
      otherAnnualGrossIncome,
      targetGRM,
    };
    if (showComparable && comparablePropertyPrice && comparableAnnualGrossRent) {
      inputs.comparablePropertyPrice = Number(comparablePropertyPrice);
      inputs.comparableAnnualGrossRent = Number(comparableAnnualGrossRent);
    }
    return calculateGrossRentMultiplier(inputs);
  }, [currentPropertyValue, monthlyGrossRent, otherAnnualGrossIncome, targetGRM, comparablePropertyPrice, comparableAnnualGrossRent, showComparable]);

  const handleApplyPreset = (presetKey) => {
    const s = GRM_CONFIG.scenarios[presetKey];
    if (s) {
      setCurrentPropertyValue(s.currentPropertyValue);
      setMonthlyGrossRent(s.monthlyGrossRent);
      setOtherAnnualGrossIncome(s.otherAnnualGrossIncome);
      setTargetGRM(s.targetGRM);
    }
  };

  const fmt = (val) => (val !== null && val !== undefined ? formatCurrency(val, 'INR') : 'N/A');

  return (
    <div class="space-y-8">
      {/* 1. Hero Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-emerald-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              📊 Gross Income Screening Tool
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Gross Rent Multiplier Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Estimate property value using annual gross rental income and target GRM — a quick screening metric for real estate investment analysis.
            </p>
          </div>

          <div class="bg-emerald-900/50 border border-emerald-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
              Implied Property Value
            </span>
            <div class="text-3xl sm:text-4xl font-black text-emerald-200 mt-1" aria-live="polite">
              {results.isValid && results.impliedValue > 0 ? fmt(results.impliedValue) : 'N/A'}
            </div>
            <div class="text-xs text-emerald-300/80 mt-1">
              Based on {results.targetGRM ?? 'N/A'}× Target GRM
            </div>
          </div>
        </div>

        {/* Hero KPI Grid */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-800/50">
          <div class="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <span class="text-xs text-slate-400 font-medium block">Current GRM</span>
            <span class="text-lg font-bold text-white" aria-live="polite">
              {results.currentGRM !== null ? `${results.currentGRM}×` : 'Omitted'}
            </span>
          </div>

          <div class="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <span class="text-xs text-slate-400 font-medium block">Annual Gross Rent</span>
            <span class="text-lg font-bold text-emerald-400" aria-live="polite">
              {fmt(results.annualGrossRent)}
            </span>
          </div>

          <div class="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <span class="text-xs text-slate-400 font-medium block">Gross Rent Yield</span>
            <span class="text-lg font-bold text-teal-300" aria-live="polite">
              {results.grossRentYieldPct > 0 ? `${results.grossRentYieldPct}%` : 'N/A'}
            </span>
          </div>

          <div class="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <span class="text-xs text-slate-400 font-medium block">GRM Difference</span>
            <span class={`text-lg font-bold ${
              results.grmDifference === null
                ? 'text-slate-400'
                : results.grmDifference > 0
                ? 'text-amber-400'
                : results.grmDifference < 0
                ? 'text-emerald-400'
                : 'text-white'
            }`} aria-live="polite">
              {results.grmDifference !== null
                ? `${results.grmDifference > 0 ? '+' : ''}${results.grmDifference}`
                : 'Omitted'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Preset Quick Selector */}
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          ⚡ Illustrative GRM Presets
        </span>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {Object.entries(GRM_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 transition-all text-xs"
            >
              <div class="font-bold text-slate-800 dark:text-slate-200">{s.title}</div>
              <div class="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{s.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Interactive Input Panel */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Property & Income */}
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">1</span>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Property & Rental Income</h3>
          </div>

          <FormInputNumber
            id="currentPropertyValue"
            label="Current Property Value / Asking Price (₹)"
            value={currentPropertyValue}
            min={GRM_CONFIG.fieldBoundaries.currentPropertyValue.min}
            max={GRM_CONFIG.fieldBoundaries.currentPropertyValue.max}
            step={GRM_CONFIG.fieldBoundaries.currentPropertyValue.step}
            onChange={setCurrentPropertyValue}
          />

          <FormInputNumber
            id="monthlyGrossRent"
            label="Monthly Gross Rent (₹)"
            value={monthlyGrossRent}
            min={GRM_CONFIG.fieldBoundaries.monthlyGrossRent.min}
            max={GRM_CONFIG.fieldBoundaries.monthlyGrossRent.max}
            step={GRM_CONFIG.fieldBoundaries.monthlyGrossRent.step}
            onChange={setMonthlyGrossRent}
          />

          <FormInputNumber
            id="otherAnnualGrossIncome"
            label="Other Annual Gross Income (₹)"
            value={otherAnnualGrossIncome}
            min={GRM_CONFIG.fieldBoundaries.otherAnnualGrossIncome.min}
            max={GRM_CONFIG.fieldBoundaries.otherAnnualGrossIncome.max}
            step={GRM_CONFIG.fieldBoundaries.otherAnnualGrossIncome.step}
            onChange={setOtherAnnualGrossIncome}
          />

          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex justify-between">
            <span>Annual Gross Rental Income:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">{fmt(results.annualGrossRent)}</span>
          </div>
        </div>

        {/* Target GRM & Results */}
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span class="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 text-xs font-bold flex items-center justify-center">2</span>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Target GRM & Analysis</h3>
          </div>

          <FormInputNumber
            id="targetGRM"
            label="Target GRM"
            value={targetGRM}
            min={GRM_CONFIG.fieldBoundaries.targetGRM.min}
            max={GRM_CONFIG.fieldBoundaries.targetGRM.max}
            step={GRM_CONFIG.fieldBoundaries.targetGRM.step}
            onChange={setTargetGRM}
          />

          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 text-xs">
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Current GRM:</span>
              <span class="font-semibold text-slate-900 dark:text-white">
                {results.currentGRM !== null ? `${results.currentGRM}×` : 'Not available'}
              </span>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Target GRM:</span>
              <span class="font-semibold text-slate-900 dark:text-white">
                {results.targetGRM !== null ? `${results.targetGRM}×` : 'N/A'}
              </span>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>GRM Difference:</span>
              <span class={`font-semibold ${results.grmDifference !== null && results.grmDifference > 0 ? 'text-amber-500' : results.grmDifference !== null && results.grmDifference < 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                {results.grmDifference !== null ? `${results.grmDifference > 0 ? '+' : ''}${results.grmDifference}` : 'N/A'}
              </span>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>GRM Difference %:</span>
              <span class="font-semibold text-slate-900 dark:text-white">
                {results.grmDifferencePct !== null ? `${results.grmDifferencePct > 0 ? '+' : ''}${results.grmDifferencePct}%` : 'N/A'}
              </span>
            </div>
            <div class="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
              <span>Implied Property Value:</span>
              <span class="text-emerald-600 dark:text-emerald-400">{results.impliedValue > 0 ? fmt(results.impliedValue) : 'N/A'}</span>
            </div>
            {results.valueDifference !== null && (
              <div class="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Value Difference:</span>
                <span class={`font-semibold ${results.valueDifference >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {fmt(results.valueDifference)} ({results.valueDifferencePct > 0 ? '+' : ''}{results.valueDifferencePct}%)
                </span>
              </div>
            )}
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Gross Rent Yield:</span>
              <span class="font-semibold text-teal-600 dark:text-teal-400">
                {results.grossRentYieldPct > 0 ? `${results.grossRentYieldPct}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Educational Callout */}
      <div class="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-sm">
        <div class="flex items-start gap-3">
          <span class="text-xl">⚠️</span>
          <div>
            <h4 class="font-bold text-base mb-2">GRM is a Gross-Income Screening Metric</h4>
            <p class="leading-relaxed mb-2">
              Gross Rent Multiplier uses <strong>gross rental income only</strong> and does not account for:
            </p>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li>Operating expenses (property tax, insurance, maintenance)</li>
              <li>Vacancy and credit losses</li>
              <li>Financing costs (mortgage, interest)</li>
              <li>Taxes and insurance</li>
              <li>Capital expenditures and reserves</li>
            </ul>
            <p class="mt-2 text-xs leading-relaxed">
              For a complete analysis, use GRM alongside <strong>Cap Rate</strong>, <strong>Net Rental Yield</strong>, and <strong>Cash-on-Cash Return</strong> calculators.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Optional Comparable Section */}
      <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <button
          type="button"
          onClick={() => setShowComparable(!showComparable)}
          class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          aria-expanded={showComparable}
        >
          <span class="text-lg">{showComparable ? '▼' : '►'}</span>
          Advanced: Comparable Property GRM
        </button>

        {showComparable && (
          <div class="space-y-4 pt-2">
            <FormInputNumber
              id="comparablePropertyPrice"
              label="Comparable Property Price (₹)"
              value={comparablePropertyPrice}
              min={GRM_CONFIG.fieldBoundaries.comparablePropertyPrice.min}
              max={GRM_CONFIG.fieldBoundaries.comparablePropertyPrice.max}
              step={GRM_CONFIG.fieldBoundaries.comparablePropertyPrice.step}
              onChange={setComparablePropertyPrice}
            />

            <FormInputNumber
              id="comparableAnnualGrossRent"
              label="Comparable Annual Gross Rent (₹)"
              value={comparableAnnualGrossRent}
              min={GRM_CONFIG.fieldBoundaries.comparableAnnualGrossRent.min}
              max={GRM_CONFIG.fieldBoundaries.comparableAnnualGrossRent.max}
              step={GRM_CONFIG.fieldBoundaries.comparableAnnualGrossRent.step}
              onChange={setComparableAnnualGrossRent}
            />

            {results.comparableGRM !== null && (
              <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm flex justify-between">
                <span class="text-slate-600 dark:text-slate-400 font-medium">Comparable GRM:</span>
                <span class="font-bold text-indigo-600 dark:text-indigo-400">{results.comparableGRM}×</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Detailed Breakdown Table */}
      {results.isValid && (
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 class="font-bold text-slate-900 dark:text-white text-lg">
            GRM Analysis Breakdown
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm" role="table" aria-label="GRM Analysis Breakdown">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase">
                  <th class="py-3 px-4" scope="col">Parameter</th>
                  <th class="py-3 px-4 text-right" scope="col">Value</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td class="py-3 px-4 font-medium">Monthly Gross Rent</td>
                  <td class="py-3 px-4 text-right font-semibold">{fmt(results.monthlyGrossRent)} / mo</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 font-medium">Other Annual Gross Income</td>
                  <td class="py-3 px-4 text-right font-semibold">{fmt(results.otherAnnualGrossIncome)} / yr</td>
                </tr>
                <tr class="bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-900 dark:text-emerald-200">
                  <td class="py-3 px-4">Annual Gross Rental Income</td>
                  <td class="py-3 px-4 text-right">{fmt(results.annualGrossRent)} / yr</td>
                </tr>
                {results.currentPropertyValue > 0 && (
                  <>
                    <tr>
                      <td class="py-3 px-4 font-medium">Current Property Value / Asking Price</td>
                      <td class="py-3 px-4 text-right font-semibold">{fmt(results.currentPropertyValue)}</td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 font-medium">Current GRM</td>
                      <td class="py-3 px-4 text-right font-semibold">{results.currentGRM !== null ? `${results.currentGRM}×` : 'N/A'}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td class="py-3 px-4 font-medium">Target GRM</td>
                  <td class="py-3 px-4 text-right font-semibold">{results.targetGRM !== null ? `${results.targetGRM}×` : 'N/A'}</td>
                </tr>
                <tr class="bg-teal-50 dark:bg-teal-950/30 font-bold text-teal-900 dark:text-teal-200 text-base">
                  <td class="py-3.5 px-4">Implied Property Value</td>
                  <td class="py-3.5 px-4 text-right text-teal-600 dark:text-teal-400">{results.impliedValue > 0 ? fmt(results.impliedValue) : 'N/A'}</td>
                </tr>
                {results.grmDifference !== null && (
                  <tr>
                    <td class="py-3 px-4 font-medium">GRM Difference (Current − Target)</td>
                    <td class="py-3 px-4 text-right font-semibold">
                      {results.grmDifference > 0 ? '+' : ''}{results.grmDifference} ({results.grmDifferencePct > 0 ? '+' : ''}{results.grmDifferencePct}%)
                    </td>
                  </tr>
                )}
                {results.valueDifference !== null && (
                  <tr>
                    <td class="py-3 px-4 font-medium">Value Difference (Implied − Current)</td>
                    <td class={`py-3 px-4 text-right font-semibold ${results.valueDifference >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {fmt(results.valueDifference)} ({results.valueDifferencePct > 0 ? '+' : ''}{results.valueDifferencePct}%)
                    </td>
                  </tr>
                )}
                <tr>
                  <td class="py-3 px-4 font-medium">Gross Rent Yield</td>
                  <td class="py-3 px-4 text-right font-semibold">{results.grossRentYieldPct > 0 ? `${results.grossRentYieldPct}%` : 'N/A'}</td>
                </tr>
                {results.comparableGRM !== null && (
                  <tr>
                    <td class="py-3 px-4 font-medium">Comparable GRM</td>
                    <td class="py-3 px-4 text-right font-semibold text-indigo-600 dark:text-indigo-400">{results.comparableGRM}×</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. 2D Sensitivity Matrix */}
      {results.isValid && results.sensitivity && (
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-lg">
              2D Implied Value Sensitivity Analysis
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Illustrative implied property values across varying annual gross rent scenarios and target GRM assumptions. This matrix is for screening purposes only.
            </p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono" role="table" aria-label="GRM Sensitivity Analysis Matrix">
              <thead>
                <tr class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th class="py-3 px-3" scope="col">Rent Scenario</th>
                  {results.sensitivity.grmScenarios.map((grm) => (
                    <th key={grm} scope="col" class={`py-3 px-3 text-right ${grm === results.targetGRM ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-black' : ''}`}>
                      {grm}× GRM
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                {results.sensitivity.rentScenarios.map((s, rIdx) => (
                  <tr key={s.label} class={s.pctChange === 0 ? 'bg-slate-50 dark:bg-slate-800/60 font-bold' : ''}>
                    <td class="py-3 px-3 font-sans font-semibold text-slate-900 dark:text-white">
                      {s.label} <span class="text-[10px] text-slate-400 block font-mono">({fmt(s.annualGrossRent)})</span>
                    </td>
                    {results.sensitivity.matrix[rIdx].map((val, cIdx) => {
                      const isBaseCell = s.pctChange === 0 && results.sensitivity.grmScenarios[cIdx] === results.targetGRM;
                      return (
                        <td
                          key={cIdx}
                          class={`py-3 px-3 text-right ${
                            isBaseCell
                              ? 'bg-emerald-500 text-white font-black rounded-lg shadow-sm'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {fmt(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Disclaimers & Share Actions */}
      <div class="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <p class="max-w-3xl leading-relaxed">
          {GRM_CONFIG.disclaimers.educationalNotice}
        </p>
        <ShareActions title={GRM_CONFIG.meta.title} />
      </div>
    </div>
  );
}
