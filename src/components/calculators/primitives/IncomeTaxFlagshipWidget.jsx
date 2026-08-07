import { useState, useMemo } from 'preact/hooks';
import { calculateIncomeTax } from '../../../calculators/tax/income-tax-calculator.js';
import { buildFinancialIntelligence } from '../../../framework/financial-intelligence/FinancialIntelligenceOrchestrator.js';
import { formatCurrency } from '@utils/formatters.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Modular UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import ComparisonCard from '../../ui/ComparisonCard';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_TAX_STATE = {
  grossIncome: 1200000,
  sec80c: 150000,
  sec24b: 0,
  sec80d: 25000,
  nps80ccd: 0,
  hraExemption: 0,
};

const TAX_PARAM_MAP = {
  grossIncome: 'salary',
  sec80c: 'c80',
  sec24b: 'b24',
  sec80d: 'd80',
  nps80ccd: 'nps',
  hraExemption: 'hra',
};

export default function IncomeTaxFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_TAX_STATE, TAX_PARAM_MAP);
  const { grossIncome, sec80c, sec24b, sec80d, nps80ccd, hraExemption } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Preset Profiles
  const presets = [
    { id: 'firstjob', label: 'First Job', icon: '💼', grossIncome: 600000, sec80c: 50000, sec24b: 0, sec80d: 0, nps80ccd: 0, hraExemption: 0, desc: '₹6L Salary (Zero Tax under New Regime)' },
    { id: 'midcareer', label: 'Mid Career', icon: '🚀', grossIncome: 1200000, sec80c: 150000, sec24b: 0, sec80d: 25000, nps80ccd: 0, hraExemption: 0, desc: '₹12L Salary @ Mid Tax Bracket' },
    { id: 'senior', label: 'Senior Pro', icon: '🏆', grossIncome: 2500000, sec80c: 150000, sec24b: 200000, sec80d: 50000, nps80ccd: 50000, hraExemption: 120000, desc: '₹25L Salary with Full Deductions' },
    { id: 'highincome', label: 'High Income', icon: '👑', grossIncome: 5000000, sec80c: 150000, sec24b: 200000, sec80d: 50000, nps80ccd: 50000, hraExemption: 200000, desc: '₹50L HNI Executive Profile' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('grossIncome', p.grossIncome);
    setParam('sec80c', p.sec80c);
    setParam('sec24b', p.sec24b);
    setParam('sec80d', p.sec80d);
    setParam('nps80ccd', p.nps80ccd);
    setParam('hraExemption', p.hraExemption);
  };

  // Perform full calculation & financial intelligence orchestration
  const results = useMemo(() => {
    const rawRes = calculateIncomeTax({
      grossIncome,
      sec80c,
      sec24b,
      sec80d,
      nps80ccd,
      hraExemption,
    });

    const intel = buildFinancialIntelligence({
      calculator: 'income-tax-calculator',
      inputs: { grossIncome, sec80c, sec24b, sec80d, nps80ccd, hraExemption },
      results: rawRes,
    });

    return {
      ...rawRes,
      intelligence: intel,
    };
  }, [grossIncome, sec80c, sec24b, sec80d, nps80ccd, hraExemption]);

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

  // Effective Salary Breakdown items for CostBreakdownCard
  const salaryBreakdownItems = [
    { label: 'Gross Annual Salary', amount: results.grossIncome, colorClass: 'bg-primary', desc: 'Total gross taxable income.' },
    { label: 'Standard Deduction (FY 2025-26)', amount: results.winner.regime === 'new' ? results.newRegime.standardDeduction : results.oldRegime.standardDeduction, colorClass: 'bg-emerald-500', desc: 'Flat statutory standard deduction.' },
    { label: 'Claimed Deductions & Exemptions', amount: results.winner.regime === 'old' ? (results.oldRegime.totalDeductions - 50000) : 0, colorClass: 'bg-accent-sky', desc: 'Chapter VI-A investments (80C, 24b, 80D, NPS, HRA).' },
    { label: 'Net Taxable Income', amount: results.winner.regime === 'new' ? results.newRegime.taxableIncome : results.oldRegime.taxableIncome, colorClass: 'bg-surface-strong', desc: 'Income basis for tax slab calculation.' },
    { label: 'Income Tax Payable', amount: results.winner.totalTax, colorClass: 'bg-semantic-warning', desc: 'Total annual tax payable (including 4% Cess).' },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Quick Profile Presets" />

      {/* 2. HERO DECISION BANNER (The #1 Key Output) */}
      <div class={`p-6 sm:p-8 rounded-3xl border-2 shadow-soft space-y-3 transition-all ${
        results.heroDecision.isNewBetter
          ? 'bg-gradient-to-br from-emerald-500/10 via-canvas to-emerald-500/5 border-emerald-500/40'
          : 'bg-gradient-to-br from-blue-500/10 via-canvas to-blue-500/5 border-blue-500/40'
      }`}>
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill font-mono text-xs font-bold text-white ${
            results.heroDecision.isNewBetter ? 'bg-semantic-success' : 'bg-primary'
          }`}>
            <span>🏆</span>
            <span>{results.heroDecision.isNewBetter ? 'NEW TAX REGIME WINS' : 'OLD TAX REGIME WINS'}</span>
          </span>

          <span class="text-xs font-mono font-bold text-muted bg-surface-strong px-2.5 py-1 rounded-xl border border-hairline">
            FY 2025-26 Budget Slabs
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroDecision.heroDecisionTitle}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed max-w-3xl">
          {results.heroDecision.heroDecisionSubtitle}
        </p>

        {/* "What If?" Scenario Simulator Chips */}
        <div class="pt-3 border-t border-hairline/60">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-muted block mb-2">
            "What If?" Quick Scenario Simulator (Tap to add deduction)
          </span>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setParam('sec80c', Math.min(150000, sec80c + 50000))}
              class="px-3 py-1.5 bg-canvas hover:bg-surface-soft text-xs font-semibold text-ink border border-hairline rounded-xl transition-all shadow-soft flex items-center gap-1.5 active:scale-95"
            >
              <span class="text-semantic-success font-bold">+</span>
              <span>₹50K 80C</span>
            </button>

            <button
              type="button"
              onClick={() => setParam('nps80ccd', Math.min(50000, nps80ccd + 50000))}
              class="px-3 py-1.5 bg-canvas hover:bg-surface-soft text-xs font-semibold text-ink border border-hairline rounded-xl transition-all shadow-soft flex items-center gap-1.5 active:scale-95"
            >
              <span class="text-primary font-bold">+</span>
              <span>₹50K NPS</span>
            </button>

            <button
              type="button"
              onClick={() => setParam('sec80d', Math.min(75000, sec80d + 25000))}
              class="px-3 py-1.5 bg-canvas hover:bg-surface-soft text-xs font-semibold text-ink border border-hairline rounded-xl transition-all shadow-soft flex items-center gap-1.5 active:scale-95"
            >
              <span class="text-accent-sky font-bold">+</span>
              <span>₹25K Health Ins</span>
            </button>

            <button
              type="button"
              onClick={() => setParam('sec24b', Math.min(200000, sec24b + 200000))}
              class="px-3 py-1.5 bg-canvas hover:bg-surface-soft text-xs font-semibold text-ink border border-hairline rounded-xl transition-all shadow-soft flex items-center gap-1.5 active:scale-95"
            >
              <span class="text-accent-amber font-bold">+</span>
              <span>₹2L Home Loan Interest</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Income & Deductions</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="gross-income"
            label="Gross Annual Salary (₹)"
            value={grossIncome}
            min={300000}
            max={10000000}
            step={50000}
            prefix="₹"
            minLabel="₹3 Lakhs"
            maxLabel="₹1 Cr"
            onChange={(val) => setParam('grossIncome', val)}
          />

          <div class="pt-2 border-t border-hairline space-y-5">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-muted">Old Regime Deductions</h4>
              <span class="text-[11px] text-muted font-mono">Max limits applied</span>
            </div>

            <FormInputNumber
              id="sec-80c"
              label="Section 80C (PPF, ELSS, EPF)"
              subText="Max limit ₹1,50,000 / year"
              value={sec80c}
              min={0}
              max={150000}
              step={5000}
              prefix="₹"
              inputWidthClass="w-28"
              onChange={(val) => setParam('sec80c', val)}
            />

            <FormInputNumber
              id="sec-24b"
              label="Section 24(b) Home Loan Interest"
              subText="Max limit ₹2,00,000 / year"
              value={sec24b}
              min={0}
              max={200000}
              step={10000}
              prefix="₹"
              inputWidthClass="w-28"
              onChange={(val) => setParam('sec24b', val)}
            />

            <FormInputNumber
              id="sec-80d"
              label="Section 80D Health Insurance"
              subText="Max limit ₹75,000 / year"
              value={sec80d}
              min={0}
              max={75000}
              step={5000}
              prefix="₹"
              inputWidthClass="w-28"
              onChange={(val) => setParam('sec80d', val)}
            />

            <FormInputNumber
              id="nps-80ccd"
              label="Section 80CCD(1B) Additional NPS"
              subText="Max limit ₹50,000 / year"
              value={nps80ccd}
              min={0}
              max={50000}
              step={5000}
              prefix="₹"
              inputWidthClass="w-28"
              onChange={(val) => setParam('nps80ccd', val)}
            />

            <FormInputNumber
              id="hra-exemption"
              label="HRA Exemption Claimed"
              value={hraExemption}
              min={0}
              max={500000}
              step={10000}
              prefix="₹"
              inputWidthClass="w-28"
              onChange={(val) => setParam('hraExemption', val)}
            />
          </div>
        </div>

        {/* Right Panel: Result Dashboard */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            heroTitle="Annual Income Tax Payable"
            heroValue={results.winner.totalTax}
            heroBadge={`${results.winner.regime.toUpperCase()} REGIME`}
            heroSubtext={`Net annual in-hand salary: ₹${formatCurrency(results.winner.annualTakeHome, 'INR')} (~₹${formatCurrency(results.winner.monthlyTakeHome, 'INR')}/mo).`}
            metrics={[
              { label: 'Annual Tax', value: results.winner.totalTax, labelColor: 'text-semantic-warning', valueColor: 'text-semantic-warning', trend: 'up' },
              { label: 'Effective Tax Rate', value: `${results.winner.effectiveRate}%`, labelColor: 'text-primary', valueColor: 'text-primary' },
              { label: 'Monthly Take-Home', value: results.winner.monthlyTakeHome, labelColor: 'text-semantic-success', valueColor: 'text-semantic-success' },
            ]}
          />

          <ResultDonutChart
            primaryValue={results.winner.annualTakeHome}
            primaryLabel="Net Take-Home Salary"
            primaryColor="#10B981"
            secondaryValue={results.winner.totalTax}
            secondaryLabel="Total Income Tax & Cess"
            secondaryColor="#F59E0B"
            totalValue={results.grossIncome}
            centerLabel="Take-Home"
          />
        </div>
      </div>

      {/* 4. Real-time New Regime vs Old Regime Comparison */}
      <ComparisonCard
        title="Real-Time Regime Comparison (Old vs. New)"
        subtitle="Side-by-side calculation showing your exact tax outgo under both regimes for FY 2025-26."
        scenarioA={{
          title: 'New Tax Regime (FY 2025-26 Slabs)',
          badgeText: results.heroDecision.isNewBetter ? 'RECOMMENDED (WINNER)' : 'HIGHER TAX',
          isRecommended: results.heroDecision.isNewBetter,
          metrics: [
            { label: 'Standard Deduction', value: `₹${formatCurrency(results.newRegime.standardDeduction, 'INR')}`, color: 'text-ink' },
            { label: 'Net Taxable Income', value: `₹${formatCurrency(results.newRegime.taxableIncome, 'INR')}`, color: 'text-ink' },
            { label: 'Total Annual Tax', value: `₹${formatCurrency(results.newRegime.totalTax, 'INR')}`, color: results.heroDecision.isNewBetter ? 'text-semantic-success font-bold' : 'text-semantic-warning' },
            { label: 'Monthly Take-Home', value: `₹${formatCurrency(results.newRegime.monthlyTakeHome, 'INR')}/mo`, color: 'text-primary font-bold' },
          ],
        }}
        scenarioB={{
          title: 'Old Tax Regime (With Deductions)',
          badgeText: !results.heroDecision.isNewBetter ? 'RECOMMENDED (WINNER)' : 'LOWER DEDUCTIONS',
          isRecommended: !results.heroDecision.isNewBetter,
          metrics: [
            { label: 'Total Deductions Claimed', value: `₹${formatCurrency(results.oldRegime.totalDeductions, 'INR')}`, color: 'text-ink' },
            { label: 'Net Taxable Income', value: `₹${formatCurrency(results.oldRegime.taxableIncome, 'INR')}`, color: 'text-ink' },
            { label: 'Total Annual Tax', value: `₹${formatCurrency(results.oldRegime.totalTax, 'INR')}`, color: !results.heroDecision.isNewBetter ? 'text-semantic-success font-bold' : 'text-semantic-warning' },
            { label: 'Monthly Take-Home', value: `₹${formatCurrency(results.oldRegime.monthlyTakeHome, 'INR')}/mo`, color: 'text-primary font-bold' },
          ],
        }}
        highlights={[
          { label: 'Tax Difference Saved', delta: results.heroDecision.taxSavingsAmount, isPositive: true, desc: 'Rupees saved by selecting optimal regime' },
          { label: 'Monthly Take-Home Boost', delta: Math.round(results.heroDecision.taxSavingsAmount / 12), isPositive: true, desc: 'Additional in-hand monthly salary' },
        ]}
        recommendationText={results.heroDecision.heroDecisionSubtitle}
      />

      {/* 5. Tax Efficiency Score & Salary Breakdown */}
      <div class="grid md:grid-cols-2 gap-8">
        <FinancialHealthGauge
          ratioPct={results.taxScore.score}
          status={{
            level: `Tax Optimization Score: ${results.taxScore.score}/100`,
            color: results.taxScore.score >= 80 ? '#10B981' : results.taxScore.score >= 50 ? '#F59E0B' : '#EF4444',
            bgColor: results.taxScore.score >= 80 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
            borderColor: results.taxScore.score >= 80 ? 'border-emerald-500/30' : 'border-amber-500/30',
            textColor: results.taxScore.score >= 80 ? 'text-emerald-600' : 'text-amber-600',
            badge: `${results.taxScore.score >= 80 ? 'Highly Optimized' : 'Deduction Gaps Available'}`,
            desc: results.taxScore.reasons.slice(0, 3).join(' '),
          }}
          title="Tax Efficiency Score (0–100)"
          label="Score"
        />

        <CostBreakdownCard
          title="Effective Salary Breakdown"
          subtitle="Itemized journey from gross salary to net in-hand monthly pay."
          items={salaryBreakdownItems}
          totalLabel="Net Annual Take-Home"
          totalAmount={results.winner.annualTakeHome}
          currency="INR"
        />
      </div>

      {/* 6. Ranked Tax-Saving Opportunities & Smart Recommendations */}
      <div class="grid md:grid-cols-2 gap-8">
        <RecommendationCard
          tagLine="Ranked Tax Saving Opportunities"
          badgeText="Highest Impact First"
          title="Actionable Steps to Cut Income Tax"
          description="Algorithmically ranked deductions to maximize your tax savings:"
          metrics={results.opportunities.slice(0, 2).map((opp) => ({
            label: opp.title,
            value: `Save ₹${formatCurrency(opp.estimatedSavings, 'INR')}`,
            labelColor: 'text-emerald-300',
          }))}
        />

        <InsightCard
          title="Marginal Tax & Financial Intelligence"
          insights={results.insights}
        />
      </div>

      {/* 7. Decision Confidence Banner */}
      <div class="p-4 bg-canvas border border-hairline rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-soft text-xs text-body">
        <div class="flex items-center gap-2">
          <span class="text-amber-500 text-sm font-bold">★★★★★</span>
          <span class="font-semibold text-ink">Decision Confidence: 100% Verified</span>
        </div>
        <span class="text-muted">
          Based on official Indian Income Tax Act FY 2025-26 rules and your specified parameters.
        </span>
      </div>
    </div>
  );
}
