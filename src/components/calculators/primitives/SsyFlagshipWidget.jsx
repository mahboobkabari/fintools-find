import { useMemo } from 'preact/hooks';
import { calculateSsyCalculator } from '@calculators/savings/ssy-calculator';
import { SSY_CONFIG } from '@calculators/configs/ssy-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function SsyFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    annualDeposit: SSY_CONFIG.defaultAnnualDeposit,
    girlChildAge: SSY_CONFIG.defaultGirlChildAge,
    rate: SSY_CONFIG.defaultRate,
    allowEducationWithdrawal: false,
    marginalTaxRate: 30,
    expectedSipReturn: SSY_CONFIG.benchmarks.expectedSipReturnBenchmark,
    inflationRate: 5.0,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateSsyCalculator(state);
  }, [state]);

  const presets = SSY_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : state.currency === 'EUR' ? '€' : state.currency === 'GBP' ? '£' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-emerald-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              👑 Institutional Sukanya Samriddhi Yojana (SSY) Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl">
              Model 15-year contribution periods, 21-year statutory maturity horizons, 8.2% p.a. annual compounding, Section 80C ₹1.5L caps, 100% EEE tax-free status, and 50% higher education withdrawal rules.
            </p>
          </div>
          <div className="bg-emerald-900/50 border border-emerald-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
              100% Tax-Free Maturity Value
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.maturityValue, state.currency)}
            </span>
            <span className="text-xs text-emerald-200 mt-1 block">
              (Govt Notified Rate: {results.rate.toFixed(2)}% p.a. EEE)
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
            1. Deposit Amount, Girl Child Age & Education Withdrawal Selection
          </h3>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateState('allowEducationWithdrawal', !state.allowEducationWithdrawal)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                state.allowEducationWithdrawal
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md font-extrabold'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
              }`}
            >
              🎓 50% Higher Edu Withdrawal (Age 18)
            </button>
          </div>
        </div>

        {results.isCapped && (
          <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-xl text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
            ⚠️ Notice: Annual deposit of {currencySymbol}{results.rawDeposit.toLocaleString()} exceeds the statutory Section 80C cap of {currencySymbol}1,50,000. Calculation has been automatically capped at {currencySymbol}1,50,000/year.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="annualDeposit"
            label={`Annual Deposit Amount (${currencySymbol})`}
            value={state.annualDeposit}
            min={250}
            max={150000}
            step={250}
            onChange={(v) => updateState('annualDeposit', v)}
          />

          <FormInputNumber
            id="girlChildAge"
            label="Girl Child Current Age (Years)"
            value={state.girlChildAge}
            min={0}
            max={10}
            step={1}
            onChange={(v) => updateState('girlChildAge', v)}
          />

          <FormInputNumber
            id="rate"
            label="Government Interest Rate (% p.a.)"
            value={state.rate}
            min={1}
            max={15}
            step={0.1}
            onChange={(v) => updateState('rate', v)}
          />
        </div>

        {/* Tax Savings & Equity SIP Drawer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-sm font-bold text-teal-600 dark:text-teal-400">
            2. Section 80C Tax Bracket & Equity SIP Assumptions
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
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
          </div>
        </div>
      </div>

      {/* 4. KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">100% Tax-Free Maturity Value</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {formatCurrency(results.maturityValue, state.currency)}
          </span>
          <span className="text-xs text-emerald-600 font-bold block">100% Tax-Free EEE Status</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Deposits Paid (15Y)</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">
            {formatCurrency(results.totalDeposits, state.currency)}
          </span>
          <span className="text-xs text-slate-500 block">15 annual installments</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Interest Earned (21Y)</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
            {formatCurrency(results.totalInterest, state.currency)}
          </span>
          <span className="text-xs text-emerald-600 font-bold block">
            ({Math.round((results.totalInterest / results.totalDeposits) * 100)}% return multiplier)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Sec 80C Tax Saved</span>
          <span className="text-2xl font-black text-teal-600 dark:text-teal-400 block">
            {formatCurrency(results.totalSec80cTaxSaved, state.currency)}
          </span>
          <span className="text-xs text-teal-600 font-bold block">
            ({formatCurrency(results.annualSec80cTaxSaved, state.currency)}/year tax saved)
          </span>
        </div>
      </div>

      {/* 5. Guaranteed SSY vs Equity SIP Comparison Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          ⚖️ Guaranteed Govt SSY vs. Market-Linked Equity SIP Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-md">
              Guaranteed Govt SSY ({results.rate.toFixed(2)}% p.a. EEE)
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block pt-1">
              {formatCurrency(results.maturityValue, state.currency)}
            </span>
            <span className="text-xs text-slate-500 block">
              100% Govt Capital Guaranteed | 100% Tax-Free Interest ({formatCurrency(results.totalInterest, state.currency)} interest)
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
              Market-Linked Return (Potential +{formatCurrency(results.sipWealthDelta, state.currency)} higher wealth, subject to market volatility)
            </span>
          </div>
        </div>
      </div>

      {/* 6. Deposits vs Interest Ratio Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-sm font-bold">
          <span className="text-blue-600 dark:text-blue-400">
            Total Installments: {formatCurrency(results.totalDeposits, state.currency)} ({Math.round((results.totalDeposits / (results.maturityValue || 1)) * 100)}%)
          </span>
          <span className="text-emerald-600 dark:text-emerald-400">
            Tax-Free Interest: {formatCurrency(results.totalInterest, state.currency)} ({Math.round((results.totalInterest / (results.maturityValue || 1)) * 100)}%)
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

      {/* 7. 21-Year Accumulation Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          📈 21-Year Sukanya Samriddhi Yojana Accumulation Schedule
        </h3>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold">
              <tr>
                <th className="p-3">Year</th>
                <th className="p-3">Girl Child Age</th>
                <th className="p-3">Annual Deposit</th>
                <th className="p-3">Total Deposits</th>
                <th className="p-3">Edu Withdrawal</th>
                <th className="p-3">Interest Earned</th>
                <th className="p-3">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.yearlyRows.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year}</td>
                  <td className="p-3 font-bold text-teal-600 dark:text-teal-400">Age {row.girlChildAge}</td>
                  <td className="p-3">{formatCurrency(row.depositPaid, state.currency)}</td>
                  <td className="p-3">{formatCurrency(row.totalDepositsPaid, state.currency)}</td>
                  <td className="p-3 text-purple-600 font-bold">{row.educationWithdrawal > 0 ? formatCurrency(row.educationWithdrawal, state.currency) : '-'}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(row.interestEarned, state.currency)}</td>
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
          📊 Sukanya Samriddhi Yojana Scenario Matrix Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-900 dark:text-white font-bold">
              <tr>
                <th className="p-3">Scenario</th>
                <th className="p-3">Annual Deposit</th>
                <th className="p-3">Total Deposits (15Y)</th>
                <th className="p-3">Maturity Corpus (21Y)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.scenarios.map((sc) => (
                <tr key={sc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{sc.label}</td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(sc.annualDeposit, state.currency)}/yr</td>
                  <td className="p-3">{formatCurrency(sc.totalDeposits, state.currency)}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{formatCurrency(sc.maturityValue, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. Share & Reset Bar */}
      <ShareActions title="Sukanya Samriddhi Yojana (SSY) Calculator" />
    </div>
  );
}
