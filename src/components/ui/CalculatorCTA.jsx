export default function CalculatorCTA({ optionA, optionB }) {
  return (
    <div class="p-6 sm:p-8 rounded-3xl bg-surface-strong border border-hairline shadow-soft space-y-6">
      <div class="text-center space-y-2">
        <h3 class="text-xl font-bold font-heading text-ink">Ready to Calculate Your Custom Numbers?</h3>
        <p class="text-xs text-body max-w-xl mx-auto">
          Run your exact figures using our institutional-grade financial decision engines.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        {optionA.toolSlug && (
          <a
            href={`/tools/investment/${optionA.toolSlug}/`}
            class="p-4 bg-primary hover:bg-primary/90 text-white rounded-2xl text-center font-bold text-sm transition-all shadow-soft flex items-center justify-center gap-2 group"
          >
            <span>Launch {optionA.name} Calculator</span>
            <span class="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        )}

        {optionB.toolSlug && (
          <a
            href={`/tools/investment/${optionB.toolSlug}/`}
            class="p-4 bg-canvas hover:bg-surface-soft text-ink border border-hairline rounded-2xl text-center font-bold text-sm transition-all shadow-soft flex items-center justify-center gap-2 group"
          >
            <span>Launch {optionB.name} Calculator</span>
            <span class="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        )}
      </div>
    </div>
  );
}
