import { useState, useMemo } from 'preact/hooks';
import { calculateHealthInsuranceNeeds } from '../../../calculators/insurance/health-insurance-calculator';
import { HEALTH_INSURANCE_CONFIG } from '../../../calculators/configs/health-insurance-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function HealthInsuranceFlagshipWidget() {
  const [cityTier, setCityTier] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.cityTier);
  const [hasSpouse, setHasSpouse] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.hasSpouse);
  const [numChildren, setNumChildren] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.numChildren);
  const [hasParents, setHasParents] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.hasParents);
  const [hasSeniorParents, setHasSeniorParents] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.hasSeniorParents);
  const [isSelfSenior] = useState(false);

  const [existingEmployerCover, setExistingEmployerCover] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.existingEmployerCover);
  const [medicalInflationPercent, setMedicalInflationPercent] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.medicalInflationPercent);
  const [planningHorizonYears, setPlanningHorizonYears] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.planningHorizonYears);

  const [taxRegime, setTaxRegime] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.taxRegime);
  const [marginalTaxRatePercent, setMarginalTaxRatePercent] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.marginalTaxRatePercent);

  const [actualRoomRent, setActualRoomRent] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.actualRoomRent);
  const [roomRentCap, setRoomRentCap] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.roomRentCap);
  const [totalHospitalBill] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.totalHospitalBill);
  const [copayPercent, setCopayPercent] = useState(HEALTH_INSURANCE_CONFIG.defaultInputs.copayPercent);

  // Compute Engine Results
  const results = useMemo(() => {
    return calculateHealthInsuranceNeeds({
      cityTier,
      hasSpouse,
      numChildren,
      hasParents,
      hasSeniorParents,
      isSelfSenior,
      existingEmployerCover,
      medicalInflationPercent,
      planningHorizonYears,
      taxRegime,
      marginalTaxRatePercent,
      actualRoomRent,
      roomRentCap,
      totalHospitalBill,
      copayPercent,
    });
  }, [
    cityTier,
    hasSpouse,
    numChildren,
    hasParents,
    hasSeniorParents,
    isSelfSenior,
    existingEmployerCover,
    medicalInflationPercent,
    planningHorizonYears,
    taxRegime,
    marginalTaxRatePercent,
    actualRoomRent,
    roomRentCap,
    totalHospitalBill,
    copayPercent,
  ]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = HEALTH_INSURANCE_CONFIG.scenarios[presetKey];
    if (p) {
      setCityTier(p.cityTier);
      setHasSpouse(p.hasSpouse);
      setNumChildren(p.numChildren);
      setHasParents(p.hasParents);
      setHasSeniorParents(p.hasSeniorParents);
      setExistingEmployerCover(p.existingEmployerCover);
      setMedicalInflationPercent(p.medicalInflationPercent);
      setPlanningHorizonYears(p.planningHorizonYears);
      setTaxRegime(p.taxRegime);
      setMarginalTaxRatePercent(p.marginalTaxRatePercent);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-rose-950 to-pink-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-rose-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-full border border-rose-500/30">
              🏥 Health Coverage & Risk Protection Model
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Health Insurance Premium & Coverage Needs Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Determine recommended health insurance sum insured based on family composition, medical inflation (12%), employer cover gap, and Section 80D tax deductions.
            </p>
          </div>

          <div class="bg-rose-900/50 border border-rose-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-rose-300 font-bold block">
              Recommended Health Cover
            </span>
            <span class="text-3xl sm:text-4xl font-black text-rose-400 mt-1 block font-mono">
              {results.isValid ? fmt(results.coverage.recommendedSumInsured) : '—'}
            </span>
            {results.isValid && (
              <span class="inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Additional Gap: {fmt(results.gap.additionalGap)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Educational & Premium Disclosure Notice */}
      <div class="p-4 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs text-rose-900 dark:text-rose-200 space-y-1">
        <span class="font-bold flex items-center gap-1.5">
          ℹ️ Educational Healthcare Planning Notice:
        </span>
        <p class="leading-relaxed">
          {HEALTH_INSURANCE_CONFIG.disclaimers.educationalNotice} Premium estimates are illustrative benchmarks, not insurer quotes.
        </p>
      </div>

      {/* 2. Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Family Profile Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(HEALTH_INSURANCE_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-rose-500 hover:bg-rose-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-rose-600 block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Form & Analysis Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Section 1: Household & City Profile */}
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md">Step 1</span>
              Household Composition & Location
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-ink block mb-1">City Tier / Healthcare Baseline</label>
                <select
                  value={cityTier}
                  onChange={(e) => setCityTier(e.target.value)}
                  class="w-full p-2.5 bg-surface-soft border border-hairline rounded-xl text-xs font-semibold text-ink focus:ring-2 focus:ring-rose-500"
                >
                  <option value="tier1">Tier-1 Metro (₹10L Base Care Cost)</option>
                  <option value="tier2">Tier-2 City (₹7L Base Care Cost)</option>
                  <option value="tier3">Tier-3 Semi-Urban (₹5L Base Care Cost)</option>
                </select>
              </div>

              <FormInputNumber
                id="numChildren"
                label="Number of Dependent Children"
                value={numChildren}
                onChange={(v) => setNumChildren(v)}
                min={0}
                max={10}
                step={1}
              />
            </div>

            {/* Checkbox Options */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label class="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSpouse}
                  onChange={(e) => setHasSpouse(e.target.checked)}
                  class="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Include Spouse in Floater</span>
              </label>

              <label class="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSeniorParents}
                  onChange={(e) => {
                    setHasSeniorParents(e.target.checked);
                    if (e.target.checked) setHasParents(true);
                  }}
                  class="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Include Senior Citizen Parents (≥60 Yrs)</span>
              </label>
            </div>
          </div>

          {/* Section 2: Healthcare Cost & Employer Protection */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 text-xs rounded-md">Step 2</span>
              Existing Employer Cover & Medical Inflation
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInputNumber
                id="existingEmployerCover"
                label="Employer Group Cover (₹)"
                value={existingEmployerCover}
                onChange={(v) => setExistingEmployerCover(v)}
                min={0}
                max={25000000}
                step={100000}
                prefix="₹"
                helpText="Current corporate policy limit."
              />

              <FormInputNumber
                id="medicalInflationPercent"
                label="Medical Inflation (% p.a.)"
                value={medicalInflationPercent}
                onChange={(v) => setMedicalInflationPercent(v)}
                min={0}
                max={30}
                step={1}
                helpText="Default 12% hospital inflation."
              />

              <FormInputNumber
                id="planningHorizonYears"
                label="Planning Horizon (Years)"
                value={planningHorizonYears}
                onChange={(v) => setPlanningHorizonYears(v)}
                min={0}
                max={20}
                step={1}
                helpText="Inflation forecast period."
              />
            </div>
          </div>

          {/* Section 3: Tax Regime & Section 80D */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-xs rounded-md">Step 3</span>
              Tax Regime & Section 80D Deductions
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-ink block mb-1">Income Tax Regime</label>
                <select
                  value={taxRegime}
                  onChange={(e) => setTaxRegime(e.target.value)}
                  class="w-full p-2.5 bg-surface-soft border border-hairline rounded-xl text-xs font-semibold text-ink focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="old">Old Tax Regime (Section 80D Available)</option>
                  <option value="new">New Tax Regime (Section 80D Not Available)</option>
                </select>
              </div>

              <FormInputNumber
                id="marginalTaxRatePercent"
                label="Marginal Tax Bracket (%)"
                value={marginalTaxRatePercent}
                onChange={(v) => setMarginalTaxRatePercent(v)}
                min={0}
                max={30}
                step={5}
                helpText="Your highest tax slab."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Base + Super Top-Up & KPI Cards (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {/* Base + Super Top-Up Scenario Card */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
              Base Cover vs Super Top-Up Scenario Optimization
            </h3>

            <div class="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/40 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted">Recommended Strategy:</span>
                <span class="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {fmt(results.superTopUp.baseCover)} Base + {fmt(results.superTopUp.superTopUpCover)} Top-Up
                </span>
              </div>
              <div class="flex items-center justify-between text-xs pt-1 border-t border-hairline">
                <span class="text-muted">Combined Premium Est:</span>
                <span class="font-mono font-bold text-ink">{fmt(results.superTopUp.totalCombinedPremium)}/yr</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted">Single Policy Equivalent:</span>
                <span class="font-mono text-muted line-through">{fmt(results.superTopUp.estSingleBasePremium)}/yr</span>
              </div>
              <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                💡 Illustrative Premium Savings: ~{fmt(results.superTopUp.illustrativeSavings)}/yr by combining Super Top-Up with ₹5L deductible.
              </p>
            </div>

            {/* KPI Summary Grid */}
            <div class="grid grid-cols-2 gap-3 pt-2">
              <div class="p-3 bg-surface-soft rounded-xl border border-hairline space-y-1">
                <span class="text-[10px] text-muted font-bold uppercase">Employer Cover Gap</span>
                <span class="text-lg font-mono font-black text-rose-600 block">{fmt(results.gap.additionalGap)}</span>
              </div>

              <div class="p-3 bg-surface-soft rounded-xl border border-hairline space-y-1">
                <span class="text-[10px] text-muted font-bold uppercase">Sec 80D Tax Savings</span>
                <span class="text-lg font-mono font-black text-emerald-600 block">{fmt(results.tax.estimatedTaxSavings)}</span>
              </div>
            </div>

            {/* Indicative Premium Range Card */}
            <div class="p-4 bg-surface-soft border border-hairline rounded-xl space-y-1">
              <span class="text-[11px] font-bold text-muted uppercase block">Indicative Retail Premium Range</span>
              <p class="text-base font-mono font-bold text-ink">
                {fmt(results.indicativePremiumRange.low)} – {fmt(results.indicativePremiumRange.high)} / year
              </p>
              <p class="text-[10px] text-muted">
                *Illustrative scenario estimate based on ₹1.2k-1.8k per ₹1L sum insured.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Room-Rent Sub-Limit & Co-Pay Risk Visualizer */}
      <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
        <h3 class="text-sm font-bold text-ink">
          Policy Sub-Limit Risk Exposure Demonstrator
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Rent Proportionate Risk */}
          <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-3">
            <h4 class="text-xs font-bold text-rose-600 uppercase">Room-Rent Sub-Limit Risk</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <FormInputNumber
                id="actualRoomRent"
                label="Actual Room Rent/Day (₹)"
                value={actualRoomRent}
                onChange={(v) => setActualRoomRent(v)}
                step={1000}
              />
              <FormInputNumber
                id="roomRentCap"
                label="Policy Rent Cap/Day (₹)"
                value={roomRentCap}
                onChange={(v) => setRoomRentCap(v)}
                step={1000}
              />
            </div>
            {results.roomRentRisk.hasProportionateDeduction ? (
              <div class="p-2.5 bg-rose-100 dark:bg-rose-950/40 border border-rose-300 rounded-lg text-xs text-rose-900 dark:text-rose-200">
                ⚠️ Room rent cap exceeded! Insurer pays only {Math.round(results.roomRentRisk.payableRatio * 100)}% of total bill due to proportionate deduction. Out-of-pocket loss: {fmt(results.roomRentRisk.estimatedUncoveredOutofPocket)}.
              </div>
            ) : (
              <div class="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 rounded-lg text-xs text-emerald-900 dark:text-emerald-200">
                ✓ Room rent is within policy cap limit. No proportionate deduction penalty applied.
              </div>
            )}
          </div>

          {/* Co-Payment Impact */}
          <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-3">
            <h4 class="text-xs font-bold text-indigo-600 uppercase">Co-Payment Out-of-Pocket Share</h4>
            <FormInputNumber
              id="copayPercent"
              label="Policy Co-Pay Clause (%)"
              value={copayPercent}
              onChange={(v) => setCopayPercent(v)}
              min={0}
              max={50}
              step={5}
            />
            <div class="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 rounded-lg text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <p>On a ₹1,00,000 claim with {copayPercent}% co-pay:</p>
              <p class="font-mono font-bold">Policyholder Share: {fmt(results.copay.policyholderShare)} | Insurer Pays: {fmt(results.copay.insurerShare)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Share Actions & Financial Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Health Insurance Premium & Coverage Needs Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational health coverage scenario model. Results do not constitute guaranteed required coverage, insurer quotes, or underwriting approval.
        </p>
      </div>
    </div>
  );
}
