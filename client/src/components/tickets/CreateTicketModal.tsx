import { useState } from 'react';
import { motion } from 'framer-motion';
import ModalSheet from '@/components/ModalSheet';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    category: string;
    office: 'NYC' | 'SF' | 'DC';
  }) => void;
}

const priorityOptions: Array<{ value: 'Low' | 'Medium' | 'High' | 'Critical'; label: string; color: string }> = [
  { value: 'Low', label: 'Low', color: '#7a7a94' },
  { value: 'Medium', label: 'Medium', color: '#ffb347' },
  { value: 'High', label: 'High', color: '#ff4d6a' },
  { value: 'Critical', label: 'Critical', color: '#ff4d6a' },
];

const categoryOptions = ['Hardware', 'Software', 'Network', 'Access', 'Security', 'Infrastructure', 'Email', 'AV', 'Other'];

const officeOptions: Array<{ value: 'NYC' | 'SF' | 'DC'; label: string; color: string }> = [
  { value: 'NYC', label: 'NYC', color: '#00d9ff' },
  { value: 'SF', label: 'SF', color: '#ff4fd8' },
  { value: 'DC', label: 'DC', color: '#7dff9e' },
];

export default function CreateTicketModal({ isOpen, onClose, onSubmit }: CreateTicketModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [category, setCategory] = useState('Hardware');
  const [office, setOffice] = useState<'NYC' | 'SF' | 'DC'>('NYC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      office,
    });
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setCategory('Hardware');
    setOffice('NYC');
  };

  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="New Ticket">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue..."
            className="w-full px-4 py-3 rounded-xl bg-bg-input border border-white/5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan/50 focus:shadow-[0_0_0_3px_var(--cyan-dim)] transition-all"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the issue..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-bg-input border border-white/5 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-cyan/50 focus:shadow-[0_0_0_3px_var(--cyan-dim)] transition-all"
          />
        </div>

        {/* Priority segmented control */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">
            Priority
          </label>
          <div className="flex gap-1.5 p-1 bg-bg-surface rounded-xl border border-white/5">
            {priorityOptions.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: priority === p.value ? `${p.color}25` : 'transparent',
                  color: priority === p.value ? p.color : '#7a7a94',
                  border: priority === p.value ? `1px solid ${p.color}40` : '1px solid transparent',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category select */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-bg-input border border-white/5 text-sm text-text-primary focus:outline-none focus:border-cyan/50 focus:shadow-[0_0_0_3px_var(--cyan-dim)] transition-all appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237a7a94' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Office radio pills */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">
            Office
          </label>
          <div className="flex gap-2">
            {officeOptions.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setOffice(o.value)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: office === o.value ? `${o.color}20` : 'var(--bg-surface)',
                  color: office === o.value ? o.color : '#7a7a94',
                  border: `1px solid ${office === o.value ? `${o.color}50` : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: o.color }}
                />
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit + Cancel */}
        <div className="flex flex-col gap-2 pt-2">
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={!canSubmit}
            className="w-full py-3.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canSubmit
                ? 'linear-gradient(135deg, #00d9ff, #ff4fd8)'
                : 'var(--bg-surface)',
              boxShadow: canSubmit ? '0 4px 16px rgba(0,217,255,0.25)' : 'none',
            }}
          >
            Create Ticket
          </motion.button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </ModalSheet>
  );
}
