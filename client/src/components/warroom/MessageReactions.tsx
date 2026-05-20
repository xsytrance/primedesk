import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageReactionsProps {
  reactions: Record<string, number[]>;
  currentUserId: string;
  onToggleReaction: (emoji: string) => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '😂', '🎵', '👀', '✅'];

const MessageReactions = memo(function MessageReactions({
  reactions,
  currentUserId,
  onToggleReaction,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleToggle = useCallback(
    (emoji: string) => {
      onToggleReaction(emoji);
      setShowPicker(false);
    },
    [onToggleReaction],
  );

  const hasReacted = useCallback(
    (userIds: number[]) => userIds.includes(Number(currentUserId)),
    [currentUserId],
  );

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      {/* Existing reactions */}
      {Object.entries(reactions).map(([emoji, userIds]) => (
        <motion.button
          key={emoji}
          onClick={() => handleToggle(emoji)}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-all ${
            hasReacted(userIds)
              ? 'bg-[var(--cyan-dim)] border-[rgba(0,217,255,0.3)]'
              : 'bg-[var(--bg-surface)] border-[rgba(255,255,255,0.06)] hover:bg-[var(--bg-elevated)]'
          }`}
          whileTap={{ scale: 0.85 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          <span>{emoji}</span>
          <span className="text-[10px] text-[var(--text-secondary)]">{userIds.length}</span>
        </motion.button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all text-xs"
        >
          +
        </button>

        <AnimatePresence>
          {showPicker && (
            <>
              {/* Backdrop click to close */}
              <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
              <motion.div
                className="absolute bottom-full left-0 mb-1 flex items-center gap-1 px-2 py-1.5 rounded-full z-50"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                transition={{ duration: 0.15 }}
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleToggle(emoji)}
                    className="w-7 h-7 flex items-center justify-center text-base rounded-full hover:bg-[var(--bg-surface)] active:scale-90 transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default MessageReactions;
