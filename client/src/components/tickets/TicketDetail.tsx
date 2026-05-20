import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  User,
  Building2,
  Calendar,
  MessageCircle,
  Activity,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import type { Ticket } from '@/data/mock';
import { timeAgo, getOfficeColor } from '@/data/mock';

interface TicketDetailProps {
  ticket: Ticket;
  currentUser: string;
  onClose: () => void;
  onStatusChange: (ticketId: string, newStatus: string) => void;
  onAddComment: (ticketId: string, text: string) => void;
}

const statusOptions = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];

export default function TicketDetail({
  ticket,
  onClose,
  onStatusChange,
  onAddComment,
}: TicketDetailProps) {
  const [commentText, setCommentText] = useState('');
  const [showActivity, setShowActivity] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const officeColor = getOfficeColor(ticket.office);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket.comments.length]);

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(ticket.id, commentText.trim());
    setCommentText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header: ticket code + close */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <span
            className="font-mono text-xs tracking-wider"
            style={{ color: '#00d9ff' }}
          >
            #{ticket.number}
          </span>
          <h2 className="font-heading font-medium text-h2 text-text-primary mt-1 leading-tight">
            {ticket.title}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Requester: {ticket.requester}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors ml-2 flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {/* Office badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border"
          style={{
            borderColor: `${officeColor}40`,
            color: officeColor,
            backgroundColor: `${officeColor}15`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: officeColor }}
          />
          {ticket.office}
        </span>
        {ticket.category && (
          <span className="px-2.5 py-1 rounded-full text-xs bg-bg-surface text-text-secondary border border-white/5">
            {ticket.category.toLowerCase()}
          </span>
        )}
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full border"
          style={{
            color: ticket.priority === 'High' || ticket.priority === 'Critical' ? '#ff4d6a' : ticket.priority === 'Medium' ? '#ffb347' : '#7a7a94',
            borderColor: ticket.priority === 'High' || ticket.priority === 'Critical' ? 'rgba(255,77,106,0.4)' : ticket.priority === 'Medium' ? 'rgba(255,179,71,0.4)' : 'rgba(122,122,148,0.4)',
            backgroundColor: ticket.priority === 'High' || ticket.priority === 'Critical' ? 'rgba(255,77,106,0.1)' : ticket.priority === 'Medium' ? 'rgba(255,179,71,0.1)' : 'rgba(122,122,148,0.1)',
          }}
        >
          {ticket.priority} Priority
        </span>
      </div>

      {/* Status + Assignee row */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-surface border border-white/5 text-sm hover:border-cyan/30 transition-colors"
          >
            <StatusBadge status={ticket.status} />
            <ChevronDown size={14} className="text-text-muted" />
          </button>
          <AnimatePresence>
            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 z-50 bg-bg-elevated border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[160px]"
                >
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        onStatusChange(ticket.id, s);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-surface transition-colors"
                    >
                      <StatusBadge status={s} />
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Assignee */}
        <span className="flex items-center gap-1.5 text-xs text-text-secondary">
          <User size={14} />
          Assigned to <span className="text-text-primary font-medium">{ticket.assignee}</span>
        </span>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-4 flex-wrap mb-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Clock size={13} />
          Updated {timeAgo(ticket.updatedAt)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={13} />
          Created {timeAgo(ticket.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <Building2 size={13} />
          {ticket.office} office
        </span>
      </div>

      {/* Description */}
      <div className="mb-5">
        <h4 className="font-mono text-[11px] uppercase tracking-[0.28em] text-text-secondary mb-2">
          Description
        </h4>
        <div className="bg-bg-surface rounded-xl p-4 text-body text-text-primary leading-relaxed">
          {ticket.description}
        </div>
      </div>

      {/* Comments */}
      <div className="mb-4 flex-1">
        <h4 className="font-mono text-[11px] uppercase tracking-[0.28em] text-text-secondary mb-3 flex items-center gap-2">
          <MessageCircle size={14} />
          Comments ({ticket.comments.length})
        </h4>

        {ticket.comments.length === 0 ? (
          <p className="text-sm text-text-muted italic py-4">No comments yet. Be the first to add one.</p>
        ) : (
          <div className="space-y-3 mb-4">
            <AnimatePresence>
              {ticket.comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-3"
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${officeColor}30, ${officeColor}10)`,
                      border: `1.5px solid ${officeColor}60`,
                      color: officeColor,
                    }}
                  >
                    {comment.author === 'operator1' ? 'O1' : 'O2'}
                  </div>
                  {/* Comment body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-text-secondary">
                        {comment.author}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={commentsEndRef} />
          </div>
        )}

        {/* Comment input */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-bg-input border border-white/5 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-cyan/50 focus:shadow-[0_0_0_3px_var(--cyan-dim)] transition-all"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSubmitComment}
            disabled={!commentText.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: commentText.trim()
                ? 'linear-gradient(135deg, #00d9ff, #ff4fd8)'
                : 'var(--bg-surface)',
              color: commentText.trim() ? '#fff' : 'var(--text-muted)',
            }}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>

      {/* Activity log */}
      <div className="mb-4">
        <button
          onClick={() => setShowActivity(!showActivity)}
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-text-secondary hover:text-text-primary transition-colors mb-2"
        >
          <Activity size={14} />
          Activity Log
          {showActivity ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>
          {showActivity && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 py-2">
                {/* Synthetic activity entries */}
                <div className="flex items-start gap-2 text-xs text-text-secondary">
                  <Clock size={13} className="mt-0.5 flex-shrink-0 text-text-muted" />
                  <div>
                    <span className="font-mono text-text-muted">{timeAgo(ticket.createdAt)}</span>
                    {' — '}
                    <span className="text-text-primary">{ticket.assignee}</span> created ticket #{ticket.number}
                  </div>
                </div>
                {ticket.status !== 'Open' && (
                  <div className="flex items-start gap-2 text-xs text-text-secondary">
                    <Clock size={13} className="mt-0.5 flex-shrink-0 text-text-muted" />
                    <div>
                      <span className="font-mono text-text-muted">{timeAgo(ticket.updatedAt)}</span>
                      {' — '}
                      <span className="text-text-primary">{ticket.assignee}</span> changed status to {ticket.status}
                    </div>
                  </div>
                )}
                {ticket.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2 text-xs text-text-secondary">
                    <Clock size={13} className="mt-0.5 flex-shrink-0 text-text-muted" />
                    <div>
                      <span className="font-mono text-text-muted">{timeAgo(c.createdAt)}</span>
                      {' — '}
                      <span className="text-text-primary">{c.author}</span> added a comment
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
