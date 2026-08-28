import { useState, useMemo } from 'preact/hooks';
import {
  calculateCryptoTax,
  FIAT_CURRENCIES,
} from '../../../calculators/crypto/crypto-tax-calculator.js';
import {
  CRYPTO_TAX_JURISDICTIONS,
  CRYPTO_TRANSACTION_TYPES,
  COST_BASIS_METHODS,
} from '../../../data/tax-rates/cryptoTaxRules.js';
import { CRYPTO_TAX_CONFIG } from '../../../calculators/configs/crypto-tax-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function CryptoTaxFlagshipWidget() {
  const [activePreset, setActivePreset] = useState('us_long_term_btc_gain');

  const [jurisdiction, setJurisdiction] = useState('US');
  const [transactionType, setTransactionType] = useState('SELL');
  const [assetName, setAssetName] = useState('Bitcoin (BTC)');
  const [quantity, setQuantity] = useState(0.5);
  const [buyPrice, setBuyPrice] = useState(35000);
  const [sellPrice, setSellPrice] = useState(68000);
  const [buyDate, setBuyDate] = useState('2024-02-10');
  const [sellDate, setSellDate] = useState('2025-05-15');
  const [buyFee, setBuyFee] = useState(20);
  const [sellFee, setSellFee] = useState(30);
  const [shortTermTaxRate, setShortTermTaxRate] = useState(24.0);
  const [longTermTaxRate, setLongTermTaxRate] = useState(15.0);
  const [incomeTaxRate, setIncomeTaxRate] = useState(24.0);
  const [rewardFmv, setRewardFmv] = useState(3000);
  const [rewardQuantity, setRewardQuantity] = useState(2.0);
  const [isRewardSoldLater, setIsRewardSoldLater] = useState(false);
  const [rewardSalePrice, setRewardSalePrice] = useState(4200);
  const [rewardSaleDate, setRewardSaleDate] = useState('2025-08-15');
  const [currency, setCurrency] = useState('USD');
  const [costBasisMethod, setCostBasisMethod] = useState('SPECIFIC_ID');
  const [showAdvancedRates, setShowAdvancedRates] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Multi-lot state
  const [isMultiLot, setIsMultiLot] = useState(false);
  const [lots, setLots] = useState([
    { id: 'lot_1', buyDate: '2024-01-15', quantity: 0.3, buyPrice: 32000, buyFee: 15 },
    { id: 'lot_2', buyDate: '2024-08-20', quantity: 0.4, buyPrice: 58000, buyFee: 20 },
    { id: 'lot_3', buyDate: '2025-01-10', quantity: 0.5, buyPrice: 62000, buyFee: 25 },
  ]);

  // URL Sync
  useUrlSync(
    {
      jurisdiction,
      transactionType,
      assetName,
      quantity,
      buyPrice,
      sellPrice,
      buyDate,
      sellDate,
      buyFee,
      sellFee,
      shortTermTaxRate,
      longTermTaxRate,
      incomeTaxRate,
      rewardFmv,
      rewardQuantity,
      currency,
      costBasisMethod,
    },
    (params) => {
      if (params.jurisdiction) setJurisdiction(params.jurisdiction);
      if (params.transactionType) setTransactionType(params.transactionType);
      if (params.assetName) setAssetName(params.assetName);
      if (params.quantity !== undefined) setQuantity(Number(params.quantity) || 1.0);
      if (params.buyPrice !== undefined) setBuyPrice(Number(params.buyPrice) || 0);
      if (params.sellPrice !== undefined) setSellPrice(Number(params.sellPrice) || 0);
      if (params.buyDate) setBuyDate(params.buyDate);
      if (params.sellDate) setSellDate(params.sellDate);
      if (params.buyFee !== undefined) setBuyFee(Number(params.buyFee) || 0);
      if (params.sellFee !== undefined) setSellFee(Number(params.sellFee) || 0);
      if (params.shortTermTaxRate !== undefined) setShortTermTaxRate(Number(params.shortTermTaxRate) || 24);
      if (params.longTermTaxRate !== undefined) setLongTermTaxRate(Number(params.longTermTaxRate) || 15);
      if (params.incomeTaxRate !== undefined) setIncomeTaxRate(Number(params.incomeTaxRate) || 24);
      if (params.currency) setCurrency(params.currency);
      if (params.costBasisMethod) setCostBasisMethod(params.costBasisMethod);
      setActivePreset('');
    }
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    if (p.jurisdiction) {
      setJurisdiction(p.jurisdiction);
      const jur = CRYPTO_TAX_JURISDICTIONS[p.jurisdiction];
      if (jur) {
        setShortTermTaxRate(jur.defaultShortTermRate);
        setLongTermTaxRate(jur.defaultLongTermRate);
        setIncomeTaxRate(jur.defaultIncomeRate);
      }
    }
    if (p.transactionType) setTransactionType(p.transactionType);
    if (p.assetName) setAssetName(p.assetName);
    if (p.quantity !== undefined) setQuantity(p.quantity);
    if (p.buyPrice !== undefined) setBuyPrice(p.buyPrice);
    if (p.sellPrice !== undefined) setSellPrice(p.sellPrice);
    if (p.buyDate) setBuyDate(p.buyDate);
    if (p.sellDate) setSellDate(p.sellDate);
    if (p.buyFee !== undefined) setBuyFee(p.buyFee);
    if (p.sellFee !== undefined) setSellFee(p.sellFee);
    if (p.rewardQuantity !== undefined) setRewardQuantity(p.rewardQuantity);
    if (p.rewardFmv !== undefined) setRewardFmv(p.rewardFmv);
    if (p.isRewardSoldLater !== undefined) setIsRewardSoldLater(p.isRewardSoldLater);
    if (p.rewardSalePrice !== undefined) setRewardSalePrice(p.rewardSalePrice);
    if (p.rewardSaleDate) setRewardSaleDate(p.rewardSaleDate);
    if (p.currency) setCurrency(p.currency);
    setIsMultiLot(false);
  };

  const handleJurisdictionChange = (newJur) => {
    setJurisdiction(newJur);
    const jur = CRYPTO_TAX_JURISDICTIONS[newJur];
    if (jur) {
      setShortTermTaxRate(jur.defaultShortTermRate);
      setLongTermTaxRate(jur.defaultLongTermRate);
      setIncomeTaxRate(jur.defaultIncomeRate);
      setCurrency(jur.currency);
    }
    setActivePreset('');
  };

  // Lot management
  const addLot = () => {
    const nextIdx = lots.length + 1;
    setLots([
      ...lots,
      { id: `lot_${nextIdx}`, buyDate: '2024-06-01', quantity: 0.5, buyPrice: 45000, buyFee: 15 },
    ]);
  };

  const updateLot = (idx, field, value) => {
    const updated = [...lots];
    updated[idx] = { ...updated[idx], [field]: value };
    setLots(updated);
  };

  const removeLot = (idx) => {
    if (lots.length <= 1) return;
    setLots(lots.filter((_, i) => i !== idx));
  };

  const results = useMemo(() => {
    return calculateCryptoTax({
      jurisdiction,
      transactionType,
      assetName,
      quantity,
      buyPrice,
      sellPrice,
      buyDate,
      sellDate,
      buyFee,
      sellFee,
      shortTermTaxRate,
      longTermTaxRate,
      incomeTaxRate,
      rewardFmv,
      rewardQuantity,
      isRewardSoldLater,
      rewardSalePrice,
      rewardSaleDate,
      currency,
      costBasisMethod: isMultiLot ? costBasisMethod : 'SPECIFIC_ID',
      lots: isMultiLot ? lots : null,
    });
  }, [
    jurisdiction,
    transactionType,
    assetName,
    quantity,
    buyPrice,
    sellPrice,
    buyDate,
    sellDate,
    buyFee,
    sellFee,
    shortTermTaxRate,
    longTermTaxRate,
    incomeTaxRate,
    rewardFmv,
    rewardQuantity,
    isRewardSoldLater,
    rewardSalePrice,
    rewardSaleDate,
    currency,
    costBasisMethod,
    isMultiLot,
    lots,
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

  const isRewardTx = transactionType === 'STAKING_REWARD' || transactionType === 'MINING_REWARD' || transactionType === 'AIRDROP';

  return (
    <div class="space-y-10">
      {/* PRESETS BAR */}
      <section class="space-y-3" role="region" aria-label="Preset Tax Scenarios">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Representative Crypto Tax Scenarios &amp; Case Studies
          </span>
          <span class="text-xs font-mono text-primary font-semibold">1-Tap Fill</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {CRYPTO_TAX_CONFIG.presets.map((p) => {
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
                  <span class="text-xs font-heading font-bold text-ink truncate">{p.label.split(':')[0]}</span>
                </div>
                <span class="text-[10px] font-sans text-muted leading-tight line-clamp-2">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* JURISDICTION SELECTOR TABS */}
      <section class="bg-surface border border-hairline rounded-3xl p-5 sm:p-6 space-y-4 shadow-soft">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-hairline pb-3">
          <div>
            <h2 class="text-base font-bold font-heading text-ink">Tax Jurisdiction &amp; Statutory Framework</h2>
            <p class="text-xs text-muted">Select your country to apply official baseline rules, holding thresholds, and exemption limits</p>
          </div>
          <span class="text-xs font-mono font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            {results.meta.jurisdictionName}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.keys(CRYPTO_TAX_JURISDICTIONS).map((jk) => {
            const jur = CRYPTO_TAX_JURISDICTIONS[jk];
            const isSelected = jurisdiction === jk;
            return (
              <button
                key={jk}
                type="button"
                onClick={() => handleJurisdictionChange(jk)}
                class={`p-3 rounded-2xl border text-left font-heading text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-soft ring-2 ring-primary/30'
                    : 'border-hairline bg-surface-soft text-ink hover:border-primary/40'
                }`}
              >
                <span class="text-base">{jur.flag}</span>
                <span class="truncate">{jur.name.split('(')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* JURISDICTION STATUTE SUMMARY CALLOUT */}
        <div class="p-3.5 bg-surface-soft border border-hairline rounded-2xl text-xs flex items-start gap-2.5">
          <span class="text-primary font-bold text-base mt-0.5">ℹ️</span>
          <div class="space-y-1 text-muted">
            <span class="font-bold text-ink block">{results.meta.statuteReference}</span>
            <p class="leading-relaxed">{results.meta.notes}</p>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS */}
        <div class="lg:col-span-6 space-y-6">
          <div class="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <h3 class="text-lg font-bold font-heading text-ink">Transaction Details</h3>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMultiLot(false)}
                  class={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                    !isMultiLot ? 'bg-primary text-white shadow-soft' : 'bg-surface-soft text-muted hover:text-ink'
                  }`}
                >
                  Single Lot
                </button>
                <button
                  type="button"
                  onClick={() => setIsMultiLot(true)}
                  class={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                    isMultiLot ? 'bg-primary text-white shadow-soft' : 'bg-surface-soft text-muted hover:text-ink'
                  }`}
                >
                  Multi-Lot (FIFO)
                </button>
              </div>
            </div>

            {/* TRANSACTION TYPE SELECTOR */}
            <div class="space-y-1.5">
              <label for="crypto-tx-type" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                Transaction Type
              </label>
              <select
                id="crypto-tx-type"
                value={transactionType}
                onChange={(e) => {
                  setTransactionType(e.currentTarget.value);
                  setActivePreset('');
                }}
                class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-heading text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Object.keys(CRYPTO_TRANSACTION_TYPES).map((k) => (
                  <option key={k} value={k}>
                    {CRYPTO_TRANSACTION_TYPES[k].label}
                  </option>
                ))}
              </select>
            </div>

            {/* ASSET NAME & CURRENCY */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="crypto-asset-label" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Cryptocurrency Asset
                </label>
                <input
                  type="text"
                  id="crypto-asset-label"
                  value={assetName}
                  onInput={(e) => {
                    setAssetName(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-sans text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div class="space-y-1.5">
                <label for="crypto-tax-currency" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Quote Currency
                </label>
                <select
                  id="crypto-tax-currency"
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

            {/* STANDARD SINGLE LOT OR SWAP FORM */}
            {!isMultiLot && !isRewardTx && (
              <>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label for="crypto-tax-qty" class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                      Quantity Disposed / Traded
                    </label>
                    <span class="text-[10px] font-mono text-muted">Tokens / Coins</span>
                  </div>
                  <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                    <input
                      type="number"
                      id="crypto-tax-qty"
                      value={quantity}
                      min="0.00000001"
                      step="0.1"
                      onInput={(e) => {
                        setQuantity(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                    <span class="text-xs font-mono text-muted ml-2 font-bold">Units</span>
                  </div>
                </div>

                {/* BUY & SELL SPOT PRICES */}
                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label for="crypto-buy-price" class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                        Acquisition Unit Price
                      </label>
                    </div>
                    <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                      <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                      <input
                        type="number"
                        id="crypto-buy-price"
                        value={buyPrice}
                        min="0"
                        step="100"
                        onInput={(e) => {
                          setBuyPrice(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label for="crypto-sell-price" class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                        Disposal / Exit Price
                      </label>
                    </div>
                    <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                      <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                      <input
                        type="number"
                        id="crypto-sell-price"
                        value={sellPrice}
                        min="0"
                        step="100"
                        onInput={(e) => {
                          setSellPrice(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* DATES FOR HOLDING PERIOD */}
                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label for="crypto-buy-date" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                      Acquisition Date
                    </label>
                    <input
                      type="date"
                      id="crypto-buy-date"
                      value={buyDate}
                      onInput={(e) => {
                        setBuyDate(e.currentTarget.value);
                        setActivePreset('');
                      }}
                      class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink focus:outline-none"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label for="crypto-sell-date" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                      Disposal Date
                    </label>
                    <input
                      type="date"
                      id="crypto-sell-date"
                      value={sellDate}
                      onInput={(e) => {
                        setSellDate(e.currentTarget.value);
                        setActivePreset('');
                      }}
                      class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink focus:outline-none"
                    />
                  </div>
                </div>

                {/* FEES */}
                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label for="crypto-buy-fee" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                      Acquisition Trading Fee ({sym})
                    </label>
                    <input
                      type="number"
                      id="crypto-buy-fee"
                      value={buyFee}
                      min="0"
                      step="5"
                      onInput={(e) => {
                        setBuyFee(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink focus:outline-none"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label for="crypto-sell-fee" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                      Disposal Trading Fee ({sym})
                    </label>
                    <input
                      type="number"
                      id="crypto-sell-fee"
                      value={sellFee}
                      min="0"
                      step="5"
                      onInput={(e) => {
                        setSellFee(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* STAKING / MINING / AIRDROP REWARD FORM */}
            {isRewardTx && (
              <div class="space-y-4 p-4 bg-surface-soft rounded-2xl border border-hairline">
                <span class="text-xs font-mono font-bold uppercase text-primary block">
                  Reward Income Recognition Parameters
                </span>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label for="reward-quantity" class="text-xs font-mono font-bold text-muted uppercase block">
                      Reward Tokens Received
                    </label>
                    <input
                      type="number"
                      id="reward-quantity"
                      value={rewardQuantity}
                      min="0.00001"
                      step="0.5"
                      onInput={(e) => {
                        setRewardQuantity(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label for="reward-fmv" class="text-xs font-mono font-bold text-muted uppercase block">
                      Spot FMV at Receipt ({sym})
                    </label>
                    <input
                      type="number"
                      id="reward-fmv"
                      value={rewardFmv}
                      min="0"
                      step="100"
                      onInput={(e) => {
                        setRewardFmv(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label for="reward-receipt-date" class="text-xs font-mono font-bold text-muted uppercase block">
                    Reward Receipt Date
                  </label>
                  <input
                    type="date"
                    id="reward-receipt-date"
                    value={buyDate}
                    onInput={(e) => {
                      setBuyDate(e.currentTarget.value);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink focus:outline-none"
                  />
                </div>

                <div class="pt-2 border-t border-hairline space-y-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRewardSoldLater}
                      onChange={(e) => setIsRewardSoldLater(e.currentTarget.checked)}
                      class="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    <span class="text-xs font-semibold text-ink">Model subsequent disposal / sale of reward tokens</span>
                  </label>

                  {isRewardSoldLater && (
                    <div class="grid sm:grid-cols-2 gap-4 pt-2">
                      <div class="space-y-1.5">
                        <label for="reward-sale-price" class="text-xs font-mono font-bold text-muted uppercase block">
                          Exit Sale Price ({sym})
                        </label>
                        <input
                          type="number"
                          id="reward-sale-price"
                          value={rewardSalePrice}
                          min="0"
                          step="100"
                          onInput={(e) => {
                            setRewardSalePrice(Number(e.currentTarget.value) || 0);
                            setActivePreset('');
                          }}
                          class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none"
                        />
                      </div>

                      <div class="space-y-1.5">
                        <label for="reward-sale-date" class="text-xs font-mono font-bold text-muted uppercase block">
                          Sale Date
                        </label>
                        <input
                          type="date"
                          id="reward-sale-date"
                          value={rewardSaleDate}
                          onInput={(e) => {
                            setRewardSaleDate(e.currentTarget.value);
                            setActivePreset('');
                          }}
                          class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MULTI-LOT INVENTORY BUILDER */}
            {isMultiLot && (
              <div class="space-y-4 p-4 bg-surface-soft rounded-2xl border border-hairline">
                <div class="flex items-center justify-between">
                  <label for="cost-basis-method-select" class="text-xs font-mono font-bold uppercase text-primary">
                    Cost Basis Accounting Method
                  </label>
                  <select
                    id="cost-basis-method-select"
                    value={costBasisMethod}
                    onChange={(e) => setCostBasisMethod(e.currentTarget.value)}
                    class="p-1.5 bg-canvas border border-hairline rounded-lg font-heading text-xs font-bold text-ink"
                  >
                    {Object.keys(COST_BASIS_METHODS).map((mk) => (
                      <option key={mk} value={mk}>
                        {COST_BASIS_METHODS[mk].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-ink">Acquisition Lots Inventory</span>
                    <button
                      type="button"
                      onClick={addLot}
                      class="text-xs font-mono font-bold text-primary hover:underline"
                    >
                      + Add Lot
                    </button>
                  </div>

                  {lots.map((lot, idx) => (
                    <div key={lot.id} class="p-2.5 bg-canvas rounded-xl border border-hairline grid grid-cols-12 gap-2 items-center text-xs">
                      <div class="col-span-3">
                        <input
                          type="date"
                          value={lot.buyDate}
                          onInput={(e) => updateLot(idx, 'buyDate', e.currentTarget.value)}
                          class="w-full p-1 bg-surface border border-hairline rounded font-mono text-[10px]"
                        />
                      </div>
                      <div class="col-span-3">
                        <input
                          type="number"
                          value={lot.quantity}
                          placeholder="Qty"
                          step="0.1"
                          onInput={(e) => updateLot(idx, 'quantity', Number(e.currentTarget.value) || 0)}
                          class="w-full p-1 bg-surface border border-hairline rounded font-mono text-right"
                        />
                      </div>
                      <div class="col-span-4">
                        <input
                          type="number"
                          value={lot.buyPrice}
                          placeholder="Price"
                          step="100"
                          onInput={(e) => updateLot(idx, 'buyPrice', Number(e.currentTarget.value) || 0)}
                          class="w-full p-1 bg-surface border border-hairline rounded font-mono text-right"
                        />
                      </div>
                      <div class="col-span-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeLot(idx)}
                          disabled={lots.length <= 1}
                          class="text-rose-500 hover:text-rose-700 disabled:opacity-30 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div class="grid sm:grid-cols-2 gap-4 pt-2 border-t border-hairline">
                  <div class="space-y-1">
                    <label for="multi-lot-total-sell" class="text-xs font-mono font-bold text-muted uppercase block">
                      Total Quantity Sold
                    </label>
                    <input
                      type="number"
                      id="multi-lot-total-sell"
                      value={quantity}
                      min="0.0001"
                      step="0.1"
                      onInput={(e) => setQuantity(Number(e.currentTarget.value) || 0)}
                      class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink"
                    />
                  </div>

                  <div class="space-y-1">
                    <label for="multi-lot-sell-price" class="text-xs font-mono font-bold text-muted uppercase block">
                      Sale Price ({sym})
                    </label>
                    <input
                      type="number"
                      id="multi-lot-sell-price"
                      value={sellPrice}
                      min="0"
                      step="100"
                      onInput={(e) => setSellPrice(Number(e.currentTarget.value) || 0)}
                      class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CUSTOM TAX RATES COLLAPSIBLE */}
            <div class="pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowAdvancedRates(!showAdvancedRates)}
                class="text-xs font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{showAdvancedRates ? '▲ Hide' : '▼ Customize'} Marginal Tax Rates &amp; Income Brackets</span>
              </button>

              {showAdvancedRates && (
                <div class="mt-4 p-4 bg-surface-soft rounded-2xl border border-hairline space-y-4">
                  <div class="grid sm:grid-cols-3 gap-3">
                    <div class="space-y-1.5">
                      <label for="short-term-rate" class="text-[11px] font-mono text-muted uppercase font-bold block">
                        Short-Term Rate (%)
                      </label>
                      <input
                        type="number"
                        id="short-term-rate"
                        value={shortTermTaxRate}
                        min="0"
                        max="100"
                        step="0.5"
                        onInput={(e) => {
                          setShortTermTaxRate(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink focus:outline-none"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label for="long-term-rate" class="text-[11px] font-mono text-muted uppercase font-bold block">
                        Long-Term Rate (%)
                      </label>
                      <input
                        type="number"
                        id="long-term-rate"
                        value={longTermTaxRate}
                        min="0"
                        max="100"
                        step="0.5"
                        onInput={(e) => {
                          setLongTermTaxRate(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink focus:outline-none"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label for="income-tax-rate" class="text-[11px] font-mono text-muted uppercase font-bold block">
                        Ordinary Income (%)
                      </label>
                      <input
                        type="number"
                        id="income-tax-rate"
                        value={incomeTaxRate}
                        min="0"
                        max="100"
                        step="0.5"
                        onInput={(e) => {
                          setIncomeTaxRate(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS & TAX AUDIT */}
        <div class="lg:col-span-6 space-y-6">
          {/* PRIMARY HERO CARD */}
          <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Estimated Tax Liability
                </span>
                <div class="flex items-baseline gap-2 mt-1">
                  <span class="text-3xl sm:text-4xl font-extrabold font-heading text-ink tracking-tight">
                    {sym}{results.summary.totalEstimatedTax.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                  </span>
                  <span class="text-xs font-mono text-muted uppercase">{currency}</span>
                </div>
              </div>

              <div class="flex flex-col items-end">
                <span class="text-xs font-mono font-bold px-3 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
                  {results.summary.effectiveTaxRatePct}% Effective Rate
                </span>
                <span class="text-[10px] font-mono text-muted mt-1">
                  {results.meta.isLongTerm ? 'Long-Term Gain' : 'Short-Term / Unified'}
                </span>
              </div>
            </div>

            {/* KPI MATRIX */}
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Realized Capital Gain</span>
                <span
                  class={`text-sm font-extrabold block mt-0.5 ${
                    results.summary.isGain ? 'text-emerald-600' : results.summary.isLoss ? 'text-rose-600' : 'text-ink'
                  }`}
                >
                  {results.summary.isGain ? '+' : ''}{sym}{results.summary.realizedGainLoss.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">Pre-tax gain/loss</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Total Cost Basis</span>
                <span class="text-sm font-extrabold text-ink block mt-0.5">
                  {sym}{results.summary.costBasis.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">Adjusted purchase</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Net Sale Proceeds</span>
                <span class="text-sm font-extrabold text-primary block mt-0.5">
                  {sym}{results.summary.netProceeds.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">Gross - sell fees</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">After-Tax Net Gain</span>
                <span
                  class={`text-sm font-extrabold block mt-0.5 ${
                    results.summary.afterTaxGain >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {results.summary.afterTaxGain >= 0 ? '+' : ''}{sym}{results.summary.afterTaxGain.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">Take-home profit</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Holding Period</span>
                <span class="text-sm font-extrabold text-amber-600 block mt-0.5">
                  {results.meta.holdingDays} Days
                </span>
                <span class="text-[9px] text-muted block">({results.meta.holdingMonths} Months)</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Trading Fees Paid</span>
                <span class="text-sm font-extrabold text-ink block mt-0.5">
                  {sym}{results.summary.totalFeesPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span class="text-[9px] text-muted block">
                  {results.meta.feesDeductible ? 'Deductible ✓' : 'Non-Deductible ✗'}
                </span>
              </div>
            </div>

            {/* JURISDICTION SPECIAL EXEMPTIONS / DISCOUNTS CARD */}
            {(results.summary.cgtExemptionApplied > 0 ||
              results.summary.cgtDiscountApplied > 0 ||
              results.meta.isTaxFreeLongTerm ||
              results.summary.tdsDeducted > 0 ||
              results.summary.incomeTaxLiability > 0) && (
              <div class="p-4 bg-surface-soft rounded-2xl border border-hairline space-y-2.5">
                <span class="text-xs font-mono font-bold uppercase text-ink block">
                  Jurisdiction Rule Adjustments &amp; Deductions
                </span>

                <div class="grid sm:grid-cols-2 gap-2 text-xs font-mono">
                  {results.meta.isTaxFreeLongTerm && (
                    <div class="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300">
                      <span class="font-bold block">✓ 100% Tax-Free Long Term</span>
                      <span class="text-[11px] block mt-0.5">Asset held &gt; 1 year in Germany (§ 23 EStG)</span>
                    </div>
                  )}

                  {results.summary.cgtExemptionApplied > 0 && (
                    <div class="p-2.5 bg-canvas border border-hairline rounded-xl">
                      <span class="text-muted block text-[10px]">Statutory Exemption Applied</span>
                      <span class="font-bold text-emerald-600 block mt-0.5">
                        -{sym}{results.summary.cgtExemptionApplied.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {results.summary.cgtDiscountApplied > 0 && (
                    <div class="p-2.5 bg-canvas border border-hairline rounded-xl">
                      <span class="text-muted block text-[10px]">50% CGT Discount (Australia)</span>
                      <span class="font-bold text-emerald-600 block mt-0.5">
                        -{sym}{results.summary.cgtDiscountApplied.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {results.summary.tdsDeducted > 0 && (
                    <div class="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-800 dark:text-amber-300">
                      <span class="text-[10px] block">1% TDS Deducted at Source (Sec 194S)</span>
                      <span class="font-bold block mt-0.5">
                        {sym}{results.summary.tdsDeducted.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {results.summary.incomeTaxLiability > 0 && (
                    <div class="p-2.5 bg-canvas border border-hairline rounded-xl">
                      <span class="text-muted block text-[10px]">Ordinary Income Tax (Staking/Mining)</span>
                      <span class="font-bold text-rose-500 block mt-0.5">
                        {sym}{results.summary.incomeTaxLiability.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MULTI-LOT MATCHING REPORT TABLE */}
          {results.matchedLotsResult && results.matchedLotsResult.matchedLots.length > 0 && (
            <div class="bg-surface border border-hairline rounded-3xl p-6 space-y-4 shadow-soft">
              <div class="flex items-center justify-between border-b border-hairline pb-3">
                <h4 class="text-sm font-bold font-heading text-ink">
                  {costBasisMethod} Lot Depletion Schedule
                </h4>
                <span class="text-xs font-mono text-muted">
                  {results.matchedLotsResult.matchedLots.length} lot(s) matched
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                      <th class="py-2 px-2.5">Lot ID</th>
                      <th class="py-2 px-2.5">Buy Date</th>
                      <th class="py-2 px-2.5">Qty Used</th>
                      <th class="py-2 px-2.5">Buy Price</th>
                      <th class="py-2 px-2.5">Cost Basis</th>
                      <th class="py-2 px-2.5">Holding</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-hairline">
                    {results.matchedLotsResult.matchedLots.map((ml) => (
                      <tr key={ml.lotId} class="hover:bg-surface-soft/60">
                        <td class="py-2 px-2.5 font-bold text-ink">{ml.lotId}</td>
                        <td class="py-2 px-2.5">{ml.buyDate}</td>
                        <td class="py-2 px-2.5 font-bold text-primary">{ml.quantityUsed}</td>
                        <td class="py-2 px-2.5">{sym}{ml.unitBuyPrice.toLocaleString()}</td>
                        <td class="py-2 px-2.5 font-bold text-ink">{sym}{ml.lotCostBasis.toLocaleString()}</td>
                        <td class="py-2 px-2.5">
                          <span
                            class={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ml.isLongTerm ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface-strong text-muted'
                            }`}
                          >
                            {ml.holdingDays}d ({ml.isLongTerm ? 'LT' : 'ST'})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ACTION BAR & LEGAL DISCLAIMER */}
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
            onClick={() => applyPreset(CRYPTO_TAX_CONFIG.presets[0])}
            class="px-4 py-2 bg-surface-strong hover:bg-surface border border-hairline text-muted hover:text-ink rounded-xl font-heading text-xs font-semibold transition-all"
          >
            Reset Defaults
          </button>
        </div>

        <p class="text-[11px] text-muted text-center sm:text-right max-w-md">
          <strong>Educational Notice:</strong> Tax calculations are mathematical estimates. Tax rules change frequently and vary by residency and specific facts. Please consult a qualified CPA or licensed tax attorney for official filing.
        </p>
      </div>
    </div>
  );
}
