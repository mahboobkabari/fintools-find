import { useState, useMemo } from 'preact/hooks';
import { calculateTermLifeInsuranceCalculator } from '../../../calculators/insurance/term-life-insurance-calculator.js';
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

const DEFAULT_TERM_INSURANCE_STATE = {
  currentAge: 30,
  gender: 'male',
  isSmoker: false,
  annualIncome: 1200000,
  existingLiabilities: 3000000,
  annualFamilyExpenses: 600000,
  expenseReplacementYears: 15,
  futureGoals: 2000000,
  existingAssets: 1000000,
  coverageYears: 35,
  sizingMethod: 'dime',
  customSumAssured: 15000000,
  criticalIllnessRider: false,
  accidentalRider: false,
  waiverOfPremiumRider: false,
  sipReturnRate: 12,
  currencySymbol: '₹',
};

const TERM_INSURANCE_PARAM_MAP = {
  currentAge: 'age',
  gender: 'g',
  isSmoker: 'smk',
  annualIncome: 'inc',
  existingLiabilities: 'debt',
  annualFamilyExpenses: 'exp',
  expenseReplacementYears: 'ry',
  futureGoals: 'goal',
  existingAssets: 'ast',
  coverageYears: 'cy',
  sizingMethod: 'sm',
  customSumAssured: 'csa',
  criticalIllnessRider: 'ci',
  accidentalRider: 'acc',
  waiverOfPremiumRider: 'wop',
  sipReturnRate: 'sip',
  currencySymbol: 'cur',
};

export default function TermLifeInsuranceFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_TERM_INSURANCE_STATE, TERM_INSURANCE_PARAM_MAP);
  const {
    currentAge,
    gender,
    isSmoker,
    annualIncome,
    existingLiabilities,
    annualFamilyExpenses,
    expenseReplacementYears,
    futureGoals,
    existingAssets,
    coverageYears,
    sizingMethod,
    customSumAssured,
    criticalIllnessRider,
    accidentalRider,
    waiverOfPremiumRider,
    sipReturnRate,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Demographic Presets
  const presets = [
    { id: 'young', label: 'Young Professional (25)', icon: '💼', currentAge: 25, gender: 'male', isSmoker: false, annualIncome: 800000, existingLiabilities: 500000, annualFamilyExpenses: 350000, expenseReplacementYears: 20, futureGoals: 1000000, existingAssets: 300000, coverageYears: 35, sizingMethod: 'dime', criticalIllnessRider: false, accidentalRider: false, waiverOfPremiumRider: false, currencySymbol: '₹', desc: '₹82L Cover · ₹5.7K/yr' },
    { id: 'parent', label: 'Family Parent (32)', icon: '👨‍👩‍👧', currentAge: 32, gender: 'male', isSmoker: false, annualIncome: 1800000, existingLiabilities: 4500000, annualFamilyExpenses: 800000, expenseReplacementYears: 18, futureGoals: 3500000, existingAssets: 1500000, coverageYears: 30, sizingMethod: 'dime', criticalIllnessRider: true, accidentalRider: true, waiverOfPremiumRider: true, currencySymbol: '₹', desc: '₹2.09 Cr Cover + 3 Riders' },
    { id: 'midcareer', label: 'Executive (42)', icon: '👔', currentAge: 42, gender: 'male', isSmoker: false, annualIncome: 3000000, existingLiabilities: 3000000, annualFamilyExpenses: 1200000, expenseReplacementYears: 15, futureGoals: 4000000, existingAssets: 4000000, coverageYears: 25, sizingMethod: 'dime', criticalIllnessRider: true, accidentalRider: false, waiverOfPremiumRider: true, currencySymbol: '₹', desc: '₹2.1 Cr Cover · ₹41K/yr' },
    { id: 'female', label: 'Working Woman (28)', icon: '👩‍💻', currentAge: 28, gender: 'female', isSmoker: false, annualIncome: 1200000, existingLiabilities: 1000000, annualFamilyExpenses: 500000, expenseReplacementYears: 20, futureGoals: 2000000, existingAssets: 800000, coverageYears: 35, sizingMethod: 'dime', criticalIllnessRider: true, accidentalRider: false, waiverOfPremiumRider: false, currencySymbol: '₹', desc: '10% Longevity Discount' },
    { id: 'smoker', label: 'Smoker Profile (30)', icon: '🚬', currentAge: 30, gender: 'male', isSmoker: true, annualIncome: 1500000, existingLiabilities: 2500000, annualFamilyExpenses: 600000, expenseReplacementYears: 15, futureGoals: 2000000, existingAssets: 1000000, coverageYears: 30, sizingMethod: 'dime', criticalIllnessRider: false, accidentalRider: true, waiverOfPremiumRider: false, currencySymbol: '₹', desc: 'Smoker Mortality Rating' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('currentAge', p.currentAge);
    setParam('gender', p.gender);
    setParam('isSmoker', p.isSmoker);
    setParam('annualIncome', p.annualIncome);
    setParam('existingLiabilities', p.existingLiabilities);
    setParam('annualFamilyExpenses', p.annualFamilyExpenses);
    setParam('expenseReplacementYears', p.expenseReplacementYears);
    setParam('futureGoals', p.futureGoals);
    setParam('existingAssets', p.existingAssets);
    setParam('coverageYears', p.coverageYears);
    setParam('sizingMethod', p.sizingMethod);
    setParam('criticalIllnessRider', p.criticalIllnessRider);
    setParam('accidentalRider', p.accidentalRider);
    setParam('waiverOfPremiumRider', p.waiverOfPremiumRider);
    setParam('currencySymbol', p.currencySymbol);
  };

  // Perform calculation
  const results = useMemo(() => {
    return calculateTermLifeInsuranceCalculator({
      currentAge,
      gender,
      isSmoker,
      annualIncome,
      existingLiabilities,
      annualFamilyExpenses,
      expenseReplacementYears,
      futureGoals,
      existingAssets,
      coverageYears,
      sizingMethod,
      customSumAssured,
      criticalIllnessRider,
      accidentalRider,
      waiverOfPremiumRider,
      sipReturnRate,
      currencySymbol,
    });
  }, [
    currentAge,
    gender,
    isSmoker,
    annualIncome,
    existingLiabilities,
    annualFamilyExpenses,
    expenseReplacementYears,
    futureGoals,
    existingAssets,
    coverageYears,
    sizingMethod,
    customSumAssured,
    criticalIllnessRider,
    accidentalRider,
    waiverOfPremiumRider,
    sipReturnRate,
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
  const premiumCostItems = [
    { label: 'Base Pure Term Premium', amount: results.baseAnnualPremium, colorClass: 'bg-primary', desc: 'Pure mortality risk coverage.' },
    { label: 'Add-on Critical Illness Rider', amount: results.ciRiderCost, colorClass: 'bg-purple-500', desc: 'Lump-sum payout on 36+ critical illnesses.' },
    { label: 'Accidental Death & Disability', amount: results.accidentalRiderCost, colorClass: 'bg-amber-500', desc: 'Double accidental indemnity protection.' },
    { label: 'Waiver of Premium (WOP)', amount: results.wopRiderCost, colorClass: 'bg-emerald-500', desc: 'Waives all future premiums upon disability.' },
    { label: 'Statutory GST (18%)', amount: results.gstAmount, colorClass: 'bg-rose-500', desc: 'Government tax eligible for Sec 80C rebate.' },
  ].filter((item) => item.amount > 0);

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Life Stage Protection Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🛡️ TERM LIFE INSURANCE DECISION VERDICT
          </span>
          <span class="text-xs font-mono font-bold text-ink bg-surface-strong px-2.5 py-1 rounded-xl border border-hairline uppercase">
            {gender.toUpperCase()} · {isSmoker ? 'TOBACCO USER' : 'NON-SMOKER'} · AGE {currentAge}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Provides 100% tax-free financial security of <strong>{fmt(results.recommendedSumAssured)}</strong> under Section 10(10D). Sec 80C annual tax deduction of <strong>{fmt(results.annualTaxSavingsSec80C)}</strong>.
        </p>

        {/* Coverage Sizing Method Toggles */}
        <div class="pt-3 border-t border-hairline/60 flex items-center gap-2 flex-wrap">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-muted mr-1">Sizing:</span>
          {[
            { id: 'dime', label: 'DIME Needs-Based' },
            { id: 'hlv', label: 'Human Life Value (HLV)' },
            { id: 'multiple', label: 'Income Multiple' },
            { id: 'custom', label: 'Custom Amount' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setParam('sizingMethod', m.id)}
              class={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                sizingMethod === m.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-canvas hover:bg-surface-soft border border-hairline text-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs & Underwriting Profile */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Personal Profile & Needs Sizing</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Underwriting Toggles: Age, Gender, Tobacco */}
          <div class="grid sm:grid-cols-3 gap-3 p-4 bg-surface-strong rounded-2xl border border-hairline">
            <FormInputNumber
              id="age-input"
              label="Current Age"
              value={currentAge}
              min={18}
              max={65}
              step={1}
              suffix="Yrs"
              onChange={(v) => setParam('currentAge', v)}
            />

            <FormSelect
              id="gender-select"
              label="Gender"
              value={gender}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female (-10% Disc.)' },
              ]}
              onChange={(v) => setParam('gender', v)}
            />

            <FormSelect
              id="smoker-select"
              label="Tobacco Use"
              value={isSmoker ? 'yes' : 'no'}
              options={[
                { value: 'no', label: 'Non-Smoker' },
                { value: 'yes', label: 'Smoker (+60% Surcharge)' },
              ]}
              onChange={(v) => setParam('isSmoker', v === 'yes')}
            />
          </div>

          <FormInputNumber
            id="income-input"
            label="Annual Gross Income"
            value={annualIncome}
            min={100000}
            max={100000000}
            step={50000}
            prefix={currencySymbol}
            onChange={(v) => setParam('annualIncome', v)}
          />

          {sizingMethod === 'custom' ? (
            <FormInputNumber
              id="custom-sa-input"
              label="Custom Chosen Sum Assured"
              value={customSumAssured}
              min={500000}
              max={1000000000}
              step={500000}
              prefix={currencySymbol}
              onChange={(v) => setParam('customSumAssured', v)}
            />
          ) : (
            <div class="space-y-4">
              <FormInputNumber
                id="debts-input"
                label="Outstanding Loans & Debts (Mortgage, Car, Personal)"
                value={existingLiabilities}
                min={0}
                max={100000000}
                step={100000}
                prefix={currencySymbol}
                onChange={(v) => setParam('existingLiabilities', v)}
              />

              <div class="grid sm:grid-cols-2 gap-4">
                <FormInputNumber
                  id="expenses-input"
                  label="Annual Family Expenses (excl. self)"
                  value={annualFamilyExpenses}
                  min={50000}
                  max={50000000}
                  step={50000}
                  prefix={currencySymbol}
                  onChange={(v) => setParam('annualFamilyExpenses', v)}
                />
                <FormInputNumber
                  id="repl-years-input"
                  label="Replacement Duration"
                  value={expenseReplacementYears}
                  min={5}
                  max={40}
                  step={1}
                  suffix="Yrs"
                  onChange={(v) => setParam('expenseReplacementYears', v)}
                />
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <FormInputNumber
                  id="goals-input"
                  label="Kids Higher Education & Goals"
                  value={futureGoals}
                  min={0}
                  max={100000000}
                  step={100000}
                  prefix={currencySymbol}
                  onChange={(v) => setParam('futureGoals', v)}
                />
                <FormInputNumber
                  id="assets-input"
                  label="Existing Savings & Life Cover"
                  value={existingAssets}
                  min={0}
                  max={100000000}
                  step={100000}
                  prefix={currencySymbol}
                  onChange={(v) => setParam('existingAssets', v)}
                />
              </div>
            </div>
          )}

          {/* Add-on Riders Checkbox Group */}
          <div class="space-y-3 pt-4 border-t border-hairline">
            <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider">🛡️ ADD-ON RIDERS & ACCELERATORS</span>
            <div class="space-y-2">
              <label class="flex items-center gap-3 p-3 bg-surface-strong rounded-2xl border border-hairline cursor-pointer hover:border-primary/40 transition-colors">
                <input
                  type="checkbox"
                  checked={criticalIllnessRider}
                  onChange={(e) => setParam('criticalIllnessRider', e.target.checked)}
                  class="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <div class="flex-grow text-xs">
                  <span class="font-bold text-ink block">Critical Illness Benefit Rider (+20%)</span>
                  <span class="text-muted">Lump-sum payout upon diagnosis of 36+ critical illnesses.</span>
                </div>
              </label>

              <label class="flex items-center gap-3 p-3 bg-surface-strong rounded-2xl border border-hairline cursor-pointer hover:border-primary/40 transition-colors">
                <input
                  type="checkbox"
                  checked={accidentalRider}
                  onChange={(e) => setParam('accidentalRider', e.target.checked)}
                  class="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <div class="flex-grow text-xs">
                  <span class="font-bold text-ink block">Accidental Death & Disability Rider (+10%)</span>
                  <span class="text-muted">Additional sum assured payout in case of accidental demise.</span>
                </div>
              </label>

              <label class="flex items-center gap-3 p-3 bg-surface-strong rounded-2xl border border-hairline cursor-pointer hover:border-primary/40 transition-colors">
                <input
                  type="checkbox"
                  checked={waiverOfPremiumRider}
                  onChange={(e) => setParam('waiverOfPremiumRider', e.target.checked)}
                  class="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <div class="flex-grow text-xs">
                  <span class="font-bold text-ink block">Waiver of Premium Rider (WOP) (+4%)</span>
                  <span class="text-muted">Waives all future policy premiums upon permanent disability.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Premium Composition */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Recommended Life Insurance Cover"
            primaryValue={fmt(results.recommendedSumAssured)}
            secondaryItems={[
              { label: 'Estimated Annual Premium (incl. GST)', value: fmt(results.grossAnnualPremium) },
              { label: 'Monthly Equivalent Outflow', value: fmt(results.monthlyEquivalentPremium) },
              { label: 'Coverage Duration', value: `${results.coverageYears} Years (up to age ${results.currentAge + results.coverageYears})` },
              { label: 'Sec 80C Annual Tax Savings', value: fmt(results.annualTaxSavingsSec80C) },
            ]}
          />

          <ResultDonutChart
            title="Annual Premium Cost Breakdown"
            centerValue={fmt(results.grossAnnualPremium)}
            centerSubtext="Total Annual Premium"
            segments={premiumCostItems.map((c) => ({ label: c.label, amount: c.amount, colorClass: c.colorClass }))}
          />
        </div>
      </div>

      {/* 4. PURE TERM VS TROP (RETURN OF PREMIUM) OPPORTUNITY COST ANALYZER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 class="text-base font-bold font-heading text-ink">Pure Term vs Return of Premium (TROP) Opportunity Cost</h4>
            <p class="text-xs text-muted font-mono mt-0.5">Why investing the premium difference in an Equity Index Fund creates superior wealth</p>
          </div>
          <span class="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-pill text-xs font-bold">
            +{fmt(results.sipWealthAdvantage)} Extra Wealth
          </span>
        </div>

        <div class="grid sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-surface-strong border border-hairline space-y-2">
            <span class="text-xs text-muted font-bold block uppercase">Pure Term Plan</span>
            <span class="text-lg font-bold text-primary block">{fmt(results.grossAnnualPremium)}/yr</span>
            <span class="text-xs text-body block">Total Paid: {fmt(results.totalLifetimePremiumsPaid)} ({results.coverageYears} yrs)</span>
          </div>

          <div class="p-4 rounded-2xl bg-surface-strong border border-hairline space-y-2">
            <span class="text-xs text-muted font-bold block uppercase">TROP (Return of Premium)</span>
            <span class="text-lg font-bold text-rose-600 block">{fmt(results.tropAnnualPremium)}/yr</span>
            <span class="text-xs text-body block">Maturity Refund: {fmt(results.tropRefundAtMaturity)} (0% Real Return)</span>
          </div>

          <div class="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-2">
            <span class="text-xs text-emerald-600 font-bold block uppercase">🚀 Pure Term + Index SIP ({sipReturnRate}%)</span>
            <span class="text-lg font-bold text-emerald-600 block">{fmt(results.sipFutureValue)}</span>
            <span class="text-xs text-emerald-700 block">Outperforms TROP refund by {fmt(results.sipWealthAdvantage)}</span>
          </div>
        </div>
      </div>

      {/* 5. MULTI-SCENARIO SIZING COMPARISONS */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold font-heading text-ink">Life Insurance Sizing Method Matrix</h4>
          <span class="text-xs text-muted">Income: {fmt(annualIncome)}</span>
        </div>
        <div class="grid sm:grid-cols-3 gap-3">
          {results.sizingScenarios.map((sc) => (
            <div
              key={sc.id}
              class={`p-4 rounded-2xl border space-y-1.5 ${
                sizingMethod === sc.id
                  ? 'bg-primary/10 border-2 border-primary/40'
                  : 'bg-surface-strong border-hairline'
              }`}
            >
              <span class="text-xs text-muted font-bold block uppercase">{sc.name}</span>
              <span class="text-lg font-bold text-ink block">{fmt(sc.cover)}</span>
              <span class="text-xs text-primary font-bold block">Est. Premium: {fmt(sc.annualPremium)}/yr</span>
              <p class="text-[11px] text-muted leading-tight pt-1">{sc.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. COST BREAKDOWN */}
      <CostBreakdownCard
        title="Term Insurance Annual Premium Structure"
        subtitle={`Total Gross Annual Premium: ${fmt(results.grossAnnualPremium)}`}
        items={premiumCostItems}
      />

      {/* 7. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 8. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Tax-Free Death Benefit"
          value={fmt(results.recommendedSumAssured)}
          subtitle="Under Section 10(10D), 100% of the claim payout is completely exempt from income tax."
          badgeText="Sec 10(10D) Exemption"
          badgeColorClass="bg-semantic-success"
        />
        <InsightCard
          title="Monthly Cost of Protection"
          value={fmt(results.monthlyEquivalentPremium)}
          subtitle={`Just ${fmt(results.monthlyEquivalentPremium)}/month locks in financial security for ${results.coverageYears} years.`}
          badgeText="Monthly Outflow"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 9. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 TERM INSURANCE POLICY SUMMARY</span>
          <span class="text-xs text-muted font-mono">{sizingMethod.toUpperCase()} MODEL</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Sum Assured</span>
            <span class="text-base font-bold text-primary">{fmt(results.recommendedSumAssured)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Annual Premium</span>
            <span class="text-base font-bold text-ink">{fmt(results.grossAnnualPremium)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Monthly Outflow</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.monthlyEquivalentPremium)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Policy Term</span>
            <span class="text-base font-bold text-ink">{results.coverageYears} Yrs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
