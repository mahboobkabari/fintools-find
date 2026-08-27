import { useState, useMemo } from 'preact/hooks';
import { calculateVatCalculator } from '../../../calculators/tax/vat-calculator.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Library Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';
import FormSelect from './FormSelect';

const DEFAULT_VAT_STATE = {
  amount: 1000,
  rate: 20,
  mode: 'exclusive',
  currencySymbol: '£',
};

const VAT_PARAM_MAP = {
  amount: 'amt',
  rate: 'rate',
  mode: 'mode',
  currencySymbol: 'cur',
};

export default function VatFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_VAT_STATE, VAT_PARAM_MAP);
  const { amount, rate, mode, currencySymbol } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Preset Global Profiles
  const presets = [
    { id: 'uk_standard', label: 'UK Standard', icon: '🇬🇧', amount: 1000, rate: 20, mode: 'exclusive', currencySymbol: '£', desc: '20% Standard Rate' },
    { id: 'uk_reduced', label: 'UK Reduced', icon: '⚡', amount: 500, rate: 5, mode: 'exclusive', currencySymbol: '£', desc: '5% Energy / Health' },
    { id: 'germany', label: 'Germany MwSt', icon: '🇩🇪', amount: 2000, rate: 19, mode: 'exclusive', currencySymbol: '€', desc: '19% Standard Rate' },
    { id: 'france', label: 'France TVA', icon: '🇫🇷', amount: 1500, rate: 20, mode: 'exclusive', currencySymbol: '€', desc: '20% Standard Rate' },
    { id: 'uae', label: 'UAE / GCC', icon: '🇦🇪', amount: 10000, rate: 5, mode: 'exclusive', currencySymbol: 'AED ', desc: '5% Standard Rate' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('amount', p.amount);
    setParam('rate', p.rate);
    setParam('mode', p.mode);
    setParam('currencySymbol', p.currencySymbol);
  };

  // Perform calculation
  const results = useMemo(() => {
    return calculateVatCalculator({
      amount,
      rate,
      mode,
      currencySymbol,
    });
  }, [amount, rate, mode, currencySymbol]);

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

  // Cost breakdown items for Tax Composition
  const taxItems = [
    { label: 'Net Base Taxable Price', amount: results.netAmount, colorClass: 'bg-primary', desc: 'Original commercial good/service value.' },
    { label: `Value Added Tax (${rate}%)`, amount: results.vatAmount, colorClass: 'bg-accent-amber', desc: `${rate}% VAT tax payable to tax authority.` },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Regional VAT Preset" />

      {/* 2. HERO DECISION BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-amber-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🏆 VAT TAX DECISION VERDICT
          </span>
          <span class="text-xs font-mono font-bold text-ink bg-surface-strong px-2.5 py-1 rounded-xl border border-hairline uppercase">
            {mode === 'inclusive' ? 'Tax Included (Reverse VAT)' : 'Tax Excluded (Add VAT)'}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Effective tax share is <strong>{results.effectiveRate}%</strong> of the final gross invoice.
        </p>

        {/* Quick Rate Slab Buttons */}
        <div class="pt-3 border-t border-hairline/60 flex items-center gap-2 flex-wrap">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-muted mr-1">Quick VAT Slabs:</span>
          {[0, 5, 10, 19, 20, 21].map((slab) => (
            <button
              key={slab}
              type="button"
              onClick={() => setParam('rate', slab)}
              class={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                rate === slab
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-canvas hover:bg-surface-soft border border-hairline text-ink'
              }`}
            >
              {slab}%
            </button>
          ))}
        </div>
      </div>

      {/* 3. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">VAT Tax Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="vat-amount"
            label={mode === 'inclusive' ? 'Gross Retail Price (Tax Included)' : 'Net Base Price (Pre-Tax)'}
            value={amount}
            min={10}
            max={1000000}
            step={50}
            prefix={currencySymbol}
            minLabel={`${currencySymbol}10`}
            maxLabel={`${currencySymbol}1 Million`}
            onChange={(v) => setParam('amount', v)}
          />

          <FormInputNumber
            id="vat-rate"
            label="VAT Tax Rate Percentage (%)"
            value={rate}
            min={0}
            max={50}
            step={0.5}
            suffix="%"
            minLabel="0%"
            maxLabel="50%"
            onChange={(v) => setParam('rate', v)}
          />

          <FormSelect
            id="vat-mode"
            label="Calculation Mode"
            value={mode}
            options={[
              { value: 'exclusive', label: 'Add VAT (Exclusive - Add tax to net base price)' },
              { value: 'inclusive', label: 'Remove VAT (Inclusive - Extract tax from gross price)' },
            ]}
            onChange={(v) => setParam('mode', v)}
          />

          <FormSelect
            id="currency-symbol"
            label="Display Currency Symbol"
            value={currencySymbol}
            options={[
              { value: '£', label: '£ (British Pound GBP)' },
              { value: '€', label: '€ (Euro EUR)' },
              { value: '$', label: '$ (US / AUS / CAN Dollar)' },
              { value: 'AED ', label: 'AED (UAE Dirham)' },
              { value: '₹', label: '₹ (Indian Rupee INR)' },
            ]}
            onChange={(v) => setParam('currencySymbol', v)}
          />
        </div>

        {/* Right Panel: Output Dashboard & Charts */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Final Gross Invoice Price"
            primaryValue={fmt(results.grossAmount)}
            secondaryItems={[
              { label: 'Net Taxable Base Price', value: fmt(results.netAmount) },
              { label: 'Value Added Tax (VAT)', value: fmt(results.vatAmount) },
              { label: 'Effective Tax Share', value: `${results.effectiveRate}%` },
              { label: 'Tax per 100 Base', value: fmt(results.taxPer100) },
            ]}
          />

          <ResultDonutChart
            title="Invoice Price Composition"
            centerValue={fmt(results.grossAmount)}
            centerSubtext="Total Bill"
            segments={[
              { label: 'Net Base Price', amount: results.netAmount, colorClass: 'bg-primary' },
              { label: 'VAT Tax Amount', amount: results.vatAmount, colorClass: 'bg-accent-amber' },
            ]}
          />
        </div>
      </div>

      {/* 4. ITEMISED COMMERCIAL TAX INVOICE PREVIEW */}
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-strong border-2 border-hairline font-mono space-y-4 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-bold text-primary uppercase">📄 COMMERCIAL TAX INVOICE PREVIEW</span>
          <span class="text-xs text-muted">{results.invoicePreview.headline}</span>
        </div>
        <div class="space-y-2 text-xs text-ink">
          <div class="flex justify-between py-1 border-b border-hairline/60">
            <span>Net Taxable Value (Subtotal):</span>
            <span class="font-bold">{fmt(results.netAmount)}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-hairline/60">
            <span>Value Added Tax (VAT @ {rate}%):</span>
            <span class="font-bold text-accent-amber">{fmt(results.vatAmount)}</span>
          </div>
          <div class="flex justify-between py-2 text-sm font-bold text-primary">
            <span>Total Gross Invoice Amount:</span>
            <span>{fmt(results.grossAmount)}</span>
          </div>
        </div>
      </div>

      {/* 5. MULTI-RATE SCENARIO COMPARISON */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold font-heading text-ink">International Rate Sensitivity Matrix</h4>
          <span class="text-xs text-muted">Net Base: {fmt(results.netAmount)}</span>
        </div>
        <div class="grid sm:grid-cols-4 gap-4">
          <div class="p-4 bg-surface-strong border border-hairline rounded-2xl space-y-1 text-center">
            <span class="text-xs text-muted font-bold block uppercase">Zero-Rated (0%)</span>
            <span class="text-lg font-bold text-ink">{fmt(results.scenarios.zeroRated.grossAmount)}</span>
            <span class="text-[11px] text-semantic-success block font-bold">- {fmt(results.vatAmount)} Tax</span>
          </div>

          <div class="p-4 bg-surface-strong border border-hairline rounded-2xl space-y-1 text-center">
            <span class="text-xs text-muted font-bold block uppercase">Reduced (5%)</span>
            <span class="text-lg font-bold text-ink">{fmt(results.scenarios.reduced5.grossAmount)}</span>
            <span class="text-[11px] text-muted block font-bold">{fmt(results.scenarios.reduced5.vatAmount)} Tax</span>
          </div>

          <div class="p-4 bg-primary/10 border-2 border-primary/40 rounded-2xl space-y-1 text-center">
            <span class="text-xs text-primary font-bold block uppercase">Current ({results.scenarios.standardCurrent.rate}%)</span>
            <span class="text-lg font-bold text-primary">{fmt(results.scenarios.standardCurrent.grossAmount)}</span>
            <span class="text-[11px] text-primary block font-bold">Base Benchmark</span>
          </div>

          <div class="p-4 bg-surface-strong border border-hairline rounded-2xl space-y-1 text-center">
            <span class="text-xs text-muted font-bold block uppercase">EU Average (21%)</span>
            <span class="text-lg font-bold text-ink">{fmt(results.scenarios.euAverage21.grossAmount)}</span>
            <span class="text-[11px] text-semantic-warning block font-bold">+{fmt(results.scenarios.euAverage21.vatAmount - results.vatAmount)} Tax</span>
          </div>
        </div>
      </div>

      {/* 6. TAX COMPOSITION BREAKDOWN */}
      <CostBreakdownCard
        title="Tax Composition Breakdown"
        subtitle={`Total Gross Bill: ${fmt(results.grossAmount)}`}
        items={taxItems}
      />

      {/* 7. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 8. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Effective Tax Burden"
          value={`${results.effectiveRate}%`}
          subtitle={`Represents ${results.effectiveRate}% of the total consumer bill.`}
          badgeText="Gross Share"
          badgeColorClass="bg-accent-amber"
        />
        <InsightCard
          title="Reverse Tax Factor"
          value={`${results.reverseVat.taxFactor}%`}
          subtitle="Tax extraction multiplier for gross retail prices."
          badgeText="Reverse VAT"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 9. DECISION SUMMARY CARD (SCREENSHOT FRIENDLY) */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 VAT INVOICE DECISION SUMMARY</span>
          <span class="text-xs text-muted font-mono">{rate}% VAT Rate</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Net Base</span>
            <span class="text-base font-bold text-ink">{fmt(results.netAmount)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">VAT Tax</span>
            <span class="text-base font-bold text-accent-amber">{fmt(results.vatAmount)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Gross Total</span>
            <span class="text-base font-bold text-primary">{fmt(results.grossAmount)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Effective Tax</span>
            <span class="text-base font-bold text-ink">{results.effectiveRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
