import { useMemo } from 'preact/hooks';
import { calculateLoanAmortization } from '@calculators/loans/loan-amortization-calculator';
import { LOAN_AMORTIZATION_CONFIG } from '@calculators/configs/loan-amortization-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import AmortizationTable from './AmortizationTable';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function LoanAmortizationFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    amount: 1000000,
    rate: LOAN_AMORTIZATION_CONFIG.defaultInterestRate,
    tenure: LOAN_AMORTIZATION_CONFIG.defaultTenureYears,
    tenureType: 'years',
    prepaymentMonthly: 0,
    prepaymentAnnual: 0,
    prepaymentOneTime: 0,
    prepaymentOneTimeMonth: 12,
    prepaymentStrategy: 'tenure_reduction',
    monthlyIncome: 100000,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateLoanAmortization(state);
  }, [state]);

  const presets = LOAN_AMORTIZATION_CONFIG.presets;

  // CSV Export Handler
  const handleExportCsv = () => {
    if (!results.schedule || results.schedule.length === 0) return;

    const headers = ['Month', 'Total Payment', 'Principal Paid', 'Interest Paid', 'Extra Payment', 'Remaining Balance', 'Cumulative Interest'];
    const csvRows = [headers.join(',')];

    results.schedule.forEach((row) => {
      csvRows.push(
        [
          row.month,
          row.payment,
          row.principalPaid,
          row.interestPaid,
          row.extraPaid,
          row.remainingBalance,
          row.cumulativeInterest,
        ].join(',')
      );
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Loan_Amortization_Schedule_${state.amount}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currencySymbol = state.currency === 'USD' ? '$' : state.currency === 'EUR' ? '€' : state.currency === 'GBP' ? '£' : '₹';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              📊 Institutional Loan Amortization & Schedule Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Inspect month-by-month and year-by-year principal vs interest payment schedules, simulate recurring monthly or annual lump-sum prepayments, analyze interest savings, and export CSV schedules.
            </p>
          </div>
          <div className="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Monthly Loan EMI
            </span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {formatCurrency(results.emi, state.currency)}/mo
            </span>
            <span className="text-xs text-blue-200 mt-1 block">
              (Payoff: {results.payoffYears} Years | {results.actualPayoffMonths} Months)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Preset Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Quick Benchmark Presets
        </h3>
        <ScenarioPresetCards
          presets={presets}
          activePresetId={null}
          onSelectPreset={(p) => {
            Object.entries(p.values).forEach(([k, v]) => updateState(k, v));
          }}
        />
      </div>

      {/* 3. Input Controls Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 gap-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Principal, Interest & Tenure Inputs
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Currency:</span>
            {['INR', 'USD', 'EUR', 'GBP'].map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => updateState('currency', curr)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                  state.currency === curr
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="amount"
            label={`Loan Principal Amount (${currencySymbol})`}
            value={state.amount}
            min={10000}
            max={50000000}
            step={10000}
            onChange={(v) => updateState('amount', v)}
          />

          <FormInputNumber
            id="rate"
            label="Interest Rate (% p.a.)"
            value={state.rate}
            min={0.1}
            max={30}
            step={0.1}
            onChange={(v) => updateState('rate', v)}
          />

          <FormInputNumber
            id="tenure"
            label="Loan Tenure (Years)"
            value={state.tenure}
            min={1}
            max={30}
            step={1}
            onChange={(v) => updateState('tenure', v)}
          />
        </div>

        {/* Prepayment Simulator Drawer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              💡 Extra Prepayment Simulator (Optional)
            </h4>
            {results.interestSaved > 0 && (
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold rounded-full border border-emerald-300 dark:border-emerald-800">
                🎉 Saves {formatCurrency(results.interestSaved, state.currency)} Interest
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <FormInputNumber
              id="prepaymentMonthly"
              label={`Recurring Monthly Extra (${currencySymbol})`}
              value={state.prepaymentMonthly}
              min={0}
              max={500000}
              step={500}
              onChange={(v) => updateState('prepaymentMonthly', v)}
            />

            <FormInputNumber
              id="prepaymentAnnual"
              label={`Annual Lump-Sum Extra (${currencySymbol})`}
              value={state.prepaymentAnnual}
              min={0}
              max={2000000}
              step={5000}
              onChange={(v) => updateState('prepaymentAnnual', v)}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Prepayment Repayment Strategy
              </label>
              <select
                value={state.prepaymentStrategy}
                onChange={(e) => updateState('prepaymentStrategy', e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="tenure_reduction">Reduce Loan Tenure (Keep EMI Same)</option>
                <option value="emi_reduction">Reduce Monthly EMI (Keep Tenure Same)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly Loan EMI</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {formatCurrency(results.emi, state.currency)}
          </span>
          <span className="text-xs text-slate-500 block">Standard monthly obligation</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Interest Outgo</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 block">
            {formatCurrency(results.totalInterest, state.currency)}
          </span>
          {results.interestSaved > 0 && (
            <span className="text-xs text-emerald-600 font-bold block">
              Saved {formatCurrency(results.interestSaved, state.currency)} ({results.interestSavedPct}%)
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Amount Payable</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {formatCurrency(results.totalPayment, state.currency)}
          </span>
          <span className="text-xs text-slate-500 block">Principal + Cumulative Interest</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Effective Payoff Duration</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">
            {results.payoffYears} Years
          </span>
          {results.tenureSavedMonths > 0 ? (
            <span className="text-xs text-emerald-600 font-bold block">
              Faster by {results.tenureSavedYears} yrs ({results.tenureSavedMonths} mos)
            </span>
          ) : (
            <span className="text-xs text-slate-500 block">Full {results.tenureYears} yrs tenure</span>
          )}
        </div>
      </div>

      {/* 5. Principal vs Interest Ratio Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-sm font-bold">
          <span className="text-blue-600 dark:text-blue-400">
            Principal: {formatCurrency(results.principal, state.currency)} ({Math.round((results.principal / results.totalPayment) * 100)}%)
          </span>
          <span className="text-rose-600 dark:text-rose-400">
            Interest: {formatCurrency(results.totalInterest, state.currency)} ({Math.round((results.totalInterest / results.totalPayment) * 100)}%)
          </span>
        </div>
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
          <div
            className="bg-blue-600 h-full transition-all duration-500"
            style={{ width: `${(results.principal / results.totalPayment) * 100}%` }}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-500"
            style={{ width: `${(results.totalInterest / results.totalPayment) * 100}%` }}
          />
        </div>
      </div>

      {/* 6. Interactive Amortization Schedule Table & CSV Export */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Detailed Loan Amortization Schedule
          </h3>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all"
            >
              📥 Export CSV Schedule
            </button>
          </div>
        </div>

        <AmortizationTable schedule={results.schedule} currency={state.currency} />
      </div>

      {/* 7. Scenario Comparison Matrix */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          📊 Prepayment Impact Matrix (Side-by-Side Comparison)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-900 dark:text-white font-bold">
              <tr>
                <th className="p-3">Prepayment Scenario</th>
                <th className="p-3">Monthly Outgo</th>
                <th className="p-3">Total Interest</th>
                <th className="p-3">Payoff Tenure</th>
                <th className="p-3">Interest Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.scenarios.map((sc) => (
                <tr key={sc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{sc.label}</td>
                  <td className="p-3">{formatCurrency(sc.monthlyEmi, state.currency)}/mo</td>
                  <td className="p-3 text-rose-600 dark:text-rose-400 font-medium">{formatCurrency(sc.totalInterest, state.currency)}</td>
                  <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400">
                    {(sc.payoffMonths / 12).toFixed(1)} Yrs ({sc.payoffMonths} Mos)
                  </td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {sc.interestSaved > 0 ? formatCurrency(sc.interestSaved, state.currency) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Share & Reset Bar */}
      <ShareActions title="Loan Amortization Schedule Calculator" />
    </div>
  );
}
