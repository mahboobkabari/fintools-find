import { useState, useMemo } from 'preact/hooks';
import {
  calculateGasFee,
  TRANSACTION_TYPES,
  FIAT_CURRENCIES,
} from '../../../calculators/crypto/gas-fee-calculator.js';
import { GAS_FEE_CONFIG } from '../../../calculators/configs/gas-fee-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function GasFeeFlagshipWidget() {
  const [activePreset, setActivePreset] = useState('simple_eth_transfer');

  const [feeModel, setFeeModel] = useState('EIP_1559');
  const [transactionType, setTransactionType] = useState('SIMPLE_TRANSFER');
  const [gasLimit, setGasLimit] = useState(21000);
  const [gasUsed, setGasUsed] = useState(21000);
  const [baseFeeGwei, setBaseFeeGwei] = useState(15);
  const [priorityFeeGwei, setPriorityFeeGwei] = useState(1.5);
  const [maxFeeGwei, setMaxFeeGwei] = useState(25);
  const [legacyGasPriceGwei, setLegacyGasPriceGwei] = useState(25);
  const [nativeTokenPrice, setNativeTokenPrice] = useState(2500);
  const [nativeTokenSymbol, setNativeTokenSymbol] = useState('ETH');
  const [currency, setCurrency] = useState('USD');
  const [transactionCount, setTransactionCount] = useState(1);
  const [transactionValueFiat, setTransactionValueFiat] = useState(500);
  const [maxAcceptableCostPct, setMaxAcceptableCostPct] = useState(2.0);
  const [gasBudgetFiat, setGasBudgetFiat] = useState(100);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // URL Sync
  useUrlSync(
    {
      feeModel,
      transactionType,
      gasLimit,
      gasUsed,
      baseFeeGwei,
      priorityFeeGwei,
      maxFeeGwei,
      legacyGasPriceGwei,
      nativeTokenPrice,
      nativeTokenSymbol,
      currency,
      transactionCount,
      transactionValueFiat,
      maxAcceptableCostPct,
      gasBudgetFiat,
    },
    (params) => {
      if (params.feeModel) setFeeModel(params.feeModel);
      if (params.transactionType) setTransactionType(params.transactionType);
      if (params.gasLimit !== undefined) setGasLimit(Number(params.gasLimit) || 21000);
      if (params.gasUsed !== undefined) setGasUsed(Number(params.gasUsed) || 21000);
      if (params.baseFeeGwei !== undefined) setBaseFeeGwei(Number(params.baseFeeGwei) || 15);
      if (params.priorityFeeGwei !== undefined) setPriorityFeeGwei(Number(params.priorityFeeGwei) || 1.5);
      if (params.maxFeeGwei !== undefined) setMaxFeeGwei(Number(params.maxFeeGwei) || 25);
      if (params.legacyGasPriceGwei !== undefined) setLegacyGasPriceGwei(Number(params.legacyGasPriceGwei) || 25);
      if (params.nativeTokenPrice !== undefined) setNativeTokenPrice(Number(params.nativeTokenPrice) || 2500);
      if (params.nativeTokenSymbol) setNativeTokenSymbol(params.nativeTokenSymbol);
      if (params.currency) setCurrency(params.currency);
      if (params.transactionCount !== undefined) setTransactionCount(Number(params.transactionCount) || 1);
      if (params.transactionValueFiat !== undefined) setTransactionValueFiat(Number(params.transactionValueFiat) || 500);
      if (params.maxAcceptableCostPct !== undefined) setMaxAcceptableCostPct(Number(params.maxAcceptableCostPct) || 2.0);
      if (params.gasBudgetFiat !== undefined) setGasBudgetFiat(Number(params.gasBudgetFiat) || 100);
      setActivePreset('');
    }
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    if (p.feeModel) setFeeModel(p.feeModel);
    if (p.transactionType) setTransactionType(p.transactionType);
    if (p.gasLimit !== undefined) setGasLimit(p.gasLimit);
    if (p.gasUsed !== undefined) setGasUsed(p.gasUsed);
    if (p.baseFeeGwei !== undefined) setBaseFeeGwei(p.baseFeeGwei);
    if (p.priorityFeeGwei !== undefined) setPriorityFeeGwei(p.priorityFeeGwei);
    if (p.maxFeeGwei !== undefined) setMaxFeeGwei(p.maxFeeGwei);
    if (p.legacyGasPriceGwei !== undefined) setLegacyGasPriceGwei(p.legacyGasPriceGwei);
    if (p.nativeTokenPrice !== undefined) setNativeTokenPrice(p.nativeTokenPrice);
    if (p.nativeTokenSymbol) setNativeTokenSymbol(p.nativeTokenSymbol);
    if (p.currency) setCurrency(p.currency);
    if (p.transactionCount !== undefined) setTransactionCount(p.transactionCount);
    if (p.transactionValueFiat !== undefined) setTransactionValueFiat(p.transactionValueFiat);
  };

  const handleTxTypeChange = (typeKey) => {
    setTransactionType(typeKey);
    const selected = TRANSACTION_TYPES[typeKey];
    if (selected && typeKey !== 'CUSTOM') {
      setGasLimit(selected.defaultGasLimit);
      setGasUsed(selected.defaultGasUsed);
    }
    setActivePreset('');
  };

  const results = useMemo(() => {
    return calculateGasFee({
      feeModel,
      transactionType,
      gasLimit,
      gasUsed,
      baseFeeGwei,
      priorityFeeGwei,
      maxFeeGwei,
      legacyGasPriceGwei,
      nativeTokenPrice,
      nativeTokenSymbol,
      currency,
      transactionCount,
      transactionValueFiat,
      maxAcceptableCostPct,
      gasBudgetFiat,
    });
  }, [
    feeModel,
    transactionType,
    gasLimit,
    gasUsed,
    baseFeeGwei,
    priorityFeeGwei,
    maxFeeGwei,
    legacyGasPriceGwei,
    nativeTokenPrice,
    nativeTokenSymbol,
    currency,
    transactionCount,
    transactionValueFiat,
    maxAcceptableCostPct,
    gasBudgetFiat,
  ]);

  const currMeta = FIAT_CURRENCIES[currency] || FIAT_CURRENCIES.USD;
  const sym = currMeta.symbol;
  const decimals = currMeta.decimals;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  return (
    <div class="space-y-10">
      {/* PRESET SCENARIO SELECTOR */}
      <section class="space-y-3" role="region" aria-label="Preset Gas Scenarios">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Representative EVM Gas Scenarios
          </span>
          <span class="text-xs font-mono text-primary font-semibold">1-Tap Fill</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {GAS_FEE_CONFIG.presets.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                class={`p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                    : 'border-hairline bg-surface hover:border-primary/40 hover:bg-surface-soft'
                }`}
              >
                <div class="flex items-center gap-1.5 mb-1">
                  <span class="text-base">{p.icon}</span>
                  <span class="text-xs font-heading font-bold text-ink truncate">{p.label}</span>
                </div>
                <span class="text-[10px] font-sans text-muted leading-tight line-clamp-2">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS & GAS INPUTS */}
        <div class="lg:col-span-6 space-y-6">
          <div class="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <h3 class="text-lg font-bold font-heading text-ink">EVM Transaction Parameters</h3>
              <div class="flex items-center gap-1.5 bg-surface-soft p-1 rounded-xl border border-hairline">
                <button
                  type="button"
                  onClick={() => {
                    setFeeModel('EIP_1559');
                    setActivePreset('');
                  }}
                  class={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    feeModel === 'EIP_1559'
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  EIP-1559
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFeeModel('LEGACY');
                    setActivePreset('');
                  }}
                  class={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    feeModel === 'LEGACY'
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Legacy (Type 0)
                </button>
              </div>
            </div>

            {/* TRANSACTION ARCHETYPE SELECTOR */}
            <div class="space-y-1.5">
              <label for="tx-type-select" class="text-[11px] font-mono font-bold text-muted uppercase tracking-wider block">
                Transaction Archetype
              </label>
              <select
                id="tx-type-select"
                value={transactionType}
                onChange={(e) => handleTxTypeChange(e.currentTarget.value)}
                class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-heading text-xs font-bold text-ink"
              >
                {Object.keys(TRANSACTION_TYPES).map((k) => (
                  <option key={k} value={k}>
                    {TRANSACTION_TYPES[k].label} ({TRANSACTION_TYPES[k].defaultGasUsed.toLocaleString()} gas)
                  </option>
                ))}
              </select>
            </div>

            {/* GAS UNITS: LIMIT VS ACTUAL USED */}
            <div class="p-4 bg-surface-soft rounded-2xl border border-hairline space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-ink uppercase">
                  Gas Units (Execution vs Ceiling)
                </span>
                <span class="text-xs font-mono text-muted">
                  {results.meta.unusedGasUnits.toLocaleString()} Unused Gas Units
                </span>
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <div class="flex justify-between">
                    <label for="gas-used-input" class="text-[10px] font-mono text-muted uppercase">
                      Actual Gas Used
                    </label>
                    <span class="text-xs font-mono font-bold text-primary">{gasUsed.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    id="gas-used-input"
                    value={gasUsed}
                    min="21000"
                    max="30000000"
                    step="1000"
                    onInput={(e) => {
                      const val = Number(e.currentTarget.value) || 21000;
                      setGasUsed(val);
                      if (val > gasLimit) setGasLimit(val);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                  />
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between">
                    <label for="gas-limit-input" class="text-[10px] font-mono text-muted uppercase">
                      Gas Limit Ceiling
                    </label>
                    <span class="text-xs font-mono font-bold text-ink">{gasLimit.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    id="gas-limit-input"
                    value={gasLimit}
                    min="21000"
                    max="30000000"
                    step="1000"
                    onInput={(e) => {
                      setGasLimit(Number(e.currentTarget.value) || 21000);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                  />
                </div>
              </div>
            </div>

            {/* GAS PRICE / EIP-1559 PARAMETERS */}
            {feeModel === 'EIP_1559' ? (
              <div class="p-4 bg-surface-soft rounded-2xl border border-hairline space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-primary uppercase">
                    EIP-1559 Fee Schedule (Gwei)
                  </span>
                  <span class="text-xs font-mono font-bold text-ink">
                    Effective: {results.meta.effectiveGasPriceGwei} Gwei
                  </span>
                </div>

                <div class="grid grid-cols-3 gap-3">
                  <div class="space-y-1">
                    <label for="base-fee-input" class="text-[10px] font-mono text-muted uppercase block truncate">
                      Base Fee (Gwei)
                    </label>
                    <input
                      type="number"
                      id="base-fee-input"
                      value={baseFeeGwei}
                      min="0"
                      step="1"
                      onInput={(e) => {
                        setBaseFeeGwei(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                    />
                  </div>

                  <div class="space-y-1">
                    <label for="priority-fee-input" class="text-[10px] font-mono text-muted uppercase block truncate">
                      Priority Tip (Gwei)
                    </label>
                    <input
                      type="number"
                      id="priority-fee-input"
                      value={priorityFeeGwei}
                      min="0"
                      step="0.5"
                      onInput={(e) => {
                        setPriorityFeeGwei(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                    />
                  </div>

                  <div class="space-y-1">
                    <label for="max-fee-input" class="text-[10px] font-mono text-muted uppercase block truncate">
                      Max Fee (Gwei)
                    </label>
                    <input
                      type="number"
                      id="max-fee-input"
                      value={maxFeeGwei}
                      min="0"
                      step="1"
                      onInput={(e) => {
                        setMaxFeeGwei(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div class="p-4 bg-surface-soft rounded-2xl border border-hairline space-y-2">
                <div class="flex items-center justify-between">
                  <label for="legacy-price-input" class="text-xs font-mono font-bold text-primary uppercase">
                    Legacy Gas Price (Gwei)
                  </label>
                  <span class="text-xs font-mono font-bold text-ink">{legacyGasPriceGwei} Gwei</span>
                </div>
                <input
                  type="number"
                  id="legacy-price-input"
                  value={legacyGasPriceGwei}
                  min="0"
                  step="1"
                  onInput={(e) => {
                    setLegacyGasPriceGwei(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                />
              </div>
            )}

            {/* NATIVE TOKEN PRICE & FIAT CURRENCY */}
            <div class="grid sm:grid-cols-3 gap-3">
              <div class="space-y-1">
                <label for="token-sym-input" class="text-[11px] font-mono font-bold text-muted uppercase block">
                  Token Symbol
                </label>
                <input
                  type="text"
                  id="token-sym-input"
                  value={nativeTokenSymbol}
                  onInput={(e) => {
                    setNativeTokenSymbol(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink"
                />
              </div>

              <div class="space-y-1">
                <label for="token-price-input" class="text-[11px] font-mono font-bold text-muted uppercase block">
                  {nativeTokenSymbol} Spot Price ({sym})
                </label>
                <input
                  type="number"
                  id="token-price-input"
                  value={nativeTokenPrice}
                  min="0.0001"
                  step="100"
                  onInput={(e) => {
                    setNativeTokenPrice(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                />
              </div>

              <div class="space-y-1">
                <label for="fiat-currency-select" class="text-[11px] font-mono font-bold text-muted uppercase block">
                  Quote Currency
                </label>
                <select
                  id="fiat-currency-select"
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink"
                >
                  {Object.keys(FIAT_CURRENCIES).map((c) => (
                    <option key={c} value={c}>
                      {c} ({FIAT_CURRENCIES[c].symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* BATCH TX COUNT & TRANSACTION VALUE */}
            <div class="grid sm:grid-cols-2 gap-4 pt-2 border-t border-hairline">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label for="tx-count-input" class="text-[11px] font-mono font-bold text-muted uppercase">
                    Batch Count (Txs)
                  </label>
                  <span class="text-xs font-mono font-bold text-ink">{transactionCount} Txs</span>
                </div>
                <input
                  type="number"
                  id="tx-count-input"
                  value={transactionCount}
                  min="1"
                  max="100000"
                  step="1"
                  onInput={(e) => {
                    setTransactionCount(Number(e.currentTarget.value) || 1);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                />
              </div>

              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label for="tx-value-input" class="text-[11px] font-mono font-bold text-muted uppercase">
                    Transfer Value ({sym})
                  </label>
                  <span class="text-xs font-mono font-bold text-primary">{sym}{transactionValueFiat.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  id="tx-value-input"
                  value={transactionValueFiat}
                  min="0"
                  step="100"
                  onInput={(e) => {
                    setTransactionValueFiat(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS & BENCHMARK MATRIX */}
        <div class="lg:col-span-6 space-y-6">
          {/* PRIMARY HERO METRIC CARD */}
          <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Estimated Actual Gas Fee (1 Tx)
                </span>
                <div class="flex items-baseline gap-2 mt-1">
                  <span class="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-primary">
                    {sym}{results.singleTransaction.actualGasCostFiat.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                  </span>
                  <span class="text-xs font-mono text-muted">
                    ({results.singleTransaction.actualGasCostNative} {nativeTokenSymbol})
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end">
                <span class="text-xs font-mono font-bold px-3 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
                  {results.meta.effectiveGasPriceGwei} Gwei Effective
                </span>
                <span class="text-[10px] font-mono text-muted mt-1">
                  {results.economics.gasCostRatioPct.toFixed(2)}% of Transfer Value
                </span>
              </div>
            </div>

            {/* THREE-WAY COST DECOMPOSITION */}
            <div class="grid grid-cols-3 gap-3 font-mono text-xs">
              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Base Fee (Burned)</span>
                <span class="text-sm sm:text-base font-extrabold text-rose-600 block mt-0.5">
                  {sym}{results.singleTransaction.baseFeeCostFiat.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">({results.meta.effectiveBaseFeeGwei} Gwei)</span>
              </div>

              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Priority Tip (Miner)</span>
                <span class="text-sm sm:text-base font-extrabold text-emerald-600 block mt-0.5">
                  {sym}{results.singleTransaction.priorityFeeCostFiat.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">({results.meta.effectivePriorityFeeGwei} Gwei)</span>
              </div>

              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Batch Total ({transactionCount}x)</span>
                <span class="text-sm sm:text-base font-extrabold text-ink block mt-0.5">
                  {sym}{results.batch.totalBatchFiatCost.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">({results.batch.totalBatchNativeCost} {nativeTokenSymbol})</span>
              </div>
            </div>

            {/* GAS CEILING VS UNUSED REFUND */}
            <div class="p-4 bg-surface-soft rounded-2xl border border-hairline space-y-2.5 font-mono text-xs">
              <div class="flex items-center justify-between">
                <span class="text-muted">Max Potential Cost (Ceiling):</span>
                <span class="font-bold text-ink">
                  {sym}{results.singleTransaction.maxPotentialCostFiat.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ({results.singleTransaction.maxPotentialCostNative} {nativeTokenSymbol})
                </span>
              </div>

              <div class="flex items-center justify-between border-t border-hairline pt-2 text-emerald-600">
                <span>Unused Gas Refund Savings:</span>
                <span class="font-bold">
                  +{sym}{results.singleTransaction.unusedGasRefundFiat.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ({results.meta.unusedGasUnits.toLocaleString()} Gas Units)
                </span>
              </div>

              <div class="flex items-center justify-between border-t border-hairline pt-2">
                <span class="text-muted">Break-Even Transfer Value (@ {results.economics.maxAcceptableCostPct}% Max Drag):</span>
                <span class="font-bold text-ink">
                  {sym}{results.economics.breakEvenTxValueFiat.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
              </div>
            </div>
          </div>

          {/* GAS BUDGET CAPACITY PLANNER */}
          <div class="bg-surface border border-hairline rounded-3xl p-6 space-y-4 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-2">
              <h4 class="text-sm font-bold font-heading text-ink">Gas Budget Capacity Planner</h4>
              <div class="flex items-center gap-1.5 font-mono text-xs">
                <label for="gas-budget-input" class="text-muted">Budget ({sym}):</label>
                <input
                  type="number"
                  id="gas-budget-input"
                  value={gasBudgetFiat}
                  min="1"
                  step="25"
                  onInput={(e) => {
                    setGasBudgetFiat(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-20 p-1 bg-surface-strong border border-hairline rounded text-right font-bold text-ink"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3 text-center font-mono text-xs">
              <div class="p-3 bg-surface-soft rounded-xl">
                <span class="text-[10px] text-muted uppercase font-bold block">Max Affordable Txs</span>
                <span class="text-lg font-extrabold text-primary block mt-0.5">
                  {results.budget.maxTransactions} Txs
                </span>
              </div>
              <div class="p-3 bg-surface-soft rounded-xl">
                <span class="text-[10px] text-muted uppercase font-bold block">Total Gas Spent</span>
                <span class="text-sm font-extrabold text-ink block mt-1">
                  {sym}{results.budget.totalSpentFiat.toLocaleString()}
                </span>
              </div>
              <div class="p-3 bg-surface-soft rounded-xl">
                <span class="text-[10px] text-muted uppercase font-bold block">Remaining Budget</span>
                <span class="text-sm font-extrabold text-emerald-600 block mt-1">
                  {sym}{results.budget.remainingBudgetFiat.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* TRANSACTION SCENARIO BENCHMARK TABLE */}
          <div class="bg-surface border border-hairline rounded-3xl p-6 space-y-4 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-2">
              <h4 class="text-sm font-bold font-heading text-ink">Transaction Cost Matrix (@ {results.meta.effectiveGasPriceGwei} Gwei)</h4>
              <span class="text-xs font-mono text-muted">1 {nativeTokenSymbol} = {sym}{nativeTokenPrice.toLocaleString()}</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                    <th class="py-2 px-2.5">Archetype</th>
                    <th class="py-2 px-2.5">Est. Gas</th>
                    <th class="py-2 px-2.5">{nativeTokenSymbol} Cost</th>
                    <th class="py-2 px-2.5">Fiat Cost</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-hairline">
                  {results.scenarioEstimates.map((s) => (
                    <tr key={s.type} class="hover:bg-surface-soft/60 transition-colors">
                      <td class="py-2 px-2.5 text-ink font-semibold">{s.type}</td>
                      <td class="py-2 px-2.5 text-muted">{s.gas.toLocaleString()}</td>
                      <td class="py-2 px-2.5 text-primary">{s.nativeCost.toFixed(6)}</td>
                      <td class="py-2 px-2.5 font-bold text-ink">{sym}{s.fiatCost.toFixed(decimals)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR & DISCLAIMER */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface-soft border border-hairline rounded-2xl">
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            class="px-4 py-2 bg-surface-strong hover:bg-surface border border-hairline text-ink rounded-xl font-heading text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>{copiedUrl ? '✓ Link Copied!' : '🔗 Share Scenario URL'}</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset(GAS_FEE_CONFIG.presets[0])}
            class="px-4 py-2 bg-surface-strong hover:bg-surface border border-hairline text-muted hover:text-ink rounded-xl font-heading text-xs font-semibold transition-all"
          >
            Reset Defaults
          </button>
        </div>

        <p class="text-[11px] text-muted text-center sm:text-right max-w-md">
          <strong>EVM Analytical Notice:</strong> Gas consumption varies with smart contract state and network congestion. Calculations represent user-entered simulation parameters and do not connect to live blockchain RPC nodes.
        </p>
      </div>
    </div>
  );
}
