import { memo } from 'react';
import { motion } from 'framer-motion';
import Avatar from '@/components/Avatar';
import { operator2 } from '@/data/mock';

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <motion.div
      className="flex items-end gap-2 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <Avatar
        src={operator2.avatar}
        fallback={operator2.initials}
        size={36}
        borderColor={operator2.color}
        alt={operator2.displayName}
      />
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-[var(--text-secondary)] ml-1">{operator2.displayName} is typing...</span>
        <div
          className="flex items-center gap-[6px] px-4 py-3 rounded-2xl rounded-tl-[4px]"
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--bg-glass-border)',
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-[6px] h-[6px] rounded-full"
              style={{ backgroundColor: 'var(--cyan)' }}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
});

export default TypingIndicator;
