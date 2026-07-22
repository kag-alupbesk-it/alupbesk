export default function FormField({
  label,
  placeholder,
  type,
}: {
  label: string;
  placeholder: string;
  type: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-label-sm font-bold text-primary">{label}</span>
      <input
        className="w-full rounded-xl border border-primary-100 bg-bg-subtle p-4 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}
