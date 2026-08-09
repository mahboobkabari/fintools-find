import { useState, useMemo } from 'preact/hooks';
import { calculateCapitalGainsTaxCalculator } from '../../../calculators/tax/capital-gains-tax-calculator.js';
import { CAPITAL_GAINS_TAX_RATES_FY2025_26 } from '../../../data/tax-rates/capitalGainsTaxRates.js';
import { formatCurrency } from '@utils/formatters.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Library Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_CAPITAL_GAINS_STATE = {
  purchasePrice: 100000,
  salePrice: 250000,
  assetType: 'equity',
  holdingPeriodMonths: 18,
  transferExpenses: 0,
  improvementCost: 0,
  marginalTaxRate: 30,
};

const CAPITAL_GAINS_PARAM_MAP = {
  purchasePrice: 'pp',
  salePrice: 'sp',
  assetType: 'at',
  holdingPeriodMonths: 'm',
  transferExpenses: 'te',
  improvementCost: 'ic',
  marginalTaxRate: 'tr',
};

export default function CapitalGainsTaxFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_CAPITAL_GAINS_STATE, CAPITAL_GAINS_PARAM_MAP);
  const {
    purchasePrice,
    salePrice,
    assetType,
    holdingPeriodMonths,
    transferExpenses,
    improvementCost,
    marginalTaxRate,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Illustrative Smart Presets
  const presets = [
    { id: 'equity_ltcg', label: 'Listed Equity LTCG', icon: '📈', purchasePrice: 100000, salePrice: 250000, assetType: 'equity', holdingPeriodMonths: 18, desc: '₹1.5L Gain • Sec 112A ₹1.25L Exemption' },
    { id: 'equity_stcg', label: 'Listed Equity STCG', icon: '⚡', purchasePrice: 100000, salePrice: 200000, assetType: 'equity', holdingPeriodMonths: 6, desc: '₹1L Gain • Sec 111A 20% Tax' },
    { id: 'property', label: 'Real Estate Property', icon: '🏡', purchasePrice: 5000000, salePrice: 7500000, assetType: 'real_estate', holdingPeriodMonths: 36, desc: '₹25L Gain • 12.5% LTCG (No Indexation)' },
    { id: 'gold', label: 'Physical Gold', icon: '🪙', purchasePrice: 300000, salePrice: 500000, assetType: 'gold', holdingPeriodMonths: 30, desc: '₹2L Gain • 12.5% LTCG' },
    { id: 'debt_mf', label: 'Debt Mutual Fund', icon: '🏛️', purchasePrice: 500000, salePrice: 650000, assetType: 'debt_mf', holdingPeriodMonths: 36, desc: 'Sec 50AA Deemed STCG @ Slab Rate' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('purchasePrice', p.purchasePrice);
    setParam('salePrice', p.salePrice);
    setParam('assetType', p.assetType);
    setParam('holdingPeriodMonths', p.holdingPeriodMonths);
    setParam('transferExpenses', 0);
    setParam('improvementCost', 0);
  };

  // Run pure tax calculation engine
  const results = useMemo(() => {
    return calculateCapitalGainsTaxCalculator({
      purchasePrice,
      salePrice,
      assetType,
      holdingPeriodMonths,
      transferExpenses,
      improvementCost,
      marginalTaxRate,
    });
  }, [
    purchasePrice,
    salePrice,
    assetType,
    holdingPeriodMonths,
    transferExpenses,
    improvementCost,
    marginalTaxRate,
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

  // Dashboard Metrics items
  const dashboardMetrics = [
    { label: 'Estimated Tax Before Reinvestment', value: formatCurrency(results.taxPayable), highlight: true, subtitle: `Includes 4% Cess (${results.taxSection}) - Pre-Sec 54/54F` },
    { label: 'Net Capital Gain', value: formatCurrency(results.netCapitalGain), subtitle: 'Gross gain minus fees & costs' },
    { label: 'Taxable Capital Gain', value: formatCurrency(results.taxableGain), subtitle: 'After Section 112A exemption' },
    { label: 'Section 112A Exemption', value: formatCurrency(results.exemptionAmount), subtitle: 'Annual ₹1.25L equity threshold' },
    { label: 'Effective Tax Rate', value: `${results.effectiveTaxRatePct}%`, subtitle: 'Tax payable / Net gain' },
    { label: 'Net Post-Tax Profit', value: formatCurrency(results.netProfit), subtitle: 'Net profit retained' },
  ];

  // Donut Chart items for Net Profit vs Tax Allocation
  const taxDonutData = [
    { name: 'Net Post-Tax Profit Kept', value: Math.max(0, results.netProfit), color: '#10b981' },
    { name: 'Total Tax Payable', value: results.taxPayable, color: '#ef4444' },
  ];

  // Cost Basis & Tax Breakdown Items
  const costBreakdownItems = [
    {
      label: '1. Gross Sale Consideration',
      amount: results.salePrice,
      colorClass: 'bg-primary',
      desc: 'Total redemption proceeds or sale price.',
    },
    {
      label: '2. Transfer Expenses Deducted',
      amount: results.transferExpenses,
      colorClass: 'bg-accent-sky',
      desc: 'Brokerage, stamp duty, transfer fees.',
    },
    {
      label: '3. Total Cost Basis (Purchase + Improvement)',
      amount: results.totalCostBasis,
      colorClass: 'bg-accent-amber',
      desc: 'Original purchase price plus cost of improvement.',
    },
    {
      label: '4. Net Capital Gain',
      amount: results.netCapitalGain,
      colorClass: results.netCapitalGain > 0 ? 'bg-emerald-500' : 'bg-semantic-danger',
      desc: 'Net consideration minus total cost basis.',
    },
    {
      label: '5. Section 112A Annual Exemption Threshold',
      amount: results.exemptionAmount,
      colorClass: 'bg-emerald-400',
      desc: results.hasSec112aExemption ? 'Applied annual ₹1.25 Lakh exemption limit.' : 'Not applicable to non-equity assets.',
    },
    {
      label: '6. Net Taxable Capital Gain',
      amount: results.taxableGain,
      colorClass: 'bg-primary',
      desc: 'Portion subject to tax rates.',
    },
    {
      label: `7. Total Tax Payable (${results.taxSection} @ ${results.applicableTaxRate}% + 4% Cess)`,
      amount: results.taxPayable,
      colorClass: 'bg-semantic-danger',
      desc: `Base tax ${formatCurrency(results.baseTax)} + Cess ${formatCurrency(results.cessAmount)}.`,
    },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Smart Presets Section */}
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono text-body font-semibold uppercase tracking-wider">
            Illustrative Asset Sale Scenarios
          </span>
          <span class="text-[11px] font-mono text-body-muted bg-surface px-2 py-0.5 rounded border border-hairline">
            Illustrative Examples ({results.financialYear} / {results.assessmentYear})
          </span>
        </div>
        <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Asset Sale Preset" />
      </div>

      {/* 2. PROMINENT QUESTION BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider">
            ⚖️ CAPITAL GAINS TAX VERDICT ({results.financialYear})
          </span>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-body-muted">Rule: Finance Act 2024</span>
            <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${results.healthColor}`}>
              Tax Efficiency Score: {results.score}/100 ({results.healthStatus})
            </span>
          </div>
        </div>

        {/* UX PROMINENT QUESTIONS */}
        <div class="grid md:grid-cols-3 gap-4 pt-2">
          <div class="p-4 rounded-2xl bg-canvas border border-hairline space-y-1">
            <div class="text-xs font-mono text-body-muted uppercase font-bold">1. How much capital gain made?</div>
            <div class={`text-2xl sm:text-3xl font-extrabold font-heading ${results.netCapitalGain > 0 ? 'text-emerald-500' : 'text-semantic-danger'}`}>
              {formatCurrency(results.netCapitalGain)}
            </div>
            <div class="text-[11px] text-body-muted font-mono">{results.isLongTerm ? 'Long-Term Capital Gain (LTCG)' : 'Short-Term Capital Gain (STCG)'}</div>
          </div>

          <div class="p-4 rounded-2xl bg-canvas border border-hairline space-y-1">
            <div class="text-xs font-mono text-body-muted uppercase font-bold">2. How much tax will I pay?</div>
            <div class="text-2xl sm:text-3xl font-extrabold font-heading text-semantic-danger">
              {formatCurrency(results.taxPayable)}
            </div>
            <div class="text-[11px] text-body-muted font-mono">{results.taxSection} @ {results.applicableTaxRate}% + 4% Cess</div>
          </div>

          <div class="p-4 rounded-2xl bg-canvas border border-hairline space-y-1">
            <div class="text-xs font-mono text-body-muted uppercase font-bold">3. How much kept after tax?</div>
            <div class="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
              {formatCurrency(results.netProfit)}
            </div>
            <div class="text-[11px] text-body-muted font-mono">{results.effectiveTaxRatePct}% effective tax rate</div>
          </div>
        </div>

        <p class="text-xs sm:text-sm text-body leading-relaxed pt-1">
          {results.healthDesc}
        </p>

        {/* Marginal Slab Rate Notice */}
        {results.rateType === 'slab' && (
          <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-mono flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              <strong>Slab Rate Assumption Notice:</strong> Short-term capital gains for this asset class are taxed at your applicable income tax slab rate. Estimated using an <strong>illustrative {results.applicableTaxRate}% marginal tax-rate assumption</strong>.
            </span>
          </div>
        )}

        {/* SGB Limitation Notice */}
        {assetType === 'gold' && (
          <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 text-xs font-mono flex items-center gap-2">
            <span>💡</span>
            <span>
              <strong>Sovereign Gold Bond (SGB) Limitation Note:</strong> Sovereign Gold Bonds redeemed at maturity by an individual taxpayer are 100% tax-free under Section 47(viib). Transfers before maturity follow standard physical gold LTCG/STCG rules shown above.
            </span>
          </div>
        )}
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Control Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <h3 class="text-xl font-bold font-heading text-ink">Asset Sale Parameters</h3>
              <p class="text-xs text-body-muted font-mono mt-0.5">{results.financialYear} / {results.assessmentYear} Tax Rules</p>
            </div>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Asset Class Selector */}
          <div class="space-y-2">
            <label class="block text-xs font-bold font-heading text-ink">Target Asset Category</label>
            <select
              value={assetType}
              onChange={(e) => setParam('assetType', e.target.value)}
              class="w-full p-3 rounded-2xl border border-hairline bg-surface text-ink text-xs font-mono font-bold focus:outline-none focus:border-primary"
            >
              {Object.values(CAPITAL_GAINS_TAX_RATES_FY2025_26.assetClasses).map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.name}
                </option>
              ))}
            </select>
          </div>

          <FormInputNumber
            id="purchase-price-input"
            label="Original Purchase Cost (₹)"
            value={purchasePrice}
            min={1000}
            max={100000000}
            step={10000}
            prefix="₹"
            minLabel="₹1k"
            maxLabel="₹10Cr"
            onChange={(v) => setParam('purchasePrice', v)}
          />

          <FormInputNumber
            id="sale-price-input"
            label="Gross Sale Price / Redemption Proceeds (₹)"
            value={salePrice}
            min={0}
            max={200000000}
            step={10000}
            prefix="₹"
            minLabel="₹0"
            maxLabel="₹20Cr"
            onChange={(v) => setParam('salePrice', v)}
          />

          <FormInputNumber
            id="holding-period-input"
            label="Holding Period Duration (Months)"
            value={holdingPeriodMonths}
            min={1}
            max={120}
            step={1}
            prefix=""
            minLabel="1 Month"
            maxLabel="120 Months (10 Yrs)"
            onChange={(v) => setParam('holdingPeriodMonths', v)}
          />

          <FormInputNumber
            id="transfer-expenses-input"
            label="Brokerage & Transfer Expenses (₹)"
            value={transferExpenses}
            min={0}
            max={1000000}
            step={1000}
            prefix="₹"
            minLabel="₹0"
            maxLabel="₹10L"
            onChange={(v) => setParam('transferExpenses', v)}
          />

          <FormInputNumber
            id="improvement-cost-input"
            label="Cost of Improvement / Renovation (₹)"
            value={improvementCost}
            min={0}
            max={10000000}
            step={10000}
            prefix="₹"
            minLabel="₹0"
            maxLabel="₹1Cr"
            onChange={(v) => setParam('improvementCost', v)}
          />

          {/* Marginal Slab Rate Selector for Slab-Taxed Assets */}
          {results.rateType === 'slab' && (
            <div class="space-y-2 pt-2 border-t border-hairline">
              <label class="block text-xs font-bold font-heading text-ink">Your Marginal Income Tax Slab Rate (%)</label>
              <div class="grid grid-cols-5 gap-2">
                {[5, 10, 15, 20, 30].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setParam('marginalTaxRate', rate)}
                    class={`p-2.5 rounded-xl border text-center font-mono text-xs font-bold transition-all ${
                      marginalTaxRate === rate
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-hairline bg-surface text-body hover:bg-canvas'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Output Panel */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard metrics={dashboardMetrics} />

          <FinancialHealthGauge
            score={results.score}
            statusText={results.healthStatus}
            description={`Your net capital gain of ${formatCurrency(results.netCapitalGain)} yields an estimated tax payable of ${formatCurrency(results.taxPayable)} (${results.effectiveTaxRatePct}% effective tax rate).`}
          />

          <ResultDonutChart title="Net Profit vs Tax Payable" data={taxDonutData} />
        </div>
      </div>

      {/* 4. COST BASIS & TAX BREAKDOWN CARD */}
      <div class="space-y-4">
        <div>
          <h3 class="text-xl font-bold font-heading text-ink">Cost Basis & Tax Liability Breakdown</h3>
          <p class="text-xs text-body-muted font-mono mt-0.5">Step-by-step computation under Income Tax Act provisions</p>
        </div>

        <CostBreakdownCard title="Step-by-Step Capital Gains Computation" items={costBreakdownItems} />
      </div>

      {/* 5. HYPOTHETICAL 5-SCENARIO SIMULATOR GRID */}
      <div class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">Asset Sale Scenario Simulator</h3>
            <p class="text-xs text-body-muted font-mono mt-0.5">Evaluating price fluctuations, duration extensions, and fee changes</p>
          </div>
          <span class="text-xs font-mono text-body-muted">5 Hypothetical Models</span>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {results.scenarios.map((sc) => (
            <div key={sc.id} class="p-4 rounded-2xl bg-canvas border border-hairline space-y-2.5 shadow-soft hover:border-primary/50 transition-all">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-surface border border-hairline text-ink">{sc.badge}</span>
              </div>

              <div>
                <div class="text-[11px] text-body-muted font-mono truncate">{sc.name}</div>
                <div class="text-base font-extrabold font-heading text-ink">{formatCurrency(sc.salePrice)}</div>
              </div>

              <div class="space-y-1 text-[10px] font-mono pt-1.5 border-t border-hairline text-body-muted">
                <div class="flex justify-between"><span>Net Gain:</span><span class="text-ink font-bold">{formatCurrency(sc.netCapitalGain)}</span></div>
                <div class="flex justify-between"><span>Tax Payable:</span><span class="text-semantic-danger font-bold">{formatCurrency(sc.taxPayable)}</span></div>
                <div class="flex justify-between"><span>Net Proceeds:</span><span class="text-emerald-500 font-bold">{formatCurrency(sc.netProceeds)}</span></div>
                {sc.id !== 'current' && (
                  <div class="flex justify-between font-bold pt-1 border-t border-hairline text-ink">
                    <span>Tax Diff:</span>
                    <span class={sc.diffTaxFromBase <= 0 ? 'text-semantic-success' : 'text-semantic-danger'}>
                      {sc.diffTaxFromBase <= 0 ? formatCurrency(sc.diffTaxFromBase) : `+${formatCurrency(sc.diffTaxFromBase)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. DYNAMIC INSIGHT CARDS & RECOMMENDATION CARDS */}
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <h4 class="text-lg font-bold font-heading text-ink">Dynamic Tax Insights</h4>
          <div class="space-y-3">
            {results.dynamicInsights.map((ins, idx) => (
              <InsightCard key={idx} title={ins.title} metric={ins.value} description={ins.description} icon={ins.icon} />
            ))}
          </div>
        </div>

        <div class="space-y-4">
          <h4 class="text-lg font-bold font-heading text-ink">Capital Gains Tax Planning Tips</h4>
          <div class="space-y-3">
            <RecommendationCard
              title="Harvest Up to ₹1.25 Lakhs Equity LTCG Tax-Free"
              description="Under Section 112A, up to ₹1,25,000 of aggregate long-term capital gains from listed equity shares and equity mutual funds is completely tax-exempt every financial year."
              priority="high"
            />
            <RecommendationCard
              title="Deduct All Legitimate Transfer Expenses"
              description="Deduct brokerage fees, stamp duty, transition charges, and renovation costs from gross sales proceeds to minimize net taxable capital gains."
              priority="medium"
            />
            <RecommendationCard
              title="Set Off Short-Term & Long-Term Capital Losses"
              description="Short-term capital losses can be set off against both STCG and LTCG. Long-term capital losses can only be set off against long-term gains under Section 70/71."
              priority="low"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
