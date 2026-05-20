import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

// ─── Particle Field ──────────────────────────────────────────────────

function ParticleField({ color, side }: { color: string; side: 'left' | 'right' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 500),
        y: Math.random() * (canvas.height || 800),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * 0.4 + 0.1,
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
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.a;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-10 ${side === 'left' ? '' : ''}`}
    />
  );
}

// ─── VS Divider ──────────────────────────────────────────────────────

function VSDivider({ hovered }: { hovered: 'egi' | 'patrick' | null }) {
  const color = hovered === 'egi' ? '#dc2626' : hovered === 'patrick' ? '#2563eb' : '#ffffff';

  return (
    <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-30 flex flex-col items-center justify-center pointer-events-none">
      {/* Top line */}
      <div className="flex-1 w-[2px]" style={{ background: `linear-gradient(to bottom, transparent, ${color}40)` }} />

      {/* VS Circle */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={{ scale: hovered ? 1.15 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center backdrop-blur-md"
          style={{
            borderColor: `${color}60`,
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            boxShadow: `0 0 30px ${color}30, inset 0 0 20px ${color}10`,
          }}
        >
          <span
            className="font-display font-black text-xl md:text-2xl tracking-tighter"
            style={{ color }}
          >
            VS
          </span>
        </div>
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: `${color}30` }}
          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Bottom line */}
      <div className="flex-1 w-[2px]" style={{ background: `linear-gradient(to top, transparent, ${color}40)` }} />
    </div>
  );
}

// ─── Character Side ──────────────────────────────────────────────────

function CharacterSide({
  side,
  name,
  codename,
  image,
  color,
  glowColor,
  dimColor,
  isHovered,
  isDimmed,
  onHover,
  onLeave,
  onSelect,
}: {
  side: 'left' | 'right';
  name: string;
  codename: string;
  image: string;
  color: string;
  glowColor: string;
  dimColor: string;
  isHovered: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  return (
    <motion.div
      className={`relative h-full cursor-pointer overflow-hidden ${side === 'left' ? '' : ''}`}
      animate={{
        flex: isHovered ? 1.15 : isDimmed ? 0.85 : 1,
      }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
    >
      {/* Character Image — MASSIVE, fills the entire half */}
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: isHovered ? 1.08 : 1,
          filter: isDimmed ? 'brightness(0.2) grayscale(0.6)' : 'brightness(0.7)',
        }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      >
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-cover ${side === 'left' ? 'object-left' : 'object-right'}`}
          draggable={false}
        />
      </motion.div>

      {/* Colored overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isHovered
            ? `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, ${dimColor}90, ${glowColor}40 60%, transparent)`
            : `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, ${dimColor}95, ${dimColor}60 50%, ${glowColor}20)`,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Bottom gradient for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.6) 25%, transparent 50%)`,
        }}
      />

      {/* Top edge gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(5,5,8,0.8) 0%, transparent 20%)`,
        }}
      />

      {/* Side glow on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          boxShadow: isHovered
            ? side === 'left'
              ? `inset -60px 0 100px ${glowColor}`
              : `inset 60px 0 100px ${glowColor}`
            : 'none',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Edge line */}
      <motion.div
        className={`absolute top-0 bottom-0 w-[3px] ${side === 'left' ? 'right-0' : 'left-0'}`}
        animate={{
          background: isHovered ? color : 'transparent',
          boxShadow: isHovered ? `0 0 20px ${glowColor}` : 'none',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Particles */}
      <ParticleField color={color} side={side} />

      {/* Text Content */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 p-6 md:p-10 ${side === 'left' ? 'text-left' : 'text-right'}`}>
        {/* Codename */}
        <motion.p
          className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] mb-2"
          style={{ color: `${color}cc` }}
          animate={{ opacity: isHovered ? 1 : 0.6, y: isHovered ? 0 : 5 }}
          transition={{ duration: 0.3 }}
        >
          {codename}
        </motion.p>

        {/* Name — MASSIVE */}
        <motion.h2
          className="font-display font-black leading-none mb-3"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 6rem)',
            color: '#fff',
            textShadow: `0 0 40px ${glowColor}, 0 4px 20px rgba(0,0,0,0.8)`,
          }}
          animate={{
            textShadow: isHovered
              ? `0 0 60px ${glowColor}, 0 0 120px ${glowColor}, 0 4px 20px rgba(0,0,0,0.8)`
              : `0 0 40px ${glowColor}, 0 4px 20px rgba(0,0,0,0.8)`,
            x: isHovered ? (side === 'left' ? 10 : -10) : 0,
          }}
          transition={{ duration: 0.4 }}
        >
          {name}
        </motion.h2>

        {/* Press indicator */}
        <motion.div
          className="inline-flex items-center gap-2"
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: color, boxShadow: `0 0 8px ${glowColor}` }}
          />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: `${color}aa` }}
          >
            Select
          </span>
        </motion.div>
      </div>

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] z-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 6px)',
        }}
      />
    </motion.div>
  );
}

// ─── Loading Overlay ─────────────────────────────────────────────────

function LoadingScreen({ name, color }: { name: string; color: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050508]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Radial pulse */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-40 h-40 md:w-60 md:h-60 rounded-full"
          style={{ border: `2px solid ${color}30` }}
          animate={{ scale: [1, 2], opacity: [0.6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-40 h-40 md:w-60 md:h-60 rounded-full"
          style={{ border: `2px solid ${color}20` }}
          animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />

        {/* Spinner */}
        <div
          className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: `${color}40`, borderTopColor: 'transparent' }}
        />
      </div>

      <motion.p
        className="mt-10 font-display text-lg md:text-xl tracking-[0.5em]"
        style={{ color }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {name}
      </motion.p>
      <p className="mt-2 font-mono text-[10px] text-text-muted tracking-[0.3em] uppercase">
        Initializing Operative
      </p>
    </motion.div>
  );
}

// ─── Main Login ──────────────────────────────────────────────────────

export default function Login() {
  const { login } = useAuth();
  const { applyUserTheme } = useTheme();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<'egi' | 'patrick' | null>(null);
  const [selected, setSelected] = useState<'egi' | 'patrick' | null>(null);

  const handleSelect = async (who: 'egi' | 'patrick') => {
    setSelected(who);
    const username = who === 'egi' ? 'operator1' : 'operator2';
    await new Promise((r) => setTimeout(r, 2200));
    await login(username, 'password');
    applyUserTheme(username);
    navigate('/');
  };

  if (selected) {
    return <LoadingScreen name={selected === 'egi' ? 'AGENOR' : 'PATRICK'} color={selected === 'egi' ? '#dc2626' : '#2563eb'} />;
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#050508] select-none">
      {/* Global scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-[0.025]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 8px)',
        }}
      />

      {/* Noise */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-[0.04]"
        style={{ backgroundImage: 'url(/noise-texture.svg)' }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #dc2626, #2563eb)', color: '#fff' }}
          >
            P
          </div>
          <span className="font-display text-sm tracking-wider text-text-muted">PRIMEDESK</span>
        </motion.div>

        <motion.p
          className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Choose Your Fighter
        </motion.p>
      </div>

      {/* Split Screen */}
      <div className="absolute inset-0 flex z-0">
        {/* EGI — LEFT */}
        <motion.div
          className="h-full"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          style={{ flex: 1 }}
        >
          <CharacterSide
            side="left"
            name="AGENOR"
            codename="The Field Agent"
            image="/egi-character.png"
            color="#dc2626"
            glowColor="rgba(220,38,38,0.4)"
            dimColor="rgba(60,10,10,1)"
            isHovered={hovered === 'egi'}
            isDimmed={hovered === 'patrick'}
            onHover={() => setHovered('egi')}
            onLeave={() => setHovered(null)}
            onSelect={() => handleSelect('egi')}
          />
        </motion.div>

        {/* PATRICK — RIGHT */}
        <motion.div
          className="h-full"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          style={{ flex: 1 }}
        >
          <CharacterSide
            side="right"
            name="PATRICK"
            codename="The New Guy"
            image="/patrick-character.png"
            color="#2563eb"
            glowColor="rgba(37,99,235,0.4)"
            dimColor="rgba(10,20,60,1)"
            isHovered={hovered === 'patrick'}
            isDimmed={hovered === 'egi'}
            onHover={() => setHovered('patrick')}
            onLeave={() => setHovered(null)}
            onSelect={() => handleSelect('patrick')}
          />
        </motion.div>
      </div>

      {/* VS Divider */}
      <VSDivider hovered={hovered} />

      {/* Footer */}
      <motion.p
        className="absolute bottom-4 left-0 right-0 z-30 text-center font-mono text-[9px] text-text-muted tracking-[0.3em] uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        PrimeDesk v2.0 // Select Your Operative
      </motion.p>
    </div>
  );
}
