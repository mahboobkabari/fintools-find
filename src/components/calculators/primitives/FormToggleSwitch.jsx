export default function FormToggleSwitch({ options = [], value, onChange, label }) {
  return (
    <div class="flex items-center gap-2">
      {label && <span class="text-sm font-medium text-ink">{label}</span>}
      <div class="flex bg-surface-strong p-0.5 rounded-pill border border-hairline text-xs font-medium">
        {options.map((opt) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          const isActive = value === optValue;
          return (
            <button
              key={optValue}
              type="button"
              onClick={() => onChange(optValue)}
              class={`px-3 py-1 rounded-pill transition-colors ${
                isActive ? 'bg-primary text-white font-semibold' : 'text-body hover:text-ink'
              }`}
            >
              {optLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
