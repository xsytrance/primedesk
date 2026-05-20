import { memo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Recent',
    emojis: ['👍', '❤️', '🔥', '😂', '🎵', '👀'],
  },
  {
    name: 'Smiley',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'],
  },
  {
    name: 'Music',
    emojis: ['🎵', '🎶', '🎼', '🎸', '🎹', '🎺', '🎻', '🥁', '🎤', '🎧', '📯', '🎷', '🪗', '🪘', '🎙️', '📻', '🎛️', '🎚️', '🎙️', '🔔', '🔕'],
  },
  {
    name: 'Objects',
    emojis: ['💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📱', '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💡', '🔦', '🕯️', '🗑️', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '⛓️', '🧱', '🧲', '🔫', '💣', '🧪', '🌡️', '🧬', '🔬', '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩺', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🚲', '🛵', '🏍️', '🚨', '🚔', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '⛽', '🏁', '🚥', '🚦', '🏎️', '🏍️', '🛵', '🛺', '🚲'],
  },
];

const EmojiPicker = memo(function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <motion.div
      className="absolute bottom-full left-0 mb-2 w-full md:w-[360px] rounded-xl overflow-hidden z-50"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--bg-glass-border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <span className="font-heading font-medium text-sm text-[var(--text-primary)]">Emoji</span>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Categories */}
      <div className="max-h-[280px] overflow-y-auto p-3 space-y-3">
        {EMOJI_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono mb-1.5 block">
              {cat.name}
            </span>
            <div className="grid grid-cols-8 gap-1">
              {cat.emojis.map((emoji) => (
                <button
                  key={`${cat.name}-${emoji}`}
                  onClick={() => onSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-[var(--bg-surface)] active:scale-90 transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

export default EmojiPicker;
