import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Palette, Bell, Volume2, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.tsx';

export default function ProfileActions() {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <h3 className="text-xs font-mono uppercase tracking-[0.28em] text-text-secondary mb-3">Settings</h3>
      <div className="rounded-2xl overflow-hidden space-y-1" style={{ background: 'rgba(18,18,26,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Change Password */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Key size={18} className="text-cyan" />
            <span className="text-sm text-text-primary">Change Passcode</span>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </motion.button>

        {/* Theme Color */}
        <div className="h-[1px] bg-[rgba(255,255,255,0.04)]" />
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Palette size={18} className="text-magenta" />
            <span className="text-sm text-text-primary">Theme Color</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-cyan border border-white/20" />
            <ChevronRight size={16} className="text-text-muted" />
          </div>
        </motion.button>

        {/* Notifications */}
        <div className="h-[1px] bg-[rgba(255,255,255,0.04)]" />
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-amber" />
            <span className="text-sm text-text-primary">Notifications</span>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className="relative w-11 h-6 rounded-full transition-colors duration-200"
            style={{ backgroundColor: notifications ? 'var(--cyan)' : 'var(--bg-surface)' }}
          >
            <motion.div
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
              animate={{ x: notifications ? 20 : 0 }}
              transition={{ duration: 0.2 }}
            />
          </button>
        </div>

        {/* Sound Effects */}
        <div className="h-[1px] bg-[rgba(255,255,255,0.04)]" />
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Volume2 size={18} className="text-green" />
            <span className="text-sm text-text-primary">Sound Effects</span>
          </div>
          <button
            onClick={() => setSoundEffects(!soundEffects)}
            className="relative w-11 h-6 rounded-full transition-colors duration-200"
            style={{ backgroundColor: soundEffects ? 'var(--cyan)' : 'var(--bg-surface)' }}
          >
            <motion.div
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
              animate={{ x: soundEffects ? 20 : 0 }}
              transition={{ duration: 0.2 }}
            />
          </button>
        </div>

        {/* Log Out */}
        <div className="h-[1px] bg-[rgba(255,255,255,0.04)]" />
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} className="text-red" />
            <span className="text-sm text-text-primary">Log Out</span>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </motion.button>
      </div>

      {/* Logout Confirmation */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-bg-elevated rounded-xl p-5 w-full max-w-sm border border-[rgba(255,255,255,0.06)] space-y-4"
            >
              <h3 className="font-heading font-medium text-text-primary text-lg">Log Out</h3>
              <p className="text-sm text-text-secondary">Log out of PrimeDesk?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-bg-surface hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: 'linear-gradient(135deg, #ff4d6a, #ff4fd8)' }}
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
