import { useMemo } from 'preact/hooks';
import { calculateApyCalculator } from '@calculators/retirement/apy-calculator';
import { APY_CONFIG } from '@calculators/configs/apy-calculator.config';
import FormInputNumber from './FormInputNumber';
import FormSelect from './FormSelect';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function ApyFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    entryAge: APY_CONFIG.defaultEntryAge,
    targetPension: APY_CONFIG.defaultTargetPension,
    frequency: APY_CONFIG.defaultFrequency,
    inflationRate: 5.0,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateApyCalculator(state);
  }, [state]);

  const presets = APY_CONFIG.presets;

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-emerald-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              🛡️ Sovereign Atal Pension Yojana (APY)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model auto-debited monthly contributions across entry ages (18–40 Yrs), guaranteed lifetime pension tiers (₹1k–₹5k/mo), and PFRDA nominee corpus return provisions (up to ₹8.5 Lakhs).
            </p>
          </div>
          <div className="bg-emerald-900/50 border border-emerald-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
              Guaranteed Lifetime Monthly Pension
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.guaranteedMonthlyPension, state.currency)} / mo
            </span>
            <span className="text-xs text-emerald-200 mt-1 block">
              Starting at Age 60 ({results.tenureYears} Yrs Contrib Window)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Invalid Entry Age Notice (If Outside 18-40) */}
      {!results.isValidEntryAge && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/50 p-4 rounded-xl text-rose-900 dark:text-rose-200 text-sm flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <strong className="font-bold">Invalid Subscriber Entry Age:</strong> Entry age {state.entryAge} is outside the statutory PFRDA Atal Pension Yojana eligibility window of 18 to 40 years. Please select an entry age between 18 and 40.
          </div>
        </div>
      )}

      {/* 3. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart APY Presets
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
          1. Subscriber Entry Age & Pension Tier Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="entryAge"
            label="Subscriber Entry Age (Years)"
            value={state.entryAge}
            onChange={(val) => updateState('entryAge', val)}
            min={18}
            max={40}
            step={1}
            suffix=" Yrs"
            minLabel="18 Yrs"
            maxLabel="40 Yrs (Max Entry)"
          />

          <FormSelect
            id="targetPension"
            label="Target Guaranteed Monthly Pension"
            value={state.targetPension}
            onChange={(val) => updateState('targetPension', Number(val))}
            options={[
              { value: 1000, label: '₹1,000 / mo (Nominee Corpus: ₹1.7L)' },
              { value: 2000, label: '₹2,000 / mo (Nominee Corpus: ₹3.4L)' },
              { value: 3000, label: '₹3,000 / mo (Nominee Corpus: ₹5.1L)' },
              { value: 4000, label: '₹4,000 / mo (Nominee Corpus: ₹6.8L)' },
              { value: 5000, label: '₹5,000 / mo (Nominee Corpus: ₹8.5L)' },
            ]}
          />

          <FormSelect
            id="frequency"
            label="Auto-Debit Payment Frequency"
            value={state.frequency}
            onChange={(val) => updateState('frequency', val)}
            options={[
              { value: 'monthly', label: 'Monthly Auto-Debit' },
              { value: 'quarterly', label: 'Quarterly Auto-Debit' },
              { value: 'halfYearly', label: 'Half-Yearly Auto-Debit' },
            ]}
          />
        </div>
      </div>

      {/* 5. Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Guaranteed Monthly Pension
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.guaranteedMonthlyPension, state.currency)} / mo
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Paid monthly for life starting at age 60
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Auto-Debited Contribution ({state.frequency})
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {state.frequency === 'quarterly'
              ? formatCurrency(results.quarterlyContribution, state.currency) + ' / qtr'
              : state.frequency === 'halfYearly'
              ? formatCurrency(results.halfYearlyContribution, state.currency) + ' / half-yr'
              : formatCurrency(results.monthlyContribution, state.currency) + ' / mo'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Monthly Equivalent: {formatCurrency(results.monthlyContribution, state.currency)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Total Employee Contribution
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {formatCurrency(results.totalEmployeeContribution, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Over {results.tenureYears} Years (Age {state.entryAge} to 60)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Nominee Corpus Return
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {formatCurrency(results.nomineeCorpusReturn, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Paid 100% to nominee upon death of spouse
          </span>
        </div>
      </div>

      {/* 6. PFRDA Statutory Contribution Matrix Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <span>📜 Official PFRDA Statutory Monthly Contribution Matrix</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">PFRDA Notified Table (18–40 Yrs)</span>
        </h3>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">Entry Age</th>
                <th className="p-3">Tenure (Yrs)</th>
                <th className="p-3">₹1,000 / mo</th>
                <th className="p-3">₹2,000 / mo</th>
                <th className="p-3">₹3,000 / mo</th>
                <th className="p-3">₹4,000 / mo</th>
                <th className="p-3">₹5,000 / mo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {Object.entries(APY_CONFIG.pfrdaContributionTable).map(([ageStr, tiers]) => {
                const ageNum = Number(ageStr);
                const isSelectedAge = ageNum === state.entryAge;
                return (
                  <tr
                    key={ageNum}
                    className={isSelectedAge ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-bold border-l-4 border-emerald-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}
                  >
                    <td className="p-3 text-slate-900 dark:text-white font-semibold">Age {ageNum}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{60 - ageNum} Yrs</td>
                    <td className={state.targetPension === 1000 && isSelectedAge ? 'p-3 text-emerald-600 dark:text-emerald-400 font-extrabold' : 'p-3 text-slate-700 dark:text-slate-300'}>₹{tiers[1000]}</td>
                    <td className={state.targetPension === 2000 && isSelectedAge ? 'p-3 text-emerald-600 dark:text-emerald-400 font-extrabold' : 'p-3 text-slate-700 dark:text-slate-300'}>₹{tiers[2000]}</td>
                    <td className={state.targetPension === 3000 && isSelectedAge ? 'p-3 text-emerald-600 dark:text-emerald-400 font-extrabold' : 'p-3 text-slate-700 dark:text-slate-300'}>₹{tiers[3000]}</td>
                    <td className={state.targetPension === 4000 && isSelectedAge ? 'p-3 text-emerald-600 dark:text-emerald-400 font-extrabold' : 'p-3 text-slate-700 dark:text-slate-300'}>₹{tiers[4000]}</td>
                    <td className={state.targetPension === 5000 && isSelectedAge ? 'p-3 text-emerald-600 dark:text-emerald-400 font-extrabold' : 'p-3 text-slate-700 dark:text-slate-300'}>₹{tiers[5000]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Year-by-Year Cumulative Contribution Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 Cumulative Contribution Schedule ({results.tenureYears} Years)</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            Auto-Debit Accumulation
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Year (Age)</th>
                <th className="p-3">Annual Auto-Debited Contribution</th>
                <th className="p-3">Cumulative Contribution Paid</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} className={row.isRetirementRow ? 'bg-emerald-50/60 dark:bg-emerald-950/30 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year} (Age {row.age})</td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(row.annualContribution, state.currency)}</td>
                  <td className="p-3 font-extrabold text-purple-600 dark:text-purple-400">{formatCurrency(row.cumulativeContribution, state.currency)}</td>
                  <td className="p-3">
                    {row.isRetirementRow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full">
                        🏆 Pension Starts ({formatCurrency(results.guaranteedMonthlyPension, state.currency)}/mo)
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">Accumulation Phase</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Share Actions */}
      <ShareActions
        toolTitle="Atal Pension Yojana (APY) Calculator"
        shareText={`Check out my guaranteed lifetime monthly pension: ${formatCurrency(results.guaranteedMonthlyPension, state.currency)} per month from APY!`}
      />
    </div>
  );
}
