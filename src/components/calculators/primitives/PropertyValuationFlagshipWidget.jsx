import { useState, useMemo } from 'preact/hooks';
import { calculatePropertyValuation } from '../../../calculators/real-estate/property-valuation-calculator.js';
import { PROPERTY_VALUATION_CONFIG } from '../../../calculators/configs/property-valuation-calculator.config.js';
import FormInputNumber from './FormInputNumber.jsx';
import ShareActions from '../../ui/ShareActions.jsx';
import { formatCurrency } from '@utils/formatters.js';

export default function PropertyValuationFlagshipWidget() {
  const [currentPropertyValue, setCurrentPropertyValue] = useState(PROPERTY_VALUATION_CONFIG.defaultInputs.currentPropertyValue);
  const [targetCapRatePct, setTargetCapRatePct] = useState(PROPERTY_VALUATION_CONFIG.defaultInputs.targetCapRatePct);
  const [monthlyGrossRent, setMonthlyGrossRent] = useState(PROPERTY_VALUATION_CONFIG.defaultInputs.monthlyGrossRent);
  const [otherAnnualIncome, setOtherAnnualIncome] = useState(PROPERTY_VALUATION_CONFIG.defaultInputs.otherAnnualIncome);
  const [vacancyRatePct, setVacancyRatePct] = useState(PROPERTY_VALUATION_CONFIG.defaultInputs.vacancyRatePct);
  const [annualOperatingExpenses, setAnnualOperatingExpenses] = useState(PROPERTY_VALUATION_CONFIG.defaultInputs.annualOperatingExpenses);

  const results = useMemo(() => {
    return calculatePropertyValuation({
      currentPropertyValue,
      targetCapRatePct,
      monthlyGrossRent,
      otherAnnualIncome,
      vacancyRatePct,
      annualOperatingExpenses,
    });
  }, [
    currentPropertyValue,
    targetCapRatePct,
    monthlyGrossRent,
    otherAnnualIncome,
    vacancyRatePct,
    annualOperatingExpenses,
  ]);

  const handleApplyPreset = (presetKey) => {
    const s = PROPERTY_VALUATION_CONFIG.scenarios[presetKey];
    if (s) {
      setCurrentPropertyValue(s.currentPropertyValue);
      setTargetCapRatePct(s.targetCapRatePct);
      setMonthlyGrossRent(s.monthlyGrossRent);
      setOtherAnnualIncome(s.otherAnnualIncome || 0);
      setVacancyRatePct(s.vacancyRatePct);
      setAnnualOperatingExpenses(s.annualOperatingExpenses);
    }
  };

  const fmt = (val) => (val !== null && val !== undefined ? formatCurrency(val, 'INR') : 'N/A');

  return (
    <div class="space-y-8">
      {/* 1. Hero Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-sky-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-300 text-xs font-semibold rounded-full border border-sky-500/30">
              🏰 Income Capitalization Valuation Engine
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Property Valuation Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Estimate income-implied property market value using Net Operating Income (NOI) and your target Capitalization Rate.
            </p>
          </div>

          <div class="bg-sky-900/50 border border-sky-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-sky-300 font-bold block">
              Income-Implied Property Value
            </span>
            <div class="text-3xl sm:text-4xl font-black text-sky-200 mt-1">
              {results.isValid ? fmt(results.impliedPropertyValue) : 'N/A'}
            </div>
            <div class="text-xs text-sky-300/80 mt-1">
              Based on {results.targetCapRatePct}% Target Cap Rate
            </div>
          </div>
        </div>

        {/* Hero KPI Grid */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-sky-800/50">
          <div class="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <span class="text-xs text-slate-400 font-medium block">Net Operating Income</span>
            <span class="text-lg font-bold text-emerald-400">
              {fmt(results.noi)} / yr
            </span>
          </div>

          <div class="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <span class="text-xs text-slate-400 font-medium block">Current Cap Rate</span>
            <span class="text-lg font-bold text-white">
              {results.currentCapRatePct !== null ? `${results.currentCapRatePct}%` : 'Omitted'}
            </span>
          </div>

          <div class="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <span class="text-xs text-slate-400 font-medium block">Valuation Gap %</span>
            <span class={`text-lg font-bold ${
              results.valuationGapPct === null
                ? 'text-slate-400'
                : results.valuationGapPct >= 0
                ? 'text-emerald-400'
                : 'text-amber-400'
            }`}>
              {results.valuationGapPct !== null
                ? `${results.valuationGapPct > 0 ? '+' : ''}${results.valuationGapPct}%`
                : 'Omitted'}
            </span>
          </div>

          <div class="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <span class="text-xs text-slate-400 font-medium block">Value / Annual NOI</span>
            <span class="text-lg font-bold text-indigo-300">
              {results.isValid ? `${results.valuePerAnnualNoi}x` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Preset Quick Selector */}
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          ⚡ Illustrative Valuation Presets
        </span>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {Object.entries(PROPERTY_VALUATION_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 bg-slate-50 dark:bg-slate-800/50 transition-all text-xs"
            >
              <div class="font-bold text-slate-800 dark:text-slate-200">{s.title}</div>
              <div class="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{s.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Interactive Input Panel */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Step 1: Property & Market Target */}
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span class="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center">1</span>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Property & Target Cap Rate</h3>
          </div>

          <FormInputNumber
            id="currentPropertyValue"
            label="Current Value / Asking Price (₹)"
            value={currentPropertyValue}
            min={PROPERTY_VALUATION_CONFIG.fieldBoundaries.currentPropertyValue.min}
            max={PROPERTY_VALUATION_CONFIG.fieldBoundaries.currentPropertyValue.max}
            step={PROPERTY_VALUATION_CONFIG.fieldBoundaries.currentPropertyValue.step}
            onChange={setCurrentPropertyValue}
          />

          <FormInputNumber
            id="targetCapRatePct"
            label="Target Capitalization Rate (%)"
            value={targetCapRatePct}
            min={PROPERTY_VALUATION_CONFIG.fieldBoundaries.targetCapRatePct.min}
            max={PROPERTY_VALUATION_CONFIG.fieldBoundaries.targetCapRatePct.max}
            step={PROPERTY_VALUATION_CONFIG.fieldBoundaries.targetCapRatePct.step}
            onChange={setTargetCapRatePct}
          />

          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Target Cap Rate represents your desired or market-prevailing capitalization yield for this asset type.
          </div>
        </div>

        {/* Step 2: Rental Income & Vacancy */}
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">2</span>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Rental Income & Vacancy</h3>
          </div>

          <FormInputNumber
            id="monthlyGrossRent"
            label="Monthly Gross Rent (₹)"
            value={monthlyGrossRent}
            min={PROPERTY_VALUATION_CONFIG.fieldBoundaries.monthlyGrossRent.min}
            max={PROPERTY_VALUATION_CONFIG.fieldBoundaries.monthlyGrossRent.max}
            step={PROPERTY_VALUATION_CONFIG.fieldBoundaries.monthlyGrossRent.step}
            onChange={setMonthlyGrossRent}
          />

          <FormInputNumber
            id="otherAnnualIncome"
            label="Other Annual Income (₹)"
            value={otherAnnualIncome}
            min={PROPERTY_VALUATION_CONFIG.fieldBoundaries.otherAnnualIncome.min}
            max={PROPERTY_VALUATION_CONFIG.fieldBoundaries.otherAnnualIncome.max}
            step={PROPERTY_VALUATION_CONFIG.fieldBoundaries.otherAnnualIncome.step}
            onChange={setOtherAnnualIncome}
          />

          <FormInputNumber
            id="vacancyRatePct"
            label="Vacancy & Credit Loss (%)"
            value={vacancyRatePct}
            min={PROPERTY_VALUATION_CONFIG.fieldBoundaries.vacancyRatePct.min}
            max={PROPERTY_VALUATION_CONFIG.fieldBoundaries.vacancyRatePct.max}
            step={PROPERTY_VALUATION_CONFIG.fieldBoundaries.vacancyRatePct.step}
            onChange={setVacancyRatePct}
          />

          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 text-xs">
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Gross Potential Income:</span>
              <span class="font-semibold text-slate-900 dark:text-white">{fmt(results.gpi)} / yr</span>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Vacancy Loss ({results.vacancyRatePct}%):</span>
              <span class="font-semibold text-rose-500">-{fmt(results.vacancyLoss)}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
              <span>Effective Gross Income (EGI):</span>
              <span class="text-emerald-600 dark:text-emerald-400">{fmt(results.egi)}</span>
            </div>
          </div>
        </div>

        {/* Step 3: Operating Expenses & NOI */}
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">3</span>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Operating Expenses & NOI</h3>
          </div>

          <FormInputNumber
            id="annualOperatingExpenses"
            label="Total Annual Operating Expenses (₹)"
            value={annualOperatingExpenses}
            min={PROPERTY_VALUATION_CONFIG.fieldBoundaries.annualOperatingExpenses.min}
            max={PROPERTY_VALUATION_CONFIG.fieldBoundaries.annualOperatingExpenses.max}
            step={PROPERTY_VALUATION_CONFIG.fieldBoundaries.annualOperatingExpenses.step}
            onChange={setAnnualOperatingExpenses}
          />

          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 text-xs">
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Effective Gross Income:</span>
              <span class="font-semibold text-slate-900 dark:text-white">{fmt(results.egi)}</span>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Less Operating Expenses:</span>
              <span class="font-semibold text-rose-500">-{fmt(results.totalOpEx)}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-sm">
              <span>Net Operating Income (NOI):</span>
              <span class="text-indigo-600 dark:text-indigo-400">{fmt(results.noi)}</span>
            </div>
            <div class="flex justify-between text-slate-500 text-[11px] pt-1">
              <span>Monthly NOI:</span>
              <span>{fmt(results.monthlyNoi)} / mo</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Valuation Comparison Banner */}
      {results.isValid && results.currentPropertyValue > 0 && (
        <div class={`p-5 rounded-2xl border text-sm ${
          results.valuationStatus === 'above_asking'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : results.valuationStatus === 'below_asking'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300'
        }`}>
          <div class="flex items-start gap-3">
            <span class="text-xl">
              {results.valuationStatus === 'above_asking' ? '📈' : results.valuationStatus === 'below_asking' ? '📉' : '⚖️'}
            </span>
            <div>
              <h4 class="font-bold text-base mb-1">
                {results.valuationStatus === 'above_asking'
                  ? 'Income-Implied Value Exceeds Current Asking Price'
                  : results.valuationStatus === 'below_asking'
                  ? 'Income-Implied Value Below Current Asking Price'
                  : 'Income-Implied Value Aligned with Asking Price'}
              </h4>
              <p class="leading-relaxed">
                At your target cap rate of {results.targetCapRatePct}%, the property's annual NOI of {fmt(results.noi)} implies a valuation of <strong>{fmt(results.impliedPropertyValue)}</strong>.
                {results.valuationGapAmount !== null && (
                  <span>
                    {' '}This is {fmt(Math.abs(results.valuationGapAmount))} ({Math.abs(results.valuationGapPct)}%) {results.valuationGapAmount >= 0 ? 'above' : 'below'} the current asking price of {fmt(results.currentPropertyValue)}.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Detailed Financial Breakdown Table */}
      <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-white text-lg">
          Income Capitalization Valuation Breakdown
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase">
                <th class="py-3 px-4">Financial Parameter</th>
                <th class="py-3 px-4 text-right">Annual Value (₹)</th>
                <th class="py-3 px-4 text-right">Metric / %</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td class="py-3 px-4 font-medium">Gross Potential Income (GPI)</td>
                <td class="py-3 px-4 text-right font-semibold">{fmt(results.gpi)}</td>
                <td class="py-3 px-4 text-right">100% Potential</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium">Less: Vacancy & Credit Loss</td>
                <td class="py-3 px-4 text-right font-semibold text-rose-500">-{fmt(results.vacancyLoss)}</td>
                <td class="py-3 px-4 text-right">{results.vacancyRatePct}% Vacancy</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium">Effective Gross Income (EGI)</td>
                <td class="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">{fmt(results.egi)}</td>
                <td class="py-3 px-4 text-right">Collected Revenue</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium">Less: Total Annual Operating Expenses</td>
                <td class="py-3 px-4 text-right font-semibold text-rose-500">-{fmt(results.totalOpEx)}</td>
                <td class="py-3 px-4 text-right">Operating Costs</td>
              </tr>
              <tr class="bg-indigo-50/50 dark:bg-indigo-950/30 font-bold text-indigo-900 dark:text-indigo-200">
                <td class="py-3 px-4">Net Operating Income (NOI)</td>
                <td class="py-3 px-4 text-right">{fmt(results.noi)}</td>
                <td class="py-3 px-4 text-right">{fmt(results.monthlyNoi)} / mo</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium">Target Capitalization Rate</td>
                <td class="py-3 px-4 text-right font-semibold">{results.targetCapRatePct}%</td>
                <td class="py-3 px-4 text-right">Target Yield</td>
              </tr>
              <tr class="bg-sky-50 dark:bg-sky-950/40 font-bold text-sky-900 dark:text-sky-200 text-base">
                <td class="py-3.5 px-4">Income-Implied Property Value</td>
                <td class="py-3.5 px-4 text-right text-sky-600 dark:text-sky-400">{fmt(results.impliedPropertyValue)}</td>
                <td class="py-3.5 px-4 text-right">{results.valuePerAnnualNoi}x NOI Multiple</td>
              </tr>
              {results.currentPropertyValue > 0 && (
                <>
                  <tr>
                    <td class="py-3 px-4 font-medium">Current Property Value / Asking Price</td>
                    <td class="py-3 px-4 text-right font-semibold">{fmt(results.currentPropertyValue)}</td>
                    <td class="py-3 px-4 text-right">{results.currentCapRatePct}% Current Cap Rate</td>
                  </tr>
                  <tr class="font-semibold text-slate-900 dark:text-white">
                    <td class="py-3 px-4">Valuation Spread / Gap</td>
                    <td class={`py-3 px-4 text-right ${results.valuationGapAmount >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {fmt(results.valuationGapAmount)}
                    </td>
                    <td class="py-3 px-4 text-right">{results.valuationGapPct}% Spread</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. 2D Sensitivity Matrix */}
      {results.isValid && (
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-lg">
              2D Property Valuation Sensitivity Analysis
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Estimated property value matrix across varying NOI scenarios and target capitalization rates.
            </p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th class="py-3 px-3">NOI Scenario</th>
                  {results.sensitivity.capRateScenarios.map((rate) => (
                    <th key={rate} class={`py-3 px-3 text-right ${rate === results.targetCapRatePct ? 'bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-100 font-black' : ''}`}>
                      {rate}% Cap Rate
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                {results.sensitivity.noiScenarios.map((s, rIdx) => (
                  <tr key={s.label} class={s.pctChange === 0 ? 'bg-slate-50 dark:bg-slate-800/60 font-bold' : ''}>
                    <td class="py-3 px-3 font-sans font-semibold text-slate-900 dark:text-white">
                      {s.label} <span class="text-[10px] text-slate-400 block font-mono">({fmt(s.noi)})</span>
                    </td>
                    {results.sensitivity.matrix[rIdx].map((val, cIdx) => {
                      const isBaseCell = s.pctChange === 0 && results.sensitivity.capRateScenarios[cIdx] === results.targetCapRatePct;
                      return (
                        <td
                          key={cIdx}
                          class={`py-3 px-3 text-right ${
                            isBaseCell
                              ? 'bg-sky-500 text-white font-black rounded-lg shadow-sm'
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

      {/* 7. Disclaimers & Share Actions */}
      <div class="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <p class="max-w-3xl leading-relaxed">
          {PROPERTY_VALUATION_CONFIG.disclaimers.educationalNotice}
        </p>
        <ShareActions title={PROPERTY_VALUATION_CONFIG.meta.title} />
      </div>
    </div>
  );
}
