import { useState, useMemo } from 'preact/hooks';
import { calculateDebtPayoff } from '../../../calculators/credit/debt-snowball-calculator';
import { DEBT_SNOWBALL_CONFIG } from '../../../calculators/configs/debt-snowball-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function DebtSnowballFlagshipWidget({ initialDebts = null, initialExtra = null }) {
  const [debts, setDebts] = useState(
    initialDebts || DEBT_SNOWBALL_CONFIG.defaultDebts
  );
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(
    initialExtra !== null ? initialExtra : DEBT_SNOWBALL_CONFIG.defaultExtraPayment
  );
  const [selectedStrategy, setSelectedStrategy] = useState('avalanche'); // 'avalanche' | 'snowball' | 'minimumOnly'

  // Compute multi-strategy payoff calculations
  const results = useMemo(() => {
    return calculateDebtPayoff(debts, extraMonthlyPayment);
  }, [debts, extraMonthlyPayment]);

  // Debt Row Input Handlers
  const handleUpdateDebt = (id, field, value) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleAddDebt = () => {
    if (debts.length >= DEBT_SNOWBALL_CONFIG.fieldLimits.maxDebts) return;
    const newId = `debt_${Date.now()}`;
    setDebts((prev) => [
      ...prev,
      {
        id: newId,
        name: `Card/Loan ${prev.length + 1}`,
        balance: 20000,
        annualRate: 18.0,
        minPayment: 1000,
      },
    ]);
  };

  const handleRemoveDebt = (id) => {
    if (debts.length <= 1) return;
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleApplyPreset = (presetKey) => {
    const preset = DEBT_SNOWBALL_CONFIG.scenarios[presetKey];
    if (preset) {
      setDebts(preset.debts);
      setExtraMonthlyPayment(preset.extraMonthlyPayment);
    }
  };

  // Helper formatter
  const fmt = (val) => formatCurrency(val, 'INR');

  // Selected Active Strategy Data
  const activeRes = results[selectedStrategy] || results.avalanche;

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
              💳 Credit & Debt Payoff Decision Engine
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Debt Snowball vs Avalanche Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Compare Debt Avalanche (highest interest rate first) against Debt Snowball (lowest balance first) to eliminate credit cards and loans faster with maximum interest savings.
            </p>
          </div>
          <div class="bg-blue-900/50 border border-blue-500/40 p-4 rounded-xl text-center min-w-[240px]">
            <span class="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Estimated Debt-Free Time
            </span>
            <span class="text-3xl font-black text-emerald-400 mt-1 block">
              {results.avalanche.totalMonths} Months
            </span>
            <span class="text-xs text-blue-200 mt-1 block font-mono">
              ({results.avalanche.estimatedDebtFreeYears} Yrs) vs {results.minimumOnly.totalMonths} Mo Baseline
            </span>
          </div>
        </div>
      </div>

      {/* 2. Preset Scenario Selectors */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Example Debt Portfolios
        </label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(DEBT_SNOWBALL_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left group"
            >
              <span class="font-bold text-sm text-ink group-hover:text-primary block">{s.title}</span>
              <p class="text-xs text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Multi-Debt Input Manager Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Multi-Debt Form Manager */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 class="text-lg font-bold text-ink">Manage Debt Balances ({debts.length}/10)</h3>
              <p class="text-xs text-muted">Enter your credit cards, loans, and monthly obligations.</p>
            </div>
            {debts.length < DEBT_SNOWBALL_CONFIG.fieldLimits.maxDebts && (
              <button
                type="button"
                onClick={handleAddDebt}
                class="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1"
                aria-label="Add new debt"
              >
                + Add Debt
              </button>
            )}
          </div>

          {/* Dynamic Debt Rows */}
          <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {debts.map((d, index) => (
              <div
                key={d.id}
                class="p-4 rounded-xl bg-surface-soft border border-hairline space-y-3 relative group"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="flex-1">
                    <label class="text-[11px] font-bold text-muted block mb-1">Debt #{index + 1} Name</label>
                    <input
                      type="text"
                      value={d.name}
                      onInput={(e) => handleUpdateDebt(d.id, 'name', e.currentTarget.value)}
                      class="w-full text-xs font-bold p-2 rounded-lg bg-canvas border border-hairline text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  {debts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDebt(d.id)}
                      class="text-xs font-bold text-semantic-warning hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      aria-label={`Remove debt ${d.name}`}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="text-[11px] font-semibold text-muted block mb-1">Balance (₹)</label>
                    <input
                      type="number"
                      value={d.balance}
                      onInput={(e) => handleUpdateDebt(d.id, 'balance', Number(e.currentTarget.value))}
                      min="0"
                      class="w-full text-xs font-mono p-2 rounded-lg bg-canvas border border-hairline text-ink"
                    />
                  </div>

                  <div>
                    <label class="text-[11px] font-semibold text-muted block mb-1">APR (% p.a.)</label>
                    <input
                      type="number"
                      value={d.annualRate}
                      onInput={(e) => handleUpdateDebt(d.id, 'annualRate', Number(e.currentTarget.value))}
                      min="0"
                      max="100"
                      step="0.5"
                      class="w-full text-xs font-mono p-2 rounded-lg bg-canvas border border-hairline text-ink"
                    />
                  </div>

                  <div>
                    <label class="text-[11px] font-semibold text-muted block mb-1">Min Pay (₹)</label>
                    <input
                      type="number"
                      value={d.minPayment}
                      onInput={(e) => handleUpdateDebt(d.id, 'minPayment', Number(e.currentTarget.value))}
                      min="0"
                      class="w-full text-xs font-mono p-2 rounded-lg bg-canvas border border-hairline text-ink"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Extra Monthly Payment Budget Input */}
          <div class="pt-4 border-t border-hairline space-y-2">
            <FormInputNumber
              id="extraMonthlyPayment"
              label="Additional Monthly Payment Budget"
              value={extraMonthlyPayment}
              onChange={(v) => setExtraMonthlyPayment(v)}
              min={0}
              max={5000000}
              step={1000}
              prefix="₹"
              helpText="Extra cash applied every month above required minimum payments to accelerate payoff."
            />
          </div>
        </div>

        {/* Right Column: Strategy Comparison Cards & Key Insights */}
        <div class="lg:col-span-5 space-y-6">
          {/* Strategy Tabs / Comparator */}
          <div class="space-y-3">
            <h3 class="text-sm font-bold uppercase tracking-wider text-muted">
              Payoff Strategy Comparison
            </h3>

            {/* Avalanche Card */}
            <div
              onClick={() => setSelectedStrategy('avalanche')}
              class={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedStrategy === 'avalanche'
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-500/20'
                  : 'bg-canvas border-hairline hover:border-blue-300'
              }`}
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-extrabold text-sm text-ink flex items-center gap-2">
                  <span>⚡ Debt Avalanche</span>
                  <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Lowest Interest
                  </span>
                </span>
                <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {results.avalanche.totalMonths} Mo
                </span>
              </div>
              <p class="text-xs text-muted mb-3">Pays off highest interest rate debts first to minimize total interest paid.</p>
              <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-canvas/60 p-3 rounded-xl border border-hairline">
                <div>
                  <span class="text-[11px] text-muted block">Total Interest</span>
                  <span class="font-bold text-semantic-warning">{fmt(results.avalanche.totalInterestPaid)}</span>
                </div>
                <div>
                  <span class="text-[11px] text-muted block">Interest Saved</span>
                  <span class="font-bold text-emerald-600">{fmt(results.comparison.avalancheInterestSaved)}</span>
                </div>
              </div>
            </div>

            {/* Snowball Card */}
            <div
              onClick={() => setSelectedStrategy('snowball')}
              class={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedStrategy === 'snowball'
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-500/20'
                  : 'bg-canvas border-hairline hover:border-blue-300'
              }`}
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-extrabold text-sm text-ink flex items-center gap-2">
                  <span>🏔️ Debt Snowball</span>
                  <span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    Quick Momentum
                  </span>
                </span>
                <span class="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {results.snowball.totalMonths} Mo
                </span>
              </div>
              <p class="text-xs text-muted mb-3">Pays off smallest balances first to build rapid psychological momentum.</p>
              <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-canvas/60 p-3 rounded-xl border border-hairline">
                <div>
                  <span class="text-[11px] text-muted block">Total Interest</span>
                  <span class="font-bold text-semantic-warning">{fmt(results.snowball.totalInterestPaid)}</span>
                </div>
                <div>
                  <span class="text-[11px] text-muted block">Interest Saved</span>
                  <span class="font-bold text-emerald-600">{fmt(results.comparison.snowballInterestSaved)}</span>
                </div>
              </div>
            </div>

            {/* Minimum Payments Only Card */}
            <div
              onClick={() => setSelectedStrategy('minimumOnly')}
              class={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedStrategy === 'minimumOnly'
                  ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-canvas border-hairline hover:border-amber-300'
              }`}
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-extrabold text-sm text-ink flex items-center gap-2">
                  <span>🐢 Minimum Payments Baseline</span>
                </span>
                <span class="text-xs font-mono font-bold text-rose-600">
                  {results.minimumOnly.totalMonths} Mo
                </span>
              </div>
              <p class="text-xs text-muted mb-3">Paying only minimum monthly payments without additional budget allocation.</p>
              <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-canvas/60 p-3 rounded-xl border border-hairline">
                <div>
                  <span class="text-[11px] text-muted block">Total Interest</span>
                  <span class="font-bold text-rose-600">{fmt(results.minimumOnly.totalInterestPaid)}</span>
                </div>
                <div>
                  <span class="text-[11px] text-muted block">Total Paid</span>
                  <span class="font-bold text-ink">{fmt(results.minimumOnly.totalAmountPaid)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Winner Summary Alert */}
          <div class="p-4 bg-surface-soft border border-hairline rounded-xl text-xs space-y-2">
            <div class="font-bold text-ink flex items-center gap-2">
              <span>💡 Decision Matrix Breakdown:</span>
            </div>
            {results.comparison.snowballVsAvalancheInterestDiff > 0 ? (
              <p class="text-muted leading-relaxed">
                **Debt Avalanche** saves you an additional <strong class="text-emerald-600">{fmt(results.comparison.snowballVsAvalancheInterestDiff)}</strong> in total interest compared to Debt Snowball.
              </p>
            ) : results.comparison.snowballVsAvalancheInterestDiff < 0 ? (
              <p class="text-muted leading-relaxed">
                **Debt Snowball** saves you an additional <strong class="text-emerald-600">{fmt(Math.abs(results.comparison.snowballVsAvalancheInterestDiff))}</strong> in interest compared to Debt Avalanche.
              </p>
            ) : (
              <p class="text-muted leading-relaxed">
                Both Debt Snowball and Debt Avalanche yield identical payoff duration and total interest for your debt portfolio.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Individual Debt Payoff Timeline Order Table */}
      <div class="bg-canvas border border-hairline rounded-2xl p-6 space-y-4">
        <h3 class="text-base font-bold text-ink flex items-center justify-between">
          <span>Target Payoff Sequence ({activeRes.strategy.toUpperCase()} Strategy)</span>
          <span class="text-xs font-mono text-primary font-semibold">{activeRes.totalMonths} Total Months</span>
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left font-mono">
            <thead class="bg-surface-soft text-ink font-semibold border-b border-hairline">
              <tr>
                <th class="p-3">Order</th>
                <th class="p-3">Debt Name</th>
                <th class="p-3">Start Balance</th>
                <th class="p-3">APR (% p.a.)</th>
                <th class="p-3">Min Payment</th>
                <th class="p-3">Payoff Month</th>
                <th class="p-3">Total Interest Paid</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              {activeRes.individualDebts.map((item, idx) => (
                <tr key={item.id} class="hover:bg-surface-soft/50 transition-colors">
                  <td class="p-3 font-bold text-primary">#{idx + 1}</td>
                  <td class="p-3 font-semibold text-ink">{item.name}</td>
                  <td class="p-3">{fmt(item.startBalance)}</td>
                  <td class="p-3 text-rose-600 font-bold">{item.annualRate}%</td>
                  <td class="p-3">{fmt(item.minPayment)}</td>
                  <td class="p-3 font-bold text-emerald-600">Month {item.payoffMonth}</td>
                  <td class="p-3 text-semantic-warning">{fmt(item.totalInterestPaid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Share Actions & Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Debt Snowball vs Debt Avalanche Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Mathematical estimate for debt payoff planning. Actual lender minimum payment formulas, interest posting dates, promotional rates, and late fees may vary by financial institution.
        </p>
      </div>
    </div>
  );
}
