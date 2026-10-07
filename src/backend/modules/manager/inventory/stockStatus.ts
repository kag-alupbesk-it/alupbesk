export function stockStatus(stock: number, threshold: number): string {
  if (stock <= 0) return "Out of Stock";
  if (stock < threshold) return "Critical";
  return "Healthy";
}
