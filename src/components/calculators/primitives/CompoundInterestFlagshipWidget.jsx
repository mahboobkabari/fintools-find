import { useMemo } from 'preact/hooks';
import { calculateCompoundInterestCalculator } from '@calculators/investment/compound-interest-calculator';
import { COMPOUND_INTEREST_CONFIG } from '@calculators/configs/compound-interest-calculator.config';
import FormInputNumber from './FormInputNumber';
import FormSelect from './FormSelect';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function CompoundInterestFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    principal: COMPOUND_INTEREST_CONFIG.defaultPrincipal,
    monthlyDeposit: COMPOUND_INTEREST_CONFIG.defaultMonthlyDeposit,
    rate: COMPOUND_INTEREST_CONFIG.defaultRate,
    tenureYears: COMPOUND_INTEREST_CONFIG.defaultTenureYears,
    compoundingFrequency: COMPOUND_INTEREST_CONFIG.defaultCompoundingFrequency,
    contributionTiming: COMPOUND_INTEREST_CONFIG.defaultContributionTiming,
    inflationRate: COMPOUND_INTEREST_CONFIG.defaultInflationRate,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateCompoundInterestCalculator(state);
  }, [state]);

  const presets = COMPOUND_INTEREST_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
              ⚡ Multi-Frequency Compound Interest Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model compound wealth accumulation across daily, monthly, quarterly, semi-annual, and annual frequencies, Effective Annual Rate (EAR / APY), and inflation-adjusted purchasing power.
            </p>
          </div>
          <div className="bg-indigo-900/50 border border-indigo-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold block">
              Final Accumulated Corpus
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.finalCorpus, state.currency)}
            </span>
            <span className="text-xs text-indigo-200 mt-1 block">
              EAR / APY: {results.effectiveAnnualRate}% p.a.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart Compounding Presets
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
          1. Principal, Recurring Deposits & Compounding Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            id="monthlyDeposit"
            label="Additional Monthly Deposit"
            value={state.monthlyDeposit}
            onChange={(val) => updateState('monthlyDeposit', val)}
            min={0}
            max={500000}
            step={500}
            prefix={currencySymbol}
            minLabel="₹0"
            maxLabel="₹5 Lakhs/mo"
          />

          <FormInputNumber
            id="rate"
            label="Nominal Annual Rate (% p.a.)"
            value={state.rate}
            onChange={(val) => updateState('rate', val)}
            min={0.1}
            max={30.0}
            step={0.1}
            suffix="%"
            minLabel="0.1%"
            maxLabel="30.0%"
          />

          <FormInputNumber
            id="tenureYears"
            label="Investment Duration (Years)"
            value={state.tenureYears}
            onChange={(val) => updateState('tenureYears', val)}
            min={1}
            max={40}
            step={1}
            suffix=" Yrs"
            minLabel="1 Yr"
            maxLabel="40 Yrs"
          />

          <FormSelect
            id="compoundingFrequency"
            label="Compounding Frequency"
            value={state.compoundingFrequency}
            onChange={(val) => updateState('compoundingFrequency', val)}
            options={[
              { value: 'daily', label: 'Daily (365/yr)' },
              { value: 'monthly', label: 'Monthly (12/yr)' },
              { value: 'quarterly', label: 'Quarterly (4/yr)' },
              { value: 'semi-annually', label: 'Semi-Annually (2/yr)' },
              { value: 'annually', label: 'Annually (1/yr)' },
            ]}
          />

          <FormSelect
            id="contributionTiming"
            label="Monthly Deposit Timing"
            value={state.contributionTiming}
            onChange={(val) => updateState('contributionTiming', val)}
            options={[
              { value: 'end', label: 'End of Month' },
              { value: 'beginning', label: 'Beginning of Month' },
            ]}
          />
        </div>
      </div>

      {/* 4. Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Final Accumulated Corpus
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.finalCorpus, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Over {results.tenureYears} Years @ {results.rate}% p.a.
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Total Interest Earned
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatCurrency(results.totalInterestEarned, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Compound Profit Component
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Effective Annual Rate (EAR / APY)
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {results.effectiveAnnualRate}% p.a.
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            True Yield ({results.compoundingFrequencyLabel})
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Total Invested Capital
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {formatCurrency(results.totalPrincipal, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Principal + Monthly Deposits
          </span>
        </div>
      </div>

      {/* 5. Cross-Frequency Yield Comparison Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <span>⚖️ Cross-Frequency Compounding Yield Matrix</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Impact of Compounding Frequency</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {results.frequencyComparison.map((item) => {
            const isSelected = item.id === state.compoundingFrequency;
            return (
              <div
                key={item.id}
                className={
                  isSelected
                    ? 'p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white shadow-sm'
                    : 'p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                }
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider block">{item.label}</span>
                  {isSelected && <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Active</span>}
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-2 block">
                  {formatCurrency(item.finalCorpus, state.currency)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                  EAR: {item.effectiveAnnualRate}%
                </span>
                <span className={item.deltaVsAnnual >= 0 ? 'text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block' : 'text-xs text-slate-500 mt-1 block'}>
                  {item.deltaVsAnnual > 0 ? `+${formatCurrency(item.deltaVsAnnual, state.currency)} vs Annual` : 'Baseline'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Year-by-Year Compounding Growth Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 Year-by-Year Compound Growth Schedule</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {results.tenureYears}-Year Growth Rollup
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Year</th>
                <th className="p-3">Opening Balance</th>
                <th className="p-3">Annual Deposits</th>
                <th className="p-3">Interest Earned</th>
                <th className="p-3">Closing Balance</th>
                <th className="p-3">Cumulative Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} className={row.isFinalRow ? 'bg-emerald-50/60 dark:bg-emerald-950/30 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{formatCurrency(row.startBalance, state.currency)}</td>
                  <td className="p-3 text-indigo-600 dark:text-indigo-400 font-medium">{formatCurrency(row.annualDeposit, state.currency)}</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.interestEarned, state.currency)}</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">{formatCurrency(row.endBalance, state.currency)}</td>
                  <td className="p-3 text-purple-600 dark:text-purple-400 font-semibold">{formatCurrency(row.cumulativeInterest, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Share Actions */}
      <ShareActions
        toolTitle="Compound Interest Calculator"
        shareText={`Check out my compound wealth accumulation: ${formatCurrency(results.finalCorpus, state.currency)} accumulated over ${results.tenureYears} years!`}
      />
    </div>
  );
}
