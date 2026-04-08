import { UtensilsCrossed } from 'lucide-react';
import OfflineIndicator from './OfflineIndicator';
import InstallPWA from '../common/InstallPWA';
import { useHotel, HOTELS } from '../../context/HotelContext';

const Header = ({ title, rightContent }) => {
  // If the user is logged out, the context might not be available, but this is inside AppLayout guarded.
  // Wait, LoginPage doesn't use Header. So we're safe.
  const { selectedHotel, setSelectedHotel } = useHotel();

  return (
    <>
      <OfflineIndicator />
      <header className="bg-primary text-white px-4 py-3 sticky top-0 z-40 shadow-lg shadow-primary/20">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-4.5 h-4.5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">{title || 'RestauTrack'}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <InstallPWA />
            {rightContent}
          </div>
        </div>
        
        {/* Rich Hotel Selector Tabs */}
        <div className="max-w-lg mx-auto mt-3 overflow-x-auto scrollbar-hide pb-1">
          <div className="flex items-center gap-2 px-1">
            {HOTELS.map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHotel(h)}
                className={`whitespace-nowrap px-4 py-1.5 text-xs font-semibold rounded-full transition-all border shadow-sm ${
                  selectedHotel === h
                    ? 'bg-white text-primary border-white scale-100'
                    : 'bg-primary-light/50 border-white/10 text-white/70 hover:bg-white/10 hover:text-white scale-95'
                }`}
              >
                🏢 {h}
              </button>
            ))}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
