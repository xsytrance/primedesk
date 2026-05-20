import { motion } from 'framer-motion';
import AbilityHexagon from './AbilityHexagon';
import CharacterStats from './CharacterStats';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CharacterData {
  name: string;
  codename: string;
  image: string;
  quote: string;
  roleTags: string[];
  abilities: { name: string; icon: string }[];
  stats: { label: string; value: string }[];
  strengths: string[];
  weapon: string;
  primaryColor: string;
  primaryGlow: string;
  accentText: string;
}

interface Props {
  data: CharacterData;
  onSelect: () => void;
  isHovered: boolean;
  isDimmed: boolean;
}

export default function CharacterCard({ data, onSelect, isHovered, isDimmed }: Props) {
  const { name, codename, image, quote, roleTags, abilities, stats, strengths, weapon, primaryColor, primaryGlow, accentText } = data;

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      animate={{
        y: isHovered ? -10 : 0,
        scale: isHovered ? 1.02 : 1,
        opacity: isDimmed ? 0.4 : 1,
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      onClick={onSelect}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-1 rounded-3xl blur-xl opacity-0 transition-opacity duration-500"
        animate={{ opacity: isHovered ? 0.4 : 0 }}
        style={{ background: primaryGlow }}
      />

      {/* Card */}
      <div
        className="relative rounded-2xl overflow-hidden border backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(18,18,26,0.9) 0%, rgba(10,10,15,0.95) 100%)',
          borderColor: isHovered ? primaryColor : 'rgba(255,255,255,0.06)',
          boxShadow: isHovered ? `0 0 40px ${primaryGlow}, inset 0 1px 0 ${primaryGlow}` : 'none',
        }}
      >
        {/* Top accent line */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }}
        />

        {/* Character Image */}
        <div className="relative h-48 md:h-56 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top"
            style={{ filter: isHovered ? 'brightness(1.1) contrast(1.05)' : 'brightness(0.85)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 40%, rgba(10,10,15,0.9) 85%, rgba(10,10,15,1) 100%)`,
            }}
          />
          {/* Codename badge */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] border"
            style={{
              background: `${primaryColor}22`,
              borderColor: `${primaryColor}44`,
              color: accentText,
            }}
          >
            {codename}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 -mt-4 relative z-10">
          {/* Name */}
          <motion.h2
            className="font-display text-3xl md:text-4xl font-black tracking-tight mb-1"
            style={{
              color: primaryColor,
              textShadow: `0 0 30px ${primaryGlow}`,
            }}
            animate={{
              textShadow: isHovered
                ? ['0 0 40px ' + primaryGlow + ', 0 0 80px ' + primaryGlow]
                : ['0 0 30px ' + primaryGlow],
            }}
          >
            {name}
          </motion.h2>

          {/* Role Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {roleTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border"
                style={{
                  background: `${primaryColor}15`,
                  borderColor: `${primaryColor}30`,
                  color: accentText,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <CharacterStats stats={stats} primaryColor={primaryColor} accentText={accentText} isHovered={isHovered} />

          {/* Quote */}
          <div
            className="my-4 p-3 rounded-xl border-l-2"
            style={{
              background: `${primaryColor}08`,
              borderLeftColor: primaryColor,
            }}
          >
            <p className="text-xs italic leading-relaxed" style={{ color: accentText }}>
              &ldquo;{quote}&rdquo;
            </p>
          </div>

          {/* Ability Hexagons */}
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {abilities.map((ab) => {
              const IconComp = (Icons[ab.icon as keyof typeof Icons] || Icons.Circle) as LucideIcon;
              return (
                <AbilityHexagon
                  key={ab.name}
                  icon={<IconComp size={14} />}
                  label={ab.name}
                  color={primaryColor}
                />
              );
            })}
          </div>

          {/* Strengths */}
          <div className="mb-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted mb-1.5">Strengths</p>
            <div className="flex flex-wrap gap-1">
              {strengths.map((s) => (
                <span
                  key={s}
                  className="text-[10px] px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: `${primaryColor}30`,
                    color: accentText,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Weapon of Choice */}
          <div
            className="mb-4 p-2 rounded-lg text-center"
            style={{ background: `${primaryColor}10` }}
          >
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted mb-0.5">Weapon of Choice</p>
            <p className="text-[11px]" style={{ color: accentText }}>{weapon}</p>
          </div>

          {/* Select Button */}
          <motion.button
            className="w-full py-3 rounded-xl font-display font-bold text-sm tracking-wider relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
              color: '#fff',
              boxShadow: `0 4px 20px ${primaryGlow}`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">SELECT OPERATIVE</span>
            {isHovered && (
              <motion.div
                className="absolute inset-0"
                style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)` }}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
