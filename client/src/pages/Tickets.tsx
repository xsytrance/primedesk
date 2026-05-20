import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ArrowUpDown } from 'lucide-react';
import { mockTickets, currentUser } from '@/data/mock';
import type { Ticket, Comment } from '@/data/mock';
import SearchBar from '@/components/SearchBar';
import ModalSheet from '@/components/ModalSheet';
import TicketList from '@/components/tickets/TicketList';
import TicketDetail from '@/components/tickets/TicketDetail';
import TicketFilters from '@/components/tickets/TicketFilters';
import CreateTicketModal from '@/components/tickets/CreateTicketModal';
import type { StatusFilter, PriorityFilter } from '@/components/tickets/TicketFilters';

type SortOption = 'newest' | 'oldest' | 'priority';

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('All');
  const [activePriority, setActivePriority] = useState<PriorityFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Compute status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { total: tickets.length };
    tickets.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [tickets]);

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.number.toLowerCase().includes(q) ||
          t.requester.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (activeStatus !== 'All') {
      if (activeStatus === 'My Tickets') {
        result = result.filter((t) => t.assignee === currentUser.displayName);
      } else {
        result = result.filter((t) => t.status === activeStatus);
      }
    }

    // Priority filter (mapping timing → priority)
    if (activePriority !== 'All') {
      const priorityMap: Record<string, string[]> = {
        Soon: ['High', 'Critical'],
        Later: ['Medium'],
        Whenever: ['Low'],
      };
      const allowed = priorityMap[activePriority] || [];
      result = result.filter((t) => allowed.includes(t.priority));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority': {
          const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [tickets, searchQuery, activeStatus, activePriority, sortBy]);

  // Open ticket detail
  const handleTicketClick = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
  }, []);

  // Close detail
  const handleCloseDetail = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  // Status change
  const handleStatusChange = useCallback(
    (ticketId: string, newStatus: string) => {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: newStatus as Ticket['status'], updatedAt: new Date().toISOString() } : t
        )
      );
      setSelectedTicket((prev) =>
        prev && prev.id === ticketId
          ? { ...prev, status: newStatus as Ticket['status'], updatedAt: new Date().toISOString() }
          : prev
      );
    },
    []
  );

  // Add comment
  const handleAddComment = useCallback(
    (ticketId: string, text: string) => {
      const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: currentUser.displayName,
        text,
        createdAt: new Date().toISOString(),
      };
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, comments: [...t.comments, newComment], updatedAt: new Date().toISOString() }
            : t
        )
      );
      setSelectedTicket((prev) =>
        prev && prev.id === ticketId
          ? {
              ...prev,
              comments: [...prev.comments, newComment],
              updatedAt: new Date().toISOString(),
            }
          : prev
      );
    },
    []
  );

  // Create ticket
  const handleCreateTicket = useCallback(
    (data: {
      title: string;
      description: string;
      priority: 'Low' | 'Medium' | 'High' | 'Critical';
      category: string;
      office: 'NYC' | 'SF' | 'DC';
    }) => {
      const nextNumber = Math.max(...tickets.map((t) => parseInt(t.number.split('-')[1]))) + 1;
      const newTicket: Ticket = {
        id: `t-${Date.now()}`,
        number: `TKT-${String(nextNumber).padStart(4, '0')}`,
        title: data.title,
        description: data.description,
        status: 'Open',
        priority: data.priority,
        assignee: currentUser.displayName,
        requester: currentUser.email,
        office: data.office,
        category: data.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        activity: [],
      };
      setTickets((prev) => [newTicket, ...prev]);
      setShowCreateModal(false);
    },
    [tickets]
  );

  return (
    <div className="min-h-full flex flex-col" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom) + 16px)' }}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-4 pt-4 pb-2"
      >
        <div>
          <h1 className="font-heading font-bold text-h1 text-text-primary">Tickets</h1>
          <p className="font-mono text-sm text-text-secondary mt-0.5">
            {statusCounts['Open'] || 0} open tickets across 3 offices
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowSearch(!showSearch)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(18,18,26,0.72)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)] text-text-secondary hover:text-text-primary transition-colors"
          >
            <Search size={20} />
          </motion.button>
          {/* New ticket button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider text-white"
            style={{
              background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)',
              boxShadow: '0 4px 16px rgba(0,217,255,0.25)',
            }}
          >
            <Plus size={16} />
            New
          </motion.button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            className="overflow-hidden px-4 pb-2"
          >
            <SearchBar
              placeholder="Search by title, ID, requester, or tags..."
              value={searchQuery}
              onChange={setSearchQuery}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters + Sort */}
      <div className="px-4 py-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <TicketFilters
              activeStatus={activeStatus}
              onStatusChange={setActiveStatus}
              activePriority={activePriority}
              onPriorityChange={setActivePriority}
              statusCounts={statusCounts}
            />
          </div>
        </div>

        {/* Sort + results count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded-lg hover:bg-bg-surface"
            >
              <ArrowUpDown size={13} />
              {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Priority'}
            </button>
            <AnimatePresence>
              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-1 z-50 bg-bg-elevated border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[140px]"
                  >
                    {[
                      { value: 'newest' as SortOption, label: 'Newest first' },
                      { value: 'oldest' as SortOption, label: 'Oldest first' },
                      { value: 'priority' as SortOption, label: 'Priority (High → Low)' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setShowSortDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-bg-surface transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        <TicketList
          tickets={filteredTickets}
          currentUser={currentUser.displayName}
          onTicketClick={handleTicketClick}
          onCreateTicket={() => setShowCreateModal(true)}
          searchQuery={searchQuery}
        />
      </div>

      {/* Ticket Detail Modal */}
      <ModalSheet
        isOpen={selectedTicket !== null}
        onClose={handleCloseDetail}
        title=""
        className="max-h-[90vh]"
      >
        {selectedTicket && (
          <TicketDetail
            ticket={selectedTicket}
            currentUser={currentUser.displayName}
            onClose={handleCloseDetail}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
          />
        )}
      </ModalSheet>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}
