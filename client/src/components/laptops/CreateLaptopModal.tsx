import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ModalSheet from '@/components/ModalSheet';
import type { Laptop } from '@/data/mock';

export type LaptopFormData = {
  laptop_tag: string;
  assignee_name: string;
  action_type: 'send' | 'setup';
  office: 'New York City' | 'San Francisco' | 'Washington DC';
  due_date: string;
  notes: string;
  status: 'Open' | 'Completed';
  stage: 'acquire' | 'configure' | 'ship';
};

interface CreateLaptopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LaptopFormData) => void;
  onDelete?: (id: number) => void;
  editLaptop?: Laptop | null;
}

const officeOptions: { value: LaptopFormData['office']; label: string; color: string; short: string }[] = [
  { value: 'New York City', label: 'NYC Main HQ', color: '#00d9ff', short: 'NYC' },
  { value: 'San Francisco', label: 'SF Innovation Node', color: '#ff4fd8', short: 'SF' },
  { value: 'Washington DC', label: 'DC Policy Node', color: '#7dff9e', short: 'DC' },
];

const actionOptions: { value: LaptopFormData['action_type']; label: string }[] = [
  { value: 'send', label: 'Send' },
  { value: 'setup', label: 'Setup' },
];

const stageOptions: { value: LaptopFormData['stage']; label: string; color: string }[] = [
  { value: 'acquire', label: 'Acquire', color: '#00d9ff' },
  { value: 'configure', label: 'Configure', color: '#ff4fd8' },
  { value: 'ship', label: 'Ship', color: '#7dff9e' },
];

function getDefaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

export default function CreateLaptopModal({ isOpen, onClose, onSubmit, onDelete, editLaptop }: CreateLaptopModalProps) {
  const isEdit = !!editLaptop;

  const [form, setForm] = useState<LaptopFormData>({
    laptop_tag: '',
    assignee_name: '',
    action_type: 'setup',
    office: 'New York City',
    due_date: getDefaultDate(),
    notes: '',
    status: 'Open',
    stage: 'acquire',
  });

  useEffect(() => {
    if (editLaptop) {
      setForm({
        laptop_tag: editLaptop.laptop_tag,
        assignee_name: editLaptop.assignee_name,
        action_type: editLaptop.action_type,
        office: editLaptop.office,
        due_date: editLaptop.due_date,
        notes: editLaptop.notes,
        status: editLaptop.status,
        stage: editLaptop.stage || 'acquire',
      });
    } else {
      setForm({
        laptop_tag: '',
        assignee_name: '',
        action_type: 'setup',
        office: 'New York City',
        due_date: getDefaultDate(),
        notes: '',
        status: 'Open',
        stage: 'acquire',
      });
    }
  }, [editLaptop, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.laptop_tag.trim() || !form.assignee_name.trim()) return;
    onSubmit(form);
    onClose();
  };

  const updateField = <K extends keyof LaptopFormData>(field: K, value: LaptopFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Laptop Task' : 'Add Laptop Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Laptop Tag */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">
            Laptop Model <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={form.laptop_tag}
            onChange={(e) => updateField('laptop_tag', e.target.value)}
            placeholder="e.g., MacBook Pro M3 14-inch"
            required
            className={cn(
              'w-full px-4 py-3 rounded-lg bg-input border border-white/[0.06]',
              'text-sm text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:border-cyan focus:shadow-[0_0_0_3px_rgba(0,217,255,0.15)]',
              'transition-all',
            )}
          />
        </div>

        {/* Assignee Name */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">
            Assignee Name <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={form.assignee_name}
            onChange={(e) => updateField('assignee_name', e.target.value)}
            placeholder="Who is this laptop for?"
            required
            className={cn(
              'w-full px-4 py-3 rounded-lg bg-input border border-white/[0.06]',
              'text-sm text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:border-cyan focus:shadow-[0_0_0_3px_rgba(0,217,255,0.15)]',
              'transition-all',
            )}
          />
        </div>

        {/* Office Selection */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">Office</label>
          <div className="flex gap-2 flex-wrap">
            {officeOptions.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => updateField('office', o.value)}
                className={cn(
                  'flex-1 min-w-[80px] px-3 py-2.5 rounded-lg text-sm font-medium text-center transition-all active:scale-95 border',
                  form.office === o.value
                    ? 'border-opacity-60'
                    : 'bg-input border-white/[0.06] text-text-secondary hover:text-text-primary',
                )}
                style={
                  form.office === o.value
                    ? {
                        backgroundColor: o.color + '15',
                        borderColor: o.color + '60',
                        color: o.color,
                      }
                    : undefined
                }
              >
                <span className="block text-xs font-mono opacity-70">{o.short}</span>
                <span className="block text-xs mt-0.5 truncate">{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Type */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">Action Type</label>
          <div className="flex gap-2">
            {actionOptions.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => updateField('action_type', a.value)}
                className={cn(
                  'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 border',
                  form.action_type === a.value
                    ? 'bg-cyan-dim border-cyan/40 text-cyan'
                    : 'bg-input border-white/[0.06] text-text-secondary hover:text-text-primary',
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stage */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">Pipeline Stage</label>
          <div className="flex gap-2">
            {stageOptions.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => updateField('stage', s.value)}
                className={cn(
                  'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 border',
                  form.stage === s.value
                    ? 'border-opacity-60'
                    : 'bg-input border-white/[0.06] text-text-secondary hover:text-text-primary',
                )}
                style={
                  form.stage === s.value
                    ? {
                        backgroundColor: s.color + '15',
                        borderColor: s.color + '60',
                        color: s.color,
                      }
                    : undefined
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">Due Date</label>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => updateField('due_date', e.target.value)}
            required
            className={cn(
              'w-full px-4 py-3 rounded-lg bg-input border border-white/[0.06]',
              'text-sm text-text-primary',
              'focus:outline-none focus:border-cyan focus:shadow-[0_0_0_3px_rgba(0,217,255,0.15)]',
              'transition-all',
            )}
          />
        </div>

        {/* Status toggle */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">Status</label>
          <div className="flex gap-2">
            {(['Open', 'Completed'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateField('status', s)}
                className={cn(
                  'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 border',
                  form.status === s
                    ? s === 'Completed'
                      ? 'bg-green-dim border-green/40 text-green'
                      : 'bg-cyan-dim border-cyan/40 text-cyan'
                    : 'bg-input border-white/[0.06] text-text-secondary hover:text-text-primary',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm text-text-secondary font-medium mb-1.5">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Configuration requirements, shipping address, etc."
            rows={3}
            className={cn(
              'w-full px-4 py-3 rounded-lg bg-input border border-white/[0.06]',
              'text-sm text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:border-cyan focus:shadow-[0_0_0_3px_rgba(0,217,255,0.15)]',
              'transition-all resize-none',
            )}
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className={cn(
            'w-full py-3.5 rounded-xl text-sm font-bold text-white',
            'flex items-center justify-center gap-2',
            'bg-gradient-to-r from-cyan to-magenta',
            'shadow-[0_4px_16px_rgba(0,217,255,0.25)]',
            'active:shadow-none transition-shadow',
          )}
        >
          {isEdit ? <Save size={16} /> : <Plus size={16} />}
          {isEdit ? 'SAVE CHANGES' : 'ADD TASK'}
        </motion.button>

        {/* Delete option in edit mode */}
        {isEdit && editLaptop && onDelete && (
          <button
            type="button"
            onClick={() => {
              onDelete(editLaptop.id);
              onClose();
            }}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-medium text-red',
              'flex items-center justify-center gap-2',
              'border border-red/30 bg-red-dim',
              'hover:bg-red/20 transition-colors active:scale-[0.98]',
            )}
          >
            <Trash2 size={15} />
            DELETE TASK
          </button>
        )}
      </form>
    </ModalSheet>
  );
}
