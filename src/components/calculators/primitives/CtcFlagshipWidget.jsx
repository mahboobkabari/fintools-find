import { useState, useMemo } from 'preact/hooks';
import { calculateCtcTakeHome } from '../../../calculators/salary/ctc-calculator';
import { CTC_CONFIG } from '../../../calculators/configs/ctc-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function CtcFlagshipWidget() {
  const [annualCtc, setAnnualCtc] = useState(CTC_CONFIG.defaultInputs.annualCtc);
  const [basicSalaryPercent, setBasicSalaryPercent] = useState(CTC_CONFIG.defaultInputs.basicSalaryPercent);
  const [isMetro, setIsMetro] = useState(CTC_CONFIG.defaultInputs.isMetro);
  const [rentPaidMonthly, setRentPaidMonthly] = useState(CTC_CONFIG.defaultInputs.rentPaidMonthly);
  const [performanceBonusAnnual, setPerformanceBonusAnnual] = useState(CTC_CONFIG.defaultInputs.performanceBonusAnnual);
  const [taxRegime, setTaxRegime] = useState(CTC_CONFIG.defaultInputs.taxRegime);

  const [employerEpfIncluded, setEmployerEpfIncluded] = useState(CTC_CONFIG.defaultInputs.employerEpfIncluded);
  const [includeGratuity, setIncludeGratuity] = useState(CTC_CONFIG.defaultInputs.includeGratuity);
  const [employerNps, setEmployerNps] = useState(CTC_CONFIG.defaultInputs.employerNps);
  const [otherDeductionsOld, setOtherDeductionsOld] = useState(CTC_CONFIG.defaultInputs.otherDeductionsOld);

  // Compute Engine Results
  const results = useMemo(() => {
    return calculateCtcTakeHome({
      annualCtc,
      basicSalaryPercent,
      isMetro,
      rentPaidMonthly,
      performanceBonusAnnual,
      employerEpfIncluded,
      includeGratuity,
      employerNps,
      otherDeductionsOld,
      taxRegime,
    });
  }, [
    annualCtc,
    basicSalaryPercent,
    isMetro,
    rentPaidMonthly,
    performanceBonusAnnual,
    employerEpfIncluded,
    includeGratuity,
    employerNps,
    otherDeductionsOld,
    taxRegime,
  ]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = CTC_CONFIG.scenarios[presetKey];
    if (p) {
      setAnnualCtc(p.annualCtc);
      setBasicSalaryPercent(p.basicSalaryPercent);
      setIsMetro(p.isMetro);
      setRentPaidMonthly(p.rentPaidMonthly);
      setPerformanceBonusAnnual(p.performanceBonusAnnual);
      setEmployerEpfIncluded(p.employerEpfIncluded);
      setIncludeGratuity(p.includeGratuity);
      setTaxRegime(p.taxRegime);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-emerald-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              💼 CTC Breakdown & Take-Home Engine
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              CTC to Take-Home Salary Breakdown Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Decompose your annual Cost to Company (CTC) into Basic Salary, HRA, employer retainers, employee statutory deductions, and estimated net monthly in-hand take-home salary.
            </p>
          </div>

          <div class="bg-emerald-900/50 border border-emerald-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
              Estimated Monthly In-Hand
            </span>
            <span class="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 block font-mono">
              {results.isValid ? `${fmt(results.netMonthlyTakeHome)}/mo` : '—'}
            </span>
            {results.isValid && (
              <span class="inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Annual Take-Home: {fmt(results.netAnnualTakeHome)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Educational & Payroll Notice */}
      <div class="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
        <span class="font-bold flex items-center gap-1.5">
          ℹ️ Payroll Estimation Disclosure:
        </span>
        <p class="leading-relaxed">
          {CTC_CONFIG.disclaimers.educationalNotice} {CTC_CONFIG.disclaimers.regimeNotice}
        </p>
      </div>

      {/* 2. Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Sample Salary Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(CTC_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-emerald-600 block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Form & Analysis Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Step 1: Annual CTC & Salary Structure */}
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md">Step 1</span>
              CTC & Salary Structure
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="annualCtc"
                label="Annual CTC Package (₹)"
                value={annualCtc}
                onChange={(v) => setAnnualCtc(v)}
                min={100000}
                max={100000000}
                step={50000}
                prefix="₹"
                helpText="Total annual Cost to Company offer."
              />

              <FormInputNumber
                id="basicSalaryPercent"
                label="Basic Salary (% of CTC)"
                value={basicSalaryPercent}
                onChange={(v) => setBasicSalaryPercent(v)}
                min={40}
                max={60}
                step={5}
                helpText="Default 50% of annual CTC."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <FormInputNumber
                id="performanceBonusAnnual"
                label="Annual Variable / Bonus (₹)"
                value={performanceBonusAnnual}
                onChange={(v) => setPerformanceBonusAnnual(v)}
                min={0}
                max={10000000}
                step={10000}
                prefix="₹"
                helpText="Annual bonus included in CTC."
              />

              <div>
                <label class="text-xs font-bold text-ink block mb-1">City HRA Classification</label>
                <select
                  value={isMetro ? 'metro' : 'nonMetro'}
                  onChange={(e) => setIsMetro(e.target.value === 'metro')}
                  class="w-full p-2.5 bg-surface-soft border border-hairline rounded-xl text-xs font-semibold text-ink focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="metro">Metro City (Delhi, Mumbai, Kolkata, Chennai - 50% HRA)</option>
                  <option value="nonMetro">Non-Metro City (40% HRA)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Rent Paid & Deductions */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-xs rounded-md">Step 2</span>
              Rent Paid & Old Regime Deductions
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="rentPaidMonthly"
                label="Monthly Rent Paid (₹)"
                value={rentPaidMonthly}
                onChange={(v) => setRentPaidMonthly(v)}
                min={0}
                max={500000}
                step={1000}
                prefix="₹"
                helpText="For Old Regime HRA exemption solver."
              />

              <FormInputNumber
                id="otherDeductionsOld"
                label="Old Regime Tax Deductions (80C, 80D ₹)"
                value={otherDeductionsOld}
                onChange={(v) => setOtherDeductionsOld(v)}
                min={0}
                max={1500000}
                step={10000}
                prefix="₹"
                helpText="Section 80C, 80D, 24b total."
              />
            </div>

            <div class="pt-2">
              <FormInputNumber
                id="employerNps"
                label="Annual Employer NPS Contribution (₹)"
                value={employerNps}
                onChange={(v) => setEmployerNps(v)}
                min={0}
                max={1000000}
                step={5000}
                prefix="₹"
                helpText="Employer contribution to National Pension System under Sec 80CCD(2)."
              />
            </div>

            {/* Checkbox Options */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label class="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={employerEpfIncluded}
                  onChange={(e) => setEmployerEpfIncluded(e.target.checked)}
                  class="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include Employer EPF (12%) in CTC</span>
              </label>

              <label class="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGratuity}
                  onChange={(e) => setIncludeGratuity(e.target.checked)}
                  class="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include Employer Gratuity (~4.81%) in CTC</span>
              </label>
            </div>
          </div>

          {/* Step 3: Tax Regime Selection */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 text-xs rounded-md">Step 3</span>
              Tax Regime Selection
            </h3>

            <div>
              <label class="text-xs font-bold text-ink block mb-1">Income Tax Regime</label>
              <select
                value={taxRegime}
                onChange={(e) => setTaxRegime(e.target.value)}
                class="w-full p-2.5 bg-surface-soft border border-hairline rounded-xl text-xs font-semibold text-ink focus:ring-2 focus:ring-emerald-500"
              >
                <option value="new">New Tax Regime (Section 115BAC - Lower Slabs, No HRA)</option>
                <option value="old">Old Tax Regime (Section 10 HRA & 80C Deductions)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: KPI Cards & Visual Breakdown (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {/* KPI Summary Cards */}
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Gross Monthly Cash</span>
              <span class="text-lg font-mono font-black text-ink block">{fmt(results.decomposition.grossMonthlySalary)}</span>
              <span class="text-[10px] text-muted block">Annual: {fmt(results.decomposition.grossAnnualSalary)}</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Employer Retainers</span>
              <span class="text-lg font-mono font-black text-indigo-600 block">{fmt(results.decomposition.totalEmployerRetainers)}</span>
              <span class="text-[10px] text-muted block">EPF + Gratuity in CTC</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Employee Deductions</span>
              <span class="text-lg font-mono font-black text-rose-600 block">{fmt(results.deductions.totalStatutoryDeductions)}</span>
              <span class="text-[10px] text-muted block">EPF ({fmt(results.deductions.employeeEpf)}) + PT</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Effective Tax Rate</span>
              <span class="text-lg font-mono font-black text-emerald-600 block">{results.effectiveTaxRate.toFixed(1)}%</span>
              <span class="text-[10px] text-muted block">Annual Tax: {fmt(results.comparison[results.activeRegime].totalTax)}</span>
            </div>
          </div>

          {/* Salary Components Breakdown Card */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
              Annual Salary Component Breakdown
            </h3>

            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-muted">Basic Salary:</span>
                <span class="font-mono font-bold text-ink">{fmt(results.decomposition.basicSalary)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-muted">House Rent Allowance (HRA):</span>
                <span class="font-mono font-bold text-ink">{fmt(results.decomposition.hraReceived)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-muted">Special Allowance:</span>
                <span class="font-mono font-bold text-ink">{fmt(results.decomposition.specialAllowance)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-hairline">
                <span class="text-muted">Employer EPF (12%):</span>
                <span class="font-mono text-muted">{fmt(results.decomposition.employerEpf)}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-muted">Employer Gratuity:</span>
                <span class="font-mono text-muted">{fmt(results.decomposition.employerGratuity)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Old vs New Tax Regime Side-by-Side Comparison Table */}
      <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-hairline pb-3">
          <h3 class="text-sm font-bold text-ink">
            Old Tax Regime vs New Tax Regime Comparison
          </h3>
          <span class="text-xs font-semibold px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
            {results.comparison.recommendationNotice}
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline bg-surface-soft">
                <th class="p-3 font-bold text-ink">Component / Tax Metric</th>
                <th class="p-3 font-bold text-ink">Old Tax Regime (Sec 10 HRA)</th>
                <th class="p-3 font-bold text-ink">New Tax Regime (Sec 115BAC)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              <tr>
                <td class="p-3 text-muted">Modeled Gross Annual Cash</td>
                <td class="p-3 font-mono font-bold text-ink">{fmt(results.decomposition.grossAnnualSalary)}</td>
                <td class="p-3 font-mono font-bold text-ink">{fmt(results.decomposition.grossAnnualSalary)}</td>
              </tr>
              <tr>
                <td class="p-3 text-muted">HRA Tax Exemption</td>
                <td class="p-3 font-mono font-bold text-emerald-600">{fmt(results.comparison.oldRegime.hraExemption)}</td>
                <td class="p-3 font-mono text-muted">₹0 (Disallowed)</td>
              </tr>
              <tr>
                <td class="p-3 text-muted">Taxable Annual Income</td>
                <td class="p-3 font-mono text-ink">{fmt(results.comparison.oldRegime.taxableIncome)}</td>
                <td class="p-3 font-mono text-ink">{fmt(results.comparison.newRegime.taxableIncome)}</td>
              </tr>
              <tr>
                <td class="p-3 text-muted">Estimated Income Tax (TDS)</td>
                <td class="p-3 font-mono font-bold text-rose-600">{fmt(results.comparison.oldRegime.totalTax)}</td>
                <td class="p-3 font-mono font-bold text-rose-600">{fmt(results.comparison.newRegime.totalTax)}</td>
              </tr>
              <tr class="bg-emerald-50/40 dark:bg-emerald-950/20">
                <td class="p-3 font-bold text-ink">Net Monthly In-Hand Take-Home</td>
                <td class="p-3 font-mono font-bold text-emerald-600 text-sm">{fmt(results.comparison.oldRegime.netMonthlyTakeHome)}/mo</td>
                <td class="p-3 font-mono font-bold text-emerald-600 text-sm">{fmt(results.comparison.newRegime.netMonthlyTakeHome)}/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Share Actions & Educational Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="CTC to Take-Home Salary Breakdown Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational payroll estimation model. Actual monthly in-hand take-home depends on your specific employer salary structure, HR policies, and Income Tax Act rules.
        </p>
      </div>
    </div>
  );
}
