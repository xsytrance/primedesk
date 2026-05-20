import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Laptop } from 'lucide-react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockLaptops } from '@/data/mock';
import type { Laptop as LaptopType } from '@/data/mock';
import LaptopPipeline from '@/components/laptops/LaptopPipeline';
import LaptopFilters from '@/components/laptops/LaptopFilters';
import type { StatusFilter, OfficeFilter } from '@/components/laptops/LaptopFilters';
import OfficeSection from '@/components/laptops/OfficeSection';
import CreateLaptopModal from '@/components/laptops/CreateLaptopModal';
import type { LaptopFormData } from '@/components/laptops/CreateLaptopModal';

const officeConfig: Record<string, { name: string; color: string; filterKey: OfficeFilter }> = {
  'New York City': { name: 'NYC MAIN HQ', color: '#00d9ff', filterKey: 'NYC' },
  'San Francisco': { name: 'SF INNOVATION NODE', color: '#ff4fd8', filterKey: 'SF' },
  'Washington DC': { name: 'DC POLICY NODE', color: '#7dff9e', filterKey: 'DC' },
};

function isOverdue(laptop: LaptopType): boolean {
  if (laptop.status === 'Completed') return false;
  const due = parseISO(laptop.due_date);
  return isPast(due) && !isToday(due);
}

export default function LaptopsPage() {
  const [laptops, setLaptops] = useState<LaptopType[]>(mockLaptops);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLaptop, setEditLaptop] = useState<LaptopType | null>(null);
  const [activeStage, setActiveStage] = useState<'acquire' | 'configure' | 'ship' | null>(null);

  // Filters
  const currentMonth = format(new Date(), 'yyyy-MM');
  const [month, setMonth] = useState(currentMonth);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [officeFilter, setOfficeFilter] = useState<OfficeFilter>('All');

  // Filtered laptops
  const filteredLaptops = useMemo(() => {
    return laptops.filter((l) => {
      // Month filter - check if due_date is in selected month
      const dueMonth = l.due_date.substring(0, 7);
      const completedMonth = l.completed_at ? l.completed_at.substring(0, 7) : '';
      const monthMatch = dueMonth === month || completedMonth === month || l.created_at.substring(0, 7) === month;

      // Status filter
      const statusMatch = statusFilter === 'All' || l.status === statusFilter;

      // Office filter
      const officeMatch =
        officeFilter === 'All' || officeConfig[l.office]?.filterKey === officeFilter;

      // Stage filter (from pipeline tap)
      const stageMatch = !activeStage || l.stage === activeStage;

      return monthMatch && statusMatch && officeMatch && stageMatch;
    });
  }, [laptops, month, statusFilter, officeFilter, activeStage]);

  // Group by office
  const groupedByOffice = useMemo(() => {
    const groups: Record<string, LaptopType[]> = {};
    for (const l of filteredLaptops) {
      if (!groups[l.office]) groups[l.office] = [];
      groups[l.office].push(l);
    }
    return groups;
  }, [filteredLaptops]);

  // Office order
  const officeOrder = ['New York City', 'San Francisco', 'Washington DC'];

  // Summary stats
  const total = filteredLaptops.length;
  const inProgress = filteredLaptops.filter((l) => l.status === 'Open').length;
  const completed = filteredLaptops.filter((l) => l.status === 'Completed').length;
  const overdue = filteredLaptops.filter(isOverdue).length;

  // CRUD operations
  const handleToggleComplete = useCallback((id: number) => {
    setLaptops((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: l.status === 'Completed' ? 'Open' : 'Completed',
              completed_at: l.status === 'Completed' ? null : new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : l,
      ),
    );
  }, []);

  const handleAdd = useCallback(
    (formData: LaptopFormData) => {
      if (editLaptop) {
        // Update existing
        setLaptops((prev) =>
          prev.map((l) =>
            l.id === editLaptop.id
              ? {
                  ...l,
                  ...formData,
                  updated_at: new Date().toISOString(),
                }
              : l,
          ),
        );
        setEditLaptop(null);
      } else {
        // Create new
        const newLaptop: LaptopType = {
          id: Math.max(...laptops.map((l) => l.id), 0) + 1,
          laptop_tag: formData.laptop_tag,
          assignee_name: formData.assignee_name,
          action_type: formData.action_type,
          office: formData.office,
          due_date: formData.due_date,
          notes: formData.notes,
          status: formData.status,
          completed_at: formData.status === 'Completed' ? new Date().toISOString() : null,
          created_by: 1,
          created_by_name: 'operator1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          stage: formData.stage,
        };
        setLaptops((prev) => [...prev, newLaptop]);
      }
    },
    [editLaptop, laptops],
  );

  const handleEdit = useCallback((laptop: LaptopType) => {
    setEditLaptop(laptop);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    setLaptops((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditLaptop(null);
  }, []);

  return (
    <div className="min-h-[100dvh] pb-[calc(64px+env(safe-area-inset-bottom)+16px)]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-5">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-heading text-h1 text-text-primary">Outgoing Laptops</h1>
            <p className="text-sm text-text-secondary font-mono mt-0.5">
              Track, configure, and ship laptops across offices
            </p>
          </div>
          <button
            onClick={() => {
              setEditLaptop(null);
              setIsModalOpen(true);
            }}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white',
              'bg-gradient-to-r from-cyan to-magenta',
              'shadow-[0_4px_16px_rgba(0,217,255,0.25)]',
              'active:scale-95 active:shadow-none transition-all',
            )}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </motion.div>

        {/* Filters */}
        <LaptopFilters
          month={month}
          onMonthChange={setMonth}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          officeFilter={officeFilter}
          onOfficeChange={setOfficeFilter}
        />

        {/* Pipeline Visualization */}
        <LaptopPipeline
          laptops={filteredLaptops}
          onStageClick={setActiveStage}
          activeStage={activeStage}
        />

        {/* Active stage filter indicator */}
        <AnimatePresence>
          {activeStage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center"
            >
              <button
                onClick={() => setActiveStage(null)}
                className="text-xs font-mono text-cyan hover:underline bg-cyan-dim px-3 py-1 rounded-full border border-cyan/30"
              >
                Clear stage filter: {activeStage.toUpperCase()} ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Office Sections */}
        <div className="space-y-3 md:space-y-4">
          <AnimatePresence mode="wait">
            {total > 0 ? (
              officeOrder.map((officeKey) => {
                const officeLaptops = groupedByOffice[officeKey];
                if (!officeLaptops || officeLaptops.length === 0) return null;

                const config = officeConfig[officeKey];
                return (
                  <OfficeSection
                    key={officeKey}
                    officeName={config.name}
                    officeKey={officeKey}
                    color={config.color}
                    laptops={officeLaptops}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <img
                  src="/laptop-pipeline.svg"
                  alt="No laptops"
                  className="w-48 h-32 md:w-64 md:h-40 mb-4 opacity-60"
                  onError={(e) => {
                    // Fallback if SVG doesn't load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="flex flex-col items-center gap-2">
                  <Laptop size={40} className="text-text-muted" />
                  <p className="text-text-secondary text-sm">No laptop tasks match your filters</p>
                  <button
                    onClick={() => {
                      setMonth(currentMonth);
                      setStatusFilter('All');
                      setOfficeFilter('All');
                      setActiveStage(null);
                    }}
                    className="text-xs font-mono text-cyan hover:underline mt-1"
                  >
                    Reset all filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>

      {/* Summary Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.3 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40',
          'bg-bg-elevated/95 backdrop-blur-xl',
          'border-t border-white/[0.06]',
          'pb-[calc(64px+env(safe-area-inset-bottom))]',
        )}
      >
        {/* Mini segmented progress bar */}
        <div className="h-[3px] w-full flex">
          {total > 0 && (
            <>
              <motion.div
                className="h-full bg-green"
                initial={{ width: 0 }}
                animate={{ width: `${(completed / total) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="h-full bg-amber"
                initial={{ width: 0 }}
                animate={{ width: `${(inProgress / total) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
              {overdue > 0 && (
                <motion.div
                  className="h-full bg-red"
                  initial={{ width: 0 }}
                  animate={{ width: `${(overdue / total) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-around py-2.5 px-4 max-w-[1200px] mx-auto">
          <div className="text-center">
            <span className="block text-xs font-display text-text-primary">{total}</span>
            <span className="block text-[10px] font-mono uppercase text-text-secondary tracking-wider">
              Total
            </span>
          </div>
          <div className="text-center">
            <span className="block text-xs font-display text-amber">{inProgress}</span>
            <span className="block text-[10px] font-mono uppercase text-text-secondary tracking-wider">
              Open
            </span>
          </div>
          <div className="text-center">
            <span className="block text-xs font-display text-green">{completed}</span>
            <span className="block text-[10px] font-mono uppercase text-text-secondary tracking-wider">
              Done
            </span>
          </div>
          {overdue > 0 && (
            <div className="text-center">
              <span className="block text-xs font-display text-red">{overdue}</span>
              <span className="block text-[10px] font-mono uppercase text-text-secondary tracking-wider">
                Overdue
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Create/Edit Modal */}
      <CreateLaptopModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAdd}
        onDelete={handleDelete}
        editLaptop={editLaptop}
      />
    </div>
  );
}
