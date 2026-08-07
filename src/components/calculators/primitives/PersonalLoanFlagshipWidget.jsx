import { useState, useMemo } from 'preact/hooks';
import { calculatePersonalLoan } from '../../../calculators/loans/personal-loan-calculator.js';
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
import FormToggleSwitch from './FormToggleSwitch';
import AmortizationTable from './AmortizationTable';

const DEFAULT_PERSONAL_STATE = {
  amount: 500000,
  rate: 11.5,
  tenure: 3,
  monthlyIncome: 100000,
  includeInsurance: false,
};

const PERSONAL_PARAM_MAP = {
  amount: 'amt',
  rate: 'rate',
  tenure: 'yr',
  monthlyIncome: 'inc',
  includeInsurance: 'ins',
};

export default function PersonalLoanFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_PERSONAL_STATE, PERSONAL_PARAM_MAP);
  const { amount, rate, tenure, monthlyIncome, includeInsurance } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Loan Purpose Presets
  const presets = [
    { id: 'emergency', label: 'Emergency Fund', icon: '🚨', amount: 100000, rate: 12.5, tenure: 2, desc: '₹1L Fast Liquidity' },
    { id: 'wedding', label: 'Wedding Expense', icon: '💍', amount: 500000, rate: 11.5, tenure: 3, desc: '₹5L Ceremony Budget' },
    { id: 'medical', label: 'Medical Emergency', icon: '🏥', amount: 300000, rate: 11.0, tenure: 3, desc: '₹3L Healthcare Need' },
    { id: 'renovation', label: 'Home Renovation', icon: '🏡', amount: 800000, rate: 10.5, tenure: 4, desc: '₹8L Improvement' },
    { id: 'travel', label: 'Vacation Travel', icon: '✈️', amount: 200000, rate: 13.0, tenure: 2, desc: '₹2L Holiday Trip' },
    { id: 'consolidation', label: 'Debt Consolidation', icon: '💳', amount: 1000000, rate: 10.5, tenure: 5, desc: '₹10L Clear High-Cost Credit' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('amount', p.amount);
    setParam('rate', p.rate);
    setParam('tenure', p.tenure);
  };

  // Perform calculation
  const results = useMemo(() => {
    return calculatePersonalLoan({
      amount,
      rate,
      tenure,
      monthlyIncome,
      includeInsurance,
    });
  }, [amount, rate, tenure, monthlyIncome, includeInsurance]);

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

  // Cost breakdown items for Total Borrowing Cost
  const costItems = [
    { label: 'Borrowed Loan Principal', amount: results.loanAmount, colorClass: 'bg-primary', desc: 'Net cash disbursed to your bank.' },
    { label: 'Total Interest Payable', amount: results.totalInterest, colorClass: 'bg-semantic-warning', desc: 'Total bank interest charge over tenure.' },
    { label: 'Processing Fees (1%)', amount: results.processingFee, colorClass: 'bg-accent-sky', desc: 'Upfront loan documentation fee.' },
    { label: 'Optional Credit Insurance', amount: results.insuranceFee, colorClass: 'bg-emerald-500', desc: 'Loan protection cover (if selected).' },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Loan Purpose Preset" />

      {/* 2. HERO DECISION BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🏆 OPTIMAL BORROWING VERDICT
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline ${results.healthColor}`}>
            Health Score: {results.healthScore}/100 ({results.healthStatus})
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          {results.healthDesc}
        </p>
      </div>

      {/* 3. Debt Trap Warning Alert */}
      {results.isDebtTrapRisk && (
        <div class="p-5 sm:p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-ink space-y-2 shadow-soft">
          <div class="flex items-center gap-2 font-bold font-heading text-semantic-danger text-sm">
            <span>🛡️</span>
            <span>High Borrowing Cost Caution</span>
          </div>
          <p class="text-xs sm:text-sm text-body leading-relaxed">
            Your total borrowing cost is unusually high. Your monthly loan payment uses almost half of your income. Consider borrowing a slightly smaller sum or reducing the loan tenure to save significantly on interest.
          </p>
        </div>
      )}

      {/* 4. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Personal Loan Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="personal-loan-amount"
            label="Required Loan Amount (₹)"
            value={amount}
            min={50000}
            max={5000000}
            step={25000}
            prefix="₹"
            minLabel="₹50,000"
            maxLabel="₹50 Lakhs"
            onChange={(v) => setParam('amount', v)}
          />

          <FormInputNumber
            id="interest-rate"
            label="Interest Rate (% p.a.)"
            value={rate}
            min={9.5}
            max={24.0}
            step={0.25}
            suffix="%"
            minLabel="9.5%"
            maxLabel="24%"
            onChange={(v) => setParam('rate', v)}
          />

          <FormInputNumber
            id="loan-tenure"
            label="Loan Tenure (Years)"
            value={tenure}
            min={1}
            max={7}
            step={1}
            suffix=" Years"
            minLabel="1 Yr"
            maxLabel="7 Yrs"
            onChange={(v) => setParam('tenure', v)}
          />

          <FormInputNumber
            id="monthly-income"
            label="Net Monthly Salary (₹)"
            value={monthlyIncome}
            min={25000}
            max={1000000}
            step={5000}
            prefix="₹"
            minLabel="₹25,000"
            maxLabel="₹10 Lakhs"
            onChange={(v) => setParam('monthlyIncome', v)}
          />

          <FormToggleSwitch
            id="include-insurance"
            label="Optional Loan Insurance (+1.5%)"
            subtext="Protects loan in case of disability or job loss."
            checked={includeInsurance}
            onChange={(checked) => setParam('includeInsurance', checked)}
          />
        </div>

        {/* Right Panel: Output Dashboard & Charts */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Monthly Personal Loan EMI"
            primaryValue={formatCurrency(results.emi)}
            secondaryItems={[
              { label: 'Borrowed Principal', value: formatCurrency(results.loanAmount) },
              { label: 'Total Interest Payable', value: formatCurrency(results.totalInterest) },
              { label: 'Processing & Fees', value: formatCurrency(results.processingFee + results.insuranceFee) },
              { label: 'Total Amount Repaid', value: formatCurrency(results.totalRepayment) },
            ]}
          />

          <ResultDonutChart
            title="Loan Amount vs Interest Charges"
            centerValue={formatCurrency(results.emi)}
            centerSubtext="Monthly EMI"
            segments={[
              { label: 'Borrowed Principal', amount: results.loanAmount, colorClass: 'bg-primary' },
              { label: 'Total Interest Charge', amount: results.totalInterest, colorClass: 'bg-semantic-warning' },
              { label: 'Processing & Fees', amount: results.processingFee + results.insuranceFee, colorClass: 'bg-accent-sky' },
            ]}
          />

          <FinancialHealthGauge
            title="Borrowing Health Score"
            score={results.healthScore}
            statusLabel={results.healthStatus}
            description={results.healthDesc}
          />
        </div>
      </div>

      {/* 5. INTEREST BURDEN VISUAL ("For every ₹100 borrowed, you repay ₹X") */}
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-strong border border-hairline space-y-4 shadow-soft">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">Human-Friendly Interest Burden</span>
            <h4 class="text-lg font-bold font-heading text-ink">Real Cost Per ₹100 Borrowed</h4>
          </div>
          <span class="text-2xl font-bold font-mono text-primary">₹{results.repayPer100}</span>
        </div>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          For every <strong>₹100</strong> you borrow from the bank, you will repay approximately <strong>₹{results.repayPer100}</strong> over the next {tenure} years.
        </p>
      </div>

      {/* 6. BORROW LESS SIMULATOR */}
      {results.borrowLessScenarios.length > 0 && (
        <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft">
          <div class="flex items-center gap-2 text-primary font-bold font-heading text-lg">
            <span>💡</span>
            <h3>"Borrow Less" Quick Simulator</h3>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {results.borrowLessScenarios.map((sc) => (
              <button
                key={sc.delta}
                type="button"
                onClick={() => setParam('amount', sc.newAmt)}
                class="p-4 rounded-2xl bg-surface-strong hover:bg-surface-soft border border-hairline text-left transition-all space-y-2 group"
              >
                <span class="text-xs font-mono font-bold text-primary block uppercase">Borrow ₹{(sc.delta / 100000).toFixed(1)}L Less</span>
                <span class="text-sm font-bold font-mono text-ink block">
                  New EMI: {formatCurrency(sc.newEmi)}
                </span>
                <span class="text-xs font-mono text-semantic-success block font-bold">
                  Save {formatCurrency(sc.interestSaved)} Interest
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. PREPAYMENT COACH & RATE SENSITIVITY */}
      <div class="grid sm:grid-cols-2 gap-6">
        <div class="p-6 rounded-3xl bg-canvas border border-hairline space-y-3 shadow-soft">
          <div class="flex items-center gap-2 text-emerald-600 font-heading font-extrabold text-base">
            <span>⚡</span>
            <h4>Prepayment Coach Savings</h4>
          </div>
          <div class="space-y-2 text-xs font-mono">
            <div class="p-3 bg-surface-strong rounded-2xl border border-hairline/60 flex items-center justify-between">
              <span>Pay 1 Extra EMI / Year</span>
              <span class="font-bold text-semantic-success">Save {formatCurrency(results.prepaymentCoach.extraEmiInterestSaved)}</span>
            </div>
            <div class="p-3 bg-surface-strong rounded-2xl border border-hairline/60 flex items-center justify-between">
              <span>Prepay ₹25,000 Lump Sum</span>
              <span class="font-bold text-primary">Save {formatCurrency(results.prepaymentCoach.lumpSum25kSaved)}</span>
            </div>
          </div>
        </div>

        <div class="p-6 rounded-3xl bg-canvas border border-hairline space-y-3 shadow-soft">
          <div class="flex items-center gap-2 text-accent-sky font-heading font-extrabold text-base">
            <span>📉</span>
            <h4>Rate Negotiation Sensitivity</h4>
          </div>
          <div class="space-y-2 text-xs font-mono">
            <div class="p-3 bg-surface-strong rounded-2xl border border-hairline/60 flex items-center justify-between">
              <span>If Rate drops by -0.5%</span>
              <span class="font-bold text-semantic-success">Save {formatCurrency(results.rateSensitivity.savings05)}</span>
            </div>
            <div class="p-3 bg-surface-strong rounded-2xl border border-hairline/60 flex items-center justify-between">
              <span>If Rate drops by -1.0%</span>
              <span class="font-bold text-primary">Save {formatCurrency(results.rateSensitivity.savings10)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8. TOTAL BORROWING COST BREAKDOWN */}
      <CostBreakdownCard
        title="Total Borrowing Cost Breakdown"
        subtitle={`Total repayment commitment: ${formatCurrency(results.totalRepayment)}`}
        items={costItems}
      />

      {/* 9. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 10. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Total Interest Burden"
          value={formatCurrency(results.totalInterest)}
          subtitle={`${((results.totalInterest / results.loanAmount) * 100).toFixed(1)}% of original principal.`}
          badgeText="Interest Charge"
          badgeColorClass="bg-semantic-warning"
        />
        <InsightCard
          title="Monthly Disposable Income Left"
          value={formatCurrency(results.remainingIncome)}
          subtitle={`After paying ₹${formatCurrency(results.emi)} monthly EMI.`}
          badgeText="Remaining Salary"
          badgeColorClass="bg-emerald-500"
        />
      </div>

      {/* 11. DECISION SUMMARY CARD (SCREENSHOT FRIENDLY) */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 PERSONAL BORROWING DECISION SUMMARY</span>
          <span class="text-xs text-muted font-mono">{tenure} Year Tenure</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Loan Amount</span>
            <span class="text-base font-bold text-ink">{formatCurrency(results.loanAmount)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Monthly EMI</span>
            <span class="text-base font-bold text-primary">{formatCurrency(results.emi)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Total Interest</span>
            <span class="text-base font-bold text-semantic-warning">{formatCurrency(results.totalInterest)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Health Score</span>
            <span class={`text-base font-bold ${results.healthColor}`}>{results.healthScore}/100</span>
          </div>
        </div>
      </div>

      {/* 12. AMORTIZATION SCHEDULE TABLE */}
      <AmortizationTable schedule={results.schedule} />
    </div>
  );
}
