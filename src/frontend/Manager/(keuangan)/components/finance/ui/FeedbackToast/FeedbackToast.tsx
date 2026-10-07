import { iconMd, iconXs, modalClose, toastPanel } from "../../style/style";

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
      className={toastPanel}
    >
      <span aria-hidden="true" className={`${iconMd} text-secondary`}>
        check_circle
      </span>
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Tutup notifikasi" className={`ml-1 ${modalClose}`}>
        <span aria-hidden="true" className={iconXs}>
          close
        </span>
      </button>
    </div>
  );
}