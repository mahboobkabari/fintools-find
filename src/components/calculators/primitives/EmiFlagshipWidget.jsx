import { useState, useMemo, useEffect } from 'preact/hooks';
import { calculateEmi } from '../../../calculators/loans/emi.js';
import { calculateLoan } from '../../../calculators/core/loanEngine.js';
import { formatCurrency } from '@utils/formatters.js';

// Modular UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import AmortizationTable from './AmortizationTable';

export default function EmiFlagshipWidget() {
  // Initial parameters with URL query / hash fallback
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [tenureType, setTenureType] = useState('years');
  const [salary, setSalary] = useState(150000);
  const [activePreset, setActivePreset] = useState(null);
  const [showAmortization, setShowAmortization] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Sync parameters from URL query string on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlAmount = Number(params.get('amount'));
      const urlRate = Number(params.get('rate'));
      const urlTenure = Number(params.get('tenure'));
      const urlTenureType = params.get('tenureType');
      const urlSalary = Number(params.get('salary'));

      if (urlAmount > 0) setAmount(urlAmount);
      if (urlRate > 0) setRate(urlRate);
      if (urlTenure > 0) setTenure(urlTenure);
      if (urlTenureType === 'months' || urlTenureType === 'years') setTenureType(urlTenureType);
      if (urlSalary > 0) setSalary(urlSalary);
    }
  }, []);

  // Sync state back to URL query parameters without reloading
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history.replaceState) {
      const params = new URLSearchParams();
      params.set('amount', amount);
      params.set('rate', rate);
      params.set('tenure', tenure);
      params.set('tenureType', tenureType);
      if (salary > 0) params.set('salary', salary);

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [amount, rate, tenure, tenureType, salary]);

  // Presets Configuration
  const presets = [
    {
      id: 'home',
      label: 'Home Loan',
      icon: '🏡',
      amount: 5000000,
      rate: 8.5,
      tenure: 20,
      tenureType: 'years',
      desc: '₹50L @ 8.5% for 20 Yrs',
    },
    {
      id: 'car',
      label: 'Car Loan',
      icon: '🚗',
      amount: 1000000,
      rate: 9.0,
      tenure: 5,
      tenureType: 'years',
      desc: '₹10L @ 9.0% for 5 Yrs',
    },
    {
      id: 'edu',
      label: 'Education Loan',
      icon: '🎓',
      amount: 1500000,
      rate: 10.0,
      tenure: 7,
      tenureType: 'years',
      desc: '₹15L @ 10.0% for 7 Yrs',
    },
    {
      id: 'personal',
      label: 'Personal Loan',
      icon: '💼',
      amount: 500000,
      rate: 12.0,
      tenure: 3,
      tenureType: 'years',
      desc: '₹5L @ 12.0% for 3 Yrs',
    },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setAmount(p.amount);
    setRate(p.rate);
    setTenure(p.tenure);
    setTenureType(p.tenureType);
  };

  // 1. Standard Calculation Results
  const results = useMemo(() => {
    return calculateEmi({ amount, rate, tenure, tenureType });
  }, [amount, rate, tenure, tenureType]);

  // 2. Accelerated Calculation Results (1 Extra EMI per year = baseEmi / 12 per month)
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

  // Interest Multiplier
  const interestMultiplier = results.principal > 0 ? (results.totalInterest / results.principal).toFixed(2) : 0;
  const totalOutflowMultiplier = results.principal > 0 ? (results.totalPayment / results.principal).toFixed(2) : 1;
  const rateSavings = Math.max(0, results.totalInterest - lowerRateResults.totalInterest);

  // Copy share URL handler
  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleReset = () => {
    setActivePreset(null);
    setAmount(1000000);
    setRate(8.5);
    setTenure(20);
    setTenureType('years');
    setSalary(150000);
  };

  // Slider Percentage Fill Calculations
  const amountPct = Math.min(100, Math.max(0, ((amount - 10000) / (20000000 - 10000)) * 100));
  const ratePct = Math.min(100, Math.max(0, ((rate - 1) / (30 - 1)) * 100));
  const maxTenureVal = tenureType === 'years' ? 30 : 360;
  const tenurePct = Math.min(100, Math.max(0, ((tenure - 1) / (maxTenureVal - 1)) * 100));

  return (
    <div class="space-y-10">
      {/* 1. One-Tap Scenario Preset Cards */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} />

      {/* 2. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Sliders & Controls */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-7 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Loan Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Amount Control */}
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label htmlFor="emi-amount" class="text-sm font-semibold text-ink">
                Loan Amount (₹)
              </label>
              <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                <span class="text-xs font-mono text-muted mr-1 font-bold">₹</span>
                <input
                  type="number"
                  id="emi-amount"
                  value={amount}
                  onInput={(e) => setAmount(Number(e.currentTarget.value) || 10000)}
                  min={10000}
                  max={20000000}
                  step={10000}
                  class="w-32 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  aria-label="Loan Amount input"
                />
              </div>
            </div>

            <div class="relative pt-1">
              <input
                type="range"
                min={10000}
                max={20000000}
                step={10000}
                value={amount}
                onInput={(e) => setAmount(Number(e.currentTarget.value))}
                style={{
                  background: `linear-gradient(to right, #2563EB 0%, #2563EB ${amountPct}%, #E2E8F0 ${amountPct}%, #E2E8F0 100%)`,
                }}
                class="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Loan Amount slider"
              />
              <div class="flex justify-between text-[11px] font-mono text-muted mt-1 font-medium">
                <span>₹10K</span>
                <span>₹2 Cr</span>
              </div>
            </div>
          </div>

          {/* Interest Rate Control */}
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label htmlFor="emi-rate" class="text-sm font-semibold text-ink">
                Interest Rate (p.a.)
              </label>
              <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                <input
                  type="number"
                  id="emi-rate"
                  value={rate}
                  onInput={(e) => setRate(Number(e.currentTarget.value) || 1)}
                  min={1}
                  max={30}
                  step={0.1}
                  class="w-20 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  aria-label="Interest Rate input"
                />
                <span class="text-xs font-mono text-muted ml-1 font-bold">%</span>
              </div>
            </div>

            <div class="relative pt-1">
              <input
                type="range"
                min={1}
                max={30}
                step={0.1}
                value={rate}
                onInput={(e) => setRate(Number(e.currentTarget.value))}
                style={{
                  background: `linear-gradient(to right, #2563EB 0%, #2563EB ${ratePct}%, #E2E8F0 ${ratePct}%, #E2E8F0 100%)`,
                }}
                class="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Interest Rate slider"
              />
              <div class="flex justify-between text-[11px] font-mono text-muted mt-1 font-medium">
                <span>1%</span>
                <span>30%</span>
              </div>
            </div>
          </div>

          {/* Tenure Control */}
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <label htmlFor="emi-tenure" class="text-sm font-semibold text-ink">
                  Tenure
                </label>
                <div class="inline-flex p-0.5 bg-surface-strong rounded-lg border border-hairline text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      if (tenureType === 'months') {
                        setTenure(Math.max(1, Math.round(tenure / 12)));
                        setTenureType('years');
                      }
                    }}
                    class={`px-2.5 py-0.5 rounded-md transition-colors ${
                      tenureType === 'years' ? 'bg-primary text-white' : 'text-muted'
                    }`}
                  >
                    Yrs
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (tenureType === 'years') {
                        setTenure(Math.min(360, tenure * 12));
                        setTenureType('months');
                      }
                    }}
                    class={`px-2.5 py-0.5 rounded-md transition-colors ${
                      tenureType === 'months' ? 'bg-primary text-white' : 'text-muted'
                    }`}
                  >
                    Mos
                  </button>
                </div>
              </div>

              <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                <input
                  type="number"
                  id="emi-tenure"
                  value={tenure}
                  onInput={(e) => setTenure(Number(e.currentTarget.value) || 1)}
                  min={1}
                  max={maxTenureVal}
                  step={1}
                  class="w-20 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  aria-label="Tenure input"
                />
                <span class="text-xs font-mono text-muted ml-1 font-semibold">{tenureType === 'years' ? 'Yrs' : 'Mos'}</span>
              </div>
            </div>

            <div class="relative pt-1">
              <input
                type="range"
                min={1}
                max={maxTenureVal}
                step={1}
                value={tenure}
                onInput={(e) => setTenure(Number(e.currentTarget.value))}
                style={{
                  background: `linear-gradient(to right, #2563EB 0%, #2563EB ${tenurePct}%, #E2E8F0 ${tenurePct}%, #E2E8F0 100%)`,
                }}
                class="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Tenure slider"
              />
              <div class="flex justify-between text-[11px] font-mono text-muted mt-1 font-medium">
                <span>1 {tenureType === 'years' ? 'Yr' : 'Mo'}</span>
                <span>{maxTenureVal} {tenureType === 'years' ? 'Yrs' : 'Mos'}</span>
              </div>
            </div>
          </div>

          {/* Optional Salary Field */}
          <div class="pt-4 border-t border-hairline space-y-2">
            <div class="flex items-center justify-between">
              <label htmlFor="net-salary" class="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <span>Net Monthly Income</span>
                <span class="text-[10px] text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-pill">Affordability Check</span>
              </label>
              <div class="flex items-center bg-surface-strong px-3.5 py-1 rounded-xl border border-hairline">
                <span class="text-xs font-mono text-muted mr-1 font-bold">₹</span>
                <input
                  type="number"
                  id="net-salary"
                  value={salary}
                  onInput={(e) => setSalary(Number(e.currentTarget.value) || 0)}
                  min={0}
                  step={5000}
                  class="w-28 bg-transparent text-right font-mono text-xs font-bold text-ink focus:outline-none"
                  aria-label="Net Monthly Income input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Modular Result Dashboard */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            heroTitle="Required Monthly EMI"
            heroValue={results.emi}
            heroBadge="Fixed Installment"
            heroSubtext={`Monthly repayment for ${tenure} ${tenureType} at ${rate}% annual interest rate.`}
            metrics={[
              { label: 'Principal', value: results.principal, labelColor: 'text-muted', valueColor: 'text-ink' },
              { label: 'Total Interest', value: results.totalInterest, labelColor: 'text-semantic-warning', valueColor: 'text-semantic-warning' },
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

      {/* Collapsible Amortization Table */}
      {showAmortization && (
        <div id="amortization-schedule-container" class="pt-2">
          <AmortizationTable schedule={results.schedule} currency="INR" />
        </div>
      )}

      {/* 3. Modular Prepayment Savings Coach & Affordability Gauge Grid */}
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

      {/* 4. Modular Dynamic Financial Intelligence Cards */}
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
