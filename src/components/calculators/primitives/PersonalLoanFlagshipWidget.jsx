import { useMemo } from 'preact/hooks';
import { calculatePersonalLoan } from '@calculators/loans/personal-loan-calculator';
import { PERSONAL_LOAN_CONFIG } from '@calculators/configs/personalLoanConfig';
import FormInputNumber from './FormInputNumber';
import ResultDashboard from '../../ui/ResultDashboard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import ResultDonutChart from '../../ui/ResultDonutChart';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import AmortizationTable from './AmortizationTable';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function PersonalLoanFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    amount: 500000,
    rate: PERSONAL_LOAN_CONFIG.defaultInterestRate,
    tenure: 3,
    monthlyIncome: 100000,
    processingFeePct: 1,
    includeInsurance: false,
    creditCardBalance: 0,
    creditCardApr: 36.0,
    marginalTaxRate: 30,
    calculationMode: 'forward', // 'forward' | 'reverse_emi'
    targetEmi: 15000,
    inflationRate: 6,
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculatePersonalLoan(state);
  }, [state]);

  const presets = PERSONAL_LOAN_CONFIG.presets;

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              💳 Institutional Personal Borrowing Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model personal loan EMIs, effective APR (with 18% GST on fees), credit card debt consolidation savings, FOIR budget burdens, and reverse target EMI solvers.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              {state.calculationMode === 'reverse_emi' ? 'Max Borrowing Capacity' : 'Monthly Personal Loan EMI'}
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(
                state.calculationMode === 'reverse_emi' ? results.loanAmount : results.emi
              )}
              {state.calculationMode === 'reverse_emi' ? '' : '/mo'}
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              (Effective APR: {results.effectiveApr}%)
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
          1. Personal Financing & Income Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.calculationMode === 'forward' ? (
            <FormInputNumber
              id="amount"
              label="Personal Loan Amount Required (₹)"
              value={state.amount}
              onChange={(val) => updateState('amount', val)}
              min={50000}
              max={5000000}
              step={50000}
            />
          ) : (
            <FormInputNumber
              id="targetEmi"
              label="Target Monthly Personal Loan EMI (₹/mo)"
              value={state.targetEmi}
              onChange={(val) => updateState('targetEmi', val)}
              min={1000}
              max={200000}
              step={1000}
            />
          )}

          <FormInputNumber
            id="rate"
            label="Annual Quoted Interest Rate (% p.a.)"
            value={state.rate}
            onChange={(val) => updateState('rate', val)}
            min={1.0}
            max={35.0}
            step={0.25}
          />

          <FormInputNumber
            id="tenure"
            label="Loan Repayment Tenure (Years: 1 to 5)"
            value={state.tenure}
            onChange={(val) => updateState('tenure', val)}
            min={1}
            max={5}
            step={1}
          />

          <FormInputNumber
            id="monthlyIncome"
            label="Net Monthly Salary Income (₹/mo for Affordability)"
            value={state.monthlyIncome}
            onChange={(val) => updateState('monthlyIncome', val)}
            min={20000}
            max={2000000}
            step={10000}
          />

          <FormInputNumber
            id="processingFeePct"
            label="Upfront Processing Fee (% of Loan)"
            value={state.processingFeePct}
            onChange={(val) => updateState('processingFeePct', val)}
            min={0}
            max={5}
            step={0.25}
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

        {/* Insurance Toggle */}
        <div className="pt-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              Optional Loan Credit Protection Insurance (1.5%)
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Optional insurance premium added to upfront fees to cover loan repayment in case of disability/demise.
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateState('includeInsurance', !state.includeInsurance)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              state.includeInsurance
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {state.includeInsurance ? 'Insurance Included' : 'No Insurance'}
          </button>
        </div>

        {/* Credit Card Debt Consolidation Simulator Inputs */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            2. Credit Card Debt Consolidation Simulator (Optional)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInputNumber
              id="creditCardBalance"
              label="Existing High-Interest Credit Card Balance (₹)"
              value={state.creditCardBalance}
              onChange={(val) => updateState('creditCardBalance', val)}
              min={0}
              max={5000000}
              step={25000}
            />

            <FormInputNumber
              id="creditCardApr"
              label="Existing Credit Card Annual Interest Rate / APR (% p.a.)"
              value={state.creditCardApr}
              onChange={(val) => updateState('creditCardApr', val)}
              min={10}
              max={50}
              step={1}
            />
          </div>
        </div>
      </div>

      {/* 4. Primary Decision Dashboard */}
      <ResultDashboard
        primaryLabel={
          state.calculationMode === 'reverse_emi'
            ? 'Max Borrowing Capacity'
            : 'Monthly Personal Loan EMI'
        }
        primaryValue={
          state.calculationMode === 'reverse_emi'
            ? formatCurrency(results.loanAmount)
            : `${formatCurrency(results.emi)}/mo`
        }
        secondaryItems={[
          {
            label: 'Total Interest Outgo',
            value: formatCurrency(results.totalInterest),
          },
          {
            label: 'Processing Fee + 18% GST',
            value: `${formatCurrency(results.processingFee)} (incl ₹${results.feeGst} GST)`,
          },
          {
            label: 'Net Disbursed Cash Principal',
            value: formatCurrency(results.netDisbursedAmount),
          },
          {
            label: 'Effective APR (incl Fees + GST)',
            value: `${results.effectiveApr}% p.a.`,
          },
          {
            label: 'FOIR Monthly Salary Burden',
            value: `${results.foirPct}% of Salary`,
          },
        ]}
      />

      {/* 5. Health Gauge & Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthGauge
          score={results.score}
          label={results.healthStatus}
          description={results.healthDesc}
        />
        <ResultDonutChart
          title="Total Repayment Breakdown"
          items={[
            {
              label: 'Borrowed Loan Principal',
              value: results.loanAmount,
              color: '#3B82F6',
            },
            {
              label: 'Total Interest Outgo',
              value: results.totalInterest,
              color: '#EF4444',
            },
            {
              label: 'Upfront Fees & 18% GST',
              value: results.processingFee + results.insuranceFee,
              color: '#F59E0B',
            },
          ]}
        />
      </div>

      {/* 6. Credit Card Debt Consolidation Simulator Card */}
      {results.consolidationSim && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-emerald-900 dark:text-emerald-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                ⚡ Credit Card Debt Consolidation Savings Analysis
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                Consolidating {formatCurrency(results.consolidationSim.cardBalance)} of credit card debt ({results.consolidationSim.cardApr}% APR) into a {state.rate}% personal loan saves money on monthly payments and total interest!
              </p>
            </div>
            <div className="bg-emerald-900/30 p-4 rounded-xl border border-emerald-500/40 text-center min-w-[200px]">
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">Total Interest Saved</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                {formatCurrency(results.consolidationSim.interestSavings)}
              </span>
              <span className="text-xs text-emerald-200 mt-0.5 block">
                ({formatCurrency(results.consolidationSim.monthlySavings)}/mo Lower Payment)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Borrow Less Simulator Card */}
      {results.borrowLessScenarios && results.borrowLessScenarios.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl text-blue-900 dark:text-blue-200 space-y-4">
          <div>
            <h4 className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
              💡 Borrow Less Simulator (Reduce Loan Amount)
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              Explore how borrowing ₹50K to ₹2L less reduces your monthly EMI burden and saves cumulative bank interest outgo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {results.borrowLessScenarios.map((sc) => (
              <div
                key={sc.delta}
                className="p-4 rounded-xl border border-blue-500/30 bg-blue-900/20 text-white space-y-1"
              >
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
                  Borrow ₹{(sc.delta / 100000).toFixed(1)} Lakh Less
                </span>
                <div className="text-lg font-black text-emerald-400">
                  Save {formatCurrency(sc.interestSaved)} Interest
                </div>
                <p className="text-xs text-slate-300">
                  Monthly EMI: {formatCurrency(sc.newEmi)}/mo ({formatCurrency(sc.emiSaved)}/mo less)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. 4-Scenario Tenure & Borrowing Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Tenure & Borrowing Scenario Comparison Grid
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare monthly EMIs, total interest outgo, and FOIR salary burden across loan tenures and amounts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {results.scenarios.map((sc) => (
            <div
              key={sc.id}
              className={`p-4 rounded-xl border ${
                sc.tenure === state.tenure && sc.amount === results.loanAmount
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow font-bold'
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
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1">
                FOIR: {sc.foirPct}% of Income
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Inflation Real Value Card */}
      <div className="bg-gradient-to-r from-amber-900/20 via-slate-900 to-indigo-900/20 p-6 rounded-2xl border border-amber-500/30 text-white space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-extrabold text-amber-400">
              Inflation-Adjusted Real Outflow Analysis
            </h4>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              At an assumed annual inflation rate of {state.inflationRate}%, your future total personal loan repayment of {formatCurrency(results.totalRepayment)} over {state.tenure} years has the equivalent real value in today's money shown below.
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

      {/* 10. Rate Sensitivity Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Interest Rate Sensitivity Analysis ({state.rate - 1.0}% to {state.rate + 1.0}%)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Illustrative monthly EMI and total interest outgo under ±1.0% interest rate fluctuations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {results.sensitivityScenarios.map((sc) => (
            <div
              key={sc.rate}
              className={`p-3 rounded-xl border ${
                sc.rate === state.rate
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.label}
              </span>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {formatCurrency(sc.emi)}/mo
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Interest: {formatCurrency(sc.totalInterest)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 11. Year-by-Year Schedule Table */}
      {results.schedule && results.schedule.length > 0 && (
        <AmortizationTable
          schedule={results.schedule}
          title="Monthly Personal Loan Amortization Schedule"
        />
      )}

      {/* 12. Financial Safety & Disclaimers */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          ⚠️ Important Financial & Prudential Unsecured Borrowing Norms:
        </p>
        <p>
          • FOIR Borrowing Ceiling: Personal loans carry higher interest rates (10.5% to 24%). Financial planners recommend keeping total loan EMIs below 35% of net monthly income.
        </p>
        <p>
          • Upfront Processing Fees & GST: Banks charge 1% to 3% processing fees plus statutory 18% GST. These upfront charges increase your true Effective APR above the nominal interest rate.
        </p>
        <p>
          • Credit Card Consolidation: Consolidating 36%-42% credit card debt into a 11.5%-14% personal loan saves money only if card spending is stopped to prevent secondary debt build-up.
        </p>
      </div>

      {/* 13. Share Actions */}
      <ShareActions title="Flagship Personal Loan & Debt Consolidation Decision Engine — Fintools Find" />
    </div>
  );
}
