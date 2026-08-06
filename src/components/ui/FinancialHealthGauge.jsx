export default function FinancialHealthGauge({
  ratioPct = 0,
  status = {
    badge: 'Safe & Healthy',
    color: '#10B981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-600',
    desc: 'Within recommended financial safety thresholds.',
  },
  title = 'Salary Commitment Ratio',
  label = 'FOIR',
}) {
  const clampedPct = Math.min(100, Math.max(0, ratioPct));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div class={`p-8 border-2 ${status.borderColor} bg-canvas rounded-3xl shadow-soft space-y-4`}>
      <div class="flex items-center justify-between border-b border-hairline pb-3">
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">Affordability Check</span>
        <span class={`text-xs font-mono font-bold px-3 py-0.5 rounded-pill ${status.bgColor} ${status.textColor}`}>
          {status.badge}
        </span>
      </div>

      <div class="flex items-center gap-6">
        <div class="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <svg width="96" height="96" viewBox="0 0 96 96" class="transform -rotate-90" role="img" aria-label={`Affordability score: ${clampedPct}%`}>
            <circle cx="48" cy="48" r={radius} stroke="#E2E8F0" stroke-width="8" fill="transparent" />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={status.color}
              stroke-width="8"
              stroke-dasharray={circumference}
              stroke-dashoffset={strokeOffset}
              stroke-linecap="round"
              fill="transparent"
              class="transition-all duration-500"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span class="text-xs font-mono font-bold text-ink">{clampedPct}%</span>
            <span class="text-[9px] font-mono text-muted uppercase">{label}</span>
          </div>
        </div>

        <div class="space-y-1">
          <h4 class="font-heading font-bold text-lg text-ink">{title}</h4>
          <p class="text-xs text-body leading-relaxed">{status.desc}</p>
        </div>
      </div>
    </div>
  );
}
