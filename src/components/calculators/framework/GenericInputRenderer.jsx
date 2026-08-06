import FormInputNumber from '../primitives/FormInputNumber';
import FormToggleSwitch from '../primitives/FormToggleSwitch';
import FormSelect from '../primitives/FormSelect';

export default function GenericInputRenderer({ inputConfig, values, onChange }) {
  const { id, type = 'number', label, min = 0, max = 1000000, step = 1, prefix, suffix, minLabel, maxLabel, options } = inputConfig;
  const currentValue = values[id] ?? inputConfig.default;

  if (type === 'select') {
    return (
      <FormSelect
        id={id}
        label={label}
        value={currentValue}
        options={options}
        onChange={(val) => onChange(id, val)}
      />
    );
  }

  if (type === 'toggle') {
    return (
      <div class="mb-6 flex items-center justify-between">
        <FormToggleSwitch
          label={label}
          value={currentValue}
          options={options}
          onChange={(val) => onChange(id, val)}
        />
      </div>
    );
  }

  if (type === 'tenure') {
    const tenureType = values[`${id}Type`] || 'years';
    const maxYears = inputConfig.maxYears || 30;
    const maxMonths = inputConfig.maxMonths || 360;

    const handleTypeChange = (newType) => {
      if (newType === tenureType) return;
      onChange(`${id}Type`, newType);
      if (newType === 'months') {
        onChange(id, Math.min(maxMonths, currentValue * 12));
      } else {
        onChange(id, Math.max(1, Math.round(currentValue / 12)));
      }
    };

    return (
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <FormToggleSwitch
            label={label}
            value={tenureType}
            onChange={handleTypeChange}
            options={[
              { label: 'Yr', value: 'years' },
              { label: 'Mo', value: 'months' },
            ]}
          />

          <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-md border border-hairline focus-within:border-primary">
            <input
              type="number"
              id={id}
              value={currentValue}
              onInput={(e) => onChange(id, Number(e.currentTarget.value) || 1)}
              min={1}
              max={tenureType === 'years' ? maxYears : maxMonths}
              step={1}
              class="w-20 bg-transparent text-right font-mono text-sm font-semibold text-ink focus:outline-none"
              aria-label={`${label} quantity`}
            />
            <span class="text-xs font-mono text-muted ml-1">{tenureType === 'years' ? 'Yrs' : 'Mos'}</span>
          </div>
        </div>
        <input
          type="range"
          id={`${id}-slider`}
          min={1}
          max={tenureType === 'years' ? maxYears : maxMonths}
          step={1}
          value={currentValue}
          onInput={(e) => onChange(id, Number(e.currentTarget.value))}
          class="w-full h-2 bg-surface-strong rounded-lg appearance-none cursor-pointer accent-primary"
          aria-label={`${label} slider`}
        />
        <div class="flex justify-between text-[11px] font-mono text-muted mt-1">
          <span>1 {tenureType === 'years' ? 'Yr' : 'Mo'}</span>
          <span>{tenureType === 'years' ? `${maxYears} Yrs` : `${maxMonths} Mos`}</span>
        </div>
      </div>
    );
  }

  // Default number input with slider
  return (
    <FormInputNumber
      id={id}
      label={label}
      value={currentValue}
      min={min}
      max={max}
      step={step}
      prefix={prefix}
      suffix={suffix}
      onChange={(val) => onChange(id, val)}
      minLabel={minLabel}
      maxLabel={maxLabel}
    />
  );
}
