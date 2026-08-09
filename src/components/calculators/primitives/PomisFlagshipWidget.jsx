import { useMemo } from 'preact/hooks';
import { calculatePomisCalculator } from '@calculators/savings/pomis-calculator';
import { POMIS_CONFIG } from '@calculators/configs/pomis-calculator.config';
import FormInputNumber from './FormInputNumber';
import FormSelect from './FormSelect';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function PomisFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    depositAmount: POMIS_CONFIG.defaultDepositAmount,
    accountType: POMIS_CONFIG.defaultAccountType,
    rate: POMIS_CONFIG.defaultRate,
    marginalTaxRate: POMIS_CONFIG.defaultMarginalTaxRate,
    expectedFdRate: 6.75,
    scssRate: 8.2,
    inflationRate: 5.0,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculatePomisCalculator(state);
  }, [state]);

  const presets = POMIS_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';
  const effectiveCap = state.accountType === 'joint' ? 1500000 : 900000;

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-blue-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
              📮 Sovereign Post Office Monthly Income Scheme (POMIS)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model 5-year guaranteed monthly interest cash flows, single vs joint statutory deposit caps (₹9L / ₹15L), premature closure penalty rules, tax slab audits, and Bank FD comparisons.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Guaranteed Monthly Income
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.monthlyIncome, state.currency)} / mo
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              ({formatCurrency(results.total5YearInterest, state.currency)} total 5Y interest)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Statutory Cap Notice (If Exceeded) */}
      {results.isCapExceeded && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 p-4 rounded-xl text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <strong className="font-bold">Statutory Account Ceiling Applied:</strong> Your entered deposit of {formatCurrency(results.rawDepositAmount, state.currency)} exceeds the statutory limit of {formatCurrency(results.effectiveCap, state.currency)} for a {state.accountType === 'joint' ? 'Joint Account (₹15 Lakhs max)' : 'Single Account (₹9 Lakhs max)'}. Calculations have been sanitized to the maximum legal limit of {formatCurrency(results.effectiveCap, state.currency)}.
          </div>
        </div>
      )}

      {/* 3. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart POMIS Presets
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
          1. POMIS Deposit & Account Type Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormSelect
            id="accountType"
            label="Account Ownership Type"
            value={state.accountType}
            onChange={(val) => updateState('accountType', val)}
            options={[
              { value: 'single', label: 'Single Account (Max ₹9 Lakhs)' },
              { value: 'joint', label: 'Joint Account (Max ₹15 Lakhs)' },
            ]}
          />

          <FormInputNumber
            id="depositAmount"
            label="POMIS Deposit Amount"
            value={state.depositAmount}
            onChange={(val) => updateState('depositAmount', val)}
            min={1000}
            max={effectiveCap}
            step={1000}
            prefix={currencySymbol}
            minLabel="₹1,000"
            maxLabel={`Max ${formatCurrency(effectiveCap, state.currency)}`}
          />

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
        </div>
      </div>

      {/* 5. Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Guaranteed Monthly Income
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.monthlyIncome, state.currency)} / mo
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Paid monthly into Post Office / Bank account
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Annual Interest Payout
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatCurrency(results.annualIncome, state.currency)} / yr
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            12 monthly payouts aggregated
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Total 5-Year Interest Payout
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {formatCurrency(results.total5YearInterest, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Over full 60-month tenure
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Est. Annual Tax (At {state.marginalTaxRate}% Slab)
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {formatCurrency(results.annualTaxEstimate, state.currency)} / yr
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Net Monthly After-Tax: {formatCurrency(results.netMonthlyIncomeAfterTax, state.currency)}
          </span>
        </div>
      </div>

      {/* 6. Sovereign POMIS vs Bank FD Yield Comparison */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-700/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/30">
              ⚖️ Guaranteed POMIS vs 5-Year Bank Fixed Deposit
            </span>
            <h4 className="text-xl font-extrabold mt-2">
              POMIS Delivers {formatCurrency(results.pomisVsFdDeltaMonthly, state.currency)} Extra Monthly Cash Flow!
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Comparing Govt-notified {results.rate}% monthly POMIS against a benchmark 5-Year Bank Fixed Deposit monthly payout at {state.expectedFdRate}% p.a.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 min-w-[200px] text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block">POMIS Monthly Advantage</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              +{formatCurrency(results.pomisVsFdDeltaMonthly, state.currency)} / mo
            </span>
          </div>
        </div>
      </div>

      {/* 7. Premature Closure Penalty Summary */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <span>🔒 Statutory Premature Closure Penalty Rules</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">National Savings (MIS) Rules 2019</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-900 dark:text-white block">0 to 1 Year</span>
            <span className="text-slate-500 dark:text-slate-400 block mt-1">Premature closure NOT permitted by law.</span>
          </div>
          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/40">
            <span className="font-bold text-amber-900 dark:text-amber-300 block">1 Year to 3 Years</span>
            <span className="text-slate-600 dark:text-slate-300 block mt-1">
              2% principal penalty ({formatCurrency(results.premature1To3YearPenalty, state.currency)}). Refund: {formatCurrency(results.premature1To3YearRefund, state.currency)}.
            </span>
          </div>
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/40">
            <span className="font-bold text-blue-900 dark:text-blue-300 block">3 Years to 5 Years</span>
            <span className="text-slate-600 dark:text-slate-300 block mt-1">
              1% principal penalty ({formatCurrency(results.premature3To5YearPenalty, state.currency)}). Refund: {formatCurrency(results.premature3To5YearRefund, state.currency)}.
            </span>
          </div>
        </div>
      </div>

      {/* 8. 5-Year Year-by-Year Cash Flow Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 5-Year (60-Month) Interest Payout Cash Flow Schedule</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            Annual Rollup Overview
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Year</th>
                <th className="p-3">Monthly Income Payout</th>
                <th className="p-3">Annual Interest Received</th>
                <th className="p-3">Cumulative 5Y Interest</th>
                <th className="p-3">Principal Balance Returned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year} (Month {row.month})</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(results.monthlyIncome, state.currency)} / mo</td>
                  <td className="p-3 text-indigo-600 dark:text-indigo-400">{formatCurrency(row.annualInterest, state.currency)}</td>
                  <td className="p-3 font-extrabold text-purple-600 dark:text-purple-400">{formatCurrency(row.cumulativeInterest, state.currency)}</td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {row.year === 5 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full">
                        {formatCurrency(row.principalRemaining, state.currency)} (Returned)
                      </span>
                    ) : (
                      formatCurrency(row.principalRemaining, state.currency)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. Share Actions */}
      <ShareActions
        toolTitle="Post Office Monthly Income Scheme (POMIS) Calculator"
        shareText={`Check out my guaranteed monthly interest income: ${formatCurrency(results.monthlyIncome, state.currency)} per month from POMIS!`}
      />
    </div>
  );
}
