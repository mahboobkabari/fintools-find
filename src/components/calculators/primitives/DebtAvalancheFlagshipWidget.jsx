import { useState, useMemo } from 'preact/hooks';
import { calculateDebtAvalancheDetails } from '../../../calculators/credit/debt-avalanche-calculator.js';
import { DEBT_AVALANCHE_CONFIG } from '../../../calculators/configs/debt-avalanche-calculator.config.js';
import FormInputNumber from './FormInputNumber.jsx';
import ShareActions from '../../ui/ShareActions.jsx';
import { formatCurrency } from '@utils/formatters.js';

export default function DebtAvalancheFlagshipWidget() {
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(DEBT_AVALANCHE_CONFIG.defaultInputs.extraMonthlyPayment);
  const [debts, setDebts] = useState(DEBT_AVALANCHE_CONFIG.defaultInputs.debts);
  const [activeStrategyView, setActiveStrategyView] = useState('avalanche');

  // Compute Debt Avalanche Results
  const results = useMemo(() => {
    return calculateDebtAvalancheDetails({
      debts,
      extraMonthlyPayment,
    });
  }, [debts, extraMonthlyPayment]);

  const handleApplyPreset = (presetKey) => {
    const s = DEBT_AVALANCHE_CONFIG.scenarios[presetKey];
    if (s) {
      setExtraMonthlyPayment(s.extraMonthlyPayment);
      setDebts(s.debts);
    }
  };

  const handleDebtChange = (id, field, value) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleAddDebt = () => {
    if (debts.length >= 10) return;
    const newId = `debt_${Date.now()}`;
    setDebts((prev) => [
      ...prev,
      { id: newId, name: `Debt ${prev.length + 1}`, balance: 100000, annualRate: 18, minPayment: 3000 },
    ]);
  };

  const handleRemoveDebt = (id) => {
    if (debts.length <= 1) return;
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-rose-950 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-rose-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-full border border-rose-500/30">
              🏔️ Debt Avalanche Payoff Accelerator
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Debt Avalanche Calculator (Highest Interest Rate First)
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Pay off highest-APR credit cards and loans first to mathematically minimize total interest paid and become 100% debt-free faster.
            </p>
          </div>

          <div class="bg-rose-900/50 border border-rose-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-rose-300 font-bold block">
              Months to Debt-Free (Avalanche)
            </span>
            <span class="text-3xl sm:text-4xl font-black text-rose-400 mt-1 block font-mono">
              {results.isValid ? `${results.avalancheMonths} Mos` : '—'}
            </span>
            {results.isValid && (
              <span class="inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Saved {fmt(results.interestSaved)} in Total Interest
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Educational Disclosure Banner */}
      <div class="p-4 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs text-rose-900 dark:text-rose-200 space-y-1">
        <span class="font-bold flex items-center gap-1.5">
          ℹ️ Debt Strategy Modeling Disclosure:
        </span>
        <p class="leading-relaxed">
          {DEBT_AVALANCHE_CONFIG.disclaimers.educationalNotice} {DEBT_AVALANCHE_CONFIG.disclaimers.strategyNotice}
        </p>
      </div>

      {/* 2. Sample Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Sample Debt Portfolios
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(DEBT_AVALANCHE_CONFIG.scenarios).map(([key, s]) => (
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
        {/* Left Column: Debt Portfolio & Extra Payment Manager (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-3">
            <h3 class="text-sm font-bold text-ink flex items-center gap-2">
              <span class="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 text-xs rounded-md">Step 1</span>
              Your Debt Portfolio ({debts.length} {debts.length === 1 ? 'Debt' : 'Debts'})
            </h3>
            <button
              type="button"
              onClick={handleAddDebt}
              disabled={debts.length >= 10}
              class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
            >
              + Add Debt
            </button>
          </div>

          {/* Dynamic Debt Items Cards */}
          <div class="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {debts.map((d, idx) => (
              <div key={d.id} class="p-4 border border-hairline bg-surface-soft rounded-xl space-y-3 relative">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={d.name}
                      onInput={(e) => handleDebtChange(d.id, 'name', e.target.value)}
                      class="font-bold text-xs text-ink bg-transparent border-b border-transparent hover:border-hairline focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  {debts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDebt(d.id)}
                      class="text-xs text-rose-500 hover:text-rose-700 font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormInputNumber
                    id={`balance-${d.id}`}
                    label="Current Balance (₹)"
                    value={d.balance}
                    onChange={(v) => handleDebtChange(d.id, 'balance', v)}
                    min={1000}
                    max={50000000}
                    step={5000}
                    prefix="₹"
                  />
                  <FormInputNumber
                    id={`rate-${d.id}`}
                    label="Interest Rate (APR %)"
                    value={d.annualRate}
                    onChange={(v) => handleDebtChange(d.id, 'annualRate', v)}
                    min={0}
                    max={60}
                    step={0.5}
                  />
                  <FormInputNumber
                    id={`minPay-${d.id}`}
                    label="Min Payment (₹/mo)"
                    value={d.minPayment}
                    onChange={(v) => handleDebtChange(d.id, 'minPayment', v)}
                    min={100}
                    max={500000}
                    step={500}
                    prefix="₹"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Extra Monthly Payment Control */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-xs rounded-md">Step 2</span>
              Extra Monthly Repayment Budget
            </h3>

            <FormInputNumber
              id="extraMonthlyPayment"
              label="Additional Monthly Payment Available (₹/month)"
              value={extraMonthlyPayment}
              onChange={(v) => setExtraMonthlyPayment(v)}
              min={0}
              max={500000}
              step={500}
              prefix="₹"
              helpText="Directed to highest APR debt first under Debt Avalanche."
            />
          </div>
        </div>

        {/* Right Column: KPI Summary & Payoff Order (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {/* KPI Summary Cards */}
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Total Debt Balance</span>
              <span class="text-lg font-mono font-black text-ink block">{fmt(results.totalInitialDebt)}</span>
              <span class="text-[10px] text-muted block">across {results.debtsCount} debts</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Combined Min Payment</span>
              <span class="text-lg font-mono font-black text-slate-700 dark:text-slate-300 block">
                {fmt(results.totalMinimumMonthlyPayment)}
              </span>
              <span class="text-[10px] text-muted block">+ {fmt(results.extraMonthlyPayment)} extra</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Avalanche Payoff Time</span>
              <span class="text-lg font-mono font-black text-rose-600 block">
                {results.isValid ? `${results.avalancheMonths} Mos (${results.avalancheYears} Yrs)` : '—'}
              </span>
              <span class="text-[10px] text-emerald-600 font-bold block">
                {results.monthsSaved > 0 ? `Saved ${results.monthsSaved} Months` : '—'}
              </span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Avalanche Total Interest</span>
              <span class="text-lg font-mono font-black text-indigo-600 block">{fmt(results.avalancheInterest)}</span>
              <span class="text-[10px] text-muted block">vs {fmt(results.baselineInterest)} baseline</span>
            </div>
          </div>

          {/* Strategy Comparison Box */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted flex items-center justify-between">
              <span>Strategy Comparison</span>
              <div class="flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveStrategyView('avalanche')}
                  class={`px-2 py-1 text-[10px] font-bold rounded ${
                    activeStrategyView === 'avalanche' ? 'bg-rose-600 text-white' : 'bg-surface-soft text-muted'
                  }`}
                >
                  Avalanche
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStrategyView('snowball')}
                  class={`px-2 py-1 text-[10px] font-bold rounded ${
                    activeStrategyView === 'snowball' ? 'bg-indigo-600 text-white' : 'bg-surface-soft text-muted'
                  }`}
                >
                  Snowball
                </button>
              </div>
            </h3>

            <div class="space-y-3">
              <div class="p-3 bg-surface-soft rounded-xl flex items-center justify-between text-xs">
                <span class="font-bold text-ink">Debt Avalanche (Highest APR First)</span>
                <span class="font-mono font-black text-rose-600">
                  {results.avalanche.totalMonths} Mos / {fmt(results.avalanche.totalInterestPaid)} Int.
                </span>
              </div>

              <div class="p-3 bg-surface-soft rounded-xl flex items-center justify-between text-xs">
                <span class="font-bold text-ink">Debt Snowball (Lowest Balance First)</span>
                <span class="font-mono font-black text-indigo-600">
                  {results.snowball.totalMonths} Mos / {fmt(results.snowball.totalInterestPaid)} Int.
                </span>
              </div>

              <div class="p-3 bg-surface-soft rounded-xl flex items-center justify-between text-xs">
                <span class="font-bold text-muted">Minimum Payments Only (Baseline)</span>
                <span class="font-mono font-semibold text-muted">
                  {results.minimumOnly.totalMonths} Mos / {fmt(results.minimumOnly.totalInterestPaid)} Int.
                </span>
              </div>
            </div>
          </div>

          {/* Modeled Payoff Order Priority List */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
              Modeled Payoff Priority Order ({activeStrategyView === 'avalanche' ? 'Highest APR First' : 'Lowest Balance First'})
            </h3>

            <div class="space-y-2">
              {(activeStrategyView === 'avalanche' ? results.avalanche : results.snowball).payoffOrder.map((item, idx) => (
                <div key={item.id} class="p-3 border border-hairline rounded-xl flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <span class="font-bold text-ink">{item.name}</span>
                  </div>
                  <div class="text-right">
                    <span class="font-mono font-bold text-rose-600 block">{item.annualRate}% APR</span>
                    <span class="text-[10px] text-muted block">Eliminated Month {item.month}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Share Actions & Educational Footer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Debt Avalanche Calculator (Highest Interest Rate First) - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational debt elimination model. Actual lender payment processing, daily compound interest, and fees may vary. Always verify payment terms directly with debt issuers.
        </p>
      </div>
    </div>
  );
}
