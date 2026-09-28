export function formatPMDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function getPMInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getPMDayLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

// Sapaan mengikuti jam lokal. Nilainya hanya boleh dipanggil setelah mount karena
// server dan client berada di zona waktu berbeda, sehingga hasil hitungan bisa berbeda.
export function getPMGreeting(now: Date) {
  const hour = now.getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}
