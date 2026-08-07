import { formatCurrency } from '@utils/formatters.js';

/**
 * Generic CostBreakdownCard Component
 * Displays itemized cost/financial component breakdowns with progress fill tracks and percentage shares.
 * Reusable across Total Cost of Ownership, Tax Component Breakdowns, Salary Take-Home, Portfolio Allocations, etc.
 */
export default function CostBreakdownCard({
  title = 'Financial Breakdown',
  subtitle,
  items = [],
  totalLabel = 'Total Outflow',
  totalAmount = 0,
  currency = 'INR',
}) {
  const sumAmount = totalAmount > 0 ? totalAmount : items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  return (
    <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft hover:border-primary/50 transition-all">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-4">
        <div>
          <h3 class="text-xl font-bold font-heading text-ink">{title}</h3>
          {subtitle && <p class="text-xs text-muted leading-relaxed mt-0.5">{subtitle}</p>}
        </div>
        <div class="bg-surface-strong px-4 py-2 rounded-2xl border border-hairline text-right">
          <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">{totalLabel}</span>
          <span class="font-mono font-extrabold text-lg text-ink">₹{formatCurrency(sumAmount, currency)}</span>
        </div>
      </div>

      {/* Itemized List */}
      <div class="space-y-4">
        {items.map((item, idx) => {
          const itemAmt = Number(item.amount) || 0;
          const pct = sumAmount > 0 ? Math.min(100, Math.max(0, Math.round((itemAmt / sumAmount) * 100))) : 0;
          const fillWidth = item.percentage !== undefined ? item.percentage : pct;

          return (
            <div key={idx} class="space-y-1.5 p-3.5 rounded-2xl bg-surface-strong/60 border border-hairline-soft">
              <div class="flex items-center justify-between text-xs font-semibold">
                <div class="flex items-center gap-2">
                  <span class={`w-2.5 h-2.5 rounded-full ${item.colorClass || 'bg-primary'}`}></span>
                  <span class="text-ink">{item.label}</span>
                </div>
                <div class="flex items-center gap-2 font-mono">
                  <span class="text-muted text-[11px]">({fillWidth}%)</span>
                  <span class={`font-bold ${item.isTotal ? 'text-primary text-sm' : 'text-ink'}`}>
                    ₹{formatCurrency(itemAmt, currency)}
                  </span>
                </div>
              </div>

              {/* Visual Fill Progress Track */}
              <div class="w-full h-2 bg-hairline rounded-full overflow-hidden">
                <div
                  class={`h-full transition-all duration-500 rounded-full ${item.colorClass || 'bg-primary'}`}
                  style={{ width: `${fillWidth}%` }}
                ></div>
              </div>

              {item.desc && <p class="text-[10px] text-muted leading-tight pt-0.5">{item.desc}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
