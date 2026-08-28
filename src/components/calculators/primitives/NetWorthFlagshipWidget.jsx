import { useState, useMemo } from 'preact/hooks';
import {
  calculateNetWorth,
  calculateInstantScenario,
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
} from '../../../calculators/salary/net-worth-calculator.js';
import { NET_WORTH_CONFIG } from '../../../calculators/configs/net-worth-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function NetWorthFlagshipWidget() {
  const [currency, setCurrency] = useState(NET_WORTH_CONFIG.defaults.currency);
  const [monthlyExpenses, setMonthlyExpenses] = useState(NET_WORTH_CONFIG.defaults.monthlyExpenses);
  const [assets, setAssets] = useState(NET_WORTH_CONFIG.defaults.assets);
  const [liabilities, setLiabilities] = useState(NET_WORTH_CONFIG.defaults.liabilities);
  const [activeTab, setActiveTab] = useState('balance_sheet'); // 'balance_sheet', 'liquidity', 'historical', 'scenario'

  // Historical Snapshots state
  const [historicalSnapshots, setHistoricalSnapshots] = useState([
    { id: 'h1', date: '2024-01-01', netWorth: 210000 },
    { id: 'h2', date: '2025-01-01', netWorth: 285000 },
  ]);
  const [newSnapshotDate, setNewSnapshotDate] = useState('2026-01-01');
  const [newSnapshotValue, setNewSnapshotValue] = useState(340000);

  // Scenario state
  const [scenario, setScenario] = useState({
    assetAppreciationPct: 8.0,
    debtPayoff: 10000,
    newInvestment: 15000,
    newDebt: 0,
    homeValueChange: 0,
    annualSavings: 18000,
    annualDebtReduction: 12000,
  });

  // URL Sync
  const urlState = useMemo(() => ({
    currency,
    monthlyExpenses,
    assetsCount: assets.length,
    liabilitiesCount: liabilities.length,
  }), [currency, monthlyExpenses, assets, liabilities]);

  useUrlSync(urlState, () => {}, {});

  const curObj = NET_WORTH_CONFIG.currencies.find((c) => c.code === currency) || NET_WORTH_CONFIG.currencies[0];
  const curSymbol = curObj.symbol;

  const formatCurr = (val) => {
    if (val === undefined || isNaN(val)) return `${curSymbol}0`;
    const sign = val < 0 ? '-' : '';
    return `${sign}${curSymbol}${Math.abs(Math.round(val)).toLocaleString()}`;
  };

  // Main Calculation Results
  const results = useMemo(() => {
    return calculateNetWorth({
      assets,
      liabilities,
      monthlyExpenses,
      historicalSnapshots,
      scenarioParams: {
        assetGrowthPct: scenario.assetAppreciationPct,
        annualSavings: scenario.annualSavings,
        annualDebtReduction: scenario.annualDebtReduction,
      },
    });
  }, [assets, liabilities, monthlyExpenses, historicalSnapshots, scenario]);

  const instantScenario = useMemo(() => {
    return calculateInstantScenario(results, scenario);
  }, [results, scenario]);

  // Asset CRUD Handlers
  const handleUpdateAsset = (id, field, value) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleAddAsset = () => {
    if (assets.length >= NET_WORTH_CONFIG.fieldLimits.maxItems) return;
    const newId = `asset_${Date.now()}`;
    setAssets((prev) => [
      ...prev,
      {
        id: newId,
        name: `Asset ${prev.length + 1}`,
        categoryId: 'cash',
        value: 10000,
        isLiquid: true,
      },
    ]);
  };

  const handleRemoveAsset = (id) => {
    if (assets.length <= 1) return;
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Liability CRUD Handlers
  const handleUpdateLiability = (id, field, value) => {
    setLiabilities((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const handleAddLiability = () => {
    if (liabilities.length >= NET_WORTH_CONFIG.fieldLimits.maxItems) return;
    const newId = `liability_${Date.now()}`;
    setLiabilities((prev) => [
      ...prev,
      {
        id: newId,
        name: `Liability ${prev.length + 1}`,
        categoryId: 'personal_loan',
        balance: 5000,
      },
    ]);
  };

  const handleRemoveLiability = (id) => {
    if (liabilities.length <= 1) return;
    setLiabilities((prev) => prev.filter((l) => l.id !== id));
  };

  // Preset Handler
  const applyPreset = (preset) => {
    setCurrency(preset.currency || 'USD');
    setMonthlyExpenses(preset.monthlyExpenses || 4500);
    setAssets(preset.assets.map((a) => ({ ...a })));
    setLiabilities(preset.liabilities.map((l) => ({ ...l })));
  };

  // Add Snapshot Handler
  const handleAddSnapshot = () => {
    if (!newSnapshotDate || isNaN(newSnapshotValue)) return;
    setHistoricalSnapshots((prev) => [
      ...prev,
      { id: `h_${Date.now()}`, date: newSnapshotDate, netWorth: Number(newSnapshotValue) },
    ]);
  };

  const handleRemoveSnapshot = (id) => {
    setHistoricalSnapshots((prev) => prev.filter((h) => h.id !== id));
  };

  // Balance bar percentages
  const debtPct = Math.min(100, results.ratios.debtToAssetRatio);
  const equityPct = Math.max(0, 100 - debtPct);

  return (
    <div class="net-worth-flagship-widget bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-8">
      {/* Educational Presets Ribbon */}
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">⚡ Wealth Balance Sheet Presets</span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 font-medium">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              class="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 outline-none"
            >
              {NET_WORTH_CONFIG.currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {NET_WORTH_CONFIG.presets.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              class="flex flex-col items-start p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-700/60 hover:border-emerald-500/50 transition-all text-left group"
            >
              <span class="text-base mb-1">{p.icon}</span>
              <span class="text-xs font-medium text-slate-200 group-hover:text-emerald-400 line-clamp-1">{p.label}</span>
              <span class="text-[10px] text-slate-400 line-clamp-1">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Decision Hero Section */}
      <div class={`bg-gradient-to-br ${
        results.totals.isNegativeNetWorth
          ? 'from-rose-950/40 via-slate-800/80 to-slate-900 border-rose-500/30'
          : 'from-emerald-950/40 via-slate-800/80 to-slate-900 border-emerald-500/30'
      } border rounded-2xl p-6 relative overflow-hidden`}>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium mb-3">
              <span>🏛️ Total Personal Balance Sheet Equity</span>
            </div>
            <h2 class="text-sm uppercase tracking-wider font-semibold text-slate-400">Total Net Worth</h2>
            <div class={`text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-1 ${
              results.totals.isNegativeNetWorth ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {formatCurr(results.totals.netWorth)}
            </div>
            <p class="text-xs text-slate-400 mt-2">
              {results.totals.isNegativeNetWorth
                ? 'Liabilities exceed gross assets. Focus on accelerating high-interest debt payoffs.'
                : `You retain ${results.ratios.netWorthToAssetRatio.toFixed(1)}% of your gross assets as personal equity.`}
            </p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
              <span class="text-[10px] uppercase font-semibold text-slate-400 block">Total Assets</span>
              <span class="text-base font-bold text-white">{formatCurr(results.totals.totalAssets)}</span>
            </div>
            <div class="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
              <span class="text-[10px] uppercase font-semibold text-slate-400 block">Total Liabilities</span>
              <span class="text-base font-bold text-rose-400">{formatCurr(results.totals.totalLiabilities)}</span>
            </div>
            <div class="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
              <span class="text-[10px] uppercase font-semibold text-slate-400 block">Liquid Net Worth</span>
              <span class={`text-base font-bold ${results.totals.liquidNetWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurr(results.totals.liquidNetWorth)}
              </span>
            </div>
            <div class="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
              <span class="text-[10px] uppercase font-semibold text-slate-400 block">Debt / Asset Ratio</span>
              <span class="text-base font-bold text-amber-400">{results.ratios.debtToAssetRatio.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Visual Balance Sheet Health Bar */}
        <div class="mt-6 pt-5 border-t border-slate-700/50 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-300 font-medium">Balance Sheet Leverage:</span>
            <span class="text-slate-300">
              <span class="text-emerald-400 font-bold">{equityPct.toFixed(1)}% Equity</span> · <span class="text-rose-400 font-bold">{debtPct.toFixed(1)}% Debt</span>
            </span>
          </div>
          <div class="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/60">
            <div style={{ width: `${equityPct}%` }} class="bg-emerald-500 h-full" title={`Equity: ${equityPct.toFixed(1)}%`} />
            <div style={{ width: `${debtPct}%` }} class="bg-rose-500 h-full" title={`Debt: ${debtPct.toFixed(1)}%`} />
          </div>
          <div class="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Home Equity: <strong class="text-white">{formatCurr(results.totals.homeEquity)}</strong></span>
            <span>Investable Assets: <strong class="text-white">{formatCurr(results.totals.investableAssets)}</strong></span>
            <span>Emergency Reserve: <strong class="text-emerald-400">{results.ratios.emergencyReserveMonths} months</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: Assets & Liabilities Itemized Editors (6 cols each) */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Asset Editor (6 cols) */}
        <div class="lg:col-span-6 space-y-4">
          <div class="p-5 bg-slate-800/50 border border-slate-700/60 rounded-2xl space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <span>🟢</span> Assets ({formatCurr(results.totals.totalAssets)})
              </h3>
              <button
                type="button"
                onClick={handleAddAsset}
                class="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
              >
                + Add Asset
              </button>
            </div>

            <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {assets.map((a) => (
                <div key={a.id} class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
                  <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div class="sm:col-span-5">
                      <input
                        type="text"
                        value={a.name}
                        onInput={(e) => handleUpdateAsset(a.id, 'name', e.target.value)}
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        placeholder="Asset Name"
                      />
                    </div>
                    <div class="sm:col-span-4">
                      <select
                        value={a.categoryId}
                        onChange={(e) => handleUpdateAsset(a.id, 'categoryId', e.target.value)}
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
                      >
                        {Object.values(ASSET_CATEGORIES).map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div class="sm:col-span-3 flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={a.value}
                        onInput={(e) => handleUpdateAsset(a.id, 'value', Number(e.target.value))}
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold text-right"
                      />
                      {assets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAsset(a.id)}
                          class="text-rose-400 hover:text-rose-300 p-1 text-xs"
                          title="Remove Asset"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={a.isLiquid}
                        onChange={(e) => handleUpdateAsset(a.id, 'isLiquid', e.target.checked)}
                        class="rounded bg-slate-800 border-slate-700 text-emerald-500 accent-emerald-500"
                      />
                      <span>Liquid / Accessible within 30 days</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Liability Editor (6 cols) */}
        <div class="lg:col-span-6 space-y-4">
          <div class="p-5 bg-slate-800/50 border border-slate-700/60 rounded-2xl space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <span>🔴</span> Liabilities ({formatCurr(results.totals.totalLiabilities)})
              </h3>
              <button
                type="button"
                onClick={handleAddLiability}
                class="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold hover:bg-rose-500/30 transition-all"
              >
                + Add Debt
              </button>
            </div>

            <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {liabilities.map((l) => (
                <div key={l.id} class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
                  <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div class="sm:col-span-5">
                      <input
                        type="text"
                        value={l.name}
                        onInput={(e) => handleUpdateLiability(l.id, 'name', e.target.value)}
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        placeholder="Liability Name"
                      />
                    </div>
                    <div class="sm:col-span-4">
                      <select
                        value={l.categoryId}
                        onChange={(e) => handleUpdateLiability(l.id, 'categoryId', e.target.value)}
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
                      >
                        {Object.values(LIABILITY_CATEGORIES).map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div class="sm:col-span-3 flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={l.balance}
                        onInput={(e) => handleUpdateLiability(l.id, 'balance', Number(e.target.value))}
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-rose-300 font-bold text-right"
                      />
                      {liabilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLiability(l.id)}
                          class="text-rose-400 hover:text-rose-300 p-1 text-xs"
                          title="Remove Debt"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly Living Expenses Input for Emergency Coverage */}
            <div class="pt-3 border-t border-slate-700/50 flex items-center justify-between">
              <div>
                <label class="block text-xs font-semibold text-slate-300">Monthly Essential Living Expenses</label>
                <span class="text-[10px] text-slate-400">Used to calculate emergency coverage months</span>
              </div>
              <div class="w-36">
                <input
                  type="number"
                  min="0"
                  value={monthlyExpenses}
                  onInput={(e) => setMonthlyExpenses(Number(e.target.value))}
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold text-right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Tabs Section */}
      <div class="space-y-4">
        {/* Tab Buttons */}
        <div class="flex border-b border-slate-800 overflow-x-auto space-x-2 pb-2">
          {[
            { id: 'balance_sheet', label: '📊 Allocation & Composition' },
            { id: 'liquidity', label: '💧 Liquidity & Concentration' },
            { id: 'historical', label: '📈 Historical Tracking' },
            { id: 'scenario', label: '🔮 Scenario & Horizon Forecast' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              class={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Allocation & Composition */}
        {activeTab === 'balance_sheet' && (
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset Allocation Breakdown */}
            <div class="p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-3">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-emerald-400">Asset Category Distribution</h4>
              <div class="space-y-2">
                {results.allocations.assets.map((item) => (
                  <div key={item.categoryId} class="space-y-1">
                    <div class="flex justify-between text-xs">
                      <span class="text-slate-300">{item.categoryName}</span>
                      <span class="font-bold text-white">{formatCurr(item.amount)} ({item.percentage}%)</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div style={{ width: `${item.percentage}%` }} class="bg-emerald-500 h-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Liability Allocation Breakdown */}
            <div class="p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-3">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-rose-400">Liability Distribution</h4>
              <div class="space-y-2">
                {results.allocations.liabilities.length > 0 ? (
                  results.allocations.liabilities.map((item) => (
                    <div key={item.categoryId} class="space-y-1">
                      <div class="flex justify-between text-xs">
                        <span class="text-slate-300">{item.categoryName}</span>
                        <span class="font-bold text-rose-300">{formatCurr(item.amount)} ({item.percentage}%)</span>
                      </div>
                      <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${item.percentage}%` }} class="bg-rose-500 h-full rounded-full" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p class="text-xs text-slate-400 italic">No debt obligations recorded. 100% debt-free.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Liquidity & Wealth Concentration */}
        {activeTab === 'liquidity' && (
          <div class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-1">
                <span class="text-xs text-slate-400 block">Liquid Assets</span>
                <span class="text-xl font-bold text-emerald-400">{formatCurr(results.totals.liquidAssets)}</span>
                <span class="text-[11px] text-slate-400 block">{results.ratios.liquidAssetPct}% of gross assets</span>
              </div>
              <div class="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-1">
                <span class="text-xs text-slate-400 block">Illiquid Assets</span>
                <span class="text-xl font-bold text-slate-200">{formatCurr(results.totals.illiquidAssets)}</span>
                <span class="text-[11px] text-slate-400 block">{results.ratios.illiquidAssetPct}% (Real Estate, Vehicles)</span>
              </div>
              <div class="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-1">
                <span class="text-xs text-slate-400 block">Emergency Cash Runway</span>
                <span class="text-xl font-bold text-blue-400">{results.ratios.emergencyReserveMonths} Months</span>
                <span class="text-[11px] text-slate-400 block">Based on {formatCurr(results.monthlyExpenses)}/mo budget</span>
              </div>
            </div>

            {/* Concentration Risk Observations */}
            <div class="p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-3">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-300">Wealth Concentration Analysis</h4>
              {results.concentrationRisks.length > 0 ? (
                <div class="space-y-2.5">
                  {results.concentrationRisks.map((risk, idx) => (
                    <div key={idx} class="p-3 bg-slate-900/80 border border-amber-500/30 rounded-xl flex items-start gap-3">
                      <span class="text-amber-400 text-base mt-0.5">⚠️</span>
                      <div>
                        <span class="text-xs font-bold text-amber-300 block">{risk.title}</span>
                        <p class="text-xs text-slate-300 mt-0.5">{risk.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div class="p-4 bg-slate-900/60 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <span>✅</span>
                  <span>Portfolio demonstrates well-balanced diversification with no severe concentration flags detected.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Historical Tracking */}
        {activeTab === 'historical' && (
          <div class="p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-5">
            <div>
              <h4 class="text-sm font-semibold text-slate-200">Historical Net Worth Progression</h4>
              <p class="text-xs text-slate-400 mt-0.5">Log historical balance sheet checkpoints to analyze net worth velocity.</p>
            </div>

            {/* Add Snapshot Row */}
            <div class="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div class="sm:col-span-5">
                <label class="block text-[10px] text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={newSnapshotDate}
                  onChange={(e) => setNewSnapshotDate(e.target.value)}
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div class="sm:col-span-5">
                <label class="block text-[10px] text-slate-400 mb-1">Net Worth ({curSymbol})</label>
                <input
                  type="number"
                  value={newSnapshotValue}
                  onInput={(e) => setNewSnapshotValue(Number(e.target.value))}
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                />
              </div>
              <div class="sm:col-span-2 pt-4">
                <button
                  type="button"
                  onClick={handleAddSnapshot}
                  class="w-full py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-all"
                >
                  + Add Point
                </button>
              </div>
            </div>

            {/* Snapshots Table */}
            {results.historicalTrends ? (
              <div class="space-y-3">
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span class="text-[10px] text-slate-400 block uppercase">Total Change</span>
                    <span class={`text-sm font-bold ${results.historicalTrends.absoluteChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {results.historicalTrends.absoluteChange >= 0 ? '+' : ''}{formatCurr(results.historicalTrends.absoluteChange)}
                    </span>
                  </div>
                  <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span class="text-[10px] text-slate-400 block uppercase">Growth %</span>
                    <span class={`text-sm font-bold ${results.historicalTrends.pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {results.historicalTrends.pctChange >= 0 ? '+' : ''}{results.historicalTrends.pctChange}%
                    </span>
                  </div>
                  {results.historicalTrends.annualizedGrowthPct > 0 && (
                    <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span class="text-[10px] text-slate-400 block uppercase">Annualized CAGR</span>
                      <span class="text-sm font-bold text-blue-400">+{results.historicalTrends.annualizedGrowthPct}%/yr</span>
                    </div>
                  )}
                </div>

                <div class="overflow-x-auto rounded-xl border border-slate-800">
                  <table class="w-full text-xs text-left">
                    <thead class="bg-slate-800/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th class="p-2.5">Date</th>
                        <th class="p-2.5 text-right">Net Worth</th>
                        <th class="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800 text-slate-200">
                      {results.historicalTrends.snapshots.map((s) => (
                        <tr key={s.id} class="hover:bg-slate-800/40">
                          <td class="p-2.5 font-medium">{s.date}</td>
                          <td class="p-2.5 text-right font-bold text-emerald-400">{formatCurr(s.netWorth)}</td>
                          <td class="p-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveSnapshot(s.id)}
                              class="text-rose-400 hover:text-rose-300 text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr class="bg-slate-800/60 font-bold">
                        <td class="p-2.5 text-white">Current (Live)</td>
                        <td class="p-2.5 text-right text-emerald-400">{formatCurr(results.totals.netWorth)}</td>
                        <td class="p-2.5 text-right text-slate-500">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p class="text-xs text-slate-400 italic">No historical points recorded. Add snapshot dates above.</p>
            )}
          </div>
        )}

        {/* TAB 4: Scenario Planner & Projections */}
        {activeTab === 'scenario' && (
          <div class="p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-6">
            <div>
              <h4 class="text-sm font-semibold text-slate-200">Hypothetical Wealth Scenario Modeling</h4>
              <p class="text-xs text-slate-400 mt-0.5">Test asset appreciation, debt acceleration, and multi-year compounding trajectories.</p>
            </div>

            {/* Scenario Controls */}
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs text-slate-300 mb-1">Annual Asset Growth (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={scenario.assetAppreciationPct}
                  onInput={(e) => setScenario({ ...scenario, assetAppreciationPct: Number(e.target.value) })}
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-300 mb-1">Annual New Savings ({curSymbol})</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={scenario.annualSavings}
                  onInput={(e) => setScenario({ ...scenario, annualSavings: Number(e.target.value) })}
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-300 mb-1">Annual Debt Payoff ({curSymbol})</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={scenario.annualDebtReduction}
                  onInput={(e) => setScenario({ ...scenario, annualDebtReduction: Number(e.target.value) })}
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                />
              </div>
            </div>

            {/* Instant Impact Card */}
            <div class="p-4 bg-slate-900/80 border border-slate-700/60 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span class="text-[10px] text-slate-400 block uppercase">Scenario Assets</span>
                <span class="text-sm font-bold text-emerald-400">{formatCurr(instantScenario.adjustedAssets)}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block uppercase">Scenario Debt</span>
                <span class="text-sm font-bold text-rose-400">{formatCurr(instantScenario.adjustedLiabilities)}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block uppercase">Scenario Net Worth</span>
                <span class="text-sm font-bold text-emerald-400">{formatCurr(instantScenario.adjustedNetWorth)}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block uppercase">Net Change</span>
                <span class={`text-sm font-bold ${instantScenario.netWorthDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {instantScenario.netWorthDelta >= 0 ? '+' : ''}{formatCurr(instantScenario.netWorthDelta)} ({instantScenario.pctChange}%)
                </span>
              </div>
            </div>

            {/* Horizon Projection Table */}
            {results.scenarioProjections && (
              <div class="space-y-3">
                <span class="text-xs font-semibold text-slate-300 block">Compounded Wealth Horizons</span>
                <div class="overflow-x-auto rounded-xl border border-slate-800">
                  <table class="w-full text-xs text-left">
                    <thead class="bg-slate-800/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th class="p-2.5">Horizon</th>
                        <th class="p-2.5 text-right">Projected Assets</th>
                        <th class="p-2.5 text-right">Remaining Debt</th>
                        <th class="p-2.5 text-right font-bold text-emerald-400">Projected Net Worth</th>
                        <th class="p-2.5 text-right text-blue-400">Wealth Gain</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800 text-slate-200">
                      {results.scenarioProjections.projectionPoints.map((pt) => (
                        <tr key={pt.years} class="hover:bg-slate-800/40">
                          <td class="p-2.5 font-medium">{pt.years} Year{pt.years > 1 ? 's' : ''}</td>
                          <td class="p-2.5 text-right">{formatCurr(pt.projectedAssets)}</td>
                          <td class="p-2.5 text-right text-rose-400">{formatCurr(pt.projectedLiabilities)}</td>
                          <td class="p-2.5 text-right font-bold text-emerald-400">{formatCurr(pt.projectedNetWorth)}</td>
                          <td class="p-2.5 text-right font-semibold text-blue-400">+{formatCurr(pt.netWorthDelta)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
