import { useMemo } from 'preact/hooks';
import { calculateGratuityCalculator } from '@calculators/retirement/gratuity-calculator';
import { GRATUITY_CONFIG } from '@calculators/configs/gratuityConfig';
import FormInputNumber from './FormInputNumber';
import ResultDashboard from '../../ui/ResultDashboard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import ResultDonutChart from '../../ui/ResultDonutChart';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function GratuityFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    lastDrawnBasic: 50000,
    tenureYears: 15,
    tenureMonths: 7,
    coverageType: 'covered', // 'covered' | 'non_covered' | 'government'
    isDisabilityWaiver: false,
    annualSalaryIncrease: 5,
    marginalTaxRate: 30,
    calculationMode: 'forward', // 'forward' | 'reverse_gratuity'
    targetGratuity: 2000000,
    inflationRate: 6,
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateGratuityCalculator(state);
  }, [state]);

  const presets = GRATUITY_CONFIG.presets;

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              💼 Institutional Gratuity & Tax Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model Payment of Gratuity Act 1972 statutory 15/26 formulas, 6-month rounding rules, Section 10(10) ₹20L tax ceilings, and 1-to-5 year career growth simulators.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              {state.calculationMode === 'reverse_gratuity' ? 'Required Basic Salary' : 'Total Statutory Gratuity Payout'}
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(
                state.calculationMode === 'reverse_gratuity' ? results.lastDrawnBasic : results.gratuityAmount
              )}
              {state.calculationMode === 'reverse_gratuity' ? '/mo' : ''}
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              ({results.isEligible ? `${results.roundedYears} Rounded Years Service` : 'Ineligible (< 5 Years)'})
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
            Gratuity Payout Mode
          </button>
          <button
            type="button"
            onClick={() => updateState('calculationMode', 'reverse_gratuity')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              state.calculationMode === 'reverse_gratuity'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Target Gratuity Solver
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
          1. Employment & Salary Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.calculationMode === 'forward' ? (
            <FormInputNumber
              id="lastDrawnBasic"
              label="Last Drawn Monthly Basic Salary + DA (₹/mo)"
              value={state.lastDrawnBasic}
              onChange={(val) => updateState('lastDrawnBasic', val)}
              min={5000}
              max={2000000}
              step={5000}
            />
          ) : (
            <FormInputNumber
              id="targetGratuity"
              label="Target Gratuity Payout Amount (₹)"
              value={state.targetGratuity}
              onChange={(val) => updateState('targetGratuity', val)}
              min={100000}
              max={50000000}
              step={100000}
            />
          )}

          <FormInputNumber
            id="tenureYears"
            label="Completed Service Tenure (Years)"
            value={state.tenureYears}
            onChange={(val) => updateState('tenureYears', val)}
            min={0}
            max={50}
            step={1}
          />

          <FormInputNumber
            id="tenureMonths"
            label="Additional Service Duration (Months: 0 to 11)"
            value={state.tenureMonths}
            onChange={(val) => updateState('tenureMonths', val)}
            min={0}
            max={11}
            step={1}
          />

          <FormInputNumber
            id="annualSalaryIncrease"
            label="Expected Annual Basic Salary Growth (% p.a.)"
            value={state.annualSalaryIncrease}
            onChange={(val) => updateState('annualSalaryIncrease', val)}
            min={0}
            max={30}
            step={1}
          />

          <FormInputNumber
            id="marginalTaxRate"
            label="Marginal Income Tax Bracket (% for Taxable Gratuity)"
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

        {/* Coverage Type Switcher */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white block">
            Establishment Coverage Type under Gratuity Act:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => updateState('coverageType', 'covered')}
              className={`p-4 rounded-xl border text-left transition-all ${
                state.coverageType === 'covered'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Covered under Act (15/26 Rule)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Standard corporate & factory employees. 26 working days base; $\ge 6$ months rounds UP to 1 full year.
              </span>
            </button>

            <button
              type="button"
              onClick={() => updateState('coverageType', 'non_covered')}
              className={`p-4 rounded-xl border text-left transition-all ${
                state.coverageType === 'non_covered'
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Not Covered under Act (15/30 Rule)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                30 calendar days base. Completed full years only (no service month rounding).
              </span>
            </button>

            <button
              type="button"
              onClick={() => updateState('coverageType', 'government')}
              className={`p-4 rounded-xl border text-left transition-all ${
                state.coverageType === 'government'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Government Employee (100% Tax-Free)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Central/State govt employees. 100% tax-free under Section 10(10)(i) without ₹20L ceiling cap.
              </span>
            </button>
          </div>
        </div>

        {/* Disability / Death Exception Toggle */}
        <div className="pt-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              Permanent Disablement or Death Exception (Sec 4(1))
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Statutory 5-year continuous service rule is legally waived in case of permanent disablement or death.
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateState('isDisabilityWaiver', !state.isDisabilityWaiver)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              state.isDisabilityWaiver
                ? 'bg-rose-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {state.isDisabilityWaiver ? 'Waiver Active' : 'Standard 5Y Rule'}
          </button>
        </div>
      </div>

      {/* 4. Primary Decision Dashboard */}
      <ResultDashboard
        primaryLabel={
          state.calculationMode === 'reverse_gratuity'
            ? 'Required Monthly Basic Salary'
            : 'Total Statutory Gratuity Payout'
        }
        primaryValue={
          state.calculationMode === 'reverse_gratuity'
            ? `${formatCurrency(results.lastDrawnBasic)}/mo`
            : formatCurrency(results.gratuityAmount)
        }
        secondaryItems={[
          {
            label: 'Section 10(10) Tax-Free Exemption',
            value: formatCurrency(results.taxFreeGratuity),
          },
          {
            label: 'Taxable Gratuity Portion',
            value: formatCurrency(results.taxableGratuity),
          },
          {
            label: 'Estimated Tax Outgo',
            value: formatCurrency(results.estimatedTaxOnGratuity),
          },
          {
            label: 'Net Post-Tax Gratuity Cash Flow',
            value: formatCurrency(results.netPostTaxGratuity),
          },
          {
            label: 'Rounded Service Years',
            value: `${results.roundedYears} Years (${results.denominator} Days Base)`,
          },
        ]}
      />

      {/* 5. Health Gauge & Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthGauge
          score={results.score}
          label={results.healthStatus}
          description={
            results.isEligible
              ? `Service Tenure: ${results.roundedYears} Years | Formula: 15/${results.denominator}`
              : 'Requires 5 Full Years of Service'
          }
        />
        <ResultDonutChart
          title="Gratuity Payout Tax Composition"
          items={[
            {
              label: 'Section 10(10) Tax-Free Exemption',
              value: results.taxFreeGratuity,
              color: '#10B981',
            },
            {
              label: 'Taxable Gratuity Portion',
              value: results.taxableGratuity,
              color: '#EF4444',
            },
          ]}
        />
      </div>

      {/* 6. Section 10(10) Tax Exemption Summary Banner */}
      {results.isCeilingBreached ? (
        <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
            <span>⚠️ Section 10(10) ₹20 Lakh Statutory Exemption Ceiling Breached</span>
          </div>
          <p className="text-xs sm:text-sm">
            Your total gratuity payout ({formatCurrency(results.gratuityAmount)}) exceeds the statutory{' '}
            <strong>₹20,00,000 (₹20 Lakhs)</strong> tax-free ceiling u/s 10(10). The excess portion of{' '}
            <strong>{formatCurrency(results.taxableGratuity)}</strong> is taxable at your marginal tax rate ({state.marginalTaxRate}%), resulting in an estimated tax outgo of {formatCurrency(results.estimatedTaxOnGratuity)}.
          </p>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl text-emerald-900 dark:text-emerald-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
            <span>✅ 100% Tax-Free Gratuity Exemption u/s 10(10)</span>
          </div>
          <p className="text-xs sm:text-sm">
            Your gratuity payout ({formatCurrency(results.gratuityAmount)}) is fully within the statutory{' '}
            <strong>₹20,00,000 (₹20 Lakhs)</strong> exemption ceiling. Your entire gratuity payout is 100% tax-free!
          </p>
        </div>
      )}

      {/* 7. Work "1 to 5 More Years" Career Growth Simulator */}
      {results.isEligible && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
          <div>
            <h4 className="text-md font-bold text-slate-900 dark:text-white">
              Work "+1 to +5 More Years" Career Growth Simulator
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evaluate how delaying job resignation/retirement by 1 to 5 years increases your statutory gratuity payout assuming {state.annualSalaryIncrease}% annual basic salary growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {results.careerSimulators.map((sc) => (
              <div
                key={sc.additionalYears}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-1"
              >
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {sc.label}
                </span>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {formatCurrency(sc.projectedGratuity)}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  + Extra: {formatCurrency(sc.additionalGratuity)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Basic: {formatCurrency(sc.projectedBasic)}/mo
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. 4-Scenario Service Tenure Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div>
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            Service Tenure Milestone Scenario Grid (5Y vs 10Y vs 15Y vs 25Y)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare gratuity entitlements across career milestones for your current basic salary of {formatCurrency(state.lastDrawnBasic)}/mo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {results.tenureScenarios.map((sc) => (
            <div
              key={sc.tenureYears}
              className={`p-4 rounded-xl border ${
                sc.tenureYears === state.tenureYears
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.label}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(sc.gratuityAmount)}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                Tax-Free: {formatCurrency(sc.taxFreeGratuity)}
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
              Inflation-Adjusted Real Purchasing Power Analysis
            </h4>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              At an assumed annual inflation rate of {state.inflationRate}%, your nominal gratuity payout of {formatCurrency(results.gratuityAmount)} after {results.roundedYears} years has the equivalent real purchasing power in today's money shown below.
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

      {/* 10. Financial Safety & Disclaimers */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          ⚠️ Important Statutory & Regulatory Disclaimers:
        </p>
        <p>
          • 15/26 Working Day Formula: Applies to commercial establishments covered under the Payment of Gratuity Act, 1972. Service duration of 6 months or more rounds UP to 1 full year.
        </p>
        <p>
          • Section 10(10) Tax Exemption: Maximum tax-free exemption for non-government employees is ₹20,00,000 (₹20 Lakhs). Central/State government employees enjoy 100% tax exemption.
        </p>
        <p>
          • 5-Year Eligibility Rule: Mandatory 5 years of continuous service required under Section 4(1), waived only for permanent disablement or death.
        </p>
      </div>

      {/* 11. Share Actions */}
      <ShareActions title="Flagship Gratuity & Section 10(10) Decision Engine — Fintools Find" />
    </div>
  );
}
