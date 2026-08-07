import { formatCurrency } from '@utils/formatters.js';

/**
 * Universal Configuration-Driven Result Dashboard Engine
 * Powers KPI displays across all 194 calculators.
 */
export default function ResultDashboard({
  heroTitle = 'Calculation Result',
  heroValue = 0,
  heroBadge = 'Key Result',
  heroSubtext = '',
  metrics = [],
  currency = 'INR',
}) {
  const formatMetricValue = (val, fmt) => {
    if (typeof val !== 'number') return val;
    if (fmt === 'percentage') return `${val}%`;
    if (fmt === 'years') return `${val} Yrs`;
    if (fmt === 'raw') return val.toLocaleString('en-IN');
    return formatCurrency(val, currency);
  };

  return (
    <div class="space-y-4" role="region" aria-label="Calculation results summary">
      {/* Mega KPI Hero Card */}
      <div class="p-6 sm:p-8 bg-gradient-to-br from-blue-600 via-primary to-blue-800 text-white rounded-3xl shadow-glass space-y-3 relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-blue-100 font-heading">{heroTitle}</span>
          {heroBadge && (
            <span class="text-[11px] font-mono bg-white/20 px-3 py-1 rounded-pill font-bold text-white">
              {heroBadge}
            </span>
          )}
        </div>

        <div class="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight" aria-live="polite">
          {typeof heroValue === 'number' ? formatCurrency(heroValue, currency) : heroValue}
        </div>

        {heroSubtext && <p class="text-xs text-blue-100 leading-relaxed pt-1">{heroSubtext}</p>}
      </div>

      {/* Companion Metrics Grid (Configuration-Driven) */}
      {metrics && metrics.length > 0 && (
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1 hover:border-primary/40 transition-all"
            >
              <div class="flex items-center justify-between">
                <span class={`text-[11px] font-bold uppercase tracking-wider ${m.labelColor || 'text-muted'}`}>
                  {m.label}
                </span>
                {m.trend && (
                  <span class={`text-xs font-bold ${m.trend === 'up' ? 'text-semantic-success' : m.trend === 'down' ? 'text-semantic-warning' : 'text-muted'}`}>
                    {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '•'}
                  </span>
                )}
              </div>
              <span class={`text-base font-bold font-mono block truncate ${m.valueColor || 'text-ink'}`}>
                {formatMetricValue(m.value, m.format)}
              </span>
              {m.subtitle && <span class="text-[10px] text-muted block truncate">{m.subtitle}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
