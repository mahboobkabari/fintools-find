import { useMemo } from 'preact/hooks';
import { calculateStepUpSip } from '@calculators/investment/step-up-sip-calculator';
import FormInputNumber from './FormInputNumber';
import ResultDashboard from '../../ui/ResultDashboard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import ResultDonutChart from '../../ui/ResultDonutChart';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import AmortizationTable from './AmortizationTable';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function StepUpSipFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    initialMonthlyInvestment: 10000,
    annualStepUpPct: 10,
    expectedReturnRate: 12,
    tenureYears: 15,
    calculationMode: 'accumulation', // 'accumulation' | 'reverse_goal'
    targetCorpus: 10000000,
    inflationRate: 6,
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateStepUpSip(state);
  }, [state]);

  const presets = [
    {
      id: 'target_1cr_15y',
      title: '₹1 Crore Goal in 15 Years',
      description: 'Reverse solver calculating starting SIP required with a 10% annual step-up.',
      values: {
        calculationMode: 'reverse_goal',
        targetCorpus: 10000000,
        annualStepUpPct: 10,
        expectedReturnRate: 12,
        tenureYears: 15,
        inflationRate: 6,
      },
    },
    {
      id: 'fire_2cr_20y',
      title: '₹2 Crore FIRE Goal in 20 Years',
      description: 'Reverse solver for early retirement with a 10% step-up contribution.',
      values: {
        calculationMode: 'reverse_goal',
        targetCorpus: 20000000,
        annualStepUpPct: 10,
        expectedReturnRate: 12,
        tenureYears: 20,
        inflationRate: 6,
      },
    },
    {
      id: 'starter_10k_stepup',
      title: 'Career Starter 10% Step-Up',
      description: '₹10,000/mo starting SIP increasing by 10% annually with salary hikes.',
      values: {
        calculationMode: 'accumulation',
        initialMonthlyInvestment: 10000,
        annualStepUpPct: 10,
        expectedReturnRate: 12,
        tenureYears: 15,
        inflationRate: 6,
      },
    },
    {
      id: 'aggressive_15pct_stepup',
      title: 'High-Growth 15% Step-Up',
      description: '₹20,000/mo starting SIP with an aggressive 15% annual step-up.',
      values: {
        calculationMode: 'accumulation',
        initialMonthlyInvestment: 20000,
        annualStepUpPct: 15,
        expectedReturnRate: 12,
        tenureYears: 20,
        inflationRate: 6,
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              📈 Institutional Step-Up Goal Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model annual salary-indexed SIP top-ups, goal reverse solvers, fixed vs step-up comparison grids, and inflation-adjusted real purchasing power.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              {state.calculationMode === 'reverse_goal' ? 'Required Starting Monthly SIP' : 'Projected Maturity Value'}
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(
                state.calculationMode === 'reverse_goal'
                  ? results.initialMonthlyInvestment
                  : results.maturityValue
              )}
              {state.calculationMode === 'reverse_goal' ? '/mo' : ''}
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              ({results.wealthMultiplier}x Wealth Multiplier)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Mode Switcher & Smart Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-md">
          <button
            type="button"
            onClick={() => updateState('calculationMode', 'accumulation')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              state.calculationMode === 'accumulation'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Wealth Accumulation Mode
          </button>
          <button
            type="button"
            onClick={() => updateState('calculationMode', 'reverse_goal')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              state.calculationMode === 'reverse_goal'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Target Goal Solver
          </button>
        </div>

        <ScenarioPresetCards
          presets={presets}
          activePresetId={null}
          onSelectPreset={(p) => {
            Object.entries(p.values).forEach(([k, v]) => updateState(k, v));
          }}
        />
      </div>

      {/* 3. Input Controls Section */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          1. Step-Up Investment Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.calculationMode === 'accumulation' ? (
            <FormInputNumber
              id="initialMonthlyInvestment"
              label="Starting Monthly SIP Amount (₹/mo)"
              value={state.initialMonthlyInvestment}
              onChange={(val) => updateState('initialMonthlyInvestment', val)}
              min={500}
              max={1000000}
              step={500}
            />
          ) : (
            <FormInputNumber
              id="targetCorpus"
              label="Target Goal Wealth Amount (₹)"
              value={state.targetCorpus}
              onChange={(val) => updateState('targetCorpus', val)}
              min={100000}
              max={1000000000}
              step={500000}
            />
          )}

          <FormInputNumber
            id="annualStepUpPct"
            label="Annual Step-Up Rate (% p.a.)"
            value={state.annualStepUpPct}
            onChange={(val) => updateState('annualStepUpPct', val)}
            min={0}
            max={50}
            step={1}
          />

          <FormInputNumber
            id="expectedReturnRate"
            label="Expected Annual Return Rate (% p.a.)"
            value={state.expectedReturnRate}
            onChange={(val) => updateState('expectedReturnRate', val)}
            min={1.0}
            max={30.0}
            step={0.5}
          />

          <FormInputNumber
            id="tenureYears"
            label="Investment Duration (Years)"
            value={state.tenureYears}
            onChange={(val) => updateState('tenureYears', val)}
            min={1}
            max={40}
            step={1}
          />

          <FormInputNumber
            id="inflationRate"
            label="Expected Annual Inflation Rate (% p.a.)"
            value={state.inflationRate}
            onChange={(val) => updateState('inflationRate', val)}
            min={0}
            max={15}
            step={0.5}
          />
        </div>
      </div>

      {/* 4. Primary Decision Dashboard */}
      <ResultDashboard
        primaryLabel={
          state.calculationMode === 'reverse_goal'
            ? 'Required Starting Monthly SIP'
            : 'Projected Maturity Corpus'
        }
        primaryValue={
          state.calculationMode === 'reverse_goal'
            ? `${formatCurrency(results.initialMonthlyInvestment)}/mo`
            : formatCurrency(results.maturityValue)
        }
        secondaryItems={[
          {
            label: 'Total Capital Invested',
            value: formatCurrency(results.totalInvested),
          },
          {
            label: 'Estimated Wealth Gains',
            value: formatCurrency(results.estReturns),
          },
          {
            label: 'Final Monthly SIP (Year ' + state.tenureYears + ')',
            value: `${formatCurrency(results.finalMonthlyInvestment)}/mo`,
          },
          {
            label: 'Wealth Multiplier',
            value: `${results.wealthMultiplier}x`,
          },
        ]}
      />

      {/* 5. Health Gauge & Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthGauge
          score={results.score}
          label={results.healthStatus}
          description={`Wealth Multiplier: ${results.wealthMultiplier}x | Duration: ${state.tenureYears} Years`}
        />
        <ResultDonutChart
          title="Total Corpus Composition"
          items={[
            {
              label: 'Total Capital Invested',
              value: results.totalInvested,
              color: '#3B82F6',
            },
            {
              label: 'Estimated Compounded Gains',
              value: results.estReturns,
              color: '#10B981',
            },
          ]}
        />
      </div>

      {/* 6. Fixed vs 5% vs 10% vs 15% Step-Up Comparison Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Fixed SIP vs. Step-Up Comparison Grid (0%, 5%, 10%, 15%)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare starting monthly SIPs, final monthly SIPs, and total contributions across annual step-up levels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {results.stepUpScenarios.map((sc) => (
            <div
              key={sc.stepUpPct}
              className={`p-4 rounded-xl border ${
                sc.stepUpPct === state.annualStepUpPct
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.label}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(sc.startingMonthlySip)}/mo
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Final Monthly SIP: <strong className="text-blue-600 dark:text-blue-400">{formatCurrency(sc.finalMonthlySip)}/mo</strong>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Invested: {formatCurrency(sc.totalInvested)}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                Maturity: {formatCurrency(sc.maturityValue)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Real Inflation Purchasing Power Card */}
      <div className="bg-gradient-to-r from-amber-900/20 via-slate-900 to-indigo-900/20 p-6 rounded-2xl border border-amber-500/30 text-white space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-extrabold text-amber-400">
              Inflation-Adjusted Real Purchasing Power Analysis
            </h4>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              At an assumed annual inflation rate of {state.inflationRate}%, your future nominal maturity corpus of {formatCurrency(results.maturityValue)} will have the equivalent real purchasing power of today's money shown below.
            </p>
          </div>
          <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-500/40 text-center min-w-[200px]">
            <span className="text-xs text-amber-200 uppercase tracking-wider font-bold block">Real Purchasing Power</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">
              {formatCurrency(results.realValue)}
            </span>
          </div>
        </div>
      </div>

      {/* 8. Return Sensitivity Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Return Sensitivity Analysis (Conservative vs Expected vs Optimistic)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Illustrative wealth outcomes under ±2% annual return rate fluctuations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {results.sensitivityScenarios.map((sc) => (
            <div
              key={sc.label}
              className={`p-4 rounded-xl border ${
                sc.rate === state.expectedReturnRate
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.label} ({sc.rate}% p.a.)
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(sc.maturityValue)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Returns: {formatCurrency(sc.estReturns)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Year-by-Year Growth Table */}
      {results.yearlyBreakdown && results.yearlyBreakdown.length > 0 && (
        <AmortizationTable
          schedule={results.yearlyBreakdown.map((y) => ({
            year: y.year,
            principalRepaid: y.yearInvested,
            interestPaid: y.returns,
            remainingBalance: y.totalValue,
          }))}
          title="Year-by-Year Contribution & Compounded Growth Schedule"
          principalHeader="Yearly Contribution"
          interestHeader="Total Returns Earned"
          balanceHeader="Portfolio Wealth Corpus"
        />
      )}

      {/* 10. Financial Safety & Disclaimers */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          ⚠️ Important Investment Disclaimers & Assumptions:
        </p>
        <p>
          • Illustrative Projections: Mutual fund equity returns are market-linked and subject to market volatility. Assumed return rates (% p.a.) are not guaranteed.
        </p>
        <p>
          • Step-Up Commitment: Increasing your SIP annually requires corresponding growth in personal income. Ensure your future cash flow supports escalating monthly contributions.
        </p>
        <p>
          • Inflation Purchasing Power: Real purchasing power estimates reflect constant inflation discounting and do not account for future tax law changes.
        </p>
      </div>

      {/* 11. Share Actions */}
      <ShareActions title="Flagship Step-Up SIP Goal-Based Investment Engine — Fintools Find" />
    </div>
  );
}
