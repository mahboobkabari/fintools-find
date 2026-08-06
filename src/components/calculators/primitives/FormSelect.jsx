export default function FormSelect({ id, label, value, options = [], onChange }) {
  return (
    <div class="mb-4">
      {label && (
        <label htmlFor={id} class="block text-sm font-medium text-ink mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        class="w-full bg-canvas text-ink text-sm font-medium rounded-md border border-hairline px-3 py-2 focus:border-primary focus:outline-none transition-colors"
      >
        {options.map((opt) => {
          const optVal = typeof opt === 'object' ? opt.value : opt;
          const optLbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={optVal} value={optVal}>
              {optLbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}
