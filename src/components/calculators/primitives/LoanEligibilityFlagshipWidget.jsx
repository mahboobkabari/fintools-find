import { useMemo } from 'preact/hooks';
import { calculateLoanEligibility } from '@calculators/loans/loan-eligibility-calculator';
import { LOAN_ELIGIBILITY_CONFIGS } from '@calculators/configs/loanEligibilityConfig';
import FormInputNumber from './FormInputNumber';
import ResultDashboard from '../../ui/ResultDashboard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import ResultDonutChart from '../../ui/ResultDonutChart';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import AmortizationTable from './AmortizationTable';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function LoanEligibilityFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    grossMonthlyIncome: 100000,
    coApplicantIncome: 0,
    existingEmis: 10000,
    loanType: 'home_loan',
    rate: 8.5,
    tenure: 20,
    foirPct: 50,
    calculationMode: 'forward', // 'forward' | 'reverse_income' | 'reverse_emi'
    targetLoanAmount: 5000000,
    propertyValue: 6000000,
    creditProfile: 'prime',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateLoanEligibility(state);
  }, [state]);

  const selectedConfig =
    LOAN_ELIGIBILITY_CONFIGS.loanTypes[state.loanType] || LOAN_ELIGIBILITY_CONFIGS.loanTypes.home_loan;

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
              ⚡ Institutional Borrowing Power Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model borrowing limits across Home, Personal, and Car loans, co-applicant income pooling, RBI statutory LTV ceilings, and credit score profile adjustments.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Estimated Borrowing Capacity
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.maxLoanAmount)}
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              ({formatCurrency(results.maxEmiCapacity)} / mo available EMI)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Loan Category Tabs & Mode Switcher */}
      <div className="space-y-4">
        {/* Loan Type Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          {Object.values(LOAN_ELIGIBILITY_CONFIGS.loanTypes).map((lt) => (
            <button
              key={lt.id}
              type="button"
              onClick={() => {
                updateState('loanType', lt.id);
                updateState('rate', lt.defaultRatePct);
                updateState('tenure', lt.defaultTenureYears);
                updateState('foirPct', lt.defaultFoirPct);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                state.loanType === lt.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-700/50'
              }`}
            >
              {lt.name}
            </button>
          ))}
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-lg">
          <button
            type="button"
            onClick={() => updateState('calculationMode', 'forward')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              state.calculationMode === 'forward'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Borrowing Capacity
          </button>
          <button
            type="button"
            onClick={() => updateState('calculationMode', 'reverse_income')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              state.calculationMode === 'reverse_income'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Required Income Solver
          </button>
          <button
            type="button"
            onClick={() => updateState('calculationMode', 'reverse_emi')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              state.calculationMode === 'reverse_emi'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            EMI Reduction Solver
          </button>
        </div>

        {/* Smart Presets */}
        <ScenarioPresetCards
          presets={LOAN_ELIGIBILITY_CONFIGS.presets}
          activePresetId={null}
          onSelectPreset={(p) => {
            Object.entries(p.values).forEach(([k, v]) => updateState(k, v));
          }}
        />
      </div>

      {/* 3. Inputs Section */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          1. Income & Obligation Parameters ({selectedConfig.name})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInputNumber
            id="grossMonthlyIncome"
            label="Primary Gross Monthly Income (₹/mo)"
            value={state.grossMonthlyIncome}
            onChange={(val) => updateState('grossMonthlyIncome', val)}
            min={10000}
            max={5000000}
            step={5000}
          />

          <FormInputNumber
            id="coApplicantIncome"
            label="Co-Applicant Monthly Income (₹/mo)"
            value={state.coApplicantIncome}
            onChange={(val) => updateState('coApplicantIncome', val)}
            min={0}
            max={5000000}
            step={5000}
          />

          <FormInputNumber
            id="existingEmis"
            label="Existing Monthly EMI Commitments (₹/mo)"
            value={state.existingEmis}
            onChange={(val) => updateState('existingEmis', val)}
            min={0}
            max={1000000}
            step={2000}
          />

          {state.calculationMode !== 'forward' && (
            <FormInputNumber
              id="targetLoanAmount"
              label="Target Desired Loan Amount (₹)"
              value={state.targetLoanAmount}
              onChange={(val) => updateState('targetLoanAmount', val)}
              min={100000}
              max={100000000}
              step={100000}
            />
          )}

          <FormInputNumber
            id="rate"
            label="Base Advertised Interest Rate (% p.a.)"
            value={state.rate}
            onChange={(val) => updateState('rate', val)}
            min={1.0}
            max={25.0}
            step={0.25}
          />

          <FormInputNumber
            id="tenure"
            label={`Loan Repayment Tenure (Years) [Max ${selectedConfig.maxTenureYears}Y]`}
            value={state.tenure}
            onChange={(val) => updateState('tenure', val)}
            min={1}
            max={selectedConfig.maxTenureYears}
            step={1}
          />

          {selectedConfig.supportsLtv && (
            <FormInputNumber
              id="propertyValue"
              label={
                state.loanType === 'home_loan'
                  ? 'Estimated Property Market Value (₹)'
                  : 'Vehicle On-Road Price (₹)'
              }
              value={state.propertyValue}
              onChange={(val) => updateState('propertyValue', val)}
              min={0}
              max={200000000}
              step={100000}
            />
          )}
        </div>

        {/* FOIR & Credit Profile Assumptions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            2. Lender Underwriting & Credit Profile Assumptions
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Illustrative FOIR Obligation Scenario
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LOAN_ELIGIBILITY_CONFIGS.foirScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => updateState('foirPct', sc.foirPct)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      state.foirPct === sc.foirPct
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {sc.foirPct}% FOIR
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                *Illustrative lender assumption. Actual FOIR limits vary by bank policy.
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Credit Profile Tier (CIBIL Assumption)
              </label>
              <select
                value={state.creditProfile}
                onChange={(e) => updateState('creditProfile', e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
              >
                {Object.values(LOAN_ELIGIBILITY_CONFIGS.creditProfiles).map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name} ({cp.badge})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                *Illustrative rate adjustment ({results.rateAdjustment > 0 ? `+${results.rateAdjustment}%` : 'Base Rate'}). Actual pricing varies by bank.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Primary Dashboard */}
      <ResultDashboard
        primaryLabel="Illustrative Estimated Borrowing Capacity"
        primaryValue={formatCurrency(results.maxLoanAmount)}
        secondaryItems={[
          {
            label: 'Available Monthly EMI Capacity',
            value: `${formatCurrency(results.maxEmiCapacity)}/mo`,
          },
          {
            label: 'Max Total Obligation Allowed',
            value: `${formatCurrency(results.maxTotalEmiAllowed)}/mo`,
          },
          {
            label: 'Effective Assumed Rate',
            value: `${results.effectiveAnnualRate}% p.a.`,
          },
          {
            label: 'Estimated Total Loan Interest',
            value: formatCurrency(results.totalInterest),
          },
        ]}
      />

      {/* 5. Reverse Solver Card */}
      {state.calculationMode !== 'forward' && results.reverseResult && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-700/40 space-y-4">
          <h4 className="text-lg font-extrabold">
            Reverse Solver Target Analysis (₹{results.targetLoanAmount.toLocaleString('en-IN')} Target Loan)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-800/40 p-4 rounded-xl border border-blue-500/30">
              <span className="text-xs text-blue-200 block">Required Monthly EMI</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">
                {formatCurrency(results.reverseResult.requiredMonthlyEmi)}/mo
              </span>
            </div>
            <div className="bg-blue-800/40 p-4 rounded-xl border border-blue-500/30">
              <span className="text-xs text-blue-200 block">Required Total Gross Monthly Income</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">
                {formatCurrency(results.reverseResult.requiredTotalMonthlyIncome)}/mo
              </span>
              {results.reverseResult.requiredAdditionalIncome > 0 && (
                <span className="text-xs text-amber-300 mt-1 block">
                  (+{formatCurrency(results.reverseResult.requiredAdditionalIncome)} income gap)
                </span>
              )}
            </div>
            <div className="bg-blue-800/40 p-4 rounded-xl border border-blue-500/30">
              <span className="text-xs text-blue-200 block">Required Existing EMI Reduction</span>
              <span className="text-xl font-black text-amber-400 mt-1 block">
                {formatCurrency(results.reverseResult.requiredEmiReduction)}/mo
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Health Gauge & Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthGauge
          score={results.score}
          label={results.healthStatus}
          description={`FOIR Burden Ratio: ${results.foirBurdenPct}% | Existing Debt Burden: ${results.existingDebtRatioPct}%`}
        />
        <ResultDonutChart
          title="Monthly Income Allocation Breakdown"
          items={[
            {
              label: 'Available EMI Capacity',
              value: results.maxEmiCapacity,
              color: '#10B981',
            },
            {
              label: 'Existing Monthly EMIs',
              value: results.existingEmis,
              color: '#F59E0B',
            },
          ]}
        />
      </div>

      {/* 7. 4-Scenario FOIR Borrowing Power Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            4-Scenario FOIR Borrowing Power Simulator
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Illustrative borrowing capacity estimates across conservative, standard, and aggressive lender FOIR limits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {results.foirScenarios.map((sc) => (
            <div
              key={sc.id}
              className={`p-4 rounded-xl border ${
                sc.foirPct === state.foirPct && sc.id !== 'co_applicant_joined'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.name}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(sc.maxLoanAmount)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Available EMI: <strong className="text-blue-600 dark:text-blue-400">{formatCurrency(sc.availableEmiCapacity)}/mo</strong>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Allowed EMI: {formatCurrency(sc.maxAllowedEmi)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. 5-Tenure Comparison Matrix (10Y to 30Y) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Tenure Tradeoff Matrix (10 Years to {selectedConfig.maxTenureYears} Years)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare borrowing power vs total interest burden. Extending tenure increases borrowing capacity but significantly increases total interest paid.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-200">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Tenure</th>
                <th className="px-4 py-3">Max Borrowing Capacity</th>
                <th className="px-4 py-3">Available EMI</th>
                <th className="px-4 py-3">Total Repayment</th>
                <th className="px-4 py-3">Total Interest</th>
              </tr>
            </thead>
            <tbody>
              {results.tenureMatrix.map((tm) => (
                <tr
                  key={tm.tenureYears}
                  className={`border-b dark:border-slate-700 ${
                    tm.tenureYears === state.tenure ? 'bg-blue-50 dark:bg-blue-900/20 font-bold' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{tm.tenureYears} Years</td>
                  <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-bold">
                    {formatCurrency(tm.maxLoanAmount)}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(tm.monthlyEmi)}/mo</td>
                  <td className="px-4 py-3">{formatCurrency(tm.totalPayment)}</td>
                  <td className="px-4 py-3 text-rose-600 dark:text-rose-400">{formatCurrency(tm.totalInterest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. LTV Property Constraint Analysis Card (Home / Car Loans) */}
      {selectedConfig.supportsLtv && state.propertyValue > 0 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
          <div>
            <h4 className="text-md font-bold text-slate-900 dark:text-white">
              Statutory LTV Property Cap Analysis
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedConfig.ltvNote}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Property / Vehicle Market Value</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(results.propertyValue)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Statutory LTV Cap %</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {results.maxLtvPct}% LTV Ceiling
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Max Loan Based on LTV</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(results.maxLoanFromLtv)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Final Constrained Loan Amount</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(results.maxLoanAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 10. Year-by-Year Schedule Table */}
      {results.schedule && results.schedule.length > 0 && (
        <AmortizationTable
          schedule={results.schedule}
          title="Year-by-Year Repayment Schedule for Estimated Loan"
          principalHeader="Principal Repaid"
          interestHeader="Interest Paid"
          balanceHeader="Remaining Loan Balance"
        />
      )}

      {/* 11. Regulatory & Methodology Disclaimers */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          ⚠️ Underwriting & Regulatory Disclosures:
        </p>
        <p>
          • Illustrative Borrowing Estimates: Actual loan eligibility and approval depend on individual bank underwriting, documentation, credit history, income stability, and internal lender policies.
        </p>
        <p>
          • FOIR Assumption: Fixed Obligation to Income Ratio (FOIR) percentage is an illustrative lender assumption, not a statutory RBI mandate.
        </p>
        <p>
          • Statutory LTV Ceilings: Home Loan LTV ceilings (90% for ≤₹30L, 80% for ₹30L–₹75L, 75% for &gt;₹75L) reflect RBI Circular DBR.BP.BC.No.74/21.04.048/2014-15 statutory regulatory caps.
        </p>
        <p>
          • Co-Applicant Eligibility: Eligible co-applicant relationships and income treatment vary by bank.
        </p>
      </div>

      {/* 12. Share Actions */}
      <ShareActions title="Flagship Loan Eligibility Calculator & Borrowing Power Simulator — Fintools Find" />
    </div>
  );
}
