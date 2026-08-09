import { useMemo } from 'preact/hooks';
import { calculatePpfCalculator } from '@calculators/savings/ppf-calculator';
import { PPF_CONFIG } from '@calculators/configs/ppf-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function PpfFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    annualDeposit: PPF_CONFIG.defaultAnnualDeposit,
    depositFrequency: 'yearly',
    depositDay: 'before_5th',
    interestRate: PPF_CONFIG.defaultInterestRate,
    tenureYears: PPF_CONFIG.defaultTenureYears,
    extensionMode: 'with_contribution',
    marginalTaxRate: 30,
    inflationRate: 5.0,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculatePpfCalculator(state);
  }, [state]);

  const presets = PPF_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/30">
              🛡️ EEE 100% Tax-Free Public Provident Fund Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model 15-year statutory lock-in, 5-year extension blocks, 5th-of-the-month minimum balance compounding, Section 80C tax savings, and inflation-adjusted purchasing power.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              100% Tax-Free Maturity Corpus
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.finalBalance, state.currency)}
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              (Purchasing Power: {formatCurrency(results.purchasingPower, state.currency)})
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

      {/* 3. Deposit Timing Alert Card */}
      {state.depositDay === 'after_5th' && results.timingLossIfLate > 0 ? (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500 text-slate-900 font-black text-xs rounded-full uppercase">
              ⚠️ Deposit Timing Alert
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              You are losing {formatCurrency(results.timingLossIfLate, state.currency)} in interest by depositing after the 5th of the month!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Under PPF Scheme 2019 rules, interest is calculated on the lowest balance between the 5th and the end of the month. Depositing on or before the 5th ensures you earn interest for the current month.
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateState('depositDay', 'before_5th')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-xl shadow transition-all whitespace-nowrap"
          >
            Switch to On or Before 5th
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              Optimal Deposit Timing Selected!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Depositing on or before the 5th of every month maximizes your monthly interest calculation under Govt of India rules.
            </p>
          </div>
        </div>
      )}

      {/* 4. Input Controls Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          1. Contribution Amount, Frequency & Timing Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="annualDeposit"
            label={`Annual Deposit Amount (${currencySymbol})`}
            value={state.annualDeposit}
            min={500}
            max={150000}
            step={5000}
            onChange={(v) => updateState('annualDeposit', v)}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Contribution Frequency
            </label>
            <select
              value={state.depositFrequency}
              onChange={(e) => updateState('depositFrequency', e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="yearly">Yearly Lump-Sum (April Deposit)</option>
              <option value="monthly">Monthly Installments (SIP)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Deposit Timing (Day of Month)
            </label>
            <select
              value={state.depositDay}
              onChange={(e) => updateState('depositDay', e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="before_5th">On or Before 5th of Month (Recommended)</option>
              <option value="after_5th">After 5th of Month</option>
            </select>
          </div>
        </div>

        {/* Tenure & Extension Block Settings */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            2. Tenure, Extension Blocks & Tax Bracket
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Target Tenure (Years)
              </label>
              <select
                value={state.tenureYears}
                onChange={(e) => updateState('tenureYears', Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 Years (Statutory Maturity)</option>
                <option value={20}>20 Years (1 Extension Block)</option>
                <option value={25}>25 Years (2 Extension Blocks)</option>
                <option value={30}>30 Years (3 Extension Blocks)</option>
              </select>
            </div>

            {state.tenureYears > 15 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Extension Strategy
                </label>
                <select
                  value={state.extensionMode}
                  onChange={(e) => updateState('extensionMode', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="with_contribution">Extension With Fresh Contributions</option>
                  <option value="without_contribution">Extension Without Contributions</option>
                </select>
              </div>
            )}

            <FormInputNumber
              id="interestRate"
              label="Notified Interest Rate (% p.a.)"
              value={state.interestRate}
              min={1}
              max={15}
              step={0.1}
              onChange={(v) => updateState('interestRate', v)}
            />

            <FormInputNumber
              id="marginalTaxRate"
              label="Investor Tax Bracket (%)"
              value={state.marginalTaxRate}
              min={0}
              max={50}
              step={1}
              onChange={(v) => updateState('marginalTaxRate', v)}
            />
          </div>
        </div>
      </div>

      {/* 5. KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">100% Tax-Free Maturity</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {formatCurrency(results.finalBalance, state.currency)}
          </span>
          <span className="text-xs text-emerald-600 font-bold block">EEE Exempt under Sec 10(11)</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Contributions</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">
            {formatCurrency(results.totalDeposits, state.currency)}
          </span>
          <span className="text-xs text-slate-500 block">Over {results.contributionYearsCount} deposit years</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tax-Free Interest Earned</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
            {formatCurrency(results.totalInterestEarned, state.currency)}
          </span>
          <span className="text-xs text-emerald-600 font-bold block">
            ({Math.round((results.totalInterestEarned / (results.totalDeposits || 1)) * 100)}% interest gain)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Section 80C Tax Saved</span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block">
            {formatCurrency(results.totalSec80cTaxSaved, state.currency)}
          </span>
          <span className="text-xs text-purple-600 font-bold block">
            ({formatCurrency(results.annualSec80cTaxSaved, state.currency)}/yr at {state.marginalTaxRate}% slab)
          </span>
        </div>
      </div>

      {/* 6. Contributions vs Interest Ratio Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-sm font-bold">
          <span className="text-blue-600 dark:text-blue-400">
            Total Deposits: {formatCurrency(results.totalDeposits, state.currency)} ({Math.round((results.totalDeposits / (results.finalBalance || 1)) * 100)}%)
          </span>
          <span className="text-emerald-600 dark:text-emerald-400">
            Tax-Free Interest: {formatCurrency(results.totalInterestEarned, state.currency)} ({Math.round((results.totalInterestEarned / (results.finalBalance || 1)) * 100)}%)
          </span>
        </div>
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
          <div
            className="bg-blue-600 h-full transition-all duration-500"
            style={{ width: `${(results.totalDeposits / (results.finalBalance || 1)) * 100}%` }}
          />
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${(results.totalInterestEarned / (results.finalBalance || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* 7. Accumulation Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          📈 Year-by-Year PPF Accumulation Schedule
        </h3>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold">
              <tr>
                <th className="p-3">Year</th>
                <th className="p-3">Opening Balance</th>
                <th className="p-3">Deposit Added</th>
                <th className="p-3">Interest Earned</th>
                <th className="p-3">Cumulative Interest</th>
                <th className="p-3">Sec 80C Tax Saved</th>
                <th className="p-3">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.yearlyRows.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    Year {row.year} {row.isExtension && <span className="text-purple-500 font-bold">*</span>}
                  </td>
                  <td className="p-3">{formatCurrency(row.openingBalance, state.currency)}</td>
                  <td className="p-3 text-blue-600 dark:text-blue-400">{formatCurrency(row.depositAmount, state.currency)}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(row.interestEarned, state.currency)}</td>
                  <td className="p-3">{formatCurrency(row.cumulativeInterest, state.currency)}</td>
                  <td className="p-3 text-purple-600">{formatCurrency(row.taxSaved80C, state.currency)}</td>
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
          📊 PPF Extension & Scenario Matrix Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-900 dark:text-white font-bold">
              <tr>
                <th className="p-3">Scenario</th>
                <th className="p-3">Annual Deposit</th>
                <th className="p-3">Tenure</th>
                <th className="p-3">Total Interest</th>
                <th className="p-3">Tax-Free Maturity Corpus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.scenarios.map((sc) => (
                <tr key={sc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{sc.label}</td>
                  <td className="p-3">{formatCurrency(sc.annualDeposit, state.currency)}</td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{sc.tenureYears} Years</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(sc.totalInterestEarned, state.currency)}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{formatCurrency(sc.finalBalance, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. Share & Reset Bar */}
      <ShareActions title="Public Provident Fund (PPF) Calculator" />
    </div>
  );
}
