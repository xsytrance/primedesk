import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Sun, Moon, Sunset } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Avatar from './Avatar';
import { currentUser, mockNotifications } from '@/data/mock';
import { timeAgo } from '@/data/mock';

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 6) return { label: 'night', icon: Moon, color: '#ff4fd8' };
  if (hour < 12) return { label: 'morning', icon: Sun, color: '#ffb347' };
  if (hour < 18) return { label: 'afternoon', icon: Sun, color: '#00d9ff' };
  return { label: 'evening', icon: Sunset, color: '#ff4fd8' };
}

export default function TopBar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const tod = getTimeOfDay();
  const TimeIcon = tod.icon;
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Greeting */}
        <div className="flex items-center gap-2">
          <h1 className="font-heading font-medium text-h2 text-text-primary">
            Good {tod.label},{' '}
            <span className="text-cyan">{currentUser.displayName}</span>
          </h1>
          <TimeIcon size={20} style={{ color: tod.color }} />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-cyan hover:bg-bg-surface transition-colors active:scale-95"
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
                          !notif.read && 'bg-cyan/5',
                        )}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{
                            backgroundColor: notif.type === 'error' ? '#ff4d6a' : notif.type === 'warning' ? '#ffb347' : notif.type === 'success' ? '#7dff9e' : '#00d9ff',
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
              borderColor={currentUser.color}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
