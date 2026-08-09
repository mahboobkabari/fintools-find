import { useMemo } from 'preact/hooks';
import { calculateFdVsDebtFundCalculator } from '@calculators/savings/fd-vs-debt-fund-calculator';
import { FD_VS_DEBT_FUND_CONFIG } from '@calculators/configs/fd-vs-debt-fund-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function FdVsDebtFundFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    depositAmount: FD_VS_DEBT_FUND_CONFIG.defaultDepositAmount,
    tenureYears: FD_VS_DEBT_FUND_CONFIG.defaultTenureYears,
    fdInterestRate: FD_VS_DEBT_FUND_CONFIG.defaultFdInterestRate,
    debtFundReturnRate: FD_VS_DEBT_FUND_CONFIG.defaultDebtFundReturnRate,
    arbitrageReturnRate: FD_VS_DEBT_FUND_CONFIG.defaultArbitrageReturnRate,
    taxSlabRate: FD_VS_DEBT_FUND_CONFIG.defaultTaxSlabRate,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateFdVsDebtFundCalculator(state);
  }, [state]);

  const presets = FD_VS_DEBT_FUND_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';
  const taxSlabs = [0, 10, 15, 20, 30, 40];

  return (
    <div className="space-y-8">
      {/* 1. Hero Post-Tax Decision Banner */}
      <div className="p-6 sm:p-8 rounded-2xl shadow-xl border text-white bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 border-emerald-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-slate-200 text-xs font-semibold rounded-full border border-white/20">
              📊 Post-Tax Fixed Income Decision Engine ({FD_VS_DEBT_FUND_CONFIG.taxRulesFY2526.financialYear})
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Post-tax yield model accounting for Section 56 slab tax, Section 50AA Finance Act 2023 debt fund redemption tax, and Section 112A Finance Bill 2024 equity arbitrage tax rates.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-slate-300 font-bold block">
              Highest Post-Tax Maturity
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block uppercase">
              {results.winningOption}
            </span>
            <span className="text-xs text-slate-200 mt-1 block font-medium">
              Advantage: +{formatCurrency(results.postTaxAdvantage, state.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Statutory Tax Context Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          ℹ️ Statutory Tax Provisions ({FD_VS_DEBT_FUND_CONFIG.taxRulesFY2526.financialYear})
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
          <div>• <strong className="text-slate-900 dark:text-white">Bank FD:</strong> {results.referenceData.section56FdContext}</div>
          <div>• <strong className="text-slate-900 dark:text-white">Debt Fund:</strong> {results.referenceData.section50aaDebtContext}</div>
          <div>• <strong className="text-slate-900 dark:text-white">Arbitrage Fund:</strong> {results.referenceData.section112aArbitrageContext}</div>
        </div>
      </div>

      {/* 3. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Investment & Tax Presets
        </h3>
        <ScenarioPresetCards
          presets={presets}
          activePresetId={null}
          onSelectPreset={(p) => {
            Object.entries(p.values).forEach(([k, v]) => updateState(k, v));
          }}
        />
      </div>

      {/* 4. Tax Slab Quick Selector & Input Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Select Your Income Tax Slab Rate (%)
          </label>
          <div className="flex flex-wrap gap-2">
            {taxSlabs.map((slab) => (
              <button
                key={slab}
                type="button"
                onClick={() => updateState('taxSlabRate', slab)}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                  state.taxSlabRate === slab
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {slab}% Slab
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <FormInputNumber
            id="depositAmount"
            label="Investment Principal Amount"
            value={state.depositAmount}
            onChange={(val) => updateState('depositAmount', val)}
            min={10000}
            max={100000000}
            step={10000}
            prefix={currencySymbol}
            minLabel="₹10k"
            maxLabel="₹10 Cr"
          />

          <FormInputNumber
            id="tenureYears"
            label="Investment Horizon (Years)"
            value={state.tenureYears}
            onChange={(val) => updateState('tenureYears', val)}
            min={1}
            max={30}
            step={1}
            minLabel="1 Yr"
            maxLabel="30 Yrs"
          />

          <FormInputNumber
            id="fdInterestRate"
            label="Bank FD Interest Rate (% p.a.)"
            value={state.fdInterestRate}
            onChange={(val) => updateState('fdInterestRate', val)}
            min={1.0}
            max={20.0}
            step={0.1}
            suffix="%"
            minLabel="1.0%"
            maxLabel="20.0%"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <FormInputNumber
            id="debtFundReturnRate"
            label="Debt Mutual Fund Return (% p.a.)"
            value={state.debtFundReturnRate}
            onChange={(val) => updateState('debtFundReturnRate', val)}
            min={1.0}
            max={25.0}
            step={0.1}
            suffix="%"
            minLabel="1.0%"
            maxLabel="25.0%"
          />

          <FormInputNumber
            id="arbitrageReturnRate"
            label="Arbitrage Fund Return (% p.a.)"
            value={state.arbitrageReturnRate}
            onChange={(val) => updateState('arbitrageReturnRate', val)}
            min={1.0}
            max={20.0}
            step={0.1}
            suffix="%"
            minLabel="1.0%"
            maxLabel="20.0%"
          />
        </div>
      </div>

      {/* 5. 3-Way Post-Tax Maturity Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bank Fixed Deposit Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              🏦 Bank Fixed Deposit
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
              Quarterly Compound
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Post-Tax Maturity Value</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block">
              {formatCurrency(results.postTaxFdValue, state.currency)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Post-Tax CAGR</span>
              <strong className="text-slate-900 dark:text-white font-bold">{results.postTaxFdCagr}% p.a.</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Tax Liability</span>
              <strong className="text-rose-600 dark:text-rose-400 font-bold">{formatCurrency(results.taxFdLiability, state.currency)}</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tax Rule: Section 56 Income Slab Tax ({state.taxSlabRate}% + 4% Cess).
          </p>
        </div>

        {/* Debt Mutual Fund Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              📈 Debt Mutual Fund
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold">
              Sec 50AA Deferral
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Post-Tax Maturity Value</span>
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400 block">
              {formatCurrency(results.postTaxDebtFundValue, state.currency)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Post-Tax CAGR</span>
              <strong className="text-slate-900 dark:text-white font-bold">{results.postTaxDebtCagr}% p.a.</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Tax Liability</span>
              <strong className="text-rose-600 dark:text-rose-400 font-bold">{formatCurrency(results.taxDebtLiability, state.currency)}</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tax Rule: Section 50AA Redemption Slab Tax (No annual tax deduction).
          </p>
        </div>

        {/* Equity Arbitrage Fund Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              ⚖️ Arbitrage Fund
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-bold">
              Equity Tax Rules
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Post-Tax Maturity Value</span>
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400 block">
              {formatCurrency(results.postTaxArbitrageValue, state.currency)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Post-Tax CAGR</span>
              <strong className="text-slate-900 dark:text-white font-bold">{results.postTaxArbitrageCagr}% p.a.</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Tax Liability</span>
              <strong className="text-rose-600 dark:text-rose-400 font-bold">{formatCurrency(results.taxArbLiability, state.currency)}</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tax Rule: {state.tenureYears <= 1 ? 'Sec 111A STCG 20%' : 'Sec 112A LTCG 12.5% (>₹1.25L Exemption)'}.
          </p>
        </div>
      </div>

      {/* 6. Year-by-Year Post-Tax Maturity Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 Year-by-Year Post-Tax Trajectory</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {results.tenureYears}-Year Rollup
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Year</th>
                <th className="p-3">FD Gross Value</th>
                <th className="p-3">FD Post-Tax Value</th>
                <th className="p-3">Debt Fund Post-Tax</th>
                <th className="p-3">Arbitrage Post-Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} className={row.isFinalRow ? 'bg-slate-100 dark:bg-slate-700/50 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{formatCurrency(row.fdGrossValue, state.currency)}</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.fdPostTaxValue, state.currency)}</td>
                  <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(row.debtPostTaxValue, state.currency)}</td>
                  <td className="p-3 font-bold text-purple-600 dark:text-purple-400">{formatCurrency(row.arbPostTaxValue, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Share Actions */}
      <ShareActions
        toolTitle="FD vs Debt Mutual Fund Calculator"
        shareText={`For a ${state.taxSlabRate}% tax slab investor, ${results.winningOption} yields ${formatCurrency(results.options[0].postTaxValue, state.currency)} post-tax maturity value!`}
      />
    </div>
  );
}
