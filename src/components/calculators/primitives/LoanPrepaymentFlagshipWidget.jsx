import { useMemo } from 'preact/hooks';
import { calculateLoanPrepayment } from '@calculators/loans/loan-prepayment-calculator';
import FormInputNumber from './FormInputNumber';
import ResultDashboard from '../../ui/ResultDashboard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import ResultDonutChart from '../../ui/ResultDonutChart';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

const PRESETS = [
  {
    name: 'Home Loan Early Stage',
    description: '₹30L @ 8.5% over 20 Yrs (Prepay ₹3L at Month 12)',
    badge: 'Popular',
    values: {
      amount: 3000000,
      rate: 8.5,
      tenure: 20,
      prepaymentMode: 'lumpsum',
      prepaymentAmount: 300000,
      prepaymentMonth: 12,
      prepaymentFeePct: 0,
      decisionOption: 'tenure',
    },
  },
  {
    name: 'Home Loan Mid Tenure',
    description: '₹20L @ 8.5% over 15 Yrs (Prepay ₹2L at Month 36)',
    badge: 'Mid Tenure',
    values: {
      amount: 2000000,
      rate: 8.5,
      tenure: 15,
      prepaymentMode: 'lumpsum',
      prepaymentAmount: 200000,
      prepaymentMonth: 36,
      prepaymentFeePct: 0,
      decisionOption: 'tenure',
    },
  },
  {
    name: 'Personal Loan',
    description: '₹5L @ 13% over 5 Yrs (Prepay ₹1L at Month 6)',
    badge: 'High Rate',
    values: {
      amount: 500000,
      rate: 13,
      tenure: 5,
      prepaymentMode: 'lumpsum',
      prepaymentAmount: 100000,
      prepaymentMonth: 6,
      prepaymentFeePct: 2,
      decisionOption: 'tenure',
    },
  },
  {
    name: 'Car Loan',
    description: '₹8L @ 9% over 7 Yrs (Prepay ₹1.5L at Month 18)',
    badge: 'Vehicle Loan',
    values: {
      amount: 800000,
      rate: 9,
      tenure: 7,
      prepaymentMode: 'lumpsum',
      prepaymentAmount: 150000,
      prepaymentMonth: 18,
      prepaymentFeePct: 0,
      decisionOption: 'tenure',
    },
  },
  {
    name: 'High Interest Credit Loan',
    description: '₹3L @ 16% over 3 Yrs (Prepay ₹1L at Month 3)',
    badge: 'Urgent Payoff',
    values: {
      amount: 300000,
      rate: 16,
      tenure: 3,
      prepaymentMode: 'lumpsum',
      prepaymentAmount: 100000,
      prepaymentMonth: 3,
      prepaymentFeePct: 0,
      decisionOption: 'tenure',
    },
  },
];

export default function LoanPrepaymentFlagshipWidget() {
  const defaultState = {
    amount: 2000000,
    rate: 8.5,
    tenure: 20,
    tenureType: 'years',
    prepaymentMode: 'lumpsum',
    prepaymentAmount: 200000,
    prepaymentMonth: 12,
    prepaymentFeePct: 0,
    decisionOption: 'tenure',
    opportunityRate: 12,
  };

  const [state, setState] = useUrlSync(defaultState);

  const updateState = (key, val) => {
    setState((prev) => ({ ...prev, [key]: val }));
  };

  const results = useMemo(() => {
    return calculateLoanPrepayment(state);
  }, [state]);

  const handleApplyPreset = (presetValues) => {
    setState((prev) => ({ ...prev, ...presetValues }));
  };

  const handleReset = () => {
    setState(defaultState);
  };

  const isTenureMode = state.decisionOption === 'tenure';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Hero Decision Question Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full text-blue-300 text-xs font-semibold uppercase tracking-wider">
            Institutional Debt Decision Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Should I prepay my loan, and how much can I save?
          </h2>
          <p className="text-blue-200 text-sm sm:text-base max-w-3xl leading-relaxed">
            Calculate your exact interest savings under both <strong className="text-white">Option A (Tenure Reduction)</strong> and <strong className="text-white">Option B (EMI Reduction)</strong>. Compare lump-sum vs. recurring extra payments with penalty fee deductions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xs text-blue-200 block uppercase">Net Interest Saved</span>
              <span className="text-lg font-extrabold text-emerald-400">
                {formatCurrency(results.interestSaved)}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xs text-blue-200 block uppercase">
                {isTenureMode ? 'Tenure Reduced' : 'Monthly EMI Savings'}
              </span>
              <span className="text-lg font-extrabold text-blue-300">
                {isTenureMode
                  ? `${results.monthsSaved} Months (${(results.monthsSaved / 12).toFixed(1)} Yrs)`
                  : `${formatCurrency(results.monthlyEmiSavings)}/mo`}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xs text-blue-200 block uppercase">Prepayment Score</span>
              <span className="text-lg font-extrabold text-amber-300">
                {results.prepaymentScore}/100 ({results.scoreLabel})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Smart Scenario Presets */}
      <ScenarioPresetCards presets={PRESETS} onSelectPreset={handleApplyPreset} />

      {/* 3. Interactive Input Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          1. Original Loan Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FormInputNumber
            id="amount"
            label="Original Principal Loan Amount"
            value={state.amount}
            onChange={(v) => updateState('amount', v)}
            min={50000}
            max={100000000}
            step={50000}
            unit="₹"
            helpText="Total initial borrowed loan amount"
          />

          <FormInputNumber
            id="rate"
            label="Annual Interest Rate"
            value={state.rate}
            onChange={(v) => updateState('rate', v)}
            min={1}
            max={36}
            step={0.1}
            unit="%"
            helpText="Annual loan interest rate (% p.a.)"
          />

          <FormInputNumber
            id="tenure"
            label="Original Loan Tenure"
            value={state.tenure}
            onChange={(v) => updateState('tenure', v)}
            min={1}
            max={40}
            step={1}
            unit="Years"
            helpText="Original sanction tenure in years"
          />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3 pt-4">
          2. Prepayment Strategy & Mode
        </h3>

        {/* Prepayment Mode Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => updateState('prepaymentMode', 'lumpsum')}
            className={`p-3 rounded-xl border font-semibold text-sm transition-all text-center ${
              state.prepaymentMode === 'lumpsum'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-blue-400'
            }`}
          >
            One-Time Lump-sum
          </button>
          <button
            type="button"
            onClick={() => updateState('prepaymentMode', 'extra_monthly')}
            className={`p-3 rounded-xl border font-semibold text-sm transition-all text-center ${
              state.prepaymentMode === 'extra_monthly'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-blue-400'
            }`}
          >
            Recurring Extra Monthly
          </button>
          <button
            type="button"
            onClick={() => updateState('prepaymentMode', 'extra_emi')}
            className={`p-3 rounded-xl border font-semibold text-sm transition-all text-center ${
              state.prepaymentMode === 'extra_emi'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-blue-400'
            }`}
          >
            1 Extra EMI Every Year
          </button>
        </div>

        {/* Prepayment Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          {state.prepaymentMode !== 'extra_emi' && (
            <FormInputNumber
              id="prepaymentAmount"
              label={
                state.prepaymentMode === 'lumpsum'
                  ? 'Lump-sum Prepayment Amount'
                  : 'Extra Monthly Contribution'
              }
              value={state.prepaymentAmount}
              onChange={(v) => updateState('prepaymentAmount', v)}
              min={1000}
              max={state.amount}
              step={10000}
              unit="₹"
              helpText="Prepayment funds applied to principal"
            />
          )}

          {state.prepaymentMode === 'lumpsum' && (
            <FormInputNumber
              id="prepaymentMonth"
              label="Prepayment Month Index"
              value={state.prepaymentMonth}
              onChange={(v) => updateState('prepaymentMonth', v)}
              min={1}
              max={state.tenure * 12 - 1}
              step={1}
              unit="Month"
              helpText="Month at which lump-sum is paid (e.g. Month 12)"
            />
          )}

          <FormInputNumber
            id="prepaymentFeePct"
            label="Assumed Penalty Charge (%)"
            value={state.prepaymentFeePct}
            onChange={(v) => updateState('prepaymentFeePct', v)}
            min={0}
            max={5}
            step={0.1}
            unit="%"
            helpText="Lender prepayment fee (0% for floating home loans)"
          />
        </div>

        {/* Decision Option Toggle (Tenure vs EMI) */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3 pt-4">
          3. Decision Option Preference
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => updateState('decisionOption', 'tenure')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              state.decisionOption === 'tenure'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Option A: Reduce Tenure</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">
                Max Interest Savings
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Keep monthly EMI constant. Pay off loan months or years earlier to maximize total compounding interest savings.
            </p>
          </div>

          <div
            onClick={() => updateState('decisionOption', 'emi')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              state.decisionOption === 'emi'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Option B: Reduce EMI</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                Monthly Budget Relief
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Keep remaining tenure constant. Lower your monthly EMI obligation to improve monthly household cash flow.
            </p>
          </div>
        </div>
      </div>

      {/* Overpayment Warning Banner */}
      {results.overpaymentCapped && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-xl text-amber-900 dark:text-amber-200 text-sm font-semibold">
          ⚠️ Prepayment amount exceeds remaining loan principal. Applied prepayment capped at {formatCurrency(results.appliedPrepayment)}.
        </div>
      )}

      {/* Negative Net Benefit Warning Banner */}
      {results.netBenefit < 0 && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 p-4 rounded-xl text-rose-900 dark:text-rose-200 text-sm font-semibold">
          ⚠️ Your assumed prepayment charge ({formatCurrency(results.prepaymentFeeAmount)}) is higher than the estimated gross interest savings ({formatCurrency(results.interestSaved)}). Net Financial Benefit is negative ({formatCurrency(results.netBenefit)}).
        </div>
      )}

      {/* 4. Primary Results Dashboard */}
      <ResultDashboard
        primaryLabel="Net Interest Saved"
        primaryValue={results.interestSaved}
        primaryUnit="₹"
        metrics={[
          {
            label: isTenureMode ? 'Tenure Reduced' : 'Monthly EMI Savings',
            value: isTenureMode
              ? `${results.monthsSaved} Months (${(results.monthsSaved / 12).toFixed(1)} Yrs)`
              : `${formatCurrency(results.monthlyEmiSavings)}/mo`,
            status: 'positive',
          },
          {
            label: 'Net Financial Benefit',
            value: formatCurrency(results.netBenefit),
            status: 'positive',
          },
          {
            label: 'Original Monthly EMI',
            value: formatCurrency(results.emi),
            status: 'neutral',
          },
          {
            label: isTenureMode ? 'Revised Tenure' : 'Revised Monthly EMI',
            value: isTenureMode
              ? `${results.newTenureMonths} Months`
              : formatCurrency(results.revisedEmi),
            status: 'positive',
          },
          {
            label: 'Assumed Penalty Fee',
            value: formatCurrency(results.prepaymentFeeAmount),
            status: results.prepaymentFeeAmount > 0 ? 'warning' : 'neutral',
          },
          {
            label: 'New Total Interest Paid',
            value: formatCurrency(results.newInterest),
            status: 'neutral',
          },
        ]}
      />

      {/* 5. Option A vs Option B Direct Comparison Matrix */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          Option A (Tenure Reduction) vs. Option B (EMI Reduction) Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
              <span className="font-bold text-emerald-900 dark:text-emerald-300">Option A: Reduce Tenure</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-600 text-white rounded font-bold">Recommended</span>
            </div>
            <div className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Monthly EMI:</span>
                <span className="font-semibold">{formatCurrency(results.emi)} (Unchanged)</span>
              </div>
              <div className="flex justify-between">
                <span>New Payoff Tenure:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {results.optionA.newTenureMonths} Months ({results.optionA.monthsSaved} Months Saved)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Net Interest Saved:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(results.optionA.interestSaved)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-800 pb-2">
              <span className="font-bold text-blue-900 dark:text-blue-300">Option B: Reduce Monthly EMI</span>
              <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded font-bold">Budget Relief</span>
            </div>
            <div className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Revised Monthly EMI:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(results.optionB.revisedEmi)} ({formatCurrency(results.optionB.monthlyEmiSavings)}/mo Saved)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Remaining Tenure:</span>
                <span className="font-semibold">{state.tenure * 12 - state.prepaymentMonth} Months (Unchanged)</span>
              </div>
              <div className="flex justify-between">
                <span>Net Interest Saved:</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">
                  {formatCurrency(results.optionB.interestSaved)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          * Option A produces {formatCurrency(results.optionA.interestSaved - results.optionB.interestSaved)} higher interest savings than Option B because keeping EMI constant accelerates principal compounding.
        </p>
      </div>

      {/* 6. Liquidity & Emergency Fund Safety Box */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          💡 Liquidity & Emergency Savings Safety Reminder
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Prepayment can significantly reduce interest outgo, but using too much available cash may reduce your liquid emergency reserves. Ensure you maintain at least 6 months of living expenses in an accessible emergency account before making large lump-sum loan prepayments.
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
          Note: This calculator does not assess your personal emergency-fund needs or household liquidity constraints.
        </p>
      </div>

      {/* 7. Cost Basis & Savings Breakdown Card */}
      <CostBreakdownCard
        title="Prepayment Financial Outgo & Savings Breakdown"
        items={[
          { label: 'Original Baseline Interest Outgo', value: formatCurrency(results.originalInterest) },
          { label: 'New Cumulative Interest Outgo', value: formatCurrency(results.newInterest) },
          { label: 'Gross Interest Saved', value: formatCurrency(results.interestSaved) },
          { label: 'Assumed Prepayment Penalty Charge', value: `- ${formatCurrency(results.prepaymentFeeAmount)}` },
          { label: 'Net Financial Benefit', value: formatCurrency(results.netBenefit), isTotal: true },
        ]}
      />

      {/* 8. Visual Gauges & Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthGauge
          score={results.prepaymentScore}
          title="Prepayment Financial Benefit Score"
          subtitle={results.scoreLabel}
        />

        <ResultDonutChart
          title="Total Outflow Composition (Principal vs Interest vs Prepayment)"
          data={[
            { name: 'Original Principal', value: state.amount },
            { name: 'Prepayment Funds Paid', value: results.appliedPrepayment },
            { name: 'New Cumulative Interest', value: results.newInterest },
            { name: 'Penalty Charges', value: results.prepaymentFeeAmount },
          ]}
        />
      </div>

      {/* 9. 5-Hypothetical Prepayment Sensitivity Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
          Prepayment Scenario Sensitivity Simulator
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-3">Scenario</th>
                <th className="p-3">Prepayment Amount</th>
                <th className="p-3">Tenure Reduced</th>
                <th className="p-3">Gross Interest Saved</th>
                <th className="p-3">Net Benefit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.scenarios.map((sc, idx) => (
                <tr
                  key={idx}
                  className={idx === 1 ? 'bg-blue-50/60 dark:bg-blue-900/20 font-semibold' : ''}
                >
                  <td className="p-3">{sc.name}</td>
                  <td className="p-3">{formatCurrency(sc.prepaymentAmount)}</td>
                  <td className="p-3">{sc.monthsSaved} Months</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400">{formatCurrency(sc.interestSaved)}</td>
                  <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(sc.netBenefit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 10. Smart Insights & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard
          title="Debt Optimization Insights"
          insights={[
            `Prepaying ${formatCurrency(results.appliedPrepayment)} saves an estimated ${formatCurrency(results.interestSaved)} in cumulative loan interest.`,
            isTenureMode
              ? `Option A keeps your EMI at ${formatCurrency(results.emi)} while shortening loan tenure by ${results.monthsSaved} months.`
              : `Option B lowers your monthly EMI from ${formatCurrency(results.emi)} to ${formatCurrency(results.revisedEmi)} (${formatCurrency(results.monthlyEmiSavings)}/mo saved).`,
            `Prepayment early in loan tenure yields higher compounding interest savings because early EMIs consist primarily of interest charges.`,
          ]}
        />

        <RecommendationCard
          title="Actionable Debt Strategy"
          recommendations={[
            `Ensure floating-rate home loan prepayments incur 0% penalty charges per RBI retail lending guidelines.`,
            `If primary goal is financial independence, choose Option A (Tenure Reduction) to maximize total savings.`,
            `If primary goal is monthly cash flow flexibility, choose Option B (EMI Reduction) to lower monthly expenses.`,
            `Maintain at least 6 months of living expenses in liquid emergency funds before deploying cash toward debt prepayment.`,
          ]}
        />
      </div>

      {/* 11. Share & Reset Actions */}
      <ShareActions
        title="Loan Prepayment Calculator Results"
        text={`By prepaying ${formatCurrency(results.appliedPrepayment)} on my loan, I can save ${formatCurrency(results.interestSaved)} in interest!`}
        onReset={handleReset}
      />
    </div>
  );
}
