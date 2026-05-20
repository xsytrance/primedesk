import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import CharacterCard from '@/components/login/CharacterCard';

// ─── Animated Particles ──────────────────────────────────────────────

function Particles({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${p.alpha})`);
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// ─── Mouse Glow ──────────────────────────────────────────────────────

function MouseGlow({ color }: { color: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, ${color}, transparent)`,
        opacity: 0.15,
      }}
    />
  );
}

// ─── Character Data ──────────────────────────────────────────────────

const EGI_DATA = {
  name: 'AGENOR',
  codename: 'THE FIELD AGENT',
  image: '/egi-character.png',
  quote: "I don't wait for things to happen. I MAKE THEM HAPPEN.",
  roleTags: ['Lead Operator', 'Execution Specialist', 'Systems Integrator', 'Mentor'],
  abilities: [
    { name: 'Multi-Tab', icon: 'Monitor' },
    { name: 'Rapid Switch', icon: 'Zap' },
    { name: 'Execution', icon: 'Crosshair' },
    { name: 'Mentor', icon: 'Users' },
    { name: 'Adapt', icon: 'Cpu' },
    { name: 'Create', icon: 'Brain' },
  ],
  stats: [
    { label: 'SCREENS', value: '6' },
    { label: 'FOCUS', value: '100%' },
    { label: 'RESPONSE', value: '0.2s' },
    { label: 'LEVEL', value: 'MAXIMUM' },
    { label: 'THREADS', value: '\u221E' },
  ],
  strengths: ['Multitasking Beast', 'Fast Under Pressure', 'Finds Solutions', 'Gets Things Done', 'Builds & Supports Team'],
  weapon: 'Keyboard. 6 Laptops. Limitless Focus.',
  primaryColor: '#dc2626',
  primaryGlow: 'rgba(220,38,38,0.3)',
  accentText: '#fca5a5',
};

const PATRICK_DATA = {
  name: 'PATRICK',
  codename: 'THE NEW GUY',
  image: '/patrick-character.png',
  quote: 'If it has a screen, a speaker, a lens, or a spotlight... I can handle it.',
  roleTags: ['AV Specialist', 'Apple Ecosystem Ace', 'Social Media Savvy', 'Visual Storyteller'],
  abilities: [
    { name: 'AV Control', icon: 'Speaker' },
    { name: 'Apple', icon: 'Smartphone' },
    { name: 'Social', icon: 'MessageCircle' },
    { name: 'Photo', icon: 'Camera' },
    { name: 'Stage', icon: 'Sparkles' },
    { name: 'Reach', icon: 'ArrowUpDown' },
  ],
  stats: [
    { label: 'SYSTEMS', value: '100%' },
    { label: 'FLOW', value: 'OPTIMIZED' },
    { label: 'REACH', value: 'EXTENDED' },
    { label: 'LIMITS', value: 'ELASTIC' },
  ],
  strengths: ['AV Mastery', 'Apple Ecosystem Instinct', 'Social Content Sense', 'Photo & Video Eye', 'Theater-Trained Presence', 'Always Within Reach'],
  weapon: 'iPhone. Camera. MacBook. Elastic Reach.',
  primaryColor: '#2563eb',
  primaryGlow: 'rgba(37,99,235,0.3)',
  accentText: '#93c5fd',
};

// ─── Main Login Component ────────────────────────────────────────────

export default function Login() {
  const { login } = useAuth();
  const { applyUserTheme } = useTheme();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<'egi' | 'patrick' | null>(null);
  const [hovered, setHovered] = useState<'egi' | 'patrick' | null>(null);
  const [mobileChoice, setMobileChoice] = useState<'egi' | 'patrick'>('egi');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleSelect = async (who: 'egi' | 'patrick') => {
    setSelected(who);
    setLoggingIn(true);
    const username = who === 'egi' ? 'egi' : 'patrick';
    await new Promise((r) => setTimeout(r, 1200));
    await login(username, 'Desmarais123!');
    applyUserTheme(username);
    navigate('/');
  };

  const activeColor =
    hovered === 'egi' || selected === 'egi'
      ? 'rgba(220,38,38,0.2)'
      : hovered === 'patrick' || selected === 'patrick'
        ? 'rgba(37,99,235,0.2)'
        : 'rgba(0,217,255,0.1)';

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-start md:justify-center overflow-x-hidden overflow-y-auto bg-[#050508]">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#050508] to-[#0a0a0f]" />

      {/* Animated blobs */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background:
            hovered === 'egi' || selected === 'egi'
              ? 'radial-gradient(800px circle at 30% 50%, rgba(220,38,38,0.15), transparent 70%)'
              : hovered === 'patrick' || selected === 'patrick'
                ? 'radial-gradient(800px circle at 70% 50%, rgba(37,99,235,0.15), transparent 70%)'
                : 'radial-gradient(800px circle at 50% 50%, rgba(0,217,255,0.05), transparent 70%)',
        }}
        transition={{ duration: 0.8 }}
      />

      <Particles color={activeColor} />
      <MouseGlow color={activeColor} />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 md:py-0 flex flex-col items-center">
        {/* Logo & Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #dc2626, #2563eb)', color: '#fff' }}
          >
            P
          </div>
          <h1
            className="font-display text-3xl md:text-5xl font-black tracking-wider mb-2"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            PRIMEDESK
          </h1>
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-text-muted">
            Choose Your Operative
          </p>
        </motion.div>

        {/* Character Cards */}
        <AnimatePresence mode="wait">
          {loggingIn && selected ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div
                className="w-24 h-24 rounded-full border-4 border-t-transparent animate-spin"
                style={{
                  borderColor: selected === 'egi' ? '#dc2626' : '#2563eb',
                  borderTopColor: 'transparent',
                }}
              />
              <p
                className="font-display text-lg tracking-widest animate-pulse"
                style={{ color: selected === 'egi' ? '#dc2626' : '#2563eb' }}
              >
                INITIALIZING...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="cards"
              className="w-full max-w-4xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
            >
              {/* Mobile: explicit switcher */}
              <div className="md:hidden w-full max-w-md mx-auto">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setMobileChoice('egi')}
                    className="py-2 rounded-lg text-xs font-mono tracking-wider border"
                    style={{
                      borderColor: mobileChoice === 'egi' ? '#dc2626' : 'rgba(255,255,255,0.2)',
                      color: mobileChoice === 'egi' ? '#fca5a5' : '#a1a1aa',
                      background: mobileChoice === 'egi' ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    EGI
                  </button>
                  <button
                    onClick={() => setMobileChoice('patrick')}
                    className="py-2 rounded-lg text-xs font-mono tracking-wider border"
                    style={{
                      borderColor: mobileChoice === 'patrick' ? '#2563eb' : 'rgba(255,255,255,0.2)',
                      color: mobileChoice === 'patrick' ? '#93c5fd' : '#a1a1aa',
                      background: mobileChoice === 'patrick' ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    PATRICK
                  </button>
                </div>

                {mobileChoice === 'egi' ? (
                  <CharacterCard
                    data={EGI_DATA}
                    onSelect={() => handleSelect('egi')}
                    isHovered={false}
                    isDimmed={false}
                  />
                ) : (
                  <CharacterCard
                    data={PATRICK_DATA}
                    onSelect={() => handleSelect('patrick')}
                    isHovered={false}
                    isDimmed={false}
                  />
                )}
              </div>

              {/* Desktop: both cards side-by-side */}
              <div className="hidden md:grid grid-cols-2 gap-8 w-full">
                <motion.div
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                  onMouseEnter={() => setHovered('egi')}
                  onMouseLeave={() => setHovered(null)}
                >
                  <CharacterCard
                    data={EGI_DATA}
                    onSelect={() => handleSelect('egi')}
                    isHovered={hovered === 'egi'}
                    isDimmed={hovered === 'patrick'}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                  onMouseEnter={() => setHovered('patrick')}
                  onMouseLeave={() => setHovered(null)}
                >
                  <CharacterCard
                    data={PATRICK_DATA}
                    onSelect={() => handleSelect('patrick')}
                    isHovered={hovered === 'patrick'}
                    isDimmed={hovered === 'egi'}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          className="mt-8 text-xs text-text-muted font-mono tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          PRIMEDESK v2.0 // TWO OPERATIVES // ONE MISSION
        </motion.p>
      </div>
    </div>
  );
}
