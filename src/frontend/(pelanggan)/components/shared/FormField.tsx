export default function FormField({
  label,
  placeholder,
  type,
  value,
  onChange,
  required = false,
  maxLength,
}: {
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-label-sm font-bold text-on-surface">{label}</span>
      <input
        className="w-full rounded-xl border border-outline/30 bg-surface-container p-4 text-on-surface placeholder:text-on-surface/40 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
        placeholder={placeholder}
        type={type}
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
