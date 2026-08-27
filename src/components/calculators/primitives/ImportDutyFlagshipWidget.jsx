import { useState, useMemo } from 'preact/hooks';
import {
  calculateImportDuty,
  CURRENCY_METADATA,
} from '../../../calculators/currency/import-duty-calculator.js';
import { IMPORT_DUTY_CONFIG } from '../../../calculators/configs/import-duty-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_IMPORT_STATE = {
  unitPrice: 15000,
  quantity: 1,
  shippingCost: 2500,
  insuranceCost: 500,
  dutyRate: 10,
  surchargeRate: 10,
  vatGstRate: 18,
  handlingFee: 1200,
  valuationMethod: 'CIF',
  currency: 'INR',
  itemDescription: 'Imported Consumer Electronics',
};

const IMPORT_PARAM_MAP = {
  unitPrice: 'price',
  quantity: 'qty',
  shippingCost: 'ship',
  insuranceCost: 'ins',
  dutyRate: 'duty',
  surchargeRate: 'sur',
  vatGstRate: 'vat',
  handlingFee: 'hnd',
  valuationMethod: 'val',
  currency: 'curr',
  itemDescription: 'desc',
};

export default function ImportDutyFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_IMPORT_STATE, IMPORT_PARAM_MAP);
  const {
    unitPrice,
    quantity,
    shippingCost,
    insuranceCost,
    dutyRate,
    surchargeRate,
    vatGstRate,
    handlingFee,
    valuationMethod,
    currency,
    itemDescription,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('unitPrice', p.unitPrice);
    setParam('quantity', p.quantity);
    setParam('shippingCost', p.shippingCost);
    setParam('insuranceCost', p.insuranceCost);
    setParam('dutyRate', p.dutyRate);
    setParam('surchargeRate', p.surchargeRate);
    setParam('vatGstRate', p.vatGstRate);
    setParam('handlingFee', p.handlingFee);
    setParam('valuationMethod', p.valuationMethod);
    setParam('currency', p.currency || 'INR');
    setParam('itemDescription', p.itemDescription);
  };

  const results = useMemo(() => {
    return calculateImportDuty({
      unitPrice,
      quantity,
      shippingCost,
      insuranceCost,
      dutyRate,
      surchargeRate,
      vatGstRate,
      handlingFee,
      valuationMethod,
      currency,
      itemDescription,
    });
  }, [
    unitPrice,
    quantity,
    shippingCost,
    insuranceCost,
    dutyRate,
    surchargeRate,
    vatGstRate,
    handlingFee,
    valuationMethod,
    currency,
    itemDescription,
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

  const sym = results.currencyMeta.symbol;

  const breakdownItems = [
    {
      label: 'Base Product Value',
      amount: results.productValue,
      colorClass: 'bg-primary',
      desc: `${results.productShareOfLandedPct}% of Total Landed Cost`,
    },
    {
      label: 'Customs Duties & Import Taxes',
      amount: results.totalTaxBurden,
      colorClass: 'bg-rose-500',
      desc: `${results.dutyShareOfLandedPct}% of Total Landed Cost (+${results.effectiveDutyOnProductPct}% tax burden)`,
    },
    {
      label: 'Shipping & Transit Insurance',
      amount: results.shippingCost + results.insuranceCost,
      colorClass: 'bg-amber-500',
      desc: `${results.freightShareOfLandedPct}% of Total Landed Cost`,
    },
    {
      label: 'Customs Clearance & Handling',
      amount: results.handlingFee,
      colorClass: 'bg-indigo-500',
      desc: `${results.handlingShareOfLandedPct}% of Total Landed Cost`,
    },
  ];

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards
        presets={IMPORT_DUTY_CONFIG.presets}
        activePreset={activePreset}
        onSelect={applyPreset}
        label="Common International Trade &amp; Tariff Corridors"
      />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-amber-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            📦 IMPORT TARIFF &amp; LANDED COST AUDIT
          </span>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase text-primary bg-surface-strong">
            {results.metadata.baselineDate} · WTO GATT 1994 BASE
          </span>
        </div>

        <h2 class="text-2xl sm:text-4xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Base Order: <strong>{sym}{results.productValue.toLocaleString()}</strong> ({results.quantity} unit{results.quantity > 1 ? 's' : ''}) + Freight &amp; Insurance: <strong>{sym}{(results.shippingCost + results.insuranceCost).toLocaleString()}</strong> + Total Taxes: <strong>{sym}{results.totalTaxBurden.toLocaleString()}</strong> + Clearance: <strong>{sym}{results.handlingFee.toLocaleString()}</strong>.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Assessable Customs Value</span>
            <span class="text-sm font-bold text-ink">{sym}{results.assessableCustomsValue.toLocaleString()}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Total Taxes &amp; Duties</span>
            <span class="text-sm font-bold text-rose-600">{sym}{results.totalTaxBurden.toLocaleString()}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Total Landed Cost</span>
            <span class="text-sm font-bold text-primary">{sym}{results.totalLandedCost.toLocaleString()}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Landed Cost / Unit</span>
            <span class="text-sm font-bold text-indigo-600">{sym}{results.costPerUnit.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Customs &amp; Cargo Inputs</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label for="item-desc" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                Item / Commodity Description
              </label>
              <input
                id="item-desc"
                type="text"
                value={itemDescription}
                onInput={(e) => setParam('itemDescription', e.target.value)}
                class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-sans text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="unit-price"
                label="Unit Price"
                value={unitPrice}
                min={0}
                max={10000000}
                step={500}
                prefix={sym}
                onChange={(v) => setParam('unitPrice', v)}
              />
              <FormInputNumber
                id="quantity"
                label="Quantity"
                value={quantity}
                min={1}
                max={100000}
                step={1}
                suffix="Units"
                onChange={(v) => setParam('quantity', v)}
              />
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="shipping"
                label="Freight / Shipping Cost"
                value={shippingCost}
                min={0}
                max={1000000}
                step={250}
                prefix={sym}
                onChange={(v) => setParam('shippingCost', v)}
              />
              <FormInputNumber
                id="insurance"
                label="Cargo Insurance"
                value={insuranceCost}
                min={0}
                max={500000}
                step={100}
                prefix={sym}
                onChange={(v) => setParam('insuranceCost', v)}
              />
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="val-method" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Customs Valuation Base
                </label>
                <select
                  id="val-method"
                  value={valuationMethod}
                  onChange={(e) => setParam('valuationMethod', e.target.value)}
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="CIF">CIF (Product + Freight + Insurance)</option>
                  <option value="FOB">FOB (Product Value Only)</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label for="currency-select" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Currency
                </label>
                <select
                  id="currency-select"
                  value={currency}
                  onChange={(e) => setParam('currency', e.target.value)}
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.keys(CURRENCY_METADATA).map((code) => {
                    const c = CURRENCY_METADATA[code];
                    return (
                      <option key={code} value={code}>
                        {c.flag} {code} ({c.symbol})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="duty-rate"
                label="Basic Customs Duty (BCD)"
                value={dutyRate}
                min={0}
                max={100}
                step={0.5}
                suffix="% p.a."
                onChange={(v) => setParam('dutyRate', v)}
              />
              <FormInputNumber
                id="vat-rate"
                label="Import GST / VAT Rate"
                value={vatGstRate}
                min={0}
                max={100}
                step={1}
                suffix="%"
                onChange={(v) => setParam('vatGstRate', v)}
              />
            </div>

            {/* Advanced Toggle for SWS & Clearance Brokerage */}
            <div class="pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                class="text-xs font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{showAdvanced ? '− Hide Surcharges & Clearance Brokerage' : '+ Custom Surcharges (SWS) & Brokerage Handling Fee'}</span>
              </button>
            </div>

            {showAdvanced && (
              <div class="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-soft border border-hairline animate-fadeIn">
                <FormInputNumber
                  id="surcharge-rate"
                  label="Social Welfare Surcharge (SWS on Duty)"
                  value={surchargeRate}
                  min={0}
                  max={100}
                  step={1}
                  suffix="% of BCD"
                  onChange={(v) => setParam('surchargeRate', v)}
                />
                <FormInputNumber
                  id="handling-fee"
                  label="Clearance / Courier Brokerage Fee"
                  value={handlingFee}
                  min={0}
                  max={100000}
                  step={100}
                  prefix={sym}
                  onChange={(v) => setParam('handlingFee', v)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Landed Cost Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Total Landed Cost"
            primaryValue={`${sym}${results.totalLandedCost.toLocaleString()}`}
            secondaryItems={[
              { label: 'Total Duty & Taxes', value: `${sym}${results.totalTaxBurden.toLocaleString()}` },
              { label: 'Effective Tax Burden', value: `+${results.effectiveDutyOnProductPct}% on Base` },
              { label: 'Assessable Value', value: `${sym}${results.assessableCustomsValue.toLocaleString()}` },
              { label: 'Landed Cost / Unit', value: `${sym}${results.costPerUnit.toLocaleString()}` },
            ]}
          />

          <CostBreakdownCard
            title="Landed Cost Composition"
            subtitle={`Base Product (${sym}${results.productValue.toLocaleString()}) + Taxes (${sym}${results.totalTaxBurden.toLocaleString()}) + Freight & Handling`}
            items={breakdownItems}
          />

          {/* Sequential Tax Compounding Card */}
          <div class="p-6 bg-surface-soft border border-hairline rounded-3xl space-y-3">
            <h4 class="text-xs font-mono font-bold uppercase text-primary tracking-wider">
              Statutory Import Tax Compounding Base
            </h4>
            <div class="grid grid-cols-3 gap-2 text-center font-mono">
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">1. Basic Duty</span>
                <span class="text-xs font-bold text-ink">{sym}{results.basicDutyAmount.toLocaleString()}</span>
                <span class="text-[10px] text-muted block mt-0.5">{results.dutyRate}% of {results.valuationMethod}</span>
              </div>
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">2. SWS Surcharge</span>
                <span class="text-xs font-bold text-ink">{sym}{results.surchargeAmount.toLocaleString()}</span>
                <span class="text-[10px] text-muted block mt-0.5">{results.surchargeRate}% of Duty</span>
              </div>
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">3. Import GST/VAT</span>
                <span class="text-xs font-bold text-rose-600">{sym}{results.vatGstAmount.toLocaleString()}</span>
                <span class="text-[10px] text-muted block mt-0.5">{results.vatGstRate}% of Tax Base</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ITEMIZED AUDIT TABLE */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">
              Comprehensive Landed Cost &amp; Customs Audit Schedule
            </h3>
            <p class="text-xs text-muted mt-0.5">
              Itemized step-by-step customs assessment according to {results.valuationMethod} valuation
            </p>
          </div>
          <span class="text-xs font-mono font-bold text-primary bg-surface-strong px-3 py-1 rounded-pill border border-hairline">
            CUSTOMS AUDIT
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline bg-surface-soft text-muted uppercase">
                <th class="py-2.5 px-3">Cost Component</th>
                <th class="py-2.5 px-3">Statutory Basis / Rate</th>
                <th class="py-2.5 px-3">Amount</th>
                <th class="py-2.5 px-3">Share of Landed Cost</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">1. Base Product Value ({results.quantity} unit{results.quantity > 1 ? 's' : ''})</td>
                <td class="py-2.5 px-3 text-muted">{sym}{results.unitPrice.toLocaleString()} × {results.quantity}</td>
                <td class="py-2.5 px-3 text-ink font-bold">{sym}{results.productValue.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">{results.productShareOfLandedPct}%</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">2. International Freight &amp; Shipping</td>
                <td class="py-2.5 px-3 text-muted">Carrier Air/Ocean Freight</td>
                <td class="py-2.5 px-3 text-ink font-semibold">{sym}{results.shippingCost.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">{((results.shippingCost / results.totalLandedCost) * 100).toFixed(1)}%</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">3. Transit Cargo Insurance</td>
                <td class="py-2.5 px-3 text-muted">Marine / Transit Cargo Cover</td>
                <td class="py-2.5 px-3 text-ink font-semibold">{sym}{results.insuranceCost.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">{((results.insuranceCost / results.totalLandedCost) * 100).toFixed(1)}%</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors bg-surface-soft/30">
                <td class="py-2.5 px-3 font-bold text-primary">↳ Assessable Customs Value ({results.valuationMethod})</td>
                <td class="py-2.5 px-3 text-primary">{results.valuationMethod === 'CIF' ? 'Product + Freight + Insurance' : 'Product Value Only'}</td>
                <td class="py-2.5 px-3 text-primary font-bold">{sym}{results.assessableCustomsValue.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">—</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-rose-600">4. Basic Customs Duty (BCD)</td>
                <td class="py-2.5 px-3 text-rose-600">{results.dutyRate}% of Assessable Value</td>
                <td class="py-2.5 px-3 text-rose-600 font-bold">{sym}{results.basicDutyAmount.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">{((results.basicDutyAmount / results.totalLandedCost) * 100).toFixed(1)}%</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-rose-600">5. Social Welfare / Customs Surcharge</td>
                <td class="py-2.5 px-3 text-rose-600">{results.surchargeRate}% of Basic Customs Duty</td>
                <td class="py-2.5 px-3 text-rose-600 font-bold">{sym}{results.surchargeAmount.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">{((results.surchargeAmount / results.totalLandedCost) * 100).toFixed(1)}%</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-rose-600">6. Import GST / VAT (IGST)</td>
                <td class="py-2.5 px-3 text-rose-600">{results.vatGstRate}% of (Assessable + Duty + SWS)</td>
                <td class="py-2.5 px-3 text-rose-600 font-bold">{sym}{results.vatGstAmount.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">{((results.vatGstAmount / results.totalLandedCost) * 100).toFixed(1)}%</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-indigo-600">7. Customs Brokerage &amp; Courier Handling</td>
                <td class="py-2.5 px-3 text-muted">Fixed Clearance / Administrative Fee</td>
                <td class="py-2.5 px-3 text-indigo-600 font-bold">{sym}{results.handlingFee.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">{results.handlingShareOfLandedPct}%</td>
              </tr>
              <tr class="border-t-2 border-hairline font-bold bg-surface-soft/60">
                <td class="py-3 px-3 text-ink uppercase text-sm">Total Landed Cost</td>
                <td class="py-3 px-3 text-primary text-xs">All Duties + Freight + Taxes Included</td>
                <td class="py-3 px-3 text-primary font-black text-sm">{sym}{results.totalLandedCost.toLocaleString()}</td>
                <td class="py-3 px-3 text-ink text-sm">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ACTIONABLE RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 6. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Input Tax Credit (ITC) for Businesses"
          value="100% IGST Offset"
          subtitle="Registered businesses under GST/VAT regimes can typically claim the import IGST/VAT paid as an Input Tax Credit to offset domestic sales tax liabilities."
          badgeText="B2B Strategy"
          badgeColorClass="bg-emerald-500"
        />
        <InsightCard
          title="CIF vs. FOB Valuation Impact"
          value={results.valuationMethod}
          subtitle={results.valuationMethod === 'CIF' ? 'Under CIF, express international shipping increases assessable customs duty. Optimize freight packaging to lower duty.' : 'Under FOB, freight is excluded from customs duty assessment, reducing tax liabilities on high-freight cargo.'}
          badgeText="Customs Standard"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 7. EXECUTIVE VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 LANDED COST CUSTOMS VOUCHER</span>
          <span class="text-xs text-muted font-mono">{results.itemDescription}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Base Product</span>
            <span class="text-base font-bold text-ink">{sym}{results.productValue.toLocaleString()}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Total Taxes &amp; Duties</span>
            <span class="text-base font-bold text-rose-600">{sym}{results.totalTaxBurden.toLocaleString()}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Landed Cost</span>
            <span class="text-base font-bold text-primary">{sym}{results.totalLandedCost.toLocaleString()}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Landed Cost / Unit</span>
            <span class="text-base font-bold text-indigo-600">{sym}{results.costPerUnit.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
