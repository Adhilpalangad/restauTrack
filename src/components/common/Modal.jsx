import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex gap-3 px-4 pb-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
