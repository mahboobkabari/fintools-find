import { useMemo } from 'preact/hooks';
import { calculateNscCalculator } from '@calculators/savings/nsc-calculator';
import { NSC_CONFIG } from '@calculators/configs/nsc-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function NscFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    depositAmount: NSC_CONFIG.defaultDepositAmount,
    rate: NSC_CONFIG.defaultRate,
    marginalTaxRate: NSC_CONFIG.defaultMarginalTaxRate,
    expectedFdRate: 7.25,
    inflationRate: 5.0,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateNscCalculator(state);
  }, [state]);

  const presets = NSC_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-teal-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              📜 Sovereign National Savings Certificate (VIII Issue)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model 5-year annual compounding, Section 80C upfront tax savings, Years 1–4 deemed interest reinvestment tax benefits, Year 5 maturity taxability, and Tax Saver FD comparisons.
            </p>
          </div>
          <div className="bg-emerald-900/50 border border-emerald-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
              Guaranteed 5-Year Corpus
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.maturityAmount, state.currency)}
            </span>
            <span className="text-xs text-emerald-200 mt-1 block">
              (+{formatCurrency(results.totalInterestEarned, state.currency)} Interest)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart NSC Presets
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
          1. NSC Investment & Tax Bracket Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="depositAmount"
            label="NSC Investment Deposit Amount"
            value={state.depositAmount}
            onChange={(val) => updateState('depositAmount', val)}
            min={1000}
            max={10000000}
            step={100}
            prefix={currencySymbol}
            minLabel="₹1,000"
            maxLabel="₹1 Cr"
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
            5-Year Maturity Corpus
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {formatCurrency(results.maturityAmount, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            100% Sovereign Guaranteed
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Year 1 Sec 80C Tax Saved
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.sec80cYear1Saved, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            On {formatCurrency(results.sec80cInitialEligible, state.currency)} 80C deposit cap
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Years 1-4 Deemed 80C Interest
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {formatCurrency(results.totalDeemed80cInterest, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Deemed Reinvested Sec 80C Benefit
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Year 5 Taxable Maturity Interest
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {formatCurrency(results.year5TaxableInterest, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Taxable at {state.marginalTaxRate}% slab ({formatCurrency(results.year5TaxPayable, state.currency)} tax)
          </span>
        </div>
      </div>

      {/* 5. Sovereign NSC vs 5-Year Bank Tax Saver FD Comparison */}
      <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-teal-700/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
              ⚖️ Guaranteed Sovereign NSC vs 5-Year Tax Saver Bank FD
            </span>
            <h4 className="text-xl font-extrabold mt-2">
              NSC Delivers {formatCurrency(results.nscInterestDelta, state.currency)} Extra Guaranteed Interest!
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Comparing Govt-notified {results.rate}% annual compounding NSC against a benchmark 5-Year Tax Saver Bank FD at {state.expectedFdRate}% p.a.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 min-w-[200px] text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block">NSC Maturity Advantage</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              +{formatCurrency(results.nscInterestDelta, state.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. 5-Year Year-by-Year Accrual & Deemed Section 80C Schedule */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 5-Year Year-by-Year Accrual & Deemed Sec 80C Schedule</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            National Savings Certificates (VIII Issue)
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Year</th>
                <th className="p-3">Opening Balance</th>
                <th className="p-3">Accrued Interest</th>
                <th className="p-3">Closing Balance</th>
                <th className="p-3">Section 80C Status</th>
                <th className="p-3">Estimated Sec 80C Tax Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlyRows.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{formatCurrency(row.openingBalance, state.currency)}</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.accruedInterest, state.currency)}</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">{formatCurrency(row.closingBalance, state.currency)}</td>
                  <td className="p-3">
                    {row.isDeemed80cEligible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-xs rounded-full">
                        ✓ Sec 80C Deemed Reinvested
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs rounded-full">
                        ⚠️ Taxable at Slab (Maturity)
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {row.isDeemed80cEligible ? formatCurrency(row.sec80cTaxSavedOnInterest, state.currency) : '₹0 (Taxable)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Share Actions */}
      <ShareActions
        toolTitle="National Savings Certificate (NSC) Calculator"
        shareText={`Check out my guaranteed 5-year Post Office NSC investment calculation: ${formatCurrency(results.maturityAmount, state.currency)} maturity corpus!`}
      />
    </div>
  );
}
