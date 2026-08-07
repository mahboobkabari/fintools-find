export default function ProsConsGrid({ prosCons, optionA, optionB }) {
  if (!prosCons) return null;

  return (
    <div class="grid md:grid-cols-2 gap-8">
      {/* Option A Pros & Cons */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-5 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <h4 class="text-lg font-bold font-heading text-primary">{optionA.name}</h4>
          <span class="text-xs font-mono font-semibold text-muted bg-surface-strong px-2 py-0.5 rounded-lg border border-hairline">
            {optionA.badge}
          </span>
        </div>

        <div class="space-y-3">
          <h5 class="text-xs font-mono font-bold uppercase text-semantic-success tracking-wider">Pros (Advantages)</h5>
          <ul class="space-y-2 text-xs text-body">
            {prosCons.optionA.pros.map((pro, idx) => (
              <li key={idx} class="flex items-start gap-2">
                <span class="text-semantic-success font-bold text-sm">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div class="space-y-3 pt-3 border-t border-hairline">
          <h5 class="text-xs font-mono font-bold uppercase text-semantic-danger tracking-wider">Cons (Drawbacks)</h5>
          <ul class="space-y-2 text-xs text-body">
            {prosCons.optionA.cons.map((con, idx) => (
              <li key={idx} class="flex items-start gap-2">
                <span class="text-semantic-danger font-bold text-sm">✕</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Option B Pros & Cons */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-5 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <h4 class="text-lg font-bold font-heading text-accent-sky">{optionB.name}</h4>
          <span class="text-xs font-mono font-semibold text-muted bg-surface-strong px-2 py-0.5 rounded-lg border border-hairline">
            {optionB.badge}
          </span>
        </div>

        <div class="space-y-3">
          <h5 class="text-xs font-mono font-bold uppercase text-semantic-success tracking-wider">Pros (Advantages)</h5>
          <ul class="space-y-2 text-xs text-body">
            {prosCons.optionB.pros.map((pro, idx) => (
              <li key={idx} class="flex items-start gap-2">
                <span class="text-semantic-success font-bold text-sm">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div class="space-y-3 pt-3 border-t border-hairline">
          <h5 class="text-xs font-mono font-bold uppercase text-semantic-danger tracking-wider">Cons (Drawbacks)</h5>
          <ul class="space-y-2 text-xs text-body">
            {prosCons.optionB.cons.map((con, idx) => (
              <li key={idx} class="flex items-start gap-2">
                <span class="text-semantic-danger font-bold text-sm">✕</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
