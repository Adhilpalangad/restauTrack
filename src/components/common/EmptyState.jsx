import { ClipboardList } from 'lucide-react';

const EmptyState = ({ icon: Icon = ClipboardList, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
        style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.06)',
        }}
      >
        <Icon className="w-9 h-9" style={{ color: 'rgba(129, 140, 248, 0.6)' }} />
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm max-w-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
};

export default EmptyState;
