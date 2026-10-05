type FeedbackToastProps = {
  message: string;
  onDismiss: () => void;
};

export function FeedbackToast({ message, onDismiss }: FeedbackToastProps) {
  if (!message) return null;

  return (
    <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-xl border border-emerald-500/30 bg-primary-container px-4 py-3 text-sm text-on-surface shadow-2xl">
      <span aria-hidden="true" className="text-emerald-600">✓</span>
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Tutup notifikasi" className="ml-2 text-on-surface-variant hover:text-on-surface">×</button>
    </div>
  );
}