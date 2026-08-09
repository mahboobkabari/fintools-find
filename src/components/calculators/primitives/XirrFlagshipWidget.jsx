import { useState, useMemo } from 'preact/hooks';
import { calculateXirrCalculator } from '@calculators/investment/xirr-calculator';
import { XIRR_CONFIG } from '@calculators/configs/xirr-calculator.config';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function XirrFlagshipWidget({ initialValues = {} }) {
  const [cashFlows, setCashFlows] = useState(
    initialValues.cashFlows || XIRR_CONFIG.defaultCashFlows
  );
  const [currency, setCurrency] = useState(initialValues.currency || 'INR');

  const results = useMemo(() => {
    return calculateXirrCalculator({ cashFlows, currency });
  }, [cashFlows, currency]);

  const presets = XIRR_CONFIG.presets;
  const currencySymbol = currency === 'USD' ? '$' : '₹';

  const handleAddRow = () => {
    const lastDate = cashFlows.length > 0 ? cashFlows[cashFlows.length - 1].date : '2025-01-01';
    const lastDt = new Date(lastDate);
    lastDt.setFullYear(lastDt.getFullYear() + 1);
    const nextDateStr = isNaN(lastDt.getTime()) ? '2026-01-01' : lastDt.toISOString().split('T')[0];

    const newRow = {
      id: String(Date.now()),
      date: nextDateStr,
      amount: 50000,
      description: 'Additional Cash Flow',
    };
    setCashFlows([...cashFlows, newRow]);
  };

  const handleDeleteRow = (id) => {
    if (cashFlows.length <= 2) return;
    setCashFlows(cashFlows.filter((item) => item.id !== id));
  };

  const handleUpdateRow = (id, field, value) => {
    setCashFlows(
      cashFlows.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          [field]: field === 'amount' ? (value === '' ? '' : Number(value)) : value,
        };
      })
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
              📊 Extended Internal Rate of Return (XIRR) Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Annualized return solver for irregular SIPs, top-ups, partial redemptions, and portfolio valuations using Newton-Raphson numerical root finding.
            </p>
          </div>
          <div className="bg-indigo-900/50 border border-indigo-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold block">
              Annualized XIRR Return (% p.a.)
            </span>
            <span className="text-4xl font-black text-emerald-400 mt-1 block">
              {results.isValid ? `${results.xirrPercent}%` : 'N/A'}
            </span>
            <span className="text-xs text-indigo-200 mt-1 block">
              Net Profit: {formatCurrency(results.absoluteProfit, currency)} ({results.absoluteReturnPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Smart XIRR Cash Flow Presets
        </h3>
        <ScenarioPresetCards
          presets={presets}
          activePresetId={null}
          onSelectPreset={(p) => {
            if (p.values.cashFlows) setCashFlows(p.values.cashFlows);
            if (p.values.currency) setCurrency(p.values.currency);
          }}
        />
      </div>

      {/* 3. Validation / Error Box */}
      {!results.isValid && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-xl text-sm font-medium">
          ⚠️ {results.errorMessage}
        </div>
      )}

      {/* 4. Dynamic Cash Flow Table Inputs */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Multi-Transaction Cash Flow Schedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter date and amount for each cash flow. Use <span className="font-bold text-rose-600 dark:text-rose-400">Negative (-)</span> for investments/deposits, and <span className="font-bold text-emerald-600 dark:text-emerald-400">Positive (+)</span> for redemptions/current portfolio valuation.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddRow}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            + Add Transaction
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3 w-12">#</th>
                <th className="p-3">Transaction Date</th>
                <th className="p-3">Description / Label</th>
                <th className="p-3">Cash Flow Amount ({currencySymbol})</th>
                <th className="p-3">Type Indicator</th>
                <th className="p-3 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {cashFlows.map((row, idx) => {
                const amt = Number(row.amount) || 0;
                const isOutflow = amt < 0;
                const isInflow = amt > 0;

                return (
                  <tr key={row.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-semibold text-slate-500">{idx + 1}</td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => handleUpdateRow(row.id, 'date', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.description || ''}
                        placeholder="Description"
                        onChange={(e) => handleUpdateRow(row.id, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="100"
                        value={row.amount}
                        onChange={(e) => handleUpdateRow(row.id, 'amount', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-3">
                      {isOutflow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-full border border-rose-500/20">
                          🔴 Outflow (Investment)
                        </span>
                      ) : isInflow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/20">
                          🟢 Inflow (Valuation/Payout)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Enter Amount</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        disabled={cashFlows.length <= 2}
                        title="Delete cash flow row"
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors rounded-lg focus:outline-none"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Annualized XIRR Return
          </span>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {results.isValid ? `${results.xirrPercent}%` : 'N/A'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Extended Internal Rate of Return
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Total Capital Invested
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatCurrency(results.totalInvested, currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Sum of all negative cash flows
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Total Redemption / Valuation
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {formatCurrency(results.totalRedeemed, currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Sum of all positive cash flows
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Net Capital Profit / Appreciation
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {formatCurrency(results.absoluteProfit, currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Absolute Return: {results.absoluteReturnPercent}%
          </span>
        </div>
      </div>

      {/* 6. XIRR vs CAGR Benchmark Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-6 rounded-2xl shadow-lg border border-indigo-700/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
              ⚖️ XIRR vs Benchmark CAGR Insights
            </span>
            <h4 className="text-xl font-extrabold mt-2">
              Annualized XIRR is {results.xirrPercent}% p.a. over a {results.holdingPeriodYears}-year horizon.
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Unlike simple CAGR ({results.cagrPercent}%), XIRR accurately accounts for the exact dates and amounts of every intermediate cash deposit and withdrawal.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 min-w-[220px] text-center">
            <span className="text-xs uppercase text-slate-300 font-semibold block">Equivalent CAGR Benchmark</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {results.cagrPercent}% p.a.
            </span>
            <span className="text-xs text-slate-300 mt-1 block">Horizon: {results.holdingPeriodYears} Yrs</span>
          </div>
        </div>
      </div>

      {/* 7. Share Actions */}
      <ShareActions
        toolTitle="XIRR Calculator"
        shareText={`My portfolio cash flows achieved an annualized XIRR of ${results.xirrPercent}% p.a.!`}
      />
    </div>
  );
}
