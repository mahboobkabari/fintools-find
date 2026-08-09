import { useMemo } from 'preact/hooks';
import { calculateFire } from '@calculators/retirement/fire-calculator';
import FormInputNumber from './FormInputNumber';
import ResultDashboard from '../../ui/ResultDashboard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import ResultDonutChart from '../../ui/ResultDonutChart';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function FireFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    currentAge: 30,
    targetFireAge: 45,
    currentMonthlyExpenses: 60000,
    currentMonthlySavings: 40000,
    currentCorpus: 1000000,
    inflationRate: 6.0,
    expectedReturnRate: 12.0,
    swrPct: 4.0,
    fireVariant: 'standard',
    baristaIncome: 25000,
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateFire(state);
  }, [state]);

  const presets = [
    {
      id: 'aggressive_early',
      title: 'Aggressive Early FIRE (Age 40)',
      description: 'High savings rate (₹1L/mo) targeting financial independence by age 40.',
      values: {
        currentAge: 30,
        targetFireAge: 40,
        currentMonthlyExpenses: 80000,
        currentMonthlySavings: 100000,
        currentCorpus: 1500000,
        inflationRate: 6.0,
        expectedReturnRate: 12.0,
        swrPct: 4.0,
        fireVariant: 'standard',
      },
    },
    {
      id: 'standard_fire',
      title: 'Standard FIRE (Age 50)',
      description: 'Balanced retirement at age 50 covering 100% baseline lifestyle.',
      values: {
        currentAge: 32,
        targetFireAge: 50,
        currentMonthlyExpenses: 100000,
        currentMonthlySavings: 60000,
        currentCorpus: 2500000,
        inflationRate: 6.0,
        expectedReturnRate: 12.0,
        swrPct: 4.0,
        fireVariant: 'standard',
      },
    },
    {
      id: 'lean_fire',
      title: 'Lean FIRE Minimalist',
      description: 'Minimalist frugal lifestyle (75% expenses) targeting rapid FIRE.',
      values: {
        currentAge: 28,
        targetFireAge: 42,
        currentMonthlyExpenses: 40000,
        currentMonthlySavings: 50000,
        currentCorpus: 800000,
        inflationRate: 6.0,
        expectedReturnRate: 12.0,
        swrPct: 4.0,
        fireVariant: 'lean',
      },
    },
    {
      id: 'coast_fire',
      title: 'Coast FIRE Achieved',
      description: 'Corpus grows passively to age 60 without requiring additional monthly savings.',
      values: {
        currentAge: 30,
        targetFireAge: 60,
        currentMonthlyExpenses: 75000,
        currentMonthlySavings: 0,
        currentCorpus: 3500000,
        inflationRate: 6.0,
        expectedReturnRate: 12.0,
        swrPct: 4.0,
        fireVariant: 'coast',
      },
    },
    {
      id: 'fat_fire',
      title: 'Fat FIRE Luxury',
      description: 'Comfortable luxury retirement (150% expenses) with high safety margin.',
      values: {
        currentAge: 35,
        targetFireAge: 52,
        currentMonthlyExpenses: 250000,
        currentMonthlySavings: 200000,
        currentCorpus: 5000000,
        inflationRate: 6.0,
        expectedReturnRate: 12.0,
        swrPct: 4.0,
        fireVariant: 'fat',
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Question Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-teal-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30 mb-3">
              ⚡ Institutional FIRE Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              When can I achieve Financial Independence & Retire Early?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
              Calculate your exact FIRE target corpus, projected retirement age, Coast FIRE milestone, and SWR sensitivity under inflation.
            </p>
          </div>
          <div className="bg-emerald-800/40 border border-emerald-500/40 p-4 rounded-xl text-center min-w-[180px]">
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
              Estimated FIRE Age
            </span>
            <span className="text-3xl font-black text-white mt-1 block">
              {results.projectedFireAge !== null ? `Age ${results.projectedFireAge}` : 'Unreachable'}
            </span>
            <span className="text-xs text-emerald-200 mt-1 block">
              {results.yearsToProjectedFireDecimal !== null
                ? `(${results.yearsToProjectedFireDecimal} years from today)`
                : '(Not reached within 50Y horizon)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Smart Presets */}
      <ScenarioPresetCards
        presets={presets}
        activePresetId={null}
        onSelectPreset={(p) => {
          Object.entries(p.values).forEach(([k, v]) => updateState(k, v));
        }}
      />

      {/* 3. Inputs Section */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          1. Personal Financial & Retirement Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInputNumber
            id="currentAge"
            label="Current Age (Years)"
            value={state.currentAge}
            onChange={(val) => updateState('currentAge', val)}
            min={18}
            max={75}
            step={1}
          />
          <FormInputNumber
            id="targetFireAge"
            label="Target Early Retirement Age"
            value={state.targetFireAge}
            onChange={(val) => updateState('targetFireAge', val)}
            min={state.currentAge}
            max={80}
            step={1}
          />
          <FormInputNumber
            id="currentMonthlyExpenses"
            label="Current Monthly Living Expenses (₹)"
            value={state.currentMonthlyExpenses}
            onChange={(val) => updateState('currentMonthlyExpenses', val)}
            min={5000}
            max={2000000}
            step={5000}
          />
          <FormInputNumber
            id="currentMonthlySavings"
            label="Current Monthly Savings / SIP (₹)"
            value={state.currentMonthlySavings}
            onChange={(val) => updateState('currentMonthlySavings', val)}
            min={0}
            max={2000000}
            step={5000}
          />
          <FormInputNumber
            id="currentCorpus"
            label="Existing Accumulated Corpus (₹)"
            value={state.currentCorpus}
            onChange={(val) => updateState('currentCorpus', val)}
            min={0}
            max={100000000}
            step={50000}
          />
          <FormInputNumber
            id="inflationRate"
            label="Expected Inflation Rate (% p.a.)"
            value={state.inflationRate}
            onChange={(val) => updateState('inflationRate', val)}
            min={2.0}
            max={15.0}
            step={0.5}
          />
          <FormInputNumber
            id="expectedReturnRate"
            label="Expected Investment Return (% p.a.)"
            value={state.expectedReturnRate}
            onChange={(val) => updateState('expectedReturnRate', val)}
            min={4.0}
            max={25.0}
            step={0.5}
          />
          <FormInputNumber
            id="swrPct"
            label="Safe Withdrawal Rate (SWR % p.a.)"
            value={state.swrPct}
            onChange={(val) => updateState('swrPct', val)}
            min={2.5}
            max={6.0}
            step={0.1}
          />
        </div>

        {/* Strategy Variant Selector */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
            Select FIRE Strategy Variant
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: 'standard', name: 'Standard FIRE (100%)' },
              { id: 'lean', name: 'Lean FIRE (75%)' },
              { id: 'fat', name: 'Fat FIRE (150%)' },
              { id: 'coast', name: 'Coast FIRE (Target Today)' },
              { id: 'barista', name: 'Barista FIRE (Side-Income)' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => updateState('fireVariant', v.id)}
                className={`p-3 rounded-xl border font-semibold text-xs sm:text-sm transition-all text-center ${
                  state.fireVariant === v.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>

          {state.fireVariant === 'barista' && (
            <div className="mt-4 max-w-md">
              <FormInputNumber
                id="baristaIncome"
                label="Assumed Monthly Side-Income (₹/mo)"
                value={state.baristaIncome}
                onChange={(val) => updateState('baristaIncome', val)}
                min={0}
                max={500000}
                step={5000}
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Primary Results Dashboard */}
      <ResultDashboard
        primaryLabel="Target FIRE Corpus"
        primaryValue={formatCurrency(results.activeTargetCorpus)}
        secondaryItems={[
          {
            label: 'Projected FIRE Age',
            value: results.projectedFireAge !== null ? `Age ${results.projectedFireAge}` : 'Unreachable',
          },
          {
            label: 'Monthly Expense at FIRE Age',
            value: `${formatCurrency(Math.round(results.futureAnnualExpenses / 12))}/mo`,
          },
          {
            label: 'Projected Corpus at Target Age',
            value: formatCurrency(results.projectedCorpusAtTargetAge),
          },
          {
            label: 'Corpus Shortfall / Gap',
            value: results.corpusGap > 0 ? formatCurrency(results.corpusGap) : '₹0 (On Track!)',
          },
        ]}
      />

      {/* 5. Health Gauge & Donut Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthGauge
          score={results.fireScore}
          label={results.scoreLabel}
          description={`Savings Rate: ${results.savingsRate}% | Target FIRE Age: ${state.targetFireAge}`}
        />
        <ResultDonutChart
          title="FIRE Target Corpus Structure"
          items={[
            {
              label: 'Existing Corpus Growth',
              value: Math.min(results.activeTargetCorpus, results.projectedCorpusAtTargetAge),
              color: '#10B981',
            },
            {
              label: 'Corpus Gap to Accumulate',
              value: results.corpusGap,
              color: '#EF4444',
            },
          ]}
        />
      </div>

      {/* 6. SWR Sensitivity Matrix */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <h4 className="text-md font-bold text-slate-900 dark:text-white mb-4">
          Safe Withdrawal Rate (SWR) Sensitivity Matrix
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-200">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">SWR %</th>
                <th className="px-4 py-3">Corpus Multiplier</th>
                <th className="px-4 py-3">Required FIRE Corpus</th>
                <th className="px-4 py-3">Corpus Shortfall / Gap</th>
              </tr>
            </thead>
            <tbody>
              {results.swrMatrix.map((item) => (
                <tr
                  key={item.swrRate}
                  className={`border-b dark:border-slate-700 ${
                    item.swrRate === state.swrPct ? 'bg-emerald-50 dark:bg-emerald-900/20 font-bold' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{item.swrRate}% p.a.</td>
                  <td className="px-4 py-3">{item.multiplier}</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">
                    {formatCurrency(item.targetCorpus)}
                  </td>
                  <td className="px-4 py-3">
                    {item.corpusGap > 0 ? formatCurrency(item.corpusGap) : 'On Track'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. 5-Hypothetical Scenario Simulator Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <h4 className="text-md font-bold text-slate-900 dark:text-white mb-4">
          5-Hypothetical FIRE Scenario Simulator
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {results.scenarios.map((sc, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                idx === 0
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.name}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Age {sc.projectedFireAge}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Target Corpus: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(sc.targetCorpus)}</strong>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly Savings: {formatCurrency(sc.monthlySavings)}/mo
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Disclaimers & Safety Notice */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          ⚠️ Planning Assumptions & Regulatory Disclosures:
        </p>
        <p>
          • Safe Withdrawal Rate (SWR) and return figures are illustrative planning assumptions, not guaranteed returns or financial advice.
        </p>
        <p>
          • This calculator does not evaluate emergency funds, healthcare shocks, sequence-of-returns risk, or individual tax brackets on withdrawals.
        </p>
      </div>

      {/* 9. Share Actions */}
      <ShareActions title="Flagship FIRE Calculator - Fintools Find" />
    </div>
  );
}
