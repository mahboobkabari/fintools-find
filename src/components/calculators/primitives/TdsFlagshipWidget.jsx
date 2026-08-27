import { useMemo } from 'preact/hooks';
import { calculateTdsCalculator, TDS_SECTIONS } from '@calculators/tax/tds-calculator';
import { TDS_PRESETS, tdsCalculatorConfig } from '@calculators/configs/tds-calculator.config';
import FormInputNumber from './FormInputNumber';
import FormToggleSwitch from './FormToggleSwitch';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import ResultRatioBar from './ResultRatioBar';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function TdsFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    amount: tdsCalculatorConfig.defaultAmount || 100000,
    sectionKey: tdsCalculatorConfig.defaultSectionKey || '194J_PROF',
    customRate: 10,
    hasPan: true,
    isSeniorCitizen: false,
    hasLowerRateCert: false,
    lowerRatePercent: 0,
    isThresholdExempt: false,
    recipientTaxSlab: 30,
    delayMonthsDeposit: 0,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateTdsCalculator(state);
  }, [state]);

  const currencySymbol = '₹';
  const selectedSection = TDS_SECTIONS[state.sectionKey] || TDS_SECTIONS['194J_PROF'];

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
              🏛️ Statutory CBDT TDS Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Calculate exact statutory withholding under Sections 194J, 194C, 194I, 194A, 194IA, 194IB, and 194Q. Verify non-PAN Section 206AA penalties, ITR tax refunds, and compliance schedules.
            </p>
          </div>
          <div className="bg-indigo-900/60 border border-indigo-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold block">
              Net Cash Payout (Receivable)
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.netPayout, state.currency)}
            </span>
            <span className="text-xs text-indigo-200 mt-1 block">
              TDS Withheld: {formatCurrency(results.tdsAmount, state.currency)} ({results.effectiveRate}%)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Official Statutory Reference Context Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          ℹ️ Statutory CBDT Compliance Rules (FY 2025-26 / Finance Act 2024)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
          <div>• <strong className="text-slate-900 dark:text-white">Active Section:</strong> {selectedSection.code}</div>
          <div>• <strong className="text-slate-900 dark:text-white">Statutory Base Rate:</strong> {selectedSection.statutoryRate}%</div>
          <div>• <strong className="text-slate-900 dark:text-white">Exemption Threshold:</strong> {selectedSection.threshold > 0 ? formatCurrency(results.threshold, state.currency) : 'N/A'}</div>
        </div>
      </div>

      {/* 3. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart TDS Presets
        </h3>
        <ScenarioPresetCards
          presets={TDS_PRESETS}
          activePresetId={null}
          onSelectPreset={(p) => {
            Object.entries(p.values).forEach(([k, v]) => updateState(k, v));
          }}
        />
      </div>

      {/* 4. Input Controls Card */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          1. Payment & Statutory Section Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInputNumber
            id="amount"
            label="Gross Invoice / Payment Amount"
            value={state.amount}
            onChange={(val) => updateState('amount', val)}
            min={0}
            max={100000000}
            step={5000}
            prefix={currencySymbol}
            minLabel="₹0"
            maxLabel="₹10 Cr"
            description="Total gross bill consideration before any tax deductions."
          />

          <div className="space-y-2">
            <label htmlFor="sectionKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Statutory TDS Section
            </label>
            <select
              id="sectionKey"
              value={state.sectionKey}
              onChange={(e) => updateState('sectionKey', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              {Object.entries(TDS_SECTIONS).map(([key, sec]) => (
                <option key={key} value={key}>
                  {sec.shortName} — {sec.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedSection.description}
            </p>
          </div>
        </div>

        {/* Dynamic Conditional Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          {state.sectionKey === 'CUSTOM' && (
            <FormInputNumber
              id="customRate"
              label="Custom TDS Rate"
              value={state.customRate}
              onChange={(val) => updateState('customRate', val)}
              min={0}
              max={100}
              step={0.1}
              suffix="%"
              minLabel="0%"
              maxLabel="100%"
            />
          )}

          {state.sectionKey === '194A_FD' && (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                  Senior Citizen (60+ Years)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Higher threshold of ₹50,000 under Sec 194A
                </span>
              </div>
              <FormToggleSwitch
                id="isSeniorCitizen"
                checked={state.isSeniorCitizen}
                onChange={(checked) => updateState('isSeniorCitizen', checked)}
              />
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                Valid PAN Card Furnished
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {state.hasPan ? 'Standard rate applies' : 'Triggers 20% Sec 206AA penalty'}
              </span>
            </div>
            <FormToggleSwitch
              id="hasPan"
              checked={state.hasPan}
              onChange={(checked) => updateState('hasPan', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                Cumulative / Threshold Exemption
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Force TDS on small bills if annual total exceeds limit
              </span>
            </div>
            <FormToggleSwitch
              id="isThresholdExempt"
              checked={state.isThresholdExempt}
              onChange={(checked) => updateState('isThresholdExempt', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                Lower TDS Cert (Sec 197)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Approved lower or NIL deduction certificate
              </span>
            </div>
            <FormToggleSwitch
              id="hasLowerRateCert"
              checked={state.hasLowerRateCert}
              onChange={(checked) => updateState('hasLowerRateCert', checked)}
            />
          </div>

          {state.hasLowerRateCert && (
            <FormInputNumber
              id="lowerRatePercent"
              label="Approved Certificate Rate"
              value={state.lowerRatePercent}
              onChange={(val) => updateState('lowerRatePercent', val)}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
              minLabel="0%"
              maxLabel="30%"
            />
          )}
        </div>

        {/* Section 2: Recipient Tax Slab & Compliance Delay */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3 pt-4">
          2. Recipient Tax Bracket & Compliance Verification
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="recipientTaxSlab" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Recipient Total Income Tax Slab (for ITR Reconciliation)
            </label>
            <select
              id="recipientTaxSlab"
              value={state.recipientTaxSlab}
              onChange={(e) => updateState('recipientTaxSlab', Number(e.target.value))}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              <option value={0}>0% Slab (Zero Tax / Income under basic exemption)</option>
              <option value={5}>5% Slab (Income ₹3L - ₹7L)</option>
              <option value={10}>10% Slab (Income ₹7L - ₹10L)</option>
              <option value={15}>15% Slab (Income ₹10L - ₹12L)</option>
              <option value={20}>20% Slab (Income ₹12L - ₹15L)</option>
              <option value={30}>30% Slab (Income above ₹15 Lakhs)</option>
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compares TDS deducted against actual final tax payable to compute tax refund or balance advance tax due.
            </p>
          </div>

          <FormInputNumber
            id="delayMonthsDeposit"
            label="Months Delay in Depositing TDS (Section 201(1A))"
            value={state.delayMonthsDeposit}
            onChange={(val) => updateState('delayMonthsDeposit', val)}
            min={0}
            max={24}
            step={1}
            suffix="Months"
            minLabel="0"
            maxLabel="24 Mo"
            description="Penalty interest charged at 1.5% per month for late deposit to the central government."
          />
        </div>
      </div>

      {/* 5. Key Metrics KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Net Payout */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block">
            💵 Net Cash Payout
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.netPayout, state.currency)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            {results.grossAmount > 0 ? Math.round((results.netPayout / results.grossAmount) * 100) : 0}% of gross bill
          </span>
        </div>

        {/* KPI 2: Total TDS Amount */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block">
            🏛️ Total TDS Withheld
          </span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatCurrency(results.tdsAmount, state.currency)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            Effective Rate: {results.effectiveRate}% ({results.compliance.certificateForm})
          </span>
        </div>

        {/* KPI 3: Non-PAN Penalty Surcharge */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block">
            ⚠️ Sec 206AA Penalty Drag
          </span>
          <span className={`text-2xl font-black mt-1 block ${results.panPenaltyAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
            {formatCurrency(results.panPenaltyAmount, state.currency)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            {results.panPenaltyAmount > 0 ? `+${results.panPenaltyRate}% extra penal rate` : 'Valid PAN verified (₹0 penalty)'}
          </span>
        </div>

        {/* KPI 4: ITR Tax Reconciliation */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block">
            {results.taxReconciliation.isRefund ? '🎉 Tax Refund Claimable' : '⚖️ Balance Tax Due'}
          </span>
          <span className={`text-2xl font-black mt-1 block ${results.taxReconciliation.isRefund ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {formatCurrency(results.taxReconciliation.isRefund ? results.taxReconciliation.refundAmount : results.taxReconciliation.balanceTaxDue, state.currency)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            At {results.taxReconciliation.recipientTaxSlab}% tax bracket (+4% cess)
          </span>
        </div>
      </div>

      {/* 6. Ratio Bar: Net Payout vs TDS Withheld */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Invoice Allocation Breakdown
        </h4>
        <ResultRatioBar
          items={[
            {
              label: `Net Cash Payout (${formatCurrency(results.netPayout, state.currency)})`,
              value: results.netPayout,
              colorClass: 'bg-emerald-500',
            },
            {
              label: `TDS Tax Withheld (${formatCurrency(results.tdsAmount, state.currency)})`,
              value: results.tdsAmount,
              colorClass: 'bg-indigo-600',
            },
          ]}
          total={results.grossAmount}
          formatValue={(val) => formatCurrency(val, state.currency)}
        />
      </div>

      {/* 7. Official B2B Payment & TDS Voucher Preview */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-700 pb-3 gap-2">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              📄 {results.b2bInvoicePreview.headline}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Statutory invoice deduction schedule for accounting, Form 26AS, and AIS filing.
            </p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs rounded-lg border border-indigo-200 dark:border-indigo-800">
            {results.b2bInvoicePreview.certificateType} Certificate
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs uppercase">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Item / Component</th>
                <th className="py-3 px-4">Statutory Reference</th>
                <th className="py-3 px-4">Rate (%)</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Gross Invoice Value</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Consideration</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">—</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                  {formatCurrency(results.grossAmount, state.currency)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                  Less: TDS Deducted
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  {selectedSection.code} ({results.b2bInvoicePreview.panStatus})
                </td>
                <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-bold">
                  {results.effectiveRate}%
                </td>
                <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                  - {formatCurrency(results.tdsAmount, state.currency)}
                </td>
              </tr>
              <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                <td className="py-3 px-4 font-black text-emerald-700 dark:text-emerald-400">
                  Net Amount Payable to Deductee
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  Bank Transfer / Cheque
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">—</td>
                <td className="py-3 px-4 text-right font-black text-lg text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(results.netPayout, state.currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {results.compliance.delayMonths > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <span className="font-bold block">
              ⚠️ Section 201(1A) Late Deposit Interest Applied:
            </span>
            <p>
              Deposit delay of {results.compliance.delayMonths} month(s) incurs 1.5%/month penalty of{' '}
              <strong>{formatCurrency(results.compliance.lateInterestAmount, state.currency)}</strong>. Total statutory liability payable to government: <strong>{formatCurrency(results.compliance.totalPayableWithLateInterest, state.currency)}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* 8. Multi-Section Comparison Table */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h4 className="text-base font-bold text-slate-900 dark:text-white">
          📊 Multi-Section TDS Comparison for {formatCurrency(results.grossAmount, state.currency)}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          See how different statutory sections apply to this exact payment amount:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs uppercase">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Section Code</th>
                <th className="py-3 px-4">Payment Category</th>
                <th className="py-3 px-4">Rate (%)</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">TDS Deducted</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Net Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {results.multiSectionComparison.map((row) => (
                <tr
                  key={row.sectionKey}
                  className={row.sectionKey === state.sectionKey ? 'bg-indigo-50/50 dark:bg-indigo-950/30 font-semibold' : ''}
                >
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-mono text-xs">
                    {row.code}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {row.name}
                  </td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white">
                    {row.effectiveRate}%
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {formatCurrency(row.threshold, state.currency)}
                  </td>
                  <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(row.tdsAmount, state.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(row.netPayout, state.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. Smart Actionable Recommendations */}
      {results.recommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            💡 Smart Actionable Recommendations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.recommendations.map((rec) => (
              <div
                key={rec.rank}
                className={`p-5 rounded-xl border shadow-sm ${
                  rec.type === 'warning'
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                    : rec.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                    : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {rec.title}
                  </span>
                  {rec.savings > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                      {formatCurrency(rec.savings, state.currency)} Impact
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {rec.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. Share & Export Actions */}
      <div className="flex justify-end pt-2">
        <ShareActions
          title={`TDS Calculation: ${results.section.code} - ${formatCurrency(results.tdsAmount, state.currency)} TDS on ${formatCurrency(results.grossAmount, state.currency)}`}
          text={results.heroText}
        />
      </div>
    </div>
  );
}
