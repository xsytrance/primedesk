import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ChevronUp, ChevronDown, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockPlaylist } from '@/data/mock';

const MusicPlayer = memo(function MusicPlayer({ className }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTrack = mockPlaylist[currentTrackIndex];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return p + 0.5;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleNext = () => {
    setCurrentTrackIndex(i => (i + 1) % mockPlaylist.length);
    setProgress(0);
  };
  const handlePrev = () => {
    setCurrentTrackIndex(i => (i - 1 + mockPlaylist.length) % mockPlaylist.length);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentSeconds = Math.floor((progress / 100) * currentTrack.duration);

  return (
    <motion.div
      layout
      className={cn(
        'fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40',
        'bg-[rgba(18,18,26,0.9)] backdrop-blur-xl border border-glass-border rounded-xl',
        'overflow-hidden',
        className,
      )}
      style={{ width: expanded ? 320 : 'calc(100% - 32px)', maxWidth: 320 }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.div
            key="mini"
            className="flex items-center gap-3 px-3 py-2 cursor-pointer"
            onClick={() => setExpanded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Thumbnail */}
            <div
              className={cn(
                'w-9 h-9 rounded-full border border-glass-border flex-shrink-0 overflow-hidden',
                isPlaying && 'animate-spin-slow',
              )}
            >
              <img src={currentTrack.cover} alt="" className="w-full h-full object-cover" />
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-text-primary truncate">{currentTrack.title}</div>
              <div className="text-xs text-text-secondary truncate">{currentTrack.artist}</div>
            </div>

            {/* Audio wave bars when playing */}
            {isPlaying && (
              <div className="flex items-end gap-[2px] h-4">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    className="w-[2px] bg-cyan rounded-full"
                    animate={{ height: [4, 12, 6, 14, 4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            )}

            {/* Play/Pause */}
            <button
              onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
              className="w-8 h-8 rounded-full bg-cyan flex items-center justify-center flex-shrink-0 hover:brightness-110 transition-all active:scale-95"
            >
              {isPlaying ? <Pause size={14} className="text-bg-base" /> : <Play size={14} className="text-bg-base ml-0.5" />}
            </button>

            <ChevronUp size={16} className="text-text-muted" />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            className="p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Collapse button */}
            <div className="flex justify-center mb-3">
              <button onClick={() => setExpanded(false)} className="text-text-muted hover:text-text-primary">
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Large thumbnail */}
            <div className="flex justify-center mb-4">
              <div
                className={cn(
                  'w-[120px] h-[120px] rounded-full border-2 border-cyan/30 overflow-hidden',
                  isPlaying && 'animate-spin-slow',
                )}
              >
                <img src={currentTrack.cover} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Track info */}
            <div className="text-center mb-4">
              <div className="text-base font-heading font-medium text-text-primary">{currentTrack.title}</div>
              <div className="text-sm text-text-secondary">{currentTrack.artist}</div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>{formatTime(currentSeconds)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
              <div
                className="w-full h-1 bg-bg-surface rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = ((e.clientX - rect.left) / rect.width) * 100;
                  setProgress(pct);
                }}
              >
                <div
                  className="h-full bg-cyan rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button onClick={handlePrev} className="text-text-secondary hover:text-text-primary transition-colors active:scale-95">
                <SkipBack size={20} />
              </button>
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)' }}
              >
                {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-1" />}
              </button>
              <button onClick={handleNext} className="text-text-secondary hover:text-text-primary transition-colors active:scale-95">
                <SkipForward size={20} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 mb-4">
              <Volume2 size={14} className="text-text-muted" />
              <div
                className="flex-1 h-1 bg-bg-surface rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = ((e.clientX - rect.left) / rect.width) * 100;
                  setVolume(pct);
                }}
              >
                <div
                  className="h-full bg-cyan rounded-full"
                  style={{ width: `${volume}%` }}
                />
              </div>
            </div>

            {/* Playlist */}
            <div className="max-h-[120px] overflow-y-auto space-y-1">
              {mockPlaylist.map((track, i) => (
                <button
                  key={track.id}
                  onClick={() => { setCurrentTrackIndex(i); setProgress(0); }}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left',
                    'hover:bg-bg-surface transition-colors',
                    i === currentTrackIndex && 'bg-bg-surface',
                  )}
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                    <img src={track.cover} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn('text-xs truncate', i === currentTrackIndex ? 'text-cyan' : 'text-text-primary')}>
                      {track.title}
                    </div>
                    <div className="text-[10px] text-text-muted truncate">{track.artist}</div>
                  </div>
                  <div className="text-[10px] text-text-muted">{formatTime(track.duration)}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default MusicPlayer;
