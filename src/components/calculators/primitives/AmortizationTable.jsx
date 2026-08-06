import { useState } from 'preact/hooks';
import { formatCurrency } from '@utils/formatters.js';

export default function AmortizationTable({ schedule = [], currency = 'INR' }) {
  const [viewMode, setViewMode] = useState('yearly'); // 'yearly' | 'monthly'

  if (!schedule || schedule.length === 0) return null;

  // Aggregate monthly schedule into yearly summaries
  const yearlyData = schedule.reduce((acc, row) => {
    const year = Math.ceil(row.month / 12);
    if (!acc[year]) {
      acc[year] = {
        year,
        totalPayment: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        endingBalance: row.remainingBalance,
      };
    }
    acc[year].totalPayment += row.payment;
    acc[year].totalPrincipal += row.principalPaid;
    acc[year].totalInterest += row.interestPaid;
    acc[year].endingBalance = row.remainingBalance;
    return acc;
  }, {});

  const yearlyRows = Object.values(yearlyData);

  return (
    <div class="bg-canvas border border-hairline rounded-xl p-6 overflow-hidden">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-semibold text-ink">Amortization Schedule</h4>
        <div class="flex bg-surface-strong p-0.5 rounded-pill border border-hairline text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode('yearly')}
            class={`px-3 py-1 rounded-pill transition-colors ${
              viewMode === 'yearly' ? 'bg-primary text-white font-semibold' : 'text-body hover:text-ink'
            }`}
          >
            Yearly
          </button>
          <button
            type="button"
            onClick={() => setViewMode('monthly')}
            class={`px-3 py-1 rounded-pill transition-colors ${
              viewMode === 'monthly' ? 'bg-primary text-white font-semibold' : 'text-body hover:text-ink'
            }`}
          >
            Monthly ({schedule.length})
          </button>
        </div>
      </div>

      <div class="overflow-x-auto max-h-96 overflow-y-auto">
        <table class="w-full text-left border-collapse text-xs font-mono">
          <thead class="sticky top-0 bg-surface-soft text-ink font-semibold">
            <tr>
              <th class="p-3 border-b border-hairline">{viewMode === 'yearly' ? 'Year' : 'Month'}</th>
              <th class="p-3 border-b border-hairline">Payment</th>
              <th class="p-3 border-b border-hairline">Principal</th>
              <th class="p-3 border-b border-hairline">Interest</th>
              <th class="p-3 border-b border-hairline">Balance</th>
            </tr>
          </thead>
          <tbody>
            {viewMode === 'yearly'
              ? yearlyRows.map((row) => (
                  <tr key={row.year} class="border-b border-hairline-soft hover:bg-surface-soft/50 transition-colors">
                    <td class="p-3 font-semibold text-ink">Yr {row.year}</td>
                    <td class="p-3">{formatCurrency(row.totalPayment, currency)}</td>
                    <td class="p-3 text-semantic-up">{formatCurrency(row.totalPrincipal, currency)}</td>
                    <td class="p-3 text-semantic-down">{formatCurrency(row.totalInterest, currency)}</td>
                    <td class="p-3 text-body">{formatCurrency(row.endingBalance, currency)}</td>
                  </tr>
                ))
              : schedule.map((row) => (
                  <tr key={row.month} class="border-b border-hairline-soft hover:bg-surface-soft/50 transition-colors">
                    <td class="p-3 font-semibold text-ink">Mo {row.month}</td>
                    <td class="p-3">{formatCurrency(row.payment, currency)}</td>
                    <td class="p-3 text-semantic-up">{formatCurrency(row.principalPaid, currency)}</td>
                    <td class="p-3 text-semantic-down">{formatCurrency(row.interestPaid, currency)}</td>
                    <td class="p-3 text-body">{formatCurrency(row.remainingBalance, currency)}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
