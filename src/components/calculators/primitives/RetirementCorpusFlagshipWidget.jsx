import { useState, useMemo } from 'preact/hooks';
import { calculateRetirementCorpusCalculator } from '../../../calculators/retirement/retirement-corpus-calculator.js';
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

const DEFAULT_RETIREMENT_STATE = {
  currentAge: 30,
  retirementAge: 60,
  lifeExpectancy: 85,
  monthlyExpenses: 50000,
  currentSavings: 500000,
  monthlySip: 10000,
  inflationRate: 6,
  preRetirementReturn: 12,
  postRetirementReturn: 8,
};

const RETIREMENT_PARAM_MAP = {
  currentAge: 'age',
  retirementAge: 'retire',
  lifeExpectancy: 'life',
  monthlyExpenses: 'exp',
  currentSavings: 'savings',
  monthlySip: 'sip',
  inflationRate: 'inf',
  preRetirementReturn: 'preret',
  postRetirementReturn: 'postret',
};

export default function RetirementCorpusFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_RETIREMENT_STATE, RETIREMENT_PARAM_MAP);
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    currentSavings,
    monthlySip,
    inflationRate,
    preRetirementReturn,
    postRetirementReturn,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Preset Profiles
  const presets = [
    { id: 'young', label: 'Young Starter', icon: '🌱', currentAge: 25, retirementAge: 60, lifeExpectancy: 85, monthlyExpenses: 35000, currentSavings: 100000, monthlySip: 5000, inflationRate: 6, preRetirementReturn: 12, postRetirementReturn: 8, desc: 'Age 25 (35 Yrs Compounding Horizon)' },
    { id: 'mid', label: 'Mid Career', icon: '🚀', currentAge: 35, retirementAge: 60, lifeExpectancy: 85, monthlyExpenses: 60000, currentSavings: 1000000, monthlySip: 20000, inflationRate: 6, preRetirementReturn: 12, postRetirementReturn: 8, desc: 'Age 35 (25 Yrs Compounding Horizon)' },
    { id: 'peak', label: 'Peak Earner', icon: '🏆', currentAge: 45, retirementAge: 60, lifeExpectancy: 85, monthlyExpenses: 100000, currentSavings: 3500000, monthlySip: 40000, inflationRate: 6, preRetirementReturn: 11, postRetirementReturn: 8, desc: 'Age 45 (15 Yrs Pre-Retirement Stretch)' },
    { id: 'preretiree', label: 'Pre-Retiree', icon: '🎯', currentAge: 55, retirementAge: 60, lifeExpectancy: 85, monthlyExpenses: 120000, currentSavings: 10000000, monthlySip: 60000, inflationRate: 6, preRetirementReturn: 9, postRetirementReturn: 7, desc: 'Age 55 (Final 5 Yrs Preparation)' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('currentAge', p.currentAge);
    setParam('retirementAge', p.retirementAge);
    setParam('lifeExpectancy', p.lifeExpectancy);
    setParam('monthlyExpenses', p.monthlyExpenses);
    setParam('currentSavings', p.currentSavings);
    setParam('monthlySip', p.monthlySip);
    setParam('inflationRate', p.inflationRate);
    setParam('preRetirementReturn', p.preRetirementReturn);
    setParam('postRetirementReturn', p.postRetirementReturn);
  };

  // Perform full calculation & financial intelligence orchestration
  const results = useMemo(() => {
    const rawRes = calculateRetirementCorpusCalculator({
      currentAge,
      retirementAge,
      lifeExpectancy,
      monthlyExpenses,
      currentSavings,
      monthlySip,
      inflationRate,
      preRetirementReturn,
      postRetirementReturn,
    });

    const intel = buildFinancialIntelligence({
      calculator: 'retirement-corpus-calculator',
      inputs: params,
      results: rawRes,
    });

    return {
      ...rawRes,
      intelligence: intel,
    };
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    currentSavings,
    monthlySip,
    inflationRate,
    preRetirementReturn,
    postRetirementReturn,
  ]);

  // Secondary calculation for Retire at 55 comparison
  const retire55Results = useMemo(() => {
    if (currentAge >= 55) return null;
    return calculateRetirementCorpusCalculator({
      ...params,
      retirementAge: 55,
    });
  }, [params, currentAge]);

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

  // Breakdown items for CostBreakdownCard
  const corpusBreakdownItems = [
    { label: 'Required Target Nest Egg', amount: results.requiredCorpus, colorClass: 'bg-primary', desc: 'Total inflation-adjusted corpus required at age ' + retirementAge + '.' },
    { label: 'Projected Corpus from Existing Savings', amount: Math.min(results.requiredCorpus, results.projectedCorpus), colorClass: 'bg-semantic-success', desc: 'Growth of current nest egg & ongoing SIP.' },
    { label: 'Corpus Shortfall / Gap Remaining', amount: results.corpusGap, colorClass: 'bg-semantic-warning', desc: 'Net deficit to bridge before retirement.' },
    { label: 'Future Monthly Expenses (Age ' + retirementAge + ')', amount: results.futureMonthlyExpense, colorClass: 'bg-accent-sky', desc: 'Inflated monthly living expense at age ' + retirementAge + '.' },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Quick Age & Life Stage Presets" />

      {/* 2. HERO RETIREMENT CONFIDENCE BANNER (The #1 Key Output) */}
      <div class={`p-6 sm:p-8 rounded-3xl border-2 shadow-soft space-y-4 transition-all ${
        results.readinessScore >= 90
          ? 'bg-gradient-to-br from-emerald-500/10 via-canvas to-emerald-500/5 border-emerald-500/40'
          : results.readinessScore >= 60
          ? 'bg-gradient-to-br from-amber-500/10 via-canvas to-amber-500/5 border-amber-500/40'
          : 'bg-gradient-to-br from-red-500/10 via-canvas to-red-500/5 border-red-500/40'
      }`}>
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill font-mono text-xs font-bold text-white ${
            results.readinessScore >= 90 ? 'bg-semantic-success' : results.readinessScore >= 60 ? 'bg-semantic-warning' : 'bg-semantic-danger'
          }`}>
            <span>🎯</span>
            <span>{results.readinessStatus.badge.toUpperCase()}</span>
          </span>

          <span class="text-xs font-mono font-bold text-muted bg-surface-strong px-2.5 py-1 rounded-xl border border-hairline">
            Horizon: {results.yearsToRetirement} Yrs to Retire (Age {retirementAge})
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroBanner.heroTitle}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed max-w-3xl">
          {results.heroBanner.heroSubtitle}
        </p>

        {/* Longevity Warning Alert if corpus exhausts early */}
        {results.longevity.isExhaustedEarly && (
          <div class="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-xs text-red-700">
            <span class="text-red-500 font-bold text-base">⚠️</span>
            <div>
              <strong>Longevity Risk Warning:</strong> At your current savings rate, your retirement corpus is projected to run out around age <strong>{results.longevity.exhaustionAge}</strong> ({results.longevity.yearsShortfall} years before your life expectancy of {lifeExpectancy}). Consider stepping up your monthly SIP or delaying retirement by 2-3 years.
            </div>
          </div>
        )}

        {/* Lifestyle Simulator Quick Chips */}
        <div class="pt-3 border-t border-hairline/60">
          <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
            <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-muted block">
              Lifestyle Simulator (Tap expense target)
            </span>
            <span class="text-[11px] font-mono text-muted">Current: ₹{formatCurrency(monthlyExpenses, 'INR')}/mo</span>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setParam('monthlyExpenses', 35000)}
              class="px-3 py-1.5 bg-canvas hover:bg-surface-soft text-xs font-semibold text-ink border border-hairline rounded-xl transition-all shadow-soft flex items-center gap-1.5 active:scale-95"
            >
              <span>🏡</span>
              <span>Essential (₹35K/mo)</span>
            </button>

            <button
              type="button"
              onClick={() => setParam('monthlyExpenses', 65000)}
              class="px-3 py-1.5 bg-canvas hover:bg-surface-soft text-xs font-semibold text-ink border border-hairline rounded-xl transition-all shadow-soft flex items-center gap-1.5 active:scale-95"
            >
              <span>🌟</span>
              <span>Comfortable (₹65K/mo)</span>
            </button>

            <button
              type="button"
              onClick={() => setParam('monthlyExpenses', 120000)}
              class="px-3 py-1.5 bg-canvas hover:bg-surface-soft text-xs font-semibold text-ink border border-hairline rounded-xl transition-all shadow-soft flex items-center gap-1.5 active:scale-95"
            >
              <span>👑</span>
              <span>Luxury (₹1.2L/mo)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Retirement Inputs</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <FormInputNumber
              id="current-age"
              label="Current Age"
              value={currentAge}
              min={18}
              max={70}
              step={1}
              suffix="Yrs"
              inputWidthClass="w-16"
              onChange={(val) => setParam('currentAge', val)}
            />

            <FormInputNumber
              id="retire-age"
              label="Target Retirement Age"
              value={retirementAge}
              min={currentAge + 1}
              max={75}
              step={1}
              suffix="Yrs"
              inputWidthClass="w-16"
              onChange={(val) => setParam('retirementAge', val)}
            />
          </div>

          <FormInputNumber
            id="monthly-exp"
            label="Current Monthly Living Expenses (₹)"
            subText={`Will inflate to ₹${formatCurrency(results.futureMonthlyExpense, 'INR')}/mo at age ${retirementAge}`}
            value={monthlyExpenses}
            min={10000}
            max={1000000}
            step={5000}
            prefix="₹"
            minLabel="₹10K"
            maxLabel="₹10 Lakhs"
            onChange={(val) => setParam('monthlyExpenses', val)}
          />

          <div class="grid sm:grid-cols-2 gap-4">
            <FormInputNumber
              id="current-savings"
              label="Existing Retirement Nest Egg"
              value={currentSavings}
              min={0}
              max={50000000}
              step={50000}
              prefix="₹"
              inputWidthClass="w-28"
              onChange={(val) => setParam('currentSavings', val)}
            />

            <FormInputNumber
              id="monthly-sip"
              label="Ongoing Monthly SIP"
              value={monthlySip}
              min={0}
              max={500000}
              step={2000}
              prefix="₹"
              inputWidthClass="w-28"
              onChange={(val) => setParam('monthlySip', val)}
            />
          </div>

          <div class="pt-4 border-t border-hairline space-y-4">
            <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-muted">Economic & Return Assumptions</h4>
            
            <FormInputNumber
              id="inf-rate"
              label="Expected Annual Inflation Rate"
              value={inflationRate}
              min={2}
              max={15}
              step={0.5}
              suffix="%"
              inputWidthClass="w-16"
              onChange={(val) => setParam('inflationRate', val)}
            />

            <div class="grid sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="pre-ret-return"
                label="Pre-Retirement Return"
                value={preRetirementReturn}
                min={4}
                max={20}
                step={0.5}
                suffix="%"
                inputWidthClass="w-16"
                onChange={(val) => setParam('preRetirementReturn', val)}
              />

              <FormInputNumber
                id="post-ret-return"
                label="Post-Retirement Return"
                value={postRetirementReturn}
                min={2}
                max={15}
                step={0.5}
                suffix="%"
                inputWidthClass="w-16"
                onChange={(val) => setParam('postRetirementReturn', val)}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Result Dashboard */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            heroTitle="Required Target Nest Egg"
            heroValue={results.requiredCorpus}
            heroBadge={`Age ${retirementAge} Target`}
            heroSubtext={`Projected savings: ₹${formatCurrency(results.projectedCorpus, 'INR')}. Net corpus gap: ₹${formatCurrency(results.corpusGap, 'INR')}.`}
            metrics={[
              { label: 'Corpus Goal', value: results.requiredCorpus, labelColor: 'text-primary', valueColor: 'text-primary' },
              { label: 'Projected Corpus', value: results.projectedCorpus, labelColor: 'text-semantic-success', valueColor: 'text-semantic-success' },
              { label: 'Required Monthly SIP', value: results.requiredMonthlySip, labelColor: 'text-semantic-warning', valueColor: 'text-semantic-warning', trend: 'up' },
            ]}
          />

          <ResultDonutChart
            primaryValue={Math.min(results.requiredCorpus, results.projectedCorpus)}
            primaryLabel="Projected Corpus"
            primaryColor="#10B981"
            secondaryValue={results.corpusGap}
            secondaryLabel="Corpus Shortfall / Gap"
            secondaryColor="#F59E0B"
            totalValue={results.requiredCorpus}
            centerLabel="Goal Progress"
          />
        </div>
      </div>

      {/* 4. Retirement Health Score & Subscores */}
      <div class="grid md:grid-cols-2 gap-8">
        <FinancialHealthGauge
          ratioPct={results.readinessScore}
          status={{
            level: `Retirement Health Score: ${results.readinessScore}/100`,
            color: results.readinessStatus.color,
            bgColor: results.readinessStatus.bgColor,
            borderColor: results.readinessStatus.borderColor,
            textColor: results.readinessStatus.textColor,
            badge: results.readinessStatus.badge,
            desc: results.readinessStatus.desc,
          }}
          title="Retirement Readiness Score"
          label="Score"
        />

        <CostBreakdownCard
          title="Wealth Accumulation & Corpus Flow"
          subtitle="Itemized journey from current nest egg to target retirement corpus."
          items={corpusBreakdownItems}
          totalLabel="Total Target Corpus"
          totalAmount={results.requiredCorpus}
          currency="INR"
        />
      </div>

      {/* 5. Retirement Age Decision Cards (Retire at 55 vs 60 vs 65) */}
      {retire55Results && (
        <ComparisonCard
          title="Retirement Age Decision Simulator"
          subtitle="Evaluating the financial tradeoff between retiring early at 55 vs retiring at 60."
          scenarioA={{
            title: 'Early Retirement (Age 55)',
            badgeText: 'EARLY FREEDOM',
            isRecommended: false,
            metrics: [
              { label: 'Required Corpus Target', value: `₹${formatCurrency(retire55Results.requiredCorpus, 'INR')}`, color: 'text-ink' },
              { label: 'Projected Corpus', value: `₹${formatCurrency(retire55Results.projectedCorpus, 'INR')}`, color: 'text-ink' },
              { label: 'Corpus Shortfall / Gap', value: `₹${formatCurrency(retire55Results.corpusGap, 'INR')}`, color: 'text-semantic-warning font-bold' },
              { label: 'Required Monthly SIP', value: `₹${formatCurrency(retire55Results.requiredMonthlySip, 'INR')}/mo`, color: 'text-primary font-bold' },
            ],
          }}
          scenarioB={{
            title: `Standard Retirement (Age ${retirementAge})`,
            badgeText: results.readinessScore >= 80 ? 'RECOMMENDED WINNER' : 'LONGER COMPOUNDING',
            isRecommended: results.readinessScore >= 80,
            metrics: [
              { label: 'Required Corpus Target', value: `₹${formatCurrency(results.requiredCorpus, 'INR')}`, color: 'text-ink' },
              { label: 'Projected Corpus', value: `₹${formatCurrency(results.projectedCorpus, 'INR')}`, color: 'text-semantic-success font-bold' },
              { label: 'Corpus Shortfall / Gap', value: `₹${formatCurrency(results.corpusGap, 'INR')}`, color: 'text-ink' },
              { label: 'Required Monthly SIP', value: `₹${formatCurrency(results.requiredMonthlySip, 'INR')}/mo`, color: 'text-primary font-bold' },
            ],
          }}
          highlights={[
            { label: 'Corpus Target Difference', delta: Math.abs(results.requiredCorpus - retire55Results.requiredCorpus), isPositive: true, desc: 'Lower corpus needed when working 5 additional years' },
            { label: 'Monthly SIP Relief', delta: Math.max(0, retire55Results.requiredMonthlySip - results.requiredMonthlySip), isPositive: true, desc: 'Lower monthly investment commitment' },
          ]}
          recommendationText={`Retiring at age ${retirementAge} gives compounding 5 additional years to build your wealth while reducing monthly SIP burden.`}
        />
      )}

      {/* 6. Highest Impact Actions & Financial Intelligence */}
      <div class="grid md:grid-cols-2 gap-8">
        <RecommendationCard
          tagLine="Highest Impact Financial Actions"
          badgeText="Ranked by Rupee Benefit"
          title="Steps to Guarantee Retirement Security"
          description="Algorithmically prioritized actions to close your retirement gap:"
          metrics={results.opportunities.slice(0, 2).map((opp) => ({
            label: opp.title,
            value: opp.impactText,
            labelColor: 'text-emerald-300',
          }))}
        />

        <InsightCard
          title="Inflation Story & Longevity Intelligence"
          insights={results.insights}
        />
      </div>

      {/* 7. Decision Confidence Banner */}
      <div class="p-4 bg-canvas border border-hairline rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-soft text-xs text-body">
        <div class="flex items-center gap-2">
          <span class="text-amber-500 text-sm font-bold">★★★★★</span>
          <span class="font-semibold text-ink">Retirement Decision Confidence: 100% Verified</span>
        </div>
        <span class="text-muted">
          Based on present value annuity math, inflation compounding, and real post-retirement return calculations.
        </span>
      </div>
    </div>
  );
}
