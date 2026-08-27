import { useState, useMemo } from 'preact/hooks';
import { calculateCustomerLifetimeValueCalculator } from '../../../calculators/business/customer-lifetime-value-calculator.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_CLV_STATE = {
  businessModel: 'saas',
  arpu: 3500,
  monthlyChurnPct: 3.5,
  aov: 2500,
  purchaseFrequency: 4,
  customerLifespanYears: 3,
  grossMarginPct: 75,
  cac: 15000,
  annualDiscountRate: 10,
  cohortSize: 1000,
  currencySymbol: '₹',
};

const CLV_PARAM_MAP = {
  businessModel: 'bm',
  arpu: 'arpu',
  monthlyChurnPct: 'churn',
  aov: 'aov',
  purchaseFrequency: 'freq',
  customerLifespanYears: 'life',
  grossMarginPct: 'gm',
  cac: 'cac',
  annualDiscountRate: 'disc',
  cohortSize: 'cs',
  currencySymbol: 'cur',
};

export default function CustomerLifetimeValueFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_CLV_STATE, CLV_PARAM_MAP);
  const {
    businessModel,
    arpu,
    monthlyChurnPct,
    aov,
    purchaseFrequency,
    customerLifespanYears,
    grossMarginPct,
    cac,
    annualDiscountRate,
    cohortSize,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Industry Presets
  const presets = [
    { id: 'b2b_saas', label: 'B2B SaaS (₹50K)', icon: '🏢', businessModel: 'saas', arpu: 50000, monthlyChurnPct: 1.5, grossMarginPct: 80, cac: 120000, annualDiscountRate: 10, cohortSize: 100, currencySymbol: '₹', desc: '₹26.7L LTV · 22.2x LTV:CAC' },
    { id: 'b2c_app', label: 'B2C App (₹499)', icon: '📱', businessModel: 'saas', arpu: 499, monthlyChurnPct: 5.0, grossMarginPct: 85, cac: 2000, annualDiscountRate: 10, cohortSize: 2000, currencySymbol: '₹', desc: '₹8,483 LTV · 4.2x LTV:CAC' },
    { id: 'd2c_ecommerce', label: 'D2C Brand (₹2.5K)', icon: '🛍️', businessModel: 'ecommerce', aov: 2500, purchaseFrequency: 3.5, customerLifespanYears: 3, grossMarginPct: 60, cac: 3500, annualDiscountRate: 10, cohortSize: 1000, currencySymbol: '₹', desc: '₹15.8K LTV · 4.5x LTV:CAC' },
    { id: 'fintech', label: 'FinTech (₹1.2K)', icon: '💳', businessModel: 'saas', arpu: 1200, monthlyChurnPct: 2.0, grossMarginPct: 70, cac: 8000, annualDiscountRate: 10, cohortSize: 1000, currencySymbol: '₹', desc: '₹42K LTV · 5.2x LTV:CAC' },
    { id: 'freemium', label: 'Freemium (₹999)', icon: '⚡', businessModel: 'saas', arpu: 999, monthlyChurnPct: 8.0, grossMarginPct: 75, cac: 4500, annualDiscountRate: 10, cohortSize: 1500, currencySymbol: '₹', desc: '₹9.4K LTV · 2.1x LTV:CAC' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('businessModel', p.businessModel);
    if (p.businessModel === 'ecommerce') {
      setParam('aov', p.aov);
      setParam('purchaseFrequency', p.purchaseFrequency);
      setParam('customerLifespanYears', p.customerLifespanYears);
    } else {
      setParam('arpu', p.arpu);
      setParam('monthlyChurnPct', p.monthlyChurnPct);
    }
    setParam('grossMarginPct', p.grossMarginPct);
    setParam('cac', p.cac);
    setParam('annualDiscountRate', p.annualDiscountRate);
    setParam('cohortSize', p.cohortSize);
    setParam('currencySymbol', p.currencySymbol);
  };

  const results = useMemo(() => {
    return calculateCustomerLifetimeValueCalculator({
      businessModel,
      arpu,
      monthlyChurnPct,
      aov,
      purchaseFrequency,
      customerLifespanYears,
      grossMarginPct,
      cac,
      annualDiscountRate,
      cohortSize,
      currencySymbol,
    });
  }, [
    businessModel,
    arpu,
    monthlyChurnPct,
    aov,
    purchaseFrequency,
    customerLifespanYears,
    grossMarginPct,
    cac,
    annualDiscountRate,
    cohortSize,
    currencySymbol,
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

  const fmt = (val) => `${currencySymbol}${Number(val).toLocaleString()}`;

  // Donut chart items: Profit vs CAC vs COGS distribution
  const cogsPerCustomer = Math.max(0, results.grossLtv - results.netLtv);
  const ltvCompositionItems = [
    { label: `Net Customer Profit`, amount: Math.max(0, results.netCustomerProfit), colorClass: 'bg-emerald-500', desc: 'Net cash profit per acquired customer after CAC and COGS.' },
    { label: `Customer Acquisition Cost (CAC)`, amount: results.cac, colorClass: 'bg-rose-500', desc: 'Blended sales, marketing and onboarding acquisition cost.' },
    { label: `Cost of Goods Sold (COGS)`, amount: cogsPerCustomer, colorClass: 'bg-slate-400', desc: 'Cloud hosting, support, payment gateway fees & delivery.' },
  ].filter((item) => item.amount > 0);

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Business Model & Industry Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            💎 UNIT ECONOMICS & LTV VERDICT
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.ratingColor} bg-surface-strong`}>
            {results.ratingTitle}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Gross LTV: <strong>{fmt(results.grossLtv)}</strong> · Net LTV (Margin Adjusted): <strong>{fmt(results.netLtv)}</strong> · DCF Discounted LTV: <strong>{fmt(results.discountedLtv)}</strong> · Avg Lifespan: <strong>{results.averageLifespanMonths} Months</strong>.
        </p>

        {/* Business Model Selector */}
        <div class="pt-3 border-t border-hairline/60 flex items-center gap-2 flex-wrap">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-muted mr-1">Model:</span>
          <button
            type="button"
            onClick={() => setParam('businessModel', 'saas')}
            class={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              businessModel === 'saas'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-canvas hover:bg-surface-soft border border-hairline text-ink'
            }`}
          >
            SaaS / Subscription (ARPU &amp; Churn)
          </button>
          <button
            type="button"
            onClick={() => setParam('businessModel', 'ecommerce')}
            class={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              businessModel === 'ecommerce'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-canvas hover:bg-surface-soft border border-hairline text-ink'
            }`}
          >
            E-Commerce / Retail (AOV &amp; Frequency)
          </button>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">
              {businessModel === 'ecommerce' ? 'E-Commerce Order Metrics' : 'SaaS Subscription Metrics'}
            </h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {businessModel === 'ecommerce' ? (
            <div class="space-y-4">
              <div class="grid sm:grid-cols-2 gap-3">
                <FormInputNumber id="aov-input" label="Average Order Value (AOV)" value={aov} min={10} max={1000000} step={100} prefix={currencySymbol} onChange={(v) => setParam('aov', v)} />
                <FormInputNumber id="freq-input" label="Orders Per Customer / Year" value={purchaseFrequency} min={0.5} max={100} step={0.5} suffix="Orders" onChange={(v) => setParam('purchaseFrequency', v)} />
              </div>
              <FormInputNumber id="life-input" label="Average Customer Lifespan" value={customerLifespanYears} min={0.5} max={20} step={0.5} suffix="Years" onChange={(v) => setParam('customerLifespanYears', v)} />
            </div>
          ) : (
            <div class="space-y-4">
              <div class="grid sm:grid-cols-2 gap-3">
                <FormInputNumber id="arpu-input" label="Monthly ARPU / Account Revenue" value={arpu} min={10} max={10000000} step={100} prefix={currencySymbol} onChange={(v) => setParam('arpu', v)} />
                <FormInputNumber id="churn-input" label="Monthly Customer Churn Rate" value={monthlyChurnPct} min={0.1} max={50} step={0.1} suffix="%" onChange={(v) => setParam('monthlyChurnPct', v)} />
              </div>
            </div>
          )}

          {/* Unit Economics Margins & CAC */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              💰 MARGINS, ACQUISITION COST &amp; DISCOUNTING
            </span>
            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber id="gm-input" label="Gross Margin (%)" value={grossMarginPct} min={5} max={100} step={1} suffix="%" onChange={(v) => setParam('grossMarginPct', v)} />
              <FormInputNumber id="cac-input" label="Customer Acquisition Cost (CAC)" value={cac} min={0} max={10000000} step={500} prefix={currencySymbol} onChange={(v) => setParam('cac', v)} />
              <FormInputNumber id="disc-input" label="Annual Cost of Capital (Discount %)" value={annualDiscountRate} min={0} max={40} step={0.5} suffix="%" onChange={(v) => setParam('annualDiscountRate', v)} />
              <FormInputNumber id="cs-input" label="Cohort Sample Size (Users)" value={cohortSize} min={50} max={50000} step={50} suffix="Users" onChange={(v) => setParam('cohortSize', v)} />
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Net Customer Lifetime Value (LTV)"
            primaryValue={fmt(results.netLtv)}
            secondaryItems={[
              { label: 'LTV:CAC Ratio', value: isFinite(results.ltvCacRatio) ? `${results.ltvCacRatio}x` : 'Infinite' },
              { label: 'CAC Payback Period', value: `${results.cacPaybackMonths} Months` },
              { label: 'Net Profit Per Customer', value: fmt(results.netCustomerProfit) },
              { label: 'Discounted DCF LTV', value: fmt(results.discountedLtv) },
            ]}
          />

          <ResultDonutChart
            title="Gross LTV Value Distribution"
            centerValue={fmt(results.grossLtv)}
            centerSubtext="Gross LTV"
            segments={ltvCompositionItems.map((c) => ({ label: c.label, amount: c.amount, colorClass: c.colorClass }))}
          />
        </div>
      </div>

      {/* 4. SENSITIVITY & GROWTH LEVERS MATRIX */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-hairline pb-3">
          <div>
            <h4 class="text-base font-bold font-heading text-ink">Growth Levers &amp; Sensitivity Matrix</h4>
            <p class="text-xs text-muted font-mono mt-0.5">How pricing, churn reduction, and CAC efficiency scale enterprise value</p>
          </div>
          <span class="px-3 py-1 bg-primary/10 text-primary rounded-pill text-xs font-bold">
            Baseline LTV: {fmt(results.netLtv)}
          </span>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {results.sensitivityLevers.map((sc, idx) => (
            <div
              key={idx}
              class={`p-4 rounded-2xl border space-y-2 ${
                idx === 0
                  ? 'bg-surface-strong border-hairline'
                  : 'bg-primary/10 border-2 border-primary/40 shadow-sm'
              }`}
            >
              <span class="text-xs font-bold text-ink block">{sc.lever}</span>
              <div class="text-xs space-y-1 text-body">
                <div class="flex justify-between"><span>Net LTV:</span><span class="font-bold text-ink">{fmt(sc.netLtv)}</span></div>
                <div class="flex justify-between"><span>LTV:CAC:</span><span class="font-bold text-emerald-600">{isFinite(sc.ltvCacRatio) ? `${sc.ltvCacRatio}x` : 'Inf'}</span></div>
                <div class="flex justify-between"><span>Payback:</span><span class="font-bold text-primary">{sc.cacPaybackMonths} Mo</span></div>
              </div>
              <div class="pt-2 border-t border-hairline/60 flex justify-between text-xs">
                <span class="text-muted">Impact:</span>
                <span class="font-bold text-indigo-600">{sc.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 12-MONTH COHORT RETENTION SCHEDULE */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono overflow-x-auto">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <h4 class="text-base font-bold font-heading text-ink">12-Month Cohort Retention &amp; Value Schedule</h4>
          <span class="text-xs text-muted">Cohort: {cohortSize.toLocaleString()} Users (Initial CAC: {fmt(cohortSize * cac)})</span>
        </div>

        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-hairline text-muted uppercase font-bold">
              <th class="py-2.5 px-3">Month</th>
              <th class="py-2.5 px-3 text-right">Active Customers</th>
              <th class="py-2.5 px-3 text-right">Retention %</th>
              <th class="py-2.5 px-3 text-right">Monthly Revenue</th>
              <th class="py-2.5 px-3 text-right">Cumulative Gross Profit</th>
              <th class="py-2.5 px-3 text-right">Net Cohort Value</th>
              <th class="py-2.5 px-3 text-right">Payback Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-hairline/60">
            {results.cohortSchedule.map((row) => (
              <tr key={row.month} class="hover:bg-surface-soft transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">Month {row.month}</td>
                <td class="py-2.5 px-3 text-right font-semibold text-ink">{row.activeCustomers.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-right text-muted">{row.retentionPct}%</td>
                <td class="py-2.5 px-3 text-right font-semibold text-primary">{fmt(row.monthlyRevenue)}</td>
                <td class="py-2.5 px-3 text-right font-bold text-emerald-600">{fmt(row.cumulativeGrossProfit)}</td>
                <td class={`py-2.5 px-3 text-right font-mono font-bold ${row.netCohortValue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {fmt(row.netCohortValue)}
                </td>
                <td class="py-2.5 px-3 text-right">
                  {row.isPaybackAchieved ? (
                    <span class="px-2 py-0.5 rounded-pill bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">PAYBACK MET</span>
                  ) : (
                    <span class="px-2 py-0.5 rounded-pill bg-amber-500/10 text-amber-600 font-bold text-[10px]">RECOVERING</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. COST BREAKDOWN */}
      <CostBreakdownCard
        title="Customer Value & Acquisition Cost Breakdown"
        subtitle={`Gross Revenue Generated per Customer: ${fmt(results.grossLtv)}`}
        items={ltvCompositionItems}
      />

      {/* 7. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 8. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="LTV:CAC Unit Efficiency"
          value={isFinite(results.ltvCacRatio) ? `${results.ltvCacRatio}x` : 'Infinite'}
          subtitle={`Every ${currencySymbol}1 invested in customer acquisition returns ${currencySymbol}${results.ltvCacRatio} in net gross profit.`}
          badgeText="Efficiency"
          badgeColorClass="bg-semantic-success"
        />
        <InsightCard
          title="Customer Retention Horizon"
          value={`${results.averageLifespanMonths} Mo`}
          subtitle={`Average customer remains active for ${results.averageLifespanMonths} months generating ${fmt(results.monthlyMarginPerCustomer)}/mo in margin.`}
          badgeText="Retention"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 9. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 UNIT ECONOMICS EXECUTIVE SUMMARY</span>
          <span class="text-xs text-muted font-mono">{businessModel.toUpperCase()} MODEL</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Net LTV</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.netLtv)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Blended CAC</span>
            <span class="text-base font-bold text-rose-600">{fmt(results.cac)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">LTV:CAC Ratio</span>
            <span class="text-base font-bold text-primary">{isFinite(results.ltvCacRatio) ? `${results.ltvCacRatio}x` : 'Inf'}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">CAC Payback</span>
            <span class="text-base font-bold text-indigo-600">{results.cacPaybackMonths} Mo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
