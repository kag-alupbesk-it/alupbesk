import type { InputHTMLAttributes } from "react";

type CurrencyInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number;
  onChange: (value: number) => void;
};

const numberFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

export function CurrencyInput({ value, onChange, className = "", ...props }: CurrencyInputProps) {
  const formattedValue = value > 0 ? numberFormatter.format(value) : "";

  return (
    <div className={`mt-2 flex items-center rounded-xl border border-outline/30 bg-surface-variant px-3 focus-within:border-secondary ${className}`}>
      <span className="mr-2 text-xs font-semibold text-on-surface-variant">Rp</span>
      <input
        {...props}
        type="text"
        inputMode="numeric"
        value={formattedValue}
        onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "")) || 0)}
        className="min-h-11 min-w-0 flex-1 bg-transparent py-2 text-base text-on-surface outline-none placeholder:text-on-surface-variant sm:text-xs md:min-h-0"
      />
    </div>
  );
}