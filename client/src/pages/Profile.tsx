import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { currentUser, mockTickets, mockKBArticles, mockChatMessages } from '@/data/mock';
import type { User } from '@/data/mock';
import { useTheme } from '@/hooks/useTheme';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StatsGrid from '@/components/profile/StatsGrid';
import XPProgress from '@/components/profile/XPProgress';
import RecentActivity, { type XpEvent } from '@/components/profile/RecentActivity';
import ProfileActions from '@/components/profile/ProfileActions';
import ThemeCard from '@/components/theme/ThemeCard';
import ColorExtractor from '@/components/theme/ColorExtractor';

// ─── XP Event Generator ──────────────────────────────────────────────

function generateMockXpEvents(user: User): XpEvent[] {
  const now = new Date();
  const events: XpEvent[] = [];
  let id = 1;

  const userTickets = mockTickets.filter((t) => t.assignee === user.username);
  userTickets.forEach((ticket, i) => {
    events.push({
      id: id++,
      user_id: user.id,
      action_type: 'ticket-created',
      xp_amount: 5,
      description: `Created ticket #${ticket.number}`,
      created_at: new Date(now.getTime() - (i + 1) * 3600000 * 2).toISOString(),
    });
  });

  const userKbs = mockKBArticles.filter((kb) => kb.author === user.username);
  userKbs.forEach((kb, i) => {
    events.push({
      id: id++,
      user_id: user.id,
      action_type: 'kb-created',
      xp_amount: 30,
      description: `Wrote KB "${kb.title}"`,
      created_at: new Date(now.getTime() - (i + 1) * 86400000).toISOString(),
    });
    if (kb.version > 1) {
      events.push({
        id: id++,
        user_id: user.id,
        action_type: 'kb-updated',
        xp_amount: 10,
        description: `Updated KB "${kb.title}"`,
        created_at: new Date(now.getTime() - (i + 1) * 43200000).toISOString(),
      });
    }
  });

  mockTickets.forEach((ticket) => {
    ticket.comments.forEach((comment) => {
      if (comment.author === user.username) {
        events.push({
          id: id++,
          user_id: user.id,
          action_type: 'comment-added',
          xp_amount: 2,
          description: `Commented on #${ticket.number}`,
          created_at: comment.createdAt,
        });
      }
    });
  });

  const resolvedTickets = mockTickets.filter((t) => t.assignee === user.username && t.status === 'Resolved');
  resolvedTickets.forEach((ticket, i) => {
    events.push({
      id: id++,
      user_id: user.id,
      action_type: 'ticket-resolved',
      xp_amount: 15,
      description: `Resolved ticket #${ticket.number}`,
      created_at: new Date(now.getTime() - (i + 1) * 86400000 * 2).toISOString(),
    });
  });

  return events
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20);
}

// ─── Theme Studio (inline component) ─────────────────────────────────

function ThemeStudio() {
  const { theme, savedThemes, setTheme, saveTheme, deleteTheme, generateThemeFromColors } = useTheme();
  const [showCreate, setShowCreate] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#dc2626');
  const [secondaryColor, setSecondaryColor] = useState('#2563eb');
  const [extractedColors, setExtractedColors] = useState<{ primary: string; secondary: string } | null>(null);

  const handleCreateTheme = () => {
    const colors = extractedColors || { primary: primaryColor, secondary: secondaryColor };
    const generated = generateThemeFromColors(colors, newThemeName || 'Custom Theme');
    saveTheme({
      name: newThemeName || 'Custom Theme',
      characterId: 'custom',
      colors: generated.colors,
      effects: generated.effects,
      quote: 'Custom operative configuration.',
    });
    setShowCreate(false);
    setNewThemeName('');
    setExtractedColors(null);
  };

  const handleColorsExtracted = (colors: { primary: string; secondary: string }) => {
    setExtractedColors(colors);
    setPrimaryColor(colors.primary);
    setSecondaryColor(colors.secondary);
  };

  const allThemes = [
    { id: 'builtin-field-agent', name: 'Crimson Overdrive', characterId: 'egi' as const },
    { id: 'builtin-the-new-guy', name: 'Elastic Blue', characterId: 'patrick' as const },
    ...savedThemes,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <Palette size={18} style={{ color: 'var(--theme-primary)' }} />
        <h2 className="font-heading font-bold text-lg text-text-primary">Theme Studio</h2>
      </div>

      {/* Current Theme */}
      <div
        className="rounded-xl border p-4 mb-4"
        style={{
          background: 'rgba(18,18,26,0.8)',
          borderColor: 'var(--theme-primary)40',
        }}
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted mb-2">Active Theme</p>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl border"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              borderColor: `${theme.colors.primary}40`,
              boxShadow: `0 0 15px ${theme.colors.primaryGlow}`,
            }}
          />
          <div>
            <p className="font-display font-bold text-text-primary">{theme.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.primary }} />
              <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.secondary }} />
              <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.gradientEnd }} />
              <span className="text-[10px] font-mono text-text-muted ml-1 capitalize">
                {theme.effects.borderRadius} / {theme.effects.patternType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* All Themes Grid */}
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted mb-2">Available Themes</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {allThemes.map((t) => (
          <ThemeCard
            key={t.id}
            theme={t.id === 'builtin-field-agent'
              ? { id: 'builtin-field-agent', name: 'Crimson Overdrive', characterId: 'egi', colors: { primary: '#dc2626', primaryDim: 'rgba(220,38,38,0.15)', primaryGlow: 'rgba(220,38,38,0.3)', secondary: '#ea580c', secondaryDim: 'rgba(234,88,12,0.15)', blob1: 'rgba(220,38,38,0.1)', blob2: 'rgba(234,88,12,0.08)', gradientStart: '#dc2626', gradientEnd: '#991b1b', accentText: '#fca5a5' }, effects: { borderRadius: 'sharp', animationStyle: 'aggressive', patternType: 'web' }, quote: "I don't wait for things to happen. I MAKE THEM HAPPEN." }
              : t.id === 'builtin-the-new-guy'
                ? { id: 'builtin-the-new-guy', name: 'Elastic Blue', characterId: 'patrick', colors: { primary: '#2563eb', primaryDim: 'rgba(37,99,235,0.15)', primaryGlow: 'rgba(37,99,235,0.3)', secondary: '#06b6d4', secondaryDim: 'rgba(6,182,212,0.15)', blob1: 'rgba(37,99,235,0.1)', blob2: 'rgba(6,182,212,0.08)', gradientStart: '#2563eb', gradientEnd: '#1e40af', accentText: '#93c5fd' }, effects: { borderRadius: 'smooth', animationStyle: 'elastic', patternType: 'dots' }, quote: 'If it has a screen, a speaker, a lens, or a spotlight... I can handle it.' }
                : t as any
            }
            isActive={theme.id === t.id}
            onApply={() => setTheme(t.id)}
            onDelete={!t.id.startsWith('builtin') ? () => deleteTheme(t.id) : undefined}
          />
        ))}
      </div>

      {/* Create Theme Toggle */}
      <button
        onClick={() => setShowCreate(!showCreate)}
        className="w-full py-2.5 rounded-xl border border-dashed text-sm font-medium transition-colors flex items-center justify-center gap-2"
        style={{
          borderColor: 'var(--theme-primary)40',
          color: 'var(--theme-accent-text)',
        }}
      >
        <Wand2 size={16} />
        {showCreate ? 'Cancel' : 'Create Custom Theme'}
        {showCreate ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Create Theme Panel */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 p-4 rounded-xl border space-y-4"
              style={{
                background: 'rgba(18,18,26,0.6)',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              {/* Color Extractor */}
              <ColorExtractor onColorsExtracted={handleColorsExtracted} />

              {/* Manual color pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5 block">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-text-secondary">{primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5 block">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-text-secondary">{secondaryColor}</span>
                  </div>
                </div>
              </div>

              {/* Theme name */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5 block">
                  Theme Name
                </label>
                <input
                  type="text"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="e.g. Midnight Burn"
                  className="w-full px-3 py-2 rounded-lg bg-[#151520] border border-[rgba(255,255,255,0.06)] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[var(--theme-primary)] text-sm"
                />
              </div>

              {/* Preview */}
              <div
                className="p-3 rounded-lg flex items-center gap-3"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${extractedColors?.primary || primaryColor}, ${extractedColors?.secondary || secondaryColor})` }}
                />
                <div className="flex-1">
                  <p className="text-xs text-text-muted">Preview</p>
                  <div className="h-1 rounded-full mt-1" style={{ background: extractedColors?.primary || primaryColor }} />
                </div>
              </div>

              {/* Create button */}
              <button
                onClick={handleCreateTheme}
                className="w-full py-2.5 rounded-xl font-display font-bold text-sm tracking-wider text-white transition-all active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${extractedColors?.primary || primaryColor}, ${extractedColors?.secondary || secondaryColor})`,
                  boxShadow: `0 4px 15px ${extractedColors?.primary || primaryColor}40`,
                }}
              >
                GENERATE & SAVE THEME
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Profile Page ───────────────────────────────────────────────

export default function Profile() {
  const user = currentUser;

  const stats = useMemo(() => {
    const ticketsCreated = mockTickets.filter((t) => t.assignee === user.username).length;
    const ticketsResolved = mockTickets.filter(
      (t) => t.assignee === user.username && (t.status === 'Resolved' || t.status === 'Closed'),
    ).length;
    const kbArticles = mockKBArticles.filter((kb) => kb.author === user.username).length;
    const messagesSent = mockChatMessages.filter((m) => m.author === user.username).length;
    return { ticketsCreated, ticketsResolved, kbArticles, messagesSent };
  }, [user.username]);

  const xpEvents = useMemo(() => generateMockXpEvents(user), [user]);

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="py-2"
      >
        <h1 className="font-heading font-bold text-h1 text-text-primary">Profile</h1>
      </motion.div>

      {/* Profile Hero Card */}
      <ProfileHeader user={user} />

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <StatsGrid
          ticketsCreated={stats.ticketsCreated}
          ticketsResolved={stats.ticketsResolved}
          kbArticles={stats.kbArticles}
          messagesSent={stats.messagesSent}
        />
      </motion.div>

      {/* XP Progression */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <XPProgress currentXp={user.xp} />
      </motion.div>

      {/* THEME STUDIO — NEW */}
      <ThemeStudio />

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        <RecentActivity events={xpEvents} />
      </motion.div>

      {/* Profile Actions / Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.55 }}
      >
        <ProfileActions />
      </motion.div>
    </div>
  );
}
