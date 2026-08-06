import { formatCurrency } from '@utils/formatters.js';

export default function ResultDashboard({
  heroTitle = 'Required Monthly EMI',
  heroValue = 0,
  heroBadge = 'Fixed Installment',
  heroSubtext = '',
  metrics = [],
  currency = 'INR',
}) {
  return (
    <div class="space-y-4" role="region" aria-label="Calculation results summary">
      {/* Mega KPI Hero Card */}
      <div class="p-6 sm:p-8 bg-gradient-to-br from-blue-600 via-primary to-blue-800 text-white rounded-3xl shadow-glass space-y-3 relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-blue-100 font-heading">{heroTitle}</span>
          <span class="text-[11px] font-mono bg-white/20 px-3 py-1 rounded-pill font-bold text-white">{heroBadge}</span>
        </div>

        <div class="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight" aria-live="polite">
          {typeof heroValue === 'number' ? formatCurrency(heroValue, currency) : heroValue}
        </div>

        {heroSubtext && (
          <p class="text-xs text-blue-100 leading-relaxed pt-1">
            {heroSubtext}
          </p>
        )}
      </div>

      {/* Companion Metrics Grid */}
      {metrics && metrics.length > 0 && (
        <div class={`grid grid-cols-${Math.min(4, metrics.length)} gap-3`}>
          {metrics.map((m, idx) => (
            <div key={idx} class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft">
              <span class={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${m.labelColor || 'text-muted'}`}>
                {m.label}
              </span>
              <span class={`text-xs sm:text-base font-bold font-mono block truncate ${m.valueColor || 'text-ink'}`}>
                {typeof m.value === 'number' ? formatCurrency(m.value, currency) : m.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
