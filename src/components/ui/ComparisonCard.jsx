import { formatCurrency } from '@utils/formatters.js';

/**
 * Universal ComparisonCard Framework
 * Supports 2-column or 3-column financial scenario comparisons, winner highlights, delta badges, and difference calculations.
 */
export default function ComparisonCard({
  title = 'Scenario Comparison',
  subtitle,
  scenarioA,
  scenarioB,
  columns,
  highlights = [],
  recommendationText,
}) {
  // Support flexible columns array or legacy scenarioA/scenarioB props
  const columnItems = columns
    ? columns
    : [
        scenarioA || { title: 'Scenario A', metrics: [] },
        scenarioB || { title: 'Scenario B', metrics: [], isRecommended: true },
      ];

  const colCount = Math.min(3, Math.max(1, columnItems.length));
  const gridColsClass = colCount === 3 ? 'grid md:grid-cols-3' : 'grid md:grid-cols-2';

  return (
    <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft hover:border-primary/50 transition-all">
      <div class="space-y-1">
        <h3 class="text-xl font-bold font-heading text-ink">{title}</h3>
        {subtitle && <p class="text-xs text-muted leading-relaxed">{subtitle}</p>}
      </div>

      {/* Multi-Column Grid */}
      <div class={`${gridColsClass} gap-4`}>
        {columnItems.map((col, cIdx) => {
          const isWinner = col.isRecommended || col.isWinner;
          return (
            <div
              key={cIdx}
              class={`p-5 rounded-2xl space-y-4 ${
                isWinner
                  ? 'bg-primary/5 border-2 border-primary/30 relative'
                  : 'bg-background border border-hairline'
              }`}
            >
              {isWinner && (
                <span class="absolute -top-3 right-4 bg-primary text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-pill shadow-soft">
                  RECOMMENDED
                </span>
              )}
              <div class="flex items-center justify-between border-b border-hairline-soft pb-3">
                <span class={`font-heading font-bold text-sm ${isWinner ? 'text-primary' : 'text-ink'}`}>
                  {col.title}
                </span>
                {col.badgeText && (
                  <span
                    class={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-pill ${
                      isWinner ? 'bg-primary/10 text-primary' : 'bg-surface-strong text-muted'
                    }`}
                  >
                    {col.badgeText}
                  </span>
                )}
              </div>

              <div class="space-y-2.5">
                {col.metrics &&
                  col.metrics.map((m, idx) => (
                    <div key={idx} class="flex justify-between items-center text-xs">
                      <span class="text-muted">{m.label}</span>
                      <span class={`font-mono font-bold ${m.color || (isWinner ? 'text-primary' : 'text-ink')}`}>
                        {typeof m.value === 'number' ? `₹${formatCurrency(m.value, 'INR')}` : m.value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Highlights / Delta Cards */}
      {highlights && highlights.length > 0 && (
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {highlights.map((h, idx) => (
            <div key={idx} class="p-3.5 bg-surface-strong border border-hairline rounded-xl space-y-1">
              <span class="text-[11px] font-semibold text-muted block">{h.label}</span>
              <div class="flex items-center gap-1.5 font-mono font-bold text-sm">
                <span class={h.isPositive ? 'text-semantic-success' : 'text-semantic-warning'}>
                  {h.isPositive ? '↓' : '↑'} {typeof h.delta === 'number' ? `₹${formatCurrency(h.delta, 'INR')}` : h.delta}
                </span>
                {h.pctDelta !== undefined && (
                  <span class="text-[10px] text-muted font-normal">({h.pctDelta}%)</span>
                )}
              </div>
              {h.desc && <p class="text-[10px] text-muted">{h.desc}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Recommendation Banner */}
      {recommendationText && (
        <div class="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 leading-relaxed font-medium flex items-start gap-2.5">
          <span class="text-semantic-success font-bold text-base mt-0.5">💡</span>
          <div>
            <strong>Smart Insight:</strong> {recommendationText}
          </div>
        </div>
      )}
    </div>
  );
}
