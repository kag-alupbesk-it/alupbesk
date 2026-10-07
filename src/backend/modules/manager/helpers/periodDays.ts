const WINDOWS: Record<string, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

export function periodDays(period?: string): number {
  return (period && WINDOWS[period]) || WINDOWS.monthly;
}
