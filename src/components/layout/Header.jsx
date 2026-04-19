import { UtensilsCrossed, Sun, Moon } from 'lucide-react';
import OfflineIndicator from './OfflineIndicator';
import InstallPWA from '../common/InstallPWA';
import { useHotel, HOTELS } from '../../context/HotelContext';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ title, rightContent }) => {
  const { selectedHotel, setSelectedHotel } = useHotel();
  const { isDark, toggle } = useTheme();

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
      background: 'var(--hotel-tab-inactive-bg)',
      border: '1px solid var(--hotel-tab-inactive-border)',
      color: 'var(--hotel-tab-inactive-color)',
    };
  };

  return (
    <>
      <OfflineIndicator />
      <header
        className="sticky top-0 z-40 px-4 pt-3 pb-0"
        style={{
          background: 'var(--header-bg)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderBottom: '1px solid var(--header-border)',
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
              <h1 className="text-sm font-bold tracking-tight leading-tight" style={{ color: 'var(--text)' }}>
                {title || 'RestauTrack'}
              </h1>
              <p className="text-[10px] leading-none" style={{ color: 'var(--text-muted)' }}>
                Restaurant Manager
              </p>
            </div>
          </div>

          {/* Right slot */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: 'var(--btn-ghost-bg)',
                border: '1px solid var(--btn-ghost-border)',
                color: 'var(--text-muted)',
              }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
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
