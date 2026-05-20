import { motion } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';
import type { CharacterTheme } from '@/hooks/useTheme';

interface Props {
  theme: CharacterTheme;
  isActive: boolean;
  onApply: () => void;
  onDelete?: () => void;
}

export default function ThemeCard({ theme, isActive, onApply, onDelete }: Props) {
  const { name, characterId, colors } = theme;
  const isCustom = characterId === 'custom';
  const canDelete = isCustom && !!onDelete;

  return (
    <motion.div
      className="relative rounded-xl border overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(18,18,26,0.8)',
        borderColor: isActive ? colors.primary : 'rgba(255,255,255,0.06)',
        boxShadow: isActive ? `0 0 15px ${colors.primaryGlow}` : 'none',
      }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onApply}
    >
      {/* Color preview bar */}
      <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }} />

      <div className="p-3">
        {/* Color dots */}
        <div className="flex gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-full border border-white/10" style={{ background: colors.primary }} />
          <div className="w-4 h-4 rounded-full border border-white/10" style={{ background: colors.secondary }} />
          <div className="w-4 h-4 rounded-full border border-white/10" style={{ background: colors.gradientEnd }} />
        </div>

        {/* Name */}
        <p className="text-xs font-display font-bold text-text-primary truncate">{name}</p>

        {/* Badge */}
        <div className="flex items-center justify-between mt-1.5">
          <span
            className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              background: `${colors.primary}15`,
              color: colors.accentText,
            }}
          >
            {characterId}
          </span>

          <div className="flex items-center gap-1">
            {isActive && <Check size={12} style={{ color: colors.primary }} />}
            {canDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="p-1 rounded hover:bg-red/10 transition-colors"
              >
                <Trash2 size={12} className="text-text-muted hover:text-red" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
