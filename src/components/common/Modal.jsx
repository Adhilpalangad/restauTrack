import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8 sm:items-center sm:pb-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{
          background: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className="relative w-full max-w-sm animate-scale-in overflow-hidden rounded-2xl"
        style={{
          background: 'var(--modal-bg)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid var(--modal-border)',
          boxShadow: 'var(--modal-shadow)',
        }}
      >
        {/* Top gradient accent */}
        <div
          className="h-0.5 w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #6366F1 30%, #8B5CF6 70%, transparent)',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all"
            style={{
              background: 'var(--close-btn-bg)',
              color: 'var(--close-btn-color)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--close-btn-bg-hover)';
              e.currentTarget.style.color = 'var(--close-btn-color-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--close-btn-bg)';
              e.currentTarget.style.color = 'var(--close-btn-color)';
            }}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-4" style={{ color: 'var(--text-secondary)' }}>
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex gap-3 px-5 pb-5">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
