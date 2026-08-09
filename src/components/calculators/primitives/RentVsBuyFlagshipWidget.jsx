import { useMemo } from 'preact/hooks';
import { calculateRentVsBuyCalculator } from '@calculators/loans/rent-vs-buy-calculator';
import { RENT_VS_BUY_CONFIG } from '@calculators/configs/rent-vs-buy-calculator.config';
import FormInputNumber from './FormInputNumber';
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';
import { useUrlSync } from '../../hooks/useUrlSync';

export default function RentVsBuyFlagshipWidget({ initialValues = {} }) {
  const defaultState = {
    propertyPrice: RENT_VS_BUY_CONFIG.defaultPropertyPrice,
    monthlyRent: RENT_VS_BUY_CONFIG.defaultMonthlyRent,
    downPaymentPct: RENT_VS_BUY_CONFIG.defaultDownPaymentPct,
    homeLoanRate: RENT_VS_BUY_CONFIG.defaultHomeLoanRate,
    tenureYears: RENT_VS_BUY_CONFIG.defaultTenureYears,
    propertyAppreciationRate: RENT_VS_BUY_CONFIG.defaultPropertyAppreciationRate,
    rentInflationRate: RENT_VS_BUY_CONFIG.defaultRentInflationRate,
    investmentReturnRate: RENT_VS_BUY_CONFIG.defaultInvestmentReturnRate,
    includeTaxBenefits: RENT_VS_BUY_CONFIG.defaultIncludeTaxBenefits,
    currency: 'INR',
    ...initialValues,
  };

  const [state, updateState] = useUrlSync(defaultState);

  const results = useMemo(() => {
    return calculateRentVsBuyCalculator(state);
  }, [state]);

  const presets = RENT_VS_BUY_CONFIG.presets;
  const currencySymbol = state.currency === 'USD' ? '$' : '₹';
  const isBuyWinner = results.winningOption === 'BUY';

  return (
    <div className="space-y-8">
      {/* 1. Hero Decision Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl shadow-xl border text-white ${
        isBuyWinner
          ? 'bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 border-emerald-700/40'
          : 'bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 border-blue-700/40'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-slate-200 text-xs font-semibold rounded-full border border-white/20">
              🏠 Housing Financial Decision Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {results.heroText}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Multi-asset opportunity cost model comparing property equity against down payment lumpsum & monthly cash flow surplus equity SIP accumulation.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 p-4 rounded-xl text-center min-w-[240px]">
            <span className="text-xs uppercase tracking-wider text-slate-300 font-bold block">
              Financial Winner
            </span>
            <span className={`text-3xl font-black mt-1 block ${isBuyWinner ? 'text-emerald-400' : 'text-blue-400'}`}>
              {isBuyWinner ? '🏡 BUYING' : '🏢 RENTING'}
            </span>
            <span className="text-xs text-slate-200 mt-1 block font-medium">
              Advantage: +{formatCurrency(Math.abs(results.netAdvantage), state.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Official Tax Context & Assumption Disclaimer */}
      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          ℹ️ Tax & Market Assumptions (Configurable Parameters)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          <div>• <strong className="text-slate-900 dark:text-white">Tax Context:</strong> {results.referenceData.taxContext}</div>
          <div>• <strong className="text-slate-900 dark:text-white">RBI HPI Benchmark:</strong> {results.referenceData.rbiHpiContext}</div>
        </div>
      </div>

      {/* 3. Smart Presets Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          ⚡ Housing Market Presets
        </h3>
        <ScenarioPresetCards
          presets={presets}
          activePresetId={null}
          onSelectPreset={(p) => {
            Object.entries(p.values).forEach(([k, v]) => updateState(k, v));
          }}
        />
      </div>

      {/* 4. Input Controls Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Property & Financial Parameters
          </h3>
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={state.includeTaxBenefits}
              onChange={(e) => updateState('includeTaxBenefits', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <span>Include Sec 24(b) Home Loan Interest Tax Deduction (Old Tax Regime)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInputNumber
            id="propertyPrice"
            label="Property Purchase Price Today"
            value={state.propertyPrice}
            onChange={(val) => updateState('propertyPrice', val)}
            min={500000}
            max={200000000}
            step={100000}
            prefix={currencySymbol}
            minLabel="₹5 Lakhs"
            maxLabel="₹20 Cr"
          />

          <FormInputNumber
            id="monthlyRent"
            label="Initial Monthly Rent Today"
            value={state.monthlyRent}
            onChange={(val) => updateState('monthlyRent', val)}
            min={2000}
            max={1000000}
            step={1000}
            prefix={currencySymbol}
            minLabel="₹2k"
            maxLabel="₹10L"
          />

          <FormInputNumber
            id="tenureYears"
            label="Comparison Time Horizon (Years)"
            value={state.tenureYears}
            onChange={(val) => updateState('tenureYears', val)}
            min={1}
            max={40}
            step={1}
            minLabel="1 Yr"
            maxLabel="40 Yrs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <FormInputNumber
            id="downPaymentPct"
            label="Down Payment Percentage (%)"
            value={state.downPaymentPct}
            onChange={(val) => updateState('downPaymentPct', val)}
            min={0}
            max={100}
            step={1}
            suffix="%"
            minLabel="0%"
            maxLabel="100%"
          />

          <FormInputNumber
            id="homeLoanRate"
            label="Home Loan Interest Rate (% p.a.)"
            value={state.homeLoanRate}
            onChange={(val) => updateState('homeLoanRate', val)}
            min={1.0}
            max={25.0}
            step={0.1}
            suffix="%"
            minLabel="1.0%"
            maxLabel="25.0%"
          />

          <FormInputNumber
            id="propertyAppreciationRate"
            label="Property Appreciation Rate (% p.a.)"
            value={state.propertyAppreciationRate}
            onChange={(val) => updateState('propertyAppreciationRate', val)}
            min={0}
            max={25.0}
            step={0.1}
            suffix="%"
            minLabel="0%"
            maxLabel="25.0%"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <FormInputNumber
            id="rentInflationRate"
            label="Annual Rent Inflation Rate (% p.a.)"
            value={state.rentInflationRate}
            onChange={(val) => updateState('rentInflationRate', val)}
            min={0}
            max={25.0}
            step={0.1}
            suffix="%"
            minLabel="0%"
            maxLabel="25.0%"
          />

          <FormInputNumber
            id="investmentReturnRate"
            label="Equity SIP Investment Return (% p.a.)"
            value={state.investmentReturnRate}
            onChange={(val) => updateState('investmentReturnRate', val)}
            min={0}
            max={30.0}
            step={0.1}
            suffix="%"
            minLabel="0%"
            maxLabel="30.0%"
          />
        </div>
      </div>

      {/* 5. Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Net Worth (Buying Home)
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(results.netWorthBuy, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Prop Value: {formatCurrency(results.futurePropertyValue, state.currency)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Net Worth (Renting & Investing)
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
            {formatCurrency(results.netWorthRent, state.currency)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Equity SIP + Lumpsum Growth
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Breakeven Horizon
          </span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {results.breakevenYear}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Year Buy Net Worth exceeds Rent
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
            Home Loan EMI
          </span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
            {formatCurrency(results.monthlyEMI, state.currency)}/mo
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Loan Principal: {formatCurrency(results.loanPrincipal, state.currency)}
          </span>
        </div>
      </div>

      {/* 6. Total Cash Outflow Comparison Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-700 space-y-4">
        <h4 className="text-lg font-extrabold flex items-center justify-between">
          <span>💳 Total Cash Outflow Comparison ({results.tenureYears} Years)</span>
          <span className="text-xs font-normal text-slate-400">Total Outflow Paid</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-xs text-slate-300 font-bold uppercase block">Total Cash Outflow (Buy Scenario)</span>
            <span className="text-2xl font-black text-rose-400 block">
              {formatCurrency(results.totalOutflowBuy, state.currency)}
            </span>
            <span className="text-xs text-slate-400 block">
              Down Payment ({formatCurrency(results.downPayment, state.currency)}) + EMIs + Maintenance + Fees
            </span>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-xs text-slate-300 font-bold uppercase block">Total Cash Outflow (Rent Scenario)</span>
            <span className="text-2xl font-black text-blue-400 block">
              {formatCurrency(results.totalOutflowRent, state.currency)}
            </span>
            <span className="text-xs text-slate-400 block">
              Cumulative Rent Paid over {results.tenureYears} Years @ {results.rentInflationRate}% Inflation
            </span>
          </div>
        </div>
      </div>

      {/* 7. Year-by-Year Multi-Asset Net Worth Comparison Schedule Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>📅 Year-by-Year Net Worth Trajectory</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {results.tenureYears}-Year Horizon Rollup
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                <th className="p-3">Year</th>
                <th className="p-3">Property Value</th>
                <th className="p-3">Loan Balance</th>
                <th className="p-3">Net Worth (Buy)</th>
                <th className="p-3">Monthly Rent</th>
                <th className="p-3">Net Worth (Rent)</th>
                <th className="p-3">Net Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} className={row.isFinalRow ? 'bg-slate-100 dark:bg-slate-700/50 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Year {row.year}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{formatCurrency(row.propertyValue, state.currency)}</td>
                  <td className="p-3 text-rose-600 dark:text-rose-400">{formatCurrency(row.remainingLoan, state.currency)}</td>
                  <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.netWorthBuy, state.currency)}</td>
                  <td className="p-3 text-amber-600 dark:text-amber-400">{formatCurrency(row.monthlyRent, state.currency)}/mo</td>
                  <td className="p-3 font-extrabold text-blue-600 dark:text-blue-400">{formatCurrency(row.netWorthRent, state.currency)}</td>
                  <td className={`p-3 font-bold ${row.netAdvantage > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {row.netAdvantage > 0 ? `+${formatCurrency(row.netAdvantage, state.currency)} (Buy)` : `${formatCurrency(row.netAdvantage, state.currency)} (Rent)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Share Actions */}
      <ShareActions
        toolTitle="Rent vs Buy Calculator"
        shareText={`Over ${results.tenureYears} years, ${results.winningOption === 'BUY' ? 'Buying a home' : 'Renting & Investing'} generates ${formatCurrency(Math.abs(results.netAdvantage), state.currency)} HIGHER net worth!`}
      />
    </div>
  );
}
