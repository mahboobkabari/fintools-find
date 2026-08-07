import { useState, useMemo } from 'preact/hooks';
import { calculateNpsCalculator } from '../../../calculators/retirement/nps-calculator.js';
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
import AmortizationTable from './AmortizationTable';

const DEFAULT_NPS_STATE = {
  monthlyInvestment: 10000,
  currentAge: 30,
  retirementAge: 60,
  expectedReturn: 10,
  annuityPercent: 40,
  expectedAnnuityRate: 6,
  inflationRate: 6,
  currentMonthlyIncome: 50000,
};

const NPS_PARAM_MAP = {
  monthlyInvestment: 'sip',
  currentAge: 'age',
  retirementAge: 'ret',
  expectedReturn: 'rate',
  annuityPercent: 'ann',
  expectedAnnuityRate: 'annr',
  inflationRate: 'inf',
  currentMonthlyIncome: 'inc',
};

export default function NpsFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_NPS_STATE, NPS_PARAM_MAP);
  const {
    monthlyInvestment, currentAge, retirementAge, expectedReturn,
    annuityPercent, expectedAnnuityRate, inflationRate, currentMonthlyIncome,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Career Profile Presets
  const presets = [
    { id: 'early', label: 'Early Career', icon: '🎓', monthlyInvestment: 5000, currentAge: 25, retirementAge: 60, expectedReturn: 10, desc: 'Age 25, ₹5K/mo' },
    { id: 'mid', label: 'Mid Career', icon: '💼', monthlyInvestment: 15000, currentAge: 35, retirementAge: 60, expectedReturn: 10, desc: 'Age 35, ₹15K/mo' },
    { id: 'late', label: 'Late Career', icon: '🏦', monthlyInvestment: 30000, currentAge: 45, retirementAge: 60, expectedReturn: 8, desc: 'Age 45, ₹30K/mo' },
    { id: 'aggressive', label: 'Aggressive Investor', icon: '🚀', monthlyInvestment: 20000, currentAge: 28, retirementAge: 60, expectedReturn: 12, desc: 'High Equity' },
    { id: 'maxTax', label: 'Max Tax Benefit', icon: '🛡️', monthlyInvestment: 4167, currentAge: 30, retirementAge: 60, expectedReturn: 10, desc: '₹50K/yr 80CCD(1B)' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('monthlyInvestment', p.monthlyInvestment);
    setParam('currentAge', p.currentAge);
    setParam('retirementAge', p.retirementAge);
    setParam('expectedReturn', p.expectedReturn);
  };

  // Perform calculation
  const results = useMemo(() => {
    return calculateNpsCalculator({
      monthlyInvestment,
      currentAge,
      retirementAge,
      expectedReturn,
      annuityPercent,
      expectedAnnuityRate,
      inflationRate,
      currentMonthlyIncome,
    });
  }, [monthlyInvestment, currentAge, retirementAge, expectedReturn, annuityPercent, expectedAnnuityRate, inflationRate, currentMonthlyIncome]);

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

  // Cost breakdown items for Corpus Composition
  const corpusItems = [
    { label: 'Your Total Contributions', amount: results.totalInvestment, colorClass: 'bg-primary', desc: 'Total monthly NPS contributions over investment period.' },
    { label: 'Wealth Created (Returns)', amount: results.interestEarned, colorClass: 'bg-emerald-500', desc: 'Investment returns compounded over time.' },
  ];

  // Withdrawal breakdown items
  const withdrawalItems = [
    { label: 'Tax-Free Lump Sum Withdrawal', amount: results.lumpSumAmount, colorClass: 'bg-primary', desc: `${100 - annuityPercent}% of corpus withdrawn as lump sum.` },
    { label: 'Annuity Purchase (Pension Fund)', amount: results.annuityCorpus, colorClass: 'bg-accent-amber', desc: `${annuityPercent}% of corpus used to purchase a pension annuity.` },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Retirement Profile Preset" />

      {/* 2. HERO DECISION BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🏆 RETIREMENT READINESS VERDICT
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline ${results.readinessColor}`}>
            Score: {results.readinessScore}/100 ({results.readinessStatus})
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          {results.readinessDesc}
        </p>
      </div>

      {/* 3. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">NPS Investment Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="nps-monthly"
            label="Monthly NPS Contribution (₹)"
            value={monthlyInvestment}
            min={500}
            max={200000}
            step={500}
            prefix="₹"
            minLabel="₹500"
            maxLabel="₹2 Lakhs"
            onChange={(v) => setParam('monthlyInvestment', v)}
          />

          <FormInputNumber
            id="current-age"
            label="Current Age (Years)"
            value={currentAge}
            min={18}
            max={59}
            step={1}
            suffix=" Years"
            minLabel="18 Yrs"
            maxLabel="59 Yrs"
            onChange={(v) => setParam('currentAge', v)}
          />

          <FormInputNumber
            id="retirement-age"
            label="Target Retirement Age"
            value={retirementAge}
            min={Math.max(currentAge + 1, 40)}
            max={70}
            step={1}
            suffix=" Years"
            minLabel="40 Yrs"
            maxLabel="70 Yrs"
            onChange={(v) => setParam('retirementAge', v)}
          />

          <FormInputNumber
            id="expected-return"
            label="Expected Annual Return (%)"
            value={expectedReturn}
            min={4}
            max={16}
            step={0.5}
            suffix="%"
            minLabel="4%"
            maxLabel="16%"
            onChange={(v) => setParam('expectedReturn', v)}
          />

          <FormInputNumber
            id="annuity-percent"
            label="Annuity Purchase (% of Corpus)"
            value={annuityPercent}
            min={40}
            max={100}
            step={5}
            suffix="%"
            minLabel="40% Min"
            maxLabel="100%"
            onChange={(v) => setParam('annuityPercent', v)}
          />

          <FormInputNumber
            id="annuity-rate"
            label="Expected Annuity Return (%)"
            value={expectedAnnuityRate}
            min={3}
            max={10}
            step={0.5}
            suffix="%"
            minLabel="3%"
            maxLabel="10%"
            onChange={(v) => setParam('expectedAnnuityRate', v)}
          />

          <FormInputNumber
            id="nps-inflation"
            label="Expected Inflation Rate (%)"
            value={inflationRate}
            min={0}
            max={12}
            step={0.5}
            suffix="%"
            minLabel="0%"
            maxLabel="12%"
            onChange={(v) => setParam('inflationRate', v)}
          />

          <FormInputNumber
            id="monthly-income"
            label="Current Net Monthly Income (₹)"
            value={currentMonthlyIncome}
            min={10000}
            max={1000000}
            step={5000}
            prefix="₹"
            minLabel="₹10,000"
            maxLabel="₹10 Lakhs"
            onChange={(v) => setParam('currentMonthlyIncome', v)}
          />
        </div>

        {/* Right Panel: Output Dashboard & Charts */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Estimated Monthly Pension"
            primaryValue={formatCurrency(results.monthlyPension)}
            secondaryItems={[
              { label: 'Retirement Corpus', value: formatCurrency(results.totalMaturityCorpus) },
              { label: 'Total Contributions', value: formatCurrency(results.totalInvestment) },
              { label: 'Tax-Free Lump Sum', value: formatCurrency(results.lumpSumAmount) },
              { label: 'Pension Replaces', value: `${results.replacementRatio}% of Income` },
            ]}
          />

          <ResultDonutChart
            title="Contributions vs Wealth Growth"
            centerValue={formatCurrency(results.totalMaturityCorpus)}
            centerSubtext="Retirement Corpus"
            segments={[
              { label: 'Your Contributions', amount: results.totalInvestment, colorClass: 'bg-primary' },
              { label: 'Investment Returns', amount: results.interestEarned, colorClass: 'bg-emerald-500' },
            ]}
          />

          <FinancialHealthGauge
            title="Retirement Readiness Score"
            score={results.readinessScore}
            statusLabel={results.readinessStatus}
            description={results.readinessDesc}
          />
        </div>
      </div>

      {/* 4. GROWTH PER ₹100 INVESTED */}
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-strong border border-hairline space-y-4 shadow-soft">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">Compounding Power</span>
            <h4 class="text-lg font-bold font-heading text-ink">Every ₹100 You Invest Grows To</h4>
          </div>
          <span class="text-2xl font-bold font-mono text-emerald-600">₹{results.growthPer100}</span>
        </div>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          For every <strong>₹100</strong> contributed to NPS, you accumulate approximately <strong>₹{results.growthPer100}</strong> by retirement at age {retirementAge} ({results.yearsInvested} years, {expectedReturn}% p.a.).
        </p>
      </div>

      {/* 5. INCREASE CONTRIBUTION SIMULATOR */}
      {results.increaseScenarios.length > 0 && (
        <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft">
          <div class="flex items-center gap-2 text-primary font-bold font-heading text-lg">
            <span>📈</span>
            <h3>"Increase Contribution" Simulator</h3>
          </div>
          <div class="grid sm:grid-cols-3 gap-3">
            {results.increaseScenarios.map((sc) => (
              <button
                key={sc.delta}
                type="button"
                onClick={() => setParam('monthlyInvestment', monthlyInvestment + sc.delta)}
                class="p-4 rounded-2xl bg-surface-strong hover:bg-surface-soft border border-hairline text-left transition-all space-y-2 group"
              >
                <span class="text-xs font-mono font-bold text-primary block uppercase">+₹{(sc.delta).toLocaleString('en-IN')}/mo</span>
                <span class="text-sm font-bold font-mono text-ink block">
                  Corpus: {formatCurrency(sc.newCorpus)}
                </span>
                <span class="text-xs font-mono text-semantic-success block font-bold">
                  +₹{sc.pensionGain.toLocaleString('en-IN')}/mo Pension
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. DELAY RETIREMENT SIMULATOR */}
      {results.delayScenarios.length > 0 && (
        <div class="p-6 sm:p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 space-y-4 shadow-soft">
          <div class="flex items-center gap-2 text-semantic-success font-bold font-heading text-lg">
            <span>⏳</span>
            <h3>"Delay Retirement" Wealth Simulator</h3>
          </div>
          <div class="grid sm:grid-cols-2 gap-4 font-mono">
            {results.delayScenarios.map((sc) => (
              <div key={sc.delayYears} class="p-4 bg-canvas rounded-2xl border border-hairline space-y-2">
                <span class="text-xs text-muted font-bold block uppercase">Retire at {sc.newRetAge} (+{sc.delayYears} Yrs)</span>
                <span class="text-lg font-bold text-ink block">{formatCurrency(sc.newCorpus)}</span>
                <span class="text-xs text-semantic-success font-bold block">
                  +{formatCurrency(sc.corpusGain)} Corpus | +{formatCurrency(sc.pensionGain)}/mo Pension
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. RETURN SENSITIVITY SCENARIO COMPARISON */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold font-heading text-ink">Market Return Sensitivity</h4>
          <span class="text-xs text-muted">±2% Scenario Range</span>
        </div>
        <div class="grid sm:grid-cols-3 gap-4">
          {results.returnScenarios.map((sc, idx) => {
            const labels = ['Conservative', 'Expected', 'Optimistic'];
            const styles = [
              'bg-surface-strong border-hairline',
              'bg-primary/10 border-primary/40 border-2',
              'bg-emerald-500/10 border-emerald-500/30',
            ];
            const textStyles = ['text-ink', 'text-primary', 'text-semantic-success'];
            return (
              <div key={sc.rate} class={`p-4 rounded-2xl border ${styles[idx]} space-y-1 text-center`}>
                <span class={`text-xs ${textStyles[idx]} font-bold block uppercase`}>{labels[idx]} ({sc.rate}%)</span>
                <span class={`text-lg font-bold ${textStyles[idx]}`}>{formatCurrency(sc.corpus)}</span>
                <span class={`text-[11px] ${textStyles[idx]} block`}>Pension: {formatCurrency(sc.pension)}/mo</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. CORPUS COMPOSITION BREAKDOWN */}
      <CostBreakdownCard
        title="Retirement Corpus Composition"
        subtitle={`Total corpus: ${formatCurrency(results.totalMaturityCorpus)}`}
        items={corpusItems}
      />

      {/* 9. WITHDRAWAL SPLIT BREAKDOWN */}
      <CostBreakdownCard
        title="NPS Withdrawal & Annuity Split"
        subtitle={`${100 - annuityPercent}% Lump Sum | ${annuityPercent}% Annuity Pension Fund`}
        items={withdrawalItems}
      />

      {/* 10. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 11. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Real Pension (After Inflation)"
          value={formatCurrency(results.realPensionMonthly)}
          subtitle={`Today's purchasing power of ₹${results.monthlyPension.toLocaleString('en-IN')}/mo pension.`}
          badgeText="Inflation Adjusted"
          badgeColorClass="bg-accent-amber"
        />
        <InsightCard
          title="Income Replacement Ratio"
          value={`${results.replacementRatio}%`}
          subtitle={`Pension covers ${results.replacementRatio}% of your ₹${currentMonthlyIncome.toLocaleString('en-IN')}/mo income.`}
          badgeText="Pension Adequacy"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 12. DECISION SUMMARY CARD (SCREENSHOT FRIENDLY) */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 NPS RETIREMENT DECISION SUMMARY</span>
          <span class="text-xs text-muted font-mono">{results.yearsInvested} Year Plan</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Retirement Corpus</span>
            <span class="text-base font-bold text-ink">{formatCurrency(results.totalMaturityCorpus)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Monthly Pension</span>
            <span class="text-base font-bold text-semantic-success">{formatCurrency(results.monthlyPension)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Lump Sum</span>
            <span class="text-base font-bold text-primary">{formatCurrency(results.lumpSumAmount)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Readiness</span>
            <span class={`text-base font-bold ${results.readinessColor}`}>{results.readinessScore}/100</span>
          </div>
        </div>
      </div>

      {/* 13. YEARLY GROWTH SCHEDULE TABLE */}
      <AmortizationTable schedule={results.yearlyBreakdown} />
    </div>
  );
}
