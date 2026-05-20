import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.tsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid credentials. Try operator1 / password');
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/nebula-bg.jpg)' }}
      />
      <div className="absolute inset-0 bg-bg-base/60 backdrop-blur-sm" />

      {/* Login card */}
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      >
        <div className="rounded-2xl backdrop-blur-xl border border-glass-border p-8" style={{ background: 'rgba(18,18,26,0.85)' }}>
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-2xl" style={{ background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)', color: '#0a0a0f' }}>
              P
            </div>
          </div>

          <h1 className="font-display font-bold text-2xl text-center text-text-primary mb-1">PRIMEDESK</h1>
          <p className="text-sm text-text-secondary text-center mb-6">Operator Authentication</p>

          {/* Shield icon */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-cyan/15 flex items-center justify-center">
              <Shield size={24} className="text-cyan" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5 font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="operator1"
                className="w-full px-4 py-3 rounded-lg bg-[#151520] border border-[rgba(255,255,255,0.06)] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan/50 focus:shadow-[0_0_0_3px_var(--cyan-dim)] transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  className="w-full px-4 py-3 pr-10 rounded-lg bg-[#151520] border border-[rgba(255,255,255,0.06)] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan/50 focus:shadow-[0_0_0_3px_var(--cyan-dim)] transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-display font-bold text-sm text-bg-base transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)' }}
            >
              {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>
          </form>

          <p className="text-xs text-text-muted text-center mt-4">
            Try: operator1 / password
          </p>
        </div>
      </motion.div>
    </div>
  );
}
