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
      <span className="text-label-sm font-bold text-white">{label}</span>
      <input
        className="w-full rounded-xl border border-white/20 bg-white/10 p-4 text-white placeholder:text-white/40 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}
