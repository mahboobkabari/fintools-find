export default function InsightCard({ title = 'Dynamic Financial Intelligence', insights = [] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <section class="space-y-4 pt-2">
      <span class="text-xs font-mono font-bold uppercase tracking-wider text-primary block">{title}</span>

      <div class={`grid sm:grid-cols-${Math.min(3, insights.length)} gap-4 text-xs`}>
        {insights.map((item, idx) => (
          <div key={idx} class="p-5 bg-canvas border border-hairline rounded-2xl space-y-2 shadow-soft">
            <span class={`text-[11px] font-mono font-bold uppercase tracking-wider block ${item.labelColor || 'text-primary'}`}>
              {item.label}
            </span>
            <span class={`font-mono font-extrabold text-xl block ${item.valueColor || 'text-ink'}`}>
              {item.value}
            </span>
            <p class="text-body leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
