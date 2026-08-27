import { useState, useMemo } from 'preact/hooks';
import { calculateStampDutyCalculator, STATE_STAMP_SCHEDULES } from '../../../calculators/real-estate/stamp-duty-calculator.js';
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

const DEFAULT_STAMP_STATE = {
  propertyValue: 5000000,
  circleRateValue: 0,
  state: 'maharashtra',
  gender: 'male',
  location: 'urban',
  customStampRate: 5,
  customRegRate: 1,
  advocateLegalFees: 25000,
};

const STAMP_PARAM_MAP = {
  propertyValue: 'val',
  circleRateValue: 'circle',
  state: 'state',
  gender: 'gen',
  location: 'loc',
  customStampRate: 'cs',
  customRegRate: 'cr',
  advocateLegalFees: 'legal',
};

export default function StampDutyFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_STAMP_STATE, STAMP_PARAM_MAP);
  const {
    propertyValue,
    circleRateValue,
    state,
    gender,
    location,
    customStampRate,
    customRegRate,
    advocateLegalFees,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Scenario Presets
  const presets = [
    { id: 'mumbai', label: 'Mumbai 1 Cr', icon: '🏙️', propertyValue: 10000000, circleRateValue: 9000000, state: 'maharashtra', gender: 'male', location: 'urban', advocateLegalFees: 35000, desc: 'MH 5% + 1% Cess' },
    { id: 'delhi_fem', label: 'Delhi Female', icon: '👩', propertyValue: 7500000, circleRateValue: 7000000, state: 'delhi', gender: 'female', location: 'urban', advocateLegalFees: 25000, desc: '4% Female Rate' },
    { id: 'bangalore', label: 'Bangalore 1.5 Cr', icon: '🏡', propertyValue: 15000000, circleRateValue: 12000000, state: 'karnataka', gender: 'male', location: 'urban', advocateLegalFees: 50000, desc: 'KA 5.6% + 1% Reg' },
    { id: 'chennai', label: 'Chennai 60L', icon: '🏢', propertyValue: 6000000, circleRateValue: 5500000, state: 'tamil_nadu', gender: 'male', location: 'urban', advocateLegalFees: 20000, desc: 'TN 7% + 2% Reg' },
    { id: 'noida_joint', label: 'Noida Joint', icon: '🤝', propertyValue: 9000000, circleRateValue: 8000000, state: 'uttar_pradesh', gender: 'joint', location: 'urban', advocateLegalFees: 30000, desc: 'UP 6.5% Joint' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('propertyValue', p.propertyValue);
    setParam('circleRateValue', p.circleRateValue);
    setParam('state', p.state);
    setParam('gender', p.gender);
    setParam('location', p.location);
    setParam('advocateLegalFees', p.advocateLegalFees);
  };

  // Perform calculation
  const results = useMemo(() => {
    return calculateStampDutyCalculator({
      propertyValue,
      circleRateValue,
      state,
      gender,
      location,
      customStampRate,
      customRegRate,
      advocateLegalFees,
    });
  }, [propertyValue, circleRateValue, state, gender, location, customStampRate, customRegRate, advocateLegalFees]);

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

  const fmt = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

  // Breakdown items
  const costItems = [
    { label: 'Property Agreement Price', amount: results.propertyValue, colorClass: 'bg-primary', desc: 'Base purchase consideration paid to seller.' },
    { label: `Stamp Duty (${results.effectiveStampRate}%)`, amount: results.totalStampDuty, colorClass: 'bg-rose-500', desc: `State revenue tax (${results.baseStampRate}% base + ${results.metroCessRate}% cess).` },
    { label: `Registration Fee (${results.regRate}%)`, amount: results.registrationCharges, colorClass: 'bg-amber-500', desc: 'Official government deed registration charges.' },
    { label: 'Legal & Advocate Charges', amount: results.legalFees, colorClass: 'bg-slate-500', desc: 'Title search, advocate verification & documentation.' },
  ];

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Regional Property Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-rose-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🏛️ STATUTORY PROPERTY REGISTRATION VERDICT
          </span>
          <span class="text-xs font-mono font-bold text-ink bg-surface-strong px-2.5 py-1 rounded-xl border border-hairline uppercase">
            {results.stateName} · {gender.toUpperCase()} · {location.toUpperCase()}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          All-inclusive total property acquisition cost is <strong>{fmt(results.totalPropertyCost)}</strong> ({results.overheadPercentage}% total overhead).
        </p>

        {/* State Slabs Selector */}
        <div class="pt-3 border-t border-hairline/60 flex items-center gap-2 flex-wrap">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-muted mr-1">Quick State:</span>
          {Object.entries(STATE_STAMP_SCHEDULES).map(([k, s]) => (
            <button
              key={k}
              type="button"
              onClick={() => setParam('state', k)}
              class={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                state === k
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-canvas hover:bg-surface-soft border border-hairline text-ink'
              }`}
            >
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Property & Location Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="property-value"
            label="Property Agreement / Purchase Value (₹)"
            value={propertyValue}
            min={500000}
            max={500000000}
            step={100000}
            prefix="₹"
            minLabel="₹5 Lakhs"
            maxLabel="₹50 Crores"
            onChange={(v) => setParam('propertyValue', v)}
          />

          <FormInputNumber
            id="circle-rate-value"
            label="Circle Rate / Ready Reckoner Valuation (Optional ₹)"
            value={circleRateValue}
            min={0}
            max={500000000}
            step={100000}
            prefix="₹"
            minLabel="₹0"
            maxLabel="₹50 Crores"
            onChange={(v) => setParam('circleRateValue', v)}
          />

          <FormSelect
            id="state-select"
            label="State / Property Location"
            value={state}
            options={[
              { value: 'maharashtra', label: 'Maharashtra (Mumbai, Pune, Nagpur) - 5% + 1% Cess' },
              { value: 'delhi', label: 'Delhi NCR - 6% Male / 4% Female + 1% Reg' },
              { value: 'karnataka', label: 'Karnataka (Bangalore) - 5.6% Urban + 1% Reg' },
              { value: 'tamil_nadu', label: 'Tamil Nadu (Chennai) - 7% Stamp + 2% Reg' },
              { value: 'uttar_pradesh', label: 'Uttar Pradesh (Noida, Lucknow) - 7% Male / 6% Female' },
              { value: 'west_bengal', label: 'West Bengal (Kolkata) - 6% Urban + 1% Reg' },
              { value: 'telangana', label: 'Telangana (Hyderabad) - 5.5% + 1.5% Transfer Duty' },
              { value: 'custom', label: 'Custom State Rate' },
            ]}
            onChange={(v) => setParam('state', v)}
          />

          <div class="grid sm:grid-cols-2 gap-4">
            <FormSelect
              id="gender-select"
              label="Buyer Ownership"
              value={gender}
              options={[
                { value: 'male', label: 'Male Sole Owner' },
                { value: 'female', label: 'Female Sole Owner (Rebate)' },
                { value: 'joint', label: 'Joint Ownership (Male + Female)' },
              ]}
              onChange={(v) => setParam('gender', v)}
            />

            <FormSelect
              id="location-select"
              label="Area Type"
              value={location}
              options={[
                { value: 'urban', label: 'Urban (Municipal Corp)' },
                { value: 'rural', label: 'Rural / Gram Panchayat' },
              ]}
              onChange={(v) => setParam('location', v)}
            />
          </div>

          {state === 'custom' && (
            <div class="grid sm:grid-cols-2 gap-4 p-4 bg-surface-strong rounded-2xl border border-hairline">
              <FormInputNumber
                id="custom-stamp-rate"
                label="Custom Stamp Duty %"
                value={customStampRate}
                min={0}
                max={15}
                step={0.1}
                suffix="%"
                onChange={(v) => setParam('customStampRate', v)}
              />
              <FormInputNumber
                id="custom-reg-rate"
                label="Custom Registration %"
                value={customRegRate}
                min={0}
                max={5}
                step={0.1}
                suffix="%"
                onChange={(v) => setParam('customRegRate', v)}
              />
            </div>
          )}

          <FormInputNumber
            id="legal-fees"
            label="Advocate, Notary & Documentation Fees (₹)"
            value={advocateLegalFees}
            min={0}
            max={500000}
            step={5000}
            prefix="₹"
            minLabel="₹0"
            maxLabel="₹5 Lakhs"
            onChange={(v) => setParam('advocateLegalFees', v)}
          />
        </div>

        {/* Right Panel: KPI Dashboard & Charts */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Total Government Stamp Duty & Registration"
            primaryValue={fmt(results.totalGovernmentCharges)}
            secondaryItems={[
              { label: 'Stamp Duty Payable', value: fmt(results.totalStampDuty) },
              { label: 'Registration Charges', value: fmt(results.registrationCharges) },
              { label: 'All-In Total Outflow', value: fmt(results.totalPropertyCost) },
              { label: 'Effective Overhead %', value: `${results.overheadPercentage}%` },
            ]}
          />

          <ResultDonutChart
            title="Total Property Cost Composition"
            centerValue={fmt(results.totalPropertyCost)}
            centerSubtext="Total Cost"
            segments={[
              { label: 'Property Price', amount: results.propertyValue, colorClass: 'bg-primary' },
              { label: 'Stamp Duty', amount: results.totalStampDuty, colorClass: 'bg-rose-500' },
              { label: 'Registration Fee', amount: results.registrationCharges, colorClass: 'bg-amber-500' },
              { label: 'Legal Fees', amount: results.legalFees, colorClass: 'bg-slate-500' },
            ]}
          />
        </div>
      </div>

      {/* 4. ITEMISED STATUTORY OUTFLOW VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-strong border-2 border-hairline font-mono space-y-4 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-bold text-primary uppercase">🏛️ ITEMISED GOVERNMENT OUTFLOW SCHEDULE</span>
          <span class="text-xs text-muted">Statutory Assessment: {fmt(results.taxableValue)}</span>
        </div>
        <div class="space-y-2 text-xs text-ink">
          <div class="flex justify-between py-1 border-b border-hairline/60">
            <span>Base Stamp Duty ({results.baseStampRate}%):</span>
            <span class="font-bold">{fmt(results.baseStampDuty)}</span>
          </div>
          {results.metroCessRate > 0 && (
            <div class="flex justify-between py-1 border-b border-hairline/60">
              <span>Local / Metro Transport Cess ({results.metroCessRate}%):</span>
              <span class="font-bold text-rose-600">{fmt(results.metroCessAmount)}</span>
            </div>
          )}
          <div class="flex justify-between py-1 border-b border-hairline/60">
            <span>Total Stamp Duty Outflow:</span>
            <span class="font-bold text-rose-600">{fmt(results.totalStampDuty)}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-hairline/60">
            <span>Registration Charges:</span>
            <span class="font-bold text-amber-600">{fmt(results.registrationCharges)}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-hairline/60">
            <span>Legal, Title Search & Documentation:</span>
            <span class="font-bold text-slate-600">{fmt(results.legalFees)}</span>
          </div>
          <div class="flex justify-between py-2 text-sm font-bold text-primary">
            <span>Total Property Purchase Cost (All-Inclusive):</span>
            <span>{fmt(results.totalPropertyCost)}</span>
          </div>
        </div>
      </div>

      {/* 5. MULTI-STATE COMPARISON MATRIX */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold font-heading text-ink">Multi-State Stamp Duty Comparison</h4>
          <span class="text-xs text-muted">Consideration: {fmt(results.taxableValue)}</span>
        </div>
        <div class="grid sm:grid-cols-3 md:grid-cols-4 gap-3">
          {results.scenarios.slice(0, 4).map((sc) => (
            <div
              key={sc.stateKey}
              class={`p-4 rounded-2xl border text-center space-y-1 ${
                state === sc.stateKey
                  ? 'bg-primary/10 border-2 border-primary/40'
                  : 'bg-surface-strong border-hairline'
              }`}
            >
              <span class="text-xs text-muted font-bold block uppercase">{sc.stateName.split(' ')[0]}</span>
              <span class="text-base font-bold text-ink">{fmt(sc.totalGovCharges)}</span>
              <span class="text-[11px] text-muted block font-mono">{sc.stampRate}% Stamp</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. COST BREAKDOWN */}
      <CostBreakdownCard
        title="Acquisition Overhead Composition"
        subtitle={`Total Outflow: ${fmt(results.totalPropertyCost)}`}
        items={costItems}
      />

      {/* 7. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 8. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Section 80C Tax Deduction"
          value={fmt(results.taxSavingsAt30Pct)}
          subtitle={`Save up to ₹${results.eligible80CDeduction.toLocaleString('en-IN')} deduction under Section 80C (Old Regime).`}
          badgeText="Income Tax Benefit"
          badgeColorClass="bg-semantic-success"
        />
        <InsightCard
          title="Acquisition Overhead Share"
          value={`${results.overheadPercentage}%`}
          subtitle="Government duties and legal fees on top of purchase price."
          badgeText="Overhead Ratio"
          badgeColorClass="bg-rose-500"
        />
      </div>

      {/* 9. DECISION SUMMARY CARD */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 STAMP DUTY DECISION SUMMARY</span>
          <span class="text-xs text-muted font-mono">{results.stateName}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Property Value</span>
            <span class="text-base font-bold text-ink">{fmt(results.propertyValue)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Stamp Duty</span>
            <span class="text-base font-bold text-rose-600">{fmt(results.totalStampDuty)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Registration</span>
            <span class="text-base font-bold text-amber-600">{fmt(results.registrationCharges)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">All-In Cost</span>
            <span class="text-base font-bold text-primary">{fmt(results.totalPropertyCost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
