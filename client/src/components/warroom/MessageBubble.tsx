import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Link2, Music, ExternalLink, ImageOff } from 'lucide-react';
import Avatar from '@/components/Avatar';
import MessageReactions from './MessageReactions';
import type { ChatMessage } from '@/data/mock';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  currentUserId: string;
  showAvatar: boolean;
  senderName?: string;
  senderColor?: string;
  senderAvatar?: string;
  senderInitials?: string;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

// Detect URLs in text
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// Detect image URLs
const IMAGE_REGEX = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg))/i;

// Detect song URLs (Jamendo)
const SONG_REGEX = /jamendo\.com\/track\/(\d+)|open\.spotify\.com\/track\/|soundcloud\.com\//i;


function formatInlineStyles(text: string) {
  // Parse *bold*, _italic_, `code`
  const parts: (string | React.ReactNode)[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  const textStr = String(text);

  while ((match = regex.exec(textStr)) !== null) {
    if (match.index > lastIndex) {
      parts.push(textStr.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(
        <strong key={key++} className="font-semibold text-[var(--text-primary)]">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      parts.push(
        <strong key={key++} className="font-semibold text-[var(--text-primary)]">
          {match[3]}
        </strong>,
      );
    } else if (match[4]) {
      parts.push(
        <em key={key++} className="italic text-[var(--text-secondary)]">
          {match[4]}
        </em>,
      );
    } else if (match[5]) {
      parts.push(
        <code
          key={key++}
          className="px-1 py-0.5 rounded text-[11px] font-mono"
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--cyan)',
          }}
        >
          {match[5]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < textStr.length) {
    parts.push(textStr.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [textStr];
}

function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  return matches || [];
}

function isImageUrl(url: string): boolean {
  return IMAGE_REGEX.test(url);
}

function isSongUrl(url: string): boolean {
  return SONG_REGEX.test(url);
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

const MessageBubble = memo(function MessageBubble({
  message,
  isMe,
  currentUserId,
  showAvatar,
  senderName,
  senderColor,
  senderAvatar,
  senderInitials,
  onToggleReaction,
}: MessageBubbleProps) {
  const [imgError, setImgError] = useState(false);
  const [imgExpanded, setImgExpanded] = useState(false);
  const [_showActions, _setShowActions] = useState(false);

  const handleToggleReaction = useCallback(
    (emoji: string) => {
      onToggleReaction(message.id, emoji);
    },
    [message.id, onToggleReaction],
  );

  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // System message
  if (message.type === 'system') {
    return (
      <motion.div
        className="flex justify-center my-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-muted)] px-4 py-1 rounded-full bg-[var(--bg-surface)]">
          {message.text}
        </span>
      </motion.div>
    );
  }

  const urls = extractUrls(message.text);
  const hasImage = urls.some(isImageUrl);
  const hasSong = urls.some(isSongUrl) || message.type === 'song';
  const hasLink = urls.length > 0 && !hasImage && !hasSong;
  const firstUrl = urls[0] || '';

  // Build message content based on type
  const renderContent = () => {
    // Song embed
    if (hasSong || message.type === 'song') {
      return (
        <div className="space-y-2">
          <div className="text-sm text-[var(--text-primary)] leading-relaxed">
            {formatInlineStyles(message.text.split(URL_REGEX)[0])}
          </div>
          <SongEmbed url={firstUrl} />
        </div>
      );
    }

    // Image embed
    if (hasImage || message.type === 'meme') {
      const textParts = message.text.split(URL_REGEX);
      const imageUrl = urls.find(isImageUrl);
      const caption = message.type === 'meme' && !textParts[0].trim()
        ? message.text.replace(/https?:\/\/[^\s]+/g, '').trim()
        : textParts.filter((_, i) => i % 2 === 0).join('').trim();

      return (
        <div className="space-y-2">
          {textParts[0]?.trim() && !imageUrl && (
            <div className="text-sm text-[var(--text-primary)] leading-relaxed">
              {formatInlineStyles(textParts[0])}
            </div>
          )}
          {imageUrl && !imgError && (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="Shared image"
                className="w-full max-h-[300px] object-cover rounded-lg cursor-pointer"
                onClick={() => setImgExpanded(true)}
                onError={() => setImgError(true)}
                loading="lazy"
              />
            </div>
          )}
          {imgError && (
            <div className="flex items-center gap-2 text-xs text-[var(--red)] py-2">
              <ImageOff size={16} />
              <span>Failed to load image</span>
            </div>
          )}
          {caption && (
            <div className="text-sm text-[var(--text-primary)] leading-relaxed">
              {formatInlineStyles(caption)}
            </div>
          )}

          {/* Expanded image modal */}
          {imgExpanded && imageUrl && (
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 cursor-pointer"
              onClick={() => setImgExpanded(false)}
            >
              <motion.img
                src={imageUrl}
                alt="Expanded"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}
        </div>
      );
    }

    // Link preview
    if (hasLink || message.type === 'link') {
      const linkUrl = firstUrl;

      return (
        <div className="space-y-2">
          <div className="text-sm text-[var(--text-primary)] leading-relaxed">
            {formatInlineStyles(message.text)}
          </div>
          {linkUrl && <LinkPreviewCard url={linkUrl} />}
        </div>
      );
    }

    // Plain text
    return (
      <div className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words">
        {formatInlineStyles(message.text)}
      </div>
    );
  };

  return (
    <motion.div
      className={`flex mb-1 ${isMe ? 'justify-end' : 'justify-start'} group`}
      initial={isMe ? { opacity: 0, x: 20 } : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      onMouseEnter={() => _setShowActions(true)}
      onMouseLeave={() => _setShowActions(false)}
    >
      <div className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[75%] md:max-w-[60%]`}>
        {/* Avatar */}
        {!isMe && showAvatar && (
          <div className="flex-shrink-0 self-start pt-1">
            <Avatar
              src={senderAvatar}
              fallback={senderInitials || 'O2'}
              size={36}
              borderColor={senderColor || '#ff4fd8'}
              alt={senderName || 'Operator'}
            />
          </div>
        )}
        {!isMe && !showAvatar && <div className="w-[36px] flex-shrink-0" />}

        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          {/* Sender name */}
          {!isMe && showAvatar && senderName && (
            <span
              className="text-[11px] mb-0.5 ml-1"
              style={{ color: senderColor || '#ff4fd8' }}
            >
              {senderName}
            </span>
          )}

          {/* Bubble */}
          <div
            className={`relative px-3.5 py-2.5 rounded-2xl ${
              isMe ? 'rounded-tr-[4px]' : 'rounded-tl-[4px]'
            }`}
            style={
              isMe
                ? {
                    background:
                      'linear-gradient(135deg, rgba(0,217,255,0.15), rgba(255,79,216,0.10))',
                    backdropFilter: 'blur(8px)',
                  }
                : {
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--bg-glass-border)',
                  }
            }
          >
            {renderContent()}

            {/* Timestamp */}
            <div
              className={`flex items-center gap-1 mt-1 ${
                isMe ? 'justify-start' : 'justify-end'
              }`}
            >
              <span className="text-[10px] text-[var(--text-secondary)]">{timestamp}</span>
              {isMe && (
                <span className="text-[10px] text-[var(--cyan)]">
                  {'\u2713\u2713'}
                </span>
              )}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className={`mt-0.5 ${isMe ? 'mr-1' : 'ml-1'}`}>
              <MessageReactions
                reactions={message.reactions}
                currentUserId={currentUserId}
                onToggleReaction={handleToggleReaction}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// --- Sub-components ---

const SongEmbed = memo(function SongEmbed({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onClick={() => setIsPlaying(!isPlaying)}
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0 overflow-hidden">
        <Music size={20} className="text-[var(--cyan)]" />
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[var(--text-primary)] truncate">
          Music Track
        </div>
        <div className="text-[11px] text-[var(--text-secondary)] truncate">
          {getDomain(url)}
        </div>
      </div>

      {/* Play button */}
      <motion.button
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isPlaying ? 'var(--magenta)' : 'var(--cyan)',
        }}
        whileTap={{ scale: 0.9 }}
      >
        {isPlaying ? (
          <div className="flex items-end gap-[2px] h-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-[2px] bg-white rounded-full"
                animate={{ height: [4, 10, 4] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        ) : (
          <Play size={14} className="text-white ml-0.5" fill="white" />
        )}
      </motion.button>
    </div>
  );
});

const LinkPreviewCard = memo(function LinkPreviewCard({ url }: { url: string }) {
  const domain = getDomain(url);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-2.5 p-2.5 rounded-lg mt-1 group/link"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="w-8 h-8 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
        <Link2 size={14} className="text-[var(--text-muted)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
          <span className="truncate">{domain}</span>
          <ExternalLink size={10} className="flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
        </div>
        <div className="text-xs text-[var(--text-primary)] truncate group-hover/link:text-[var(--cyan)] transition-colors">
          {url}
        </div>
      </div>
    </motion.a>
  );
});

export default MessageBubble;
