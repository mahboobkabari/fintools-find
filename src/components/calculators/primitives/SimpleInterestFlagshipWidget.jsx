import { useMemo } from 'preact/hooks';
import { calculateSimpleInterestCalculator } from '@calculators/investment/simple-interest-calculator';
import { SIMPLE_INTEREST_CONFIG } from '@calculators/configs/simple-interest-calculator.config';
import FormInputNumber from './FormInputNumber';
import FormSelect from './FormSelect';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function SimpleInterestFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    principal: SIMPLE_INTEREST_CONFIG.defaultPrincipal,
    rate: SIMPLE_INTEREST_CONFIG.defaultRate,
    durationValue: SIMPLE_INTEREST_CONFIG.defaultDurationValue,
    durationUnit: SIMPLE_INTEREST_CONFIG.defaultDurationUnit,
    inflationRate: SIMPLE_INTEREST_CONFIG.defaultInflationRate,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateSimpleInterestCalculator(state);
  }, [state]);

  const presets = SIMPLE_INTEREST_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-blue-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
              📊 Pure Simple Interest Math Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model flat simple interest (I = P × r × t) across Days (365-day convention), Months, or Years, and compare returns directly against compound interest.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Total Maturity Payout / Repayment
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.finalMaturityAmount, state.currency)}
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              Interest Earned: {formatCurrency(results.simpleInterestEarned, state.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart Simple Interest Presets
        </h3>
        <ScenarioPresetCards
          presets={presets}
          activePresetId={null}
          onSelectPreset={(p) => {
            Object.entries(p.values).forEach(([k, v]) => updateState(k, v));
          }}
        />
      </div>

      {/* 3. Input Controls Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          1. Principal Investment, Rate & Duration Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormInputNumber
            id="principal"
            label="Initial Principal Investment"
            value={state.principal}
            onChange={(val) => updateState('principal', val)}
            min={0}
            max={10000000}
            step={1000}
            prefix={currencySymbol}
            minLabel="₹0"
            maxLabel="₹1 Cr"
          />

          <FormInputNumber
            id="rate"
            label="Annual Interest Rate (% p.a.)"
            value={state.rate}
            onChange={(val) => updateState('rate', val)}
            min={0}
            max={50.0}
            step={0.1}
            suffix="%"
            minLabel="0%"
            maxLabel="50.0%"
          />

          <FormInputNumber
            id="durationValue"
            label="Duration Value"
            value={state.durationValue}
            onChange={(val) => updateState('durationValue', val)}
            min={1}
            max={3650}
            step={1}
            minLabel="1"
            maxLabel="3,650"
          />

          <FormSelect
            id="durationUnit"
            label="Duration Unit"
            value={state.durationUnit}
            onChange={(val) => updateState('durationUnit', val)}
            options={[
              { value: 'years', label: 'Years' },
              { value: 'months', label: 'Months' },
              { value: 'days', label: 'Days (365/yr convention)' },
            ]}
          />
        </div>
      </div>

      {/* 4. Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Total Maturity Payout
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.finalMaturityAmount, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Principal ({formatCurrency(results.principal, state.currency)}) + Simple Interest
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Total Simple Interest Earned
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatCurrency(results.simpleInterestEarned, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            I = P × r × t ({results.tenureYears} Years)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Compound Interest Maturity
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {formatCurrency(results.compoundMaturityAmount, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            A = P(1+r)^t (Annual Compounding)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Compounding Growth Advantage
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            +{formatCurrency(results.compoundingAdvantage, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Extra Wealth From Compounding
          </span>
        </div>
      </div>

      {/* 5. Simple Interest vs Compound Interest Comparison Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-6 rounded-2xl shadow-lg border border-indigo-700/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
              ⚖️ Simple Interest vs Compound Interest Comparison
            </span>
            <h4 className="text-xl font-extrabold mt-2">
              Compound Interest yields {formatCurrency(results.compoundingAdvantage, state.currency)} extra over Simple Interest!
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Comparing flat simple interest ({formatCurrency(results.simpleInterestEarned, state.currency)} interest) against annual compound interest ({formatCurrency(results.compoundInterestEarned, state.currency)} interest) over {results.durationValue} {results.durationUnit}.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 min-w-[220px] text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block">Compounding Growth Delta</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              +{formatCurrency(results.compoundingAdvantage, state.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Year-by-Year Growth Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 Simple Interest Growth Schedule</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {results.durationValue} {results.durationUnit} Rollup Overview
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Period</th>
                <th className="p-3">Opening Principal</th>
                <th className="p-3">Simple Interest Earned</th>
                <th className="p-3">Cumulative Interest</th>
                <th className="p-3">Ending Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} className={row.isFinalRow ? 'bg-emerald-50/60 dark:bg-emerald-950/30 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{formatCurrency(row.startBalance, state.currency)}</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.interestEarned, state.currency)}</td>
                  <td className="p-3 text-indigo-600 dark:text-indigo-400 font-medium">{formatCurrency(row.cumulativeInterest, state.currency)}</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">{formatCurrency(row.endBalance, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Share Actions */}
      <ShareActions
        toolTitle="Simple Interest Calculator"
        shareText={`Check out my simple interest payout: ${formatCurrency(results.finalMaturityAmount, state.currency)} over ${results.durationValue} ${results.durationUnit}!`}
      />
    </div>
  );
}
