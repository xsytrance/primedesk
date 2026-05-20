import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Info, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { mockChatMessages, operator1, operator2 } from '@/data/mock';
import type { ChatMessage } from '@/data/mock';
import MessageList from '@/components/warroom/MessageList';
import ChatInput from '@/components/warroom/ChatInput';
import SongShareModal from '@/components/warroom/SongShareModal';
import type { JamendoTrack } from '@/components/warroom/SongShareModal';

// Additional mock messages for the real-time simulation
const SIMULATION_MESSAGES: ChatMessage[] = [
  { id: 'sim1', author: 'operator2', text: 'Heads up — the SF office WiFi just had a brief hiccup. Should be back now.', type: 'text', timestamp: new Date().toISOString() },
  { id: 'sim2', author: 'operator2', text: 'Just closed TKT-0038. Email sync issue resolved with the latest Exchange CU.', type: 'text', timestamp: new Date().toISOString() },
  { id: 'sim3', author: 'operator2', text: 'Anyone else seeing higher than usual latency on the east coast CDN?', type: 'text', timestamp: new Date().toISOString() },
  { id: 'sim4', author: 'operator2', text: 'jamendo.com/track/456 — new track for the playlist', type: 'song', timestamp: new Date().toISOString() },
  { id: 'sim5', author: 'operator2', text: 'The new firewall rules are deployed. DevOps should be able to reach the CI runners now.', type: 'text', timestamp: new Date().toISOString() },
  { id: 'sim6', author: 'operator2', text: 'DC site survey for WiFi coverage is scheduled for next Tuesday. Facilities confirmed.', type: 'text', timestamp: new Date().toISOString() },
  { id: 'sim7', author: 'operator2', text: 'https://docs.primedesk.io/runbooks/ssl-renewal Updated the SSL renewal runbook with the new ACM process.', type: 'link', timestamp: new Date().toISOString() },
  { id: 'sim8', author: 'operator2', text: 'UPS battery swap in NYC went smooth. All systems green.', type: 'text', timestamp: new Date().toISOString() },
  { id: 'sim9', author: 'operator2', text: 'Got a weird alert from the monitoring stack. Checking it out now.', type: 'text', timestamp: new Date().toISOString() },
  { id: 'sim10', author: 'operator2', text: 'False alarm — the alert was from a test instance. All good! ✅', type: 'text', timestamp: new Date().toISOString() },
  { id: 'sim11', author: 'operator2', text: 'Just shipped the last laptop for the week. L2 queue is clear! 🎉', type: 'text', timestamp: new Date().toISOString() },
  { id: 'sim12', author: 'operator2', text: 'EOW sync — anything I should pick up before the weekend?', type: 'text', timestamp: new Date().toISOString() },
];

export default function WarRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [showSongModal, setShowSongModal] = useState(false);
  const simIndex = useRef(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserId = user?.id || 'op1';

  // Compute online status
  const otherOperator = currentUserId === 'op1' ? operator2 : operator1;
  // isOnline status

  // Send message handler
  const handleSend = useCallback(
    (text: string) => {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        author: currentUserId === 'op1' ? 'operator1' : 'operator2',
        text,
        type: text.match(/^https?:\/\//) ? 'link' : 'text',
        timestamp: new Date().toISOString(),
        reactions: {},
      };
      setMessages((prev) => [...prev, newMsg]);
    },
    [currentUserId],
  );

  // Share song from modal
  const handleShareSong = useCallback(
    (track: JamendoTrack) => {
      const msg: ChatMessage = {
        id: `song-${Date.now()}`,
        author: currentUserId === 'op1' ? 'operator1' : 'operator2',
        text: `jamendo.com/track/${track.id} — ${track.title} by ${track.artist}`,
        type: 'song',
        timestamp: new Date().toISOString(),
        reactions: {},
      };
      setMessages((prev) => [...prev, msg]);
      setShowSongModal(false);
    },
    [currentUserId],
  );

  // Toggle reaction handler
  const handleToggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      const userNum = currentUserId === 'op1' ? 1 : 2;
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const existing = msg.reactions || {};
          const userIds = existing[emoji] || [];
          const hasReacted = userIds.includes(userNum);

          return {
            ...msg,
            reactions: {
              ...existing,
              [emoji]: hasReacted
                ? userIds.filter((id) => id !== userNum)
                : [...userIds, userNum],
            },
          };
        }),
      );
    },
    [currentUserId],
  );

  // Simulate incoming messages
  useEffect(() => {
    const scheduleNextMessage = () => {
      // Random delay between 20-30 seconds
      const delay = 20000 + Math.random() * 10000;

      messageTimeoutRef.current = setTimeout(() => {
        if (simIndex.current >= SIMULATION_MESSAGES.length) {
          simIndex.current = 0; // Loop
        }

        // Show typing indicator first
        setIsTyping(true);

        // After 2-3 seconds, send the actual message
        const typingDuration = 2000 + Math.random() * 1000;
        typingTimeoutRef.current = setTimeout(() => {
          const template = SIMULATION_MESSAGES[simIndex.current];
          simIndex.current += 1;

          const newMsg: ChatMessage = {
            ...template,
            id: `sim-${Date.now()}`,
            timestamp: new Date().toISOString(),
            reactions: {},
          };

          setIsTyping(false);
          setMessages((prev) => [...prev, newMsg]);

          // Schedule next
          scheduleNextMessage();
        }, typingDuration);
      }, delay);
    };

    scheduleNextMessage();

    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <motion.div
      className="flex flex-col h-[calc(100dvh-64px-env(safe-area-inset-bottom))] -mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3"
        style={{
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Back button (mobile) */}
          <button
            onClick={() => navigate(-1)}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex flex-col">
            <h1
              className="font-display text-[15px] uppercase tracking-[0.15em]"
              style={{
                color: 'var(--cyan)',
                textShadow: '0 0 12px rgba(0,217,255,0.3)',
              }}
            >
              WAR ROOM
            </h1>
            <span className="font-mono text-[10px] text-[var(--text-secondary)]">
              Secure channel — 2 operators
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Online status */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: 'var(--green)' }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: 'var(--green)' }}
              />
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] hidden sm:inline">
              {otherOperator.displayName}
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: 'var(--green)' }}
            >
              online
            </span>
          </div>

          {/* Info icon */}
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all active:scale-95">
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isTyping={isTyping}
        onToggleReaction={handleToggleReaction}
        emptyStateImage="/empty-chat.svg"
      />

      {/* Input bar */}
      <ChatInput onSend={handleSend} onShareSong={() => setShowSongModal(true)} />

      {/* Song share modal */}
      <SongShareModal
        isOpen={showSongModal}
        onClose={() => setShowSongModal(false)}
        onShare={handleShareSong}
      />
    </motion.div>
  );
}
