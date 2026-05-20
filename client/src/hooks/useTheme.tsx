import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────

export interface ThemeColors {
  primary: string;
  primaryDim: string;
  primaryGlow: string;
  secondary: string;
  secondaryDim: string;
  blob1: string;
  blob2: string;
  gradientStart: string;
  gradientEnd: string;
  accentText: string;
}

export interface ThemeEffects {
  borderRadius: 'sharp' | 'smooth' | 'round';
  animationStyle: 'aggressive' | 'elastic' | 'balanced';
  patternType: 'grid' | 'dots' | 'web' | 'none';
}

export interface CharacterTheme {
  id: string;
  name: string;
  characterId: 'egi' | 'patrick' | 'custom';
  colors: ThemeColors;
  effects: ThemeEffects;
  quote: string;
}

interface ThemeContextValue {
  theme: CharacterTheme;
  savedThemes: CharacterTheme[];
  setTheme: (themeId: string) => void;
  saveTheme: (theme: Omit<CharacterTheme, 'id'>) => string;
  deleteTheme: (themeId: string) => void;
  applyUserTheme: (userId: string) => void;
  generateThemeFromColors: (colors: { primary: string; secondary: string }, name: string) => CharacterTheme;
}

// ─── Built-in Themes ─────────────────────────────────────────────────

const FIELD_AGENT: CharacterTheme = {
  id: 'builtin-field-agent',
  name: 'Crimson Overdrive',
  characterId: 'egi',
  colors: {
    primary: '#dc2626',
    primaryDim: 'rgba(220,38,38,0.15)',
    primaryGlow: 'rgba(220,38,38,0.3)',
    secondary: '#ea580c',
    secondaryDim: 'rgba(234,88,12,0.15)',
    blob1: 'rgba(220,38,38,0.1)',
    blob2: 'rgba(234,88,12,0.08)',
    gradientStart: '#dc2626',
    gradientEnd: '#991b1b',
    accentText: '#fca5a5',
  },
  effects: {
    borderRadius: 'sharp',
    animationStyle: 'aggressive',
    patternType: 'web',
  },
  quote: "I don't wait for things to happen. I MAKE THEM HAPPEN.",
};

const THE_NEW_GUY: CharacterTheme = {
  id: 'builtin-the-new-guy',
  name: 'Elastic Blue',
  characterId: 'patrick',
  colors: {
    primary: '#2563eb',
    primaryDim: 'rgba(37,99,235,0.15)',
    primaryGlow: 'rgba(37,99,235,0.3)',
    secondary: '#06b6d4',
    secondaryDim: 'rgba(6,182,212,0.15)',
    blob1: 'rgba(37,99,235,0.1)',
    blob2: 'rgba(6,182,212,0.08)',
    gradientStart: '#2563eb',
    gradientEnd: '#1e40af',
    accentText: '#93c5fd',
  },
  effects: {
    borderRadius: 'smooth',
    animationStyle: 'elastic',
    patternType: 'dots',
  },
  quote: 'If it has a screen, a speaker, a lens, or a spotlight... I can handle it.',
};

const DEFAULT_THEME = FIELD_AGENT;

const BUILTINS: Record<string, CharacterTheme> = {
  'builtin-field-agent': FIELD_AGENT,
  'builtin-the-new-guy': THE_NEW_GUY,
};

// ─── CSS Variable Application ────────────────────────────────────────

function applyThemeToCSS(theme: CharacterTheme) {
  const root = document.documentElement;
  const c = theme.colors;
  const e = theme.effects;
  const borderRadiusMap = { sharp: '8px', smooth: '28px', round: '24px' };

  root.style.setProperty('--theme-primary', c.primary);
  root.style.setProperty('--theme-primary-dim', c.primaryDim);
  root.style.setProperty('--theme-primary-glow', c.primaryGlow);
  root.style.setProperty('--theme-secondary', c.secondary);
  root.style.setProperty('--theme-secondary-dim', c.secondaryDim);
  root.style.setProperty('--theme-blob-1', c.blob1);
  root.style.setProperty('--theme-blob-2', c.blob2);
  root.style.setProperty('--theme-gradient-start', c.gradientStart);
  root.style.setProperty('--theme-gradient-end', c.gradientEnd);
  root.style.setProperty('--theme-accent-text', c.accentText);
  root.style.setProperty('--theme-border-radius', borderRadiusMap[e.borderRadius] || '28px');
}

// ─── Persistence ─────────────────────────────────────────────────────

function loadSavedThemes(): CharacterTheme[] {
  try {
    const raw = localStorage.getItem('primedesk_themes');
    if (raw) return JSON.parse(raw) as CharacterTheme[];
  } catch { /* ignore */ }
  return [];
}

function persistThemes(themes: CharacterTheme[]) {
  localStorage.setItem('primedesk_themes', JSON.stringify(themes));
}

function loadActiveThemeId(): string {
  return localStorage.getItem('primedesk_active_theme') || DEFAULT_THEME.id;
}

function persistActiveThemeId(id: string) {
  localStorage.setItem('primedesk_active_theme', id);
}

// ─── Context ─────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string>(loadActiveThemeId);
  const [saved, setSaved] = useState<CharacterTheme[]>(loadSavedThemes);

  const theme = useMemo(() => {
    return BUILTINS[activeId] || saved.find((t) => t.id === activeId) || DEFAULT_THEME;
  }, [activeId, saved]);

  useEffect(() => {
    applyThemeToCSS(theme);
    persistActiveThemeId(activeId);
  }, [theme, activeId]);

  const setTheme = useCallback((themeId: string) => {
    setActiveId(themeId);
  }, []);

  const saveTheme = useCallback((partial: Omit<CharacterTheme, 'id'>): string => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const full: CharacterTheme = { ...partial, id };
    setSaved((prev) => {
      const next = [...prev, full];
      persistThemes(next);
      return next;
    });
    return id;
  }, []);

  const deleteTheme = useCallback((themeId: string) => {
    if (themeId.startsWith('builtin-')) return; // Can't delete built-ins
    setSaved((prev) => {
      const next = prev.filter((t) => t.id !== themeId);
      persistThemes(next);
      return next;
    });
    if (activeId === themeId) {
      setActiveId(DEFAULT_THEME.id);
    }
  }, [activeId]);

  const applyUserTheme = useCallback((userId: string) => {
    const map: Record<string, string> = {
      '1': 'builtin-field-agent',
      '2': 'builtin-the-new-guy',
      operator1: 'builtin-field-agent',
      operator2: 'builtin-the-new-guy',
    };
    const themeId = map[userId];
    if (themeId) setActiveId(themeId);
  }, []);

  const generateThemeFromColors = useCallback(
    (colors: { primary: string; secondary: string }, name: string): CharacterTheme => {
      const p = colors.primary;
      const s = colors.secondary;
      // Build rgba variants
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
      };
      return {
        id: 'temp',
        name,
        characterId: 'custom',
        colors: {
          primary: p,
          primaryDim: hexToRgba(p, 0.15),
          primaryGlow: hexToRgba(p, 0.3),
          secondary: s,
          secondaryDim: hexToRgba(s, 0.15),
          blob1: hexToRgba(p, 0.1),
          blob2: hexToRgba(s, 0.08),
          gradientStart: p,
          gradientEnd: s,
          accentText: hexToRgba(p, 0.7),
        },
        effects: { borderRadius: 'smooth', animationStyle: 'balanced', patternType: 'dots' },
        quote: 'Custom operative configuration.',
      };
    },
    []
  );

  const value = useMemo(
    () => ({
      theme,
      savedThemes: saved,
      setTheme,
      saveTheme,
      deleteTheme,
      applyUserTheme,
      generateThemeFromColors,
    }),
    [theme, saved, setTheme, saveTheme, deleteTheme, applyUserTheme, generateThemeFromColors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
