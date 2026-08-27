import { useState, useMemo } from 'preact/hooks';
import { calculateWorkingCapitalCalculator } from '../../../calculators/business/working-capital-calculator.js';
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
import FormSelect from './FormSelect';

const DEFAULT_WORKING_CAPITAL_STATE = {
  cash: 500000,
  accountsReceivable: 1200000,
  inventory: 800000,
  otherCurrentAssets: 100000,
  accountsPayable: 900000,
  shortTermDebt: 400000,
  accruedExpenses: 200000,
  annualRevenue: 10000000,
  annualCogs: 6000000,
  costOfCapital: 12,
  currencySymbol: '₹',
};

const WORKING_CAPITAL_PARAM_MAP = {
  cash: 'c',
  accountsReceivable: 'ar',
  inventory: 'inv',
  otherCurrentAssets: 'oca',
  accountsPayable: 'ap',
  shortTermDebt: 'std',
  accruedExpenses: 'acc',
  annualRevenue: 'rev',
  annualCogs: 'cogs',
  costOfCapital: 'coc',
  currencySymbol: 'cur',
};

export default function WorkingCapitalFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_WORKING_CAPITAL_STATE, WORKING_CAPITAL_PARAM_MAP);
  const {
    cash,
    accountsReceivable,
    inventory,
    otherCurrentAssets,
    accountsPayable,
    shortTermDebt,
    accruedExpenses,
    annualRevenue,
    annualCogs,
    costOfCapital,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Industry Presets
  const presets = [
    { id: 'ecommerce', label: 'D2C E-Commerce', icon: '🛒', cash: 800000, accountsReceivable: 200000, inventory: 1500000, otherCurrentAssets: 100000, accountsPayable: 1200000, shortTermDebt: 300000, accruedExpenses: 150000, annualRevenue: 20000000, annualCogs: 12000000, costOfCapital: 12, currencySymbol: '₹', desc: 'Fast turnover & online pay' },
    { id: 'manufacturing', label: 'Manufacturing Plant', icon: '🏭', cash: 1500000, accountsReceivable: 6000000, inventory: 4500000, otherCurrentAssets: 500000, accountsPayable: 4000000, shortTermDebt: 3000000, accruedExpenses: 800000, annualRevenue: 50000000, annualCogs: 32000000, costOfCapital: 11, currencySymbol: '₹', desc: 'Heavy inventory & dealer credit' },
    { id: 'saas', label: 'B2B SaaS / Agency', icon: '💻', cash: 3000000, accountsReceivable: 2500000, inventory: 0, otherCurrentAssets: 200000, accountsPayable: 600000, shortTermDebt: 0, accruedExpenses: 1200000, annualRevenue: 30000000, annualCogs: 10000000, costOfCapital: 10, currencySymbol: '₹', desc: 'Zero inventory & high cash' },
    { id: 'wholesale', label: 'Wholesale FMCG', icon: '📦', cash: 1000000, accountsReceivable: 4500000, inventory: 3500000, otherCurrentAssets: 250000, accountsPayable: 5000000, shortTermDebt: 1500000, accruedExpenses: 400000, annualRevenue: 60000000, annualCogs: 50000000, costOfCapital: 12, currencySymbol: '₹', desc: 'High volume distribution' },
    { id: 'construction', label: 'Construction Contractor', icon: '🏗️', cash: 2000000, accountsReceivable: 12000000, inventory: 2000000, otherCurrentAssets: 1000000, accountsPayable: 9000000, shortTermDebt: 4000000, accruedExpenses: 1500000, annualRevenue: 80000000, annualCogs: 60000000, costOfCapital: 13, currencySymbol: '₹', desc: 'Long milestone receivables' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('cash', p.cash);
    setParam('accountsReceivable', p.accountsReceivable);
    setParam('inventory', p.inventory);
    setParam('otherCurrentAssets', p.otherCurrentAssets);
    setParam('accountsPayable', p.accountsPayable);
    setParam('shortTermDebt', p.shortTermDebt);
    setParam('accruedExpenses', p.accruedExpenses);
    setParam('annualRevenue', p.annualRevenue);
    setParam('annualCogs', p.annualCogs);
    setParam('costOfCapital', p.costOfCapital);
    setParam('currencySymbol', p.currencySymbol);
  };

  // Perform calculation
  const results = useMemo(() => {
    return calculateWorkingCapitalCalculator({
      cash,
      accountsReceivable,
      inventory,
      otherCurrentAssets,
      accountsPayable,
      shortTermDebt,
      accruedExpenses,
      annualRevenue,
      annualCogs,
      costOfCapital,
      currencySymbol,
    });
  }, [
    cash,
    accountsReceivable,
    inventory,
    otherCurrentAssets,
    accountsPayable,
    shortTermDebt,
    accruedExpenses,
    annualRevenue,
    annualCogs,
    costOfCapital,
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

  // Donut chart items
  const assetComposition = [
    { label: 'Cash & Equivalents', amount: Number(cash) || 0, colorClass: 'bg-emerald-500', desc: 'Liquid bank balances and overnight deposits.' },
    { label: 'Accounts Receivable', amount: Number(accountsReceivable) || 0, colorClass: 'bg-primary', desc: 'Outstanding customer invoices pending collection.' },
    { label: 'Inventory Stock', amount: Number(inventory) || 0, colorClass: 'bg-amber-500', desc: 'Raw materials, WIP, and finished goods on hand.' },
    { label: 'Other Current Assets', amount: Number(otherCurrentAssets) || 0, colorClass: 'bg-purple-500', desc: 'Prepaid expenses and statutory advances.' },
  ];

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Business Industry Model" />

      {/* 2. HERO DECISION VERDICT */}
      <div class={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas ${results.isSurplus ? 'to-emerald-500/10 border-primary/40' : 'to-rose-500/10 border-rose-500/40'} border-2 shadow-soft space-y-3`}>
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill ${results.isSurplus ? 'bg-primary' : 'bg-rose-600'} text-white font-mono text-xs font-bold uppercase`}>
            💼 WORKING CAPITAL & LIQUIDITY VERDICT
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.healthColor} bg-surface-strong`}>
            {results.healthStatus} · SCORE: {results.healthScore}/100
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Current Ratio is <strong>{results.currentRatio}x</strong> (Quick Ratio: <strong>{results.quickRatio}x</strong>). Cash is locked in working capital for <strong>{results.cashConversionCycle} days</strong> before returning as liquidity.
        </p>

        {/* Quick Cycle Badges */}
        <div class="pt-3 border-t border-hairline/60 grid grid-cols-3 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">DSO (Receivables)</span>
            <span class="text-sm font-bold text-primary">{results.dso} Days</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">DIO (Inventory)</span>
            <span class="text-sm font-bold text-amber-600">{results.dio} Days</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">DPO (Payables)</span>
            <span class="text-sm font-bold text-purple-600">{results.dpo} Days</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline col-span-3 sm:col-span-1">
            <span class="text-[10px] text-muted block uppercase font-bold">Net CCC</span>
            <span class={`text-sm font-bold ${results.cashConversionCycle <= 60 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {results.cashConversionCycle} Days
            </span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Current Assets & Current Liabilities Form */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Short-Term Balance Sheet Items</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Section: Current Assets */}
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📥 CURRENT ASSETS ({fmt(results.totalCurrentAssets)})</span>
            </div>

            <FormInputNumber
              id="cash-input"
              label="Cash & Bank Balances"
              value={cash}
              min={0}
              max={1000000000}
              step={50000}
              prefix={currencySymbol}
              onChange={(v) => setParam('cash', v)}
            />

            <FormInputNumber
              id="ar-input"
              label="Accounts Receivable (Trade Debtors)"
              value={accountsReceivable}
              min={0}
              max={1000000000}
              step={50000}
              prefix={currencySymbol}
              onChange={(v) => setParam('accountsReceivable', v)}
            />

            <FormInputNumber
              id="inv-input"
              label="Inventory & Stock on Hand"
              value={inventory}
              min={0}
              max={1000000000}
              step={50000}
              prefix={currencySymbol}
              onChange={(v) => setParam('inventory', v)}
            />

            <FormInputNumber
              id="oca-input"
              label="Prepaid Expenses & Other Current Assets"
              value={otherCurrentAssets}
              min={0}
              max={100000000}
              step={10000}
              prefix={currencySymbol}
              onChange={(v) => setParam('otherCurrentAssets', v)}
            />
          </div>

          {/* Section: Current Liabilities */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider">📤 CURRENT LIABILITIES ({fmt(results.totalCurrentLiabilities)})</span>
            </div>

            <FormInputNumber
              id="ap-input"
              label="Accounts Payable (Trade Creditors)"
              value={accountsPayable}
              min={0}
              max={1000000000}
              step={50000}
              prefix={currencySymbol}
              onChange={(v) => setParam('accountsPayable', v)}
            />

            <FormInputNumber
              id="std-input"
              label="Short-Term Debt & Bank Overdrafts"
              value={shortTermDebt}
              min={0}
              max={1000000000}
              step={50000}
              prefix={currencySymbol}
              onChange={(v) => setParam('shortTermDebt', v)}
            />

            <FormInputNumber
              id="acc-input"
              label="Accrued Wages & Other Current Liabilities"
              value={accruedExpenses}
              min={0}
              max={100000000}
              step={10000}
              prefix={currencySymbol}
              onChange={(v) => setParam('accruedExpenses', v)}
            />
          </div>

          {/* Section: Operational Turnover Parameters */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider">📊 TURNOVER & FINANCING PARAMETERS</span>
            <div class="grid sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="revenue-input"
                label="Annual Revenue"
                value={annualRevenue}
                min={100000}
                max={10000000000}
                step={500000}
                prefix={currencySymbol}
                onChange={(v) => setParam('annualRevenue', v)}
              />
              <FormInputNumber
                id="cogs-input"
                label="Annual COGS"
                value={annualCogs}
                min={100000}
                max={10000000000}
                step={500000}
                prefix={currencySymbol}
                onChange={(v) => setParam('annualCogs', v)}
              />
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="coc-input"
                label="Overdraft Rate (%)"
                value={costOfCapital}
                min={0}
                max={50}
                step={0.5}
                suffix="%"
                onChange={(v) => setParam('costOfCapital', v)}
              />
              <FormSelect
                id="currency-select"
                label="Currency"
                value={currencySymbol}
                options={[
                  { value: '₹', label: '₹ (INR)' },
                  { value: '$', label: '$ (USD)' },
                  { value: '£', label: '£ (GBP)' },
                  { value: '€', label: '€ (EUR)' },
                  { value: 'AED ', label: 'AED (Dirham)' },
                ]}
                onChange={(v) => setParam('currencySymbol', v)}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Net Working Capital (NWC)"
            primaryValue={fmt(results.netWorkingCapital)}
            secondaryItems={[
              { label: 'Total Current Assets', value: fmt(results.totalCurrentAssets) },
              { label: 'Total Current Liabilities', value: fmt(results.totalCurrentLiabilities) },
              { label: 'Current Ratio', value: `${results.currentRatio}x` },
              { label: 'Quick Acid-Test Ratio', value: `${results.quickRatio}x` },
            ]}
          />

          <ResultDonutChart
            title="Current Assets Distribution"
            centerValue={fmt(results.totalCurrentAssets)}
            centerSubtext="Total Current Assets"
            segments={assetComposition.map((c) => ({ label: c.label, amount: c.amount, colorClass: c.colorClass }))}
          />
        </div>
      </div>

      {/* 4. SCENARIO SENSITIVITY COMPARISON CARDS */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold font-heading text-ink">Cash Flow Sensitivity Scenarios</h4>
          <span class="text-xs text-muted">Overdraft Rate: {costOfCapital}%</span>
        </div>
        <div class="grid sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-surface-strong border border-hairline space-y-2">
            <span class="text-xs text-muted font-bold block uppercase">{results.scenarios.current.label}</span>
            <span class="text-lg font-bold text-ink block">{fmt(results.scenarios.current.nwc)}</span>
            <span class="text-xs text-body block">Ratio: {results.scenarios.current.currentRatio}x · CCC: {results.scenarios.current.ccc}d</span>
          </div>
          <div class="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-2">
            <span class="text-xs text-emerald-600 font-bold block uppercase">🚀 {results.scenarios.optimized.label}</span>
            <span class="text-lg font-bold text-emerald-600 block">+{fmt(results.scenarios.optimized.cashFreed)} Freed</span>
            <span class="text-xs text-emerald-700 block">Saves {fmt(results.annualInterestSaved)}/yr in interest costs</span>
          </div>
          <div class="p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 space-y-2">
            <span class="text-xs text-rose-600 font-bold block uppercase">⚠️ {results.scenarios.stressed.label}</span>
            <span class="text-lg font-bold text-rose-600 block">+{fmt(results.scenarios.stressed.extraFinancingCost)} Cost</span>
            <span class="text-xs text-rose-700 block">CCC stretches to {results.scenarios.stressed.ccc} days</span>
          </div>
        </div>
      </div>

      {/* 5. COST BREAKDOWN */}
      <CostBreakdownCard
        title="Current Assets Portfolio Composition"
        subtitle={`Total Short-Term Assets: ${fmt(results.totalCurrentAssets)}`}
        items={assetComposition}
      />

      {/* 6. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 7. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Potential Cash Unlock"
          value={fmt(results.totalPotentialCashUnlock)}
          subtitle="Capital freed by speeding up receivables collection and inventory velocity by 15%."
          badgeText="Liquidity Optimization"
          badgeColorClass="bg-semantic-success"
        />
        <InsightCard
          title="Working Capital Turnover"
          value={`${results.workingCapitalTurnover}x`}
          subtitle={`Annual revenue is ${results.workingCapitalTurnover} times your net working capital base.`}
          badgeText="Capital Efficiency"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 8. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 WORKING CAPITAL EXECUTIVE SUMMARY</span>
          <span class="text-xs text-muted font-mono">{results.isSurplus ? 'NET SURPLUS' : 'NET DEFICIT'}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Current Assets</span>
            <span class="text-base font-bold text-primary">{fmt(results.totalCurrentAssets)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Current Liabilities</span>
            <span class="text-base font-bold text-rose-600">{fmt(results.totalCurrentLiabilities)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Net Working Capital</span>
            <span class="text-base font-bold text-ink">{fmt(results.netWorkingCapital)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Cash Conversion</span>
            <span class="text-base font-bold text-emerald-600">{results.cashConversionCycle} Days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
