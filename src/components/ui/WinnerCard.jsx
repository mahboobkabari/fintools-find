export default function WinnerCard({ winner, optionA, optionB }) {
  if (!winner) return null;

  return (
    <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-canvas to-emerald-500/5 border-2 border-emerald-500/40 shadow-soft space-y-3">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill font-mono text-xs font-bold text-white bg-semantic-success">
          <span>🏆</span>
          <span>VERDICT: {winner.name.toUpperCase()} WINS FOR MOST USERS</span>
        </span>
        <span class="text-xs font-mono font-bold text-muted bg-surface-strong px-2.5 py-1 rounded-xl border border-hairline">
          Expert Recommendation
        </span>
      </div>

      <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
        {winner.name}: The Smarter Financial Choice
      </h2>
      <p class="text-xs sm:text-sm text-body leading-relaxed max-w-3xl">
        {winner.summary}
      </p>

      <div class="pt-3 border-t border-hairline/60 flex items-center gap-4 flex-wrap text-xs text-body">
        <div class="flex items-center gap-1.5 font-semibold">
          <span class="text-semantic-success">✓</span>
          <span>{optionA.name}: {optionA.badge}</span>
        </div>
        <div class="flex items-center gap-1.5 font-semibold text-muted">
          <span class="text-muted">•</span>
          <span>{optionB.name}: {optionB.badge}</span>
        </div>
      </div>
    </div>
  );
}
