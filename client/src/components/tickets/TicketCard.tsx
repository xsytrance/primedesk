import { motion } from 'framer-motion';
import { MessageCircle, Paperclip } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import type { Ticket } from '@/data/mock';
import { timeAgo, getOfficeColor } from '@/data/mock';

interface TicketCardProps {
  ticket: Ticket;
  index: number;
  onClick: () => void;
}

const priorityColors: Record<string, string> = {
  Low: '#7a7a94',
  Medium: '#ffb347',
  High: '#ff4d6a',
  Critical: '#ff4d6a',
};

export default function TicketCard({ ticket, index, onClick }: TicketCardProps) {
  const officeColor = getOfficeColor(ticket.office);
  const priorityColor = priorityColors[ticket.priority] || '#7a7a94';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.06 + 0.1,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <GlassCard className="p-4 hover:-translate-y-[1px] hover:shadow-[0_0_20px_rgba(0,217,255,0.08)]">
        {/* Top row: code + priority + status + timestamp */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="font-mono text-xs tracking-wider"
            style={{ color: '#00d9ff' }}
          >
            #{ticket.number}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full border"
            style={{
              color: priorityColor,
              borderColor: `${priorityColor}40`,
              backgroundColor: `${priorityColor}15`,
            }}
          >
            {ticket.priority}
          </span>
          <StatusBadge status={ticket.status} />
          <span className="ml-auto text-xs text-text-secondary whitespace-nowrap">
            {timeAgo(ticket.createdAt)}
          </span>
        </div>

        {/* Middle: title + description preview */}
        <h3 className="text-body text-text-primary font-medium truncate mb-1">
          {ticket.title}
        </h3>
        <p className="text-sm text-text-secondary line-clamp-2 mb-3">
          {ticket.description}
        </p>

        {/* Bottom row: office badge + tags + meta */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Office badge */}
          <span className="inline-flex items-center gap-1 text-xs font-mono">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: officeColor }}
            />
            <span style={{ color: officeColor }}>{ticket.office}</span>
          </span>

          {/* Tags */}
          {ticket.category && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-bg-surface text-text-secondary">
              {ticket.category.toLowerCase()}
            </span>
          )}

          {/* Meta icons - right aligned */}
          <div className="ml-auto flex items-center gap-3 text-text-secondary">
            {/* Assignee */}
            <span className="flex items-center gap-1 text-xs">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: `linear-gradient(135deg, ${officeColor}30, ${officeColor}10)`,
                  border: `1.5px solid ${officeColor}60`,
                  color: officeColor,
                }}
              >
                {ticket.assignee === 'operator1' ? 'O1' : 'O2'}
              </span>
            </span>

            {/* Comment count */}
            {ticket.comments.length > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <MessageCircle size={14} />
                {ticket.comments.length}
              </span>
            )}

            {/* KB link indicator */}
            {ticket.activity && ticket.activity.length > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <Paperclip size={14} />
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
