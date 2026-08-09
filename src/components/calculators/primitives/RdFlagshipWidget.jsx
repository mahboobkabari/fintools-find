import { useMemo } from 'preact/hooks';
import { calculateRdCalculator } from '@calculators/savings/rd-calculator';
import { RD_CONFIG } from '@calculators/configs/rd-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function RdFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    monthlyInstallment: RD_CONFIG.defaultMonthlyInstallment,
    rate: RD_CONFIG.defaultRate,
    tenure: RD_CONFIG.defaultTenureYears,
    tenureType: 'years',
    isSeniorCitizen: false,
    hasPan: true,
    marginalTaxRate: 20,
    expectedSipReturn: RD_CONFIG.benchmarks.expectedSipReturnBenchmark,
    inflationRate: 5.0,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateRdCalculator(state);
  }, [state]);

  const presets = RD_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : state.currency === 'EUR' ? '€' : state.currency === 'GBP' ? '£' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              💵 Institutional Recurring Deposit Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model quarterly bank compounding for monthly installments, senior citizen rate bonuses (+0.50%), Section 194A TDS tax deductions, and guaranteed RD vs. equity SIP comparisons.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Guaranteed Maturity Value
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.maturityValue, state.currency)}
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              (Effective Rate: {results.effectiveRate.toFixed(2)}% p.a.)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Preset Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Quick Benchmark Presets
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
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 gap-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Installment, Interest Rate & Senior Citizen Selection
          </h3>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateState('isSeniorCitizen', !state.isSeniorCitizen)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                state.isSeniorCitizen
                  ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-md font-extrabold'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
              }`}
            >
              👴 Senior Citizen (+0.50% Bonus)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="monthlyInstallment"
            label={`Monthly Installment Amount (${currencySymbol})`}
            value={state.monthlyInstallment}
            min={500}
            max={1000000}
            step={500}
            onChange={(v) => updateState('monthlyInstallment', v)}
          />

          <FormInputNumber
            id="rate"
            label="Base Interest Rate (% p.a.)"
            value={state.rate}
            min={1}
            max={20}
            step={0.1}
            onChange={(v) => updateState('rate', v)}
          />

          <FormInputNumber
            id="tenure"
            label="Deposit Tenure (Years)"
            value={state.tenure}
            min={1}
            max={10}
            step={1}
            onChange={(v) => updateState('tenure', v)}
          />
        </div>

        {/* Tax, TDS & Equity SIP Comparison Drawer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            2. Tax, Section 194A TDS & Equity SIP Assumptions
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <FormInputNumber
              id="marginalTaxRate"
              label="Marginal Tax Bracket Rate (%)"
              value={state.marginalTaxRate}
              min={0}
              max={50}
              step={1}
              onChange={(v) => updateState('marginalTaxRate', v)}
            />

            <FormInputNumber
              id="expectedSipReturn"
              label="Expected Equity SIP Return (% p.a.)"
              value={state.expectedSipReturn}
              min={1}
              max={25}
              step={0.5}
              onChange={(v) => updateState('expectedSipReturn', v)}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Valid PAN Furnished?
              </label>
              <select
                value={state.hasPan ? 'yes' : 'no'}
                onChange={(e) => updateState('hasPan', e.target.value === 'yes')}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="yes">Yes (10% Statutory TDS Rate)</option>
                <option value="no">No (20% Section 206AA Penalty TDS Rate)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Maturity Value</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {formatCurrency(results.maturityValue, state.currency)}
          </span>
          <span className="text-xs text-slate-500 block">Guaranteed fixed maturity</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Installments Paid</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">
            {formatCurrency(results.totalDeposits, state.currency)}
          </span>
          <span className="text-xs text-slate-500 block">Over {results.totalMonths} months</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Guaranteed Interest</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
            {formatCurrency(results.totalInterest, state.currency)}
          </span>
          <span className="text-xs text-emerald-600 font-bold block">
            ({Math.round((results.totalInterest / results.totalDeposits) * 100)}% return gain)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estimated Sec 194A TDS</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 block">
            {formatCurrency(results.estimatedTdsAmount, state.currency)}
          </span>
          {results.isTdsApplicable ? (
            <span className="text-xs text-rose-500 font-bold block">TDS Rate: {results.tdsRatePct}%</span>
          ) : (
            <span className="text-xs text-emerald-600 font-bold block">Below TDS Threshold</span>
          )}
        </div>
      </div>

      {/* 5. Guaranteed RD vs Equity SIP Comparison Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          ⚖️ Guaranteed Bank RD vs. Market-Linked Equity SIP Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-md">
              Guaranteed Bank RD ({results.effectiveRate.toFixed(2)}% p.a.)
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block pt-1">
              {formatCurrency(results.maturityValue, state.currency)}
            </span>
            <span className="text-xs text-slate-500 block">
              100% Capital Guaranteed | Fixed Contractual Interest ({formatCurrency(results.totalInterest, state.currency)} interest)
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-md">
              Projected Equity SIP ({state.expectedSipReturn}% p.a. expected)
            </span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block pt-1">
              {formatCurrency(results.sipFutureValue, state.currency)}
            </span>
            <span className="text-xs text-slate-500 block">
              Market-Linked Return (Potential +{formatCurrency(results.sipWealthDelta, state.currency)} higher wealth, subject to market risk)
            </span>
          </div>
        </div>
      </div>

      {/* 6. Installments vs Interest Ratio Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-sm font-bold">
          <span className="text-blue-600 dark:text-blue-400">
            Total Installments: {formatCurrency(results.totalDeposits, state.currency)} ({Math.round((results.totalDeposits / (results.maturityValue || 1)) * 100)}%)
          </span>
          <span className="text-emerald-600 dark:text-emerald-400">
            Interest Earned: {formatCurrency(results.totalInterest, state.currency)} ({Math.round((results.totalInterest / (results.maturityValue || 1)) * 100)}%)
          </span>
        </div>
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
          <div
            className="bg-blue-600 h-full transition-all duration-500"
            style={{ width: `${(results.totalDeposits / (results.maturityValue || 1)) * 100}%` }}
          />
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${(results.totalInterest / (results.maturityValue || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* 7. Accumulation Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          📈 Recurring Deposit Accumulation Schedule
        </h3>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold">
              <tr>
                <th className="p-3">Year</th>
                <th className="p-3">Total Installments Paid</th>
                <th className="p-3">Interest Earned in Year</th>
                <th className="p-3">Cumulative Interest</th>
                <th className="p-3">Estimated TDS</th>
                <th className="p-3">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.yearlyRows.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year}</td>
                  <td className="p-3">{formatCurrency(row.totalDepositsPaid, state.currency)}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(row.interestEarned, state.currency)}</td>
                  <td className="p-3">{formatCurrency(row.cumulativeInterest, state.currency)}</td>
                  <td className="p-3 text-rose-500">{row.tdsDeduction > 0 ? formatCurrency(row.tdsDeduction, state.currency) : '₹0'}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{formatCurrency(row.endingBalance, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Scenario Comparison Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          📊 Recurring Deposit Scenario Matrix Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-900 dark:text-white font-bold">
              <tr>
                <th className="p-3">Scenario</th>
                <th className="p-3">Effective Rate</th>
                <th className="p-3">Tenure</th>
                <th className="p-3">Total Installments</th>
                <th className="p-3">Maturity Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.scenarios.map((sc) => (
                <tr key={sc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{sc.label}</td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{sc.rate.toFixed(2)}% p.a.</td>
                  <td className="p-3">{sc.tenureYears} Years</td>
                  <td className="p-3">{formatCurrency(sc.totalDeposits, state.currency)}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{formatCurrency(sc.maturityValue, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. Share & Reset Bar */}
      <ShareActions title="Recurring Deposit (RD) Calculator" />
    </div>
  );
}
