import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { HotelProvider } from './context/HotelContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthGuard from './components/auth/AuthGuard';
import LoginPage from './components/auth/LoginPage';
import AppLayout from './components/layout/AppLayout';

import TodayPage from './pages/TodayPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HotelProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <AuthGuard>
                    <AppLayout />
                  </AuthGuard>
                }
              >
                <Route path="/" element={<TodayPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </HotelProvider>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid var(--border)',
            },
            success: {
              iconTheme: { primary: '#2ECC71', secondary: 'var(--toast-bg)' },
            },
            error: {
              iconTheme: { primary: '#E74C3C', secondary: 'var(--toast-bg)' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
