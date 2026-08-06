import { formatCurrency } from '@utils/formatters.js';

export default function ResultDonutChart({
  primaryValue = 0,
  primaryLabel = 'Principal Amount',
  primaryColor = '#2563EB',
  secondaryValue = 0,
  secondaryLabel = 'Total Interest',
  secondaryColor = '#F59E0B',
  totalValue = 0,
  centerLabel = 'Interest',
  currency = 'INR',
}) {
  const primaryPct = totalValue > 0 ? Math.round((primaryValue / totalValue) * 100) : 50;
  const secondaryPct = 100 - primaryPct;

  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const secondaryOffset = circumference - (secondaryPct / 100) * circumference;

  return (
    <div
      class="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-surface-soft border border-hairline rounded-2xl"
      role="region"
      aria-label="Payment ratio visual breakdown"
    >
      <div class="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          class="transform -rotate-90"
          role="img"
          aria-label={`Ratio breakdown: ${primaryPct}% ${primaryLabel}, ${secondaryPct}% ${secondaryLabel}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={primaryColor}
            stroke-width={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={secondaryColor}
            stroke-width={strokeWidth}
            stroke-dasharray={circumference}
            stroke-dashoffset={secondaryOffset}
            stroke-linecap="round"
            fill="transparent"
            class="transition-all duration-500 ease-out"
          />
        </svg>

        <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted">{centerLabel}</span>
          <span class="text-2xl font-bold font-mono text-ink">{secondaryPct}%</span>
        </div>
      </div>

      <div class="w-full space-y-4">
        <div class="p-3.5 bg-canvas border border-hairline rounded-xl flex items-center justify-between shadow-soft">
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} aria-hidden="true"></span>
            <div>
              <span class="block text-xs font-semibold text-ink">{primaryLabel}</span>
              <span class="text-[11px] text-muted font-mono">{primaryPct}% of Total</span>
            </div>
          </div>
          <span class="font-mono font-bold text-sm text-ink">{formatCurrency(primaryValue, currency)}</span>
        </div>

        <div class="p-3.5 bg-canvas border border-hairline rounded-xl flex items-center justify-between shadow-soft">
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: secondaryColor }} aria-hidden="true"></span>
            <div>
              <span class="block text-xs font-semibold text-ink">{secondaryLabel}</span>
              <span class="text-[11px] text-muted font-mono">{secondaryPct}% of Total</span>
            </div>
          </div>
          <span class="font-mono font-bold text-sm text-semantic-warning">{formatCurrency(secondaryValue, currency)}</span>
        </div>
      </div>
    </div>
  );
}
