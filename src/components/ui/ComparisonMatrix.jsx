export default function ComparisonMatrix({ matrix, optionA, optionB }) {
  if (!matrix || matrix.length === 0) return null;

  return (
    <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
      <div class="border-b border-hairline pb-4">
        <h3 class="text-xl font-bold font-heading text-ink">Side-by-Side Feature Matrix</h3>
        <p class="text-xs text-muted mt-1">Detailed feature comparison between {optionA.name} and {optionB.name}.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-hairline text-muted font-mono uppercase text-[11px]">
              <th class="py-3 px-4 font-bold">Feature / Parameter</th>
              <th class="py-3 px-4 font-bold text-primary">{optionA.name}</th>
              <th class="py-3 px-4 font-bold text-accent-sky">{optionB.name}</th>
              <th class="py-3 px-4 font-bold text-semantic-success">Winner</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-hairline text-ink">
            {matrix.map((row, idx) => (
              <tr key={idx} class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-3.5 px-4 font-semibold text-ink">{row.feature}</td>
                <td class="py-3.5 px-4 text-body">{row.optionA}</td>
                <td class="py-3.5 px-4 text-body">{row.optionB}</td>
                <td class="py-3.5 px-4">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold font-mono text-[11px] border border-emerald-500/20">
                    <span>🏆</span>
                    <span>{row.winner}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
