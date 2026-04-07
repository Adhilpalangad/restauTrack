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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-bottom" role="navigation" aria-label="Main navigation">
      <div className="max-w-lg mx-auto flex items-center justify-around py-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all duration-200 min-w-[64px] ${
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-body'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'stroke-[2.5]' : ''}`} />
                </div>
                <span className={`text-[10px] font-medium transition-all ${isActive ? 'font-semibold' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
