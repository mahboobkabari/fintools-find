import { useState, useMemo } from 'preact/hooks';
import { calculateBalanceTransferSavings } from '../../../calculators/loans/balance-transfer-calculator';
import { BALANCE_TRANSFER_CONFIG } from '../../../calculators/configs/balance-transfer-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function BalanceTransferFlagshipWidget() {
  const [outstandingPrincipal, setOutstandingPrincipal] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.outstandingPrincipal);
  const [currentInterestRatePercent, setCurrentInterestRatePercent] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.currentInterestRatePercent);
  const [remainingTenureMonths, setRemainingTenureMonths] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.remainingTenureMonths);

  const [newInterestRatePercent, setNewInterestRatePercent] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.newInterestRatePercent);
  const [newTenureMonths, setNewTenureMonths] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.newTenureMonths);

  const [processingFeePercent, setProcessingFeePercent] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.processingFeePercent);
  const [processingFeeFixed, setProcessingFeeFixed] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.processingFeeFixed);
  const [transferFeePercent, setTransferFeePercent] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.transferFeePercent);
  const [transferFeeFixed, setTransferFeeFixed] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.transferFeeFixed);
  const [foreclosurePenaltyPercent, setForeclosurePenaltyPercent] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.foreclosurePenaltyPercent);
  const [foreclosurePenaltyFixed, setForeclosurePenaltyFixed] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.foreclosurePenaltyFixed);

  const [financeFeesIntoLoan, setFinanceFeesIntoLoan] = useState(BALANCE_TRANSFER_CONFIG.defaultInputs.financeFeesIntoLoan);

  // Compute Engine Results
  const results = useMemo(() => {
    return calculateBalanceTransferSavings({
      outstandingPrincipal,
      currentInterestRatePercent,
      remainingTenureMonths,
      newInterestRatePercent,
      newTenureMonths,
      processingFeePercent,
      processingFeeFixed,
      transferFeePercent,
      transferFeeFixed,
      foreclosurePenaltyPercent,
      foreclosurePenaltyFixed,
      financeFeesIntoLoan,
    });
  }, [
    outstandingPrincipal,
    currentInterestRatePercent,
    remainingTenureMonths,
    newInterestRatePercent,
    newTenureMonths,
    processingFeePercent,
    processingFeeFixed,
    transferFeePercent,
    transferFeeFixed,
    foreclosurePenaltyPercent,
    foreclosurePenaltyFixed,
    financeFeesIntoLoan,
  ]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = BALANCE_TRANSFER_CONFIG.scenarios[presetKey];
    if (p) {
      setOutstandingPrincipal(p.outstandingPrincipal);
      setCurrentInterestRatePercent(p.currentInterestRatePercent);
      setRemainingTenureMonths(p.remainingTenureMonths);
      setNewInterestRatePercent(p.newInterestRatePercent);
      setNewTenureMonths(p.newTenureMonths);
      setProcessingFeePercent(p.processingFeePercent);
      setProcessingFeeFixed(p.processingFeeFixed);
      setTransferFeePercent(p.transferFeePercent);
      setTransferFeeFixed(p.transferFeeFixed);
      setForeclosurePenaltyPercent(p.foreclosurePenaltyPercent);
      setForeclosurePenaltyFixed(p.foreclosurePenaltyFixed);
      setFinanceFeesIntoLoan(p.financeFeesIntoLoan);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-blue-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
              🔄 Loan Refinancing & Interest Optimization Model
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Refinance & Balance Transfer Savings Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Evaluate estimated cost differences, monthly EMI savings, and cumulative cash-flow break-even months when switching to a lower loan interest rate.
            </p>
          </div>

          <div class="bg-blue-900/50 border border-blue-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Estimated Net Financial Savings
            </span>
            <span class={`text-3xl sm:text-4xl font-black mt-1 block font-mono ${results.netFinancialSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {results.isValid ? `${fmt(results.netFinancialSavings)}` : '—'}
            </span>
            {results.isValid && (
              <span class={`inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono border ${results.breakEven.hasBreakEven ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                {results.breakEven.hasBreakEven ? `Break-even @ Month ${results.breakEven.breakEvenMonth}` : 'No break-even in tenure'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Neutral Financial Disclaimer Alert */}
      <div class="p-4 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl text-xs text-blue-900 dark:text-blue-200 space-y-1">
        <span class="font-bold flex items-center gap-1.5">
          ℹ️ Illustrative Refinancing Scenario Model Notice:
        </span>
        <p class="leading-relaxed">
          Estimated net savings and break-even calculations are illustrative scenario estimates. Actual lender processing fees, foreclosure charges, documentation taxes, and final approval interest rates vary by financial institution and credit evaluation.
        </p>
      </div>

      {/* 2. Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Refinancing Archetype Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(BALANCE_TRANSFER_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-blue-600 block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Form & Analysis Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Section 1: Current Loan Baseline */}
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md">Step 1</span>
              Current Loan Parameters
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInputNumber
                id="outstandingPrincipal"
                label="Outstanding Principal (₹)"
                value={outstandingPrincipal}
                onChange={(v) => setOutstandingPrincipal(v)}
                min={10000}
                max={100000000}
                step={50000}
                prefix="₹"
                helpText="Current remaining balance."
              />

              <FormInputNumber
                id="currentInterestRatePercent"
                label="Current Rate (% p.a.)"
                value={currentInterestRatePercent}
                onChange={(v) => setCurrentInterestRatePercent(v)}
                min={0.1}
                max={50}
                step={0.1}
                helpText="Existing loan rate."
              />

              <FormInputNumber
                id="remainingTenureMonths"
                label="Remaining Tenure (Months)"
                value={remainingTenureMonths}
                onChange={(v) => setRemainingTenureMonths(v)}
                min={1}
                max={360}
                step={6}
                helpText="Months left to pay."
              />
            </div>
          </div>

          {/* Section 2: Refinanced Loan Parameters */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 text-xs rounded-md">Step 2</span>
              New Offered Refinance Terms
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="newInterestRatePercent"
                label="New Offered Interest Rate (% p.a.)"
                value={newInterestRatePercent}
                onChange={(v) => setNewInterestRatePercent(v)}
                min={0.1}
                max={50}
                step={0.1}
                helpText="Lower interest rate offered."
              />

              <FormInputNumber
                id="newTenureMonths"
                label="New Loan Tenure (Months)"
                value={newTenureMonths}
                onChange={(v) => setNewTenureMonths(v)}
                min={1}
                max={360}
                step={6}
                helpText="New loan tenure."
              />
            </div>
          </div>

          {/* Section 3: Upfront Fees & Financing Options */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-xs rounded-md">Step 3</span>
              Upfront Refinancing Charges & Fee Treatment
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInputNumber
                id="processingFeePercent"
                label="Processing Fee (%)"
                value={processingFeePercent}
                onChange={(v) => setProcessingFeePercent(v)}
                min={0}
                max={10}
                step={0.1}
              />

              <FormInputNumber
                id="transferFeePercent"
                label="Transfer Fee (%)"
                value={transferFeePercent}
                onChange={(v) => setTransferFeePercent(v)}
                min={0}
                max={10}
                step={0.1}
              />

              <FormInputNumber
                id="foreclosurePenaltyPercent"
                label="Prepayment Penalty (%)"
                value={foreclosurePenaltyPercent}
                onChange={(v) => setForeclosurePenaltyPercent(v)}
                min={0}
                max={10}
                step={0.1}
              />
            </div>

            {/* Fee Financing Option Switcher */}
            <div class="p-4 bg-surface-soft border border-hairline rounded-xl space-y-2">
              <label class="text-xs font-bold text-ink block">Upfront Fee Payment Method</label>
              <div class="flex items-center gap-4 text-xs font-semibold">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="feeTreatment"
                    checked={!financeFeesIntoLoan}
                    onChange={() => setFinanceFeesIntoLoan(false)}
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Pay Upfront Fees Out-of-Pocket (Cash)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="feeTreatment"
                    checked={financeFeesIntoLoan}
                    onChange={() => setFinanceFeesIntoLoan(true)}
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Finance Fees into New Loan Principal</span>
                </label>
              </div>
              <p class="text-[11px] text-muted">
                {financeFeesIntoLoan
                  ? 'Upfront fees are added to the new loan balance and paid over time via EMI (prevents fee double-counting).'
                  : 'Upfront fees are paid in cash at Month 0 as upfront outlay.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Key Outputs & Comparison Matrix (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {/* Comparison Matrix Card */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
              Refinancing Cost Comparison
            </h3>

            {/* Primary KPI Hero Box */}
            <div class="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/40 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-blue-900 dark:text-blue-300">Monthly EMI Savings</span>
                <span class="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {fmt(results.monthlyEmiSavings)}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs pt-1">
                <span class="text-muted">Current EMI vs New EMI:</span>
                <span class="font-mono font-bold text-ink">{fmt(results.baseline.currentEmi)} → {fmt(results.refinanced.newEmi)}</span>
              </div>
            </div>

            {/* Side-by-Side Table */}
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead>
                  <tr class="border-b border-hairline text-muted">
                    <th class="py-1.5">Metric</th>
                    <th class="py-1.5 text-right">Current Loan</th>
                    <th class="py-1.5 text-right">Refinanced Loan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-hairline">
                  <tr>
                    <td class="py-1.5 font-semibold text-ink">Loan Principal</td>
                    <td class="py-1.5 text-right font-mono text-ink">{fmt(results.baseline.outstandingPrincipal)}</td>
                    <td class="py-1.5 text-right font-mono font-bold text-blue-600">{fmt(results.refinanced.newPrincipal)}</td>
                  </tr>
                  <tr>
                    <td class="py-1.5 font-semibold text-ink">Interest Rate</td>
                    <td class="py-1.5 text-right font-mono text-ink">{results.baseline.currentInterestRatePercent}%</td>
                    <td class="py-1.5 text-right font-mono font-bold text-emerald-600">{results.refinanced.newInterestRatePercent}%</td>
                  </tr>
                  <tr>
                    <td class="py-1.5 font-semibold text-ink">Monthly EMI</td>
                    <td class="py-1.5 text-right font-mono text-ink">{fmt(results.baseline.currentEmi)}</td>
                    <td class="py-1.5 text-right font-mono font-bold text-emerald-600">{fmt(results.refinanced.newEmi)}</td>
                  </tr>
                  <tr>
                    <td class="py-1.5 font-semibold text-ink">Total Interest Paid</td>
                    <td class="py-1.5 text-right font-mono text-ink">{fmt(results.baseline.totalRemainingInterest)}</td>
                    <td class="py-1.5 text-right font-mono font-bold text-indigo-600">{fmt(results.refinanced.refinanceRemainingInterest)}</td>
                  </tr>
                  <tr class="font-bold text-ink bg-surface-soft">
                    <td class="py-2 pl-1">Total Economic Outflow</td>
                    <td class="py-2 text-right font-mono text-ink">{fmt(results.currentRemainingCost)}</td>
                    <td class="py-2 text-right font-mono text-emerald-600">{fmt(results.refinanceRemainingCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Fee Breakdown Box */}
            <div class="p-3 bg-surface-soft rounded-xl border border-hairline text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-muted">Total Upfront Fees:</span>
                <span class="font-mono font-bold text-ink">{fmt(results.fees.totalUpfrontFees)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted">Fee Payment Mode:</span>
                <span class="font-mono font-semibold text-ink">{financeFeesIntoLoan ? 'Financed in Loan' : 'Paid Out-of-Pocket'}</span>
              </div>
              {financeFeesIntoLoan && (
                <div class="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300">
                  <span>Interest on Financed Fees:</span>
                  <span class="font-mono font-bold">{fmt(results.refinanced.interestOnFinancedFees)}</span>
                </div>
              )}
            </div>

            {/* Cumulative Cash-Flow Break-Even Status */}
            <div class="p-4 bg-canvas border border-hairline rounded-xl space-y-1">
              <span class="text-[11px] font-bold text-muted uppercase block">Cumulative Cash-Flow Break-Even</span>
              <p class="text-xs font-semibold text-ink">
                {results.breakEven.hasBreakEven
                  ? `Your cumulative savings surpass upfront costs at Month ${results.breakEven.breakEvenMonth}.`
                  : 'Cumulative cash-flow break-even is not achieved within the modeled loan tenure.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Share Actions & Financial Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Refinance & Balance Transfer Savings Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational loan scenario model. Actual net savings depend on individual lender interest rate approvals, exact fee terms, foreclosure charges, and tax implications.
        </p>
      </div>
    </div>
  );
}
