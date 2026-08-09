import { useMemo } from 'preact/hooks';
import { calculateCarLoan } from '@calculators/loans/car-loan-calculator';
import { CAR_LOAN_CONFIG } from '@calculators/configs/carLoanConfig';
import FormInputNumber from './FormInputNumber';
import ResultDashboard from '../../ui/ResultDashboard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import ResultDonutChart from '../../ui/ResultDonutChart';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import AmortizationTable from './AmortizationTable';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function CarLoanFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    vehiclePrice: 1200000,
    downPaymentPct: 20,
    rate: CAR_LOAN_CONFIG.defaultInterestRate,
    tenure: 5,
    monthlyIncome: 100000,
    fuelType: 'petrol', // 'petrol' | 'diesel' | 'hybrid' | 'ev'
    annualKm: 12000,
    processingFeePct: 1,
    marginalTaxRate: 30,
    isSec80EEBEligible: false,
    calculationMode: 'forward', // 'forward' | 'reverse_emi'
    targetEmi: 20000,
    inflationRate: 6,
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateCarLoan(state);
  }, [state]);

  const presets = CAR_LOAN_CONFIG.presets;

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              🚗 Institutional Car Buying & Loan Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model vehicle down payments, monthly EMIs, 5-year total ownership costs, EV electricity vs petrol fuel savings, Section 80EEB EV tax benefits, and reverse target EMI solvers.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              {state.calculationMode === 'reverse_emi' ? 'Max Affordable Car Price' : 'Monthly Car Loan EMI'}
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(
                state.calculationMode === 'reverse_emi' ? results.vehiclePrice : results.emi
              )}
              {state.calculationMode === 'reverse_emi' ? '' : '/mo'}
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              (FOIR: {results.foirPct}% of Monthly Salary)
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
            Car Repayment Mode
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
          1. Vehicle & Loan Financing Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.calculationMode === 'forward' ? (
            <FormInputNumber
              id="vehiclePrice"
              label="On-Road Vehicle Price (₹)"
              value={state.vehiclePrice}
              onChange={(val) => updateState('vehiclePrice', val)}
              min={100000}
              max={50000000}
              step={50000}
            />
          ) : (
            <FormInputNumber
              id="targetEmi"
              label="Target Monthly Car Loan EMI (₹/mo)"
              value={state.targetEmi}
              onChange={(val) => updateState('targetEmi', val)}
              min={2000}
              max={500000}
              step={1000}
            />
          )}

          <FormInputNumber
            id="downPaymentPct"
            label="Down Payment Percentage (% of Vehicle Price)"
            value={state.downPaymentPct}
            onChange={(val) => updateState('downPaymentPct', val)}
            min={0}
            max={80}
            step={5}
          />

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
            id="tenure"
            label="Loan Repayment Tenure (Years: 1 to 7)"
            value={state.tenure}
            onChange={(val) => updateState('tenure', val)}
            min={1}
            max={7}
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
            id="annualKm"
            label="Estimated Annual Driving Distance (km/year)"
            value={state.annualKm}
            onChange={(val) => updateState('annualKm', val)}
            min={1000}
            max={100000}
            step={1000}
          />

          <FormInputNumber
            id="processingFeePct"
            label="Processing Fee Percentage (% of Loan)"
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

        {/* Fuel & Energy Type Switcher */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white block">
            Vehicle Powertrain / Fuel Type:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { id: 'petrol', label: 'Petrol (₹7.5/km)', desc: 'Standard internal combustion engine' },
              { id: 'diesel', label: 'Diesel (₹6.0/km)', desc: 'High mileage long-distance driving' },
              { id: 'hybrid', label: 'Hybrid (₹4.5/km)', desc: 'Petrol + Electric battery hybrid' },
              { id: 'ev', label: 'Electric (EV) (₹1.5/km)', desc: 'Zero tailpipe emission & low running cost' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => updateState('fuelType', f.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  state.fuelType === f.id
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                }`}
              >
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  {f.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                  {f.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 80EEB EV Tax Benefit Toggle */}
        {state.fuelType === 'ev' && (
          <div className="pt-3 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30">
            <div>
              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200 block">
                Section 80EEB Electric Vehicle Loan Tax Relief
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Claim up to ₹1,50,000 tax deduction per year on EV loan interest for eligible loans.
              </span>
            </div>
            <button
              type="button"
              onClick={() => updateState('isSec80EEBEligible', !state.isSec80EEBEligible)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                state.isSec80EEBEligible
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {state.isSec80EEBEligible ? 'Sec 80EEB Active' : 'Not Eligible'}
            </button>
          </div>
        )}
      </div>

      {/* 4. Primary Decision Dashboard */}
      <ResultDashboard
        primaryLabel={
          state.calculationMode === 'reverse_emi'
            ? 'Max Affordable Car Price'
            : 'Monthly Car Loan EMI'
        }
        primaryValue={
          state.calculationMode === 'reverse_emi'
            ? formatCurrency(results.vehiclePrice)
            : `${formatCurrency(results.emi)}/mo`
        }
        secondaryItems={[
          {
            label: `Down Payment (${state.downPaymentPct}%)`,
            value: formatCurrency(results.downPaymentAmount),
          },
          {
            label: 'Net Car Loan Principal',
            value: formatCurrency(results.loanAmount),
          },
          {
            label: 'Total Car Loan Interest',
            value: formatCurrency(results.totalInterest),
          },
          {
            label: '5-Year Operational Fuel/Energy Cost',
            value: formatCurrency(results.fuel5Yr),
          },
          {
            label: '5-Year Total True Ownership Cost',
            value: formatCurrency(results.totalOwnershipCost5Yr),
          },
        ]}
      />

      {/* 5. Health Gauge & Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthGauge
          score={results.score}
          label={results.healthStatus}
          description={results.affordabilityDesc}
        />
        <ResultDonutChart
          title="5-Year Total Ownership Cost Breakdown"
          items={[
            {
              label: 'Borrowed Loan Principal',
              value: results.loanAmount,
              color: '#3B82F6',
            },
            {
              label: 'Car Loan Interest',
              value: results.totalInterest,
              color: '#EF4444',
            },
            {
              label: 'Registration & Processing Fees',
              value: results.registrationFee + results.processingFee,
              color: '#F59E0B',
            },
            {
              label: '5-Year Fuel / Energy Cost',
              value: results.fuel5Yr,
              color: '#10B981',
            },
            {
              label: '5-Year Insurance & Maintenance',
              value: results.insurance5Yr + results.maintenance5Yr,
              color: '#8B5CF6',
            },
          ]}
        />
      </div>

      {/* 6. Down Payment Coach Card */}
      <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl text-blue-900 dark:text-blue-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
              💡 Down Payment Coach (+₹1.0 Lakh DP Savings)
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              Increasing your down payment by +₹1,00,000 reduces your borrowed principal to {formatCurrency(results.dpCoach.newLoanAmount)}, lowering monthly EMI and total interest outgo.
            </p>
          </div>
          <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/40 text-center min-w-[200px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">Interest Saved</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.dpCoach.interestSavedDp)}
            </span>
            <span className="text-xs text-blue-200 mt-0.5 block">
              ({formatCurrency(results.dpCoach.emiReduction)}/mo Lower EMI)
            </span>
          </div>
        </div>
      </div>

      {/* 7. Section 80EEB EV Tax Relief Summary Card */}
      {state.fuelType === 'ev' && state.isSec80EEBEligible && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-emerald-900 dark:text-emerald-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                ⚡ Section 80EEB EV Tax Relief Benefit
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                Under Section 80EEB of the Income Tax Act, up to ₹1,50,000 per year in EV loan interest is deductible from taxable income.
              </p>
            </div>
            <div className="bg-emerald-900/30 p-4 rounded-xl border border-emerald-500/40 text-center min-w-[200px]">
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">Estimated Tax Savings</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                {formatCurrency(results.sec80EEB_taxSavings)}
              </span>
              <span className="text-xs text-emerald-200 mt-0.5 block">
                ({state.marginalTaxRate}% Tax Bracket)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 8. 4-Scenario Tenure & Down Payment Comparison Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Tenure & Down Payment Scenario Comparison Grid
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare monthly EMIs, total interest, FOIR burden, and 5-year ownership costs across loan structures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {results.scenarios.map((sc) => (
            <div
              key={sc.id}
              className={`p-4 rounded-xl border ${
                sc.tenure === state.tenure && sc.downPaymentPct === state.downPaymentPct
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
              At an assumed annual inflation rate of {state.inflationRate}%, your future 5-year total ownership cost of {formatCurrency(results.totalOwnershipCost5Yr)} has the equivalent real value in today's money shown below.
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
          title="Monthly Car Loan Amortization Schedule"
        />
      )}

      {/* 12. Financial Safety & Disclaimers */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          ⚠️ Important Financial & Prudential Borrowing Norms:
        </p>
        <p>
          • FOIR Borrowing Limit: Financial planners recommend keeping total loan EMIs (including car loan) below 35% to 40% of net monthly income.
        </p>
        <p>
          • Section 80EEB EV Tax Deduction: Applies to electric vehicle loans sanctioned between April 1, 2019 and March 31, 2023. Consult your tax advisor to verify personal eligibility.
        </p>
        <p>
          • True Cost of Ownership: Fuel, insurance, maintenance, and registration tax account for 30% to 40% of total 5-year car expenses beyond the vehicle sticker price.
        </p>
      </div>

      {/* 13. Share Actions */}
      <ShareActions title="Flagship Car Buying & Loan Decision Engine — Fintools Find" />
    </div>
  );
}
