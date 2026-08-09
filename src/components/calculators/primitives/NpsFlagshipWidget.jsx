import { useMemo } from 'preact/hooks';
import { calculateNps } from '@calculators/retirement/nps-calculator';
import FormInputNumber from './FormInputNumber';
import ResultDashboard from '../../ui/ResultDashboard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import ResultDonutChart from '../../ui/ResultDonutChart';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function NpsFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    currentAge: 30,
    planningRetirementAge: 60,
    monthlyContribution: 5000,
    currentCorpus: 100000,
    expectedReturnRate: 10.0,
    allocationMode: 'active',
    equityPct: 50,
    corporateDebtPct: 30,
    govtBondsPct: 20,
    annuityPurchasePct: 40,
    annuityRatePct: 6.0,
    taxRegime: 'old',
    marginalTaxRatePct: 30,
    annualEmployerContribution: 0,
    basicSalary: 0,
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateNps(state);
  }, [state]);

  const presets = [
    {
      id: 'max_tax_saver',
      title: 'Max Tax Saver (Sec 80CCD 1B)',
      description: '₹50,000/yr self-contribution saving ₹15,600/yr tax under Old Regime.',
      values: {
        currentAge: 30,
        planningRetirementAge: 60,
        monthlyContribution: 4167, // ₹50k/yr
        currentCorpus: 50000,
        taxRegime: 'old',
        marginalTaxRatePct: 30,
        allocationMode: 'active',
        equityPct: 50,
        corporateDebtPct: 30,
        govtBondsPct: 20,
        annuityPurchasePct: 40,
      },
    },
    {
      id: 'young_starter',
      title: 'Young Salaried Starter (Age 25)',
      description: '35-year compounding runway with ₹5,000/mo SIP.',
      values: {
        currentAge: 25,
        planningRetirementAge: 60,
        monthlyContribution: 5000,
        currentCorpus: 25000,
        taxRegime: 'old',
        marginalTaxRatePct: 20,
        allocationMode: 'active',
        equityPct: 75,
        corporateDebtPct: 15,
        govtBondsPct: 10,
        annuityPurchasePct: 40,
      },
    },
    {
      id: 'aggressive_equity',
      title: 'Aggressive Equity LC75 Choice',
      description: 'Maximum 75% equity allocation targeting 11.5% long-term returns.',
      values: {
        currentAge: 28,
        planningRetirementAge: 60,
        monthlyContribution: 8000,
        currentCorpus: 150000,
        taxRegime: 'old',
        marginalTaxRatePct: 30,
        allocationMode: 'active',
        equityPct: 75,
        corporateDebtPct: 15,
        govtBondsPct: 10,
        annuityPurchasePct: 40,
      },
    },
    {
      id: 'corporate_nps_new',
      title: 'Corporate NPS (New Tax Regime)',
      description: '14% employer match u/s 80CCD(2) deductible under New Tax Regime.',
      values: {
        currentAge: 35,
        planningRetirementAge: 60,
        monthlyContribution: 5000,
        currentCorpus: 300000,
        taxRegime: 'new',
        marginalTaxRatePct: 30,
        annualEmployerContribution: 140000,
        basicSalary: 1000000,
        annuityPurchasePct: 40,
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Question Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30 mb-3">
              ⚡ Institutional NPS Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              How much tax will NPS save me today, and what monthly pension will I receive at age 60?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
              Calculate your total NPS Tier 1 nest egg at age 60, 60% tax-free lump-sum withdrawal, monthly annuity pension stream, and Section 80CCD(1B) / 80CCD(2) tax savings.
            </p>
          </div>
          <div className="bg-blue-800/40 border border-blue-500/40 p-4 rounded-xl text-center min-w-[200px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Estimated Tax Saved Today
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.taxSavings.annualTaxSaved)}/yr
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              ({results.taxSavings.taxRegime === 'old' ? 'Old Tax Regime u/s 80CCD 1B' : 'New Regime Employer 80CCD 2'})
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
          1. Subscriber & Contribution Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInputNumber
            id="currentAge"
            label="Current Age (Years)"
            value={state.currentAge}
            onChange={(val) => updateState('currentAge', val)}
            min={18}
            max={70}
            step={1}
          />
          <FormInputNumber
            id="planningRetirementAge"
            label="Planned Exit / Retirement Age"
            value={state.planningRetirementAge}
            onChange={(val) => updateState('planningRetirementAge', val)}
            min={state.currentAge + 1}
            max={75}
            step={1}
          />
          <FormInputNumber
            id="monthlyContribution"
            label="Monthly Self-Contribution (₹/mo)"
            value={state.monthlyContribution}
            onChange={(val) => updateState('monthlyContribution', val)}
            min={500}
            max={500000}
            step={500}
          />
          <FormInputNumber
            id="currentCorpus"
            label="Existing Accumulated NPS Corpus (₹)"
            value={state.currentCorpus}
            onChange={(val) => updateState('currentCorpus', val)}
            min={0}
            max={50000000}
            step={10000}
          />
        </div>

        {/* Tax Regime & Deduction Settings */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            2. Tax Regime & Income Deduction Settings
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Selected Income Tax Regime
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateState('taxRegime', 'old')}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    state.taxRegime === 'old'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  Old Tax Regime (Sec 80CCD 1B Eligible)
                </button>
                <button
                  type="button"
                  onClick={() => updateState('taxRegime', 'new')}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    state.taxRegime === 'new'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  New Tax Regime (Sec 80CCD 2 Eligible)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Marginal Income Tax Bracket %
              </label>
              <select
                value={state.marginalTaxRatePct}
                onChange={(e) => updateState('marginalTaxRatePct', Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
              >
                <option value={0}>0% (Tax Exempt)</option>
                <option value={5}>5% Slab</option>
                <option value={10}>10% Slab</option>
                <option value={15}>15% Slab</option>
                <option value={20}>20% Slab</option>
                <option value={30}>30% Slab</option>
              </select>
            </div>
          </div>
        </div>

        {/* Asset Class Allocation Sliders */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-bold text-slate-900 dark:text-white">
              3. Asset Class Allocation & Return Weighting
            </h4>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
              Weighted Expected Return: {results.effectiveReturnRate}% p.a.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInputNumber
              id="equityPct"
              label="Equity (Class E) % [Max 75%]"
              value={state.equityPct}
              onChange={(val) => updateState('equityPct', val)}
              min={0}
              max={75}
              step={5}
            />
            <FormInputNumber
              id="corporateDebtPct"
              label="Corporate Debt (Class C) %"
              value={state.corporateDebtPct}
              onChange={(val) => updateState('corporateDebtPct', val)}
              min={0}
              max={100}
              step={5}
            />
            <FormInputNumber
              id="govtBondsPct"
              label="Govt Securities (Class G) %"
              value={state.govtBondsPct}
              onChange={(val) => updateState('govtBondsPct', val)}
              min={0}
              max={100}
              step={5}
            />
          </div>
        </div>

        {/* Annuity Purchase & Pension Settings */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            4. Annuity Purchase & Lifetime Pension Conversion
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInputNumber
              id="annuityPurchasePct"
              label="Annuity Conversion % [Min 40%, Max 100%]"
              value={state.annuityPurchasePct}
              onChange={(val) => updateState('annuityPurchasePct', val)}
              min={40}
              max={100}
              step={5}
            />
            <FormInputNumber
              id="annuityRatePct"
              label="Illustrative Annuity Return Rate (% p.a.)"
              value={state.annuityRatePct}
              onChange={(val) => updateState('annuityRatePct', val)}
              min={3.0}
              max={10.0}
              step={0.5}
            />
          </div>
        </div>
      </div>

      {/* 4. Primary Results Dashboard */}
      <ResultDashboard
        primaryLabel="Total NPS Nest Egg at Age 60"
        primaryValue={formatCurrency(results.totalAccumulatedCorpus)}
        secondaryItems={[
          {
            label: 'Estimated Monthly Pension',
            value: `${formatCurrency(results.monthlyPension)}/mo`,
          },
          {
            label: '60% Tax-Free Lump-Sum',
            value: formatCurrency(results.lumpSumAmount),
          },
          {
            label: '40% Mandatory Annuity Value',
            value: formatCurrency(results.annuityAmount),
          },
          {
            label: 'Annual Tax Saved Today',
            value: formatCurrency(results.taxSavings.annualTaxSaved),
          },
        ]}
      />

      {/* 5. Health Gauge & Donut Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthGauge
          score={results.npsScore}
          label={results.scoreLabel}
          description={`Weighted Return: ${results.effectiveReturnRate}% p.a. | Tax Saved: ${formatCurrency(results.taxSavings.annualTaxSaved)}/yr`}
        />
        <ResultDonutChart
          title="NPS Maturity Allocation at Age 60"
          items={[
            {
              label: `${results.lumpSumPct}% Tax-Free Lump-Sum`,
              value: results.lumpSumAmount,
              color: '#10B981',
            },
            {
              label: `${results.annuityPurchasePct}% Mandatory Annuity`,
              value: results.annuityAmount,
              color: '#3B82F6',
            },
          ]}
        />
      </div>

      {/* 6. Annuity Pension Rate Matrix */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <h4 className="text-md font-bold text-slate-900 dark:text-white mb-4">
          Annuity Pension Rate Sensitivity Matrix
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-200">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Annuity Return Rate</th>
                <th className="px-4 py-3">Monthly Pension</th>
                <th className="px-4 py-3">Annual Pension</th>
              </tr>
            </thead>
            <tbody>
              {results.annuityMatrix.map((item) => (
                <tr
                  key={item.rate}
                  className={`border-b dark:border-slate-700 ${
                    item.rate === state.annuityRatePct ? 'bg-blue-50 dark:bg-blue-900/20 font-bold' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{item.rate}% p.a.</td>
                  <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-bold">
                    {formatCurrency(item.monthlyPension)}/mo
                  </td>
                  <td className="px-4 py-3">{formatCurrency(item.annualPension)}/yr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. 5-Hypothetical Scenario Simulator Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <h4 className="text-md font-bold text-slate-900 dark:text-white mb-4">
          5-Hypothetical NPS Scenario Simulator
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {results.scenarios.map((sc, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                idx === 0
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {sc.name}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(sc.totalCorpus)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Monthly Pension: <strong className="text-blue-600 dark:text-blue-400">{formatCurrency(sc.monthlyPension)}/mo</strong>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lump-Sum: {formatCurrency(sc.lumpSumAmount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Disclaimers & Safety Notice */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          ⚠️ Regulatory & Planning Disclosures:
        </p>
        <p>
          • PFRDA Guidelines: At age 60, maximum 60% lump-sum is tax-free u/s 10(12A). Minimum 40% must be converted to an annuity unless total corpus is ≤ ₹5 Lakhs.
        </p>
        <p>
          • Income Tax Act: Section 80CCD(1B) extra ₹50,000 deduction is available ONLY under the Old Tax Regime. Section 80CCD(2) employer contribution (up to 14%) is available under BOTH Old and New Tax Regimes.
        </p>
        <p>
          • Asset returns and annuity pension figures are illustrative assumptions, not guaranteed returns promised by PFRDA.
        </p>
      </div>

      {/* 9. Share Actions */}
      <ShareActions title="Flagship NPS Calculator - Fintools Find" />
    </div>
  );
}
