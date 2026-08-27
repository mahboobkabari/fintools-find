import { useState, useMemo } from 'preact/hooks';
import { calculateCurrentRatioCalculator } from '../../../calculators/business/current-ratio-calculator.js';
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

const DEFAULT_CURRENT_STATE = {
  calculationMode: 'itemized',
  totalCurrentAssets: 15000000,
  totalCurrentLiabilities: 7500000,
  cashAndEquivalents: 3000000,
  marketableSecurities: 1500000,
  accountsReceivable: 4500000,
  inventory: 5000000,
  prepaidExpenses: 1000000,
  accountsPayable: 3500000,
  shortTermDebt: 2000000,
  currentPortionLongDebt: 1000000,
  accruedExpenses: 1000000,
  targetCurrentRatio: 2.0,
  currencySymbol: '₹',
};

const CURRENT_PARAM_MAP = {
  calculationMode: 'mode',
  totalCurrentAssets: 'totca',
  totalCurrentLiabilities: 'totcl',
  cashAndEquivalents: 'cash',
  marketableSecurities: 'sec',
  accountsReceivable: 'ar',
  inventory: 'inv',
  prepaidExpenses: 'prep',
  accountsPayable: 'ap',
  shortTermDebt: 'stdebt',
  currentPortionLongDebt: 'cpltd',
  accruedExpenses: 'accrued',
  targetCurrentRatio: 'tgt',
  currencySymbol: 'cur',
};

export default function CurrentRatioFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_CURRENT_STATE, CURRENT_PARAM_MAP);
  const {
    calculationMode,
    totalCurrentAssets,
    totalCurrentLiabilities,
    cashAndEquivalents,
    marketableSecurities,
    accountsReceivable,
    inventory,
    prepaidExpenses,
    accountsPayable,
    shortTermDebt,
    currentPortionLongDebt,
    accruedExpenses,
    targetCurrentRatio,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Presets
  const presets = [
    { id: 'heavy_manufacturing', label: 'Industrial Manufacturing', icon: '🏭', calculationMode: 'itemized', cashAndEquivalents: 3000000, marketableSecurities: 1500000, accountsReceivable: 4500000, inventory: 5000000, prepaidExpenses: 1000000, accountsPayable: 3500000, shortTermDebt: 2000000, currentPortionLongDebt: 1000000, accruedExpenses: 1000000, targetCurrentRatio: 2.0, currencySymbol: '₹', desc: '2.00x Current Ratio · ₹75L NWC' },
    { id: 'fmcg_distribution', label: 'FMCG Distribution', icon: '📦', calculationMode: 'itemized', cashAndEquivalents: 4000000, marketableSecurities: 2000000, accountsReceivable: 8000000, inventory: 7000000, prepaidExpenses: 1000000, accountsPayable: 6000000, shortTermDebt: 3000000, currentPortionLongDebt: 1000000, accruedExpenses: 1000000, targetCurrentRatio: 2.0, currencySymbol: '₹', desc: '2.00x Current Ratio · ₹1.1 Cr NWC' },
    { id: 'saas_tech', label: 'Tech & Software', icon: '💻', calculationMode: 'itemized', cashAndEquivalents: 10000000, marketableSecurities: 3000000, accountsReceivable: 4500000, inventory: 0, prepaidExpenses: 500000, accountsPayable: 2000000, shortTermDebt: 1500000, currentPortionLongDebt: 1000000, accruedExpenses: 1500000, targetCurrentRatio: 2.5, currencySymbol: '₹', desc: '3.00x Current Ratio · Zero Inventory' },
    { id: 'retail_ecommerce', label: 'Retail & E-Commerce', icon: '🛍️', calculationMode: 'itemized', cashAndEquivalents: 1500000, marketableSecurities: 500000, accountsReceivable: 1000000, inventory: 4500000, prepaidExpenses: 500000, accountsPayable: 4000000, shortTermDebt: 1500000, currentPortionLongDebt: 500000, accruedExpenses: 500000, targetCurrentRatio: 1.5, currencySymbol: '₹', desc: '1.23x Current Ratio · Tight Buffer' },
    { id: 'construction_infra', label: 'Commercial Construction', icon: '🏗️', calculationMode: 'itemized', cashAndEquivalents: 5000000, marketableSecurities: 2000000, accountsReceivable: 15000000, inventory: 11000000, prepaidExpenses: 2000000, accountsPayable: 12000000, shortTermDebt: 5000000, currentPortionLongDebt: 1500000, accruedExpenses: 1500000, targetCurrentRatio: 1.75, currencySymbol: '₹', desc: '1.75x Current Ratio · ₹1.5 Cr NWC' },
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
    return calculateCurrentRatioCalculator({
      calculationMode,
      totalCurrentAssets,
      totalCurrentLiabilities,
      cashAndEquivalents,
      marketableSecurities,
      accountsReceivable,
      inventory,
      prepaidExpenses,
      accountsPayable,
      shortTermDebt,
      currentPortionLongDebt,
      accruedExpenses,
      targetCurrentRatio,
      currencySymbol,
    });
  }, [
    calculationMode,
    totalCurrentAssets,
    totalCurrentLiabilities,
    cashAndEquivalents,
    marketableSecurities,
    accountsReceivable,
    inventory,
    prepaidExpenses,
    accountsPayable,
    shortTermDebt,
    currentPortionLongDebt,
    accruedExpenses,
    targetCurrentRatio,
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
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Industry Working Capital Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            📊 WORKING CAPITAL &amp; SOLVENCY INTELLIGENCE
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.healthColor} bg-surface-strong`}>
            {results.healthTitle}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Total Current Assets: <strong>{fmt(results.effectiveCurrentAssets)}</strong> · Total Current Liabilities: <strong>{fmt(results.effectiveCurrentLiabilities)}</strong> · Quick Ratio: <strong>{results.quickRatio}x</strong> · Cash Ratio: <strong>{results.cashRatio}x</strong> · Inventory Concentration: <strong>{results.inventoryConcentrationPct}%</strong>.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Current Ratio</span>
            <span class={`text-sm font-bold ${results.currentRatio >= targetCurrentRatio ? 'text-primary' : 'text-amber-600'}`}>
              {results.currentRatio}x
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Net Working Capital</span>
            <span class={`text-sm font-bold ${results.netWorkingCapital >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fmt(results.netWorkingCapital)}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Quick Ratio (Acid-Test)</span>
            <span class="text-sm font-bold text-ink">{results.quickRatio}x</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Cash Ratio</span>
            <span class="text-sm font-bold text-indigo-600">{results.cashRatio}x</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Balance Sheet Working Capital Drivers</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Mode Switcher */}
          <div class="space-y-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
              Calculation Mode
            </span>
            <div class="grid grid-cols-2 gap-2">
              {[
                { id: 'itemized', label: 'Itemized Balance Sheet (Detailed)' },
                { id: 'direct', label: 'Direct Total Inputs (Fast)' },
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

          {/* Mode 1: Itemized Balance Sheet */}
          {calculationMode === 'itemized' && (
            <div class="space-y-4 pt-2">
              {/* Assets Group */}
              <div class="space-y-3">
                <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider block">
                  Current Asset Components
                </span>
                <div class="grid sm:grid-cols-2 gap-3">
                  <FormInputNumber
                    id="cash-in"
                    label="Cash &amp; Bank Balances"
                    value={cashAndEquivalents}
                    min={0}
                    max={5000000000}
                    step={100000}
                    prefix={currencySymbol}
                    onChange={(v) => setParam('cashAndEquivalents', v)}
                  />
                  <FormInputNumber
                    id="sec-in"
                    label="Marketable Securities"
                    value={marketableSecurities}
                    min={0}
                    max={5000000000}
                    step={100000}
                    prefix={currencySymbol}
                    onChange={(v) => setParam('marketableSecurities', v)}
                  />
                </div>
                <div class="grid sm:grid-cols-2 gap-3">
                  <FormInputNumber
                    id="ar-in"
                    label="Accounts Receivable (Net)"
                    value={accountsReceivable}
                    min={0}
                    max={5000000000}
                    step={100000}
                    prefix={currencySymbol}
                    onChange={(v) => setParam('accountsReceivable', v)}
                  />
                  <FormInputNumber
                    id="inv-in"
                    label="Inventories (Raw/WIP/FG)"
                    value={inventory}
                    min={0}
                    max={5000000000}
                    step={100000}
                    prefix={currencySymbol}
                    onChange={(v) => setParam('inventory', v)}
                  />
                </div>
                <FormInputNumber
                  id="prep-in"
                  label="Prepaid Expenses &amp; Advances"
                  value={prepaidExpenses}
                  min={0}
                  max={500000000}
                  step={50000}
                  prefix={currencySymbol}
                  onChange={(v) => setParam('prepaidExpenses', v)}
                />
              </div>

              {/* Liabilities Group */}
              <div class="space-y-3 pt-3 border-t border-hairline">
                <span class="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider block">
                  Current Liability Components
                </span>
                <div class="grid sm:grid-cols-2 gap-3">
                  <FormInputNumber
                    id="ap-in"
                    label="Accounts Payable (Trade)"
                    value={accountsPayable}
                    min={0}
                    max={5000000000}
                    step={100000}
                    prefix={currencySymbol}
                    onChange={(v) => setParam('accountsPayable', v)}
                  />
                  <FormInputNumber
                    id="st-debt-in"
                    label="Short-Term Debt &amp; Overdrafts"
                    value={shortTermDebt}
                    min={0}
                    max={5000000000}
                    step={100000}
                    prefix={currencySymbol}
                    onChange={(v) => setParam('shortTermDebt', v)}
                  />
                </div>
                <div class="grid sm:grid-cols-2 gap-3">
                  <FormInputNumber
                    id="cpltd-in"
                    label="Current Portion Long-Term Debt"
                    value={currentPortionLongDebt}
                    min={0}
                    max={5000000000}
                    step={100000}
                    prefix={currencySymbol}
                    onChange={(v) => setParam('currentPortionLongDebt', v)}
                  />
                  <FormInputNumber
                    id="accrued-in"
                    label="Accrued Expenses &amp; Taxes"
                    value={accruedExpenses}
                    min={0}
                    max={500000000}
                    step={50000}
                    prefix={currencySymbol}
                    onChange={(v) => setParam('accruedExpenses', v)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Direct Mode */}
          {calculationMode === 'direct' && (
            <div class="space-y-3 pt-2">
              <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider block">
                Total Balance Sheet Balances
              </span>
              <FormInputNumber
                id="dir-ca"
                label="Total Current Assets"
                value={totalCurrentAssets}
                min={0}
                max={10000000000}
                step={500000}
                prefix={currencySymbol}
                onChange={(v) => setParam('totalCurrentAssets', v)}
              />
              <FormInputNumber
                id="dir-cl"
                label="Total Current Liabilities"
                value={totalCurrentLiabilities}
                min={0}
                max={10000000000}
                step={500000}
                prefix={currencySymbol}
                onChange={(v) => setParam('totalCurrentLiabilities', v)}
              />
            </div>
          )}

          {/* Benchmark Target */}
          <div class="pt-4 border-t border-hairline">
            <FormInputNumber
              id="tgt-curr-ratio"
              label="Target Benchmark Current Ratio"
              value={targetCurrentRatio}
              min={1.0}
              max={4.0}
              step={0.1}
              suffix="x"
              onChange={(v) => setParam('targetCurrentRatio', v)}
            />
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Current Ratio (Working Capital Ratio)"
            primaryValue={`${results.currentRatio}x`}
            secondaryItems={[
              { label: 'Target Ratio', value: `${targetCurrentRatio}x` },
              { label: 'Total Current Assets', value: fmt(results.effectiveCurrentAssets) },
              { label: 'Total Current Liabilities', value: fmt(results.effectiveCurrentLiabilities) },
              { label: 'Net Working Capital (NWC)', value: fmt(results.netWorkingCapital) },
            ]}
          />

          <ResultDonutChart
            title="Current Asset Allocation Composition"
            centerValue={`${results.currentRatio}x`}
            centerSubtext="Current Ratio"
            segments={assetSegments.map((s) => ({ label: s.label, amount: s.amount, colorClass: s.colorClass }))}
          />
        </div>
      </div>

      {/* 4. ASSET ALLOCATION BREAKDOWN */}
      <CostBreakdownCard
        title="Balance Sheet Current Asset Breakdown"
        subtitle={`Total Current Assets: ${fmt(results.effectiveCurrentAssets)} against Total Obligations of ${fmt(results.effectiveCurrentLiabilities)}`}
        items={assetSegments}
      />

      {/* 5. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 6. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Quick Ratio (Acid-Test)"
          value={`${results.quickRatio}x`}
          subtitle="Excludes inventory and prepaids to measure immediate balance sheet solvency."
          badgeText="Acid-Test"
          badgeColorClass="bg-primary"
        />
        <InsightCard
          title="Cash Ratio (Instant Liquidity)"
          value={`${results.cashRatio}x`}
          subtitle="Measures pure cash and marketable securities against short-term debt."
          badgeText="Cash Only"
          badgeColorClass="bg-emerald-500"
        />
      </div>

      {/* 7. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 WORKING CAPITAL EXECUTIVE VOUCHER</span>
          <span class="text-xs text-muted font-mono">{calculationMode.toUpperCase()} ANALYSIS</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Current Ratio</span>
            <span class="text-base font-bold text-primary">{results.currentRatio}x</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Current Assets</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.effectiveCurrentAssets)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Current Liabilities</span>
            <span class="text-base font-bold text-amber-600">{fmt(results.effectiveCurrentLiabilities)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Net Working Capital</span>
            <span class="text-base font-bold text-indigo-600">{fmt(results.netWorkingCapital)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
