import { useState, useMemo } from 'preact/hooks';
import { calculateQuickRatioCalculator } from '../../../calculators/business/quick-ratio-calculator.js';
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

const DEFAULT_QUICK_STATE = {
  calculationMode: 'component',
  cashAndEquivalents: 2500000,
  marketableSecurities: 1500000,
  accountsReceivable: 3500000,
  totalCurrentAssets: 12000000,
  inventory: 4000000,
  prepaidExpenses: 500000,
  currentLiabilities: 5000000,
  dailyOperatingExpenses: 50000,
  targetQuickRatio: 1.0,
  currencySymbol: '₹',
};

const QUICK_PARAM_MAP = {
  calculationMode: 'mode',
  cashAndEquivalents: 'cash',
  marketableSecurities: 'sec',
  accountsReceivable: 'ar',
  totalCurrentAssets: 'ca',
  inventory: 'inv',
  currentLiabilities: 'cl',
  dailyOperatingExpenses: 'opex',
  targetQuickRatio: 'tgt',
  currencySymbol: 'cur',
};

export default function QuickRatioFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_QUICK_STATE, QUICK_PARAM_MAP);
  const {
    calculationMode,
    cashAndEquivalents,
    marketableSecurities,
    accountsReceivable,
    totalCurrentAssets,
    inventory,
    prepaidExpenses,
    currentLiabilities,
    dailyOperatingExpenses,
    targetQuickRatio,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Presets
  const presets = [
    { id: 'manufacturing_plant', label: 'Manufacturing Plant', icon: '🏭', calculationMode: 'component', cashAndEquivalents: 2500000, marketableSecurities: 1500000, accountsReceivable: 3500000, inventory: 4000000, prepaidExpenses: 500000, currentLiabilities: 5000000, dailyOperatingExpenses: 60000, targetQuickRatio: 1.0, currencySymbol: '₹', desc: '1.50x Quick Ratio · ₹75L Quick Assets' },
    { id: 'saas_tech', label: 'SaaS / Tech Startup', icon: '🚀', calculationMode: 'component', cashAndEquivalents: 5000000, marketableSecurities: 2000000, accountsReceivable: 3000000, inventory: 0, prepaidExpenses: 300000, currentLiabilities: 4000000, dailyOperatingExpenses: 40000, targetQuickRatio: 1.25, currencySymbol: '₹', desc: '2.50x Quick Ratio · Zero Inventory' },
    { id: 'retail_supermarket', label: 'Retail Supermarket', icon: '🛒', calculationMode: 'component', cashAndEquivalents: 1000000, marketableSecurities: 500000, accountsReceivable: 500000, inventory: 8000000, prepaidExpenses: 200000, currentLiabilities: 4000000, dailyOperatingExpenses: 30000, targetQuickRatio: 0.8, currencySymbol: '₹', desc: '0.50x Quick Ratio · Inventory Heavy' },
    { id: 'healthcare_clinic', label: 'Healthcare & Diagnostic', icon: '🏥', calculationMode: 'component', cashAndEquivalents: 3000000, marketableSecurities: 1000000, accountsReceivable: 4000000, inventory: 1500000, prepaidExpenses: 400000, currentLiabilities: 4500000, dailyOperatingExpenses: 50000, targetQuickRatio: 1.2, currencySymbol: '₹', desc: '1.78x Quick Ratio · Strong Buffer' },
    { id: 'construction_epc', label: 'Construction / EPC', icon: '🏗️', calculationMode: 'component', cashAndEquivalents: 2000000, marketableSecurities: 1000000, accountsReceivable: 6000000, inventory: 5000000, prepaidExpenses: 800000, currentLiabilities: 7000000, dailyOperatingExpenses: 80000, targetQuickRatio: 1.0, currencySymbol: '₹', desc: '1.29x Quick Ratio · High Receivables' },
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
    return calculateQuickRatioCalculator({
      calculationMode,
      cashAndEquivalents,
      marketableSecurities,
      accountsReceivable,
      totalCurrentAssets,
      inventory,
      prepaidExpenses,
      currentLiabilities,
      dailyOperatingExpenses,
      targetQuickRatio,
      currencySymbol,
    });
  }, [
    calculationMode,
    cashAndEquivalents,
    marketableSecurities,
    accountsReceivable,
    totalCurrentAssets,
    inventory,
    prepaidExpenses,
    currentLiabilities,
    dailyOperatingExpenses,
    targetQuickRatio,
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

  const assetSegments = results.assetBreakdownList
    .filter((a) => a.amount > 0)
    .map((a) => ({
      label: a.label,
      amount: a.amount,
      colorClass: a.colorClass,
      desc: fmt(a.amount),
    }));

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Industry Sector Liquidity Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🧪 SHORT-TERM LIQUIDITY &amp; ACID-TEST INTELLIGENCE
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.healthColor} bg-surface-strong`}>
            {results.healthTitle}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Quick Assets: <strong>{fmt(results.quickAssets)}</strong> · Current Liabilities: <strong>{fmt(results.currentLiabilities)}</strong> · Current Ratio: <strong>{results.currentRatio}x</strong> · Cash Ratio: <strong>{results.cashRatio}x</strong> · Defensive Interval: <strong>{results.defensiveIntervalDays} Days</strong>.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Quick Ratio</span>
            <span class={`text-sm font-bold ${results.quickRatio >= targetQuickRatio ? 'text-primary' : 'text-rose-600'}`}>
              {results.quickRatio}x
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Quick Working Capital</span>
            <span class={`text-sm font-bold ${results.quickWorkingCapital >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fmt(results.quickWorkingCapital)}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Current Ratio</span>
            <span class="text-sm font-bold text-ink">{results.currentRatio}x</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Defensive Runway</span>
            <span class="text-sm font-bold text-indigo-600">{results.defensiveIntervalDays} Days</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Balance Sheet Asset Drivers</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Mode Switcher */}
          <div class="space-y-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
              Accounting Calculation Method
            </span>
            <div class="grid grid-cols-2 gap-2">
              {[
                { id: 'component', label: 'Component Breakdown (Standard)' },
                { id: 'deductive', label: 'Balance Sheet Deductive' },
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
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode 1: Component Breakdown */}
          {calculationMode === 'component' && (
            <div class="space-y-3 pt-2">
              <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider block">
                Liquid Quick Asset Components
              </span>
              <FormInputNumber
                id="cash-val"
                label="Cash &amp; Bank Balances"
                value={cashAndEquivalents}
                min={0}
                max={5000000000}
                step={100000}
                prefix={currencySymbol}
                onChange={(v) => setParam('cashAndEquivalents', v)}
              />
              <div class="grid sm:grid-cols-2 gap-3">
                <FormInputNumber
                  id="sec-val"
                  label="Marketable Securities"
                  value={marketableSecurities}
                  min={0}
                  max={5000000000}
                  step={100000}
                  prefix={currencySymbol}
                  onChange={(v) => setParam('marketableSecurities', v)}
                />
                <FormInputNumber
                  id="ar-val"
                  label="Accounts Receivable (Net)"
                  value={accountsReceivable}
                  min={0}
                  max={5000000000}
                  step={100000}
                  prefix={currencySymbol}
                  onChange={(v) => setParam('accountsReceivable', v)}
                />
              </div>
              <div class="grid sm:grid-cols-2 gap-3 pt-2 border-t border-hairline">
                <FormInputNumber
                  id="inv-val"
                  label="Inventory (Excluded from Quick Assets)"
                  value={inventory}
                  min={0}
                  max={5000000000}
                  step={100000}
                  prefix={currencySymbol}
                  onChange={(v) => setParam('inventory', v)}
                />
                <FormInputNumber
                  id="prep-val"
                  label="Prepaid Expenses"
                  value={prepaidExpenses}
                  min={0}
                  max={500000000}
                  step={50000}
                  prefix={currencySymbol}
                  onChange={(v) => setParam('prepaidExpenses', v)}
                />
              </div>
            </div>
          )}

          {/* Mode 2: Deductive Mode */}
          {calculationMode === 'deductive' && (
            <div class="space-y-3 pt-2">
              <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider block">
                Total Current Assets &amp; Illiquid Deductions
              </span>
              <FormInputNumber
                id="tot-ca"
                label="Total Current Assets"
                value={totalCurrentAssets}
                min={0}
                max={10000000000}
                step={500000}
                prefix={currencySymbol}
                onChange={(v) => setParam('totalCurrentAssets', v)}
              />
              <div class="grid sm:grid-cols-2 gap-3">
                <FormInputNumber
                  id="inv-deduct"
                  label="Less: Total Inventory"
                  value={inventory}
                  min={0}
                  max={5000000000}
                  step={100000}
                  prefix={currencySymbol}
                  onChange={(v) => setParam('inventory', v)}
                />
                <FormInputNumber
                  id="prep-deduct"
                  label="Less: Prepaid Expenses"
                  value={prepaidExpenses}
                  min={0}
                  max={500000000}
                  step={50000}
                  prefix={currencySymbol}
                  onChange={(v) => setParam('prepaidExpenses', v)}
                />
              </div>
            </div>
          )}

          {/* Short-Term Liabilities & Daily Burn */}
          <div class="space-y-3 pt-4 border-t border-hairline">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
              Obligations &amp; Operational Burn
            </span>
            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber
                id="curr-liab"
                label="Total Current Liabilities"
                value={currentLiabilities}
                min={0}
                max={5000000000}
                step={100000}
                prefix={currencySymbol}
                onChange={(v) => setParam('currentLiabilities', v)}
              />
              <FormInputNumber
                id="daily-burn"
                label="Daily Operating Cash Burn"
                value={dailyOperatingExpenses}
                min={0}
                max={100000000}
                step={5000}
                prefix={currencySymbol}
                onChange={(v) => setParam('dailyOperatingExpenses', v)}
              />
            </div>
            <FormInputNumber
              id="tgt-ratio"
              label="Target Benchmark Quick Ratio"
              value={targetQuickRatio}
              min={0.5}
              max={3.0}
              step={0.05}
              suffix="x"
              onChange={(v) => setParam('targetQuickRatio', v)}
            />
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Quick Ratio (Acid-Test Ratio)"
            primaryValue={`${results.quickRatio}x`}
            secondaryItems={[
              { label: 'Target Ratio', value: `${targetQuickRatio}x` },
              { label: 'Total Quick Assets', value: fmt(results.quickAssets) },
              { label: 'Current Liabilities', value: fmt(results.currentLiabilities) },
              { label: 'Quick Working Capital', value: fmt(results.quickWorkingCapital) },
            ]}
          />

          <ResultDonutChart
            title="Current Asset Liquidity Composition"
            centerValue={`${results.quickRatio}x`}
            centerSubtext="Acid-Test Ratio"
            segments={assetSegments.map((s) => ({ label: s.label, amount: s.amount, colorClass: s.colorClass }))}
          />
        </div>
      </div>

      {/* 4. ASSET LIQUIDITY BREAKDOWN */}
      <CostBreakdownCard
        title="Asset Liquidity &amp; Coverage Breakdown"
        subtitle={`Quick Assets (${fmt(results.quickAssets)}) vs Excluded Illiquid Assets (${fmt(results.inventory + results.prepaidExpenses)})`}
        items={assetSegments}
      />

      {/* 5. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 6. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Cash Ratio (Instant Liquidity)"
          value={`${results.cashRatio}x`}
          subtitle={`Pure cash & securities (${fmt(results.cashAndEquivalents + results.marketableSecurities)}) without receivables.`}
          badgeText="Cash Ratio"
          badgeColorClass="bg-primary"
        />
        <InsightCard
          title="Inventory Liquidity Drag"
          value={fmt(results.inventory)}
          subtitle={`Inventory accounts for ${(results.currentRatio - results.quickRatio).toFixed(2)}x of the Current Ratio spread.`}
          badgeText="Inventory"
          badgeColorClass="bg-amber-500"
        />
      </div>

      {/* 7. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 LIQUIDITY EXECUTIVE VOUCHER</span>
          <span class="text-xs text-muted font-mono">{calculationMode.toUpperCase()} ACCOUNTING</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Quick Ratio</span>
            <span class="text-base font-bold text-primary">{results.quickRatio}x</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Quick Assets</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.quickAssets)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Current Liabilities</span>
            <span class="text-base font-bold text-amber-600">{fmt(results.currentLiabilities)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Working Capital</span>
            <span class="text-base font-bold text-indigo-600">{fmt(results.quickWorkingCapital)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
