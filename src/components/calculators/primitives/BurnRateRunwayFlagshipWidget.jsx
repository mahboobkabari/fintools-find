import { useState, useMemo } from 'preact/hooks';
import { calculateBurnRateRunwayCalculator } from '../../../calculators/business/burn-rate-runway-calculator.js';
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

const DEFAULT_BURN_STATE = {
  cashBalance: 5000000,
  monthlyRevenue: 400000,
  monthlyPayroll: 600000,
  monthlyMarketing: 150000,
  monthlyServers: 80000,
  monthlyOffice: 50000,
  monthlyOtherExpenses: 20000,
  monthlyRevGrowthPct: 5,
  monthlyExpGrowthPct: 2,
  targetSafetyMonths: 6,
  currencySymbol: '₹',
};

const BURN_PARAM_MAP = {
  cashBalance: 'cash',
  monthlyRevenue: 'rev',
  monthlyPayroll: 'pay',
  monthlyMarketing: 'mkt',
  monthlyServers: 'srv',
  monthlyOffice: 'off',
  monthlyOtherExpenses: 'oth',
  monthlyRevGrowthPct: 'rg',
  monthlyExpGrowthPct: 'eg',
  targetSafetyMonths: 'sm',
  currencySymbol: 'cur',
};

export default function BurnRateRunwayFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_BURN_STATE, BURN_PARAM_MAP);
  const {
    cashBalance,
    monthlyRevenue,
    monthlyPayroll,
    monthlyMarketing,
    monthlyServers,
    monthlyOffice,
    monthlyOtherExpenses,
    monthlyRevGrowthPct,
    monthlyExpGrowthPct,
    targetSafetyMonths,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Startup demographic presets
  const presets = [
    { id: 'pre_seed', label: 'Pre-Seed (₹25L)', icon: '🌱', cashBalance: 2500000, monthlyRevenue: 50000, monthlyPayroll: 250000, monthlyMarketing: 50000, monthlyServers: 20000, monthlyOffice: 20000, monthlyOtherExpenses: 10000, monthlyRevGrowthPct: 10, monthlyExpGrowthPct: 3, targetSafetyMonths: 6, currencySymbol: '₹', desc: '₹3L Net Burn · 8.3 Mo' },
    { id: 'seed', label: 'Seed SaaS (₹1.5 Cr)', icon: '🚀', cashBalance: 15000000, monthlyRevenue: 400000, monthlyPayroll: 900000, monthlyMarketing: 250000, monthlyServers: 100000, monthlyOffice: 80000, monthlyOtherExpenses: 30000, monthlyRevGrowthPct: 8, monthlyExpGrowthPct: 3, targetSafetyMonths: 6, currencySymbol: '₹', desc: '₹9.6L Net Burn · 15.6 Mo' },
    { id: 'series_a', label: 'Series A (₹5.0 Cr)', icon: '🏢', cashBalance: 50000000, monthlyRevenue: 2500000, monthlyPayroll: 4500000, monthlyMarketing: 1500000, monthlyServers: 500000, monthlyOffice: 400000, monthlyOtherExpenses: 200000, monthlyRevGrowthPct: 12, monthlyExpGrowthPct: 4, targetSafetyMonths: 6, currencySymbol: '₹', desc: '₹46L Net Burn · 10.9 Mo' },
    { id: 'profitable', label: 'Profitable (FCF+)', icon: '💰', cashBalance: 5000000, monthlyRevenue: 1200000, monthlyPayroll: 600000, monthlyMarketing: 150000, monthlyServers: 80000, monthlyOffice: 50000, monthlyOtherExpenses: 20000, monthlyRevGrowthPct: 5, monthlyExpGrowthPct: 2, targetSafetyMonths: 6, currencySymbol: '₹', desc: 'Default Alive · +₹3L FCF' },
    { id: 'urgent', label: 'Bridge Needed', icon: '⚠️', cashBalance: 1500000, monthlyRevenue: 200000, monthlyPayroll: 600000, monthlyMarketing: 100000, monthlyServers: 50000, monthlyOffice: 50000, monthlyOtherExpenses: 20000, monthlyRevGrowthPct: 3, monthlyExpGrowthPct: 0, targetSafetyMonths: 6, currencySymbol: '₹', desc: 'Critical Alert · 2.4 Mo' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('cashBalance', p.cashBalance);
    setParam('monthlyRevenue', p.monthlyRevenue);
    setParam('monthlyPayroll', p.monthlyPayroll);
    setParam('monthlyMarketing', p.monthlyMarketing);
    setParam('monthlyServers', p.monthlyServers);
    setParam('monthlyOffice', p.monthlyOffice);
    setParam('monthlyOtherExpenses', p.monthlyOtherExpenses);
    setParam('monthlyRevGrowthPct', p.monthlyRevGrowthPct);
    setParam('monthlyExpGrowthPct', p.monthlyExpGrowthPct);
    setParam('targetSafetyMonths', p.targetSafetyMonths);
    setParam('currencySymbol', p.currencySymbol);
  };

  const results = useMemo(() => {
    return calculateBurnRateRunwayCalculator({
      cashBalance,
      monthlyRevenue,
      monthlyPayroll,
      monthlyMarketing,
      monthlyServers,
      monthlyOffice,
      monthlyOtherExpenses,
      monthlyRevGrowthPct,
      monthlyExpGrowthPct,
      targetSafetyMonths,
      currencySymbol,
    });
  }, [
    cashBalance,
    monthlyRevenue,
    monthlyPayroll,
    monthlyMarketing,
    monthlyServers,
    monthlyOffice,
    monthlyOtherExpenses,
    monthlyRevGrowthPct,
    monthlyExpGrowthPct,
    targetSafetyMonths,
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

  // Donut chart items for gross operating expenses
  const expenseBreakdownItems = [
    { label: `Payroll & Team (${results.payrollPct}%)`, amount: results.payroll, colorClass: 'bg-primary', desc: 'Full-time salaries, contractors & employee benefits.' },
    { label: `Marketing & Ads (${results.marketingPct}%)`, amount: results.marketing, colorClass: 'bg-indigo-600', desc: 'Customer acquisition, paid ads & growth sponsorships.' },
    { label: `Cloud & SaaS Tools (${results.serversPct}%)`, amount: results.servers, colorClass: 'bg-amber-500', desc: 'AWS/GCP infrastructure, software licenses & APIs.' },
    { label: `Office & Travel (${results.officePct}%)`, amount: results.office, colorClass: 'bg-emerald-500', desc: 'Rent, co-working desks, utilities & business travel.' },
    { label: `Legal & Other (${results.otherPct}%)`, amount: results.otherExpenses, colorClass: 'bg-slate-500', desc: 'Accounting, compliance, legal fees & miscellaneous.' },
  ].filter((item) => item.amount > 0);

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Startup Funding Stage & Profile" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🔥 STARTUP RUNWAY & SOLVENCY VERDICT
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.alertColor} bg-surface-strong`}>
            {results.alertTitle}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Gross Burn: <strong>{fmt(results.grossBurn)}/mo</strong> · Net Burn: <strong>{fmt(results.netBurn)}/mo</strong> · Treasury: <strong>{fmt(results.cashBalance)}</strong> · Default Alive: <strong>{results.isDefaultAlive ? 'YES' : 'NO (Bridge Needed)'}</strong>.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Static Runway</span>
            <span class="text-sm font-bold text-primary">
              {results.isProfitable ? 'Infinite' : `${results.staticRunwayMonths} Mo`}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Monthly Net Burn</span>
            <span class="text-sm font-bold text-rose-600">
              {results.isProfitable ? `+${fmt(Math.abs(results.netBurn))} FCF` : fmt(results.netBurn)}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Monthly Revenue</span>
            <span class="text-sm font-bold text-emerald-600">{fmt(results.monthlyRevenue)}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Fundraising Target Gap</span>
            <span class="text-sm font-bold text-amber-600">
              {results.cashNeededForBuffer > 0 ? fmt(results.cashNeededForBuffer) : 'Buffer Met'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Treasury & Itemized Outflow Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Cash Treasury & Inflows</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <FormInputNumber
              id="cash-input"
              label="Current Bank Cash Balance"
              value={cashBalance}
              min={0}
              max={1000000000}
              step={100000}
              prefix={currencySymbol}
              onChange={(v) => setParam('cashBalance', v)}
            />
            <FormInputNumber
              id="rev-input"
              label="Monthly Revenue / Collections"
              value={monthlyRevenue}
              min={0}
              max={500000000}
              step={25000}
              prefix={currencySymbol}
              onChange={(v) => setParam('monthlyRevenue', v)}
            />
          </div>

          {/* Itemized Expenses (Gross Burn) */}
          <div class="space-y-4 pt-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider">
                💸 GROSS MONTHLY EXPENSES ({fmt(results.grossBurn)}/mo)
              </span>
              <span class="text-[11px] font-mono text-muted font-bold">Itemized Outflows</span>
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber id="pay-input" label="Payroll & Contractor Salaries" value={monthlyPayroll} min={0} max={500000000} step={50000} prefix={currencySymbol} onChange={(v) => setParam('monthlyPayroll', v)} />
              <FormInputNumber id="mkt-input" label="Marketing, Ads & CAC" value={monthlyMarketing} min={0} max={200000000} step={25000} prefix={currencySymbol} onChange={(v) => setParam('monthlyMarketing', v)} />
              <FormInputNumber id="srv-input" label="Cloud, Servers & SaaS Tools" value={monthlyServers} min={0} max={100000000} step={10000} prefix={currencySymbol} onChange={(v) => setParam('monthlyServers', v)} />
              <FormInputNumber id="off-input" label="Office, Rent & Travel" value={monthlyOffice} min={0} max={50000000} step={10000} prefix={currencySymbol} onChange={(v) => setParam('monthlyOffice', v)} />
              <FormInputNumber id="oth-input" label="Legal, Admin & Misc" value={monthlyOtherExpenses} min={0} max={50000000} step={5000} prefix={currencySymbol} onChange={(v) => setParam('monthlyOtherExpenses', v)} />
              <FormInputNumber id="buf-input" label="Fundraising Buffer (Months)" value={targetSafetyMonths} min={1} max={24} step={1} suffix="Mo" onChange={(v) => setParam('targetSafetyMonths', v)} />
            </div>
          </div>

          {/* Growth Assumptions */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              📈 TRAJECTORY & GROWTH ASSUMPTIONS (MoM)
            </span>
            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber id="rg-input" label="MoM Revenue Growth (%)" value={monthlyRevGrowthPct} min={-50} max={100} step={1} suffix="%" onChange={(v) => setParam('monthlyRevGrowthPct', v)} />
              <FormInputNumber id="eg-input" label="MoM Expense Growth / Inflation (%)" value={monthlyExpGrowthPct} min={-50} max={50} step={1} suffix="%" onChange={(v) => setParam('monthlyExpGrowthPct', v)} />
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Estimated Cash Runway"
            primaryValue={results.isProfitable ? 'Infinite' : `${results.staticRunwayMonths} Months`}
            secondaryItems={[
              { label: 'Net Monthly Burn Rate', value: results.isProfitable ? `+${fmt(Math.abs(results.netBurn))} FCF` : fmt(results.netBurn) },
              { label: 'Gross Monthly Outflow', value: fmt(results.grossBurn) },
              { label: 'Monthly Cash Inflow', value: fmt(results.monthlyRevenue) },
              { label: 'Capital Needed for Buffer', value: results.cashNeededForBuffer > 0 ? fmt(results.cashNeededForBuffer) : '₹0 (Safe)' },
            ]}
          />

          <ResultDonutChart
            title="Gross Operating Expenses Distribution"
            centerValue={fmt(results.grossBurn)}
            centerSubtext="Monthly Gross Burn"
            segments={expenseBreakdownItems.map((c) => ({ label: c.label, amount: c.amount, colorClass: c.colorClass }))}
          />
        </div>
      </div>

      {/* 4. COST-CUTTING RUNWAY EXTENSION MATRIX */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-hairline pb-3">
          <div>
            <h4 class="text-base font-bold font-heading text-ink">OpEx Reduction & Runway Extension Scenarios</h4>
            <p class="text-xs text-muted font-mono mt-0.5">How trimming monthly burn buys extra operating months for your startup</p>
          </div>
          <span class="px-3 py-1 bg-primary/10 text-primary rounded-pill text-xs font-bold">
            Baseline: {results.isProfitable ? 'Profitable' : `${results.staticRunwayMonths} Mo`}
          </span>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {results.runwayScenarios.map((sc, idx) => (
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
                <div class="flex justify-between"><span>Gross Burn:</span><span class="font-bold text-ink">{fmt(sc.grossBurn)}</span></div>
                <div class="flex justify-between"><span>Net Burn:</span><span class="font-bold text-rose-600">{fmt(sc.netBurn)}</span></div>
                <div class="flex justify-between"><span>Runway:</span><span class="font-bold text-primary">{sc.runwayMonths}</span></div>
              </div>
              <div class="pt-2 border-t border-hairline/60 flex justify-between text-xs">
                <span class="text-muted">Extension:</span>
                <span class="font-bold text-emerald-600">{sc.extendedBy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. DYNAMIC 12-MONTH CASH DEPLETION SCHEDULE */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono overflow-x-auto">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <h4 class="text-base font-bold font-heading text-ink">12-Month Cash Depletion & Trajectory Schedule</h4>
          <span class="text-xs text-muted">MoM Rev Growth: {monthlyRevGrowthPct}%</span>
        </div>

        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-hairline text-muted uppercase font-bold">
              <th class="py-2.5 px-3">Month</th>
              <th class="py-2.5 px-3 text-right">Revenue</th>
              <th class="py-2.5 px-3 text-right">Gross Burn</th>
              <th class="py-2.5 px-3 text-right">Net Burn</th>
              <th class="py-2.5 px-3 text-right">Ending Treasury Cash</th>
              <th class="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-hairline/60">
            {results.monthlyTrajectory.slice(0, 12).map((row) => (
              <tr key={row.month} class="hover:bg-surface-soft transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">Month {row.month}</td>
                <td class="py-2.5 px-3 text-right text-emerald-600 font-semibold">{fmt(row.revenue)}</td>
                <td class="py-2.5 px-3 text-right text-rose-600 font-semibold">{fmt(row.grossBurn)}</td>
                <td class="py-2.5 px-3 text-right font-bold text-ink">{fmt(row.netBurn)}</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-primary">{fmt(row.endingCash)}</td>
                <td class="py-2.5 px-3 text-right">
                  {row.isBreakeven ? (
                    <span class="px-2 py-0.5 rounded-pill bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">PROFITABLE</span>
                  ) : row.endingCash === 0 ? (
                    <span class="px-2 py-0.5 rounded-pill bg-rose-500/10 text-rose-600 font-bold text-[10px]">ZERO CASH</span>
                  ) : (
                    <span class="px-2 py-0.5 rounded-pill bg-blue-500/10 text-primary font-bold text-[10px]">ACTIVE</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. COST BREAKDOWN */}
      <CostBreakdownCard
        title="Monthly Operating Outflows Breakdown"
        subtitle={`Total Gross Burn: ${fmt(results.grossBurn)}/mo`}
        items={expenseBreakdownItems}
      />

      {/* 7. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 8. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Payroll Cost Concentration"
          value={`${results.payrollPct}%`}
          subtitle={`Payroll consumes ${fmt(results.payroll)} of your monthly gross burn.`}
          badgeText="Team OpEx"
          badgeColorClass="bg-primary"
        />
        <InsightCard
          title="Safety Buffer Horizon"
          value={results.isProfitable ? 'Safe' : `${results.staticRunwayMonths} Mo`}
          subtitle={results.cashNeededForBuffer > 0 ? `Raise ${fmt(results.cashNeededForBuffer)} to secure a 6-month buffer.` : 'Current treasury covers your target safety buffer.'}
          badgeText="Fundraising"
          badgeColorClass={results.cashNeededForBuffer > 0 ? 'bg-semantic-warning' : 'bg-semantic-success'}
        />
      </div>

      {/* 9. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 STARTUP SOLVENCY & TREASURY SUMMARY</span>
          <span class="text-xs text-muted font-mono">EXECUTIVE BOARD METRICS</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Cash Treasury</span>
            <span class="text-base font-bold text-ink">{fmt(results.cashBalance)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Gross Burn</span>
            <span class="text-base font-bold text-rose-600">{fmt(results.grossBurn)}/mo</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Monthly Revenue</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.monthlyRevenue)}/mo</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Cash Runway</span>
            <span class="text-base font-bold text-primary">{results.isProfitable ? 'Infinite' : `${results.staticRunwayMonths} Mo`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
