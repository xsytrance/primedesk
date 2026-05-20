import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import TicketCard from './TicketCard';
import type { Ticket } from '@/data/mock';

interface TicketListProps {
  tickets: Ticket[];
  currentUser: string;
  onTicketClick: (ticket: Ticket) => void;
  onCreateTicket: () => void;
  searchQuery: string;
}

export default function TicketList({
  tickets,
  onTicketClick,
  onCreateTicket,
  searchQuery,
}: TicketListProps) {
  const [swipedTicketId, setSwipedTicketId] = useState<string | null>(null);

  const handleTouchStart = (ticketId: string) => {
    setSwipedTicketId(swipedTicketId === ticketId ? null : ticketId);
  };

  if (tickets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <img
          src="/empty-tickets.svg"
          alt="No tickets"
          className="w-48 h-36 mb-6 opacity-60"
        />
        <h3 className="font-heading font-medium text-h3 text-text-secondary mb-2">
          {searchQuery ? `No tickets match "${searchQuery}"` : 'No tickets found'}
        </h3>
        <p className="text-sm text-text-muted mb-6">
          {searchQuery
            ? 'Try adjusting your search or filters'
            : 'Create your first ticket to get started'}
        </p>
        {!searchQuery && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onCreateTicket}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider text-white"
            style={{
              background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)',
              boxShadow: '0 4px 16px rgba(0,217,255,0.25)',
            }}
          >
            <Plus size={16} />
            Create Ticket
          </motion.button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {tickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
            }}
            onTouchStart={() => handleTouchStart(ticket.id)}
            className="relative"
          >
            <TicketCard
              ticket={ticket}
              index={index}
              onClick={() => onTicketClick(ticket)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
