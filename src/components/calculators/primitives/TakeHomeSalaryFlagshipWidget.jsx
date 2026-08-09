import { useState, useMemo } from 'preact/hooks';
import { calculateTakeHomeSalaryCalculator } from '../../../calculators/tax/take-home-salary-calculator.js';
import { formatCurrency } from '@utils/formatters.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';
import FormToggleSwitch from './FormToggleSwitch';

const DEFAULT_SALARY_STATE = {
  ctc: 1200000,
  ctcPeriod: 'annual',
  basicPercent: 50,
  bonusAmount: 0,
  employerEpfIncluded: true,
  epfPercent: 12,
  vpfPercent: 0,
  professionalTax: 2400,
  otherDeductions: 0,
  oldRegimeDeductions: 0,
  regime: 'new',
};

const SALARY_PARAM_MAP = {
  ctc: 'ctc',
  ctcPeriod: 'prd',
  basicPercent: 'bsc',
  bonusAmount: 'bns',
  employerEpfIncluded: 'eepf',
  epfPercent: 'epf',
  vpfPercent: 'vpf',
  professionalTax: 'pt',
  otherDeductions: 'ded',
  oldRegimeDeductions: 'oded',
  regime: 'reg',
};

export default function TakeHomeSalaryFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_SALARY_STATE, SALARY_PARAM_MAP);
  const {
    ctc,
    ctcPeriod,
    basicPercent,
    bonusAmount,
    employerEpfIncluded,
    epfPercent,
    vpfPercent,
    professionalTax,
    otherDeductions,
    oldRegimeDeductions,
    regime,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Illustrative Smart Presets
  const presets = [
    { id: 'fresher', label: 'Fresher', icon: '🎓', ctc: 450000, basicPercent: 50, bonusAmount: 0, desc: '₹4.5L Entry Package' },
    { id: 'swe', label: 'Software Engineer', icon: '💻', ctc: 1500000, basicPercent: 50, bonusAmount: 100000, desc: '₹15L Tech Offer' },
    { id: 'mid', label: 'Mid-Level Pro', icon: '👔', ctc: 2500000, basicPercent: 50, bonusAmount: 200000, desc: '₹25L Experienced' },
    { id: 'manager', label: 'Senior Manager', icon: '📈', ctc: 4500000, basicPercent: 40, bonusAmount: 500000, desc: '₹45L Corporate Lead' },
    { id: 'high', label: 'High Income Pro', icon: '🚀', ctc: 8000000, basicPercent: 40, bonusAmount: 1000000, desc: '₹80L Executive' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('ctc', p.ctc);
    setParam('basicPercent', p.basicPercent);
    setParam('bonusAmount', p.bonusAmount);
    setParam('ctcPeriod', 'annual');
  };

  // Run pure calculation engine
  const results = useMemo(() => {
    return calculateTakeHomeSalaryCalculator({
      ctc,
      ctcPeriod,
      basicPercent,
      bonusAmount,
      employerEpfIncluded,
      epfPercent,
      vpfPercent,
      professionalTax,
      otherDeductions,
      oldRegimeDeductions,
      regime,
    });
  }, [
    ctc,
    ctcPeriod,
    basicPercent,
    bonusAmount,
    employerEpfIncluded,
    epfPercent,
    vpfPercent,
    professionalTax,
    otherDeductions,
    oldRegimeDeductions,
    regime,
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
    { label: 'Monthly In-Hand Pay', value: formatCurrency(results.netMonthlyTakeHome), highlight: true, subtitle: 'Direct bank credit / mo' },
    { label: 'Annual Net Salary', value: formatCurrency(results.netAnnualTakeHome), subtitle: 'Total net yearly earnings' },
    { label: 'Gross Annual CTC', value: formatCurrency(results.grossAnnualCtc), subtitle: 'Cost to Company' },
    { label: 'Total Income Tax', value: formatCurrency(results.totalIncomeTax), subtitle: `${results.taxYearAssumption} (${results.activeRegime.toUpperCase()})` },
    { label: 'Mandatory Employee EPF', value: formatCurrency(results.totalEmployeePfAnnual), subtitle: '12% Basic savings / yr' },
    { label: 'Employer Contribution', value: formatCurrency(results.totalEmployerContribution), subtitle: 'Employer EPF cost' },
  ];

  // Donut Chart items for Salary Allocation
  const salaryAllocationChart = [
    { name: 'Net Take-Home Pay', value: results.netAnnualTakeHome, color: '#10b981' },
    { name: 'Income Tax (CBDT)', value: results.totalIncomeTax, color: '#ef4444' },
    { name: 'Employee EPF / VPF', value: results.totalEmployeePfAnnual, color: '#3b82f6' },
    { name: 'Professional Tax & Other', value: results.professionalTax + results.otherDeductions, color: '#f59e0b' },
  ];

  // Cost Breakdown items
  const costBreakdownItems = [
    { label: 'Gross Salary (Base & Allowances)', amount: results.grossAnnualSalary, colorClass: 'bg-emerald-500', desc: 'Direct compensation before employee taxes.' },
    { label: 'Total Income Tax Liability', amount: results.totalIncomeTax, colorClass: 'bg-semantic-danger', desc: `Income tax under ${results.activeRegime === 'new' ? 'New' : 'Old'} Regime.` },
    { label: 'Employee EPF Contribution', amount: results.totalEmployeePfAnnual, colorClass: 'bg-primary', desc: 'Retirement savings deducted from salary.' },
    { label: 'Professional Tax (PT)', amount: results.professionalTax, colorClass: 'bg-accent-amber', desc: 'State-level statutory professional tax.' },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Smart Presets Section */}
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono text-body font-semibold uppercase tracking-wider">
            Illustrative Compensation Profiles
          </span>
          <span class="text-[11px] font-mono text-body-muted bg-surface px-2 py-0.5 rounded border border-hairline">
            Illustrative Examples (Not Industry Claims)
          </span>
        </div>
        <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Salary Profile Preset" />
      </div>

      {/* 2. HERO DECISION VERDICT BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider">
            🏆 COMPENSATION DECISION VERDICT
          </span>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-body-muted">Tax Year: {results.taxYearAssumption}</span>
            <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${results.healthColor}`}>
              Salary Health Score: {results.healthScore}/100 ({results.healthStatus})
            </span>
          </div>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          {results.healthDesc}
        </p>

        {results.taxSavingsAnnual > 0 && (
          <div class="pt-2 border-t border-hairline flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
            <span class="text-body font-semibold">
              Recommended Regime: <strong class="text-primary uppercase">{results.recommendedRegime} TAX REGIME</strong>
            </span>
            <span class="text-semantic-success font-bold">
              Potential Savings: {formatCurrency(results.taxSavingsAnnual)} / year ({formatCurrency(results.taxSavingsMonthly)} / mo)
            </span>
          </div>
        )}
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Controls */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <h3 class="text-xl font-bold font-heading text-ink">Salary Parameters</h3>
              <p class="text-xs text-body-muted font-mono mt-0.5">Budget 2024 Slabs & EPFO Rules</p>
            </div>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* CTC Period Toggle */}
          <div class="flex items-center justify-between bg-surface p-2 rounded-2xl border border-hairline">
            <span class="text-xs font-bold font-heading text-ink px-2">CTC Input Mode</span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setParam('ctcPeriod', 'annual')}
                class={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  ctcPeriod === 'annual' ? 'bg-primary text-white shadow-sm' : 'text-body hover:bg-canvas'
                }`}
              >
                Annual CTC
              </button>
              <button
                type="button"
                onClick={() => setParam('ctcPeriod', 'monthly')}
                class={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  ctcPeriod === 'monthly' ? 'bg-primary text-white shadow-sm' : 'text-body hover:bg-canvas'
                }`}
              >
                Monthly CTC
              </button>
            </div>
          </div>

          <FormInputNumber
            id="salary-ctc-amount"
            label={ctcPeriod === 'annual' ? 'Annual Cost to Company (CTC)' : 'Monthly Cost to Company (CTC)'}
            value={ctc}
            min={ctcPeriod === 'annual' ? 100000 : 10000}
            max={ctcPeriod === 'annual' ? 20000000 : 1500000}
            step={ctcPeriod === 'annual' ? 25000 : 2500}
            prefix="₹"
            minLabel={ctcPeriod === 'annual' ? '₹1 Lakh' : '₹10,000'}
            maxLabel={ctcPeriod === 'annual' ? '₹2 Crore' : '₹15 Lakhs'}
            onChange={(v) => setParam('ctc', v)}
          />

          <FormInputNumber
            id="basic-salary-percent"
            label="Basic Salary (% of CTC)"
            value={basicPercent}
            min={10}
            max={100}
            step={5}
            suffix="%"
            minLabel="10%"
            maxLabel="100%"
            onChange={(v) => setParam('basicPercent', v)}
          />

          <FormInputNumber
            id="bonus-amount"
            label="Annual Performance Bonus / Variable Pay (₹)"
            value={bonusAmount}
            min={0}
            max={5000000}
            step={25000}
            prefix="₹"
            minLabel="₹0"
            maxLabel="₹50 Lakhs"
            onChange={(v) => setParam('bonusAmount', v)}
          />

          <FormToggleSwitch
            id="employer-epf-toggle"
            label="Employer EPF (12%) Included in CTC"
            checked={employerEpfIncluded}
            onChange={(checked) => setParam('employerEpfIncluded', checked)}
          />

          <FormInputNumber
            id="employee-epf-percent"
            label="Employee EPF Contribution Rate (%)"
            value={epfPercent}
            min={0}
            max={12}
            step={1}
            suffix="%"
            minLabel="0%"
            maxLabel="12%"
            onChange={(v) => setParam('epfPercent', v)}
          />

          <FormInputNumber
            id="professional-tax"
            label="Annual Professional Tax (PT)"
            value={professionalTax}
            min={0}
            max={5000}
            step={200}
            prefix="₹"
            minLabel="₹0"
            maxLabel="₹5,000"
            onChange={(v) => setParam('professionalTax', v)}
          />

          {/* Tax Regime Selector */}
          <div class="space-y-2 pt-2 border-t border-hairline">
            <label class="block text-xs font-bold font-heading text-ink">Tax Regime Selection</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setParam('regime', 'new')}
                class={`p-3 rounded-2xl border text-left transition-all ${
                  regime === 'new'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                    : 'border-hairline bg-surface text-body hover:bg-canvas'
                }`}
              >
                <div class="text-xs font-bold">New Tax Regime</div>
                <div class="text-[11px] font-mono text-body-muted mt-0.5">₹75k Standard Deduction</div>
              </button>
              <button
                type="button"
                onClick={() => setParam('regime', 'old')}
                class={`p-3 rounded-2xl border text-left transition-all ${
                  regime === 'old'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                    : 'border-hairline bg-surface text-body hover:bg-canvas'
                }`}
              >
                <div class="text-xs font-bold">Old Tax Regime</div>
                <div class="text-[11px] font-mono text-body-muted mt-0.5">With Chapter VI-A Claims</div>
              </button>
            </div>
          </div>

          {regime === 'old' && (
            <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <span class="text-xs font-bold text-semantic-warning block">Old Tax Regime Exemptions</span>
              <FormInputNumber
                id="old-regime-extra-deductions"
                label="Additional Old Regime Claims (80C, 24b, 80D, HRA) (₹)"
                value={oldRegimeDeductions}
                min={0}
                max={1000000}
                step={25000}
                prefix="₹"
                minLabel="₹0"
                maxLabel="₹10 Lakhs"
                onChange={(v) => setParam('oldRegimeDeductions', v)}
              />
            </div>
          )}
        </div>

        {/* Right Output Panel */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard metrics={dashboardMetrics} />

          <FinancialHealthGauge
            score={results.healthScore}
            statusText={results.healthStatus}
            description={`Your monthly take-home salary is ${results.netMonthlyTakeHome.toLocaleString('en-IN')}, representing ${((results.netAnnualTakeHome / results.grossAnnualCtc) * 100).toFixed(1)}% of total annual CTC.`}
          />

          <ResultDonutChart title="Annual Compensation Allocation" data={salaryAllocationChart} />
        </div>
      </div>

      {/* 4. OLD VS NEW TAX REGIME COMPARISON CARD */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-hairline pb-4">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">Old vs New Tax Regime Comparison</h3>
            <p class="text-xs text-body-muted font-mono mt-0.5">Side-by-Side Financial Year 2025-26 Breakdown</p>
          </div>
          <span class="px-3 py-1 rounded-pill bg-primary/10 text-primary font-mono text-xs font-bold uppercase">
            Recommended: {results.recommendedRegime.toUpperCase()} REGIME
          </span>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          {/* New Regime Card */}
          <div class={`p-5 rounded-2xl border transition-all ${results.recommendedRegime === 'new' ? 'border-emerald-500 bg-emerald-500/5' : 'border-hairline bg-surface'}`}>
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-bold font-heading text-ink">New Tax Regime</span>
              {results.recommendedRegime === 'new' && (
                <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500 text-white">Recommended</span>
              )}
            </div>
            <div class="space-y-2 text-xs font-mono">
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Standard Deduction:</span>
                <span class="font-bold text-ink">{formatCurrency(results.newRegime.standardDeduction)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Taxable Income:</span>
                <span class="font-bold text-ink">{formatCurrency(results.newRegime.taxableIncome)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Sec 87A Rebate:</span>
                <span class="font-bold text-semantic-success">{formatCurrency(results.newRegime.rebate87a)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Total Income Tax:</span>
                <span class="font-bold text-semantic-danger">{formatCurrency(results.newRegime.totalIncomeTax)}</span>
              </div>
              <div class="flex justify-between py-1 pt-2 text-sm font-bold text-ink">
                <span>Monthly Take-Home:</span>
                <span class="text-emerald-500">{formatCurrency(results.newRegime.netMonthlyTakeHome)}</span>
              </div>
            </div>
          </div>

          {/* Old Regime Card */}
          <div class={`p-5 rounded-2xl border transition-all ${results.recommendedRegime === 'old' ? 'border-emerald-500 bg-emerald-500/5' : 'border-hairline bg-surface'}`}>
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-bold font-heading text-ink">Old Tax Regime</span>
              {results.recommendedRegime === 'old' && (
                <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500 text-white">Recommended</span>
              )}
            </div>
            <div class="space-y-2 text-xs font-mono">
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Total Deductions Claimed:</span>
                <span class="font-bold text-ink">{formatCurrency(results.oldRegime.deductionsClaimed)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Taxable Income:</span>
                <span class="font-bold text-ink">{formatCurrency(results.oldRegime.taxableIncome)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Sec 87A Rebate:</span>
                <span class="font-bold text-semantic-success">{formatCurrency(results.oldRegime.rebate87a)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-body-muted">Total Income Tax:</span>
                <span class="font-bold text-semantic-danger">{formatCurrency(results.oldRegime.totalIncomeTax)}</span>
              </div>
              <div class="flex justify-between py-1 pt-2 text-sm font-bold text-ink">
                <span>Monthly Take-Home:</span>
                <span class="text-emerald-500">{formatCurrency(results.oldRegime.netMonthlyTakeHome)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. EMPLOYER VS EMPLOYEE CONTRIBUTION & COST BREAKDOWN */}
      <div class="grid lg:grid-cols-12 gap-8">
        <div class="lg:col-span-6">
          <CostBreakdownCard title="Compensation Breakdown" items={costBreakdownItems} />
        </div>

        {/* Employer vs Employee Card */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
          <h3 class="text-xl font-bold font-heading text-ink">Employer vs Employee Contributions</h3>
          <p class="text-xs text-body-muted font-mono">Company Outlay vs Direct Payroll Deductions</p>

          <div class="space-y-3 pt-2">
            <div class="p-4 rounded-2xl bg-surface border border-hairline flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-ink">Employer EPF Contribution</div>
                <div class="text-[11px] text-body-muted font-mono">12% Basic included in CTC</div>
              </div>
              <span class="text-sm font-bold font-mono text-primary">{formatCurrency(results.employerEpf)} / yr</span>
            </div>

            <div class="p-4 rounded-2xl bg-surface border border-hairline flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-ink">Employee EPF Deduction</div>
                <div class="text-[11px] text-body-muted font-mono">12% Basic mandatory deduction</div>
              </div>
              <span class="text-sm font-bold font-mono text-semantic-warning">{formatCurrency(results.employeeEpfAnnual)} / yr</span>
            </div>

            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-ink">Combined Annual EPF Corpus Growth</div>
                <div class="text-[11px] text-body-muted font-mono">Employer + Employee EPF</div>
              </div>
              <span class="text-base font-extrabold font-mono text-emerald-500">{formatCurrency(results.employerEpf + results.totalEmployeePfAnnual)} / yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. MULTI-SCENARIO COMPARISON CARDS */}
      <div class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h3 class="text-xl font-bold font-heading text-ink">Salary Growth & Optimization Scenarios</h3>
          <span class="text-xs font-mono text-body-muted">4 Multi-Scenario Compensation Models</span>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {results.scenarios.map((sc) => (
            <div key={sc.id} class="p-5 rounded-2xl bg-canvas border border-hairline space-y-3 shadow-soft hover:border-primary/50 transition-all">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold font-mono px-2 py-0.5 rounded bg-surface border border-hairline text-ink">{sc.badge}</span>
                <span class="text-[11px] font-mono text-body-muted">{sc.name}</span>
              </div>
              <div>
                <div class="text-xs text-body-muted font-mono">Monthly Take-Home</div>
                <div class="text-lg font-extrabold font-heading text-emerald-500">{formatCurrency(sc.monthlyTakeHome)}</div>
              </div>
              <div class="space-y-1 text-[11px] font-mono pt-2 border-t border-hairline text-body-muted">
                <div class="flex justify-between"><span>Annual CTC:</span><span class="text-ink font-bold">{formatCurrency(sc.ctc)}</span></div>
                <div class="flex justify-between"><span>Annual Tax:</span><span class="text-semantic-danger font-bold">{formatCurrency(sc.annualTax)}</span></div>
                {sc.monthlyDiff !== 0 && (
                  <div class="flex justify-between font-bold text-semantic-success pt-1">
                    <span>Monthly Gain:</span>
                    <span>+{formatCurrency(sc.monthlyDiff)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. DYNAMIC INSIGHTS & RECOMMENDATION CARDS */}
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <h4 class="text-lg font-bold font-heading text-ink">Dynamic Salary Insights</h4>
          <div class="space-y-3">
            {results.dynamicInsights.map((ins, idx) => (
              <InsightCard key={idx} title={ins.title} metric={ins.value} description={ins.description} icon={ins.icon} />
            ))}
          </div>
        </div>

        <div class="space-y-4">
          <h4 class="text-lg font-bold font-heading text-ink">Take-Home Optimization Checklist</h4>
          <div class="space-y-3">
            <RecommendationCard
              title="Maximize EPF Tax-Free Growth"
              description="Your mandatory 12% EPF contribution builds a compound tax-free retirement corpus. Maintain basic salary at 50% of CTC to optimize EPFO benefits."
              priority="high"
            />
            <RecommendationCard
              title="Opt for NPS under 80CCD(2)"
              description="Employer contribution to NPS (up to 10% of basic salary) is exempt from income tax under both Old and New Tax Regimes."
              priority="medium"
            />
            <RecommendationCard
              title="Review Allowances & Food Coupons"
              description="Under corporate policies, non-taxable perks like meal cards, phone reimbursements, and Internet allowances reduce taxable gross income."
              priority="low"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
