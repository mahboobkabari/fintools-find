import { useState, useMemo } from 'preact/hooks';
import { calculateGst } from '../../../calculators/tax/gst-calculator.js';
import { formatCurrency } from '@utils/formatters.js';
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

const DEFAULT_GST_STATE = {
  amount: 10000,
  gstRate: 18,
  gstType: 'exclusive',
  txType: 'intrastate',
};

const GST_PARAM_MAP = {
  amount: 'amt',
  gstRate: 'rate',
  gstType: 'type',
  txType: 'tx',
};

export default function GstFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_GST_STATE, GST_PARAM_MAP);
  const { amount, gstRate, gstType, txType } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Preset Industry Profiles
  const presets = [
    { id: 'restaurant', label: 'Restaurant & Food', icon: '🍽️', amount: 2000, gstRate: 5, gstType: 'exclusive', txType: 'intrastate', desc: '5% GST Slab' },
    { id: 'clothing', label: 'Apparel & Footwear', icon: '👕', amount: 5000, gstRate: 12, gstType: 'exclusive', txType: 'intrastate', desc: '12% GST Slab' },
    { id: 'electronics', label: 'Electronics & IT', icon: '💻', amount: 25000, gstRate: 18, gstType: 'exclusive', txType: 'intrastate', desc: '18% Standard GST' },
    { id: 'furniture', label: 'Furniture & Luxury', icon: '🛋️', amount: 50000, gstRate: 28, gstType: 'exclusive', txType: 'intrastate', desc: '28% Peak GST' },
    { id: 'interstate', label: 'Interstate B2B Services', icon: '🌐', amount: 100000, gstRate: 18, gstType: 'exclusive', txType: 'interstate', desc: '18% IGST Tax' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('amount', p.amount);
    setParam('gstRate', p.gstRate);
    setParam('gstType', p.gstType);
    setParam('txType', p.txType);
  };

  // Perform calculation
  const results = useMemo(() => {
    return calculateGst({
      amount,
      gstRate,
      gstType,
      txType,
    });
  }, [amount, gstRate, gstType, txType]);

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

  // Cost breakdown items for Tax Composition
  const taxItems = [
    { label: 'Base Net Price (Pre-Tax)', amount: results.netAmount, colorClass: 'bg-primary', desc: 'Original taxable product/service value.' },
    ...(txType === 'interstate'
      ? [{ label: 'Integrated Tax (IGST)', amount: results.igst, colorClass: 'bg-semantic-warning', desc: `${gstRate}% Interstate IGST charge.` }]
      : [
          { label: 'Central GST (CGST)', amount: results.cgst, colorClass: 'bg-semantic-warning', desc: `${(gstRate / 2).toFixed(1)}% Central tax share.` },
          { label: 'State GST (SGST)', amount: results.sgst, colorClass: 'bg-accent-amber', desc: `${(gstRate / 2).toFixed(1)}% State tax share.` },
        ]),
  ];

  return (
    <div class="space-y-10">
      {/* 1. Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Industry GST Preset" />

      {/* 2. HERO DECISION BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-amber-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🏆 GST TAX DECISION VERDICT
          </span>
          <span class="text-xs font-mono font-bold text-ink bg-surface-strong px-2.5 py-1 rounded-xl border border-hairline uppercase">
            {txType === 'interstate' ? 'Interstate (IGST)' : 'Intrastate (CGST + SGST)'}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Effective tax burden is <strong>{results.effectiveRate}%</strong> on final invoice.
        </p>

        {/* Quick Rate Slab Buttons */}
        <div class="pt-3 border-t border-hairline/60 flex items-center gap-2 flex-wrap">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-muted mr-1">Quick GST Slab:</span>
          {[5, 12, 18, 28].map((slab) => (
            <button
              key={slab}
              type="button"
              onClick={() => setParam('gstRate', slab)}
              class={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                gstRate === slab
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-canvas hover:bg-surface-soft border border-hairline text-ink'
              }`}
            >
              {slab}% Slab
            </button>
          ))}
        </div>
      </div>

      {/* 3. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">GST Tax Inputs</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="gst-amount"
            label={gstType === 'inclusive' ? 'Gross Invoice Price (Tax Included) (₹)' : 'Net Base Amount (Pre-Tax) (₹)'}
            value={amount}
            min={100}
            max={10000000}
            step={500}
            prefix="₹"
            minLabel="₹100"
            maxLabel="₹1 Crore"
            onChange={(v) => setParam('amount', v)}
          />

          <FormSelect
            id="gst-rate"
            label="GST Tax Rate Slab"
            value={String(gstRate)}
            options={[
              { value: '5', label: '5% (Essential Goods & Restaurants)' },
              { value: '12', label: '12% (Standard Apparel & Processed Food)' },
              { value: '18', label: '18% (Standard Electronics & IT Services)' },
              { value: '28', label: '28% (Luxury Goods & Automobiles)' },
            ]}
            onChange={(v) => setParam('gstRate', Number(v))}
          />

          <FormSelect
            id="gst-type"
            label="GST Mode"
            value={gstType}
            options={[
              { value: 'exclusive', label: 'Add GST (Exclusive - Add tax to base price)' },
              { value: 'inclusive', label: 'Remove GST (Inclusive - Extract tax from final price)' },
            ]}
            onChange={(v) => setParam('gstType', v)}
          />

          <FormSelect
            id="tx-type"
            label="Transaction Jurisdiction"
            value={txType}
            options={[
              { value: 'intrastate', label: 'Intrastate (Within same state -> CGST 50% + SGST 50%)' },
              { value: 'interstate', label: 'Interstate (Different state -> IGST 100%)' },
            ]}
            onChange={(v) => setParam('txType', v)}
          />
        </div>

        {/* Right Panel: Output Dashboard & Charts */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Final Invoice Gross Price"
            primaryValue={formatCurrency(results.grossAmount)}
            secondaryItems={[
              { label: 'Net Taxable Base Price', value: formatCurrency(results.netAmount) },
              { label: 'Total GST Payable', value: formatCurrency(results.gstAmount) },
              { label: txType === 'interstate' ? 'IGST (100%)' : 'CGST (50%)', value: formatCurrency(txType === 'interstate' ? results.igst : results.cgst) },
              { label: txType === 'interstate' ? 'Effective Tax' : 'SGST (50%)', value: txType === 'interstate' ? `${results.effectiveRate}%` : formatCurrency(results.sgst) },
            ]}
          />

          <ResultDonutChart
            title="Invoice Tax Composition"
            centerValue={formatCurrency(results.grossAmount)}
            centerSubtext="Total Invoice"
            segments={[
              { label: 'Net Base Amount', amount: results.netAmount, colorClass: 'bg-primary' },
              ...(txType === 'interstate'
                ? [{ label: 'IGST (100%)', amount: results.igst, colorClass: 'bg-semantic-warning' }]
                : [
                    { label: 'CGST (50%)', amount: results.cgst, colorClass: 'bg-semantic-warning' },
                    { label: 'SGST (50%)', amount: results.sgst, colorClass: 'bg-accent-amber' },
                  ]),
            ]}
          />
        </div>
      </div>

      {/* 4. ITEMISED B2B/B2C INVOICE PREVIEW CARD */}
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-strong border-2 border-hairline font-mono space-y-4 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-bold text-primary uppercase">📄 TAX INVOICE PREVIEW</span>
          <span class="text-xs text-muted">{results.invoicePreview.b2bHeadline}</span>
        </div>
        <div class="space-y-2 text-xs text-ink">
          <div class="flex justify-between py-1 border-b border-hairline/60">
            <span>Taxable Value (Pre-Tax):</span>
            <span class="font-bold">{formatCurrency(results.netAmount)}</span>
          </div>
          {txType === 'interstate' ? (
            <div class="flex justify-between py-1 border-b border-hairline/60">
              <span>Integrated Tax (IGST @ {gstRate}%):</span>
              <span class="font-bold text-semantic-warning">{formatCurrency(results.igst)}</span>
            </div>
          ) : (
            <>
              <div class="flex justify-between py-1 border-b border-hairline/60">
                <span>Central GST (CGST @ {(gstRate / 2).toFixed(1)}%):</span>
                <span class="font-bold text-semantic-warning">{formatCurrency(results.cgst)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline/60">
                <span>State GST (SGST @ {(gstRate / 2).toFixed(1)}%):</span>
                <span class="font-bold text-accent-amber">{formatCurrency(results.sgst)}</span>
              </div>
            </>
          )}
          <div class="flex justify-between py-2 text-sm font-bold text-primary">
            <span>Total Gross Invoice Amount:</span>
            <span>{formatCurrency(results.grossAmount)}</span>
          </div>
        </div>
      </div>

      {/* 5. GST SLAB RATE SCENARIO COMPARISON */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold font-heading text-ink">GST Slab Rate Comparison</h4>
          <span class="text-xs text-muted">Base: {formatCurrency(results.netAmount)}</span>
        </div>
        <div class="grid sm:grid-cols-3 gap-4">
          <div class="p-4 bg-surface-strong border border-hairline rounded-2xl space-y-1 text-center">
            <span class="text-xs text-muted font-bold block uppercase">No GST (0%)</span>
            <span class="text-lg font-bold text-ink">{formatCurrency(results.scenarios.noGst.grossAmount)}</span>
            <span class="text-[11px] text-semantic-success block font-bold">- {formatCurrency(results.gstAmount)} Tax</span>
          </div>

          <div class="p-4 bg-primary/10 border-2 border-primary/40 rounded-2xl space-y-1 text-center">
            <span class="text-xs text-primary font-bold block uppercase">Current ({results.scenarios.current.rate}%)</span>
            <span class="text-lg font-bold text-primary">{formatCurrency(results.scenarios.current.grossAmount)}</span>
            <span class="text-[11px] text-primary block font-bold">Base Benchmark</span>
          </div>

          <div class="p-4 bg-surface-strong border border-hairline rounded-2xl space-y-1 text-center">
            <span class="text-xs text-muted font-bold block uppercase">Higher (+5% Slab)</span>
            <span class="text-lg font-bold text-ink">{formatCurrency(results.scenarios.higher.grossAmount)}</span>
            <span class="text-[11px] text-semantic-warning block font-bold">+{formatCurrency(results.scenarios.higher.gstAmount - results.gstAmount)} Tax</span>
          </div>
        </div>
      </div>

      {/* 6. TAX COMPOSITION BREAKDOWN */}
      <CostBreakdownCard
        title="Tax Composition Breakdown"
        subtitle={`Total Gross Invoice: ${formatCurrency(results.grossAmount)}`}
        items={taxItems}
      />

      {/* 7. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 8. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Total Tax Burden"
          value={formatCurrency(results.gstAmount)}
          subtitle={`Adds ${results.effectiveRate}% to net base amount.`}
          badgeText="GST Charge"
          badgeColorClass="bg-semantic-warning"
        />
        <InsightCard
          title="Extracted Net Base Value"
          value={formatCurrency(results.reverseRes.netAmount)}
          subtitle="Taxable base value extracted from gross price."
          badgeText="Reverse GST"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 9. DECISION SUMMARY CARD (SCREENSHOT FRIENDLY) */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 GST INVOICE SUMMARY</span>
          <span class="text-xs text-muted font-mono">{gstRate}% GST Slab</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Net Base</span>
            <span class="text-base font-bold text-ink">{formatCurrency(results.netAmount)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">GST Tax</span>
            <span class="text-base font-bold text-semantic-warning">{formatCurrency(results.gstAmount)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Gross Total</span>
            <span class="text-base font-bold text-primary">{formatCurrency(results.grossAmount)}</span>
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
