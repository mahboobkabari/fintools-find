import { formatCurrency } from '@utils/formatters.js';

export default function EmiDonutChart({ principal, totalInterest, totalPayment, currency = 'INR' }) {
  const principalPct = totalPayment > 0 ? Math.round((principal / totalPayment) * 100) : 50;
  const interestPct = 100 - principalPct;

  // SVG Donut calculations
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const interestOffset = circumference - (interestPct / 100) * circumference;

  return (
    <div class="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-surface-soft border border-hairline rounded-2xl">
      {/* SVG Donut Visual */}
      <div class="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} class="transform -rotate-90">
          {/* Principal Circle (Base Track - Blue) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2563EB"
            stroke-width={strokeWidth}
            fill="transparent"
          />
          {/* Interest Circle (Overlay Arc - Amber) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F59E0B"
            stroke-width={strokeWidth}
            stroke-dasharray={circumference}
            stroke-dashoffset={interestOffset}
            stroke-linecap="round"
            fill="transparent"
            class="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center Donut Label */}
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted">Interest</span>
          <span class="text-2xl font-bold font-mono text-ink">{interestPct}%</span>
        </div>
      </div>

      {/* Legend & Breakdown Stats */}
      <div class="w-full space-y-4">
        {/* Principal Legend Item */}
        <div class="p-3.5 bg-canvas border border-hairline rounded-xl flex items-center justify-between shadow-soft">
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-primary flex-shrink-0"></span>
            <div>
              <span class="block text-xs font-semibold text-ink">Principal Amount</span>
              <span class="text-[11px] text-muted font-mono">{principalPct}% of Total</span>
            </div>
          </div>
          <span class="font-mono font-bold text-sm text-ink">{formatCurrency(principal, currency)}</span>
        </div>

        {/* Interest Legend Item */}
        <div class="p-3.5 bg-canvas border border-hairline rounded-xl flex items-center justify-between shadow-soft">
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-accent-amber flex-shrink-0"></span>
            <div>
              <span class="block text-xs font-semibold text-ink">Total Interest</span>
              <span class="text-[11px] text-muted font-mono">{interestPct}% of Total</span>
            </div>
          </div>
          <span class="font-mono font-bold text-sm text-semantic-warning">{formatCurrency(totalInterest, currency)}</span>
        </div>
      </div>
    </div>
  );
}
