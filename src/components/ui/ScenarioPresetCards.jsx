export default function ScenarioPresetCards({ presets = [], activePreset, onSelect, label = 'Quick Scenario Presets' }) {
  if (!presets || presets.length === 0) return null;

  return (
    <section class="space-y-3" role="region" aria-label="Preset scenarios">
      <div class="flex items-center justify-between">
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">{label}</span>
        <span class="text-xs font-mono text-primary font-semibold">1-Tap Auto Fill</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {presets.map((p) => {
          const isSelected = activePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              class={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-glass scale-[1.02]'
                  : 'bg-canvas border-hairline hover:border-primary/50 text-ink shadow-soft'
              }`}
              aria-pressed={isSelected}
            >
              <div class="flex items-center justify-between">
                <span class="text-xl" aria-hidden="true">{p.icon}</span>
                {isSelected && <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>}
              </div>
              <div>
                <span class={`font-heading font-bold text-sm block ${isSelected ? 'text-white' : 'text-ink'}`}>
                  {p.label}
                </span>
                <span class={`text-[11px] font-mono block mt-0.5 ${isSelected ? 'text-blue-100' : 'text-muted'}`}>
                  {p.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
