import { useState, useEffect } from 'preact/hooks';

/**
 * Enhanced Universal FormInputNumber Component
 * Provides synchronized number input field and range slider with dynamic gradient track fill.
 */
export default function FormInputNumber({
  id,
  label,
  value,
  min = 0,
  max = 100000000,
  step = 1,
  prefix = '',
  suffix = '',
  onChange,
  minLabel,
  maxLabel,
  subText,
  badgeText,
  inputWidthClass = 'w-32',
  trackColor = '#2563EB',
}) {
  const [displayValue, setDisplayValue] = useState(String(value ?? ''));

  useEffect(() => {
    setDisplayValue(String(value ?? ''));
  }, [value]);

  const handleInputChange = (e) => {
    const rawVal = e.currentTarget.value;
    setDisplayValue(rawVal);
    if (rawVal !== '' && !isNaN(Number(rawVal))) {
      const num = Number(rawVal);
      onChange(num);
    }
  };

  const handleBlur = () => {
    if (displayValue === '' || isNaN(Number(displayValue))) {
      setDisplayValue(String(min));
      onChange(min);
    } else {
      const num = Math.min(max, Math.max(min, Number(displayValue)));
      setDisplayValue(String(num));
      onChange(num);
    }
  };

  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min || 1)) * 100));

  return (
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <div>
          <label htmlFor={id} class="text-sm font-semibold text-ink flex items-center gap-1.5">
            <span>{label}</span>
            {badgeText && (
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-pill bg-primary/10 text-primary">
                {badgeText}
              </span>
            )}
          </label>
          {subText && <span class="text-[11px] font-mono text-semantic-success font-bold block">{subText}</span>}
        </div>

        <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary min-h-[44px]">
          {prefix && <span class="text-xs font-mono text-muted mr-1 font-bold">{prefix}</span>}
          <input
            type="number"
            id={id}
            value={displayValue}
            onInput={handleInputChange}
            onBlur={handleBlur}
            min={min}
            max={max}
            step={step}
            class={`${inputWidthClass} bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none`}
            aria-label={`${label} input`}
          />
          {suffix && <span class="text-xs font-mono text-muted ml-1 font-bold">{suffix}</span>}
        </div>
      </div>

      <div class="relative pt-1 flex flex-col justify-center min-h-[36px]">
        <input
          type="range"
          id={`${id}-slider`}
          min={min}
          max={max}
          step={step}
          value={value}
          onInput={(e) => {
            const val = Number(e.currentTarget.value);
            setDisplayValue(String(val));
            onChange(val);
          }}
          style={{
            background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${pct}%, #E2E8F0 ${pct}%, #E2E8F0 100%)`,
          }}
          class="w-full h-3 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label={`${label} slider`}
        />
        {(minLabel || maxLabel) && (
          <div class="flex justify-between text-[11px] font-mono text-muted mt-1 font-medium">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
