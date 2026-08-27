import { useState, useMemo } from 'preact/hooks';
import { calculateNetWorth, ASSET_CATEGORIES, LIABILITY_CATEGORIES } from '../../../calculators/salary/net-worth-calculator';
import { NET_WORTH_CONFIG } from '../../../calculators/configs/net-worth-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function NetWorthFlagshipWidget() {
  const [assets, setAssets] = useState(NET_WORTH_CONFIG.defaultAssets);
  const [liabilities, setLiabilities] = useState(NET_WORTH_CONFIG.defaultLiabilities);
  const [monthlyExpenses, setMonthlyExpenses] = useState(NET_WORTH_CONFIG.defaultMonthlyExpenses);

  // Projection Scenario State
  const [enableProjection, setEnableProjection] = useState(false);
  const [assetGrowthRate, setAssetGrowthRate] = useState(8.0);
  const [annualSavings, setAnnualSavings] = useState(120000);
  const [annualDebtReduction, setAnnualDebtReduction] = useState(100000);

  // Compute Net Worth Calculations
  const results = useMemo(() => {
    const projectionParams = enableProjection
      ? { assetGrowthRate, annualSavings, annualDebtReduction }
      : null;

    return calculateNetWorth({
      assets,
      liabilities,
      monthlyExpenses,
      projectionParams,
    });
  }, [assets, liabilities, monthlyExpenses, enableProjection, assetGrowthRate, annualSavings, annualDebtReduction]);

  // Asset Handlers
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
        value: 50000,
        isLiquid: true,
      },
    ]);
  };

  const handleRemoveAsset = (id) => {
    if (assets.length <= 1) return;
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Liability Handlers
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
        categoryId: 'other_liabilities',
        balance: 20000,
      },
    ]);
  };

  const handleRemoveLiability = (id) => {
    if (liabilities.length <= 1) return;
    setLiabilities((prev) => prev.filter((l) => l.id !== id));
  };

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = NET_WORTH_CONFIG.scenarios[presetKey];
    if (p) {
      setAssets(p.assets);
      setLiabilities(p.liabilities);
      setMonthlyExpenses(p.monthlyExpenses);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
              💎 Personal Balance Sheet Engine
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Personal Net Worth Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Track your total net worth by aggregating your liquid assets, investments, real estate, and liabilities. Evaluate your solvency and liquidity health.
            </p>
          </div>
          <div class="bg-blue-900/50 border border-blue-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Total Net Worth
            </span>
            <span class={`text-3xl sm:text-4xl font-black mt-1 block font-mono ${results.isNegativeNetWorth ? 'text-rose-400' : 'text-emerald-400'}`}>
              {fmt(results.netWorth)}
            </span>
            <span class="text-xs text-blue-200 mt-1 block font-mono">
              Assets: {fmt(results.totalAssets)} · Debt: {fmt(results.totalLiabilities)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Example Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Illustrative Example Portfolios
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(NET_WORTH_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-primary block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Asset & Liability Form Managers Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Asset Manager (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Assets Section */}
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 class="text-base font-bold text-ink flex items-center gap-2">
                  <span class="text-emerald-600">🟢</span> Assets ({assets.length}/{NET_WORTH_CONFIG.fieldLimits.maxItems})
                </h3>
                <p class="text-xs text-muted">Cash, investments, real estate, and personal property.</p>
              </div>
              {assets.length < NET_WORTH_CONFIG.fieldLimits.maxItems && (
                <button
                  type="button"
                  onClick={handleAddAsset}
                  class="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label="Add new asset"
                >
                  + Add Asset
                </button>
              )}
            </div>

            <div class="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {assets.map((a, idx) => (
                <div key={a.id} class="p-3.5 rounded-xl bg-surface-soft border border-hairline space-y-2.5">
                  <div class="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={a.name}
                      onInput={(e) => handleUpdateAsset(a.id, 'name', e.currentTarget.value)}
                      class="flex-1 text-xs font-bold p-2 rounded-lg bg-canvas border border-hairline text-ink"
                    />
                    {assets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(a.id)}
                        class="text-xs font-bold text-semantic-warning hover:text-red-700 px-2 py-1"
                        aria-label={`Remove asset ${a.name}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div class="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label class="text-[11px] font-semibold text-muted block mb-1">Value (₹)</label>
                      <input
                        type="number"
                        value={a.value}
                        onInput={(e) => handleUpdateAsset(a.id, 'value', Number(e.currentTarget.value))}
                        min="0"
                        class="w-full text-xs font-mono p-2 rounded-lg bg-canvas border border-hairline text-ink"
                      />
                    </div>
                    <div>
                      <label class="text-[11px] font-semibold text-muted block mb-1">Category</label>
                      <select
                        value={a.categoryId}
                        onChange={(e) => handleUpdateAsset(a.id, 'categoryId', e.currentTarget.value)}
                        class="w-full text-xs p-2 rounded-lg bg-canvas border border-hairline text-ink"
                      >
                        {Object.values(ASSET_CATEGORIES).map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liabilities Section */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <div class="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 class="text-base font-bold text-ink flex items-center gap-2">
                  <span class="text-rose-600">🔴</span> Liabilities & Debts ({liabilities.length}/{NET_WORTH_CONFIG.fieldLimits.maxItems})
                </h3>
                <p class="text-xs text-muted">Credit cards, personal loans, mortgages, auto loans.</p>
              </div>
              {liabilities.length < NET_WORTH_CONFIG.fieldLimits.maxItems && (
                <button
                  type="button"
                  onClick={handleAddLiability}
                  class="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors"
                  aria-label="Add new liability"
                >
                  + Add Liability
                </button>
              )}
            </div>

            <div class="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {liabilities.map((l, idx) => (
                <div key={l.id} class="p-3.5 rounded-xl bg-surface-soft border border-hairline space-y-2.5">
                  <div class="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={l.name}
                      onInput={(e) => handleUpdateLiability(l.id, 'name', e.currentTarget.value)}
                      class="flex-1 text-xs font-bold p-2 rounded-lg bg-canvas border border-hairline text-ink"
                    />
                    {liabilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLiability(l.id)}
                        class="text-xs font-bold text-semantic-warning hover:text-red-700 px-2 py-1"
                        aria-label={`Remove liability ${l.name}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div class="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label class="text-[11px] font-semibold text-muted block mb-1">Balance (₹)</label>
                      <input
                        type="number"
                        value={l.balance}
                        onInput={(e) => handleUpdateLiability(l.id, 'balance', Number(e.currentTarget.value))}
                        min="0"
                        class="w-full text-xs font-mono p-2 rounded-lg bg-canvas border border-hairline text-ink"
                      />
                    </div>
                    <div>
                      <label class="text-[11px] font-semibold text-muted block mb-1">Category</label>
                      <select
                        value={l.categoryId}
                        onChange={(e) => handleUpdateLiability(l.id, 'categoryId', e.currentTarget.value)}
                        class="w-full text-xs p-2 rounded-lg bg-canvas border border-hairline text-ink"
                      >
                        {Object.values(LIABILITY_CATEGORIES).map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Essential Expenses Input */}
          <div class="pt-4 border-t border-hairline">
            <FormInputNumber
              id="monthlyExpenses"
              label="Monthly Essential Living Expenses"
              value={monthlyExpenses}
              onChange={(v) => setMonthlyExpenses(v)}
              min={0}
              max={10000000}
              step={5000}
              prefix="₹"
              helpText="Used to calculate your Emergency Liquidity Coverage ratio in months."
            />
          </div>
        </div>

        {/* Right Column: Key Ratios, Asset-Liability Distribution Bar, & Scenario (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {/* Financial Ratios Panel */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <h3 class="text-sm font-bold uppercase tracking-wider text-muted">
              Financial Position & Ratios
            </h3>

            {/* Net Worth / Assets Ratio */}
            <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-ink">Net Worth / Assets</span>
                <span class="text-sm font-mono font-extrabold text-emerald-600">
                  {results.netWorthToAssetRatio}%
                </span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                Percentage of your total assets owned free and clear of debt liabilities.
              </p>
            </div>

            {/* Debt-to-Asset Ratio */}
            <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-ink">Debt-to-Asset Ratio</span>
                <span class={`text-sm font-mono font-extrabold ${results.debtToAssetRatio > 50 ? 'text-semantic-warning' : 'text-primary'}`}>
                  {results.debtToAssetRatio}%
                </span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                Proportion of total assets financed through debt liabilities. Lower is safer.
              </p>
            </div>

            {/* Emergency Liquidity Coverage */}
            <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-ink">Emergency Liquidity Coverage</span>
                <span class="text-sm font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                  {results.liquidityCoverageMonths} Months
                </span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                Informational estimate: Approx. months of essential living expenses covered by your liquid cash and stocks ({fmt(results.liquidAssets)}).
              </p>
            </div>

            {/* Restrained CSS Asset vs Liability Distribution Bar */}
            <div class="pt-2 space-y-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-emerald-600 font-bold">Equity Net Worth ({fmt(results.netWorth)})</span>
                <span class="text-rose-600 font-bold">Debt ({fmt(results.totalLiabilities)})</span>
              </div>
              <div class="w-full h-3 bg-rose-200 dark:bg-rose-950/60 rounded-full overflow-hidden flex">
                <div
                  class="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, results.netWorthToAssetRatio))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Optional Illustrative Scenario Projections Section */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 class="text-sm font-bold text-ink">Illustrative Scenario Projections</h3>
                <p class="text-[11px] text-muted">Hypothetical scenario based on your assumptions. Not a market forecast or financial advice.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableProjection}
                  onChange={(e) => setEnableProjection(e.currentTarget.checked)}
                  class="sr-only peer"
                />
                <div class="w-9 h-5 bg-hairline peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {enableProjection && (
              <div class="space-y-4 pt-2">
                <div class="grid grid-cols-1 gap-3">
                  <div>
                    <label class="text-[11px] font-semibold text-muted block mb-1">Assumed Asset Growth Rate (% p.a.)</label>
                    <input
                      type="number"
                      value={assetGrowthRate}
                      onInput={(e) => setAssetGrowthRate(Number(e.currentTarget.value))}
                      step="0.5"
                      min="-10"
                      max="25"
                      class="w-full text-xs font-mono p-2 rounded-lg bg-surface-soft border border-hairline text-ink"
                    />
                  </div>
                  <div>
                    <label class="text-[11px] font-semibold text-muted block mb-1">Annual Savings Contribution (₹/yr)</label>
                    <input
                      type="number"
                      value={annualSavings}
                      onInput={(e) => setAnnualSavings(Number(e.currentTarget.value))}
                      step="10000"
                      min="0"
                      class="w-full text-xs font-mono p-2 rounded-lg bg-surface-soft border border-hairline text-ink"
                    />
                  </div>
                  <div>
                    <label class="text-[11px] font-semibold text-muted block mb-1">Annual Debt Reduction (₹/yr)</label>
                    <input
                      type="number"
                      value={annualDebtReduction}
                      onInput={(e) => setAnnualDebtReduction(Number(e.currentTarget.value))}
                      step="10000"
                      min="0"
                      class="w-full text-xs font-mono p-2 rounded-lg bg-surface-soft border border-hairline text-ink"
                    />
                  </div>
                </div>

                {/* Scenario Output Cards */}
                {results.projections && (
                  <div class="space-y-2 pt-2 border-t border-hairline">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-muted block">
                      Projected Net Worth Scenarios
                    </span>
                    <div class="grid grid-cols-3 gap-2 text-center font-mono">
                      {results.projections.scenarioPoints.map((pt) => (
                        <div key={pt.years} class="p-2.5 bg-surface-soft rounded-xl border border-hairline">
                          <span class="text-[10px] text-muted block">{pt.years} Years</span>
                          <span class="text-xs font-extrabold text-primary block mt-0.5">{fmt(pt.projectedNetWorth)}</span>
                        </div>
                      ))}
                    </div>
                    <p class="text-[10px] text-muted leading-tight mt-1">
                      *Illustrative scenario based on user-configured growth ({results.projections.growthRatePct}%) and contributions. Not a market prediction.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Share Actions & Financial Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Personal Net Worth Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Informational accounting tool. Net worth calculations and ratio metrics do not constitute personalized financial advice or a formal credit solvency rating.
        </p>
      </div>
    </div>
  );
}
