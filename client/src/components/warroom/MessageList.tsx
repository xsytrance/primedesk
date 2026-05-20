import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import type { ChatMessage } from '@/data/mock';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  isTyping: boolean;
  onToggleReaction: (messageId: string, emoji: string) => void;
  emptyStateImage?: string;
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatDateDivider(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(dateStr, now.toISOString())) return 'Today';
  if (isSameDay(dateStr, yesterday.toISOString())) return 'Yesterday';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).toUpperCase();
}

const MessageList = memo(function MessageList({
  messages,
  currentUserId,
  isTyping,
  onToggleReaction,
  emptyStateImage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showNewMessagesBtn, setShowNewMessagesBtn] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const prevMessagesLength = useRef(messages.length);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const newCount = messages.length - prevMessagesLength.current;
    if (newCount > 0) {
      if (!userScrolledUp) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setNewMessageCount((c) => c + newCount);
        setShowNewMessagesBtn(true);
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, userScrolledUp]);

  // Scroll to bottom on initial load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  // Scroll to bottom when typing starts (if near bottom)
  useEffect(() => {
    if (isTyping && !userScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isTyping, userScrolledUp]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const scrolledUp = distanceFromBottom > 200;
    setUserScrolledUp(scrolledUp);
    if (!scrolledUp) {
      setShowNewMessagesBtn(false);
      setNewMessageCount(0);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowNewMessagesBtn(false);
    setNewMessageCount(0);
    setUserScrolledUp(false);
  }, []);

  // Group messages by date
  const groupedMessages: { date: string; items: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && isSameDay(msg.timestamp, lastGroup.date)) {
      lastGroup.items.push(msg);
    } else {
      groupedMessages.push({ date: msg.timestamp, items: [msg] });
    }
  });

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {emptyStateImage ? (
          <img src={emptyStateImage} alt="No messages" className="w-48 h-36 mb-4 opacity-50" />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center mb-4">
            <span className="text-4xl">💬</span>
          </div>
        )}
        <p className="text-[var(--text-muted)] text-sm text-center">
          No messages yet. Start the conversation!
        </p>
        <p className="text-[var(--text-muted)] text-xs mt-1">👋</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden px-4 py-4"
        onScroll={handleScroll}
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,217,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date divider */}
            <motion.div
              className="flex items-center gap-3 my-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] whitespace-nowrap">
                {formatDateDivider(group.date)}
              </span>
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            </motion.div>

            {/* Messages in this date group */}
            {group.items.map((msg, idx) => {
              const isMe = msg.author === `operator${currentUserId}` ||
                (currentUserId === 'op1' && msg.author === 'operator1') ||
                (currentUserId === 'op2' && msg.author === 'operator2');

              // Show avatar if previous message was from different sender or >5 min gap
              const prevMsg = group.items[idx - 1];
              const showAvatar = !prevMsg ||
                prevMsg.author !== msg.author ||
                new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 5 * 60 * 1000;

              const senderName = isMe ? undefined : msg.author;
              const senderColor = msg.author === 'operator1' ? '#00d9ff' : '#ff4fd8';
              const senderAvatar = msg.author === 'operator1' ? '/avatar-fallback-o1.svg' : '/avatar-fallback-o2.svg';
              const senderInitials = msg.author === 'operator1' ? 'O1' : 'O2';

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMe={isMe}
                  currentUserId={currentUserId}
                  showAvatar={showAvatar && !isMe}
                  senderName={senderName}
                  senderColor={senderColor}
                  senderAvatar={senderAvatar}
                  senderInitials={senderInitials}
                  onToggleReaction={onToggleReaction}
                />
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>

        {/* Bottom anchor */}
        <div ref={bottomRef} />
      </div>

      {/* New messages floating button */}
      <AnimatePresence>
        {showNewMessagesBtn && (
          <motion.button
            className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-white shadow-glow-cyan"
            style={{
              background: 'var(--cyan)',
              boxShadow: '0 4px 12px rgba(0,217,255,0.3)',
            }}
            onClick={scrollToBottom}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} />
            <span>{newMessageCount} new</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});

export default MessageList;
