import React, { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
  showCancel?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
  showCancel = true
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmBtnClass = variant === 'danger' 
    ? 'btn btn-danger' 
    : 'btn btn-primary';

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.75)', 
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }} 
      onClick={onCancel}
    >
      <div 
        className="card" 
        style={{ 
          width: '100%', 
          maxWidth: 420, 
          padding: '1.5rem',
          margin: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>{title}</h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--fg-muted)' }}>{message}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          {showCancel && <button className="btn" onClick={onCancel}>{cancelLabel}</button>}
          <button 
            className={confirmBtnClass} 
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
