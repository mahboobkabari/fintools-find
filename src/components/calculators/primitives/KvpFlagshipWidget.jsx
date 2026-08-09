import { useMemo } from 'preact/hooks';
import { calculateKvpCalculator } from '@calculators/savings/kvp-calculator';
import { KVP_CONFIG } from '@calculators/configs/kvp-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function KvpFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    depositAmount: KVP_CONFIG.defaultDepositAmount,
    rate: KVP_CONFIG.defaultRate,
    marginalTaxRate: KVP_CONFIG.defaultMarginalTaxRate,
    nscRate: 7.7,
    expectedFdRate: 6.75,
    inflationRate: 5.0,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateKvpCalculator(state);
  }, [state]);

  const presets = KVP_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-amber-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full border border-amber-500/30">
              📜 Sovereign Kisan Vikas Patra (KVP)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model 115-month principal doubling payouts, government-notified annual compound interest ({results.rate}% p.a.), 30-month lock-in premature encashment tables, and Bank FD comparisons.
            </p>
          </div>
          <div className="bg-amber-900/50 border border-amber-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block">
              Doubled Maturity Corpus
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.maturityAmount, state.currency)}
            </span>
            <span className="text-xs text-amber-200 mt-1 block">
              At Month 115 (9 Yrs 7 Mos)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart KVP Presets
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
          1. KVP Investment Deposit & Rate Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="depositAmount"
            label="KVP Investment Deposit Amount"
            value={state.depositAmount}
            onChange={(val) => updateState('depositAmount', val)}
            min={1000}
            max={10000000}
            step={100}
            prefix={currencySymbol}
            minLabel="₹1,000"
            maxLabel="No Upper Limit"
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

      {/* 4. Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Doubled Maturity Corpus
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.maturityAmount, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Paid at Month 115 (Exactly 2x Deposit)
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
            100% Return on Principal
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Statutory Doubling Period
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            115 Months
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            9 Years and 7 Months
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
            Taxable as Income from Other Sources
          </span>
        </div>
      </div>

      {/* 5. Sovereign KVP vs Bank FD & NSC Comparison Card */}
      <div className="bg-gradient-to-br from-amber-900 via-slate-900 to-emerald-950 text-white p-6 rounded-2xl shadow-lg border border-amber-700/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
              ⚖️ Sovereign KVP vs 9.58-Year Bank Fixed Deposit
            </span>
            <h4 className="text-xl font-extrabold mt-2">
              KVP Delivers {formatCurrency(results.kvpVsFdDelta, state.currency)} Extra Wealth Over Bank FD!
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Comparing Govt-notified {results.rate}% KVP (doubling in 115 months) against a benchmark 9.58-Year Bank Fixed Deposit compounding at {state.expectedFdRate}% p.a.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 min-w-[220px] text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block">KVP Maturity Advantage</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              +{formatCurrency(results.kvpVsFdDelta, state.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Statutory Premature Encashment Payout Schedule */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <span>🔒 Statutory Premature Encashment Payout Schedule</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Lock-in Period: 2.5 Years (30 Months)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Encashment before 30 months is not permitted under Post Office rules. After 30 months, encashment is allowed in 6-month blocks at pre-defined statutory payout rates per ₹1,000 principal:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Lock-in Period Block</th>
                <th className="p-3">Payout per ₹1,000</th>
                <th className="p-3">Total Encashment Payout</th>
                <th className="p-3">Interest Earned</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.prematureEncashmentSchedule.map((row) => (
                <tr key={row.months} className={row.months === 115 ? 'bg-emerald-50/60 dark:bg-emerald-950/30 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{row.lockInBlock}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">₹{row.payoutPer1000}</td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(row.totalPayout, state.currency)}</td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.interestEarned, state.currency)}</td>
                  <td className="p-3">
                    {row.months === 115 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full">
                        🏆 Full Doubling Maturity
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs rounded-full">
                        Encashment Eligible
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Year-by-Year Compounding Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 Year-by-Year Compound Growth Schedule</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            Annual Rollup Overview
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Period</th>
                <th className="p-3">Opening Balance</th>
                <th className="p-3">Interest Earned</th>
                <th className="p-3">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} className={row.isMaturityRow ? 'bg-emerald-50/60 dark:bg-emerald-950/30 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{row.label}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{formatCurrency(row.startBalance, state.currency)}</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.interestEarned, state.currency)}</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">{formatCurrency(row.endBalance, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Share Actions */}
      <ShareActions
        toolTitle="Kisan Vikas Patra (KVP) Calculator"
        shareText={`Check out my guaranteed doubled maturity payout: ${formatCurrency(results.maturityAmount, state.currency)} from KVP!`}
      />
    </div>
  );
}
