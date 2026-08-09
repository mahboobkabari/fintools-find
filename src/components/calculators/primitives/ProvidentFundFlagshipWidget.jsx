import { useMemo } from 'preact/hooks';
import { calculateProvidentFundCalculator } from '@calculators/retirement/provident-fund-calculator';
import { PROVIDENT_FUND_CONFIG } from '@calculators/configs/providentFundConfig';
import FormInputNumber from './FormInputNumber';
import ResultDashboard from '../../ui/ResultDashboard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import ResultDonutChart from '../../ui/ResultDonutChart';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import AmortizationTable from './AmortizationTable';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function ProvidentFundFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    monthlyBasicSalary: 50000,
    monthlyDa: 0,
    currentAge: 25,
    retirementAge: 58,
    epfInterestRate: PROVIDENT_FUND_CONFIG.epfoInterestRate,
    annualSalaryIncrease: 5,
    currentEpfBalance: 0,
    vpfContributionType: 'percentage',
    vpfValue: 0,
    calculationMode: 'forward', // 'forward' | 'reverse_vpf'
    targetVpfCorpus: 10000000,
    inflationRate: 6,
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateProvidentFundCalculator(state);
  }, [state]);

  const presets = PROVIDENT_FUND_CONFIG.presets;

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              🏛️ Institutional EPF & VPF Retirement Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model EPF 12% employee contributions, 3.67%/8.33% employer EPS splits, VPF top-up boosters, Section 10(11) ₹2.5L tax thresholds, and inflation-adjusted real purchasing power.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              {state.calculationMode === 'reverse_vpf' ? 'Required Monthly VPF' : 'Projected Combined Retirement Corpus'}
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(
                state.calculationMode === 'reverse_vpf' ? results.vpfValue : results.finalEpfBalance
              )}
              {state.calculationMode === 'reverse_vpf' ? '/mo' : ''}
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
            onClick={() => updateState('calculationMode', 'forward')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              state.calculationMode === 'forward'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Retirement Accumulation Mode
          </button>
          <button
            type="button"
            onClick={() => updateState('calculationMode', 'reverse_vpf')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              state.calculationMode === 'reverse_vpf'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Target VPF Goal Solver
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
          1. Salary & EPF Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInputNumber
            id="monthlyBasicSalary"
            label="Monthly Basic Salary (₹/mo)"
            value={state.monthlyBasicSalary}
            onChange={(val) => updateState('monthlyBasicSalary', val)}
            min={5000}
            max={2000000}
            step={5000}
          />

          <FormInputNumber
            id="monthlyDa"
            label="Dearness Allowance DA (₹/mo)"
            value={state.monthlyDa}
            onChange={(val) => updateState('monthlyDa', val)}
            min={0}
            max={500000}
            step={1000}
          />

          <FormInputNumber
            id="currentAge"
            label="Current Age (Years)"
            value={state.currentAge}
            onChange={(val) => updateState('currentAge', val)}
            min={18}
            max={65}
            step={1}
          />

          <FormInputNumber
            id="retirementAge"
            label="Retirement Exit Age (Years)"
            value={state.retirementAge}
            onChange={(val) => updateState('retirementAge', val)}
            min={state.currentAge + 1}
            max={75}
            step={1}
          />

          <FormInputNumber
            id="epfInterestRate"
            label="Assumed Annual EPFO Interest Rate (% p.a.)"
            value={state.epfInterestRate}
            onChange={(val) => updateState('epfInterestRate', val)}
            min={1.0}
            max={15.0}
            step={0.25}
          />

          <FormInputNumber
            id="annualSalaryIncrease"
            label="Expected Annual Salary Growth (% p.a.)"
            value={state.annualSalaryIncrease}
            onChange={(val) => updateState('annualSalaryIncrease', val)}
            min={0}
            max={30}
            step={1}
          />

          <FormInputNumber
            id="currentEpfBalance"
            label="Existing Accumulated EPF Balance (₹)"
            value={state.currentEpfBalance}
            onChange={(val) => updateState('currentEpfBalance', val)}
            min={0}
            max={50000000}
            step={50000}
          />

          {state.calculationMode === 'forward' ? (
            <FormInputNumber
              id="vpfValue"
              label={
                state.vpfContributionType === 'percentage'
                  ? 'Voluntary VPF Top-Up Rate (% of Basic)'
                  : 'Voluntary VPF Top-Up Amount (₹/mo)'
              }
              value={state.vpfValue}
              onChange={(val) => updateState('vpfValue', val)}
              min={0}
              max={state.vpfContributionType === 'percentage' ? 100 : 500000}
              step={state.vpfContributionType === 'percentage' ? 1 : 1000}
            />
          ) : (
            <FormInputNumber
              id="targetVpfCorpus"
              label="Target Additional VPF Corpus (₹)"
              value={state.targetVpfCorpus}
              onChange={(val) => updateState('targetVpfCorpus', val)}
              min={100000}
              max={100000000}
              step={500000}
            />
          )}

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
          state.calculationMode === 'reverse_vpf'
            ? 'Required Monthly VPF Contribution'
            : 'Projected Combined Retirement Corpus'
        }
        primaryValue={
          state.calculationMode === 'reverse_vpf'
            ? `${formatCurrency(results.vpfValue)}/mo`
            : formatCurrency(results.finalEpfBalance)
        }
        secondaryItems={[
          {
            label: 'Employee EPF Corpus',
            value: formatCurrency(results.epfCorpus),
          },
          {
            label: 'VPF Top-Up Corpus',
            value: formatCurrency(results.vpfCorpus),
          },
          {
            label: 'Employer EPF Corpus',
            value: formatCurrency(results.employerCorpus),
          },
          {
            label: 'Total Compounded Interest Earned',
            value: formatCurrency(results.totalInterestEarned),
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
          description={`Retirement Exit Age: ${state.retirementAge} | Duration: ${results.yearsInvested} Years`}
        />
        <ResultDonutChart
          title="EPF & VPF Corpus Composition"
          items={[
            {
              label: 'Employee EPF',
              value: results.epfCorpus,
              color: '#3B82F6',
            },
            {
              label: 'VPF Voluntary Top-Up',
              value: results.vpfCorpus,
              color: '#8B5CF6',
            },
            {
              label: 'Employer EPF',
              value: results.employerCorpus,
              color: '#06B6D4',
            },
            {
              label: 'Compounded Interest',
              value: results.totalInterestEarned,
              color: '#10B981',
            },
          ]}
        />
      </div>

      {/* 6. Section 10(11) Tax Threshold Alert Banner */}
      {results.isSec10_11_Taxable ? (
        <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
            <span>⚠️ Section 10(11) Income Tax Threshold Alert</span>
          </div>
          <p className="text-xs sm:text-sm">
            Your max annual employee contribution (EPF + VPF) reaches{' '}
            <strong>{formatCurrency(results.maxAnnualEmployeeContrib)}/yr</strong>, exceeding the statutory{' '}
            <strong>₹2,50,000/yr</strong> non-taxable threshold u/s 10(11). Interest attributable to employee contributions above ₹2.5 Lakhs ({formatCurrency(results.taxableEmployeeContribYearly)}/yr) is subject to income tax at your marginal slab rate.
          </p>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl text-emerald-900 dark:text-emerald-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
            <span>✅ Section 10(11) Tax-Free Threshold Compliant</span>
          </div>
          <p className="text-xs sm:text-sm">
            Your annual employee contribution ({formatCurrency(results.maxAnnualEmployeeContrib)}/yr) is within the statutory{' '}
            <strong>₹2,50,000/yr</strong> tax-free threshold. Interest accrued on your employee contributions remains tax-free.
          </p>
        </div>
      )}

      {/* 7. 4-Scenario VPF Comparison Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            VPF Contribution Comparison Grid (EPF Only vs +₹2k vs +₹5k vs +₹10k VPF)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare final retirement balances and additional wealth created by stepping up monthly VPF contributions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {results.vpfScenarios.map((sc) => (
            <div
              key={sc.vpfAmount}
              className={`p-4 rounded-xl border ${
                sc.vpfAmount === results.vpfValue
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.label}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(sc.finalCorpus)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Total Invested: <strong className="text-slate-900 dark:text-white">{formatCurrency(sc.totalContribution)}</strong>
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                + Extra Corpus: {formatCurrency(sc.additionalCorpus)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Inflation Real Purchasing Power Card */}
      <div className="bg-gradient-to-r from-amber-900/20 via-slate-900 to-indigo-900/20 p-6 rounded-2xl border border-amber-500/30 text-white space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-extrabold text-amber-400">
              Inflation-Adjusted Real Purchasing Power Analysis
            </h4>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              At an assumed annual inflation rate of {state.inflationRate}%, your future nominal retirement corpus of {formatCurrency(results.finalEpfBalance)} will have the equivalent real purchasing power of today's money shown below.
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

      {/* 9. Return Sensitivity Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            EPFO Rate Sensitivity Analysis (7.25% vs 8.25% vs 9.25%)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Illustrative retirement outcomes under ±1.0% EPFO interest rate variations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {results.sensitivityScenarios.map((sc) => (
            <div
              key={sc.ratePct}
              className={`p-4 rounded-xl border ${
                sc.ratePct === state.epfInterestRate
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.label}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(sc.finalCorpus)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Interest: {formatCurrency(sc.totalInterestEarned)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Year-by-Year Schedule Table */}
      {results.yearlyBreakdown && results.yearlyBreakdown.length > 0 && (
        <AmortizationTable
          schedule={results.yearlyBreakdown.map((y) => ({
            year: y.year,
            principalRepaid: y.employeeEpf + y.vpfContrib + y.employerEpf,
            interestPaid: y.yearlyInterest,
            remainingBalance: y.closingBalance,
          }))}
          title="Year-by-Year EPF & VPF Accumulation Schedule"
          principalHeader="Total Yearly Contribution"
          interestHeader="Yearly Interest Credited"
          balanceHeader="Accumulated Closing Corpus"
        />
      )}

      {/* 11. Financial Safety & Disclaimers */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          ⚠️ Important Regulatory & Financial Disclaimers:
        </p>
        <p>
          • Assumed Interest Rates: The EPFO interest rate ({state.epfInterestRate}% p.a.) is declared annually by the Central Board of Trustees and is not guaranteed for future years.
        </p>
        <p>
          • Employer EPS Allocation: Employer 12% contribution is split into 3.67% EPF and 8.33% Employees' Pension Scheme (EPS) capped at ₹15,000 basic salary (max ₹1,250/mo).
        </p>
        <p>
          • Section 10(11) Tax Threshold: Interest attributable to employee contributions exceeding ₹2,50,000 per financial year is subject to income tax at the employee's marginal slab rate.
        </p>
      </div>

      {/* 12. Share Actions */}
      <ShareActions title="Flagship EPF & VPF Retirement Decision Engine — Fintools Find" />
    </div>
  );
}
