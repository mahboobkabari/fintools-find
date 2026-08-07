import { useState, useMemo } from 'preact/hooks';
import { calculateCarLoan } from '../../../calculators/loans/car-loan-calculator.js';
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
import FormSelect from './FormSelect';
import AmortizationTable from './AmortizationTable';

const DEFAULT_CAR_STATE = {
  vehiclePrice: 1200000,
  downPaymentPct: 20,
  rate: 9.0,
  tenure: 5,
  monthlyIncome: 100000,
  fuelType: 'petrol',
  annualKm: 12000,
};

const CAR_PARAM_MAP = {
  vehiclePrice: 'price',
  downPaymentPct: 'dp',
  rate: 'rate',
  tenure: 'yr',
  monthlyIncome: 'inc',
  fuelType: 'fuel',
  annualKm: 'km',
};

export default function CarLoanFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_CAR_STATE, CAR_PARAM_MAP);
  const { vehiclePrice, downPaymentPct, rate, tenure, monthlyIncome, fuelType, annualKm } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Preset Vehicle Profiles
  const presets = [
    { id: 'hatchback', label: 'Entry Hatchback', icon: '🚗', vehiclePrice: 600000, downPaymentPct: 15, rate: 9.0, tenure: 5, desc: '₹6L On-Road Price' },
    { id: 'suv', label: 'Compact SUV', icon: '🚙', vehiclePrice: 1200000, downPaymentPct: 20, rate: 8.8, tenure: 5, desc: '₹12L On-Road Price' },
    { id: 'sedan', label: 'Premium Sedan', icon: '🏎️', vehiclePrice: 2500000, downPaymentPct: 25, rate: 8.6, tenure: 5, desc: '₹25L Executive Sedan' },
    { id: 'luxury', label: 'Luxury SUV', icon: '👑', vehiclePrice: 5000000, downPaymentPct: 30, rate: 8.5, tenure: 5, desc: '₹50L Flagship SUV' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('vehiclePrice', p.vehiclePrice);
    setParam('downPaymentPct', p.downPaymentPct);
    setParam('rate', p.rate);
    setParam('tenure', p.tenure);
  };

  // Perform full calculation
  const results = useMemo(() => {
    return calculateCarLoan({
      vehiclePrice,
      downPaymentPct,
      rate,
      tenure,
      monthlyIncome,
      fuelType,
      annualKm,
    });
  }, [vehiclePrice, downPaymentPct, rate, tenure, monthlyIncome, fuelType, annualKm]);

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

  // Cost breakdown items for 5-Year True Cost of Ownership
  const ownershipItems = [
    { label: 'Vehicle On-Road Price', amount: results.vehiclePrice, colorClass: 'bg-primary', desc: 'Ex-showroom + initial taxes.' },
    { label: 'Total Loan Interest (5-Yr)', amount: results.totalInterest, colorClass: 'bg-semantic-warning', desc: 'Finance charges over tenure.' },
    { label: 'Registration & RTO Tax', amount: results.registrationFee, colorClass: 'bg-accent-sky', desc: 'One-time state RTO charges.' },
    { label: 'Estimated 5-Yr Fuel Costs', amount: results.fuel5Yr, colorClass: 'bg-accent-amber', desc: `${fuelType.toUpperCase()} fuel running cost.` },
    { label: 'Estimated 5-Yr Insurance', amount: results.insurance5Yr, colorClass: 'bg-emerald-500', desc: 'Comprehensive vehicle insurance.' },
    { label: 'Estimated 5-Yr Maintenance', amount: results.maintenance5Yr, colorClass: 'bg-surface-strong', desc: 'Scheduled servicing & repairs.' },
    { label: 'Bank Processing Fees', amount: results.processingFee, colorClass: 'bg-rose-400', desc: 'Upfront loan documentation fee.' },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Quick Car Presets" />

      {/* 2. HERO DECISION BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-accent-sky/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🏆 OPTIMAL DECISION VERDICT
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline ${results.affordabilityColor}`}>
            Status: {results.affordabilityStatus}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          {results.affordabilityDesc}
        </p>

        {/* Quick Down Payment Chips */}
        <div class="pt-3 border-t border-hairline/60 flex items-center gap-2 flex-wrap">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-muted mr-1">Quick Down Payment:</span>
          {[15, 20, 25, 35].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setParam('downPaymentPct', pct)}
              class={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                downPaymentPct === pct
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-canvas hover:bg-surface-soft border border-hairline text-ink'
              }`}
            >
              {pct}% DP
            </button>
          ))}
        </div>
      </div>

      {/* 3. Emotional Budget Warning Alert (If FOIR > 35%) */}
      {results.foirPct > 35 && (
        <div class="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-ink space-y-2 shadow-soft">
          <div class="flex items-center gap-2 font-bold font-heading text-amber-800 text-sm">
            <span>⚠️</span>
            <span>Budget Pressure Caution</span>
          </div>
          <p class="text-xs sm:text-sm text-body leading-relaxed">
            This purchase commits <strong>{results.foirPct}%</strong> of your monthly income to EMI repayments. Consider opting for a slightly lower-priced vehicle or increasing your down payment to improve monthly financial flexibility.
          </p>
        </div>
      )}

      {/* 4. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Car Loan Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="vehicle-price"
            label="On-Road Vehicle Price (₹)"
            value={vehiclePrice}
            min={300000}
            max={10000000}
            step={25000}
            prefix="₹"
            minLabel="₹3 Lakhs"
            maxLabel="₹1 Crore"
            onChange={(v) => setParam('vehiclePrice', v)}
          />

          <FormInputNumber
            id="down-payment-pct"
            label="Down Payment (%)"
            value={downPaymentPct}
            min={10}
            max={80}
            step={5}
            suffix="%"
            subText={`Upfront Cash: ${formatCurrency(results.downPaymentAmount)}`}
            minLabel="10%"
            maxLabel="80%"
            onChange={(v) => setParam('downPaymentPct', v)}
          />

          <FormInputNumber
            id="interest-rate"
            label="Interest Rate (% p.a.)"
            value={rate}
            min={6.0}
            max={18.0}
            step={0.1}
            suffix="%"
            minLabel="6%"
            maxLabel="18%"
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

          <FormSelect
            id="fuel-type"
            label="Engine & Fuel Type"
            value={fuelType}
            options={[
              { value: 'petrol', label: 'Petrol Engine' },
              { value: 'diesel', label: 'Diesel Engine' },
              { value: 'hybrid', label: 'Strong Hybrid' },
              { value: 'ev', label: 'Electric Vehicle (EV)' },
            ]}
            onChange={(v) => setParam('fuelType', v)}
          />
        </div>

        {/* Right Panel: Output Dashboard & Charts */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Monthly Car Loan EMI"
            primaryValue={formatCurrency(results.emi)}
            secondaryItems={[
              { label: 'Loan Amount Required', value: formatCurrency(results.loanAmount) },
              { label: 'Upfront Cash Required', value: formatCurrency(results.downPaymentAmount + results.processingFee) },
              { label: 'Total Interest Payable', value: formatCurrency(results.totalInterest) },
              { label: '5-Year Ownership Cost', value: formatCurrency(results.totalOwnershipCost5Yr) },
            ]}
          />

          <ResultDonutChart
            title="Loan Balance vs Total Interest"
            centerValue={formatCurrency(results.emi)}
            centerSubtext="Monthly EMI"
            segments={[
              { label: 'Principal Loan Amount', amount: results.loanAmount, colorClass: 'bg-primary' },
              { label: 'Total Interest Paid', amount: results.totalInterest, colorClass: 'bg-semantic-warning' },
              { label: 'Processing & Reg Fees', amount: results.processingFee + results.registrationFee, colorClass: 'bg-accent-sky' },
            ]}
          />

          <FinancialHealthGauge
            title="FOIR Debt Affordability Gauge"
            score={Math.min(100, Math.max(0, 100 - results.foirPct))}
            statusLabel={results.affordabilityStatus}
            description={`Monthly EMI consumes ${results.foirPct}% of your net salary.`}
          />
        </div>
      </div>

      {/* 5. DOWN PAYMENT COACH ("+1 Lakh Down Payment Impact") */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft">
        <div class="flex items-center gap-2 text-primary font-bold font-heading text-lg">
          <span>💡</span>
          <h3>Down Payment Coach: "+ ₹1 Lakh Extra" Impact</h3>
        </div>
        <div class="grid sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-surface-strong border border-hairline text-center space-y-1">
            <span class="text-xs font-mono text-muted font-bold block uppercase">Monthly EMI Reduction</span>
            <span class="text-xl font-bold font-mono text-semantic-success">
              - {formatCurrency(results.dpCoach.emiReduction)} / mo
            </span>
          </div>
          <div class="p-4 rounded-2xl bg-surface-strong border border-hairline text-center space-y-1">
            <span class="text-xs font-mono text-muted font-bold block uppercase">Total Interest Saved</span>
            <span class="text-xl font-bold font-mono text-primary">
              {formatCurrency(results.dpCoach.interestSavedDp)}
            </span>
          </div>
          <div class="p-4 rounded-2xl bg-surface-strong border border-hairline text-center space-y-1">
            <span class="text-xs font-mono text-muted font-bold block uppercase">New Loan Balance</span>
            <span class="text-xl font-bold font-mono text-ink">
              {formatCurrency(results.dpCoach.newLoan)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. INTEREST RATE SENSITIVITY TABLE */}
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-strong border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold font-heading text-ink">Festive Offer Rate Sensitivity</h4>
          <span class="text-xs text-muted">Is waiting worth it?</span>
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="p-4 bg-canvas border border-hairline rounded-2xl space-y-1">
            <span class="text-xs text-muted font-bold block">If Rate drops by -0.5% (to {(rate - 0.5).toFixed(1)}%)</span>
            <span class="text-lg font-bold text-semantic-success">Save {formatCurrency(results.rateSensitivity.savings05)}</span>
          </div>
          <div class="p-4 bg-canvas border border-hairline rounded-2xl space-y-1">
            <span class="text-xs text-muted font-bold block">If Rate drops by -1.0% (to {(rate - 1.0).toFixed(1)}%)</span>
            <span class="text-lg font-bold text-primary">Save {formatCurrency(results.rateSensitivity.savings10)}</span>
          </div>
        </div>
      </div>

      {/* 7. TRUE COST OF OWNERSHIP DASHBOARD */}
      <CostBreakdownCard
        title="5-Year True Cost of Ownership Breakdown"
        subtitle={`Total 5-year financial commitment: ${formatCurrency(results.totalOwnershipCost5Yr)}`}
        items={ownershipItems}
      />

      {/* 8. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 9. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Total Interest Cost"
          value={formatCurrency(results.totalInterest)}
          subtitle={`${((results.totalInterest / results.loanAmount) * 100).toFixed(1)}% of loan principal.`}
          badgeText="Finance Charge"
          badgeColorClass="bg-semantic-warning"
        />
        <InsightCard
          title="Upfront Capital Needed"
          value={formatCurrency(results.downPaymentAmount + results.processingFee)}
          subtitle="Down payment + processing fee."
          badgeText="Cash Needed"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 10. DECISION SUMMARY CARD (SCREENSHOT FRIENDLY) */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 CAR BUYING DECISION SUMMARY</span>
          <span class="text-xs text-muted font-mono">{tenure} Year Plan</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Vehicle Budget</span>
            <span class="text-base font-bold text-ink">{formatCurrency(results.vehiclePrice)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Monthly EMI</span>
            <span class="text-base font-bold text-primary">{formatCurrency(results.emi)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Upfront Cash</span>
            <span class="text-base font-bold text-ink">{formatCurrency(results.downPaymentAmount)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">5-Yr Total Cost</span>
            <span class="text-base font-bold text-semantic-warning">{formatCurrency(results.totalOwnershipCost5Yr)}</span>
          </div>
        </div>
      </div>

      {/* 11. AMORTIZATION SCHEDULE TABLE */}
      <AmortizationTable schedule={results.schedule} />
    </div>
  );
}
