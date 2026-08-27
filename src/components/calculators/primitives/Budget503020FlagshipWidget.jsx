import { useState, useMemo } from 'preact/hooks';
import { calculate503020BudgetCalculator, BUDGET_FRAMEWORKS } from '../../../calculators/salary/50-30-20-budget-calculator.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_BUDGET_STATE = {
  monthlyIncome: 100000,
  ruleFramework: '50_30_20',
  customNeedsPct: 50,
  customWantsPct: 30,
  customSavingsPct: 20,
  actualRent: 25000,
  actualGroceries: 12000,
  actualUtilities: 6000,
  actualInsurance: 4000,
  actualTransport: 5000,
  actualDining: 10000,
  actualEntertainment: 6000,
  actualShopping: 8000,
  actualVacation: 4000,
  actualInvestments: 15000,
  actualEmergencyFund: 5000,
  expectedReturnRate: 12,
  currencySymbol: '₹',
};

const BUDGET_PARAM_MAP = {
  monthlyIncome: 'inc',
  ruleFramework: 'rf',
  customNeedsPct: 'cn',
  customWantsPct: 'cw',
  customSavingsPct: 'cs',
  actualRent: 'rent',
  actualGroceries: 'groc',
  actualUtilities: 'util',
  actualInsurance: 'ins',
  actualTransport: 'tr',
  actualDining: 'dine',
  actualEntertainment: 'ent',
  actualShopping: 'shop',
  actualVacation: 'vac',
  actualInvestments: 'inv',
  actualEmergencyFund: 'emf',
  expectedReturnRate: 'cagr',
  currencySymbol: 'cur',
};

export default function Budget503020FlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_BUDGET_STATE, BUDGET_PARAM_MAP);
  const {
    monthlyIncome,
    ruleFramework,
    customNeedsPct,
    customWantsPct,
    customSavingsPct,
    actualRent,
    actualGroceries,
    actualUtilities,
    actualInsurance,
    actualTransport,
    actualDining,
    actualEntertainment,
    actualShopping,
    actualVacation,
    actualInvestments,
    actualEmergencyFund,
    expectedReturnRate,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Demographic Presets
  const presets = [
    { id: 'young', label: 'Young Pro (₹40K)', icon: '💼', monthlyIncome: 40000, ruleFramework: '50_30_20', actualRent: 12000, actualGroceries: 4000, actualUtilities: 2000, actualInsurance: 1000, actualTransport: 1000, actualDining: 4000, actualEntertainment: 3000, actualShopping: 3000, actualVacation: 2000, actualInvestments: 6000, actualEmergencyFund: 2000, expectedReturnRate: 12, currencySymbol: '₹', desc: '50% Needs · 20% Savings' },
    { id: 'metro', label: 'Metro Family (₹1.5L)', icon: '👨‍👩‍👧', monthlyIncome: 150000, ruleFramework: '60_20_20', actualRent: 45000, actualGroceries: 20000, actualUtilities: 10000, actualInsurance: 8000, actualTransport: 7000, actualDining: 12000, actualEntertainment: 8000, actualShopping: 6000, actualVacation: 4000, actualInvestments: 22000, actualEmergencyFund: 8000, expectedReturnRate: 12, currencySymbol: '₹', desc: '60/20/20 Metro Living' },
    { id: 'dink', label: 'DINK Couple (₹2.5L)', icon: '👫', monthlyIncome: 250000, ruleFramework: '50_30_20', actualRent: 60000, actualGroceries: 25000, actualUtilities: 15000, actualInsurance: 12000, actualTransport: 13000, actualDining: 25000, actualEntertainment: 18000, actualShopping: 20000, actualVacation: 12000, actualInvestments: 40000, actualEmergencyFund: 10000, expectedReturnRate: 12, currencySymbol: '₹', desc: '₹50K/mo Wealth SIP' },
    { id: 'fire', label: 'FIRE Saver (₹1.2L)', icon: '🔥', monthlyIncome: 120000, ruleFramework: '40_20_40', actualRent: 24000, actualGroceries: 12000, actualUtilities: 5000, actualInsurance: 4000, actualTransport: 3000, actualDining: 8000, actualEntertainment: 6000, actualShopping: 6000, actualVacation: 4000, actualInvestments: 40000, actualEmergencyFund: 8000, expectedReturnRate: 12, currencySymbol: '₹', desc: '40% Aggressive Savings' },
    { id: 'debt', label: 'Debt Turnaround (₹80K)', icon: '📉', monthlyIncome: 80000, ruleFramework: '70_20_10', actualRent: 30000, actualGroceries: 12000, actualUtilities: 6000, actualInsurance: 4000, actualTransport: 4000, actualDining: 6000, actualEntertainment: 4000, actualShopping: 3000, actualVacation: 3000, actualInvestments: 6000, actualEmergencyFund: 2000, expectedReturnRate: 10, currencySymbol: '₹', desc: '70% Debt & Living' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('monthlyIncome', p.monthlyIncome);
    setParam('ruleFramework', p.ruleFramework);
    setParam('actualRent', p.actualRent);
    setParam('actualGroceries', p.actualGroceries);
    setParam('actualUtilities', p.actualUtilities);
    setParam('actualInsurance', p.actualInsurance);
    setParam('actualTransport', p.actualTransport);
    setParam('actualDining', p.actualDining);
    setParam('actualEntertainment', p.actualEntertainment);
    setParam('actualShopping', p.actualShopping);
    setParam('actualVacation', p.actualVacation);
    setParam('actualInvestments', p.actualInvestments);
    setParam('actualEmergencyFund', p.actualEmergencyFund);
    setParam('expectedReturnRate', p.expectedReturnRate);
    setParam('currencySymbol', p.currencySymbol);
  };

  // Perform calculation
  const results = useMemo(() => {
    return calculate503020BudgetCalculator({
      monthlyIncome,
      ruleFramework,
      customNeedsPct,
      customWantsPct,
      customSavingsPct,
      actualRent,
      actualGroceries,
      actualUtilities,
      actualInsurance,
      actualTransport,
      actualDining,
      actualEntertainment,
      actualShopping,
      actualVacation,
      actualInvestments,
      actualEmergencyFund,
      expectedReturnRate,
      currencySymbol,
    });
  }, [
    monthlyIncome,
    ruleFramework,
    customNeedsPct,
    customWantsPct,
    customSavingsPct,
    actualRent,
    actualGroceries,
    actualUtilities,
    actualInsurance,
    actualTransport,
    actualDining,
    actualEntertainment,
    actualShopping,
    actualVacation,
    actualInvestments,
    actualEmergencyFund,
    expectedReturnRate,
    currencySymbol,
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

  const fmt = (val) => `${currencySymbol}${Number(val).toLocaleString()}`;

  // Donut chart items for actual spending
  const budgetAllocationItems = [
    { label: `Essential Needs (${results.actualNeedsPct}%)`, amount: results.totalActualNeeds, colorClass: 'bg-primary', desc: 'Rent, groceries, utilities, transit & insurance.' },
    { label: `Discretionary Wants (${results.actualWantsPct}%)`, amount: results.totalActualWants, colorClass: 'bg-amber-500', desc: 'Dining out, entertainment, shopping & vacations.' },
    { label: `Savings & SIPs (${results.actualSavingsPct}%)`, amount: results.totalActualSavings, colorClass: 'bg-emerald-500', desc: 'Equity mutual funds, retirement & emergency fund.' },
  ].filter((item) => item.amount > 0);

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Monthly Income & Lifestyle Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            ⚖️ 50/30/20 BUDGET & WEALTH VERDICT
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.healthColor} bg-surface-strong`}>
            {results.healthGrade} · SCORE: {results.healthScore}/100
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Target rule: <strong>{results.targetNeedsPct}% Needs</strong> ({fmt(results.targetNeedsAmount)}), <strong>{results.targetWantsPct}% Wants</strong> ({fmt(results.targetWantsAmount)}), and <strong>{results.targetSavingsPct}% Savings</strong> ({fmt(results.targetSavingsAmount)}).
        </p>

        {/* Rule Framework Toggles */}
        <div class="pt-3 border-t border-hairline/60 flex items-center gap-2 flex-wrap">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-muted mr-1">Rule:</span>
          {[
            { id: '50_30_20', label: '50/30/20 Standard' },
            { id: '60_20_20', label: '60/20/20 Metro' },
            { id: '70_20_10', label: '70/20/10 Debt' },
            { id: '40_20_40', label: '40/20/40 FIRE' },
          ].map((fw) => (
            <button
              key={fw.id}
              type="button"
              onClick={() => setParam('ruleFramework', fw.id)}
              class={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                ruleFramework === fw.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-canvas hover:bg-surface-soft border border-hairline text-ink'
              }`}
            >
              {fw.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Itemized Expenses Input */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Monthly Income & Expenses</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="inc-input"
            label="Monthly Take-Home Income (Post-Tax)"
            value={monthlyIncome}
            min={5000}
            max={10000000}
            step={5000}
            prefix={currencySymbol}
            onChange={(v) => setParam('monthlyIncome', v)}
          />

          {/* Section 1: Needs */}
          <div class="space-y-4 pt-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                🏠 ESSENTIAL NEEDS ({fmt(results.totalActualNeeds)} · {results.actualNeedsPct}%)
              </span>
              <span class={`text-[11px] font-mono font-bold ${results.needsVariance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                Target: {fmt(results.targetNeedsAmount)} ({results.needsVariance > 0 ? `+${fmt(results.needsVariance)} Over` : 'Within Target'})
              </span>
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber id="rent-input" label="Rent / Mortgage EMI" value={actualRent} min={0} max={5000000} step={2000} prefix={currencySymbol} onChange={(v) => setParam('actualRent', v)} />
              <FormInputNumber id="groc-input" label="Groceries & Food Basics" value={actualGroceries} min={0} max={1000000} step={1000} prefix={currencySymbol} onChange={(v) => setParam('actualGroceries', v)} />
              <FormInputNumber id="util-input" label="Power, Gas & Internet" value={actualUtilities} min={0} max={500000} step={500} prefix={currencySymbol} onChange={(v) => setParam('actualUtilities', v)} />
              <FormInputNumber id="ins-input" label="Insurance & Healthcare" value={actualInsurance} min={0} max={500000} step={500} prefix={currencySymbol} onChange={(v) => setParam('actualInsurance', v)} />
              <FormInputNumber id="tr-input" label="Commute, Fuel & Transit" value={actualTransport} min={0} max={500000} step={500} prefix={currencySymbol} onChange={(v) => setParam('actualTransport', v)} />
            </div>
          </div>

          {/* Section 2: Wants */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
                🛍️ DISCRETIONARY WANTS ({fmt(results.totalActualWants)} · {results.actualWantsPct}%)
              </span>
              <span class={`text-[11px] font-mono font-bold ${results.wantsVariance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                Target: {fmt(results.targetWantsAmount)} ({results.wantsVariance > 0 ? `+${fmt(results.wantsVariance)} Over` : 'Within Target'})
              </span>
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber id="dine-input" label="Dining Out & Delivery" value={actualDining} min={0} max={1000000} step={1000} prefix={currencySymbol} onChange={(v) => setParam('actualDining', v)} />
              <FormInputNumber id="ent-input" label="Entertainment & OTT" value={actualEntertainment} min={0} max={500000} step={500} prefix={currencySymbol} onChange={(v) => setParam('actualEntertainment', v)} />
              <FormInputNumber id="shop-input" label="Shopping & Gadgets" value={actualShopping} min={0} max={1000000} step={1000} prefix={currencySymbol} onChange={(v) => setParam('actualShopping', v)} />
              <FormInputNumber id="vac-input" label="Vacations & Travel Fund" value={actualVacation} min={0} max={1000000} step={1000} prefix={currencySymbol} onChange={(v) => setParam('actualVacation', v)} />
            </div>
          </div>

          {/* Section 3: Savings */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider">
                🌱 SAVINGS & INVESTMENTS ({fmt(results.totalActualSavings)} · {results.actualSavingsPct}%)
              </span>
              <span class={`text-[11px] font-mono font-bold ${results.savingsVariance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                Target: {fmt(results.targetSavingsAmount)} ({results.savingsVariance < 0 ? `${fmt(results.savingsVariance)} Deficit` : 'On Target'})
              </span>
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber id="inv-input" label="Equity SIPs & Mutual Funds" value={actualInvestments} min={0} max={5000000} step={2000} prefix={currencySymbol} onChange={(v) => setParam('actualInvestments', v)} />
              <FormInputNumber id="emf-input" label="Emergency Cash Savings" value={actualEmergencyFund} min={0} max={2000000} step={1000} prefix={currencySymbol} onChange={(v) => setParam('actualEmergencyFund', v)} />
            </div>
          </div>

          {/* Wealth Projections Return Rate Slider */}
          <div class="pt-4 border-t border-hairline">
            <FormInputNumber
              id="cagr-input"
              label="Expected Investment Return (CAGR % for 10-Yr Wealth)"
              value={expectedReturnRate}
              min={0}
              max={30}
              step={0.5}
              suffix="%"
              onChange={(v) => setParam('expectedReturnRate', v)}
            />
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Monthly Savings & Wealth Building"
            primaryValue={fmt(results.totalActualSavings)}
            secondaryItems={[
              { label: `Needs Spend (${results.actualNeedsPct}%)`, value: fmt(results.totalActualNeeds) },
              { label: `Wants Spend (${results.actualWantsPct}%)`, value: fmt(results.totalActualWants) },
              { label: 'Unallocated Monthly Balance', value: fmt(results.unallocatedCash) },
              { label: '10-Yr Projected Wealth (SIP)', value: fmt(results.tenYearActualCorpus) },
            ]}
          />

          <ResultDonutChart
            title="Monthly Cash Flow Allocation Breakdown"
            centerValue={fmt(results.totalActualExpenses)}
            centerSubtext="Total Outflow"
            segments={budgetAllocationItems.map((c) => ({ label: c.label, amount: c.amount, colorClass: c.colorClass }))}
          />
        </div>
      </div>

      {/* 4. 10-YEAR COMPOUND WEALTH PROJECTION TABLE */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono overflow-x-auto">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-hairline pb-3">
          <div>
            <h4 class="text-base font-bold font-heading text-ink">10-Year Compound Wealth Growth Schedule</h4>
            <p class="text-xs text-muted font-mono mt-0.5">Investing {fmt(results.totalActualSavings)}/month at {expectedReturnRate}% CAGR</p>
          </div>
          <span class="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-pill text-xs font-bold">
            10-Yr Wealth: {fmt(results.tenYearActualCorpus)}
          </span>
        </div>

        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-hairline text-muted uppercase font-bold">
              <th class="py-2.5 px-3">Timeline</th>
              <th class="py-2.5 px-3 text-right">Actual Cumulative Invested</th>
              <th class="py-2.5 px-3 text-right">Actual Wealth Corpus</th>
              <th class="py-2.5 px-3 text-right">Target 20% Corpus</th>
              <th class="py-2.5 px-3 text-right">Estimated Gain</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-hairline/60">
            {results.wealthProjections.map((row) => (
              <tr key={row.years} class="hover:bg-surface-soft transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">{row.years} {row.years === 1 ? 'Year' : 'Years'}</td>
                <td class="py-2.5 px-3 text-right text-muted">{fmt(row.actualInvested)}</td>
                <td class="py-2.5 px-3 text-right font-bold text-emerald-600">{fmt(row.actualCorpus)}</td>
                <td class="py-2.5 px-3 text-right text-primary font-semibold">{fmt(row.targetCorpus)}</td>
                <td class="py-2.5 px-3 text-right text-ink font-mono font-bold">{fmt(row.actualCorpus - row.actualInvested)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. FRAMEWORK COMPARISON CARDS */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold font-heading text-ink">Budget Rule Framework Comparison Matrix</h4>
          <span class="text-xs text-muted">Income: {fmt(monthlyIncome)}</span>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {results.frameworkComparisons.map((fw) => (
            <div
              key={fw.id}
              class={`p-4 rounded-2xl border space-y-2 ${
                fw.isSelected
                  ? 'bg-primary/10 border-2 border-primary/40 shadow-sm'
                  : 'bg-surface-strong border-hairline'
              }`}
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-ink">{fw.name}</span>
                {fw.isSelected && <span class="text-[10px] font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-pill">Active</span>}
              </div>
              <div class="text-xs space-y-1 text-body">
                <div class="flex justify-between"><span>Needs ({fw.needsPct}%):</span><span class="font-bold text-ink">{fmt(fw.needsAmount)}</span></div>
                <div class="flex justify-between"><span>Wants ({fw.wantsPct}%):</span><span class="font-bold text-ink">{fmt(fw.wantsAmount)}</span></div>
                <div class="flex justify-between"><span>Savings ({fw.savingsPct}%):</span><span class="font-bold text-emerald-600">{fmt(fw.savingsAmount)}</span></div>
              </div>
              <div class="pt-2 border-t border-hairline/60 text-[11px]">
                <span class="text-muted block">10-Yr Corpus:</span>
                <span class="font-bold text-emerald-600">{fmt(fw.tenYearCorpus)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. COST BREAKDOWN */}
      <CostBreakdownCard
        title="Current Monthly Spending Breakdown"
        subtitle={`Total Monthly Outflow: ${fmt(results.totalActualExpenses)}`}
        items={budgetAllocationItems}
      />

      {/* 7. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 8. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Monthly Savings Velocity"
          value={`${results.actualSavingsPct}%`}
          subtitle={`Saving ${fmt(results.totalActualSavings)} each month fuels consistent long-term compounding.`}
          badgeText="Savings Rate"
          badgeColorClass="bg-semantic-success"
        />
        <InsightCard
          title="Essential Cost Ratio"
          value={`${results.actualNeedsPct}%`}
          subtitle={`Essential needs consume ${fmt(results.totalActualNeeds)} out of your ${fmt(monthlyIncome)} income.`}
          badgeText="Needs Ratio"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 9. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 MONTHLY BUDGET EXECUTIVE SUMMARY</span>
          <span class="text-xs text-muted font-mono">{ruleFramework.toUpperCase()} MODEL</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Monthly Income</span>
            <span class="text-base font-bold text-ink">{fmt(results.monthlyIncome)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Needs ({results.actualNeedsPct}%)</span>
            <span class="text-base font-bold text-primary">{fmt(results.totalActualNeeds)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Wants ({results.actualWantsPct}%)</span>
            <span class="text-base font-bold text-amber-600">{fmt(results.totalActualWants)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Savings ({results.actualSavingsPct}%)</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.totalActualSavings)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
