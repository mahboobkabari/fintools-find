import { useState, useMemo } from 'preact/hooks';
import {
  calculateCostOfLiving,
  CURRENCY_METADATA,
} from '../../../calculators/currency/cost-of-living-calculator.js';
import { COST_OF_LIVING_CONFIG } from '../../../calculators/configs/cost-of-living-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_COL_STATE = {
  currentLocation: 'Tier-2 City / Suburban',
  targetLocation: 'Metro City (Capital)',
  currentIncome: 100000,
  targetIncome: 0,
  currency: 'INR',
  c_housing: 20000,
  c_utilities: 5000,
  c_food: 12000,
  c_transportation: 5000,
  c_healthcare: 3500,
  c_lifestyle: 6500,
  c_family: 0,
  c_miscellaneous: 3000,
  t_housing: 35000,
  t_utilities: 7500,
  t_food: 18000,
  t_transportation: 8000,
  t_healthcare: 5000,
  t_lifestyle: 10000,
  t_family: 0,
  t_miscellaneous: 4500,
};

const COL_PARAM_MAP = {
  currentLocation: 'curLoc',
  targetLocation: 'tarLoc',
  currentIncome: 'curInc',
  targetIncome: 'tarInc',
  currency: 'curr',
  c_housing: 'ch',
  c_utilities: 'cu',
  c_food: 'cf',
  c_transportation: 'ct',
  c_healthcare: 'chc',
  c_lifestyle: 'cl',
  c_family: 'cfa',
  c_miscellaneous: 'cm',
  t_housing: 'th',
  t_utilities: 'tu',
  t_food: 'tf',
  t_transportation: 'tt',
  t_healthcare: 'thc',
  t_lifestyle: 'tl',
  t_family: 'tfa',
  t_miscellaneous: 'tm',
};

export default function CostOfLivingFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_COL_STATE, COL_PARAM_MAP);
  const {
    currentLocation,
    targetLocation,
    currentIncome,
    targetIncome,
    currency,
    c_housing,
    c_utilities,
    c_food,
    c_transportation,
    c_healthcare,
    c_lifestyle,
    c_family,
    c_miscellaneous,
    t_housing,
    t_utilities,
    t_food,
    t_transportation,
    t_healthcare,
    t_lifestyle,
    t_family,
    t_miscellaneous,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'essential' | 'discretionary'

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('currentLocation', p.currentLocation);
    setParam('targetLocation', p.targetLocation);
    setParam('currentIncome', p.currentIncome);
    setParam('targetIncome', p.targetIncome || 0);
    setParam('currency', p.currency || 'INR');

    Object.keys(p.currentExpenses).forEach((k) => {
      setParam(`c_${k}`, p.currentExpenses[k]);
    });
    Object.keys(p.targetExpenses).forEach((k) => {
      setParam(`t_${k}`, p.targetExpenses[k]);
    });
  };

  const currentExpenses = useMemo(() => ({
    housing: c_housing,
    utilities: c_utilities,
    food: c_food,
    transportation: c_transportation,
    healthcare: c_healthcare,
    lifestyle: c_lifestyle,
    family: c_family,
    miscellaneous: c_miscellaneous,
  }), [
    c_housing,
    c_utilities,
    c_food,
    c_transportation,
    c_healthcare,
    c_lifestyle,
    c_family,
    c_miscellaneous,
  ]);

  const targetExpenses = useMemo(() => ({
    housing: t_housing,
    utilities: t_utilities,
    food: t_food,
    transportation: t_transportation,
    healthcare: t_healthcare,
    lifestyle: t_lifestyle,
    family: t_family,
    miscellaneous: t_miscellaneous,
  }), [
    t_housing,
    t_utilities,
    t_food,
    t_transportation,
    t_healthcare,
    t_lifestyle,
    t_family,
    t_miscellaneous,
  ]);

  const results = useMemo(() => {
    return calculateCostOfLiving({
      currentLocation,
      targetLocation,
      currentIncome,
      targetIncome,
      currency,
      currentExpenses,
      targetExpenses,
    });
  }, [
    currentLocation,
    targetLocation,
    currentIncome,
    targetIncome,
    currency,
    currentExpenses,
    targetExpenses,
  ]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleReset = () => {
    setActivePreset(null);
    resetUrlState();
  };

  const sym = results.currencyMeta.symbol;

  const filteredCategories = results.categoryBreakdown.filter((cat) => {
    if (activeTab === 'essential') return cat.isEssential;
    if (activeTab === 'discretionary') return !cat.isEssential;
    return true;
  });

  const breakdownItems = [
    {
      label: `${currentLocation} (Current Monthly Total)`,
      amount: results.currentMonthlyTotal,
      colorClass: 'bg-primary',
      desc: `Annualized: ${sym}${results.currentAnnualTotal.toLocaleString()}/yr`,
    },
    {
      label: `${targetLocation} (Target Monthly Total)`,
      amount: results.targetMonthlyTotal,
      colorClass: results.costDifferenceMonthly > 0 ? 'bg-rose-500' : 'bg-emerald-500',
      desc: `Annualized: ${sym}${results.targetAnnualTotal.toLocaleString()}/yr (${results.percentageDifference > 0 ? `+${results.percentageDifference}%` : `${results.percentageDifference}%`})`,
    },
  ];

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards
        presets={COST_OF_LIVING_CONFIG.presets}
        activePreset={activePreset}
        onSelect={applyPreset}
        label="Popular Relocation &amp; Lifestyle Corridors"
      />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-amber-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🏙️ COST OF LIVING RELOCATION VERDICT
          </span>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase text-primary bg-surface-strong">
            {results.metadata.baselineDate} · BUDGET COMPARISON
          </span>
        </div>

        <h2 class="text-2xl sm:text-4xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Current Monthly Outflow: <strong>{sym}{results.currentMonthlyTotal.toLocaleString()}</strong> ({sym}{results.currentAnnualTotal.toLocaleString()}/yr) vs Target Monthly Outflow: <strong>{sym}{results.targetMonthlyTotal.toLocaleString()}</strong> ({sym}{results.targetAnnualTotal.toLocaleString()}/yr). Equivalent target salary required: <strong>{sym}{results.equivalentTargetIncome.toLocaleString()}/mo</strong> ({sym}{(results.equivalentTargetIncome * 12).toLocaleString()}/yr).
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">{currentLocation}</span>
            <span class="text-sm font-bold text-ink">{sym}{results.currentMonthlyTotal.toLocaleString()}/mo</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">{targetLocation}</span>
            <span class="text-sm font-bold text-primary">{sym}{results.targetMonthlyTotal.toLocaleString()}/mo</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Cost Delta</span>
            <span class={`text-sm font-bold ${results.costDifferenceMonthly > 0 ? 'text-rose-600' : 'text-semantic-success'}`}>
              {results.costDifferenceMonthly > 0 ? `+${sym}${results.costDifferenceMonthly.toLocaleString()}` : `−${sym}${Math.abs(results.costDifferenceMonthly).toLocaleString()}`}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Target Equivalent CTC</span>
            <span class="text-sm font-bold text-indigo-600">{sym}{results.equivalentTargetIncome.toLocaleString()}/mo</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-7 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Itemized Expense Pillars</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Location & Income Header Controls */}
          <div class="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-soft border border-hairline">
            <div class="space-y-1.5">
              <label for="cur-loc" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                Current Location
              </label>
              <input
                id="cur-loc"
                type="text"
                value={currentLocation}
                onInput={(e) => setParam('currentLocation', e.target.value)}
                class="w-full p-2.5 bg-canvas border border-hairline rounded-xl font-sans text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div class="space-y-1.5">
              <label for="tar-loc" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                Target Location / Move
              </label>
              <input
                id="tar-loc"
                type="text"
                value={targetLocation}
                onInput={(e) => setParam('targetLocation', e.target.value)}
                class="w-full p-2.5 bg-canvas border border-hairline rounded-xl font-sans text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div class="space-y-1.5">
              <label for="cur-inc" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                Current Monthly Take-Home
              </label>
              <input
                id="cur-inc"
                type="number"
                value={currentIncome}
                onInput={(e) => setParam('currentIncome', Number(e.target.value))}
                class="w-full p-2.5 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div class="space-y-1.5">
              <label for="currency-select" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                Currency
              </label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setParam('currency', e.target.value)}
                class="w-full p-2.5 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Object.keys(CURRENCY_METADATA).map((code) => {
                  const c = CURRENCY_METADATA[code];
                  return (
                    <option key={code} value={code}>
                      {c.flag} {code} ({c.symbol})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div class="flex items-center gap-2 border-b border-hairline pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              class={`px-3 py-1.5 rounded-pill text-xs font-mono font-bold transition-all ${activeTab === 'all' ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}
            >
              All Categories (8)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('essential')}
              class={`px-3 py-1.5 rounded-pill text-xs font-mono font-bold transition-all ${activeTab === 'essential' ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}
            >
              Essential Needs (5)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('discretionary')}
              class={`px-3 py-1.5 rounded-pill text-xs font-mono font-bold transition-all ${activeTab === 'discretionary' ? 'bg-primary text-white' : 'bg-surface-strong text-muted hover:text-ink'}`}
            >
              Discretionary / Leisure (3)
            </button>
          </div>

          {/* Expense Category Inputs Grid */}
          <div class="space-y-4">
            {filteredCategories.map((cat) => (
              <div key={cat.id} class="p-4 rounded-2xl border border-hairline bg-surface-soft/40 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold font-heading text-ink flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span class={`text-[10px] font-mono px-2 py-0.5 rounded-pill font-semibold ${cat.isEssential ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                      {cat.isEssential ? 'Essential' : 'Discretionary'}
                    </span>
                  </span>
                  <span class={`text-xs font-mono font-bold ${cat.diffMonthly > 0 ? 'text-rose-600' : (cat.diffMonthly < 0 ? 'text-semantic-success' : 'text-muted')}`}>
                    {cat.diffMonthly > 0 ? `+${sym}${cat.diffMonthly.toLocaleString()} (+${cat.diffPct}%)` : (cat.diffMonthly < 0 ? `−${sym}${Math.abs(cat.diffMonthly).toLocaleString()} (${cat.diffPct}%)` : '0%')}
                  </span>
                </div>

                <div class="grid sm:grid-cols-2 gap-3">
                  <FormInputNumber
                    id={`c-${cat.id}`}
                    label={`${currentLocation}`}
                    value={cat.currentMonthly}
                    min={0}
                    max={10000000}
                    step={500}
                    prefix={sym}
                    onChange={(v) => setParam(`c_${cat.id}`, v)}
                  />
                  <FormInputNumber
                    id={`t-${cat.id}`}
                    label={`${targetLocation}`}
                    value={cat.targetMonthly}
                    min={0}
                    max={10000000}
                    step={500}
                    prefix={sym}
                    onChange={(v) => setParam(`t_${cat.id}`, v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: KPIs & Comparative Analysis */}
        <div class="lg:col-span-5 space-y-6">
          <ResultDashboard
            primaryLabel="Monthly Cost Difference"
            primaryValue={`${results.costDifferenceMonthly > 0 ? `+${sym}${results.costDifferenceMonthly.toLocaleString()}` : `−${sym}${Math.abs(results.costDifferenceMonthly).toLocaleString()}`}`}
            secondaryItems={[
              { label: 'Percentage Change', value: `${results.percentageDifference > 0 ? `+${results.percentageDifference}%` : `${results.percentageDifference}%`}` },
              { label: 'Annual Cost Difference', value: `${results.costDifferenceAnnual > 0 ? `+${sym}${results.costDifferenceAnnual.toLocaleString()}` : `−${sym}${Math.abs(results.costDifferenceAnnual).toLocaleString()}`}` },
              { label: 'Target Equivalent Income', value: `${sym}${results.equivalentTargetIncome.toLocaleString()}/mo` },
              { label: 'Target Housing Share', value: `${results.targetHousingShare}% of Budget` },
            ]}
          />

          <CostBreakdownCard
            title="Monthly Cost Comparison"
            subtitle={`${currentLocation} (${sym}${results.currentMonthlyTotal.toLocaleString()}/mo) vs ${targetLocation} (${sym}${results.targetMonthlyTotal.toLocaleString()}/mo)`}
            items={breakdownItems}
          />

          {/* Essential vs Discretionary Split Card */}
          <div class="p-6 bg-surface-soft border border-hairline rounded-3xl space-y-3">
            <h4 class="text-xs font-mono font-bold uppercase text-primary tracking-wider">
              Essential vs. Discretionary Outflow Split
            </h4>
            <div class="grid grid-cols-2 gap-3 text-center font-mono">
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Target Essentials</span>
                <span class="text-sm font-bold text-ink">{sym}{results.targetEssentialTotal.toLocaleString()}</span>
                <span class="text-[10px] text-muted block mt-0.5">{((results.targetEssentialTotal / (results.targetMonthlyTotal || 1)) * 100).toFixed(0)}% of Budget</span>
              </div>
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Target Discretionary</span>
                <span class="text-sm font-bold text-primary">{sym}{results.targetDiscretionaryTotal.toLocaleString()}</span>
                <span class="text-[10px] text-muted block mt-0.5">{((results.targetDiscretionaryTotal / (results.targetMonthlyTotal || 1)) * 100).toFixed(0)}% of Budget</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CATEGORY COMPARISON TABLE */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">
              Comprehensive Category-by-Category Audit
            </h3>
            <p class="text-xs text-muted mt-0.5">
              Direct comparison between {currentLocation} and {targetLocation}
            </p>
          </div>
          <span class="text-xs font-mono font-bold text-primary bg-surface-strong px-3 py-1 rounded-pill border border-hairline">
            DIFFERENTIAL MATRIX
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline bg-surface-soft text-muted uppercase">
                <th class="py-2.5 px-3">Expense Category</th>
                <th class="py-2.5 px-3">{currentLocation}</th>
                <th class="py-2.5 px-3">{targetLocation}</th>
                <th class="py-2.5 px-3">Monthly Delta</th>
                <th class="py-2.5 px-3">% Change</th>
                <th class="py-2.5 px-3">Target Share</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              {results.categoryBreakdown.map((row) => (
                <tr key={row.id} class="hover:bg-surface-soft/50 transition-colors">
                  <td class="py-2.5 px-3 font-bold text-ink flex items-center gap-1.5">
                    <span>{row.icon}</span>
                    <span>{row.label}</span>
                  </td>
                  <td class="py-2.5 px-3 text-ink font-semibold">{sym}{row.currentMonthly.toLocaleString()}</td>
                  <td class="py-2.5 px-3 text-primary font-bold">{sym}{row.targetMonthly.toLocaleString()}</td>
                  <td class={`py-2.5 px-3 font-bold ${row.diffMonthly > 0 ? 'text-rose-600' : (row.diffMonthly < 0 ? 'text-semantic-success' : 'text-muted')}`}>
                    {row.diffMonthly > 0 ? `+${sym}${row.diffMonthly.toLocaleString()}` : (row.diffMonthly < 0 ? `−${sym}${Math.abs(row.diffMonthly).toLocaleString()}` : '₹0')}
                  </td>
                  <td class={`py-2.5 px-3 font-bold ${row.diffPct > 0 ? 'text-rose-600' : (row.diffPct < 0 ? 'text-semantic-success' : 'text-muted')}`}>
                    {row.diffPct > 0 ? `+${row.diffPct}%` : `${row.diffPct}%`}
                  </td>
                  <td class="py-2.5 px-3 text-muted">{row.shareTargetPct}%</td>
                </tr>
              ))}
              <tr class="border-t-2 border-hairline font-bold bg-surface-soft/60">
                <td class="py-2.5 px-3 text-ink uppercase">Total Monthly Cost</td>
                <td class="py-2.5 px-3 text-ink">{sym}{results.currentMonthlyTotal.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-primary">{sym}{results.targetMonthlyTotal.toLocaleString()}</td>
                <td class={`py-2.5 px-3 ${results.costDifferenceMonthly > 0 ? 'text-rose-600' : 'text-semantic-success'}`}>
                  {results.costDifferenceMonthly > 0 ? `+${sym}${results.costDifferenceMonthly.toLocaleString()}` : `−${sym}${Math.abs(results.costDifferenceMonthly).toLocaleString()}`}
                </td>
                <td class={`py-2.5 px-3 ${results.percentageDifference > 0 ? 'text-rose-600' : 'text-semantic-success'}`}>
                  {results.percentageDifference > 0 ? `+${results.percentageDifference}%` : `${results.percentageDifference}%`}
                </td>
                <td class="py-2.5 px-3 text-ink">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ACTIONABLE RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 6. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="The 30% Housing Budget Rule"
          value={`${results.targetHousingShare}% Target Share`}
          subtitle="Financial planners recommend keeping total housing costs below 30% to 35% of your gross income to preserve long-term investing bandwidth."
          badgeText="Rule of Thumb"
          badgeColorClass={results.targetHousingShare > 35 ? 'bg-rose-500' : 'bg-primary'}
        />
        <InsightCard
          title="Geo-Arbitrage Wealth Compounding"
          value="Relocation Multiplier"
          subtitle="Moving to a 20%-30% lower cost location while preserving remote salary can increase your annual savings rate by 2x to 3x."
          badgeText="Strategy"
          badgeColorClass="bg-emerald-500"
        />
      </div>

      {/* 7. EXECUTIVE VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 RELOCATION COST AUDIT VOUCHER</span>
          <span class="text-xs text-muted font-mono">{currentLocation} ⇄ {targetLocation}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Current Monthly</span>
            <span class="text-base font-bold text-ink">{sym}{results.currentMonthlyTotal.toLocaleString()}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Target Monthly</span>
            <span class="text-base font-bold text-primary">{sym}{results.targetMonthlyTotal.toLocaleString()}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Net Difference</span>
            <span class={`text-base font-bold ${results.costDifferenceMonthly > 0 ? 'text-rose-600' : 'text-semantic-success'}`}>
              {results.costDifferenceMonthly > 0 ? `+${sym}${results.costDifferenceMonthly.toLocaleString()}` : `−${sym}${Math.abs(results.costDifferenceMonthly).toLocaleString()}`}
            </span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Target Salary Parity</span>
            <span class="text-base font-bold text-indigo-600">{sym}{results.equivalentTargetIncome.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
