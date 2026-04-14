import { UtensilsCrossed } from 'lucide-react';
import OfflineIndicator from './OfflineIndicator';
import InstallPWA from '../common/InstallPWA';
import { useHotel, HOTELS } from '../../context/HotelContext';

const Header = ({ title, rightContent }) => {
  const { selectedHotel, setSelectedHotel } = useHotel();

  const getTabStyle = (h) => {
    const isSalary = h === 'SALARY';
    const isActive = selectedHotel === h;

    if (isActive && isSalary) {
      return {
        background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
        color: 'white',
        boxShadow: '0 2px 14px rgba(245,158,11,0.45)',
      };
    }
    if (isActive) {
      return {
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        color: 'white',
        boxShadow: '0 2px 14px rgba(99,102,241,0.45)',
      };
    }
    if (isSalary) {
      return {
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.18)',
        color: 'rgba(251,191,36,0.55)',
      };
    }
    return {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: 'rgba(255,255,255,0.38)',
    };
  };

  return (
    <>
      <OfflineIndicator />
      <header
        className="sticky top-0 z-40 px-4 pt-3 pb-0"
        style={{
          background: 'rgba(6,7,26,0.88)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.45)',
              }}
            >
              <UtensilsCrossed className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                {title || 'RestauTrack'}
              </h1>
              <p className="text-[10px] leading-none" style={{ color: 'rgba(255,255,255,0.28)' }}>
                Restaurant Manager
              </p>
            </div>
          </div>

          {/* Right slot */}
          <div className="flex items-center gap-2">
            <InstallPWA />
            {rightContent}
          </div>
        </div>

        {/* Hotel + Salary tabs */}
        <div className="max-w-lg mx-auto mt-3 overflow-x-auto scrollbar-hide pb-3">
          <div className="flex items-center gap-2 px-0.5">
            {HOTELS.map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHotel(h)}
                className="whitespace-nowrap px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200"
                style={getTabStyle(h)}
              >
                {h === 'SALARY' ? '💰 Salary' : h}
              </button>
            ))}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
