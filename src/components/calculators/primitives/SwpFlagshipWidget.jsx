import { useMemo } from 'preact/hooks';
import { calculateSwp } from '@calculators/investment/swp-calculator';
import FormInputNumber from './FormInputNumber';
import ResultDashboard from '../../ui/ResultDashboard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import ResultDonutChart from '../../ui/ResultDonutChart';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import AmortizationTable from './AmortizationTable';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function SwpFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    totalInvestment: 5000000,
    monthlyWithdrawal: 30000,
    expectedReturnRate: 8.0,
    tenureYears: 20,
    inflationRate: 6.0,
    isInflationAdjusted: false,
    calculationMode: 'forward', // 'forward' | 'reverse'
    targetDurationYears: 25,
    assetType: 'equity', // 'equity' | 'debt_mf'
    marginalTaxRatePct: 30,
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateSwp(state);
  }, [state]);

  const presets = [
    {
      id: 'early_retirement',
      title: 'Early Retirement SWP',
      description: '₹1.5 Cr corpus with ₹60,000/mo payout and 6% inflation step-up.',
      values: {
        totalInvestment: 15000000,
        monthlyWithdrawal: 60000,
        expectedReturnRate: 8.5,
        tenureYears: 30,
        inflationRate: 6.0,
        isInflationAdjusted: true,
        calculationMode: 'forward',
      },
    },
    {
      id: 'fire_4pct',
      title: 'FIRE 4% Safe Withdrawal',
      description: '₹2.0 Cr corpus at 4% SWR (₹66,600/mo) with 10% expected return.',
      values: {
        totalInvestment: 20000000,
        monthlyWithdrawal: 66666,
        expectedReturnRate: 10.0,
        tenureYears: 30,
        inflationRate: 6.0,
        isInflationAdjusted: true,
        calculationMode: 'forward',
      },
    },
    {
      id: 'conservative_retirement',
      title: 'Conservative Fixed Pension',
      description: '₹1.0 Cr corpus with ₹40,000/mo fixed payout (4.8% rate) at 8% return.',
      values: {
        totalInvestment: 10000000,
        monthlyWithdrawal: 40000,
        expectedReturnRate: 8.0,
        tenureYears: 20,
        inflationRate: 5.0,
        isInflationAdjusted: false,
        calculationMode: 'forward',
      },
    },
    {
      id: 'reverse_target_25y',
      title: 'Reverse SWP (25-Yr Target)',
      description: 'Calculate maximum sustainable monthly payout for a 25-year target.',
      values: {
        totalInvestment: 10000000,
        expectedReturnRate: 8.0,
        inflationRate: 6.0,
        isInflationAdjusted: true,
        calculationMode: 'reverse',
        targetDurationYears: 25,
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
              ⚡ Institutional SWP Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model portfolio longevity, annual inflation step-up, sequence-of-returns stress scenarios, and Budget 2024 mutual fund redemption taxation.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Initial Withdrawal Rate
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {results.initialWithdrawalRatePct}% p.a.
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              ({formatCurrency(results.initialAnnualWithdrawal)} / year)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Calculation Mode Toggle & Smart Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-md">
          <button
            type="button"
            onClick={() => updateState('calculationMode', 'forward')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              state.calculationMode === 'forward'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Forward SWP (Longevity)
          </button>
          <button
            type="button"
            onClick={() => updateState('calculationMode', 'reverse')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              state.calculationMode === 'reverse'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Reverse SWP (Target Duration)
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

      {/* 3. Inputs Form Controls */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          1. Portfolio Capital & Withdrawal Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInputNumber
            id="totalInvestment"
            label="Initial Investment Capital Corpus (₹)"
            value={state.totalInvestment}
            onChange={(val) => updateState('totalInvestment', val)}
            min={100000}
            max={100000000}
            step={100000}
          />

          {state.calculationMode === 'forward' ? (
            <FormInputNumber
              id="monthlyWithdrawal"
              label="Desired Monthly Cash Withdrawal (₹/mo)"
              value={state.monthlyWithdrawal}
              onChange={(val) => updateState('monthlyWithdrawal', val)}
              min={1000}
              max={1000000}
              step={1000}
            />
          ) : (
            <FormInputNumber
              id="targetDurationYears"
              label="Target Portfolio Duration (Years)"
              value={state.targetDurationYears}
              onChange={(val) => updateState('targetDurationYears', val)}
              min={5}
              max={50}
              step={1}
            />
          )}

          <FormInputNumber
            id="expectedReturnRate"
            label="Expected Annual Return Rate (% p.a.)"
            value={state.expectedReturnRate}
            onChange={(val) => updateState('expectedReturnRate', val)}
            min={1.0}
            max={25.0}
            step={0.5}
          />

          <FormInputNumber
            id="tenureYears"
            label="Simulation Horizon (Years)"
            value={state.tenureYears}
            onChange={(val) => updateState('tenureYears', val)}
            min={1}
            max={40}
            step={1}
          />
        </div>

        {/* Inflation Adjustment Controls */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-md font-bold text-slate-900 dark:text-white">
                2. Inflation-Adjusted Withdrawal Protection
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Increases your monthly withdrawal payout annually to preserve real purchasing power.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Annual Inflation Step-Up:
              </label>
              <button
                type="button"
                onClick={() => updateState('isInflationAdjusted', !state.isInflationAdjusted)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  state.isInflationAdjusted ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    state.isInflationAdjusted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {state.isInflationAdjusted && (
            <div className="max-w-md">
              <FormInputNumber
                id="inflationRate"
                label="Assumed Inflation Rate (% p.a.)"
                value={state.inflationRate}
                onChange={(val) => updateState('inflationRate', val)}
                min={1.0}
                max={15.0}
                step={0.5}
              />
            </div>
          )}
        </div>

        {/* Mutual Fund Taxation Assumptions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            3. Tax Estimation Settings (Finance Act 2024 Rules)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Mutual Fund Asset Class
              </label>
              <select
                value={state.assetType}
                onChange={(e) => updateState('assetType', e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
              >
                <option value="equity">Listed Equity Mutual Funds (&gt;65% Equity - 12.5% LTCG)</option>
                <option value="debt_mf">Specified Debt Mutual Funds (Sec 50AA - Slab Rate)</option>
              </select>
            </div>

            {state.assetType === 'debt_mf' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Marginal Income Tax Bracket %
                </label>
                <select
                  value={state.marginalTaxRatePct}
                  onChange={(e) => updateState('marginalTaxRatePct', Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value={10}>10% Slab</option>
                  <option value={15}>15% Slab</option>
                  <option value={20}>20% Slab</option>
                  <option value={30}>30% Slab</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Primary Results Dashboard */}
      <ResultDashboard
        primaryLabel="Projected Portfolio Longevity"
        primaryValue={
          results.isDepleted
            ? `${results.longevityYears} Years (${results.longevityMonths} Mos)`
            : `Sustains >${results.tenureYears} Years`
        }
        secondaryItems={[
          {
            label: 'Monthly Withdrawal Payout',
            value: `${formatCurrency(results.monthlyWithdrawal)}/mo`,
          },
          {
            label: 'Total Cumulative Payout Withdrawn',
            value: formatCurrency(results.totalWithdrawn),
          },
          {
            label: 'Projected Ending Corpus Balance',
            value: formatCurrency(results.finalBalance),
          },
          {
            label: 'Total Cumulative Investment Growth',
            value: formatCurrency(results.totalGrowth),
          },
        ]}
      />

      {/* 5. Health Gauge & Donut Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthGauge
          score={results.score}
          label={results.healthStatus}
          description={`Initial Withdrawal Rate: ${results.initialWithdrawalRatePct}% p.a. | Expected Return: ${results.expectedReturnRate}% p.a.`}
        />
        <ResultDonutChart
          title="Portfolio Value Allocation"
          items={[
            {
              label: 'Total Payout Withdrawn',
              value: results.totalWithdrawn,
              color: '#3B82F6',
            },
            {
              label: 'Remaining Corpus Balance',
              value: results.finalBalance,
              color: '#10B981',
            },
          ]}
        />
      </div>

      {/* 6. Multi-Scenario Sustainability Grid (Base, Conservative, Optimistic, Sequence-Risk) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            4-Scenario Portfolio Longevity Simulator
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Illustrative deterministic projections comparing return variations and sequence-of-returns early market downturn stress.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {results.scenarios.map((sc) => (
            <div
              key={sc.id}
              className={`p-4 rounded-xl border ${
                sc.id === 'base'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.name}
              </span>
              <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded mb-2">
                {sc.badge}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {sc.isDepleted ? `${sc.longevityYears} Years` : `>${results.tenureYears} Yrs`}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Ending Corpus: <strong className="text-slate-900 dark:text-white">{formatCurrency(sc.endingCorpus)}</strong>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Withdrawn: {formatCurrency(sc.totalWithdrawn)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Withdrawal Rate Benchmark Analysis Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Withdrawal Rate Sustainability Benchmarks (3%, 4%, 5%, 6%)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Illustrative withdrawal rate scenarios based on starting corpus of {formatCurrency(results.totalInvestment)}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-200">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Withdrawal Rate</th>
                <th className="px-4 py-3">Monthly Payout</th>
                <th className="px-4 py-3">Annual Payout</th>
                <th className="px-4 py-3">Projected Longevity</th>
                <th className="px-4 py-3">Ending Balance</th>
              </tr>
            </thead>
            <tbody>
              {results.withdrawalRateBenchmarks.map((bench) => (
                <tr
                  key={bench.ratePct}
                  className={`border-b dark:border-slate-700 ${
                    Math.abs(bench.ratePct - results.initialWithdrawalRatePct) < 0.5
                      ? 'bg-blue-50 dark:bg-blue-900/20 font-bold'
                      : ''
                  }`}
                >
                  <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                    {bench.ratePct}% p.a.
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(bench.monthlyWithdrawal)}/mo</td>
                  <td className="px-4 py-3">{formatCurrency(bench.annualWithdrawal)}/yr</td>
                  <td className="px-4 py-3">
                    {bench.depletionStatus === 'depleted'
                      ? `${bench.longevityYears} Years`
                      : `Sustains >30 Years`}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(bench.endingCorpus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Inflation Progression Milestones Schedule */}
      {state.isInflationAdjusted && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Inflation Payout Step-Up Progression ({state.inflationRate}% Inflation)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {results.inflationMilestones.map((ms) => (
              <div
                key={ms.year}
                className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-center"
              >
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                  Year {ms.year}
                </span>
                <span className="text-base font-black text-blue-600 dark:text-blue-400 mt-1 block">
                  {formatCurrency(ms.monthlyPayout)}/mo
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                  ({ms.purchasingPowerFactor}x initial)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. Tax-Aware Payout Breakdown Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Illustrative Tax-Aware SWP Payout Breakdown (Year 1 Estimate)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Based on Finance Act 2024 capital gains rules ({results.taxEstimation.taxSection} @ {results.taxEstimation.taxRateDesc}).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Gross Annual Payout</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(results.taxEstimation.grossAnnualWithdrawal)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Est. Capital Gains Portion</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(results.taxEstimation.estAnnualGainComponent)} ({results.taxEstimation.gainProportionPct}%)
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Est. Annual Tax</span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(results.taxEstimation.estAnnualTax)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Net After-Tax Monthly Payout</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(results.taxEstimation.netMonthlyPayout)}/mo
            </span>
          </div>
        </div>
      </div>

      {/* 10. Year-by-Year Schedule Table */}
      {results.yearlyBreakdown && results.yearlyBreakdown.length > 0 && (
        <AmortizationTable
          schedule={results.yearlyBreakdown.map((row) => ({
            year: row.year,
            principalPaid: row.monthlyWithdrawal ? row.monthlyWithdrawal * 12 : 0,
            interestPaid: row.totalGrowth,
            remainingBalance: row.totalValue,
          }))}
          title="Year-by-Year SWP Portfolio Growth & Payout Schedule"
          principalHeader="Annual Payout Withdrawn"
          interestHeader="Cumulative Investment Growth"
          balanceHeader="Ending Corpus Balance"
        />
      )}

      {/* 11. Regulatory & Methodology Disclaimers */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          ⚠️ Financial Planning & Regulatory Disclosures:
        </p>
        <p>
          • Illustrative Mathematical Projections: All return, inflation, and longevity estimates are purely illustrative deterministic projections and do not constitute financial advice or market forecasts.
        </p>
        <p>
          • Income Tax Act, 1961 (Finance Act 2024): Tax estimates assume unit redemptions under LTCG Section 112A (12.5% rate above ₹1.25 Lakh annual exemption) for equity MFs, or Section 50AA for specified debt MFs. Actual tax depends on individual purchase lots and capital gain statements.
        </p>
      </div>

      {/* 12. Share Actions */}
      <ShareActions title="Flagship SWP Calculator & Portfolio Longevity Simulator — Fintools Find" />
    </div>
  );
}
