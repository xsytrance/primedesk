import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

// ─── Particle Field ──────────────────────────────────────────────────

function ParticleField({ color }: { color: string }) {
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

    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 500),
        y: Math.random() * (canvas.height || 800),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
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

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />;
}

// ─── Character Half ──────────────────────────────────────────────────

function CharacterHalf({
  name,
  codename,
  image,
  color,
  glowColor,
  dimColor,
  isActive,
  isDimmed,
  objectPos,
  onActivate,
  onDeactivate,
  onSelect,
}: {
  name: string;
  codename: string;
  image: string;
  color: string;
  glowColor: string;
  dimColor: string;
  isActive: boolean;
  isDimmed: boolean;
  objectPos: string;
  onActivate: () => void;
  onDeactivate: () => void;
  onSelect: () => void;
}) {
  return (
    <motion.div
      className="relative flex-1 cursor-pointer overflow-hidden min-h-0"
      animate={{
        opacity: isDimmed ? 0.3 : 1,
      }}
      transition={{ duration: 0.4 }}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onClick={onSelect}
      onTouchStart={onActivate}
      onTouchEnd={onDeactivate}
    >
      {/* Character Image */}
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: isActive ? 1.06 : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-cover ${objectPos}`}
          draggable={false}
        />
      </motion.div>

      {/* Darkening overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: isActive
            ? `linear-gradient(to bottom, ${dimColor}30, ${dimColor}70 60%, #050508e8)`
            : `linear-gradient(to bottom, ${dimColor}80, ${dimColor}a0 50%, #050508f0)`,
        }}
      />

      {/* Active color tint */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: isActive
            ? `radial-gradient(ellipse at 50% 100%, ${glowColor}30 0%, transparent 70%)`
            : 'transparent',
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Edge glow line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{ bottom: 0 }}
        animate={{
          background: isActive ? color : 'transparent',
          boxShadow: isActive ? `0 0 20px ${glowColor}` : 'none',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Particles */}
      <ParticleField color={color} />

      {/* Text Content */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-5 md:p-8">
        {/* Codename */}
        <motion.p
          className="font-mono text-[9px] md:text-[11px] uppercase tracking-[0.35em] mb-1"
          style={{ color: `${color}cc` }}
          animate={{ opacity: isActive ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
        >
          {codename}
        </motion.p>

        {/* Name */}
        <motion.h2
          className="font-display font-black leading-none"
          style={{
            fontSize: 'clamp(2.2rem, 10vw, 5rem)',
            color: '#fff',
            textShadow: `0 0 30px ${glowColor}, 0 2px 10px rgba(0,0,0,0.9)`,
          }}
          animate={{
            x: isActive ? 4 : 0,
            textShadow: isActive
              ? `0 0 50px ${glowColor}, 0 0 100px ${glowColor}, 0 2px 10px rgba(0,0,0,0.9)`
              : `0 0 30px ${glowColor}, 0 2px 10px rgba(0,0,0,0.9)`,
          }}
          transition={{ duration: 0.3 }}
        >
          {name}
        </motion.h2>

        {/* Tap indicator */}
        <motion.div
          className="flex items-center gap-2 mt-2"
          animate={{ opacity: isActive ? 1 : 0.4 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: color, boxShadow: `0 0 6px ${glowColor}` }}
          />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: `${color}aa` }}>
            Tap to Select
          </span>
        </motion.div>
      </div>

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-20"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 6px)' }}
      />
    </motion.div>
  );
}

// ─── VS Badge ────────────────────────────────────────────────────────

function VSBadge({ active }: { active: 'egi' | 'patrick' | null }) {
  const color = active === 'egi' ? '#dc2626' : active === 'patrick' ? '#2563eb' : '#ffffff';

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none md:hidden">
      <motion.div
        className="relative flex items-center justify-center"
        animate={{ scale: active ? 1.1 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="w-12 h-12 rounded-full border-2 flex items-center justify-center backdrop-blur-md"
          style={{
            borderColor: `${color}60`,
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            boxShadow: `0 0 20px ${color}30`,
          }}
        >
          <span className="font-display font-black text-base tracking-tighter" style={{ color }}>
            VS
          </span>
        </div>
        <motion.div
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: `${color}30` }}
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}

// ─── VS Divider (desktop only) ──────────────────────────────────────

function VSDividerDesktop({ active }: { active: 'egi' | 'patrick' | null }) {
  const color = active === 'egi' ? '#dc2626' : active === 'patrick' ? '#2563eb' : '#ffffff';

  return (
    <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-30 hidden md:flex flex-col items-center justify-center pointer-events-none">
      <div className="flex-1 w-[2px]" style={{ background: `linear-gradient(to bottom, transparent, ${color}40)` }} />
      <motion.div
        className="relative flex items-center justify-center"
        animate={{ scale: active ? 1.15 : 1 }}
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
          <span className="font-display font-black text-xl md:text-2xl tracking-tighter" style={{ color }}>VS</span>
        </div>
        <motion.div
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: `${color}30` }}
          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      <div className="flex-1 w-[2px]" style={{ background: `linear-gradient(to top, transparent, ${color}40)` }} />
    </div>
  );
}

// ─── Loading Screen ──────────────────────────────────────────────────

function LoadingScreen({ name, color }: { name: string; color: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050508]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-32 h-32 md:w-60 md:h-60 rounded-full"
          style={{ border: `2px solid ${color}30` }}
          animate={{ scale: [1, 2], opacity: [0.6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-32 h-32 md:w-60 md:h-60 rounded-full"
          style={{ border: `2px solid ${color}20` }}
          animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
        <div
          className="w-16 h-16 md:w-28 md:h-28 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: `${color}40`, borderTopColor: 'transparent' }}
        />
      </div>
      <motion.p
        className="mt-8 md:mt-10 font-display text-base md:text-xl tracking-[0.5em]"
        style={{ color }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {name}
      </motion.p>
      <p className="mt-2 font-mono text-[9px] md:text-[10px] text-text-muted tracking-[0.3em] uppercase">
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
  const [active, setActive] = useState<'egi' | 'patrick' | null>(null);
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
      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-[0.025]"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 8px)' }}
      />
      {/* Noise */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-[0.04]"
        style={{ backgroundImage: 'url(/noise-texture.svg)' }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-10 py-3 md:py-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 md:gap-3"
        >
          <div
            className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs md:text-sm"
            style={{ background: 'linear-gradient(135deg, #dc2626, #2563eb)', color: '#fff' }}
          >
            P
          </div>
          <span className="font-display text-xs md:text-sm tracking-wider text-text-muted">PRIMEDESK</span>
        </motion.div>
        <motion.p
          className="font-mono text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Choose Your Fighter
        </motion.p>
      </div>

      {/* Character Panels — stacked on mobile, side-by-side on desktop */}
      <div className="absolute inset-0 flex flex-col md:flex-row z-0 pt-12 md:pt-0">
        {/* EGI */}
        <motion.div
          className="flex-1 min-h-0"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CharacterHalf
            name="AGENOR"
            codename="The Field Agent"
            image="/egi-character.png"
            color="#dc2626"
            glowColor="rgba(220,38,38,0.4)"
            dimColor="rgba(60,10,10,1)"
            isActive={active === 'egi'}
            isDimmed={active === 'patrick'}
            objectPos="object-top md:object-left"
            onActivate={() => setActive('egi')}
            onDeactivate={() => setActive(null)}
            onSelect={() => handleSelect('egi')}
          />
        </motion.div>

        {/* PATRICK */}
        <motion.div
          className="flex-1 min-h-0"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <CharacterHalf
            name="PATRICK"
            codename="The New Guy"
            image="/patrick-character.png"
            color="#2563eb"
            glowColor="rgba(37,99,235,0.4)"
            dimColor="rgba(10,20,60,1)"
            isActive={active === 'patrick'}
            isDimmed={active === 'egi'}
            objectPos="object-top md:object-right"
            onActivate={() => setActive('patrick')}
            onDeactivate={() => setActive(null)}
            onSelect={() => handleSelect('patrick')}
          />
        </motion.div>
      </div>

      {/* Mobile VS badge (horizontal center) */}
      <VSBadge active={active} />

      {/* Desktop VS divider (vertical center) */}
      <VSDividerDesktop active={active} />

      {/* Footer */}
      <motion.p
        className="absolute bottom-3 left-0 right-0 z-30 text-center font-mono text-[8px] md:text-[9px] text-text-muted tracking-[0.3em] uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        PrimeDesk v2.0 // Select Your Operative
      </motion.p>
    </div>
  );
}
