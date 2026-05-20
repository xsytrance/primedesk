import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  icon: React.ReactNode;
  label: string;
  color: string;
}

export default function AbilityHexagon({ icon, label, color }: Props) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="w-9 h-9 flex items-center justify-center cursor-help"
        style={{
          background: `${color}18`,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          border: `1px solid ${color}40`,
        }}
        whileHover={{ scale: 1.15, background: `${color}30` }}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        <span style={{ color }}>{icon}</span>
      </motion.div>

      {/* Tooltip */}
      {showTip && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap z-20"
          style={{
            background: '#1a1a24',
            border: `1px solid ${color}40`,
            color,
          }}
        >
          {label}
        </motion.div>
      )}
    </div>
  );
}
