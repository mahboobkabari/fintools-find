import { useMemo } from 'preact/hooks';
import { calculateScssCalculator } from '@calculators/savings/scss-calculator';
import { SCSS_CONFIG } from '@calculators/configs/scss-calculator.config';
import FormInputNumber from './FormInputNumber';
import FormSelect from './FormSelect';
import FormToggleSwitch from './FormToggleSwitch';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function ScssFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    depositAmount: SCSS_CONFIG.defaultDepositAmount,
    accountType: 'individual',
    eligibilityCategory: 'age_60_plus',
    rate: SCSS_CONFIG.defaultRate,
    marginalTaxRate: 20,
    hasPan: true,
    hasForm15H: false,
    prematureExitYears: 0,
    expectedFdRate: 7.5,
    inflationRate: 5.0,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateScssCalculator(state);
  }, [state]);

  const presets = SCSS_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full border border-amber-500/30">
              👴 Guaranteed Sovereign Senior Citizens Savings Scheme
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model quarterly sovereign payouts, statutory ₹30L/₹60L deposit caps, Section 80C & 80TTB tax savings, Section 194A TDS & Form 15H rules, premature exit penalties, and Senior Citizen FD comparisons.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Guaranteed Quarterly Pension
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.quarterlyGrossPayout, state.currency)}
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              ({formatCurrency(results.annualGrossInterest, state.currency)} / year)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Preset Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart SCSS Presets
        </h3>
        <ScenarioPresetCards
          presets={presets}
          activePresetId={null}
          onSelectPreset={(p) => {
            Object.entries(p.values).forEach(([k, v]) => updateState(k, v));
          }}
        />
      </div>

      {/* 3. Statutory Cap Alert Banner if Capped */}
      {results.isCapped && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 p-5 rounded-2xl flex items-center gap-3 text-amber-900 dark:text-amber-200">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="text-sm font-bold">
              Statutory Deposit Limit Enforced
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              The deposit amount has been capped at {formatCurrency(results.statutoryMaxCap, state.currency)} based on the selected {state.accountType === 'joint' ? 'Joint Spouse (₹60 Lakhs)' : 'Individual (₹30 Lakhs)'} account category under Ministry of Finance guidelines.
            </p>
          </div>
        </div>
      )}

      {/* 4. Input Controls Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          1. Eligibility & Deposit Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormSelect
            id="eligibilityCategory"
            label="Eligibility Category"
            value={state.eligibilityCategory}
            onChange={(val) => updateState('eligibilityCategory', val)}
            options={[
              { value: 'age_60_plus', label: '👴 Senior Citizen (Age 60+)' },
              { value: 'vrs_55_60', label: '👔 Retired Civilian Employee (Age 55-60)' },
              { value: 'defense_50_plus', label: '🎖️ Retired Defense Personnel (Age 50+)' },
            ]}
          />

          <FormSelect
            id="accountType"
            label="Account Category & Cap"
            value={state.accountType}
            onChange={(val) => updateState('accountType', val)}
            options={[
              { value: 'individual', label: '👤 Individual Account (Max ₹30 Lakhs)' },
              { value: 'joint', label: '💑 Joint Account with Spouse (Max ₹60 Lakhs)' },
            ]}
          />

          <FormInputNumber
            id="depositAmount"
            label="SCSS Deposit Amount"
            value={state.depositAmount}
            onChange={(val) => updateState('depositAmount', val)}
            min={1000}
            max={state.accountType === 'joint' ? 6000000 : 3000000}
            step={1000}
            prefix={currencySymbol}
            minLabel="₹1,000"
            maxLabel={state.accountType === 'joint' ? '₹60L Cap' : '₹30L Cap'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <FormInputNumber
            id="rate"
            label="Notified Interest Rate (% p.a.)"
            value={state.rate}
            onChange={(val) => updateState('rate', val)}
            min={1}
            max={15}
            step={0.1}
            suffix="%"
            minLabel="1.0%"
            maxLabel="15.0%"
          />

          <FormInputNumber
            id="marginalTaxRate"
            label="Marginal Income Tax Slab"
            value={state.marginalTaxRate}
            onChange={(val) => updateState('marginalTaxRate', val)}
            min={0}
            max={50}
            step={5}
            suffix="%"
            minLabel="0%"
            maxLabel="50%"
          />

          <FormInputNumber
            id="prematureExitYears"
            label="Premature Closure Horizon (Years)"
            value={state.prematureExitYears}
            onChange={(val) => updateState('prematureExitYears', val)}
            min={0}
            max={5}
            step={0.5}
            suffix="Y"
            minLabel="0Y (5Y Full Maturity)"
            maxLabel="5Y Maturity"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <FormToggleSwitch
            id="hasPan"
            label="Valid PAN Furnished?"
            description="PAN is required for standard 10% TDS under Sec 194A (20% penalty TDS if missing)."
            checked={state.hasPan}
            onChange={(checked) => updateState('hasPan', checked)}
          />

          <FormToggleSwitch
            id="hasForm15H"
            label="Submitted Form 15H?"
            description="Eligible senior citizens with NIL taxable income submit Form 15H for 0% TDS."
            checked={state.hasForm15H}
            onChange={(checked) => updateState('hasForm15H', checked)}
          />
        </div>
      </div>

      {/* 5. Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Gross Quarterly Income
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {formatCurrency(results.quarterlyGrossPayout, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Paid 1st of Apr, Jul, Oct, Jan
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Total 5-Year Interest Earned
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.total5YearInterest, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Over 20 Payout Quarters
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Sec 80TTB Tax-Exempt Interest
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
            {formatCurrency(results.sec80ttbExemptInterest, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Per FY Exemption for Seniors
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Estimated Annual TDS Tax
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {formatCurrency(results.estimatedAnnualTds, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            {results.hasForm15H ? 'Form 15H Active (0% TDS)' : results.isTdsApplicable ? `Sec 194A (${results.tdsRatePct}% TDS)` : 'Interest Below ₹50k Cap'}
          </span>
        </div>
      </div>

      {/* 6. Guaranteed SCSS vs Senior Citizen FD Comparison Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-700/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
              ⚖️ Guaranteed SCSS vs Senior Citizen Bank FD
            </span>
            <h4 className="text-xl font-extrabold mt-2">
              SCSS Delivers {formatCurrency(results.scssIncomeDelta, state.currency)} Extra Interest Over 5 Years!
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Comparing Govt-notified {results.rate}% SCSS interest against a benchmark Senior Citizen Bank FD at {state.expectedFdRate}% p.a.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 min-w-[200px] text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block">Quarterly Payout Advantage</span>
            <span className="text-2xl font-black text-amber-300 mt-1 block">
              +{formatCurrency(results.quarterlyGrossPayout - results.fdQuarterlyPayout, state.currency)}/qtr
            </span>
          </div>
        </div>
      </div>

      {/* 7. Premature Exit Penalty Tier Simulator (if applicable) */}
      {results.isPrematureExit && (
        <div className="bg-rose-500/10 border-2 border-rose-500/30 p-5 rounded-2xl space-y-2 text-rose-900 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <h4 className="text-base font-extrabold">
              Premature Closure Penalty Active ({results.prematureExitYears} Years Exit)
            </h4>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Under SCSS Rules 2019, exiting after {results.prematureExitYears} years incurs a penalty of {results.penaltyRatePct}% of principal deposit ({formatCurrency(results.penaltyAmount, state.currency)}). Your net principal refund will be {formatCurrency(results.netPrincipalRefund, state.currency)}.
          </p>
        </div>
      )}

      {/* 8. 20-Quarter Cash Flow Payout Schedule */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 20-Quarter Cash Flow & Tax Breakdown Schedule</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            5-Year Statutory Maturity
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Quarter</th>
                <th className="p-3">Payout Month</th>
                <th className="p-3">Gross Quarterly Income</th>
                <th className="p-3">Sec 80TTB Tax-Exempt</th>
                <th className="p-3">Estimated TDS</th>
                <th className="p-3">Net Quarterly Income</th>
                <th className="p-3">Cumulative Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.quarterlyRows.map((row) => (
                <tr key={row.quarter} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Q{row.quarter} (Y{row.year})</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{row.calendarMonth}</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.grossPayout, state.currency)}</td>
                  <td className="p-3 text-blue-600 dark:text-blue-400">{formatCurrency(row.sec80ttbExempt, state.currency)}</td>
                  <td className="p-3 text-rose-600 dark:text-rose-400">{formatCurrency(row.estimatedTds, state.currency)}</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">{formatCurrency(row.netPayout, state.currency)}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{formatCurrency(row.cumulativeInterest, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. Share & Print Actions */}
      <ShareActions
        toolTitle="Senior Citizens Savings Scheme (SCSS) Calculator"
        shareText={`Check out my SCSS quarterly passive pension calculations: ${formatCurrency(results.quarterlyGrossPayout, state.currency)} guaranteed payout per quarter!`}
      />
    </div>
  );
}
