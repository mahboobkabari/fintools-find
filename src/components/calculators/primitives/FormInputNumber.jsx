import { useState, useEffect } from 'preact/hooks';

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

  return (
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <label htmlFor={id} class="text-sm font-medium text-ink">
          {label}
        </label>
        <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-md border border-hairline focus-within:border-primary">
          {prefix && <span class="text-sm font-mono text-muted mr-1">{prefix}</span>}
          <input
            type="number"
            id={id}
            value={displayValue}
            onInput={handleInputChange}
            onBlur={handleBlur}
            min={min}
            max={max}
            step={step}
            class="w-32 bg-transparent text-right font-mono text-sm font-semibold text-ink focus:outline-none"
          />
          {suffix && <span class="text-xs font-mono text-muted ml-1">{suffix}</span>}
        </div>
      </div>

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
        class="w-full h-2 bg-surface-strong rounded-lg appearance-none cursor-pointer accent-primary"
        aria-label={`${label} slider`}
      />

      {(minLabel || maxLabel) && (
        <div class="flex justify-between text-[11px] font-mono text-muted mt-1">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
