import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Music, Clock, X } from 'lucide-react';
import ModalSheet from '@/components/ModalSheet';

interface JamendoTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  cover: string;
}

const MOCK_JAMENDO_TRACKS: JamendoTrack[] = [
  { id: 'j1', title: 'Neon Horizons', artist: 'Synthwave Collective', duration: 234, cover: '/nebula-bg.jpg' },
  { id: 'j2', title: 'Midnight Grid', artist: 'Cyber Systems', duration: 198, cover: '/nebula-bg.jpg' },
  { id: 'j3', title: 'Data Stream', artist: 'Neon Protocol', duration: 256, cover: '/nebula-bg.jpg' },
  { id: 'j4', title: 'Quantum Loop', artist: 'Digital Dreamers', duration: 312, cover: '/nebula-bg.jpg' },
  { id: 'j5', title: 'Terminal Velocity', artist: 'Binary Beats', duration: 189, cover: '/nebula-bg.jpg' },
  { id: 'j6', title: 'Silicon Dreams', artist: 'Pixel Hearts', duration: 267, cover: '/nebula-bg.jpg' },
  { id: 'j7', title: 'Firewall Funk', artist: 'Netrunners', duration: 223, cover: '/nebula-bg.jpg' },
  { id: 'j8', title: 'Packet Flow', artist: 'Router Collective', duration: 245, cover: '/nebula-bg.jpg' },
  { id: 'j9', title: 'Cipher Suite', artist: 'TLS Orchestra', duration: 278, cover: '/nebula-bg.jpg' },
  { id: 'j10', title: 'Backbone Rhythm', artist: 'Fiber Optics', duration: 201, cover: '/nebula-bg.jpg' },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface SongShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (track: JamendoTrack) => void;
}

const SongShareModal = memo(function SongShareModal({ isOpen, onClose, onShare }: SongShareModalProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<JamendoTrack[]>(MOCK_JAMENDO_TRACKS);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      setSearching(true);

      // Debounced mock search
      const timeout = setTimeout(() => {
        if (!value.trim()) {
          setResults(MOCK_JAMENDO_TRACKS);
        } else {
          const filtered = MOCK_JAMENDO_TRACKS.filter(
            (t) =>
              t.title.toLowerCase().includes(value.toLowerCase()) ||
              t.artist.toLowerCase().includes(value.toLowerCase()),
          );
          setResults(filtered);
        }
        setSearching(false);
      }, 300);

      return () => clearTimeout(timeout);
    },
    [],
  );

  const handleShare = useCallback(
    (track: JamendoTrack) => {
      onShare(track);
      setQuery('');
      setResults(MOCK_JAMENDO_TRACKS);
    },
    [onShare],
  );

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Share a Song">
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search Jamendo tracks..."
            className="w-full rounded-xl pl-10 pr-10 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid rgba(255,255,255,0.06)',
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
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults(MOCK_JAMENDO_TRACKS);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Searching indicator */}
        {searching && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[var(--cyan)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Results */}
        {!searching && (
          <div className="space-y-1 max-h-[50vh] overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                No tracks found
              </div>
            ) : (
              results.map((track, idx) => (
                <motion.button
                  key={track.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-surface)] transition-colors text-left group"
                  onClick={() => handleShare(track)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                >
                  {/* Thumbnail */}
                  <div className="w-11 h-11 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Music size={18} className="text-[var(--cyan)]" />
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--cyan)] transition-colors">
                      {track.title}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] truncate">
                      {track.artist}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] flex-shrink-0">
                    <Clock size={11} />
                    <span>{formatDuration(track.duration)}</span>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2">
          <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
            Powered by Jamendo
          </span>
        </div>
      </div>
    </ModalSheet>
  );
});

export default SongShareModal;
export type { JamendoTrack };
