import { useMemo } from 'preact/hooks';
import { calculateInflationCalculator } from '@calculators/investment/inflation-calculator';
import { INFLATION_CONFIG } from '@calculators/configs/inflation-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function InflationFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    amount: INFLATION_CONFIG.defaultAmount,
    inflationRate: INFLATION_CONFIG.defaultInflationRate,
    tenureYears: INFLATION_CONFIG.defaultTenureYears,
    investmentReturnRate: INFLATION_CONFIG.defaultInvestmentReturnRate,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateInflationCalculator(state);
  }, [state]);

  const presets = INFLATION_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-red-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-rose-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-full border border-rose-500/30">
              📈 Inflation & Purchasing Power Modeling Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model compound price inflation (FV = PV × (1+i)ⁿ), purchasing power erosion, cumulative price escalation, and Fisher real investment returns.
            </p>
          </div>
          <div className="bg-rose-900/50 border border-rose-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-rose-300 font-bold block">
              Future Inflated Cost
            </span>
            <span className="text-3xl font-black text-rose-400 mt-1 block">
              {formatCurrency(results.futureCost, state.currency)}
            </span>
            <span className="text-xs text-rose-200 mt-1 block">
              Cumulative Increase: +{results.cumulativeInflationPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Official Reference Context Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          ℹ️ Reference Benchmark Context (Configurable Assumptions)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          <div>• <strong className="text-slate-900 dark:text-white">MOSPI India CPI:</strong> {results.referenceData.indiaCpiContext}</div>
          <div>• <strong className="text-slate-900 dark:text-white">RBI Target:</strong> {results.referenceData.rbiTargetContext}</div>
        </div>
      </div>

      {/* 3. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart Inflation Presets
        </h3>
        <ScenarioPresetCards
          presets={presets}
          activePresetId={null}
          onSelectPreset={(p) => {
            Object.entries(p.values).forEach(([k, v]) => updateState(k, v));
          }}
        />
      </div>

      {/* 4. Input Controls Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          1. Inflation & Investment Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormInputNumber
            id="amount"
            label="Current Present Value Today"
            value={state.amount}
            onChange={(val) => updateState('amount', val)}
            min={0}
            max={100000000}
            step={10000}
            prefix={currencySymbol}
            minLabel="₹0"
            maxLabel="₹10 Cr"
          />

          <FormInputNumber
            id="inflationRate"
            label="Assumed Inflation Rate (% p.a.)"
            value={state.inflationRate}
            onChange={(val) => updateState('inflationRate', val)}
            min={0}
            max={30.0}
            step={0.1}
            suffix="%"
            minLabel="0%"
            maxLabel="30.0%"
          />

          <FormInputNumber
            id="tenureYears"
            label="Time Horizon (Years)"
            value={state.tenureYears}
            onChange={(val) => updateState('tenureYears', val)}
            min={1}
            max={50}
            step={1}
            minLabel="1 Yr"
            maxLabel="50 Yrs"
          />

          <FormInputNumber
            id="investmentReturnRate"
            label="Investment Return Benchmark (% p.a.)"
            value={state.investmentReturnRate}
            onChange={(val) => updateState('investmentReturnRate', val)}
            min={0}
            max={30.0}
            step={0.1}
            suffix="%"
            minLabel="0%"
            maxLabel="30.0%"
          />
        </div>
      </div>

      {/* 5. Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Future Inflated Cost
          </span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
            {formatCurrency(results.futureCost, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Cost increase: +{formatCurrency(results.inflationDelta, state.currency)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Retained Purchasing Power Today
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {formatCurrency(results.erodedPurchasingPower, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Purchasing power loss: {results.purchasingPowerLossPercent}%
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Cumulative Inflation Rate
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            +{results.cumulativeInflationPercent}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Over {results.tenureYears} Years @ {results.inflationRate}% p.a.
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Fisher Real Rate of Return
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {results.realReturnRate > 0 ? `+${results.realReturnRate}%` : `${results.realReturnRate}%`}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Nominal {results.investmentReturnRate}% minus {results.inflationRate}% Inflation
          </span>
        </div>
      </div>

      {/* 6. Nominal Return vs Inflation Real Growth Card */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-rose-950 text-white p-6 rounded-2xl shadow-lg border border-purple-700/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
              ⚖️ Nominal Return vs Inflation Benchmark
            </span>
            <h4 className="text-xl font-extrabold mt-2">
              Investing {formatCurrency(results.amount, state.currency)} @ {results.investmentReturnRate}% grows to {formatCurrency(results.nominalInvestmentCorpus, state.currency)} (Real value: {formatCurrency(results.realInvestmentCorpus, state.currency)}).
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              To meet the future inflated goal of {formatCurrency(results.futureCost, state.currency)}, a single lumpsum investment of {formatCurrency(results.requiredLumpsumToday, state.currency)} today @ {results.investmentReturnRate}% p.a. is required.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 min-w-[220px] text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block">Required Lumpsum Today</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.requiredLumpsumToday, state.currency)}
            </span>
            <span className="text-xs text-slate-300 mt-1 block">@ {results.investmentReturnRate}% Return Rate</span>
          </div>
        </div>
      </div>

      {/* 7. Year-by-Year Price Growth Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 Year-by-Year Inflation Schedule</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {results.tenureYears}-Year Horizon Rollup
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Year</th>
                <th className="p-3">Future Inflated Cost</th>
                <th className="p-3">Retained Purchasing Power</th>
                <th className="p-3">Cumulative Inflation</th>
                <th className="p-3">Nominal Investment Corpus (@ {results.investmentReturnRate}%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} className={row.isFinalRow ? 'bg-rose-50/60 dark:bg-rose-950/30 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year}</td>
                  <td className="p-3 font-extrabold text-rose-600 dark:text-rose-400">{formatCurrency(row.futureCost, state.currency)}</td>
                  <td className="p-3 text-amber-600 dark:text-amber-400 font-medium">{formatCurrency(row.purchasingPower, state.currency)}</td>
                  <td className="p-3 text-purple-600 dark:text-purple-400 font-medium">+{row.cumulativeInflationPercent}%</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.nominalCorpus, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Share Actions */}
      <ShareActions
        toolTitle="Inflation Calculator"
        shareText={`An expense of ${formatCurrency(results.amount, state.currency)} today will cost ${formatCurrency(results.futureCost, state.currency)} in ${results.tenureYears} years at ${results.inflationRate}% inflation!`}
      />
    </div>
  );
}
