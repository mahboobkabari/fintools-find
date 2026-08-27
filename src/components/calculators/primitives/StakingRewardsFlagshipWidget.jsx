import { useState, useMemo } from 'preact/hooks';
import {
  calculateStakingRewards,
  COMPOUNDING_FREQUENCIES,
  FIAT_CURRENCIES,
} from '../../../calculators/crypto/staking-rewards-calculator.js';
import { STAKING_REWARDS_CONFIG } from '../../../calculators/configs/staking-rewards-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function StakingRewardsFlagshipWidget() {
  const [activePreset, setActivePreset] = useState('eth_validator_pool');

  const [assetName, setAssetName] = useState('Ethereum (ETH)');
  const [stakedAmount, setStakedAmount] = useState(32);
  const [tokenPrice, setTokenPrice] = useState(3000);
  const [rateMode, setRateMode] = useState('APR');
  const [rewardRatePct, setRewardRatePct] = useState(3.8);
  const [compoundingFrequency, setCompoundingFrequency] = useState('DAILY');
  const [durationMonths, setDurationMonths] = useState(12);
  const [validatorCommissionPct, setValidatorCommissionPct] = useState(5.0);
  const [fixedFeeTokens, setFixedFeeTokens] = useState(0.005);
  const [recurringMonthlyFeeTokens, setRecurringMonthlyFeeTokens] = useState(0);
  const [unbondingDays, setUnbondingDays] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [showAdvancedFees, setShowAdvancedFees] = useState(false);

  // URL Sync
  useUrlSync(
    {
      assetName,
      stakedAmount,
      tokenPrice,
      rateMode,
      rewardRatePct,
      compoundingFrequency,
      durationMonths,
      validatorCommissionPct,
      fixedFeeTokens,
      recurringMonthlyFeeTokens,
      unbondingDays,
      currency,
    },
    (params) => {
      if (params.assetName) setAssetName(params.assetName);
      if (params.stakedAmount !== undefined) setStakedAmount(Number(params.stakedAmount) || 10);
      if (params.tokenPrice !== undefined) setTokenPrice(Number(params.tokenPrice) || 3000);
      if (params.rateMode) setRateMode(params.rateMode);
      if (params.rewardRatePct !== undefined) setRewardRatePct(Number(params.rewardRatePct) || 4.0);
      if (params.compoundingFrequency) setCompoundingFrequency(params.compoundingFrequency);
      if (params.durationMonths !== undefined) setDurationMonths(Number(params.durationMonths) || 12);
      if (params.validatorCommissionPct !== undefined) setValidatorCommissionPct(Number(params.validatorCommissionPct) || 5.0);
      if (params.fixedFeeTokens !== undefined) setFixedFeeTokens(Number(params.fixedFeeTokens) || 0);
      if (params.recurringMonthlyFeeTokens !== undefined) setRecurringMonthlyFeeTokens(Number(params.recurringMonthlyFeeTokens) || 0);
      if (params.unbondingDays !== undefined) setUnbondingDays(Number(params.unbondingDays) || 0);
      if (params.currency) setCurrency(params.currency);
      setActivePreset('');
    }
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setAssetName(p.assetName);
    setStakedAmount(p.stakedAmount);
    setTokenPrice(p.tokenPrice);
    setRateMode(p.rateMode);
    setRewardRatePct(p.rewardRatePct);
    setCompoundingFrequency(p.compoundingFrequency);
    setDurationMonths(p.durationMonths);
    setValidatorCommissionPct(p.validatorCommissionPct);
    setFixedFeeTokens(p.fixedFeeTokens);
    setRecurringMonthlyFeeTokens(p.recurringMonthlyFeeTokens);
    setUnbondingDays(p.unbondingDays);
    setCurrency(p.currency);
  };

  const results = useMemo(() => {
    return calculateStakingRewards({
      assetName,
      stakedAmount,
      tokenPrice,
      rateMode,
      rewardRatePct,
      compoundingFrequency,
      durationMonths,
      validatorCommissionPct,
      fixedFeeTokens,
      recurringMonthlyFeeTokens,
      unbondingDays,
      currency,
    });
  }, [
    assetName,
    stakedAmount,
    tokenPrice,
    rateMode,
    rewardRatePct,
    compoundingFrequency,
    durationMonths,
    validatorCommissionPct,
    fixedFeeTokens,
    recurringMonthlyFeeTokens,
    unbondingDays,
    currency,
  ]);

  const currMeta = FIAT_CURRENCIES[currency] || FIAT_CURRENCIES.USD;
  const sym = currMeta.symbol;
  const decimals = currMeta.decimals;

  return (
    <div class="space-y-10">
      {/* PRESETS */}
      <section class="space-y-3" role="region" aria-label="Preset scenarios">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Representative Proof-of-Stake Protocol Archetypes
          </span>
          <span class="text-xs font-mono text-primary font-semibold">1-Tap Auto Fill</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAKING_REWARDS_CONFIG.presets.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                class={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20'
                    : 'bg-canvas border-hairline hover:border-primary/50 text-ink shadow-soft'
                }`}
                aria-pressed={isSelected}
              >
                <div class="flex items-center justify-between">
                  <span class="text-xl" aria-hidden="true">{p.icon}</span>
                </div>
                <div>
                  <span class="font-heading font-bold text-xs block text-ink">{p.label}</span>
                  <span class="text-[10px] font-mono block mt-0.5 text-muted">{p.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* HERO VERDICT BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl border-2 shadow-soft space-y-3 bg-gradient-to-br from-emerald-500/10 via-canvas to-primary/10 border-emerald-500/40">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-white font-mono text-xs font-bold uppercase bg-emerald-600">
            🥩 {results.assetName} · {results.rateMode === 'APY' ? `${results.effectiveApy}% APY` : `${results.effectiveApr}% APR`}
          </span>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase text-primary bg-surface-strong">
            {results.compoundingLabel}
          </span>
        </div>
        <h2 class="text-2xl sm:text-4xl font-heading font-extrabold leading-tight text-emerald-700">
          {results.heroVerdict}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Initial principal of <strong>{results.stakedAmount.toLocaleString()} tokens</strong> ({sym}{results.initialFiatValue.toLocaleString()}) grows to{' '}
          <strong>{results.netEndingBalanceTokens.toFixed(4)} tokens</strong> ({sym}{results.netEndingFiatValue.toLocaleString()}) net of {results.validatorCommissionPct}% validator commission.
        </p>
        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Net Token Rewards</span>
            <span class="text-sm font-bold text-emerald-600">+{results.netRewardTokens.toFixed(4)}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Net Fiat Value</span>
            <span class="text-sm font-bold text-ink">+{sym}{results.netRewardFiatValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Total Net Yield</span>
            <span class="text-sm font-black text-emerald-600">+{results.totalRoiPct}%</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Ending Balance</span>
            <span class="text-sm font-bold text-primary">{results.netEndingBalanceTokens.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* INPUT CONTROLS & SIDE-BY-SIDE ANALYTICS */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Staking Parameters</h3>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Shareable staking scenario URL copied to clipboard!');
                  }
                }}
                class="px-3 py-1.5 bg-surface-strong hover:bg-hairline text-ink text-xs font-semibold rounded-pill transition-colors flex items-center gap-1.5 border border-hairline focus:outline-none focus:ring-2 focus:ring-primary"
                title="Copy shareable scenario URL"
              >
                <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  applyPreset(STAKING_REWARDS_CONFIG.presets[0]);
                }}
                class="px-3 py-1.5 bg-surface-strong hover:bg-hairline text-muted hover:text-ink text-xs font-semibold rounded-pill transition-colors border border-hairline focus:outline-none focus:ring-2 focus:ring-primary"
                title="Reset to defaults"
              >
                Reset
              </button>
            </div>
          </div>

          <div class="space-y-4">
            {/* ASSET NAME & CURRENCY */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="asset-name" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Staked Asset Name
                </label>
                <input
                  id="asset-name"
                  type="text"
                  value={assetName}
                  onInput={(e) => {
                    setAssetName(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-sans text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div class="space-y-1.5">
                <label for="staking-currency-select" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Quote Fiat Currency
                </label>
                <select
                  id="staking-currency-select"
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.keys(FIAT_CURRENCIES).map((code) => {
                    const c = FIAT_CURRENCIES[code];
                    return (
                      <option key={code} value={code}>
                        {c.code} ({c.symbol} - {c.name})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* STAKED AMOUNT & TOKEN PRICE */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label for="staked-amount" class="text-sm font-semibold text-ink">
                    Tokens Staked
                  </label>
                  <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                    <input
                      type="number"
                      id="staked-amount"
                      value={stakedAmount}
                      min="0"
                      step="1"
                      onInput={(e) => {
                        setStakedAmount(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-24 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                    <span class="text-xs font-mono text-muted ml-1 font-bold">Tokens</span>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label for="token-price" class="text-sm font-semibold text-ink">
                    Token Price ({sym})
                  </label>
                  <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                    <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                    <input
                      type="number"
                      id="token-price"
                      value={tokenPrice}
                      min="0"
                      step="10"
                      onInput={(e) => {
                        setTokenPrice(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-24 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RATE MODE & REWARD RATE */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                    Rate Mode
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-1 bg-surface-soft p-1 rounded-xl border border-hairline">
                  <button
                    type="button"
                    onClick={() => {
                      setRateMode('APR');
                      setActivePreset('');
                    }}
                    class={`py-1.5 px-2 rounded-lg font-heading text-xs font-bold transition-all ${
                      rateMode === 'APR'
                        ? 'bg-primary text-white shadow-soft'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    APR (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRateMode('APY');
                      setActivePreset('');
                    }}
                    class={`py-1.5 px-2 rounded-lg font-heading text-xs font-bold transition-all ${
                      rateMode === 'APY'
                        ? 'bg-primary text-white shadow-soft'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    APY (%)
                  </button>
                </div>
              </div>

              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label for="reward-rate" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                    {rateMode === 'APY' ? 'Annual APY Rate' : 'Annual APR Rate'}
                  </label>
                  <span class="text-[10px] font-mono text-primary font-bold">
                    {rateMode === 'APY' ? `≈ ${results.effectiveApr}% APR` : `≈ ${results.effectiveApy}% APY`}
                  </span>
                </div>
                <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <input
                    type="number"
                    id="reward-rate"
                    value={rewardRatePct}
                    min="0"
                    max="100"
                    step="0.1"
                    onInput={(e) => {
                      setRewardRatePct(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                  <span class="text-xs font-mono text-muted ml-1 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* COMPOUNDING FREQUENCY & DURATION */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="compounding-frequency-select" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Compounding Schedule
                </label>
                <select
                  id="compounding-frequency-select"
                  value={compoundingFrequency}
                  onChange={(e) => {
                    setCompoundingFrequency(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.keys(COMPOUNDING_FREQUENCIES).map((f) => (
                    <option key={f} value={f}>{COMPOUNDING_FREQUENCIES[f].label}</option>
                  ))}
                </select>
              </div>

              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label for="duration-months" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                    Duration (Months)
                  </label>
                  <span class="text-[10px] font-mono text-muted">{(durationMonths / 12).toFixed(1)} Years</span>
                </div>
                <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <input
                    type="number"
                    id="duration-months"
                    value={durationMonths}
                    min="1"
                    max="120"
                    step="1"
                    onInput={(e) => {
                      setDurationMonths(Number(e.currentTarget.value) || 1);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                  <span class="text-xs font-mono text-muted ml-1 font-bold">mo</span>
                </div>
              </div>
            </div>

            {/* VALIDATOR COMMISSION & ADVANCED FEES */}
            <div class="pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowAdvancedFees(!showAdvancedFees)}
                class="text-xs font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{showAdvancedFees ? '▲ Hide' : '▼ Customize'} Validator Commission, Gas Fees &amp; Unbonding Time</span>
              </button>

              {showAdvancedFees && (
                <div class="mt-4 p-4 bg-surface-soft rounded-2xl border border-hairline space-y-4">
                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label for="validator-commission" class="text-xs font-mono text-muted uppercase font-bold block">
                        Validator Commission (%)
                      </label>
                      <input
                        type="number"
                        id="validator-commission"
                        value={validatorCommissionPct}
                        min="0"
                        max="100"
                        step="0.5"
                        onInput={(e) => {
                          setValidatorCommissionPct(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label for="unbonding-days" class="text-xs font-mono text-muted uppercase font-bold block">
                        Unbonding Period (Days)
                      </label>
                      <input
                        type="number"
                        id="unbonding-days"
                        value={unbondingDays}
                        min="0"
                        step="1"
                        onInput={(e) => {
                          setUnbondingDays(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label for="fixed-fee-tokens" class="text-xs font-mono text-muted uppercase font-bold block">
                        Fixed Staking Fee (Tokens)
                      </label>
                      <input
                        type="number"
                        id="fixed-fee-tokens"
                        value={fixedFeeTokens}
                        min="0"
                        step="0.01"
                        onInput={(e) => {
                          setFixedFeeTokens(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label for="recurring-fee-tokens" class="text-xs font-mono text-muted uppercase font-bold block">
                        Recurring Monthly Fee (Tokens)
                      </label>
                      <input
                        type="number"
                        id="recurring-fee-tokens"
                        value={recurringMonthlyFeeTokens}
                        min="0"
                        step="0.01"
                        onInput={(e) => {
                          setRecurringMonthlyFeeTokens(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PERFORMANCE ANALYTICS & SCENARIOS */}
        <div class="lg:col-span-6 space-y-6">
          {/* SENSITIVITY MATRIX CARD */}
          <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
            <h3 class="text-xl font-bold font-heading text-ink">Market Price Sensitivity &amp; Downside Buffer</h3>
            
            <div class="grid grid-cols-2 gap-3 font-mono text-center">
              <div class="p-4 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Break-Even Token Price</span>
                <span class="text-base sm:text-lg font-extrabold text-primary block mt-1">
                  {sym}{results.breakEvenTokenPrice.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[10px] text-muted block mt-0.5">Capital preservation price</span>
              </div>

              <div class="p-4 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Downside Buffer</span>
                <span class="text-base sm:text-lg font-extrabold text-emerald-600 block mt-1">
                  +{results.breakEvenBufferPct}%
                </span>
                <span class="text-[10px] text-muted block mt-0.5">Price drop protected by yield</span>
              </div>
            </div>

            {/* BULL / FLAT / BEAR SCENARIO TABLE */}
            <div class="space-y-2 pt-2">
              <span class="text-xs font-mono font-bold uppercase text-muted block">
                Token Price Scenario Outcomes ({currency})
              </span>

              <div class="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                {/* Bear */}
                <div class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <span class="text-[10px] text-rose-700 uppercase font-bold block">Bear (-30%)</span>
                  <span class="text-xs text-muted block mt-0.5">{sym}{results.priceScenarios.bear.price.toLocaleString()}</span>
                  <span className={`text-sm font-bold block mt-1 ${results.priceScenarios.bear.netGainFiat >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {results.priceScenarios.bear.netGainFiat >= 0 ? '+' : ''}{sym}{results.priceScenarios.bear.netGainFiat.toLocaleString()}
                  </span>
                </div>

                {/* Flat */}
                <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <span class="text-[10px] text-blue-700 uppercase font-bold block">Constant (0%)</span>
                  <span class="text-xs text-muted block mt-0.5">{sym}{results.priceScenarios.flat.price.toLocaleString()}</span>
                  <span class="text-sm font-bold text-emerald-600 block mt-1">
                    +{sym}{results.priceScenarios.flat.netGainFiat.toLocaleString()}
                  </span>
                </div>

                {/* Bull */}
                <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <span class="text-[10px] text-emerald-700 uppercase font-bold block">Bull (+50%)</span>
                  <span class="text-xs text-muted block mt-0.5">{sym}{results.priceScenarios.bull.price.toLocaleString()}</span>
                  <span class="text-sm font-bold text-emerald-600 block mt-1">
                    +{sym}{results.priceScenarios.bull.netGainFiat.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONABLE RECOMMENDATIONS */}
          <div class="space-y-3">
            {results.recommendations.map((r, idx) => (
              <div
                key={idx}
                class={`p-4 rounded-2xl border text-xs space-y-1 ${
                  r.type === 'positive'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900'
                    : r.type === 'critical'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-900'
                    : r.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-900'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-900'
                }`}
              >
                <div class="font-bold font-heading flex items-center gap-1.5">
                  <span>{r.type === 'positive' ? '✅' : r.type === 'critical' ? '🚨' : r.type === 'warning' ? '⚠️' : '💡'}</span>
                  <span>{r.title}</span>
                </div>
                <p class="leading-relaxed text-body">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ITEMIZED REWARD & BALANCE AUDIT MATRIX */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">Comprehensive Staking Statement &amp; Yield Audit</h3>
            <p class="text-xs text-muted mt-0.5">Itemized distribution ledger of gross token yield, commissions, and net earnings across periodic timeframes</p>
          </div>
          <span class="text-xs font-mono font-bold text-primary bg-surface-strong px-3 py-1 rounded-pill border border-hairline">
            YIELD AUDIT
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline bg-surface-soft text-muted uppercase">
                <th class="py-2.5 px-3">Timeline Horizon</th>
                <th class="py-2.5 px-3 text-right">Net Token Yield</th>
                <th class="py-2.5 px-3 text-right">Validator Commission</th>
                <th class="py-2.5 px-3 text-right">Net Fiat Value ({currency})</th>
                <th class="py-2.5 px-3 text-right">Ending Token Balance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">Daily (24h)</td>
                <td class="py-2.5 px-3 text-right text-emerald-600 font-bold">+{results.dailyRewardTokens.toFixed(6)}</td>
                <td class="py-2.5 px-3 text-right text-amber-600">{(results.commissionTokens / (results.durationYears * 365 || 1)).toFixed(6)}</td>
                <td class="py-2.5 px-3 text-right font-bold text-ink">+{sym}{results.dailyRewardFiatValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</td>
                <td class="py-2.5 px-3 text-right text-muted">—</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">Monthly (30.4d)</td>
                <td class="py-2.5 px-3 text-right text-emerald-600 font-bold">+{results.monthlyRewardTokens.toFixed(5)}</td>
                <td class="py-2.5 px-3 text-right text-amber-600">{(results.commissionTokens / (results.durationMonths || 1)).toFixed(5)}</td>
                <td class="py-2.5 px-3 text-right font-bold text-ink">+{sym}{results.monthlyRewardFiatValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</td>
                <td class="py-2.5 px-3 text-right text-muted">—</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">Annual (1 Year)</td>
                <td class="py-2.5 px-3 text-right text-emerald-600 font-bold">+{results.annualRewardTokens.toFixed(4)}</td>
                <td class="py-2.5 px-3 text-right text-amber-600">{(results.commissionTokens / (results.durationYears || 1)).toFixed(4)}</td>
                <td class="py-2.5 px-3 text-right font-bold text-ink">+{sym}{results.annualRewardFiatValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</td>
                <td class="py-2.5 px-3 text-right text-muted">—</td>
              </tr>
              <tr class="border-t-2 border-hairline font-bold bg-surface-soft/60">
                <td class="py-3 px-3 text-ink uppercase text-sm">Total Staking Horizon ({results.durationMonths} Months)</td>
                <td class="py-3 px-3 text-right font-black text-sm text-emerald-600">+{results.netRewardTokens.toFixed(4)}</td>
                <td class="py-3 px-3 text-right font-bold text-xs text-amber-600">-{results.commissionTokens.toFixed(4)}</td>
                <td class="py-3 px-3 text-right font-black text-sm text-emerald-600">+{sym}{results.netRewardFiatValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</td>
                <td class="py-3 px-3 text-right font-black text-sm text-primary">{results.netEndingBalanceTokens.toFixed(4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
