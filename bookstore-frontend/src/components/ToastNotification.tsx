import { useEffect } from 'react';

interface ToastNotificationProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export default function ToastNotification({ message, show, onClose }: ToastNotificationProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
      <div className="toast show" role="alert" aria-live="assertive">
        <div className="toast-header bg-success text-white">
          <strong className="me-auto">Added to Cart</strong>
          <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close" />
        </div>
        <div className="toast-body">
          {message}
        </div>
      </div>
    </div>
  );
}
