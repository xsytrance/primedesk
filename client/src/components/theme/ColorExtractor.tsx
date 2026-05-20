import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Wand2 } from 'lucide-react';

interface ExtractedColors {
  primary: string;
  secondary: string;
}

interface Props {
  onColorsExtracted: (colors: ExtractedColors) => void;
}

export default function ColorExtractor({ onColorsExtracted }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedColors | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const extractColors = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);

        const data = ctx.getImageData(0, 0, 64, 64).data;
        const colorBuckets = new Map<string, number>();

        // Quantize to 4-bit buckets and count
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i] >> 4;
          const g = data[i + 1] >> 4;
          const b = data[i + 2] >> 4;
          const a = data[i + 3];
          if (a < 128) continue;

          // Skip grayscale-ish
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max - min < 3) continue;

          const key = `${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
          colorBuckets.set(key, (colorBuckets.get(key) || 0) + 1);
        }

        // Sort by frequency
        const sorted = Array.from(colorBuckets.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([hex]) => `#${hex}${hex}`); // Expand 4-bit to 8-bit

        const primary = sorted[0] || '#dc2626';
        const secondary = sorted[1] || sorted[0] || '#2563eb';

        const result = { primary, secondary };
        setExtracted(result);
        onColorsExtracted(result);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [onColorsExtracted]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) extractColors(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) extractColors(file);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className="relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer"
        style={{
          borderColor: dragOver ? 'var(--theme-primary)' : 'rgba(255,255,255,0.1)',
          background: dragOver ? 'var(--theme-primary-dim)' : 'rgba(18,18,26,0.5)',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('theme-image-upload')?.click()}
      >
        <input
          id="theme-image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Upload size={24} className="mx-auto mb-2 text-text-muted" />
        <p className="text-xs text-text-secondary">Drop an image or click to upload</p>
        <p className="text-[10px] text-text-muted mt-1">We&apos;ll extract the colors</p>
      </div>

      {/* Preview */}
      {preview && extracted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl border border-glass-border bg-bg-elevated"
        >
          <img src={preview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
          <div className="flex-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1">
              <Wand2 size={10} /> Extracted Colors
            </p>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full border border-white/10" style={{ background: extracted.primary }} />
                <span className="text-[10px] font-mono text-text-secondary">{extracted.primary}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full border border-white/10" style={{ background: extracted.secondary }} />
                <span className="text-[10px] font-mono text-text-secondary">{extracted.secondary}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
