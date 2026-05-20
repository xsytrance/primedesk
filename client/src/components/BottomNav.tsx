import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ClipboardList, MessageSquare, BookOpen, Plus, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: typeof Home;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Tickets', icon: ClipboardList, path: '/tickets' },
  { label: '', icon: Plus, path: '#' }, // FAB placeholder
  { label: 'Chat', icon: MessageSquare, path: '/warroom' },
  { label: 'KB', icon: BookOpen, path: '/kb' },
];

const sidebarItems = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Tickets', icon: ClipboardList, path: '/tickets' },
  { label: 'Laptops', icon: Laptop, path: '/laptops' },
  { label: 'Chat', icon: MessageSquare, path: '/warroom' },
  { label: 'KB', icon: BookOpen, path: '/kb' },
];

export default function BottomNav() {
  const location = useLocation();
  const [fabOpen, setFabOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="h-16 bg-[#12121a]/90 backdrop-blur-xl border-t border-[rgba(255,255,255,0.06)] flex items-center justify-around px-2">
          {navItems.map((item, index) => {
            if (index === 2) {
              // FAB
              return (
                <div key="fab" className="relative">
                  {/* Ping ring */}
                  <span className="absolute inset-0 rounded-full border-2 border-cyan animate-ping-ring" />
                  <button
                    onClick={() => setFabOpen(!fabOpen)}
                    className={cn(
                      'relative w-14 h-14 rounded-full flex items-center justify-center',
                      'active:scale-95 transition-transform',
                    )}
                    style={{ background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)', boxShadow: '0 4px 20px rgba(0,217,255,0.3)' }}
                  >
                    <motion.div
                      animate={{ rotate: fabOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus size={24} className="text-white" />
                    </motion.div>
                  </button>

                  {/* FAB Menu */}
                  <AnimatePresence>
                    {fabOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 mb-2 bg-bg-elevated border border-glass-border rounded-xl p-2 shadow-xl flex flex-col gap-1 min-w-[160px]"
                      >
                        <Link
                          to="/tickets"
                          onClick={() => setFabOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-surface transition-colors"
                        >
                          <ClipboardList size={16} className="text-cyan" /> New Ticket
                        </Link>
                        <Link
                          to="/laptops"
                          onClick={() => setFabOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-surface transition-colors"
                        >
                          <Laptop size={16} className="text-magenta" /> Add Laptop
                        </Link>
                        <Link
                          to="/kb"
                          onClick={() => setFabOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-surface transition-colors"
                        >
                          <BookOpen size={16} className="text-green" /> New Article
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all active:scale-95',
                  active ? 'text-cyan' : 'text-text-muted hover:text-text-secondary',
                )}
              >
                <item.icon
                  size={22}
                  className={cn(active && 'drop-shadow-[0_0_6px_rgba(0,217,255,0.4)]')}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[72px] z-50 flex-col items-center py-4 bg-[#12121a]/90 backdrop-blur-xl border-r border-[rgba(255,255,255,0.06)]">
        {/* Logo */}
        <Link to="/" className="mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-lg" style={{ background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)', color: '#0a0a0f' }}>
            P
          </div>
        </Link>

        {/* Nav items */}
        <div className="flex-1 flex flex-col items-center gap-2 pt-4">
          {sidebarItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                  'hover:bg-bg-surface active:scale-95',
                  active ? 'text-cyan bg-cyan/10' : 'text-text-muted hover:text-text-secondary',
                )}
                title={item.label}
              >
                <item.icon size={22} className={cn(active && 'drop-shadow-[0_0_6px_rgba(0,217,255,0.4)]')} />
              </Link>
            );
          })}
        </div>

        {/* FAB on sidebar */}
        <div className="mb-4 relative">
          <span className="absolute inset-0 rounded-full border-2 border-cyan animate-ping-ring" />
          <button
            onClick={() => setFabOpen(!fabOpen)}
            className={cn(
              'relative w-12 h-12 rounded-full flex items-center justify-center',
              'active:scale-95 transition-transform',
            )}
            style={{ background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)', boxShadow: '0 4px 20px rgba(0,217,255,0.3)' }}
          >
            <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
              <Plus size={20} className="text-white" />
            </motion.div>
          </button>

          <AnimatePresence>
            {fabOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.9 }}
                className="absolute bottom-0 left-14 ml-2 bg-bg-elevated border border-glass-border rounded-xl p-2 shadow-xl flex flex-col gap-1 min-w-[150px]"
              >
                <Link to="/tickets" onClick={() => setFabOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-surface">
                  <ClipboardList size={14} className="text-cyan" /> New Ticket
                </Link>
                <Link to="/laptops" onClick={() => setFabOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-surface">
                  <Laptop size={14} className="text-magenta" /> Add Laptop
                </Link>
                <Link to="/kb" onClick={() => setFabOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-surface">
                  <BookOpen size={14} className="text-green" /> New Article
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
}
