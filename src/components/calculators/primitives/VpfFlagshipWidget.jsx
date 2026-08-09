import { useMemo } from 'preact/hooks';
import { calculateVpfCalculator } from '@calculators/retirement/vpf-calculator';
import { VPF_CONFIG } from '@calculators/configs/vpf-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function VpfFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    monthlyBasicSalary: VPF_CONFIG.defaultMonthlyBasic,
    epfPercent: VPF_CONFIG.defaultEpfPercent,
    vpfPercent: VPF_CONFIG.defaultVpfPercent,
    currentAge: VPF_CONFIG.defaultCurrentAge,
    retirementAge: VPF_CONFIG.defaultRetirementAge,
    rate: VPF_CONFIG.defaultRate,
    salaryGrowth: VPF_CONFIG.defaultSalaryGrowth,
    marginalTaxRate: VPF_CONFIG.defaultMarginalTaxRate,
    ppfRate: 7.1,
    npsRate: 10.0,
    inflationRate: 5.0,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateVpfCalculator(state);
  }, [state]);

  const presets = VPF_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
              🏛️ Voluntary Provident Fund (VPF)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model voluntary VPF contributions on your basic salary, EPFO notified annual interest returns ({results.rate}% p.a.), Section 10(11) ₹2.5L annual tax-free contribution cap audits, and Section 80C tax savings.
            </p>
          </div>
          <div className="bg-indigo-900/50 border border-indigo-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold block">
              Total Retirement Corpus
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.maturityCorpus, state.currency)}
            </span>
            <span className="text-xs text-indigo-200 mt-1 block">
              At Age {state.retirementAge} ({results.tenureYears} Years)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Section 10(11) Tax Ceiling Status Banner */}
      {results.sec10_11CapExceeded ? (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 p-4 rounded-xl text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <strong className="font-bold">Section 10(11) Tax Ceiling Triggered:</strong> Your annual combined employee EPF+VPF contribution exceeds the statutory ₹2,50,000 annual threshold. Interest accrued on contributions above ₹2.5L ({formatCurrency(results.taxableInterest, state.currency)} total) is subject to income tax at your {state.marginalTaxRate}% slab rate ({formatCurrency(results.totalTaxPayableOnInterest, state.currency)} est. tax).
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 p-4 rounded-xl text-emerald-900 dark:text-emerald-200 text-sm flex items-start gap-3">
          <span className="text-xl">✅</span>
          <div>
            <strong className="font-bold">100% Tax-Free Interest Status:</strong> Your annual employee EPF+VPF contribution is within the statutory ₹2,50,000 Section 10(11) tax-free threshold. All {formatCurrency(results.totalInterestEarned, state.currency)} interest earned is completely exempt from income tax!
          </div>
        </div>
      )}

      {/* 3. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart VPF Presets
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
          1. Salary & VPF Contribution Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="monthlyBasicSalary"
            label="Monthly Basic Salary + DA"
            value={state.monthlyBasicSalary}
            onChange={(val) => updateState('monthlyBasicSalary', val)}
            min={10000}
            max={2000000}
            step={1000}
            prefix={currencySymbol}
            minLabel="₹10,000"
            maxLabel="₹20 Lakhs"
          />

          <FormInputNumber
            id="vpfPercent"
            label="Voluntary VPF Contribution (% Basic)"
            value={state.vpfPercent}
            onChange={(val) => updateState('vpfPercent', val)}
            min={0}
            max={88}
            step={1}
            suffix="%"
            minLabel="0%"
            maxLabel="88% Max"
          />

          <FormInputNumber
            id="rate"
            label="EPFO Notified Interest Rate (% p.a.)"
            value={state.rate}
            onChange={(val) => updateState('rate', val)}
            min={1}
            max={15}
            step={0.05}
            suffix="%"
            minLabel="1.0%"
            maxLabel="15.0%"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <FormInputNumber
            id="currentAge"
            label="Current Age (Years)"
            value={state.currentAge}
            onChange={(val) => updateState('currentAge', val)}
            min={18}
            max={58}
            step={1}
            suffix=" Yrs"
            minLabel="18 Yrs"
            maxLabel="58 Yrs"
          />

          <FormInputNumber
            id="retirementAge"
            label="Retirement Age (Years)"
            value={state.retirementAge}
            onChange={(val) => updateState('retirementAge', val)}
            min={40}
            max={75}
            step={1}
            suffix=" Yrs"
            minLabel="40 Yrs"
            maxLabel="75 Yrs"
          />

          <FormInputNumber
            id="salaryGrowth"
            label="Annual Salary Increment"
            value={state.salaryGrowth}
            onChange={(val) => updateState('salaryGrowth', val)}
            min={0}
            max={25}
            step={0.5}
            suffix="%"
            minLabel="0%"
            maxLabel="25%"
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
            Total Retirement Corpus
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.maturityCorpus, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            At Age {state.retirementAge} ({results.tenureYears} Yrs Compounding)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Total EPFO Interest Earned
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatCurrency(results.totalInterestEarned, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Notified Rate: {results.rate}% p.a.
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Monthly VPF Contribution
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {formatCurrency(results.monthlyVpfContribution, state.currency)} / mo
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Total EPF+VPF: {formatCurrency(results.monthlyTotalEmployeeContribution, state.currency)} / mo
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Year 1 Sec 80C Tax Saved
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {formatCurrency(results.sec80cYear1Saved, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Sec 80C Eligible: {formatCurrency(results.sec80cEligible, state.currency)}
          </span>
        </div>
      </div>

      {/* 6. VPF vs PPF & NPS Yield Comparison Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-700/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
              ⚖️ Voluntary VPF vs PPF vs NPS Comparison
            </span>
            <h4 className="text-xl font-extrabold mt-2">
              VPF Beats PPF by {formatCurrency(results.vpfVsPpfDelta, state.currency)} at Maturity!
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Comparing EPFO-notified {results.rate}% VPF against Public Provident Fund (PPF @ 7.1% with ₹1.5L cap) and National Pension System (NPS @ 10% market return).
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 min-w-[220px] text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block">VPF Advantage Over PPF</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              +{formatCurrency(results.vpfVsPpfDelta, state.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 7. Year-by-Year Retirement Accumulation Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 Retirement Growth Schedule ({results.tenureYears} Years)</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            EPFO Compounding Schedule
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Year (Age)</th>
                <th className="p-3">Monthly Basic Salary</th>
                <th className="p-3">Annual EPF+VPF Contrib</th>
                <th className="p-3">Tax-Free Interest (Sec 10)</th>
                <th className="p-3">Taxable Interest</th>
                <th className="p-3">End Year Corpus Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year} (Age {row.age})</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{formatCurrency(row.monthlyBasic, state.currency)}</td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(row.annualContrib, state.currency)}</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.taxFreeInterestY, state.currency)}</td>
                  <td className="p-3 text-amber-600 dark:text-amber-400 font-semibold">
                    {row.taxableInterestY > 0 ? formatCurrency(row.taxableInterestY, state.currency) : '₹0'}
                  </td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">{formatCurrency(row.endBalance, state.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Share Actions */}
      <ShareActions
        toolTitle="Voluntary Provident Fund (VPF) Calculator"
        shareText={`Check out my estimated retirement VPF corpus: ${formatCurrency(results.maturityCorpus, state.currency)} at age ${state.retirementAge}!`}
      />
    </div>
  );
}
