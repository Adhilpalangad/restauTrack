import { NavLink } from 'react-router-dom';
import { CalendarDays, History, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: CalendarDays, label: 'Today' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const BottomNav = () => {
  return (
    <nav
      className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-6 safe-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div
        className="flex items-center gap-1 px-2 py-2 rounded-[28px]"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid var(--nav-border)',
          boxShadow: 'var(--nav-shadow)',
        }}
      >
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className="flex-1">
            {({ isActive }) => (
              <div
                className="flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-[22px] transition-all duration-300 min-w-[64px]"
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        boxShadow: '0 4px 18px rgba(99, 102, 241, 0.45)',
                        color: 'white',
                      }
                    : { color: 'var(--nav-inactive)' }
                }
              >
                <Icon
                  className="w-5 h-5 transition-all duration-200"
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                <span className={`text-[10px] transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
