import { UtensilsCrossed } from 'lucide-react';
import OfflineIndicator from './OfflineIndicator';
import InstallPWA from '../common/InstallPWA';

const Header = ({ title, rightContent }) => {
  return (
    <>
      <OfflineIndicator />
      <header className="bg-primary text-white px-4 py-3 sticky top-0 z-40 shadow-lg shadow-primary/20">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-4.5 h-4.5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">{title || 'RestauTrack'}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <InstallPWA />
            {rightContent}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
