import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Music, Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface ChatInputProps {
  onSend: (text: string) => void;
  onShareSong: () => void;
  disabled?: boolean;
}

const ChatInput = memo(function ChatInput({ onSend, onShareSong, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, 120); // max 4 lines ~120px
    el.style.height = `${newHeight}px`;
  }, [text]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleEmojiSelect = useCallback((emoji: string) => {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  }, []);

  const handleAttachImage = useCallback(() => {
    setShowAttach(false);
    // Simulate image share with a placeholder message
    onSend('https://picsum.photos/400/300.jpg');
  }, [onSend]);

  return (
    <motion.div
      className="relative z-40 flex-shrink-0"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
    >
      <div
        className="flex items-end gap-2 px-4 py-3"
        style={{
          background: 'var(--bg-elevated)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Attachment button */}
        <div className="relative">
          <button
            onClick={() => setShowAttach(!showAttach)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all active:scale-95 flex-shrink-0"
          >
            <Paperclip size={20} />
          </button>

          <AnimatePresence>
            {showAttach && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAttach(false)} />
                <motion.div
                  className="absolute bottom-full left-0 mb-2 rounded-xl overflow-hidden z-50 py-1 min-w-[160px]"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={onShareSong}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors text-left"
                  >
                    <Music size={16} className="text-[var(--cyan)]" />
                    <span>Share Song</span>
                  </button>
                  <button
                    onClick={handleAttachImage}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors text-left"
                  >
                    <Paperclip size={16} className="text-[var(--magenta)]" />
                    <span>Share Image</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Music shortcut */}
        <button
          onClick={onShareSong}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all active:scale-95 flex-shrink-0"
        >
          <Music size={20} />
        </button>

        {/* Emoji button */}
        <div className="relative">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 flex-shrink-0 ${
              showEmoji ? 'text-[var(--cyan)] bg-[var(--cyan-dim)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <Smile size={20} />
          </button>

          <AnimatePresence>
            {showEmoji && (
              <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid rgba(255,255,255,0.06)',
              maxHeight: 120,
              minHeight: 40,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--cyan)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--cyan-dim)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Send button */}
        <AnimatePresence>
          {text.trim().length > 0 && (
            <motion.button
              onClick={handleSend}
              disabled={disabled}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--cyan), var(--magenta))',
                boxShadow: '0 0 12px rgba(0,217,255,0.3)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Send size={18} className="text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default ChatInput;
