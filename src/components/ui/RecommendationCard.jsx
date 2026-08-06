import { formatCurrency } from '@utils/formatters.js';

export default function RecommendationCard({
  tagLine = 'Smart Prepayment Coach',
  badgeText = '1 Extra EMI / Year',
  title = 'Save Interest & Finish Early',
  description = '',
  metrics = [],
  currency = 'INR',
}) {
  return (
    <div class="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-glass space-y-4 relative overflow-hidden">
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <span class="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {tagLine}
        </span>
        {badgeText && (
          <span class="text-[10px] font-mono bg-white/10 text-white px-2.5 py-0.5 rounded-pill font-bold">
            {badgeText}
          </span>
        )}
      </div>

      <h4 class="font-heading font-bold text-xl text-white">{title}</h4>

      {description && <p class="text-xs text-slate-300 leading-relaxed">{description}</p>}

      {metrics && metrics.length > 0 && (
        <div class={`grid grid-cols-${Math.min(3, metrics.length)} gap-3 pt-1`}>
          {metrics.map((m, idx) => (
            <div key={idx} class="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
              <span class={`text-[11px] font-mono uppercase tracking-wider block font-semibold ${m.labelColor || 'text-emerald-300'}`}>
                {m.label}
              </span>
              <span class="text-lg font-bold font-mono text-white block">
                {typeof m.value === 'number' ? formatCurrency(m.value, currency) : m.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
