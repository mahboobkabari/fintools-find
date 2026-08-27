import { useState, useMemo } from 'preact/hooks';
import { calculateCreditCardPayoff } from '../../../calculators/credit/credit-card-payoff-calculator';
import { CREDIT_CARD_PAYOFF_CONFIG } from '../../../calculators/configs/credit-card-payoff-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function CreditCardPayoffFlagshipWidget() {
  const [mode, setMode] = useState(CREDIT_CARD_PAYOFF_CONFIG.defaultInputs.mode);

  // Single Card Inputs
  const [singleBalance, setSingleBalance] = useState(CREDIT_CARD_PAYOFF_CONFIG.defaultInputs.singleBalance);
  const [singleAprPercent, setSingleAprPercent] = useState(CREDIT_CARD_PAYOFF_CONFIG.defaultInputs.singleAprPercent);
  const [singleMinPayment, setSingleMinPayment] = useState(CREDIT_CARD_PAYOFF_CONFIG.defaultInputs.singleMinPayment);
  const [singleTargetPayment, setSingleTargetPayment] = useState(CREDIT_CARD_PAYOFF_CONFIG.defaultInputs.singleTargetPayment);

  // Multi-Card Inputs
  const [cards, setCards] = useState([...CREDIT_CARD_PAYOFF_CONFIG.defaultInputs.cards]);
  const [monthlyPayoffBudget, setMonthlyPayoffBudget] = useState(CREDIT_CARD_PAYOFF_CONFIG.defaultInputs.monthlyPayoffBudget);

  // Multi-card Handlers
  const handleCardChange = (index, field, value) => {
    const nextCards = [...cards];
    nextCards[index] = { ...nextCards[index], [field]: value };
    setCards(nextCards);
  };

  const handleAddCard = () => {
    setCards([
      ...cards,
      {
        id: `card_${Date.now()}`,
        name: `Card ${cards.length + 1}`,
        balance: 50000,
        aprPercent: 24,
        minPayment: '',
      },
    ]);
  };

  const handleRemoveCard = (index) => {
    if (cards.length <= 1) return;
    setCards(cards.filter((_, idx) => idx !== index));
  };

  // Compute Engine Results
  const results = useMemo(() => {
    return calculateCreditCardPayoff({
      mode,
      singleBalance,
      singleAprPercent,
      singleMinPayment,
      singleTargetPayment,
      cards,
      monthlyPayoffBudget,
    });
  }, [
    mode,
    singleBalance,
    singleAprPercent,
    singleMinPayment,
    singleTargetPayment,
    cards,
    monthlyPayoffBudget,
  ]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = CREDIT_CARD_PAYOFF_CONFIG.scenarios[presetKey];
    if (p) {
      setMode(p.mode);
      if (p.mode === 'single') {
        setSingleBalance(p.singleBalance);
        setSingleAprPercent(p.singleAprPercent);
        setSingleMinPayment(p.singleMinPayment);
        setSingleTargetPayment(p.singleTargetPayment);
      } else {
        setCards([...p.cards]);
        setMonthlyPayoffBudget(p.monthlyPayoffBudget);
      }
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-rose-950 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-rose-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-full border border-rose-500/30">
              💳 Credit Card Debt Acceleration & Payoff Engine
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Credit Card Payoff & Debt Avalanche Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Eliminate high-interest credit card debt using the mathematically optimal Debt Avalanche method (highest APR first) or Debt Snowball strategy.
            </p>
          </div>

          <div class="bg-rose-900/50 border border-rose-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-rose-300 font-bold block">
              {mode === 'single' ? 'Months to Debt-Free' : 'Avalanche Debt-Free Horizon'}
            </span>
            <span class="text-3xl sm:text-4xl font-black mt-1 block font-mono text-emerald-400">
              {results.isValid ? (mode === 'single' ? `${results.months} Months` : `${results.avalanche.months} Months`) : '—'}
            </span>
            {results.isValid && mode === 'multi' && (
              <span class="inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Saves {fmt(results.interestSavedVsSnowball)} vs Snowball
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Minimum Payment Disclosure */}
      <div class="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <span class="font-bold flex items-center gap-1.5">
          ℹ️ Configurable Minimum Payment Assumption Notice:
        </span>
        <p class="leading-relaxed">
          Minimum payments are configurable user inputs. When no user value is supplied, an illustrative default is calculated for modeling purposes. Actual minimum payments vary by card issuer, agreement terms, jurisdiction, fees, and regulatory requirements.
        </p>
      </div>

      {/* 2. Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Debt Payoff Scenario Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(CREDIT_CARD_PAYOFF_CONFIG.scenarios).map(([key, s]) => (
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

      {/* 3. Main Form & Strategy Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Mode Switcher */}
          <div class="flex items-center justify-between border-b border-hairline pb-3">
            <h3 class="text-sm font-bold text-ink">Select Calculator Mode</h3>
            <div class="flex items-center bg-surface-soft p-1 rounded-lg border border-hairline text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode('multi')}
                class={`px-3 py-1 rounded-md transition-all ${mode === 'multi' ? 'bg-canvas text-rose-600 shadow-xs font-bold' : 'text-muted'}`}
              >
                Multi-Card Strategy
              </button>
              <button
                type="button"
                onClick={() => setMode('single')}
                class={`px-3 py-1 rounded-md transition-all ${mode === 'single' ? 'bg-canvas text-rose-600 shadow-xs font-bold' : 'text-muted'}`}
              >
                Single Card Model
              </button>
            </div>
          </div>

          {mode === 'single' ? (
            /* Single Card Inputs */
            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInputNumber
                  id="singleBalance"
                  label="Current Card Balance (₹)"
                  value={singleBalance}
                  onChange={(v) => setSingleBalance(v)}
                  min={0}
                  max={10000000}
                  step={5000}
                  prefix="₹"
                  helpText="Total unpaid balance."
                />

                <FormInputNumber
                  id="singleAprPercent"
                  label="Annual Percentage Rate (APR %)"
                  value={singleAprPercent}
                  onChange={(v) => setSingleAprPercent(v)}
                  min={0}
                  max={60}
                  step={0.5}
                  helpText="Card interest rate p.a."
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInputNumber
                  id="singleMinPayment"
                  label="User Minimum Payment (₹) (Optional)"
                  value={singleMinPayment}
                  onChange={(v) => setSingleMinPayment(v)}
                  min={0}
                  max={1000000}
                  step={500}
                  prefix="₹"
                  helpText="Leave blank to use illustrative default."
                />

                <FormInputNumber
                  id="singleTargetPayment"
                  label="Target Monthly Payment (₹)"
                  value={singleTargetPayment}
                  onChange={(v) => setSingleTargetPayment(v)}
                  min={0}
                  max={1000000}
                  step={500}
                  prefix="₹"
                  helpText="Fixed monthly payment budget."
                />
              </div>
            </div>
          ) : (
            /* Multi-Card Interactive Inputs */
            <div class="space-y-5">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider text-muted">
                  Credit Card List ({cards.length} Cards)
                </h4>
                <button
                  type="button"
                  onClick={handleAddCard}
                  class="px-3 py-1 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-all"
                >
                  + Add Credit Card
                </button>
              </div>

              <div class="space-y-4">
                {cards.map((card, idx) => (
                  <div key={card.id || idx} class="p-4 bg-surface-soft border border-hairline rounded-xl space-y-3 relative group">
                    <div class="flex items-center justify-between">
                      <input
                        type="text"
                        value={card.name}
                        onInput={(e) => handleCardChange(idx, 'name', e.target.value)}
                        class="text-xs font-bold text-ink bg-transparent border-b border-transparent focus:border-rose-500 focus:outline-none"
                      />
                      {cards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(idx)}
                          class="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-0.5 rounded hover:bg-rose-100/50"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormInputNumber
                        id={`card_balance_${idx}`}
                        label="Balance (₹)"
                        value={card.balance}
                        onChange={(v) => handleCardChange(idx, 'balance', v)}
                        step={5000}
                        prefix="₹"
                      />
                      <FormInputNumber
                        id={`card_apr_${idx}`}
                        label="APR (%)"
                        value={card.aprPercent}
                        onChange={(v) => handleCardChange(idx, 'aprPercent', v)}
                        step={0.5}
                      />
                      <FormInputNumber
                        id={`card_min_${idx}`}
                        label="Min Payment (₹)"
                        value={card.minPayment}
                        onChange={(v) => handleCardChange(idx, 'minPayment', v)}
                        step={500}
                        prefix="₹"
                        helpText="User value (or blank)."
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div class="pt-3 border-t border-hairline">
                <FormInputNumber
                  id="monthlyPayoffBudget"
                  label="Total Monthly Payoff Budget across All Cards (₹)"
                  value={monthlyPayoffBudget}
                  onChange={(v) => setMonthlyPayoffBudget(v)}
                  min={0}
                  max={10000000}
                  step={1000}
                  prefix="₹"
                  helpText="Total amount you can pay monthly across all cards."
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Key Outputs & Strategy Breakdown (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {!results.isValid ? (
            <div class="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-2xl text-center space-y-2">
              <span class="text-2xl">🚨</span>
              <h4 class="font-bold text-rose-700 dark:text-rose-300 text-sm">Negative Amortization Warning</h4>
              <p class="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">{results.validationMessage}</p>
            </div>
          ) : (
            <>
              {/* Output Summary Card */}
              <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
                <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
                  Payoff Metrics Summary
                </h3>

                {mode === 'single' ? (
                  <div class="space-y-3">
                    <div class="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/40 flex items-center justify-between">
                      <span class="text-xs font-semibold text-rose-900 dark:text-rose-300">Months to Pay Off</span>
                      <span class="text-2xl font-mono font-black text-rose-600 dark:text-rose-400">{results.months} Mos</span>
                    </div>

                    <div class="grid grid-cols-2 gap-3 text-xs">
                      <div class="p-3 bg-surface-soft rounded-xl border border-hairline">
                        <span class="text-muted block text-[11px]">Total Interest Paid</span>
                        <span class="font-mono font-bold text-ink text-sm">{fmt(results.totalInterestPaid)}</span>
                      </div>
                      <div class="p-3 bg-surface-soft rounded-xl border border-hairline">
                        <span class="text-muted block text-[11px]">Total Amount Paid</span>
                        <span class="font-mono font-bold text-ink text-sm">{fmt(results.totalAmountPaid)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div class="space-y-4">
                    {/* Avalanche vs Snowball Comparison Grid */}
                    <div class="grid grid-cols-2 gap-3">
                      <div class="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-1">
                        <span class="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">
                          Debt Avalanche (Highest APR)
                        </span>
                        <span class="text-xl font-mono font-black text-emerald-600 block">
                          {results.avalanche.months} Months
                        </span>
                        <span class="text-[11px] text-muted block font-mono">
                          Interest: {fmt(results.avalanche.totalInterestPaid)}
                        </span>
                      </div>

                      <div class="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl space-y-1">
                        <span class="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 block uppercase">
                          Debt Snowball (Lowest Balance)
                        </span>
                        <span class="text-xl font-mono font-black text-indigo-600 block">
                          {results.snowball.months} Months
                        </span>
                        <span class="text-[11px] text-muted block font-mono">
                          Interest: {fmt(results.snowball.totalInterestPaid)}
                        </span>
                      </div>
                    </div>

                    <div class="p-3 bg-surface-soft rounded-xl border border-hairline text-xs space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-muted">Total Debt Balance:</span>
                        <span class="font-mono font-bold text-ink">{fmt(results.initialTotalBalance)}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-muted">Monthly Payoff Budget:</span>
                        <span class="font-mono font-bold text-ink">{fmt(results.monthlyPayoffBudget)}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-muted">Required Minimum Payments:</span>
                        <span class="font-mono font-bold text-ink">{fmt(results.totalMinPayments)}</span>
                      </div>
                    </div>

                    {/* Card Breakdown List */}
                    <div class="space-y-2">
                      <span class="text-xs font-bold text-muted uppercase tracking-wider block">
                        Card Payment & Assumption Status
                      </span>
                      <div class="space-y-2 text-xs">
                        {results.avalanche.cards.map((c) => (
                          <div key={c.id} class="p-2.5 bg-canvas border border-hairline rounded-lg flex items-center justify-between">
                            <div>
                              <span class="font-bold text-ink block">{c.name} ({c.aprPercent}% APR)</span>
                              <span class={`text-[10px] px-1.5 py-0.5 rounded font-mono ${c.isIllustrativeDefault ? 'bg-amber-100 dark:bg-amber-950 text-amber-700' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'}`}>
                                {c.isIllustrativeDefault ? 'Illustrative Default Min' : 'User Minimum'}
                              </span>
                            </div>
                            <div class="text-right">
                              <span class="font-mono font-bold text-ink block">{fmt(c.initialBalance)}</span>
                              <span class="text-[11px] text-muted block">Min: {fmt(c.minPayment)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Share Actions & Financial Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Credit Card Payoff & Debt Avalanche Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Illustrative debt payoff model. Actual card minimum payments, interest charges, late fees, and promo terms depend on your specific credit card issuer agreement.
        </p>
      </div>
    </div>
  );
}
