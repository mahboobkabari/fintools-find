import { useState, useMemo } from 'preact/hooks';
import { calculateSipTool } from '../../../calculators/investment/sip.js';
import { calculateSip } from '../../../calculators/core/investmentEngine.js';
import { formatCurrency } from '@utils/formatters.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Modular UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_SIP_STATE = {
  monthlyInvestment: 5000,
  expectedReturnRate: 12,
  tenureYears: 10,
};

const SIP_PARAM_MAP = {
  monthlyInvestment: 'monthly',
  expectedReturnRate: 'rate',
  tenureYears: 'tenure',
};

export default function SipFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_SIP_STATE, SIP_PARAM_MAP);
  const { monthlyInvestment, expectedReturnRate, tenureYears } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Presets Configuration
  const presets = [
    { id: 'starter', label: 'Wealth Starter', icon: '🌱', monthlyInvestment: 5000, expectedReturnRate: 12, tenureYears: 10, desc: '₹5K/mo @ 12% for 10 Yrs' },
    { id: 'builder', label: 'Wealth Builder', icon: '🚀', monthlyInvestment: 10000, expectedReturnRate: 12, tenureYears: 15, desc: '₹10K/mo @ 12% for 15 Yrs' },
    { id: 'retire', label: 'Retirement Corpus', icon: '🎯', monthlyInvestment: 25000, expectedReturnRate: 12, tenureYears: 20, desc: '₹25K/mo @ 12% for 20 Yrs' },
    { id: 'edu', label: 'Child Education', icon: '🎓', monthlyInvestment: 15000, expectedReturnRate: 12, tenureYears: 12, desc: '₹15K/mo @ 12% for 12 Yrs' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('monthlyInvestment', p.monthlyInvestment);
    setParam('expectedReturnRate', p.expectedReturnRate);
    setParam('tenureYears', p.tenureYears);
  };

  // 1. Core SIP Results
  const results = useMemo(() => {
    return calculateSipTool({
      monthlyInvestment,
      expectedReturnRate,
      tenureYears,
    });
  }, [monthlyInvestment, expectedReturnRate, tenureYears]);

  // 2. Accelerated Results (+5 Extra Years)
  const longerTenureResults = useMemo(() => {
    return calculateSip({
      monthlyInvestment,
      expectedReturnRate,
      tenureYears: tenureYears + 5,
    });
  }, [monthlyInvestment, expectedReturnRate, tenureYears]);

  // 3. Step-Up Sensitivity (+₹500 / Month)
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

  return (
    <div class="space-y-10">
      {/* 1. Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Quick SIP Presets" />

      {/* 2. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-7 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">SIP Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="sip-monthly"
            label="Monthly Investment (₹)"
            value={monthlyInvestment}
            min={500}
            max={500000}
            step={500}
            prefix="₹"
            minLabel="₹500"
            maxLabel="₹5 Lakhs"
            onChange={(val) => setParam('monthlyInvestment', val)}
          />

          <FormInputNumber
            id="sip-rate"
            label="Expected Annual Return (p.a.)"
            value={expectedReturnRate}
            min={1}
            max={30}
            step={0.5}
            suffix="%"
            minLabel="1%"
            maxLabel="30%"
            inputWidthClass="w-20"
            onChange={(val) => setParam('expectedReturnRate', val)}
          />

          <FormInputNumber
            id="sip-tenure"
            label="Investment Duration"
            value={tenureYears}
            min={1}
            max={40}
            step={1}
            suffix="Yrs"
            minLabel="1 Yr"
            maxLabel="40 Yrs"
            inputWidthClass="w-20"
            onChange={(val) => setParam('tenureYears', val)}
          />
        </div>

        {/* Right Panel: Result Dashboard */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            heroTitle="Expected Future Wealth Corpus"
            heroValue={results.maturityValue}
            heroBadge="Compounded Corpus"
            heroSubtext={`Maturity value after ${tenureYears} years of ₹${formatCurrency(monthlyInvestment, 'INR')}/mo at ${expectedReturnRate}% p.a.`}
            metrics={[
              { label: 'Invested Capital', value: results.totalInvested, labelColor: 'text-muted', valueColor: 'text-ink' },
              { label: 'Estimated Returns', value: results.estReturns, labelColor: 'text-semantic-success', valueColor: 'text-semantic-success', trend: 'up' },
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

      {/* Year-by-Year Schedule */}
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

      {/* Wealth Coach */}
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

      {/* Financial Intelligence */}
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
