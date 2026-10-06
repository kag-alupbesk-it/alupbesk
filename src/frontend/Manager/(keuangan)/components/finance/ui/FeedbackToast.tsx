type FeedbackToastProps = {
  message: string;
  onDismiss: () => void;
};

export function FeedbackToast({ message, onDismiss }: FeedbackToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-xl border border-secondary/40 bg-primary-container px-4 py-3 text-xs font-semibold text-on-surface shadow-2xl"
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-secondary">
        check_circle
      </span>
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-outline/30 text-on-surface-variant transition-colors hover:border-secondary/50 hover:text-secondary md:h-7 md:w-7"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
          close
        </span>
      </button>
    </div>
  );
}