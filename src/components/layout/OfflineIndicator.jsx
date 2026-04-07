import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white text-xs font-medium py-1 px-3 flex items-center justify-center gap-1.5 animate-slide-in">
      <WifiOff className="w-3.5 h-3.5" />
      <span>You're offline — changes saved locally</span>
    </div>
  );
};

export default OfflineIndicator;
