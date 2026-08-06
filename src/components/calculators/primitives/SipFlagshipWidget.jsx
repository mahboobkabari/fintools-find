import { useState, useMemo, useEffect } from 'preact/hooks';
import { calculateSipTool } from '../../../calculators/investment/sip.js';
import { calculateSip } from '../../../calculators/core/investmentEngine.js';
import { formatCurrency } from '@utils/formatters.js';

// Reusable Modular UI Components from Design System
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';

export default function SipFlagshipWidget() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [tenureYears, setTenureYears] = useState(10);
  const [activePreset, setActivePreset] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Hydrate parameters from URL query on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMonthly = Number(params.get('monthly'));
      const urlRate = Number(params.get('rate'));
      const urlTenure = Number(params.get('tenure'));

      if (urlMonthly > 0) setMonthlyInvestment(urlMonthly);
      if (urlRate > 0) setExpectedReturnRate(urlRate);
      if (urlTenure > 0) setTenureYears(urlTenure);
    }
  }, []);

  // Sync state back to URL query parameters
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history.replaceState) {
      const params = new URLSearchParams();
      params.set('monthly', monthlyInvestment);
      params.set('rate', expectedReturnRate);
      params.set('tenure', tenureYears);

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [monthlyInvestment, expectedReturnRate, tenureYears]);

  // Presets Configuration
  const presets = [
    {
      id: 'starter',
      label: 'Wealth Starter',
      icon: '🌱',
      monthlyInvestment: 5000,
      expectedReturnRate: 12,
      tenureYears: 10,
      desc: '₹5K/mo @ 12% for 10 Yrs',
    },
    {
      id: 'builder',
      label: 'Wealth Builder',
      icon: '🚀',
      monthlyInvestment: 10000,
      expectedReturnRate: 12,
      tenureYears: 15,
      desc: '₹10K/mo @ 12% for 15 Yrs',
    },
    {
      id: 'retire',
      label: 'Retirement Corpus',
      icon: '🎯',
      monthlyInvestment: 25000,
      expectedReturnRate: 12,
      tenureYears: 20,
      desc: '₹25K/mo @ 12% for 20 Yrs',
    },
    {
      id: 'edu',
      label: 'Child Education',
      icon: '🎓',
      monthlyInvestment: 15000,
      expectedReturnRate: 12,
      tenureYears: 12,
      desc: '₹15K/mo @ 12% for 12 Yrs',
    },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setMonthlyInvestment(p.monthlyInvestment);
    setExpectedReturnRate(p.expectedReturnRate);
    setTenureYears(p.tenureYears);
  };

  // 1. Core SIP Results
  const results = useMemo(() => {
    return calculateSipTool({
      monthlyInvestment,
      expectedReturnRate,
      tenureYears,
    });
  }, [monthlyInvestment, expectedReturnRate, tenureYears]);

  // 2. Accelerated Results (+5 Extra Years of Compounding)
  const longerTenureResults = useMemo(() => {
    return calculateSip({
      monthlyInvestment,
      expectedReturnRate,
      tenureYears: tenureYears + 5,
    });
  }, [monthlyInvestment, expectedReturnRate, tenureYears]);

  // 3. Step-Up Sensitivity (+₹500 / Month Extra Contribution)
  const stepUpResults = useMemo(() => {
    return calculateSip({
      monthlyInvestment: monthlyInvestment + 500,
      expectedReturnRate,
      tenureYears,
    });
  }, [monthlyInvestment, expectedReturnRate, tenureYears]);

  // Insights Calculations
  const returnsMultiplier = results.totalInvested > 0 ? (results.estReturns / results.totalInvested).toFixed(2) : 0;
  const growthMultiplier = results.totalInvested > 0 ? (results.maturityValue / results.totalInvested).toFixed(2) : 1;
  const extraFiveYearsCorpus = Math.max(0, longerTenureResults.maturityValue - results.maturityValue);
  const extraFiveYearsPct = results.maturityValue > 0 ? Math.round((extraFiveYearsCorpus / results.maturityValue) * 100) : 0;
  const stepUpCorpusGain = Math.max(0, stepUpResults.maturityValue - results.maturityValue);

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
    setMonthlyInvestment(5000);
    setExpectedReturnRate(12);
    setTenureYears(10);
  };

  // Slider percentage calculations
  const monthlyPct = Math.min(100, Math.max(0, ((monthlyInvestment - 500) / (500000 - 500)) * 100));
  const ratePct = Math.min(100, Math.max(0, ((expectedReturnRate - 1) / (30 - 1)) * 100));
  const tenurePct = Math.min(100, Math.max(0, ((tenureYears - 1) / (40 - 1)) * 100));

  return (
    <div class="space-y-10">
      {/* 1. One-Tap Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Quick SIP Presets" />

      {/* 2. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Sliders & Controls */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-7 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">SIP Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Monthly Investment Control */}
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label htmlFor="sip-monthly" class="text-sm font-semibold text-ink">
                Monthly Investment (₹)
              </label>
              <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                <span class="text-xs font-mono text-muted mr-1 font-bold">₹</span>
                <input
                  type="number"
                  id="sip-monthly"
                  value={monthlyInvestment}
                  onInput={(e) => setMonthlyInvestment(Number(e.currentTarget.value) || 500)}
                  min={500}
                  max={500000}
                  step={500}
                  class="w-32 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  aria-label="Monthly Investment input"
                />
              </div>
            </div>

            <div class="relative pt-1">
              <input
                type="range"
                min={500}
                max={500000}
                step={500}
                value={monthlyInvestment}
                onInput={(e) => setMonthlyInvestment(Number(e.currentTarget.value))}
                style={{
                  background: `linear-gradient(to right, #2563EB 0%, #2563EB ${monthlyPct}%, #E2E8F0 ${monthlyPct}%, #E2E8F0 100%)`,
                }}
                class="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Monthly Investment slider"
              />
              <div class="flex justify-between text-[11px] font-mono text-muted mt-1 font-medium">
                <span>₹500</span>
                <span>₹5 Lakhs</span>
              </div>
            </div>
          </div>

          {/* Expected Return Rate Control */}
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label htmlFor="sip-rate" class="text-sm font-semibold text-ink">
                Expected Annual Return (p.a.)
              </label>
              <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                <input
                  type="number"
                  id="sip-rate"
                  value={expectedReturnRate}
                  onInput={(e) => setExpectedReturnRate(Number(e.currentTarget.value) || 1)}
                  min={1}
                  max={30}
                  step={0.5}
                  class="w-20 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  aria-label="Expected Return Rate input"
                />
                <span class="text-xs font-mono text-muted ml-1 font-bold">%</span>
              </div>
            </div>

            <div class="relative pt-1">
              <input
                type="range"
                min={1}
                max={30}
                step={0.5}
                value={expectedReturnRate}
                onInput={(e) => setExpectedReturnRate(Number(e.currentTarget.value))}
                style={{
                  background: `linear-gradient(to right, #2563EB 0%, #2563EB ${ratePct}%, #E2E8F0 ${ratePct}%, #E2E8F0 100%)`,
                }}
                class="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Expected Return Rate slider"
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
              <label htmlFor="sip-tenure" class="text-sm font-semibold text-ink">
                Investment Duration
              </label>
              <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                <input
                  type="number"
                  id="sip-tenure"
                  value={tenureYears}
                  onInput={(e) => setTenureYears(Number(e.currentTarget.value) || 1)}
                  min={1}
                  max={40}
                  step={1}
                  class="w-20 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  aria-label="Investment Duration input"
                />
                <span class="text-xs font-mono text-muted ml-1 font-semibold">Yrs</span>
              </div>
            </div>

            <div class="relative pt-1">
              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={tenureYears}
                onInput={(e) => setTenureYears(Number(e.currentTarget.value))}
                style={{
                  background: `linear-gradient(to right, #2563EB 0%, #2563EB ${tenurePct}%, #E2E8F0 ${tenurePct}%, #E2E8F0 100%)`,
                }}
                class="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Investment Duration slider"
              />
              <div class="flex justify-between text-[11px] font-mono text-muted mt-1 font-medium">
                <span>1 Yr</span>
                <span>40 Yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Reusable Result Dashboard */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            heroTitle="Expected Future Wealth Corpus"
            heroValue={results.maturityValue}
            heroBadge="Compounded Corpus"
            heroSubtext={`Maturity value after ${tenureYears} years of ₹${formatCurrency(monthlyInvestment, 'INR')}/mo at ${expectedReturnRate}% p.a.`}
            metrics={[
              { label: 'Invested Capital', value: results.totalInvested, labelColor: 'text-muted', valueColor: 'text-ink' },
              { label: 'Estimated Returns', value: results.estReturns, labelColor: 'text-semantic-success', valueColor: 'text-semantic-success' },
              { label: 'Total Value', value: results.maturityValue, labelColor: 'text-primary', valueColor: 'text-primary' },
            ]}
          />

          <ResultDonutChart
            primaryValue={results.totalInvested}
            primaryLabel="Invested Capital"
            primaryColor="#2563EB"
            secondaryValue={results.estReturns}
            secondaryLabel="Estimated Returns"
            secondaryColor="#10B981"
            totalValue={results.maturityValue}
            centerLabel="Returns"
          />

          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            aria-expanded={showSchedule}
            aria-controls="sip-schedule-container"
            class="w-full py-3.5 px-6 bg-surface-strong hover:bg-hairline text-ink font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 border border-hairline shadow-soft"
          >
            <svg class={`w-4 h-4 text-primary transition-transform ${showSchedule ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
            <span>{showSchedule ? 'Hide Compounding Schedule' : 'View Year-by-Year Compounding Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Year-by-Year Growth Table */}
      {showSchedule && (
        <div id="sip-schedule-container" class="bg-canvas border border-hairline rounded-2xl p-6 overflow-hidden space-y-4">
          <h4 class="text-lg font-semibold text-ink">Year-by-Year Wealth Accumulation</h4>
          <div class="overflow-x-auto max-h-80 overflow-y-auto">
            <table class="w-full text-left border-collapse text-xs font-mono">
              <thead class="sticky top-0 bg-surface-soft text-ink font-semibold">
                <tr>
                  <th class="p-3 border-b border-hairline">Year</th>
                  <th class="p-3 border-b border-hairline">Invested Capital</th>
                  <th class="p-3 border-b border-hairline">Est. Returns</th>
                  <th class="p-3 border-b border-hairline">Total Wealth</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyBreakdown.map((row) => (
                  <tr key={row.year} class="border-b border-hairline-soft hover:bg-surface-soft/50 transition-colors">
                    <td class="p-3 font-semibold text-ink">Year {row.year}</td>
                    <td class="p-3">{formatCurrency(row.invested, 'INR')}</td>
                    <td class="p-3 text-semantic-success font-semibold">{formatCurrency(row.returns, 'INR')}</td>
                    <td class="p-3 font-bold text-primary">{formatCurrency(row.totalValue, 'INR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Wealth Acceleration Coach Card */}
      <RecommendationCard
        tagLine="Power of Compounding Coach"
        badgeText="+5 Years Horizon"
        title="Stay Invested Longer for Exponential Growth"
        description={`Staying invested for just 5 additional years (${tenureYears + 5} years total) accelerates your wealth by:`}
        metrics={[
          { label: 'Additional Wealth', value: extraFiveYearsCorpus, labelColor: 'text-emerald-300' },
          { label: 'Corpus Increase', value: `+${extraFiveYearsPct}%`, labelColor: 'text-blue-300' },
        ]}
      />

      {/* 4. Dynamic Investment Intelligence Cards */}
      <InsightCard
        title="Dynamic Investment Intelligence"
        insights={[
          {
            label: 'Returns Multiplier',
            value: `${returnsMultiplier}×`,
            labelColor: 'text-semantic-success',
            valueColor: 'text-semantic-success',
            desc: `Your wealth returns equal ₹${returnsMultiplier} for every ₹1.00 of principal invested.`,
          },
          {
            label: 'Step-Up Gain (+₹500/mo)',
            value: formatCurrency(stepUpCorpusGain, 'INR'),
            labelColor: 'text-primary',
            valueColor: 'text-primary',
            desc: `Increasing your SIP by just ₹500/month adds ₹${formatCurrency(stepUpCorpusGain, 'INR')} to your final wealth.`,
          },
          {
            label: 'Total Growth Multiplier',
            value: `${growthMultiplier}×`,
            labelColor: 'text-accent-sky',
            desc: `Your total maturity corpus will be ${growthMultiplier} times your total out-of-pocket investment.`,
          },
        ]}
      />
    </div>
  );
}
