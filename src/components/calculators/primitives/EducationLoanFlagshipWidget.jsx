import { useMemo } from 'preact/hooks';
import { calculateEducationLoan } from '@calculators/loans/education-loan-calculator';
import { EDUCATION_LOAN_CONFIG } from '@calculators/configs/educationLoanConfig';
import FormInputNumber from './FormInputNumber';
import ResultDashboard from '../../ui/ResultDashboard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import ResultDonutChart from '../../ui/ResultDonutChart';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import AmortizationTable from './AmortizationTable';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function EducationLoanFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    amount: 1000000,
    rate: EDUCATION_LOAN_CONFIG.defaultInterestRate,
    tenure: 10,
    tenureType: 'years',
    moratoriumYears: 4,
    payInterestDuringMoratorium: false,
    marginalTaxRate: 30,
    calculationMode: 'forward', // 'forward' | 'reverse_emi'
    targetEmi: 20000,
    inflationRate: 6,
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateEducationLoan(state);
  }, [state]);

  const presets = EDUCATION_LOAN_CONFIG.presets;

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              🎓 Institutional Education Loan Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model study-period simple interest accrual, capitalized vs monthly-paid moratorium options, Section 80E uncapped 8-year tax deductions, and reverse target EMI solvers.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              {state.calculationMode === 'reverse_emi' ? 'Max Affordable Loan Amount' : 'Post-Graduation Monthly EMI'}
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(
                state.calculationMode === 'reverse_emi' ? results.loanAmount : results.emi
              )}
              {state.calculationMode === 'reverse_emi' ? '' : '/mo'}
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              (EMI starts after Month {results.moratoriumMonths})
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
            Loan Repayment Mode
          </button>
          <button
            type="button"
            onClick={() => updateState('calculationMode', 'reverse_emi')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              state.calculationMode === 'reverse_emi'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Target EMI Reverse Solver
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
          1. Education Loan Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.calculationMode === 'forward' ? (
            <FormInputNumber
              id="amount"
              label="Education Loan Principal (₹)"
              value={state.amount}
              onChange={(val) => updateState('amount', val)}
              min={100000}
              max={50000000}
              step={100000}
            />
          ) : (
            <FormInputNumber
              id="targetEmi"
              label="Target Post-Graduation Monthly EMI (₹/mo)"
              value={state.targetEmi}
              onChange={(val) => updateState('targetEmi', val)}
              min={2000}
              max={500000}
              step={1000}
            />
          )}

          <FormInputNumber
            id="rate"
            label="Annual Interest Rate (% p.a.)"
            value={state.rate}
            onChange={(val) => updateState('rate', val)}
            min={1.0}
            max={25.0}
            step={0.25}
          />

          <FormInputNumber
            id="moratoriumYears"
            label="Moratorium Period (Course Duration + Grace Period Years)"
            value={state.moratoriumYears}
            onChange={(val) => updateState('moratoriumYears', val)}
            min={0}
            max={8}
            step={0.5}
          />

          <FormInputNumber
            id="tenure"
            label="Post-Graduation Repayment Tenure (Years)"
            value={state.tenure}
            onChange={(val) => updateState('tenure', val)}
            min={1}
            max={15}
            step={1}
          />

          <FormInputNumber
            id="marginalTaxRate"
            label="Marginal Income Tax Rate (% for Sec 80E)"
            value={state.marginalTaxRate}
            onChange={(val) => updateState('marginalTaxRate', val)}
            min={0}
            max={40}
            step={5}
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

        {/* Moratorium Payment Option Switcher */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <label className="text-sm font-bold text-slate-900 dark:text-white block mb-2">
            Study-Period Moratorium Interest Option:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => updateState('payInterestDuringMoratorium', false)}
              className={`p-4 rounded-xl border text-left transition-all ${
                !state.payInterestDuringMoratorium
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Option A: Deferred Interest (Capitalized)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                No payments during course. Simple interest accrues and is added to your principal when EMI begins.
              </span>
            </button>

            <button
              type="button"
              onClick={() => updateState('payInterestDuringMoratorium', true)}
              className={`p-4 rounded-xl border text-left transition-all ${
                state.payInterestDuringMoratorium
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Option B: Pay Simple Interest Monthly ({formatCurrency(results.monthlyInterestDuringMoratorium)}/mo)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Pay simple interest monthly during study years. Prevents interest from compounding into principal, lowering post-graduation EMI!
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Primary Decision Dashboard */}
      <ResultDashboard
        primaryLabel={
          state.calculationMode === 'reverse_emi'
            ? 'Max Affordable Education Loan'
            : 'Post-Graduation Monthly EMI'
        }
        primaryValue={
          state.calculationMode === 'reverse_emi'
            ? formatCurrency(results.loanAmount)
            : `${formatCurrency(results.emi)}/mo`
        }
        secondaryItems={[
          {
            label: 'Accrued Moratorium Interest',
            value: formatCurrency(results.moratoriumInterest),
          },
          {
            label: 'Principal at Repayment Start',
            value: formatCurrency(results.totalPrincipalAtRepayment),
          },
          {
            label: 'Total Interest Outgo',
            value: formatCurrency(results.totalInterest),
          },
          {
            label: 'Section 80E Est. Tax Savings',
            value: formatCurrency(results.sec80E_taxSavings),
          },
          {
            label: 'Effective Net Outflow (After Tax)',
            value: formatCurrency(results.effectiveNetCost),
          },
        ]}
      />

      {/* 5. Health Gauge & Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthGauge
          score={results.score}
          label={results.healthStatus}
          description={`EMI Start: Month ${results.moratoriumMonths} | Repayment Tenure: ${state.tenure} Years`}
        />
        <ResultDonutChart
          title="Total Education Loan Cost Composition"
          items={[
            {
              label: 'Borrowed Principal',
              value: results.loanAmount,
              color: '#3B82F6',
            },
            {
              label: 'Moratorium Interest',
              value: results.moratoriumInterest,
              color: '#F59E0B',
            },
            {
              label: 'Post-Graduation Repayment Interest',
              value: results.repaymentInterest,
              color: '#EF4444',
            },
          ]}
        />
      </div>

      {/* 6. Section 80E Tax Relief Summary Card */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-emerald-900 dark:text-emerald-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
              Section 80E Income Tax Relief (100% Uncapped Deduction)
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              Under Section 80E of the Income Tax Act (Old Tax Regime), 100% of education loan interest paid is deductible from gross taxable income without any upper cap for up to 8 consecutive financial years.
            </p>
          </div>
          <div className="bg-emerald-900/30 p-4 rounded-xl border border-emerald-500/40 text-center min-w-[200px]">
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">Estimated Tax Savings</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.sec80E_taxSavings)}
            </span>
            <span className="text-xs text-emerald-200 mt-0.5 block">
              ({state.marginalTaxRate}% Tax Bracket)
            </span>
          </div>
        </div>
      </div>

      {/* 7. 4-Scenario Moratorium & Repayment Comparison Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Moratorium & Tenure Scenario Comparison Grid
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare monthly EMIs, total outgo, Section 80E tax relief, and effective net cost across repayment options.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {results.scenarios.map((sc) => (
            <div
              key={sc.id}
              className={`p-4 rounded-xl border ${
                sc.id === (state.payInterestDuringMoratorium ? 'paid_monthly_study' : 'deferred_capitalized')
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.label}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(sc.emi)}/mo
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Total Interest: <strong className="text-slate-900 dark:text-white">{formatCurrency(sc.totalInterest)}</strong>
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                Net Cost (After Tax): {formatCurrency(sc.effectiveNetCost)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Inflation Real Value Card */}
      <div className="bg-gradient-to-r from-amber-900/20 via-slate-900 to-indigo-900/20 p-6 rounded-2xl border border-amber-500/30 text-white space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-extrabold text-amber-400">
              Inflation-Adjusted Real Outflow Analysis
            </h4>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              At an assumed annual inflation rate of {state.inflationRate}%, your future total loan repayment outgo of {formatCurrency(results.totalPayment)} over {results.moratoriumYears + state.tenure} years has the equivalent real value in today's money shown below.
            </p>
          </div>
          <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-500/40 text-center min-w-[200px]">
            <span className="text-xs text-amber-200 uppercase tracking-wider font-bold block">Real Today's Value</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">
              {formatCurrency(results.realValue)}
            </span>
          </div>
        </div>
      </div>

      {/* 9. Rate Sensitivity Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Interest Rate Sensitivity Analysis (8.5% vs 9.5% vs 10.5%)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Illustrative repayment outcomes under ±1.0% annual interest rate fluctuations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {results.sensitivityScenarios.map((sc) => (
            <div
              key={sc.rate}
              className={`p-4 rounded-xl border ${
                sc.rate === state.rate
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.label}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(sc.emi)}/mo
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Total Interest: {formatCurrency(sc.totalInterest)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Year-by-Year Schedule Table */}
      {results.schedule && results.schedule.length > 0 && (
        <AmortizationTable
          schedule={results.schedule}
          title="Post-Graduation Monthly Loan Amortization Schedule"
        />
      )}

      {/* 11. Financial Safety & Disclaimers */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          ⚠️ Important Regulatory & Financial Disclaimers:
        </p>
        <p>
          • Section 80E Tax Relief: Deduction applies to 100% of interest paid for up to 8 consecutive years under the Old Tax Regime. Consult your tax advisor to verify personal eligibility.
        </p>
        <p>
          • RBI Margin Money Norms: Education loans up to ₹4 Lakhs require 0% margin; domestic studies above ₹4L require 5% margin; abroad studies above ₹4L require 15% margin.
        </p>
        <p>
          • Floating Interest Rates: Bank education loan rates are linked to EBLR / RLLR benchmarks and may fluctuate over the loan tenure.
        </p>
      </div>

      {/* 12. Share Actions */}
      <ShareActions title="Flagship Education Loan Decision Engine — Fintools Find" />
    </div>
  );
}
