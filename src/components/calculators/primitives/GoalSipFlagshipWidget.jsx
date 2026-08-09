import { useMemo } from 'preact/hooks';
import { calculateGoalSipCalculator } from '@calculators/investment/goal-sip-calculator';
import { GOAL_SIP_CONFIG } from '@calculators/configs/goal-sip-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function GoalSipFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    targetGoal: GOAL_SIP_CONFIG.defaultTargetGoal,
    tenureYears: GOAL_SIP_CONFIG.defaultTenureYears,
    expectedReturnRate: GOAL_SIP_CONFIG.defaultExpectedReturnRate,
    inflationRate: GOAL_SIP_CONFIG.defaultInflationRate,
    stepUpRate: GOAL_SIP_CONFIG.defaultStepUpRate,
    adjustForInflation: GOAL_SIP_CONFIG.defaultAdjustForInflation,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateGoalSipCalculator(state);
  }, [state]);

  const presets = GOAL_SIP_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
              🎯 Goal-Based SIP Reverse Target Solver
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Reverse-engineered annuity compounding math: {results.rateConvention}.
            </p>
          </div>
          <div className="bg-indigo-900/50 border border-indigo-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold block">
              Required Monthly SIP
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.requiredMonthlySip, state.currency)}/mo
            </span>
            <span className="text-xs text-indigo-200 mt-1 block">
              Goal: {formatCurrency(results.effectiveTargetGoal, state.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Goal Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Target Goal Presets
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Target Goal & Return Parameters
          </h3>
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={state.adjustForInflation}
              onChange={(e) => updateState('adjustForInflation', e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span>Adjust Target Goal for Inflation ({state.inflationRate}% p.a.)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="targetGoal"
            label="Target Goal Amount Today"
            value={state.targetGoal}
            onChange={(val) => updateState('targetGoal', val)}
            min={100000}
            max={500000000}
            step={100000}
            prefix={currencySymbol}
            minLabel="₹1 Lakh"
            maxLabel="₹50 Cr"
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
            id="expectedReturnRate"
            label="Expected Return Rate (% p.a.)"
            value={state.expectedReturnRate}
            onChange={(val) => updateState('expectedReturnRate', val)}
            min={1}
            max={30.0}
            step={0.1}
            suffix="%"
            minLabel="1%"
            maxLabel="30%"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <FormInputNumber
            id="inflationRate"
            label="Assumed Annual Inflation Rate (% p.a.)"
            value={state.inflationRate}
            onChange={(val) => updateState('inflationRate', val)}
            min={0}
            max={30.0}
            step={0.1}
            suffix="%"
            minLabel="0%"
            maxLabel="30%"
          />

          <FormInputNumber
            id="stepUpRate"
            label="Annual Step-Up Rate (% p.a.)"
            value={state.stepUpRate}
            onChange={(val) => updateState('stepUpRate', val)}
            min={0}
            max={50.0}
            step={1}
            suffix="%"
            minLabel="0%"
            maxLabel="50%"
          />
        </div>
      </div>

      {/* 4. Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Required Fixed Monthly SIP
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.requiredMonthlySip, state.currency)}/mo
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Fixed monthly deposit for {results.tenureYears} Yrs
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Target Goal Corpus
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatCurrency(results.effectiveTargetGoal, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            {state.adjustForInflation ? `Inflated @ ${results.inflationRate}% p.a.` : 'Unadjusted Present Value'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Starting SIP with {results.stepUpRate}% Step-Up
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {formatCurrency(results.stepUpStartingSip, state.currency)}/mo
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            Save {formatCurrency(results.stepUpSavingsMonthly, state.currency)}/mo initially!
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Estimated Wealth Gain
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
            {formatCurrency(results.wealthGain, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Principal: {formatCurrency(results.totalInvested, state.currency)}
          </span>
        </div>
      </div>

      {/* 5. Step-Up Strategy Comparison Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📊 Step-Up Strategy Comparison</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            Target Goal: {formatCurrency(results.effectiveTargetGoal, state.currency)}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {results.scenarioStepUps.map((sc) => (
            <div
              key={sc.stepUpRate}
              className={`p-4 rounded-xl border ${
                sc.stepUpRate === state.stepUpRate
                  ? 'bg-indigo-50/70 border-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-600'
                  : 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {sc.label}
              </div>
              <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {formatCurrency(sc.startingMonthlySip, state.currency)}/mo
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                <div>Final Monthly: {formatCurrency(sc.finalMonthlySip, state.currency)}/mo</div>
                <div>Total Invested: {formatCurrency(sc.totalInvested, state.currency)}</div>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Wealth Gain: {formatCurrency(sc.wealthGain, state.currency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Year-by-Year Wealth Accumulation Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 Year-by-Year Accumulation Schedule</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {results.tenureYears}-Year Growth Horizon
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Year</th>
                <th className="p-3">Cumulative Invested</th>
                <th className="p-3">Cumulative Wealth Gain</th>
                <th className="p-3">Accumulated Goal Corpus</th>
                <th className="p-3">Goal Progress (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} className={row.isFinalRow ? 'bg-indigo-50/60 dark:bg-indigo-950/30 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{formatCurrency(row.invested, state.currency)}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(row.returns, state.currency)}</td>
                  <td className="p-3 font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(row.totalValue, state.currency)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${row.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {row.progressPercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Share Actions */}
      <ShareActions
        toolTitle="Goal-Based SIP Calculator"
        shareText={`To reach my target goal of ${formatCurrency(results.effectiveTargetGoal, state.currency)} in ${results.tenureYears} years, I need a monthly SIP of ${formatCurrency(results.requiredMonthlySip, state.currency)}!`}
      />
    </div>
  );
}
