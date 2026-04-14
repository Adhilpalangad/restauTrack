import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <main className="flex-1 max-w-lg mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
