import { useState, useMemo } from 'preact/hooks';
import { calculateHraCalculator } from '../../../calculators/tax/hra-calculator.js';
import { formatCurrency } from '@utils/formatters.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';
import FormToggleSwitch from './FormToggleSwitch';

const DEFAULT_HRA_STATE = {
  basicSalary: 600000,
  daAmount: 0,
  hraReceived: 240000,
  rentPaid: 300000,
  isMetro: true,
  inputPeriod: 'annual',
  grossSalary: 1200000,
  otherDeductionsOld: 150000,
  regime: 'old',
};

const HRA_PARAM_MAP = {
  basicSalary: 'bsc',
  daAmount: 'da',
  hraReceived: 'hra',
  rentPaid: 'rnt',
  isMetro: 'mtr',
  inputPeriod: 'prd',
  grossSalary: 'grs',
  otherDeductionsOld: 'ded',
  regime: 'reg',
};

export default function HraFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_HRA_STATE, HRA_PARAM_MAP);
  const {
    basicSalary,
    daAmount,
    hraReceived,
    rentPaid,
    isMetro,
    inputPeriod,
    grossSalary,
    otherDeductionsOld,
    regime,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Illustrative Smart Presets
  const presets = [
    { id: 'young', label: 'Young Pro', icon: '👤', basicSalary: 450000, hraReceived: 180000, rentPaid: 180000, isMetro: true, desc: '₹4.5L Basic • ₹15k/mo Rent' },
    { id: 'mid', label: 'Mid-Career', icon: '💼', basicSalary: 800000, hraReceived: 320000, rentPaid: 300000, isMetro: true, desc: '₹8L Basic • ₹25k/mo Rent' },
    { id: 'senior', label: 'Senior Pro', icon: '👔', basicSalary: 1500000, hraReceived: 600000, rentPaid: 540000, isMetro: true, desc: '₹15L Basic • ₹45k/mo Rent' },
    { id: 'high_rent', label: 'High-Rent Metro', icon: '🏙️', basicSalary: 1200000, hraReceived: 480000, rentPaid: 600000, isMetro: true, desc: '₹12L Basic • ₹50k/mo Rent' },
    { id: 'non_metro', label: 'Non-Metro Pro', icon: '🏡', basicSalary: 600000, hraReceived: 240000, rentPaid: 216000, isMetro: false, desc: '₹6L Basic • ₹18k/mo Rent' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('basicSalary', p.basicSalary);
    setParam('hraReceived', p.hraReceived);
    setParam('rentPaid', p.rentPaid);
    setParam('isMetro', p.isMetro);
    setParam('inputPeriod', 'annual');
  };

  // Run pure HRA math calculation engine
  const results = useMemo(() => {
    return calculateHraCalculator({
      basicSalary,
      daAmount,
      hraReceived,
      rentPaid,
      isMetro,
      inputPeriod,
      grossSalary,
      otherDeductionsOld,
      regime,
    });
  }, [
    basicSalary,
    daAmount,
    hraReceived,
    rentPaid,
    isMetro,
    inputPeriod,
    grossSalary,
    otherDeductionsOld,
    regime,
  ]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleReset = () => {
    setActivePreset(null);
    resetUrlState();
  };

  const isMonthly = inputPeriod === 'monthly';

  // Dashboard Metrics items
  const dashboardMetrics = [
    { label: 'Tax-Exempt HRA', value: formatCurrency(results.primaryOutput), highlight: true, subtitle: isMonthly ? 'Exempt per month' : 'Exempt per year' },
    { label: 'Estimated Tax Saved', value: formatCurrency(isMonthly ? results.estimatedTaxSavedMonthly : results.estimatedTaxSavedAnnual), subtitle: 'Direct tax outgo saved' },
    { label: 'Taxable HRA Amount', value: formatCurrency(isMonthly ? results.taxableHraMonthly : results.rule2A.taxableHra), subtitle: 'Added to taxable income' },
    { label: 'HRA Received from Employer', value: formatCurrency(isMonthly ? Math.round(results.hraReceivedAnnual / 12) : results.hraReceivedAnnual), subtitle: 'Annual allowance' },
    { label: 'Actual Rent Paid', value: formatCurrency(isMonthly ? Math.round(results.rentPaidAnnual / 12) : results.rentPaidAnnual), subtitle: 'Landlord rent' },
    { label: 'Rule 2A Binding Limit', value: results.rule2A.bindingLimitShort, subtitle: 'Statutory constraint' },
  ];

  // Donut Chart items for HRA Allocation
  const hraDonutData = [
    { name: 'Tax-Exempt HRA', value: results.rule2A.exemptHra, color: '#10b981' },
    { name: 'Taxable HRA Portion', value: results.rule2A.taxableHra, color: '#ef4444' },
  ];

  // Rule 2A 3-Limit Breakdown Items
  const rule2ALimitItems = [
    {
      label: '1. Actual HRA Received',
      amount: results.rule2A.actualHra,
      colorClass: results.rule2A.bindingLimit === 'actual_hra' ? 'bg-emerald-500' : 'bg-primary',
      desc: results.rule2A.bindingLimit === 'actual_hra' ? '🔒 BINDING LIMIT (Lowest statutory value)' : 'Annual HRA provided by employer.',
    },
    {
      label: '2. Rent Paid minus 10% Basic (+DA)',
      amount: results.rule2A.rentMinusTenPercent,
      colorClass: results.rule2A.bindingLimit === 'rent_minus_10pct' ? 'bg-emerald-500' : 'bg-accent-sky',
      desc: results.rule2A.bindingLimit === 'rent_minus_10pct' ? '🔒 BINDING LIMIT (Lowest statutory value)' : 'Actual rent paid exceeding 10% of salary.',
    },
    {
      label: `3. ${results.isMetro ? '50% (Metro)' : '40% (Non-Metro)'} Basic Salary Ceiling`,
      amount: results.rule2A.salaryCap,
      colorClass: results.rule2A.bindingLimit === 'salary_cap' ? 'bg-emerald-500' : 'bg-accent-amber',
      desc: results.rule2A.bindingLimit === 'salary_cap' ? '🔒 BINDING LIMIT (Lowest statutory value)' : `Statutory city ceiling (${results.isMetro ? 'Delhi, Mumbai, Kolkata, Chennai' : 'Other cities'}).`,
    },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Smart Presets Section */}
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono text-body font-semibold uppercase tracking-wider">
            Illustrative Rental Profiles
          </span>
          <span class="text-[11px] font-mono text-body-muted bg-surface px-2 py-0.5 rounded border border-hairline">
            Illustrative Examples (Not Industry Claims)
          </span>
        </div>
        <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select HRA Profile Preset" />
      </div>

      {/* 2. PROMINENT QUESTION BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider">
            ⚖️ SECTION 10(13A) HRA DECISION VERDICT
          </span>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-body-muted">Tax Year: {results.taxYearAssumption}</span>
            <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${results.healthColor}`}>
              HRA Benefit Score: {results.hraBenefitScore}/100 ({results.healthStatus})
            </span>
          </div>
        </div>

        {/* UX PROMINENT QUESTIONS */}
        <div class="grid md:grid-cols-2 gap-4 pt-2">
          <div class="p-4 rounded-2xl bg-canvas border border-hairline space-y-1">
            <div class="text-xs font-mono text-body-muted uppercase font-bold">1. How much of my HRA is tax-exempt?</div>
            <div class="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-500">
              {formatCurrency(results.primaryOutput)} <span class="text-xs text-body font-normal">{isMonthly ? '/ month' : '/ year'}</span>
            </div>
            <div class="text-[11px] text-body-muted font-mono">{results.rule2A.exemptionRatioPct}% of HRA received is exempt from income tax</div>
          </div>

          <div class="p-4 rounded-2xl bg-canvas border border-hairline space-y-1">
            <div class="text-xs font-mono text-body-muted uppercase font-bold">2. How much tax does my HRA actually save?</div>
            <div class="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
              {formatCurrency(isMonthly ? results.estimatedTaxSavedMonthly : results.estimatedTaxSavedAnnual)} <span class="text-xs text-body font-normal">{isMonthly ? '/ month' : '/ year'}</span>
            </div>
            <div class="text-[11px] text-body-muted font-mono">Estimated tax savings under Old Tax Regime</div>
          </div>
        </div>

        <p class="text-xs sm:text-sm text-body leading-relaxed pt-1">
          {results.healthDesc}
        </p>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Control Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <h3 class="text-xl font-bold font-heading text-ink">HRA Exemption Parameters</h3>
              <p class="text-xs text-body-muted font-mono mt-0.5">Section 10(13A) Rule 2A Slabs</p>
            </div>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Period Mode Toggle */}
          <div class="flex items-center justify-between bg-surface p-2 rounded-2xl border border-hairline">
            <span class="text-xs font-bold font-heading text-ink px-2">Input Period Mode</span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setParam('inputPeriod', 'annual')}
                class={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  inputPeriod === 'annual' ? 'bg-primary text-white shadow-sm' : 'text-body hover:bg-canvas'
                }`}
              >
                Annual Amounts
              </button>
              <button
                type="button"
                onClick={() => setParam('inputPeriod', 'monthly')}
                class={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  inputPeriod === 'monthly' ? 'bg-primary text-white shadow-sm' : 'text-body hover:bg-canvas'
                }`}
              >
                Monthly Amounts
              </button>
            </div>
          </div>

          <FormInputNumber
            id="basic-salary-input"
            label={isMonthly ? 'Monthly Basic Salary (₹)' : 'Annual Basic Salary (₹)'}
            value={basicSalary}
            min={isMonthly ? 10000 : 120000}
            max={isMonthly ? 1500000 : 18000000}
            step={isMonthly ? 5000 : 50000}
            prefix="₹"
            minLabel={isMonthly ? '₹10k' : '₹1.2L'}
            maxLabel={isMonthly ? '₹15L' : '₹1.8Cr'}
            onChange={(v) => setParam('basicSalary', v)}
          />

          <FormInputNumber
            id="da-amount-input"
            label={isMonthly ? 'Monthly Dearness Allowance (DA) (₹)' : 'Annual Dearness Allowance (DA) (₹)'}
            value={daAmount}
            min={0}
            max={isMonthly ? 500000 : 6000000}
            step={isMonthly ? 2000 : 25000}
            prefix="₹"
            minLabel="₹0"
            maxLabel={isMonthly ? '₹5L' : '₹60L'}
            onChange={(v) => setParam('daAmount', v)}
          />

          <FormInputNumber
            id="hra-received-input"
            label={isMonthly ? 'Monthly HRA Received (₹)' : 'Annual HRA Received (₹)'}
            value={hraReceived}
            min={0}
            max={isMonthly ? 500000 : 6000000}
            step={isMonthly ? 2000 : 25000}
            prefix="₹"
            minLabel="₹0"
            maxLabel={isMonthly ? '₹5L' : '₹60L'}
            onChange={(v) => setParam('hraReceived', v)}
          />

          <FormInputNumber
            id="rent-paid-input"
            label={isMonthly ? 'Monthly Rent Paid (₹)' : 'Annual Rent Paid (₹)'}
            value={rentPaid}
            min={0}
            max={isMonthly ? 600000 : 7200000}
            step={isMonthly ? 2000 : 25000}
            prefix="₹"
            minLabel="₹0"
            maxLabel={isMonthly ? '₹6L' : '₹72L'}
            onChange={(v) => setParam('rentPaid', v)}
          />

          <FormToggleSwitch
            id="metro-city-toggle"
            label="Metro City (Delhi, Mumbai, Kolkata, Chennai)"
            checked={isMetro === true || isMetro === 'true' || isMetro === 'yes'}
            onChange={(checked) => setParam('isMetro', checked)}
          />

          {/* Tax Regime Selector */}
          <div class="space-y-2 pt-2 border-t border-hairline">
            <label class="block text-xs font-bold font-heading text-ink">Active Tax Regime</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setParam('regime', 'old')}
                class={`p-3 rounded-2xl border text-left transition-all ${
                  regime === 'old'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                    : 'border-hairline bg-surface text-body hover:bg-canvas'
                }`}
              >
                <div class="text-xs font-bold">Old Tax Regime</div>
                <div class="text-[11px] font-mono text-body-muted mt-0.5">Section 10(13A) Active</div>
              </button>
              <button
                type="button"
                onClick={() => setParam('regime', 'new')}
                class={`p-3 rounded-2xl border text-left transition-all ${
                  regime === 'new'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                    : 'border-hairline bg-surface text-body hover:bg-canvas'
                }`}
              >
                <div class="text-xs font-bold">New Tax Regime</div>
                <div class="text-[11px] font-mono text-body-muted mt-0.5">0% HRA Exemption</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard metrics={dashboardMetrics} />

          <FinancialHealthGauge
            score={results.hraBenefitScore}
            statusText={results.healthStatus}
            description={`Your tax-exempt HRA is ${formatCurrency(results.rule2A.exemptHra)}, saving an estimated ${formatCurrency(results.estimatedTaxSavedAnnual)} per year in income tax.`}
          />

          <ResultDonutChart title="HRA Exemption Allocation" data={hraDonutData} />
        </div>
      </div>

      {/* 4. RULE 2A STATUTORY 3-LIMIT BREAKDOWN */}
      <div class="space-y-4">
        <div>
          <h3 class="text-xl font-bold font-heading text-ink">Section 10(13A) Rule 2A Statutory 3-Limit Breakdown</h3>
          <p class="text-xs text-body-muted font-mono mt-0.5">Income tax law grants exemption equal to the MINIMUM of these three amounts</p>
        </div>

        <CostBreakdownCard title="Rule 2A Exemption Limits" items={rule2ALimitItems} />
      </div>

      {/* 5. OLD VS NEW TAX REGIME COMPARISON CARD */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-hairline pb-4">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">Old vs New Tax Regime HRA Impact</h3>
            <p class="text-xs text-body-muted font-mono mt-0.5">HRA exemption is permitted under Old Regime ONLY</p>
          </div>
          <span class="px-3 py-1 rounded-pill bg-primary/10 text-primary font-mono text-xs font-bold uppercase">
            Recommended: {results.recommendedRegime.toUpperCase()} REGIME
          </span>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          {/* Old Regime Card */}
          <div class={`p-5 rounded-2xl border transition-all ${results.recommendedRegime === 'old' ? 'border-emerald-500 bg-emerald-500/5' : 'border-hairline bg-surface'}`}>
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-bold font-heading text-ink">Old Tax Regime</span>
              {results.recommendedRegime === 'old' && (
                <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500 text-white">Recommended</span>
              )}
            </div>
            <div class="space-y-2 text-xs font-mono">
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Tax-Exempt HRA:</span>
                <span class="font-bold text-semantic-success">{formatCurrency(results.oldRegime.exemptHra)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Taxable HRA:</span>
                <span class="font-bold text-ink">{formatCurrency(results.oldRegime.taxableHra)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Net Taxable Income:</span>
                <span class="font-bold text-ink">{formatCurrency(results.oldRegime.taxableIncome)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Total Income Tax:</span>
                <span class="font-bold text-semantic-danger">{formatCurrency(results.oldRegime.totalIncomeTax)}</span>
              </div>
              <div class="flex justify-between py-1 pt-2 text-sm font-bold text-ink">
                <span>HRA Tax Saved:</span>
                <span class="text-emerald-500">{formatCurrency(results.oldRegime.estimatedTaxSaved)}</span>
              </div>
            </div>
          </div>

          {/* New Regime Card */}
          <div class={`p-5 rounded-2xl border transition-all ${results.recommendedRegime === 'new' ? 'border-emerald-500 bg-emerald-500/5' : 'border-hairline bg-surface'}`}>
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-bold font-heading text-ink">New Tax Regime</span>
              {results.recommendedRegime === 'new' && (
                <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500 text-white">Recommended</span>
              )}
            </div>
            <div class="space-y-2 text-xs font-mono">
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Tax-Exempt HRA:</span>
                <span class="font-bold text-semantic-danger">₹0 (Disallowed)</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Taxable HRA:</span>
                <span class="font-bold text-ink">{formatCurrency(results.newRegime.taxableHra)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Net Taxable Income:</span>
                <span class="font-bold text-ink">{formatCurrency(results.newRegime.taxableIncome)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Total Income Tax:</span>
                <span class="font-bold text-semantic-danger">{formatCurrency(results.newRegime.totalIncomeTax)}</span>
              </div>
              <div class="flex justify-between py-1 pt-2 text-sm font-bold text-ink">
                <span>HRA Tax Saved:</span>
                <span class="text-body-muted">₹0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. RENT SCENARIO SIMULATOR GRID */}
      <div class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">Rent Scenario Simulator</h3>
            <p class="text-xs text-body-muted font-mono mt-0.5">Evaluating Tax Savings vs Additional Rent Cost Outlay</p>
          </div>
          <span class="text-xs font-mono text-body-muted">6 Simulated Rent Models</span>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.scenarios.map((sc) => {
            const isPositiveNet = sc.netFinancialImpactAnnual > 0;
            const isNegativeNet = sc.netFinancialImpactAnnual < 0;

            return (
              <div key={sc.id} class="p-5 rounded-2xl bg-canvas border border-hairline space-y-3 shadow-soft hover:border-primary/50 transition-all">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold font-mono px-2 py-0.5 rounded bg-surface border border-hairline text-ink">{sc.badge}</span>
                  <span class="text-[11px] font-mono text-body-muted">{sc.name}</span>
                </div>

                <div>
                  <div class="text-xs text-body-muted font-mono">Monthly Rent</div>
                  <div class="text-lg font-extrabold font-heading text-ink">{formatCurrency(sc.monthlyRent)} <span class="text-xs font-normal">/ mo</span></div>
                </div>

                <div class="space-y-1.5 text-[11px] font-mono pt-2 border-t border-hairline text-body-muted">
                  <div class="flex justify-between"><span>Exempt HRA:</span><span class="text-emerald-500 font-bold">{formatCurrency(sc.exemptHraAnnual)}</span></div>
                  <div class="flex justify-between"><span>Tax Saved:</span><span class="text-primary font-bold">{formatCurrency(sc.estimatedTaxSavedAnnual)}</span></div>
                  {sc.addlRentCostAnnual !== 0 && (
                    <div class="flex justify-between"><span>Rent Cost Change:</span><span class="text-ink font-bold">{sc.addlRentCostAnnual > 0 ? `+${formatCurrency(sc.addlRentCostAnnual)}` : formatCurrency(sc.addlRentCostAnnual)}</span></div>
                  )}
                  {sc.id !== 'current' && (
                    <div class={`flex justify-between font-bold pt-1 border-t border-hairline ${isPositiveNet ? 'text-semantic-success' : isNegativeNet ? 'text-semantic-danger' : 'text-body'}`}>
                      <span>Net Financial Impact:</span>
                      <span>{sc.netFinancialImpactAnnual >= 0 ? `+${formatCurrency(sc.netFinancialImpactAnnual)}` : formatCurrency(sc.netFinancialImpactAnnual)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. DYNAMIC INSIGHT CARDS & RECOMMENDATION CARDS */}
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <h4 class="text-lg font-bold font-heading text-ink">Dynamic HRA Insights</h4>
          <div class="space-y-3">
            {results.dynamicInsights.map((ins, idx) => (
              <InsightCard key={idx} title={ins.title} metric={ins.value} description={ins.description} icon={ins.icon} />
            ))}
          </div>
        </div>

        <div class="space-y-4">
          <h4 class="text-lg font-bold font-heading text-ink">HRA Compliance & Optimization Checklist</h4>
          <div class="space-y-3">
            <RecommendationCard
              title="Obtain Landlord PAN if Rent Exceeds ₹1 Lakh/yr"
              description="If your annual rent exceeds ₹1,00,000 (₹8,333/month), submitting your landlord's PAN to your employer is mandatory under CBDT guidelines to claim Section 10(13A) exemption."
              priority="high"
            />
            <RecommendationCard
              title="Paying Rent to Parents"
              description="If paying rent to parents, maintain formal rent agreements and execute monthly bank transfers. Parents must report the rental income in their income tax return."
              priority="medium"
            />
            <RecommendationCard
              title="City Metro Classification"
              description="Remember that 50% basic ceiling applies ONLY to Delhi, Mumbai, Kolkata, and Chennai. Other major hubs (Bengaluru, Hyderabad, Pune) use the 40% ceiling."
              priority="low"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
