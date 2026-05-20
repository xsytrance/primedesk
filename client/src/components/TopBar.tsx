import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Sun, Moon, Sunset } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import Avatar from './Avatar';
import { currentUser, mockNotifications } from '@/data/mock';
import { timeAgo } from '@/data/mock';

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 6) return { label: 'night', icon: Moon };
  if (hour < 12) return { label: 'morning', icon: Sun };
  if (hour < 18) return { label: 'afternoon', icon: Sun };
  return { label: 'evening', icon: Sunset };
}

export default function TopBar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const { theme } = useTheme();
  const tod = getTimeOfDay();
  const TimeIcon = tod.icon;
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  // Character tagline based on current user
  const tagline = theme.characterId === 'egi' ? 'Field Agent' : theme.characterId === 'patrick' ? 'The New Guy' : 'Operative';

  return (
    <header className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Greeting */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <h1 className="font-heading font-medium text-h2 text-text-primary leading-tight">
              Good {tod.label},{' '}
              <span style={{ color: 'var(--theme-primary)' }}>{currentUser.displayName}</span>
            </h1>
            <span
              className="text-[10px] font-mono uppercase tracking-[0.2em]"
              style={{ color: 'var(--theme-accent-text)' }}
            >
              {tagline} // {theme.name}
            </span>
          </div>
          <TimeIcon size={20} style={{ color: 'var(--theme-primary)' }} />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:bg-bg-surface transition-colors active:scale-95"
              style={{ '--hover-color': 'var(--theme-primary)' } as React.CSSProperties}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red" />
              )}
            </button>

            {/* Notification dropdown */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 bg-bg-elevated border border-glass-border rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.04)]">
                    <span className="font-heading font-medium text-sm text-text-primary">Notifications</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {mockNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)]',
                          !notif.read && 'bg-[var(--theme-primary-dim)]',
                        )}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{
                            backgroundColor: notif.type === 'error' ? '#ff4d6a' : notif.type === 'warning' ? '#ffb347' : notif.type === 'success' ? '#7dff9e' : 'var(--theme-primary)',
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm', !notif.read ? 'text-text-primary' : 'text-text-secondary')}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">{timeAgo(notif.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <Link to="/profile">
            <Avatar
              src={currentUser.avatar}
              fallback={currentUser.initials}
              size={40}
              borderColor="var(--theme-primary)"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
