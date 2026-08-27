import { useState, useMemo } from 'preact/hooks';
import { calculateCustomerAcquisitionCostCalculator } from '../../../calculators/business/customer-acquisition-cost-calculator.js';
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

const DEFAULT_CAC_STATE = {
  paidAdSpend: 300000,
  salesSalaries: 250000,
  marketingSalaries: 150000,
  softwareTools: 50000,
  agencyFees: 50000,
  paidCustomers: 200,
  organicCustomers: 100,
  monthlyArpu: 3500,
  grossMarginPct: 75,
  customerLifetimeMonths: 24,
  currencySymbol: '₹',
};

const CAC_PARAM_MAP = {
  paidAdSpend: 'ad',
  salesSalaries: 'sales',
  marketingSalaries: 'mktg',
  softwareTools: 'tools',
  agencyFees: 'agency',
  paidCustomers: 'pcust',
  organicCustomers: 'ocust',
  monthlyArpu: 'arpu',
  grossMarginPct: 'gm',
  customerLifetimeMonths: 'life',
  currencySymbol: 'cur',
};

export default function CustomerAcquisitionCostFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_CAC_STATE, CAC_PARAM_MAP);
  const {
    paidAdSpend,
    salesSalaries,
    marketingSalaries,
    softwareTools,
    agencyFees,
    paidCustomers,
    organicCustomers,
    monthlyArpu,
    grossMarginPct,
    customerLifetimeMonths,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Industry Presets
  const presets = [
    { id: 'b2b_saas', label: 'B2B SaaS (₹15L Spend)', icon: '🏢', paidAdSpend: 500000, salesSalaries: 600000, marketingSalaries: 250000, softwareTools: 100000, agencyFees: 50000, paidCustomers: 10, organicCustomers: 5, monthlyArpu: 50000, grossMarginPct: 80, customerLifetimeMonths: 36, currencySymbol: '₹', desc: '₹1.0L Blended CAC · 2.5 Mo Payback' },
    { id: 'b2c_app', label: 'B2C App (2K Users)', icon: '📱', paidAdSpend: 300000, salesSalaries: 50000, marketingSalaries: 100000, softwareTools: 30000, agencyFees: 20000, paidCustomers: 1500, organicCustomers: 500, monthlyArpu: 100, grossMarginPct: 80, customerLifetimeMonths: 18, currencySymbol: '₹', desc: '₹250 Blended CAC · 3.1 Mo Payback' },
    { id: 'd2c_brand', label: 'D2C Brand (800 Orders)', icon: '🛍️', paidAdSpend: 400000, salesSalaries: 20000, marketingSalaries: 80000, softwareTools: 40000, agencyFees: 60000, paidCustomers: 600, organicCustomers: 200, monthlyArpu: 250, grossMarginPct: 50, customerLifetimeMonths: 12, currencySymbol: '₹', desc: '₹750 Blended CAC · 6.0 Mo Payback' },
    { id: 'fintech', label: 'FinTech (700 Users)', icon: '💳', paidAdSpend: 600000, salesSalaries: 200000, marketingSalaries: 150000, softwareTools: 80000, agencyFees: 70000, paidCustomers: 500, organicCustomers: 200, monthlyArpu: 250, grossMarginPct: 75, customerLifetimeMonths: 24, currencySymbol: '₹', desc: '₹1,571 CAC · 8.4 Mo Payback' },
    { id: 'organic', label: 'Organic Flywheel', icon: '🚀', paidAdSpend: 100000, salesSalaries: 100000, marketingSalaries: 150000, softwareTools: 50000, agencyFees: 50000, paidCustomers: 200, organicCustomers: 800, monthlyArpu: 400, grossMarginPct: 75, customerLifetimeMonths: 24, currencySymbol: '₹', desc: '₹450 Blended CAC · 80% Organic' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('paidAdSpend', p.paidAdSpend);
    setParam('salesSalaries', p.salesSalaries);
    setParam('marketingSalaries', p.marketingSalaries);
    setParam('softwareTools', p.softwareTools);
    setParam('agencyFees', p.agencyFees);
    setParam('paidCustomers', p.paidCustomers);
    setParam('organicCustomers', p.organicCustomers);
    setParam('monthlyArpu', p.monthlyArpu);
    setParam('grossMarginPct', p.grossMarginPct);
    setParam('customerLifetimeMonths', p.customerLifetimeMonths);
    setParam('currencySymbol', p.currencySymbol);
  };

  const results = useMemo(() => {
    return calculateCustomerAcquisitionCostCalculator({
      paidAdSpend,
      salesSalaries,
      marketingSalaries,
      softwareTools,
      agencyFees,
      paidCustomers,
      organicCustomers,
      monthlyArpu,
      grossMarginPct,
      customerLifetimeMonths,
      currencySymbol,
    });
  }, [
    paidAdSpend,
    salesSalaries,
    marketingSalaries,
    softwareTools,
    agencyFees,
    paidCustomers,
    organicCustomers,
    monthlyArpu,
    grossMarginPct,
    customerLifetimeMonths,
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

  // Donut chart items for acquisition expense allocation
  const expenseSegments = results.expenseBreakdown
    .filter((e) => e.amount > 0)
    .map((e) => ({
      label: e.label,
      amount: e.amount,
      colorClass: e.colorClass,
      desc: `${e.pct}% of total acquisition spend.`,
    }));

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Growth Profile & Industry Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🎯 ACQUISITION EFFICIENCY VERDICT
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.ratingColor} bg-surface-strong`}>
            {results.ratingTitle}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Total Acquisition Spend: <strong>{fmt(results.totalAcquisitionSpend)}</strong> · Paid CAC: <strong>{fmt(results.paidCac)}</strong> · Organic Multiplier: <strong>{results.organicMultiplier}x</strong> ({results.organicSharePct}% Organic) · LTV:CAC Ratio: <strong>{results.ltvCacRatio}x</strong>.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Blended CAC</span>
            <span class="text-sm font-bold text-primary">{fmt(results.blendedCac)}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Paid Ad CAC</span>
            <span class="text-sm font-bold text-indigo-600">{fmt(results.paidCac)}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Payback Period</span>
            <span class="text-sm font-bold text-emerald-600">{results.cacPaybackMonths} Months</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Total Customers</span>
            <span class="text-sm font-bold text-ink">{results.totalCustomers.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Acquisition Expenditures</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Itemized Expenses */}
          <div class="space-y-4">
            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber id="ad-input" label="Paid Ad Spend (Google, Meta, etc.)" value={paidAdSpend} min={0} max={100000000} step={10000} prefix={currencySymbol} onChange={(v) => setParam('paidAdSpend', v)} />
              <FormInputNumber id="sales-input" label="Sales Salaries & Commissions" value={salesSalaries} min={0} max={100000000} step={10000} prefix={currencySymbol} onChange={(v) => setParam('salesSalaries', v)} />
              <FormInputNumber id="mktg-input" label="Marketing Team Salaries" value={marketingSalaries} min={0} max={100000000} step={10000} prefix={currencySymbol} onChange={(v) => setParam('marketingSalaries', v)} />
              <FormInputNumber id="tools-input" label="Software & CRM Tools" value={softwareTools} min={0} max={50000000} step={5000} prefix={currencySymbol} onChange={(v) => setParam('softwareTools', v)} />
              <FormInputNumber id="agency-input" label="Agency & Creative Fees" value={agencyFees} min={0} max={50000000} step={5000} prefix={currencySymbol} onChange={(v) => setParam('agencyFees', v)} />
            </div>
          </div>

          {/* Customer Volume & Revenue Metrics */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              👥 CUSTOMER VOLUMES &amp; UNIT MARGINS
            </span>
            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber id="pcust-input" label="Paid Customers Acquired" value={paidCustomers} min={0} max={1000000} step={10} suffix="Users" onChange={(v) => setParam('paidCustomers', v)} />
              <FormInputNumber id="ocust-input" label="Organic / Referral Customers" value={organicCustomers} min={0} max={1000000} step={10} suffix="Users" onChange={(v) => setParam('organicCustomers', v)} />
              <FormInputNumber id="arpu-input" label="Monthly ARPU per Customer" value={monthlyArpu} min={10} max={10000000} step={100} prefix={currencySymbol} onChange={(v) => setParam('monthlyArpu', v)} />
              <FormInputNumber id="gm-input" label="Gross Margin (%)" value={grossMarginPct} min={5} max={100} step={1} suffix="%" onChange={(v) => setParam('grossMarginPct', v)} />
              <FormInputNumber id="life-input" label="Customer Tenure (Months)" value={customerLifetimeMonths} min={1} max={120} step={1} suffix="Mo" onChange={(v) => setParam('customerLifetimeMonths', v)} />
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Blended Customer Acquisition Cost (CAC)"
            primaryValue={fmt(results.blendedCac)}
            secondaryItems={[
              { label: 'Paid Channel CAC', value: fmt(results.paidCac) },
              { label: 'CAC Payback Period', value: `${results.cacPaybackMonths} Months` },
              { label: 'LTV:CAC Ratio', value: isFinite(results.ltvCacRatio) ? `${results.ltvCacRatio}x` : 'Infinite' },
              { label: 'Organic Multiplier', value: `${results.organicMultiplier}x (${results.organicSharePct}% Org)` },
            ]}
          />

          <ResultDonutChart
            title="Acquisition Spend Allocation"
            centerValue={fmt(results.totalAcquisitionSpend)}
            centerSubtext="Total Spend"
            segments={expenseSegments.map((s) => ({ label: s.label, amount: s.amount, colorClass: s.colorClass }))}
          />
        </div>
      </div>

      {/* 4. CAC OPTIMIZATION SCENARIOS MATRIX */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-hairline pb-3">
          <div>
            <h4 class="text-base font-bold font-heading text-ink">CAC Optimization &amp; Scaling Scenarios</h4>
            <p class="text-xs text-muted font-mono mt-0.5">Impact of ad waste reduction, organic referral loops, and sales close rates</p>
          </div>
          <span class="px-3 py-1 bg-primary/10 text-primary rounded-pill text-xs font-bold">
            Baseline CAC: {fmt(results.blendedCac)}
          </span>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {results.optimizationScenarios.map((sc, idx) => (
            <div
              key={idx}
              class={`p-4 rounded-2xl border space-y-2 ${
                idx === 0
                  ? 'bg-surface-strong border-hairline'
                  : 'bg-primary/10 border-2 border-primary/40 shadow-sm'
              }`}
            >
              <span class="text-xs font-bold text-ink block">{sc.scenario}</span>
              <div class="text-xs space-y-1 text-body">
                <div class="flex justify-between"><span>Blended CAC:</span><span class="font-bold text-ink">{fmt(sc.blendedCac)}</span></div>
                <div class="flex justify-between"><span>Payback:</span><span class="font-bold text-primary">{sc.paybackMonths} Mo</span></div>
                <div class="flex justify-between"><span>LTV:CAC:</span><span class="font-bold text-emerald-600">{isFinite(sc.ltvCacRatio) ? `${sc.ltvCacRatio}x` : 'Inf'}</span></div>
              </div>
              <div class="pt-2 border-t border-hairline/60 flex justify-between text-xs">
                <span class="text-muted">Benefit:</span>
                <span class="font-bold text-indigo-600">{sc.savings}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. ITEMISED COST BREAKDOWN */}
      <CostBreakdownCard
        title="Acquisition Budget Itemization"
        subtitle={`Total Outflow: ${fmt(results.totalAcquisitionSpend)} across ${results.totalCustomers.toLocaleString()} customers`}
        items={expenseSegments}
      />

      {/* 6. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 7. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Paid vs Blended CAC Efficiency"
          value={fmt(results.paidCac)}
          subtitle={`Paid CAC is ${fmt(results.paidCac)}. Organic customers reduce your blended CAC down to ${fmt(results.blendedCac)}.`}
          badgeText="Attribution"
          badgeColorClass="bg-primary"
        />
        <InsightCard
          title="Capital Recycling Speed"
          value={`${results.cacPaybackMonths} Mo`}
          subtitle={`Every customer generates ${fmt(results.monthlyMarginPerCustomer)}/mo in gross margin, fully amortizing CAC in ${results.cacPaybackMonths} months.`}
          badgeText="Payback"
          badgeColorClass="bg-semantic-success"
        />
      </div>

      {/* 8. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 ACQUISITION PERFORMANCE EXECUTIVE VOUCHER</span>
          <span class="text-xs text-muted font-mono">{results.totalCustomers.toLocaleString()} ACQUIRED CUSTOMERS</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Blended CAC</span>
            <span class="text-base font-bold text-primary">{fmt(results.blendedCac)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Paid Ad CAC</span>
            <span class="text-base font-bold text-indigo-600">{fmt(results.paidCac)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">CAC Payback</span>
            <span class="text-base font-bold text-emerald-600">{results.cacPaybackMonths} Mo</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Organic Lift</span>
            <span class="text-base font-bold text-amber-600">{results.organicMultiplier}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
