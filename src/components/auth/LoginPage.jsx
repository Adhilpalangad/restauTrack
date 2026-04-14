import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../../services/auth';
import { UtensilsCrossed, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        toast.error('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Try again later.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#06071A' }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full animate-pulse-soft"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full animate-pulse-soft"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)',
            animationDelay: '1.2s',
          }}
        />
        <div
          className="absolute top-1/3 right-0 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 animate-float"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              boxShadow: '0 10px 40px rgba(99,102,241,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">RestauTrack</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>
            Smart Restaurant Finance Manager
          </p>
        </div>

        {/* Glass form card */}
        <div
          className="rounded-2xl p-6 animate-slide-up"
          style={{
            background: 'rgba(13, 15, 39, 0.82)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          {/* Top accent line */}
          <div
            className="h-px w-full rounded-full mb-6"
            style={{
              background: 'linear-gradient(90deg, transparent, #6366F1 35%, #8B5CF6 65%, transparent)',
            }}
          />

          <h2 className="text-lg font-bold text-white mb-6 text-center">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-[11px] font-bold uppercase tracking-wider mb-2"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.22)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@restaurant.com"
                  className="input-field pl-10"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[11px] font-bold uppercase tracking-wider mb-2"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.22)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-11"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.22)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.18)' }}>
          Secure login · End-to-end encrypted
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
