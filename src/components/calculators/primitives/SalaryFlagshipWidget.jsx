import { useState, useMemo } from 'preact/hooks';
import {
  calculateSalary,
  solveTargetGrossSalary,
  compareSalaryOffers,
  PAY_FREQUENCIES,
  JURISDICTIONS,
} from '../../../calculators/salary/salary-calculator.js';
import { SALARY_CONFIG } from '../../../calculators/configs/salary-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function SalaryFlagshipWidget() {
  const [params, setParams] = useState({
    salaryAmount: SALARY_CONFIG.defaults.salaryAmount,
    payFrequency: SALARY_CONFIG.defaults.payFrequency,
    hoursPerWeek: SALARY_CONFIG.defaults.hoursPerWeek,
    weeksPerYear: SALARY_CONFIG.defaults.weeksPerYear,
    workingDaysPerYear: SALARY_CONFIG.defaults.workingDaysPerYear,
    bonusAnnual: SALARY_CONFIG.defaults.bonusAnnual,
    commissionAnnual: SALARY_CONFIG.defaults.commissionAnnual,
    otherTaxableAnnual: SALARY_CONFIG.defaults.otherTaxableAnnual,
    preTaxDeductionsAnnual: SALARY_CONFIG.defaults.preTaxDeductionsAnnual,
    postTaxDeductionsAnnual: SALARY_CONFIG.defaults.postTaxDeductionsAnnual,
    jurisdiction: SALARY_CONFIG.defaults.jurisdiction,
    indiaRegime: SALARY_CONFIG.defaults.indiaRegime,
    customTaxRate: SALARY_CONFIG.defaults.customTaxRate,
    customSocialRate: SALARY_CONFIG.defaults.customSocialRate,
    stateTaxRatePct: SALARY_CONFIG.defaults.stateTaxRatePct,
  });

  const [activeTab, setActiveTab] = useState('periods'); // 'periods', 'breakdown', 'target_solver', 'comparison'
  const [targetNet, setTargetNet] = useState(6000);
  const [targetPeriod, setTargetPeriod] = useState('monthly');

  // Offer B for Comparison Mode
  const [offerB, setOfferB] = useState({
    salaryAmount: 110000,
    payFrequency: 'ANNUAL',
    bonusAnnual: 5000,
    preTaxDeductionsAnnual: 6000,
    postTaxDeductionsAnnual: 0,
    jurisdiction: 'US',
    stateTaxRatePct: 4.5,
  });

  // URL Sync
  useUrlSync(params, setParams, SALARY_CONFIG.defaults);

  const curSymbol = JURISDICTIONS[params.jurisdiction]?.symbol || '$';

  const formatCurr = (val) => {
    if (val === undefined || isNaN(val)) return `${curSymbol}0`;
    return `${curSymbol}${Math.round(val).toLocaleString()}`;
  };

  const formatCurrPrecise = (val) => {
    if (val === undefined || isNaN(val)) return `${curSymbol}0.00`;
    return `${curSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const result = useMemo(() => calculateSalary(params), [params]);
  const solverResult = useMemo(
    () =>
      solveTargetGrossSalary({
        targetNet,
        targetPeriod,
        baseConfig: params,
      }),
    [targetNet, targetPeriod, params]
  );
  const comparisonResult = useMemo(
    () =>
      compareSalaryOffers(
        params,
        {
          ...params,
          ...offerB,
        }
      ),
    [params, offerB]
  );

  const applyPreset = (preset) => {
    setParams((prev) => ({
      ...prev,
      salaryAmount: preset.salaryAmount,
      payFrequency: preset.payFrequency || 'ANNUAL',
      hoursPerWeek: preset.hoursPerWeek || 40,
      weeksPerYear: preset.weeksPerYear || 52,
      bonusAnnual: preset.bonusAnnual || 0,
      commissionAnnual: preset.commissionAnnual || 0,
      otherTaxableAnnual: preset.otherTaxableAnnual || 0,
      preTaxDeductionsAnnual: preset.preTaxDeductionsAnnual || 0,
      postTaxDeductionsAnnual: preset.postTaxDeductionsAnnual || 0,
      jurisdiction: preset.jurisdiction || 'US',
      indiaRegime: preset.indiaRegime || 'new',
      stateTaxRatePct: preset.stateTaxRatePct !== undefined ? preset.stateTaxRatePct : 4.5,
    }));
  };

  // Retention breakdown percentages
  const gross = result.totals.totalGrossAnnual || 1;
  const netPct = (result.totals.netAnnualSalary / gross) * 100;
  const taxPct = (result.totals.incomeTaxAnnual / gross) * 100;
  const socialPct = (result.totals.socialContributionsAnnual / gross) * 100;
  const prePct = (result.totals.preTaxDeductionsAnnual / gross) * 100;
  const postPct = (result.totals.postTaxDeductionsAnnual / gross) * 100;

  return (
    <div class="salary-flagship-widget bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-8">
      {/* Educational Presets Ribbon */}
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">⚡ Quick Compensation Scenarios</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SALARY_CONFIG.presets.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              class="flex flex-col items-start p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-700/60 hover:border-emerald-500/50 transition-all text-left group"
            >
              <span class="text-base mb-1">{p.icon}</span>
              <span class="text-xs font-medium text-slate-200 group-hover:text-emerald-400 line-clamp-1">{p.label}</span>
              <span class="text-[10px] text-slate-400 line-clamp-1">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Decision Hero Section */}
      <div class="bg-gradient-to-br from-emerald-950/40 via-slate-800/80 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <span>💼 Net Take-Home Decision Intelligence</span>
            </div>
            <h2 class="text-sm uppercase tracking-wider font-semibold text-slate-400">Estimated Monthly Take-Home Pay</h2>
            <div class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-1">
              <span class="text-emerald-400">{formatCurr(result.totals.netMonthlySalary)}</span>
              <span class="text-xs text-slate-400 ml-1.5 font-normal">/ month</span>
            </div>
            <p class="text-xs text-slate-400 mt-2">
              Based on <span class="text-white font-medium">{formatCurr(result.totals.totalGrossAnnual)}</span> total gross compensation ({JURISDICTIONS[params.jurisdiction]?.name}).
            </p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
              <span class="text-[10px] uppercase font-semibold text-slate-400 block">Annual Net</span>
              <span class="text-base font-bold text-white">{formatCurr(result.totals.netAnnualSalary)}</span>
            </div>
            <div class="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
              <span class="text-[10px] uppercase font-semibold text-slate-400 block">Hourly Net</span>
              <span class="text-base font-bold text-emerald-400">{formatCurrPrecise(result.totals.netHourlySalary)}/hr</span>
            </div>
            <div class="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
              <span class="text-[10px] uppercase font-semibold text-slate-400 block">Effective Tax</span>
              <span class="text-base font-bold text-amber-400">{result.rates.effectiveTaxRatePct.toFixed(1)}%</span>
            </div>
            <div class="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
              <span class="text-[10px] uppercase font-semibold text-slate-400 block">Total Deductions</span>
              <span class="text-base font-bold text-rose-400">{formatCurr(result.totals.totalDeductionsAnnual)}</span>
            </div>
          </div>
        </div>

        {/* Visual Retention Progress Bar */}
        <div class="mt-6 pt-5 border-t border-slate-700/50 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-300 font-medium">Compensation Allocation:</span>
            <span class="text-emerald-400 font-semibold">{netPct.toFixed(1)}% Net In-Hand</span>
          </div>
          <div class="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/60">
            <div style={{ width: `${netPct}%` }} class="bg-emerald-500 h-full" title={`Net Pay: ${netPct.toFixed(1)}%`} />
            <div style={{ width: `${taxPct}%` }} class="bg-rose-500 h-full" title={`Income Tax: ${taxPct.toFixed(1)}%`} />
            <div style={{ width: `${socialPct}%` }} class="bg-amber-500 h-full" title={`Social / Payroll: ${socialPct.toFixed(1)}%`} />
            <div style={{ width: `${prePct}%` }} class="bg-blue-500 h-full" title={`Pre-tax Deductions: ${prePct.toFixed(1)}%`} />
            <div style={{ width: `${postPct}%` }} class="bg-purple-500 h-full" title={`Post-tax Deductions: ${postPct.toFixed(1)}%`} />
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Net ({netPct.toFixed(1)}%)</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Income Tax ({taxPct.toFixed(1)}%)</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Social/Payroll ({socialPct.toFixed(1)}%)</span>
            {prePct > 0 && <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Pre-Tax ({prePct.toFixed(1)}%)</span>}
            {postPct > 0 && <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" /> Post-Tax ({postPct.toFixed(1)}%)</span>}
          </div>
        </div>
      </div>

      {/* Main Form Inputs & Configuration */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Inputs (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          <div class="p-5 bg-slate-800/50 border border-slate-700/60 rounded-2xl space-y-4">
            <h3 class="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>📍</span> Jurisdiction & Tax System
            </h3>
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">Tax Jurisdiction</label>
              <select
                value={params.jurisdiction}
                onChange={(e) => setParams({ ...params, jurisdiction: e.target.value })}
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {Object.values(JURISDICTIONS).map((j) => (
                  <option key={j.id} value={j.id}>{j.name} ({j.currency})</option>
                ))}
              </select>
              <p class="text-[11px] text-slate-400 mt-1">{JURISDICTIONS[params.jurisdiction]?.description}</p>
            </div>

            {params.jurisdiction === 'IN' && (
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1.5">Indian Tax Regime</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setParams({ ...params, indiaRegime: 'new' })}
                    class={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      params.indiaRegime === 'new'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    New Regime (115BAC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setParams({ ...params, indiaRegime: 'old' })}
                    class={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      params.indiaRegime === 'old'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    Old Regime
                  </button>
                </div>
              </div>
            )}

            {params.jurisdiction === 'US' && (
              <div>
                <div class="flex justify-between items-center text-xs text-slate-300 mb-1">
                  <span>State Income Tax Estimate</span>
                  <span class="font-bold text-white">{params.stateTaxRatePct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="13.3"
                  step="0.1"
                  value={params.stateTaxRatePct}
                  onInput={(e) => setParams({ ...params, stateTaxRatePct: Number(e.target.value) })}
                  class="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            )}

            {params.jurisdiction === 'GENERIC' && (
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-slate-300 mb-1">Income Tax %</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={params.customTaxRate}
                    onInput={(e) => setParams({ ...params, customTaxRate: Number(e.target.value) })}
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label class="block text-xs text-slate-300 mb-1">Social/Payroll %</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={params.customSocialRate}
                    onInput={(e) => setParams({ ...params, customSocialRate: Number(e.target.value) })}
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Salary & Frequency Input */}
          <div class="p-5 bg-slate-800/50 border border-slate-700/60 rounded-2xl space-y-4">
            <h3 class="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>💰</span> Base Pay & Frequency
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1.5">Pay Frequency</label>
                <select
                  value={params.payFrequency}
                  onChange={(e) => setParams({ ...params, payFrequency: e.target.value })}
                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {Object.values(PAY_FREQUENCIES).map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1.5">
                  {params.payFrequency === 'HOURLY' ? 'Hourly Wage' : 'Base Salary Amount'} ({curSymbol})
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-slate-400 text-sm">{curSymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step={params.payFrequency === 'HOURLY' ? '0.5' : '1000'}
                    value={params.salaryAmount}
                    onInput={(e) => setParams({ ...params, salaryAmount: Number(e.target.value) })}
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {params.payFrequency === 'HOURLY' && (
              <div class="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label class="block text-xs text-slate-300 mb-1">Hours / Week</label>
                  <input
                    type="number"
                    min="1"
                    max="80"
                    value={params.hoursPerWeek}
                    onInput={(e) => setParams({ ...params, hoursPerWeek: Number(e.target.value) })}
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label class="block text-xs text-slate-300 mb-1">Weeks / Year</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={params.weeksPerYear}
                    onInput={(e) => setParams({ ...params, weeksPerYear: Number(e.target.value) })}
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            )}

            {/* Variable Pay */}
            <div class="pt-3 border-t border-slate-700/50 space-y-3">
              <span class="text-xs font-semibold text-slate-300 block">Variable Compensation (Annual)</span>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] text-slate-400 mb-1">Bonus ({curSymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={params.bonusAnnual}
                    onInput={(e) => setParams({ ...params, bonusAnnual: Number(e.target.value) })}
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label class="block text-[11px] text-slate-400 mb-1">Commissions ({curSymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={params.commissionAnnual}
                    onInput={(e) => setParams({ ...params, commissionAnnual: Number(e.target.value) })}
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div class="pt-3 border-t border-slate-700/50 space-y-3">
              <span class="text-xs font-semibold text-slate-300 block">Deductions (Annual)</span>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] text-slate-400 mb-1">Pre-Tax (401k/Pension) ({curSymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={params.preTaxDeductionsAnnual}
                    onInput={(e) => setParams({ ...params, preTaxDeductionsAnnual: Number(e.target.value) })}
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label class="block text-[11px] text-slate-400 mb-1">Post-Tax Deductions ({curSymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={params.postTaxDeductionsAnnual}
                    onInput={(e) => setParams({ ...params, postTaxDeductionsAnnual: Number(e.target.value) })}
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Modes & Tabs (7 cols) */}
        <div class="lg:col-span-7 space-y-6">
          {/* Tab Navigation */}
          <div class="flex border-b border-slate-800 overflow-x-auto space-x-2 pb-2">
            {[
              { id: 'periods', label: '📅 Pay Matrix' },
              { id: 'breakdown', label: '📊 Tax Breakdown' },
              { id: 'target_solver', label: '🎯 Target Net Solver' },
              { id: 'comparison', label: '⚖️ Offer Comparison' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                class={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Pay Frequency Matrix */}
          {activeTab === 'periods' && (
            <div class="space-y-4">
              <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th class="p-3">Period</th>
                      <th class="p-3 text-right">Gross Pay</th>
                      <th class="p-3 text-right">Taxes & Social</th>
                      <th class="p-3 text-right">Pre/Post Ded</th>
                      <th class="p-3 text-right font-bold text-emerald-400">Net Take-Home</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/60 text-slate-200">
                    {Object.entries(result.periods).map(([key, p]) => (
                      <tr key={key} class="hover:bg-slate-800/40 transition-colors">
                        <td class="p-3 font-medium text-slate-300">{p.label}</td>
                        <td class="p-3 text-right">{key === 'hourly' ? formatCurrPrecise(p.gross) : formatCurr(p.gross)}</td>
                        <td class="p-3 text-right text-rose-400">
                          {key === 'hourly'
                            ? formatCurrPrecise(p.incomeTax + p.socialContributions)
                            : formatCurr(p.incomeTax + p.socialContributions)}
                        </td>
                        <td class="p-3 text-right text-blue-400">
                          {key === 'hourly'
                            ? formatCurrPrecise(p.preTaxDeductions + p.postTaxDeductions)
                            : formatCurr(p.preTaxDeductions + p.postTaxDeductions)}
                        </td>
                        <td class="p-3 text-right font-bold text-emerald-400">
                          {key === 'hourly' ? formatCurrPrecise(p.net) : formatCurr(p.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Tax Breakdown */}
          {activeTab === 'breakdown' && (
            <div class="p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-4">
              <h4 class="text-sm font-semibold text-slate-200">Annual Statutory & Payroll Breakdown</h4>
              <div class="space-y-3 text-xs">
                <div class="flex justify-between py-1.5 border-b border-slate-700/40">
                  <span class="text-slate-400">Gross Annual Compensation</span>
                  <span class="font-bold text-white">{formatCurr(result.totals.totalGrossAnnual)}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-700/40">
                  <span class="text-slate-400">Pre-Tax Deductions (Exempt)</span>
                  <span class="font-medium text-blue-400">- {formatCurr(result.totals.preTaxDeductionsAnnual)}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-700/40">
                  <span class="text-slate-400">Taxable Base Income</span>
                  <span class="font-semibold text-slate-200">{formatCurr(result.totals.taxableIncomeAnnual)}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-700/40">
                  <span class="text-slate-400">Federal / National Income Tax</span>
                  <span class="font-medium text-rose-400">- {formatCurr(result.totals.incomeTaxAnnual)}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-700/40">
                  <span class="text-slate-400">Social Insurance / Statutory Payroll</span>
                  <span class="font-medium text-amber-400">- {formatCurr(result.totals.socialContributionsAnnual)}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-700/40">
                  <span class="text-slate-400">Post-Tax Deductions</span>
                  <span class="font-medium text-purple-400">- {formatCurr(result.totals.postTaxDeductionsAnnual)}</span>
                </div>
                <div class="flex justify-between py-2 border-t border-slate-600 font-bold text-sm">
                  <span class="text-emerald-400">Net Annual Take-Home</span>
                  <span class="text-emerald-400">{formatCurr(result.totals.netAnnualSalary)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Target Take-Home Solver */}
          {activeTab === 'target_solver' && (
            <div class="p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-5">
              <div>
                <h4 class="text-sm font-semibold text-slate-200">Target Take-Home Solver (Gross-Up Engine)</h4>
                <p class="text-xs text-slate-400 mt-1">
                  Determine the exact gross salary required to hit your desired in-hand take-home target.
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Target Net Amount ({curSymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={targetNet}
                    onInput={(e) => setTargetNet(Number(e.target.value))}
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Target Period</label>
                  <select
                    value={targetPeriod}
                    onChange={(e) => setTargetPeriod(e.target.value)}
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="monthly">Per Month (12x/yr)</option>
                    <option value="annual">Per Year (Annual)</option>
                  </select>
                </div>
              </div>

              <div class="p-4 bg-slate-900/80 border border-emerald-500/30 rounded-xl space-y-3">
                <span class="text-xs uppercase font-semibold text-slate-400 block">Required Gross Salary:</span>
                <div class="text-3xl font-extrabold text-emerald-400">
                  {formatCurr(solverResult.requiredGrossAnnual)}
                  <span class="text-xs text-slate-400 font-normal ml-2">/ year</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div>
                    <span class="text-slate-400 block">Gross Monthly:</span>
                    <span class="font-bold text-white">{formatCurr(solverResult.requiredGrossMonthly)}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">Effective Tax:</span>
                    <span class="font-bold text-amber-400">{solverResult.estimatedEffectiveTaxRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block">Gross-Up Amount:</span>
                    <span class="font-bold text-rose-400">{formatCurr(solverResult.grossUpAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Dual Offer Comparison */}
          {activeTab === 'comparison' && (
            <div class="p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-5">
              <div>
                <h4 class="text-sm font-semibold text-slate-200">Dual Job Offer / Scenario Comparison</h4>
                <p class="text-xs text-slate-400 mt-1">
                  Compare Offer A (current configuration) with an alternative Offer B.
                </p>
              </div>

              {/* Offer B inputs */}
              <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <span class="text-xs font-semibold text-slate-300 block">Offer B Parameters:</span>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-[10px] text-slate-400 mb-1">Base Salary ({curSymbol})</label>
                    <input
                      type="number"
                      value={offerB.salaryAmount}
                      onInput={(e) => setOfferB({ ...offerB, salaryAmount: Number(e.target.value) })}
                      class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-400 mb-1">Annual Bonus ({curSymbol})</label>
                    <input
                      type="number"
                      value={offerB.bonusAnnual}
                      onInput={(e) => setOfferB({ ...offerB, bonusAnnual: Number(e.target.value) })}
                      class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-400 mb-1">Pre-Tax 401k ({curSymbol})</label>
                    <input
                      type="number"
                      value={offerB.preTaxDeductionsAnnual}
                      onInput={(e) => setOfferB({ ...offerB, preTaxDeductionsAnnual: Number(e.target.value) })}
                      class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Side-by-side comparison table */}
              <div class="overflow-x-auto rounded-xl border border-slate-800">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-800/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th class="p-2.5">Metric</th>
                      <th class="p-2.5 text-right">Offer A</th>
                      <th class="p-2.5 text-right">Offer B</th>
                      <th class="p-2.5 text-right font-bold text-emerald-400">Net Delta (B - A)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/60 text-slate-200">
                    <tr>
                      <td class="p-2.5 text-slate-400">Gross Annual</td>
                      <td class="p-2.5 text-right">{formatCurr(comparisonResult.offerA.totals.totalGrossAnnual)}</td>
                      <td class="p-2.5 text-right">{formatCurr(comparisonResult.offerB.totals.totalGrossAnnual)}</td>
                      <td class="p-2.5 text-right font-semibold text-slate-300">{formatCurr(comparisonResult.deltas.deltaGrossAnnual)}</td>
                    </tr>
                    <tr>
                      <td class="p-2.5 text-slate-400">Total Deductions</td>
                      <td class="p-2.5 text-right text-rose-400">{formatCurr(comparisonResult.offerA.totals.totalDeductionsAnnual)}</td>
                      <td class="p-2.5 text-right text-rose-400">{formatCurr(comparisonResult.offerB.totals.totalDeductionsAnnual)}</td>
                      <td class="p-2.5 text-right">{formatCurr(comparisonResult.deltas.deltaTotalDeductions)}</td>
                    </tr>
                    <tr>
                      <td class="p-2.5 text-slate-400">Effective Tax Rate</td>
                      <td class="p-2.5 text-right">{comparisonResult.offerA.rates.effectiveTaxRatePct.toFixed(1)}%</td>
                      <td class="p-2.5 text-right">{comparisonResult.offerB.rates.effectiveTaxRatePct.toFixed(1)}%</td>
                      <td class="p-2.5 text-right">{comparisonResult.deltas.deltaEffectiveTaxRate.toFixed(1)}%</td>
                    </tr>
                    <tr class="bg-slate-800/40 font-bold">
                      <td class="p-2.5 text-emerald-400">Annual Net Take-Home</td>
                      <td class="p-2.5 text-right text-white">{formatCurr(comparisonResult.offerA.totals.netAnnualSalary)}</td>
                      <td class="p-2.5 text-right text-white">{formatCurr(comparisonResult.offerB.totals.netAnnualSalary)}</td>
                      <td class={`p-2.5 text-right font-extrabold ${comparisonResult.deltas.deltaNetAnnual >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {comparisonResult.deltas.deltaNetAnnual >= 0 ? '+' : ''}{formatCurr(comparisonResult.deltas.deltaNetAnnual)}
                      </td>
                    </tr>
                    <tr class="bg-slate-800/40 font-bold">
                      <td class="p-2.5 text-emerald-400">Monthly Net In-Hand</td>
                      <td class="p-2.5 text-right text-white">{formatCurr(comparisonResult.offerA.totals.netMonthlySalary)}</td>
                      <td class="p-2.5 text-right text-white">{formatCurr(comparisonResult.offerB.totals.netMonthlySalary)}</td>
                      <td class={`p-2.5 text-right font-extrabold ${comparisonResult.deltas.deltaNetMonthly >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {comparisonResult.deltas.deltaNetMonthly >= 0 ? '+' : ''}{formatCurr(comparisonResult.deltas.deltaNetMonthly)}/mo
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
