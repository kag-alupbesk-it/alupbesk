export function getWhatsAppUrl(number: string, message = ""): string | null {
  const digits = number.replace(/\D/g, "");
  const internationalNumber = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits;

  if (!internationalNumber) return null;

  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${internationalNumber}${query}`;
}
