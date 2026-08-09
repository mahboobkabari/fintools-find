import { useMemo } from 'preact/hooks';
import { calculate401kCalculator } from '@calculators/retirement/401k-calculator';
import { FOUR_ZERO_ONE_K_CONFIG } from '@calculators/configs/401k-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function FourZeroOneKFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    annualSalary: 90000,
    currentAge: 30,
    retirementAge: 65,
    contributionPercent: 8,
    employerMatchPercent: 50,
    employerMatchLimit: 6,
    currentBalance: 25000,
    expectedReturn: 7,
    annualSalaryIncrease: 3,
    currentTaxRate: 24,
    retirementTaxRate: 15,
    inflationRate: 2.5,
    currency: 'USD',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculate401kCalculator(state);
  }, [state]);

  const presets = FOUR_ZERO_ONE_K_CONFIG.presets;

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              🇺🇸 Institutional 401(k) Wealth & Match Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model workplace 401(k) accumulation, capture 100% of employer matching dollars ("free money"), audit IRS contribution caps ($23.5k / $7.5k catch-up), and evaluate Traditional pre-tax vs Roth tax trade-offs.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Projected 401(k) Nest Egg
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.finalBalance, 'USD')}
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              (After-Tax: {formatCurrency(results.tradAfterTaxCorpus, 'USD')} | Age {state.retirementAge})
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

      {/* 3. Employer Match Opportunity Card */}
      {!results.isMatchMaximized && results.missedEmployerMatch > 0 ? (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500 text-slate-900 font-black text-xs rounded-full uppercase">
              ⚠️ Unclaimed Free Money Alert
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              You are missing out on {formatCurrency(results.missedEmployerMatch, 'USD')} in employer match money!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your employer matches up to {state.employerMatchLimit}% of your salary, but you are currently contributing only {state.contributionPercent}%. Increase your contribution rate to at least {state.employerMatchLimit}% to capture 100% of the match.
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateState('contributionPercent', state.employerMatchLimit)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-xl shadow transition-all whitespace-nowrap"
          >
            Claim Full {state.employerMatchLimit}% Match
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              100% Employer Match Captured!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              You are contributing {state.contributionPercent}%, fully capturing all {formatCurrency(results.totalEmployerMatch, 'USD')} in company matching dollars.
            </p>
          </div>
        </div>
      )}

      {/* 4. Input Controls Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          1. Salary, Contribution & Employer Match Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="annualSalary"
            label="Current Annual Gross Salary ($)"
            value={state.annualSalary}
            min={20000}
            max={500000}
            step={2500}
            onChange={(v) => updateState('annualSalary', v)}
          />

          <FormInputNumber
            id="currentAge"
            label="Current Age (Years)"
            value={state.currentAge}
            min={18}
            max={64}
            step={1}
            onChange={(v) => updateState('currentAge', v)}
          />

          <FormInputNumber
            id="retirementAge"
            label="Target Retirement Age (Years)"
            value={state.retirementAge}
            min={50}
            max={75}
            step={1}
            onChange={(v) => updateState('retirementAge', v)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <FormInputNumber
            id="contributionPercent"
            label="Employee Contribution Rate (%)"
            value={state.contributionPercent}
            min={1}
            max={50}
            step={1}
            onChange={(v) => updateState('contributionPercent', v)}
          />

          <FormInputNumber
            id="employerMatchPercent"
            label="Employer Match Rate (%)"
            value={state.employerMatchPercent}
            min={0}
            max={100}
            step={5}
            onChange={(v) => updateState('employerMatchPercent', v)}
          />

          <FormInputNumber
            id="employerMatchLimit"
            label="Employer Match Salary Cap (%)"
            value={state.employerMatchLimit}
            min={0}
            max={15}
            step={1}
            onChange={(v) => updateState('employerMatchLimit', v)}
          />
        </div>

        {/* Investment Growth & Tax Drawer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            2. Existing Savings, Investment Growth & Tax Assumptions
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <FormInputNumber
              id="currentBalance"
              label="Current 401(k) Balance ($)"
              value={state.currentBalance}
              min={0}
              max={1000000}
              step={2500}
              onChange={(v) => updateState('currentBalance', v)}
            />

            <FormInputNumber
              id="expectedReturn"
              label="Expected Return (% p.a.)"
              value={state.expectedReturn}
              min={2}
              max={15}
              step={0.5}
              onChange={(v) => updateState('expectedReturn', v)}
            />

            <FormInputNumber
              id="annualSalaryIncrease"
              label="Annual Salary Growth (%)"
              value={state.annualSalaryIncrease}
              min={0}
              max={15}
              step={0.5}
              onChange={(v) => updateState('annualSalaryIncrease', v)}
            />

            <FormInputNumber
              id="retirementTaxRate"
              label="Retirement Tax Rate (%)"
              value={state.retirementTaxRate}
              min={0}
              max={50}
              step={1}
              onChange={(v) => updateState('retirementTaxRate', v)}
            />
          </div>
        </div>
      </div>

      {/* 5. KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total 401(k) Nest Egg</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {formatCurrency(results.finalBalance, 'USD')}
          </span>
          <span className="text-xs text-slate-500 block">At age {state.retirementAge} ({results.yearsInvested} yrs)</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Employee Contributions</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">
            {formatCurrency(results.totalEmployeeContributions, 'USD')}
          </span>
          <span className="text-xs text-slate-500 block">Your personal savings</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Employer Match ("Free Money")</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
            {formatCurrency(results.totalEmployerMatch, 'USD')}
          </span>
          <span className="text-xs text-emerald-600 font-bold block">
            {results.matchCapturePct}% Match Captured
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Compound Interest Growth</span>
          <span className="text-2xl font-black text-amber-500 block">
            {formatCurrency(results.totalGrowth, 'USD')}
          </span>
          <span className="text-xs text-slate-500 block">
            {results.multiplier}x Wealth Multiplier
          </span>
        </div>
      </div>

      {/* 6. Traditional Pre-Tax vs Roth 401(k) Comparison */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          ⚖️ Traditional Pre-Tax vs. Roth 401(k) Tax Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-md">
              Traditional Pre-Tax 401(k)
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block pt-1">
              {formatCurrency(results.tradAfterTaxCorpus, 'USD')}
            </span>
            <span className="text-xs text-slate-500 block">
              After {state.retirementTaxRate}% tax in retirement (Pre-tax growth: {formatCurrency(results.finalBalance, 'USD')})
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-md">
              Roth 401(k) (Tax-Free Growth)
            </span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block pt-1">
              {formatCurrency(results.rothAfterTaxCorpus, 'USD')}
            </span>
            <span className="text-xs text-slate-500 block">
              100% Tax-Free withdrawals at retirement (Paid post-tax at current {state.currentTaxRate}% rate)
            </span>
          </div>
        </div>
      </div>

      {/* 7. Year-by-Year Accumulation Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          📈 Year-by-Year 401(k) Accumulation Schedule
        </h3>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold">
              <tr>
                <th className="p-3">Year (Age)</th>
                <th className="p-3">Annual Salary</th>
                <th className="p-3">Employee Contrib</th>
                <th className="p-3">Employer Match</th>
                <th className="p-3">Total Added</th>
                <th className="p-3">Interest Growth</th>
                <th className="p-3">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.yearlyRows.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    Yr {row.year} (Age {row.age}) {row.isCatchUpEligible && <span className="text-emerald-500 font-bold">*</span>}
                  </td>
                  <td className="p-3">{formatCurrency(row.salary, 'USD')}</td>
                  <td className="p-3 text-blue-600 dark:text-blue-400">{formatCurrency(row.employeeContrib, 'USD')}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(row.employerMatch, 'USD')}</td>
                  <td className="p-3">{formatCurrency(row.totalContrib, 'USD')}</td>
                  <td className="p-3 text-amber-500 font-medium">{formatCurrency(row.interestEarned, 'USD')}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{formatCurrency(row.endingBalance, 'USD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Scenario Comparison Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          📊 401(k) Scenario Matrix Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-900 dark:text-white font-bold">
              <tr>
                <th className="p-3">Scenario</th>
                <th className="p-3">Contrib %</th>
                <th className="p-3">Year 1 Contrib</th>
                <th className="p-3">Final 401(k) Balance</th>
                <th className="p-3">After-Tax Nest Egg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.scenarios.map((sc) => (
                <tr key={sc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{sc.label}</td>
                  <td className="p-3">{sc.contribPct}%</td>
                  <td className="p-3 font-medium">{formatCurrency(sc.contribAmountYear1, 'USD')}</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(sc.finalBalance, 'USD')}</td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(sc.afterTaxBalance, 'USD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. Share & Reset Bar */}
      <ShareActions title="401(k) Retirement Calculator" />
    </div>
  );
}
