import { useMemo } from 'preact/hooks';
import { calculatePensionCalculator } from '@calculators/retirement/pension-calculator';
import { PENSION_CONFIG } from '@calculators/configs/pension-calculator.config';
import FormInputNumber from './FormInputNumber';
import FormSelect from './FormSelect';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function PensionFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    pensionCorpus: PENSION_CONFIG.defaultPensionCorpus,
    annuityRate: PENSION_CONFIG.defaultAnnuityRate,
    annuityType: PENSION_CONFIG.defaultAnnuityType,
    employmentType: PENSION_CONFIG.defaultEmploymentType,
    commutationPct: PENSION_CONFIG.defaultCommutationPct,
    epsSalary: PENSION_CONFIG.defaultEpsSalary,
    epsServiceYears: 0,
    inflationRate: 5.0,
    expectedSwpReturn: 8.5,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculatePensionCalculator(state);
  }, [state]);

  const presets = PENSION_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-purple-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/30">
              🏖️ Flagship Retirement Pension & Annuity Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model lifetime annuity options (ROP, Single Life, Joint Spouse), Section 10(10A) tax-free commutation lump sums, EPFO EPS-95 statutory pensions, inflation purchasing power, and SWP yield comparisons.
            </p>
          </div>
          <div className="bg-purple-900/50 border border-purple-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-purple-300 font-bold block">
              Total Net Monthly Pension
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.totalMonthlyIncome, state.currency)}
            </span>
            <span className="text-xs text-purple-200 mt-1 block">
              ({formatCurrency(results.totalAnnualIncome, state.currency)} / year)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart Pension & Annuity Presets
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
          1. Retirement Corpus & Annuity Variant Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="pensionCorpus"
            label="Total Pension / Retirement Corpus"
            value={state.pensionCorpus}
            onChange={(val) => updateState('pensionCorpus', val)}
            min={0}
            max={100000000}
            step={50000}
            prefix={currencySymbol}
            minLabel="₹0"
            maxLabel="₹10 Cr"
          />

          <FormInputNumber
            id="annuityRate"
            label="Assumed Annuity Rate (% p.a.)"
            value={state.annuityRate}
            onChange={(val) => updateState('annuityRate', val)}
            min={1}
            max={15}
            step={0.1}
            suffix="%"
            minLabel="1.0%"
            maxLabel="15.0%"
          />

          <FormSelect
            id="annuityType"
            label="Annuity Payout Variant"
            value={state.annuityType}
            onChange={(val) => updateState('annuityType', val)}
            options={PENSION_CONFIG.annuityTypes.map((t) => ({
              value: t.id,
              label: t.label,
            }))}
          />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3 pt-4">
          2. Section 10(10A) Commutation & EPFO EPS-95 Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormSelect
            id="employmentType"
            label="Employment Tax Category"
            value={state.employmentType}
            onChange={(val) => updateState('employmentType', val)}
            options={PENSION_CONFIG.employmentTypes.map((e) => ({
              value: e.id,
              label: e.label,
            }))}
          />

          <FormInputNumber
            id="commutationPct"
            label="Commuted Lump Sum (%)"
            value={state.commutationPct}
            onChange={(val) => updateState('commutationPct', val)}
            min={0}
            max={60}
            step={1}
            suffix="%"
            minLabel="0% (Full Annuity)"
            maxLabel="60% Max"
          />

          <FormInputNumber
            id="epsServiceYears"
            label="EPFO EPS-95 Service Years"
            value={state.epsServiceYears}
            onChange={(val) => updateState('epsServiceYears', val)}
            min={0}
            max={40}
            step={1}
            suffix="Yrs"
            minLabel="0 Yrs (No EPS)"
            maxLabel="40 Yrs"
          />
        </div>
      </div>

      {/* 4. Key KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Net Monthly Annuity Pension
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.monthlyAnnuityPension, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            From {formatCurrency(results.netAnnuityCorpus, state.currency)} deployed corpus
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Commuted Tax-Free Lump Sum
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {formatCurrency(results.exemptCommutedLumpSum, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Sec 10(10A) Tax Exempt ({results.taxExemptCommutationFraction === 1 ? '100%' : results.taxExemptCommutationFraction === 0.5 ? '50%' : '33.3%'} limit)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            EPFO EPS-95 Monthly Pension
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatCurrency(results.epsMonthlyPension, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            {results.isEpsEligible ? `Service: ${results.effectiveServiceYears}Y (${results.epsServiceYears >= 20 ? '+2Y Bonus' : 'No bonus'})` : 'Min 10Y service required'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Real Purchasing Power (20Y)
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {formatCurrency(results.purchasingPowerMonthly, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            At {state.inflationRate}% annual inflation
          </span>
        </div>
      </div>

      {/* 5. Pension Annuity vs Equity SWP Comparison */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-700/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
              ⚖️ Guaranteed Annuity vs Equity SWP Simulator
            </span>
            <h4 className="text-xl font-extrabold mt-2">
              SWP Corpus Sustainability: {formatCurrency(results.swpEndingBalance, state.currency)} Remaining at 20 Years!
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Comparing guaranteed lifetime ROP annuity against an equity SWP withdrawing {formatCurrency(results.monthlyAnnuityPension, state.currency)}/month at an assumed {state.expectedSwpReturn}% return rate.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 min-w-[200px] text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block">Total 20Y Income Withdrawn</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.swpTotalWithdrawn, state.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. 20-Year Cash Flow Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 20-Year Pension Payout Cash Flow Schedule</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            Year-by-Year Cumulative Returns
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Year</th>
                <th className="p-3">Annual Annuity Income</th>
                <th className="p-3">EPFO EPS Annual Income</th>
                <th className="p-3">Total Annual Pension</th>
                <th className="p-3">Cumulative Pension Paid</th>
                <th className="p-3">Inflation Real Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400">{formatCurrency(row.annualAnnuityPension, state.currency)}</td>
                  <td className="p-3 text-indigo-600 dark:text-indigo-400">{formatCurrency(row.epsAnnualPension, state.currency)}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{formatCurrency(row.totalAnnualIncome, state.currency)}</td>
                  <td className="p-3 text-purple-600 dark:text-purple-400">{formatCurrency(row.cumulativePension, state.currency)}</td>
                  <td className="p-3 text-amber-600 dark:text-amber-400">{formatCurrency(row.inflationAdjustedAnnual, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Share Actions */}
      <ShareActions
        toolTitle="Pension & Annuity Calculator"
        shareText={`Check out my guaranteed monthly pension calculations: ${formatCurrency(results.totalMonthlyIncome, state.currency)} per month!`}
      />
    </div>
  );
}
