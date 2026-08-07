import { useState, useMemo } from 'preact/hooks';
import { calculateHomeLoan } from '../../../calculators/loans/home-loan-calculator.js';
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
import AmortizationTable from './AmortizationTable';
import FormInputNumber from './FormInputNumber';

const DEFAULT_HOME_LOAN_STATE = {
  propertyValue: 5000000,
  downPaymentPct: 20,
  rate: 8.5,
  tenure: 20,
  tenureType: 'years',
  processingFeePct: 0.5,
  stampDutyPct: 6.0,
  monthlyIncome: 150000,
  existingEmi: 0,
  taxSlabPct: 30,
};

export default function HomeLoanFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_HOME_LOAN_STATE);
  const {
    propertyValue,
    downPaymentPct,
    rate,
    tenure,
    tenureType,
    processingFeePct,
    stampDutyPct,
    monthlyIncome,
    existingEmi,
    taxSlabPct,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [showAmortization, setShowAmortization] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Home Buyer Presets Configuration
  const presets = [
    { id: 'starter', label: 'Starter Apartment', icon: '🏢', propertyValue: 3000000, downPaymentPct: 15, rate: 8.5, tenure: 20, tenureType: 'years', desc: '₹30L Property @ 15% DP' },
    { id: 'family', label: 'Family Home', icon: '🏡', propertyValue: 6000000, downPaymentPct: 20, rate: 8.5, tenure: 20, tenureType: 'years', desc: '₹60L Property @ 20% DP' },
    { id: 'executive', label: 'Executive Villa', icon: '🏰', propertyValue: 12000000, downPaymentPct: 25, rate: 8.5, tenure: 25, tenureType: 'years', desc: '₹1.2 Cr Property @ 25% DP' },
    { id: 'luxury', label: 'Luxury Estate', icon: '✨', propertyValue: 25000000, downPaymentPct: 30, rate: 8.5, tenure: 30, tenureType: 'years', desc: '₹2.5 Cr Property @ 30% DP' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('propertyValue', p.propertyValue);
    setParam('downPaymentPct', p.downPaymentPct);
    setParam('rate', p.rate);
    setParam('tenure', p.tenure);
    setParam('tenureType', p.tenureType);
  };

  // Perform full calculation
  const results = useMemo(() => {
    return calculateHomeLoan({
      propertyValue,
      downPaymentPct,
      rate,
      tenure,
      tenureType,
      processingFeePct,
      stampDutyPct,
      monthlyIncome,
      existingEmi,
      taxSlabPct,
    });
  }, [
    propertyValue,
    downPaymentPct,
    rate,
    tenure,
    tenureType,
    processingFeePct,
    stampDutyPct,
    monthlyIncome,
    existingEmi,
    taxSlabPct,
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

  const maxTenureVal = tenureType === 'years' ? 30 : 360;

  // Breakdown items for Cost of Ownership
  const tcoItems = [
    { label: 'Home Property Price', amount: results.propertyValue, colorClass: 'bg-primary', desc: 'Base agreement value of the property.' },
    { label: 'Total Interest Payable', amount: results.totalInterest, colorClass: 'bg-accent-amber', desc: 'Cumulative bank interest paid over your tenure.' },
    { label: 'Stamp Duty & Registration (Est. 6%)', amount: results.stampDutyAmount, colorClass: 'bg-accent-sky', desc: 'Government taxes and legal registration fees.' },
    { label: 'Bank Processing Fee (0.5%)', amount: results.processingFee, colorClass: 'bg-emerald-500', desc: 'One-time bank processing and documentation charges.' },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} />

      {/* 2. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Property & Loan Inputs</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="property-val"
            label="Home Property Price (₹)"
            value={propertyValue}
            min={500000}
            max={100000000}
            step={100000}
            prefix="₹"
            minLabel="₹5 Lakhs"
            maxLabel="₹10 Cr"
            onChange={(val) => setParam('propertyValue', val)}
          />

          <FormInputNumber
            id="dp-pct"
            label={`Down Payment (${downPaymentPct}%)`}
            subText={`₹${formatCurrency(results.downPaymentAmount, 'INR')} upfront`}
            value={downPaymentPct}
            min={0}
            max={90}
            step={1}
            suffix="%"
            minLabel="0% (₹0)"
            maxLabel="90%"
            inputWidthClass="w-16"
            onChange={(val) => setParam('downPaymentPct', val)}
          />

          <FormInputNumber
            id="hl-rate"
            label="Interest Rate (p.a.)"
            value={rate}
            min={1}
            max={20}
            step={0.1}
            suffix="%"
            minLabel="1%"
            maxLabel="20%"
            inputWidthClass="w-16"
            onChange={(val) => setParam('rate', val)}
          />

          {/* Tenure Control with Yrs/Mos Toggle */}
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-ink">Loan Tenure</span>
                <div class="inline-flex p-0.5 bg-surface-strong rounded-lg border border-hairline text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      if (tenureType === 'months') {
                        setParam('tenure', Math.max(1, Math.round(tenure / 12)));
                        setParam('tenureType', 'years');
                      }
                    }}
                    class={`px-2.5 py-0.5 rounded-md transition-colors ${tenureType === 'years' ? 'bg-primary text-white' : 'text-muted'}`}
                  >
                    Yrs
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (tenureType === 'years') {
                        setParam('tenure', Math.min(360, tenure * 12));
                        setParam('tenureType', 'months');
                      }
                    }}
                    class={`px-2.5 py-0.5 rounded-md transition-colors ${tenureType === 'months' ? 'bg-primary text-white' : 'text-muted'}`}
                  >
                    Mos
                  </button>
                </div>
              </div>
            </div>

            <FormInputNumber
              id="hl-tenure"
              label=""
              value={tenure}
              min={1}
              max={maxTenureVal}
              step={1}
              suffix={tenureType === 'years' ? 'Yrs' : 'Mos'}
              minLabel={`1 ${tenureType === 'years' ? 'Yr' : 'Mo'}`}
              maxLabel={`${maxTenureVal} ${tenureType === 'years' ? 'Yrs' : 'Mos'}`}
              inputWidthClass="w-16"
              onChange={(val) => setParam('tenure', val)}
            />
          </div>

          <div class="pt-4 border-t border-hairline space-y-4">
            <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-muted">Affordability & Income Check</h4>
            <div class="grid sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="hl-income"
                label="Net Monthly Income"
                value={monthlyIncome}
                min={0}
                max={5000000}
                step={5000}
                prefix="₹"
                inputWidthClass="w-28"
                onChange={(val) => setParam('monthlyIncome', val)}
              />

              <FormInputNumber
                id="hl-existing-emi"
                label="Existing EMIs"
                value={existingEmi}
                min={0}
                max={1000000}
                step={2000}
                prefix="₹"
                inputWidthClass="w-28"
                onChange={(val) => setParam('existingEmi', val)}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Result Dashboard */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            heroTitle="Monthly Home Loan EMI"
            heroValue={results.emi}
            heroBadge="Fixed Monthly Payment"
            heroSubtext={`Net Loan Principal: ₹${formatCurrency(results.loanAmount, 'INR')} at ${rate}% interest.`}
            metrics={[
              { label: 'Down Payment', value: results.downPaymentAmount, labelColor: 'text-semantic-success', valueColor: 'text-semantic-success' },
              { label: 'Loan Principal', value: results.loanAmount, labelColor: 'text-muted', valueColor: 'text-ink' },
              { label: 'Total Interest', value: results.totalInterest, labelColor: 'text-semantic-warning', valueColor: 'text-semantic-warning', trend: 'up' },
            ]}
          />

          <ResultDonutChart
            primaryValue={results.loanAmount}
            primaryLabel="Net Loan Principal"
            secondaryValue={results.totalInterest}
            secondaryLabel="Total Interest"
            totalValue={results.totalBankPayment}
            centerLabel="Bank Interest"
          />

          <button
            type="button"
            onClick={() => setShowAmortization(!showAmortization)}
            aria-expanded={showAmortization}
            aria-controls="amortization-schedule-container"
            class="w-full py-3.5 px-6 bg-surface-strong hover:bg-hairline text-ink font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 border border-hairline shadow-soft"
          >
            <svg class={`w-4 h-4 text-primary transition-transform ${showAmortization ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
            <span>{showAmortization ? 'Hide Amortization Schedule' : 'View Full Multi-Year Amortization Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Amortization Table */}
      {showAmortization && (
        <div id="amortization-schedule-container" class="pt-2">
          <AmortizationTable schedule={results.schedule} currency="INR" />
        </div>
      )}

      {/* Down Payment Simulator */}
      <ComparisonCard
        title="1. Down Payment Impact Simulator"
        subtitle="Compare your baseline down payment against increasing it by +5% to see long-term interest & EMI savings."
        scenarioA={{
          title: `Current (${results.downPaymentImpact.currentDpPct}% Down Payment)`,
          badgeText: `₹${formatCurrency(results.downPaymentImpact.currentDpAmount, 'INR')} Upfront`,
          metrics: [
            { label: 'Monthly EMI', value: results.downPaymentImpact.currentEmi, color: 'text-ink' },
            { label: 'Total Interest', value: results.downPaymentImpact.currentInterest, color: 'text-semantic-warning' },
            { label: 'Total Outflow', value: results.downPaymentImpact.currentTotalCost, color: 'text-ink' },
          ],
        }}
        scenarioB={{
          title: `Simulator (${results.downPaymentImpact.altDpPct}% Down Payment)`,
          badgeText: `₹${formatCurrency(results.downPaymentImpact.altDpAmount, 'INR')} Upfront (+5%)`,
          isRecommended: true,
          metrics: [
            { label: 'Monthly EMI', value: results.downPaymentImpact.altEmi, color: 'text-primary' },
            { label: 'Total Interest', value: results.downPaymentImpact.altInterest, color: 'text-semantic-success' },
            { label: 'Total Outflow', value: results.downPaymentImpact.altTotalCost, color: 'text-primary' },
          ],
        }}
        highlights={[
          { label: 'Monthly EMI Savings', delta: results.downPaymentImpact.emiSavings, isPositive: true, desc: 'Lower monthly obligation every month' },
          { label: 'Total Interest Saved', delta: results.downPaymentImpact.interestSaved, isPositive: true, desc: 'Direct bank interest eliminated' },
          { label: 'Additional Cash Needed', delta: results.downPaymentImpact.additionalDpNeeded, isPositive: false, desc: 'Extra upfront down payment required' },
        ]}
        recommendationText={`Adding ₹${formatCurrency(results.downPaymentImpact.additionalDpNeeded, 'INR')} more to your down payment slashes monthly EMI by ₹${formatCurrency(results.downPaymentImpact.emiSavings, 'INR')} and saves ₹${formatCurrency(results.downPaymentImpact.interestSaved, 'INR')} in total bank interest over your loan tenure.`}
      />

      {/* Affordability & TCO */}
      <div class="grid md:grid-cols-2 gap-8">
        <FinancialHealthGauge
          ratioPct={results.affordability.foirPct}
          status={{
            level: results.affordability.category,
            color: results.affordability.color,
            bgColor: results.affordability.category === 'Risky' ? 'bg-red-500/10' : results.affordability.category === 'Stretch' ? 'bg-amber-500/10' : 'bg-emerald-500/10',
            borderColor: results.affordability.category === 'Risky' ? 'border-red-500/30' : results.affordability.category === 'Stretch' ? 'border-amber-500/30' : 'border-emerald-500/30',
            textColor: results.affordability.category === 'Risky' ? 'text-red-600' : results.affordability.category === 'Stretch' ? 'text-amber-600' : 'text-emerald-600',
            badge: results.affordability.badge,
            desc: results.affordability.description,
          }}
          title="2. Home Buying Affordability Score"
          label="FOIR %"
        />

        <CostBreakdownCard
          title="3. Total Cost of Ownership (TCO)"
          subtitle="Complete financial cost breakdown including home price, interest, fee, and stamp duty."
          items={tcoItems}
          totalLabel="Total Ownership Outgo"
          totalAmount={results.totalOwnershipCost}
          currency="INR"
        />
      </div>

      {/* Tax Benefit & Smart Recommendations */}
      <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <h3 class="text-xl font-bold font-heading text-ink">4. Tax Benefit Summary</h3>
              <p class="text-xs text-muted">Income Tax Act provisions (India)</p>
            </div>
            <div class="flex items-center gap-1 bg-surface-strong px-2.5 py-1 rounded-xl border border-hairline">
              <span class="text-[10px] font-mono text-muted">Slab:</span>
              <select
                value={taxSlabPct}
                onChange={(e) => setParam('taxSlabPct', Number(e.currentTarget.value))}
                class="bg-transparent font-mono text-xs font-bold text-primary focus:outline-none"
                aria-label="Tax Slab Percentage select"
              >
                <option value={30}>30% Slab</option>
                <option value={20}>20% Slab</option>
                <option value={10}>10% Slab</option>
                <option value={5}>5% Slab</option>
              </select>
            </div>
          </div>

          <div class="space-y-4">
            <div class="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-1">
              <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-amber-700">Section 24(b) — Interest Paid</span>
                <span class="font-mono font-bold text-amber-700">Max ₹2,00,000 / yr</span>
              </div>
              <div class="flex justify-between items-center text-xs text-body pt-1">
                <span>Eligible Deduction:</span>
                <span class="font-mono font-extrabold text-ink">₹{formatCurrency(results.taxBenefit.sec24bDeduction, 'INR')}</span>
              </div>
            </div>

            <div class="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-1">
              <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-emerald-700">Section 80C — Principal Repaid</span>
                <span class="font-mono font-bold text-emerald-700">Max ₹1,50,000 / yr</span>
              </div>
              <div class="flex justify-between items-center text-xs text-body pt-1">
                <span>Eligible Deduction:</span>
                <span class="font-mono font-extrabold text-ink">₹{formatCurrency(results.taxBenefit.sec80cDeduction, 'INR')}</span>
              </div>
            </div>

            <div class="p-5 bg-primary/10 border-2 border-primary/30 rounded-2xl space-y-2 text-center">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-primary">Est. Annual Tax Savings</span>
              <div class="font-mono font-extrabold text-2xl text-primary">
                ₹{formatCurrency(results.taxBenefit.annualTaxSaved, 'INR')} <span class="text-xs font-normal text-muted">/ year</span>
              </div>
              <p class="text-[11px] text-muted">
                (Saves ~₹{formatCurrency(results.taxBenefit.monthlyTaxSavings, 'INR')} every month in income tax at {taxSlabPct}% slab)
              </p>
            </div>
          </div>
        </div>

        <RecommendationCard
          tagLine="5. Smart Recommendations"
          badgeText="Contextual Coaching"
          title="Ways to Save Lakhs on Your Mortgage"
          description="Algorithmic suggestions based on your exact loan parameters:"
          metrics={[
            { label: 'Down Payment +5%', value: `Save ₹${formatCurrency(results.downPaymentImpact.interestSaved, 'INR')}`, labelColor: 'text-emerald-300' },
            { label: 'Pay 1 Extra EMI/Yr', value: `Save ₹${formatCurrency(results.smartRecommendations[3]?.savingsAmount || 0, 'INR')}`, labelColor: 'text-blue-300' },
          ]}
        />
      </div>

      {/* Financial Intelligence */}
      <InsightCard
        title="Dynamic Financial Intelligence & Multipliers"
        insights={[
          {
            label: 'Interest Burden Multiplier',
            value: `${(results.loanAmount > 0 ? (results.totalInterest / results.loanAmount).toFixed(2) : 0)}×`,
            labelColor: 'text-primary',
            desc: `You pay ₹${(results.loanAmount > 0 ? (results.totalInterest / results.loanAmount).toFixed(2) : 0)} in cumulative bank interest for every ₹1.00 of loan principal borrowed.`,
          },
          {
            label: 'Rate Concession (-0.5%)',
            value: formatCurrency(results.smartRecommendations[2]?.savingsAmount || 0, 'INR'),
            labelColor: 'text-semantic-success',
            valueColor: 'text-semantic-success',
            desc: `Securing a 0.5% lower rate (${(rate - 0.5).toFixed(1)}%) saves ₹${formatCurrency(results.smartRecommendations[2]?.savingsAmount || 0, 'INR')} over your tenure.`,
          },
          {
            label: 'Total Ownership Ratio',
            value: `${(results.propertyValue > 0 ? (results.totalOwnershipCost / results.propertyValue).toFixed(2) : 1)}×`,
            labelColor: 'text-accent-sky',
            desc: `Total cost of ownership (including interest & stamp duty) is ${(results.propertyValue > 0 ? (results.totalOwnershipCost / results.propertyValue).toFixed(2) : 1)} times original property price.`,
          },
        ]}
      />
    </div>
  );
}
