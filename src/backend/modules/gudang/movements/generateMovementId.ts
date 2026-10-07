export function generateMovementId(): string {
  return `mv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
