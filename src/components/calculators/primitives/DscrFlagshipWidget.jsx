import { useState, useMemo } from 'preact/hooks';
import { calculateDebtServiceCoverageRatioCalculator } from '../../../calculators/business/debt-service-coverage-ratio-calculator.js';
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

const DEFAULT_DSCR_STATE = {
  calculationMode: 'direct',
  netOperatingIncome: 6000000,
  grossRevenue: 10000000,
  vacancyLossPct: 5,
  operatingExpenses: 3500000,
  annualPrincipal: 2500000,
  annualInterest: 1500000,
  annualLeaseObligations: 0,
  targetDscrBenchmark: 1.25,
  loanInterestRate: 8.5,
  loanTenureYears: 10,
  currencySymbol: '₹',
};

const DSCR_PARAM_MAP = {
  calculationMode: 'mode',
  netOperatingIncome: 'noi',
  grossRevenue: 'rev',
  vacancyLossPct: 'vac',
  operatingExpenses: 'opex',
  annualPrincipal: 'prin',
  annualInterest: 'int',
  targetDscrBenchmark: 'tgt',
  loanInterestRate: 'rate',
  loanTenureYears: 'ten',
  currencySymbol: 'cur',
};

export default function DscrFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_DSCR_STATE, DSCR_PARAM_MAP);
  const {
    calculationMode,
    netOperatingIncome,
    grossRevenue,
    vacancyLossPct,
    operatingExpenses,
    annualPrincipal,
    annualInterest,
    annualLeaseObligations,
    targetDscrBenchmark,
    loanInterestRate,
    loanTenureYears,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Presets
  const presets = [
    { id: 'cre_multifamily', label: 'CRE Multifamily', icon: '🏢', calculationMode: 'real_estate', grossRevenue: 12000000, vacancyLossPct: 5, operatingExpenses: 3500000, annualPrincipal: 2500000, annualInterest: 1500000, targetDscrBenchmark: 1.25, loanInterestRate: 8.5, loanTenureYears: 15, currencySymbol: '₹', desc: '1.98x DSCR · Commercial Real Estate' },
    { id: 'corporate_term', label: 'Corporate Term Loan', icon: '🏭', calculationMode: 'direct', netOperatingIncome: 8000000, annualPrincipal: 4500000, annualInterest: 1800000, targetDscrBenchmark: 1.25, loanInterestRate: 9.0, loanTenureYears: 7, currencySymbol: '₹', desc: '1.27x DSCR · Capex Expansion' },
    { id: 'msme_business', label: 'MSME Business Loan', icon: '🏪', calculationMode: 'direct', netOperatingIncome: 3500000, annualPrincipal: 1400000, annualInterest: 800000, targetDscrBenchmark: 1.20, loanInterestRate: 10.0, loanTenureYears: 5, currencySymbol: '₹', desc: '1.59x DSCR · Small Business' },
    { id: 'industrial_logistics', label: 'Industrial Warehouse', icon: '📦', calculationMode: 'real_estate', grossRevenue: 25000000, vacancyLossPct: 3, operatingExpenses: 5000000, annualPrincipal: 7500000, annualInterest: 4500000, targetDscrBenchmark: 1.30, loanInterestRate: 8.25, loanTenureYears: 15, currencySymbol: '₹', desc: '1.60x DSCR · Logistics Facility' },
    { id: 'lbo_acquisition', label: 'LBO / Private Equity', icon: '💼', calculationMode: 'direct', netOperatingIncome: 50000000, annualPrincipal: 25000000, annualInterest: 13000000, targetDscrBenchmark: 1.25, loanInterestRate: 9.5, loanTenureYears: 7, currencySymbol: '₹', desc: '1.32x DSCR · Leveraged Buyout' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    Object.keys(p).forEach((key) => {
      if (key !== 'id' && key !== 'label' && key !== 'icon' && key !== 'desc') {
        setParam(key, p[key]);
      }
    });
  };

  const results = useMemo(() => {
    return calculateDebtServiceCoverageRatioCalculator({
      calculationMode,
      netOperatingIncome,
      grossRevenue,
      vacancyLossPct,
      operatingExpenses,
      annualPrincipal,
      annualInterest,
      annualLeaseObligations,
      targetDscrBenchmark,
      loanInterestRate,
      loanTenureYears,
      currencySymbol,
    });
  }, [
    calculationMode,
    netOperatingIncome,
    grossRevenue,
    vacancyLossPct,
    operatingExpenses,
    annualPrincipal,
    annualInterest,
    annualLeaseObligations,
    targetDscrBenchmark,
    loanInterestRate,
    loanTenureYears,
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

  const debtSegments = results.debtBreakdownList
    .filter((d) => d.amount > 0)
    .map((d) => ({
      label: d.label,
      amount: d.amount,
      colorClass: d.colorClass,
      desc: fmt(d.amount),
    }));

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Commercial Lending or Real Estate Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            📊 DEBT UNDERWRITING &amp; COVENANT INTELLIGENCE
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.healthColor} bg-surface-strong`}>
            {results.healthTitle}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Effective NOI: <strong>{fmt(results.effectiveNoi)}</strong> · Total Debt Service: <strong>{fmt(results.totalDebtService)}</strong> · Interest Coverage (ICR): <strong>{results.icr}x</strong> · Max Supportable Debt: <strong>{fmt(results.maxSupportableLoanAmount)}</strong>.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">DSCR Ratio</span>
            <span class={`text-sm font-bold ${results.dscr >= targetDscrBenchmark ? 'text-primary' : 'text-rose-600'}`}>
              {results.dscr}x
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Net Free Cash Flow</span>
            <span class={`text-sm font-bold ${results.cashFlowSurplus >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fmt(results.cashFlowSurplus)}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Max Loan Capacity</span>
            <span class="text-sm font-bold text-ink">{fmt(results.maxSupportableLoanAmount)}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Revenue Cushion</span>
            <span class="text-sm font-bold text-indigo-600">{results.revenueDeclineTolerancePct}%</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Operating &amp; Debt Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Calculation Mode Toggle */}
          <div class="space-y-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
              Operating Income Input Mode
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'direct', label: 'Direct NOI / CFADS' },
                { id: 'real_estate', label: 'Real Estate Rental' },
                { id: 'itemized', label: 'Itemized P&amp;L' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setParam('calculationMode', mode.id)}
                  class={`p-2.5 rounded-xl border text-center font-mono text-xs transition-all ${
                    calculationMode === mode.id
                      ? 'bg-primary text-white border-primary font-bold shadow-sm'
                      : 'bg-surface-soft border-hairline text-body hover:border-primary/50'
                  }`}
                >
                  <span dangerouslySetInnerHTML={{ __html: mode.label }} />
                </button>
              ))}
            </div>
          </div>

          {/* Mode 1: Direct NOI */}
          {calculationMode === 'direct' && (
            <div class="space-y-2 pt-2">
              <FormInputNumber
                id="direct-noi"
                label="Net Operating Income (NOI / EBITDA)"
                value={netOperatingIncome}
                min={0}
                max={10000000000}
                step={250000}
                prefix={currencySymbol}
                onChange={(v) => setParam('netOperatingIncome', v)}
              />
            </div>
          )}

          {/* Mode 2 & 3: Real Estate / Itemized */}
          {(calculationMode === 'real_estate' || calculationMode === 'itemized') && (
            <div class="space-y-3 pt-2">
              <FormInputNumber
                id="gross-rev"
                label={calculationMode === 'real_estate' ? 'Gross Scheduled Rental Income' : 'Gross Annual Revenue'}
                value={grossRevenue}
                min={0}
                max={10000000000}
                step={500000}
                prefix={currencySymbol}
                onChange={(v) => setParam('grossRevenue', v)}
              />
              <div class="grid sm:grid-cols-2 gap-3">
                <FormInputNumber
                  id="vac-pct"
                  label="Vacancy &amp; Credit Loss"
                  value={vacancyLossPct}
                  min={0}
                  max={30}
                  step={0.5}
                  suffix="%"
                  onChange={(v) => setParam('vacancyLossPct', v)}
                />
                <FormInputNumber
                  id="opex-val"
                  label="Operating Expenses (OPEX)"
                  value={operatingExpenses}
                  min={0}
                  max={5000000000}
                  step={250000}
                  prefix={currencySymbol}
                  onChange={(v) => setParam('operatingExpenses', v)}
                />
              </div>
            </div>
          )}

          {/* Debt Service Components */}
          <div class="space-y-3 pt-4 border-t border-hairline">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
              Annual Debt Service Obligations
            </span>
            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber
                id="ann-prin"
                label="Annual Principal Repayments"
                value={annualPrincipal}
                min={0}
                max={5000000000}
                step={100000}
                prefix={currencySymbol}
                onChange={(v) => setParam('annualPrincipal', v)}
              />
              <FormInputNumber
                id="ann-int"
                label="Annual Interest Expense"
                value={annualInterest}
                min={0}
                max={5000000000}
                step={100000}
                prefix={currencySymbol}
                onChange={(v) => setParam('annualInterest', v)}
              />
            </div>
            <FormInputNumber
              id="ann-lease"
              label="Annual Lease / Other Debt Obligations"
              value={annualLeaseObligations}
              min={0}
              max={1000000000}
              step={100000}
              prefix={currencySymbol}
              onChange={(v) => setParam('annualLeaseObligations', v)}
            />
          </div>

          {/* Lender Underwriting Benchmarks */}
          <div class="space-y-3 pt-4 border-t border-hairline">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
              Lender Covenant &amp; Underwriting Terms
            </span>
            <div class="grid sm:grid-cols-3 gap-3">
              <FormInputNumber
                id="tgt-dscr"
                label="Target DSCR"
                value={targetDscrBenchmark}
                min={0.8}
                max={2.5}
                step={0.05}
                suffix="x"
                onChange={(v) => setParam('targetDscrBenchmark', v)}
              />
              <FormInputNumber
                id="loan-rate"
                label="Interest Rate"
                value={loanInterestRate}
                min={1}
                max={25}
                step={0.25}
                suffix="%"
                onChange={(v) => setParam('loanInterestRate', v)}
              />
              <FormInputNumber
                id="loan-tenure"
                label="Loan Tenure"
                value={loanTenureYears}
                min={1}
                max={30}
                step={1}
                suffix="Yrs"
                onChange={(v) => setParam('loanTenureYears', v)}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Debt Service Coverage Ratio (DSCR)"
            primaryValue={`${results.dscr}x`}
            secondaryItems={[
              { label: 'Target Covenant', value: `${targetDscrBenchmark}x` },
              { label: 'Net Operating Income', value: fmt(results.effectiveNoi) },
              { label: 'Total Debt Service', value: fmt(results.totalDebtService) },
              { label: 'Free Cash Flow', value: fmt(results.cashFlowSurplus) },
            ]}
          />

          <ResultDonutChart
            title="NOI &amp; Debt Service Allocation"
            centerValue={`${results.dscr}x`}
            centerSubtext="DSCR Ratio"
            segments={debtSegments.map((s) => ({ label: s.label, amount: s.amount, colorClass: s.colorClass }))}
          />
        </div>
      </div>

      {/* 4. MULTI-SCENARIO STRESS TESTING MATRIX */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono overflow-x-auto">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <h4 class="text-base font-bold font-heading text-ink">Commercial Underwriting Stress Test Matrix</h4>
          <span class="text-xs text-muted">Multi-Shock Sensitivity Analysis</span>
        </div>
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-hairline text-muted uppercase font-bold">
              <th class="py-2.5 px-3">Stress Scenario</th>
              <th class="py-2.5 px-3 text-right">Stressed NOI</th>
              <th class="py-2.5 px-3 text-right">Annual Debt Service</th>
              <th class="py-2.5 px-3 text-right">Stressed DSCR</th>
              <th class="py-2.5 px-3 text-right">Covenant Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-hairline/60">
            {results.stressScenarios.map((sc, idx) => (
              <tr key={idx} class="hover:bg-surface-soft transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">{sc.scenario}</td>
                <td class="py-2.5 px-3 text-right font-mono text-muted">{fmt(sc.noi)}</td>
                <td class="py-2.5 px-3 text-right font-mono text-muted">{fmt(sc.debtService)}</td>
                <td class={`py-2.5 px-3 text-right font-bold ${sc.dscr >= targetDscrBenchmark ? 'text-primary' : 'text-rose-600'}`}>
                  {sc.dscr}x
                </td>
                <td class={`py-2.5 px-3 text-right font-bold ${sc.statusColor}`}>{sc.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. DEBT BREAKDOWN */}
      <CostBreakdownCard
        title="Debt Service &amp; Free Cash Flow Breakdown"
        subtitle={`Total Capital Obligations: ${fmt(results.totalDebtService)}/year out of ${fmt(results.effectiveNoi)} NOI`}
        items={debtSegments}
      />

      {/* 6. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 7. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Max Borrowing Capacity"
          value={fmt(results.maxSupportableLoanAmount)}
          subtitle={`Maximum senior debt capacity supported at ${targetDscrBenchmark}x target DSCR.`}
          badgeText="Capacity"
          badgeColorClass="bg-primary"
        />
        <InsightCard
          title="Revenue Decline Tolerance"
          value={`${results.revenueDeclineTolerancePct}%`}
          subtitle={`Gross revenue cushion before operational cash flow drops below debt service.`}
          badgeText="Safety Buffer"
          badgeColorClass={results.revenueDeclineTolerancePct >= 15 ? 'bg-semantic-success' : 'bg-amber-500'}
        />
      </div>

      {/* 8. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 COMMERCIAL UNDERWRITING EXECUTIVE VOUCHER</span>
          <span class="text-xs text-muted font-mono">{calculationMode.toUpperCase()} UNDERWRITING</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">DSCR Ratio</span>
            <span class="text-base font-bold text-primary">{results.dscr}x</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Effective NOI</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.effectiveNoi)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Debt Service</span>
            <span class="text-base font-bold text-amber-600">{fmt(results.totalDebtService)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Free Cash Flow</span>
            <span class="text-base font-bold text-indigo-600">{fmt(results.cashFlowSurplus)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
