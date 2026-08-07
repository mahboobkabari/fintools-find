import { useState, useMemo } from 'preact/hooks';
import { calculateEmi } from '../../../calculators/loans/emi.js';
import { calculateLoan } from '../../../calculators/core/loanEngine.js';
import { formatCurrency } from '@utils/formatters.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Modular UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import AmortizationTable from './AmortizationTable';
import FormInputNumber from './FormInputNumber';

const DEFAULT_EMI_STATE = {
  amount: 1000000,
  rate: 8.5,
  tenure: 20,
  tenureType: 'years',
  salary: 150000,
};

export default function EmiFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_EMI_STATE);
  const { amount, rate, tenure, tenureType, salary } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [showAmortization, setShowAmortization] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Presets Configuration
  const presets = [
    { id: 'home', label: 'Home Loan', icon: '🏡', amount: 5000000, rate: 8.5, tenure: 20, tenureType: 'years', desc: '₹50L @ 8.5% for 20 Yrs' },
    { id: 'car', label: 'Car Loan', icon: '🚗', amount: 1000000, rate: 9.0, tenure: 5, tenureType: 'years', desc: '₹10L @ 9.0% for 5 Yrs' },
    { id: 'edu', label: 'Education Loan', icon: '🎓', amount: 1500000, rate: 10.0, tenure: 7, tenureType: 'years', desc: '₹15L @ 10.0% for 7 Yrs' },
    { id: 'personal', label: 'Personal Loan', icon: '💼', amount: 500000, rate: 12.0, tenure: 3, tenureType: 'years', desc: '₹5L @ 12.0% for 3 Yrs' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('amount', p.amount);
    setParam('rate', p.rate);
    setParam('tenure', p.tenure);
    setParam('tenureType', p.tenureType);
  };

  // 1. Standard Calculation Results
  const results = useMemo(() => {
    return calculateEmi({ amount, rate, tenure, tenureType });
  }, [amount, rate, tenure, tenureType]);

  // 2. Accelerated Calculation Results
  const acceleratedResults = useMemo(() => {
    const extraPrepaymentPerMonth = Math.round(results.emi / 12);
    return calculateLoan({
      amount,
      rate,
      tenure,
      tenureType,
      prepaymentMonthly: extraPrepaymentPerMonth,
    });
  }, [amount, rate, tenure, tenureType, results.emi]);

  // 3. Lower Rate Sensitivity Calculation (0.5% lower rate)
  const lowerRateResults = useMemo(() => {
    const lowerRate = Math.max(0.1, rate - 0.5);
    return calculateEmi({ amount, rate: lowerRate, tenure, tenureType });
  }, [amount, rate, tenure, tenureType]);

  // FOIR & Affordability Calculations
  const foirPct = salary > 0 ? Math.min(100, Math.round((results.emi / salary) * 100)) : 0;

  let foirStatus = {
    level: 'Safe',
    color: '#10B981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-600',
    badge: 'Safe & Healthy Budget',
    desc: 'Your monthly EMI fits comfortably within the recommended 35% income safety threshold.',
  };

  if (foirPct > 50) {
    foirStatus = {
      level: 'High Stress',
      color: '#EF4444',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-600',
      badge: 'High Financial Stress',
      desc: 'EMI exceeds 50% of monthly salary. Lenders consider this high risk; consider extending tenure.',
    };
  } else if (foirPct >= 35) {
    foirStatus = {
      level: 'Moderate Risk',
      color: '#F59E0B',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-600',
      badge: 'Moderate Budget Stress',
      desc: 'EMI is between 35%–50% of income. Banks may require secondary co-applicants or debt consolidation.',
    };
  }

  // Prepayment Savings Calculations
  const savedInterest = Math.max(0, results.totalInterest - acceleratedResults.totalInterest);
  const savedMonths = Math.max(0, results.tenureMonths - acceleratedResults.actualPayoffMonths);
  const savedYearsFormatted = (savedMonths / 12).toFixed(1);

  // Interest Multipliers
  const interestMultiplier = results.principal > 0 ? (results.totalInterest / results.principal).toFixed(2) : 0;
  const totalOutflowMultiplier = results.principal > 0 ? (results.totalPayment / results.principal).toFixed(2) : 1;
  const rateSavings = Math.max(0, results.totalInterest - lowerRateResults.totalInterest);

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

  return (
    <div class="space-y-10">
      {/* 1. Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} />

      {/* 2. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-7 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Loan Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="emi-amount"
            label="Loan Amount (₹)"
            value={amount}
            min={10000}
            max={20000000}
            step={10000}
            prefix="₹"
            minLabel="₹10K"
            maxLabel="₹2 Cr"
            onChange={(val) => setParam('amount', val)}
          />

          <FormInputNumber
            id="emi-rate"
            label="Interest Rate (p.a.)"
            value={rate}
            min={1}
            max={30}
            step={0.1}
            suffix="%"
            minLabel="1%"
            maxLabel="30%"
            inputWidthClass="w-20"
            onChange={(val) => setParam('rate', val)}
          />

          {/* Tenure Control with Yrs/Mos Toggle */}
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-ink">Tenure</span>
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
              id="emi-tenure"
              label=""
              value={tenure}
              min={1}
              max={maxTenureVal}
              step={1}
              suffix={tenureType === 'years' ? 'Yrs' : 'Mos'}
              minLabel={`1 ${tenureType === 'years' ? 'Yr' : 'Mo'}`}
              maxLabel={`${maxTenureVal} ${tenureType === 'years' ? 'Yrs' : 'Mos'}`}
              inputWidthClass="w-20"
              onChange={(val) => setParam('tenure', val)}
            />
          </div>

          <div class="pt-4 border-t border-hairline">
            <FormInputNumber
              id="net-salary"
              label="Net Monthly Income"
              badgeText="Affordability Check"
              value={salary}
              min={0}
              max={5000000}
              step={5000}
              prefix="₹"
              onChange={(val) => setParam('salary', val)}
            />
          </div>
        </div>

        {/* Right Panel: Result Dashboard */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            heroTitle="Required Monthly EMI"
            heroValue={results.emi}
            heroBadge="Fixed Installment"
            heroSubtext={`Monthly repayment for ${tenure} ${tenureType} at ${rate}% annual interest rate.`}
            metrics={[
              { label: 'Principal', value: results.principal, labelColor: 'text-muted', valueColor: 'text-ink' },
              { label: 'Total Interest', value: results.totalInterest, labelColor: 'text-semantic-warning', valueColor: 'text-semantic-warning', trend: 'up' },
              { label: 'Total Outflow', value: results.totalPayment, labelColor: 'text-ink', valueColor: 'text-ink' },
            ]}
          />

          <ResultDonutChart
            primaryValue={results.principal}
            primaryLabel="Principal Amount"
            secondaryValue={results.totalInterest}
            secondaryLabel="Total Interest"
            totalValue={results.totalPayment}
            centerLabel="Interest"
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
            <span>{showAmortization ? 'Hide Full Schedule' : 'View Full Amortization Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Amortization Table */}
      {showAmortization && (
        <div id="amortization-schedule-container" class="pt-2">
          <AmortizationTable schedule={results.schedule} currency="INR" />
        </div>
      )}

      {/* Prepayment Savings & Affordability */}
      <div class="grid md:grid-cols-2 gap-8 pt-4">
        <RecommendationCard
          tagLine="Smart Prepayment Coach"
          badgeText="1 Extra EMI / Year"
          title="Save Interest & Finish Early"
          description={`By making just one additional EMI payment (₹${formatCurrency(results.emi, 'INR')}) toward principal each year:`}
          metrics={[
            { label: 'Interest Saved', value: savedInterest, labelColor: 'text-emerald-300' },
            { label: 'Time Saved', value: `${savedYearsFormatted} Years`, labelColor: 'text-blue-300' },
          ]}
        />

        <FinancialHealthGauge
          ratioPct={foirPct}
          status={foirStatus}
          title="Salary Commitment Ratio"
          label="FOIR"
        />
      </div>

      {/* Financial Intelligence */}
      <InsightCard
        title="Dynamic Financial Intelligence"
        insights={[
          {
            label: 'Interest Multiplier',
            value: `${interestMultiplier}×`,
            labelColor: 'text-primary',
            desc: `You pay ₹${interestMultiplier} in cumulative bank interest for every ₹1.00 of principal borrowed.`,
          },
          {
            label: 'Rate Sensitivity (-0.5%)',
            value: formatCurrency(rateSavings, 'INR'),
            labelColor: 'text-semantic-success',
            valueColor: 'text-semantic-success',
            desc: `A 0.5% lower interest rate (${rate - 0.5}%) saves ₹${formatCurrency(rateSavings, 'INR')} over your tenure.`,
          },
          {
            label: 'Total Outflow Ratio',
            value: `${totalOutflowMultiplier}×`,
            labelColor: 'text-accent-sky',
            desc: `Total repayment amount equals ${totalOutflowMultiplier} times the original loan amount.`,
          },
        ]}
      />
    </div>
  );
}
