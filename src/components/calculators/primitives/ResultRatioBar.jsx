export default function ResultRatioBar({ items = [] }) {
  if (!items || items.length === 0) return null;

  const ariaLabelText = items.map((i) => `${i.label}: ${i.percentage}%`).join(', ');

  return (
    <div>
      <div
        class="h-3 w-full bg-surface-strong rounded-full overflow-hidden flex mb-2"
        role="img"
        aria-label={`Breakdown ratio: ${ariaLabelText}`}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{ width: `${item.percentage}%` }}
            class={`${item.colorClass || 'bg-primary'} h-full transition-all duration-300`}
            title={`${item.label}: ${item.percentage}%`}
          />
        ))}
      </div>
      <div class="flex justify-between text-xs font-mono text-muted">
        {items.map((item, idx) => (
          <span key={idx} class="flex items-center gap-1.5">
            <span class={`w-2.5 h-2.5 rounded-full ${item.colorClass || 'bg-primary'} inline-block`} />
            {item.label} ({item.percentage}%)
          </span>
        ))}
      </div>
    </div>
  );
}
