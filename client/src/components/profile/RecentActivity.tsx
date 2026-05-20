import { motion } from 'framer-motion';

export interface XpEvent {
  id: number;
  user_id: string;
  action_type: string;
  xp_amount: number;
  description: string;
  created_at: string;
}

interface RecentActivityProps {
  events: XpEvent[];
}

export const ACTION_TYPE_LABELS: Record<string, string> = {
  'ticket-created': 'Created Ticket',
  'ticket-resolved': 'Resolved Ticket',
  'kb-created': 'Wrote KB Article',
  'kb-updated': 'Updated KB Article',
  'comment-added': 'Added Comment',
  'laptop-shipped': 'Shipped Laptop',
};

export function getActionLabel(actionType: string): string {
  return ACTION_TYPE_LABELS[actionType] || actionType.replace(/-/g, ' ');
}

function timeAgoShort(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function RecentActivity({ events }: RecentActivityProps) {
  if (events.length === 0) {
    return (
      <div>
        <h3 className="text-xs font-mono uppercase tracking-[0.28em] text-text-secondary mb-3">Recent Activity</h3>
        <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(18,18,26,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm text-text-muted">No activity yet. Start working!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-mono uppercase tracking-[0.28em] text-text-secondary mb-3">Recent Activity</h3>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(18,18,26,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-h-[300px] overflow-y-auto">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.5 + i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0"
            >
              <span
                className="flex-shrink-0 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold"
                style={{
                  color: event.xp_amount >= 30 ? '#7dff9e' : event.xp_amount >= 10 ? '#ff4fd8' : '#00d9ff',
                  backgroundColor: event.xp_amount >= 30 ? 'rgba(125,255,158,0.1)' : event.xp_amount >= 10 ? 'rgba(255,79,216,0.1)' : 'rgba(0,217,255,0.1)',
                }}
              >
                +{event.xp_amount} XP
              </span>
              <span className="text-sm text-text-primary flex-1 truncate">
                {event.description}
              </span>
              <span className="text-xs text-text-muted flex-shrink-0">
                {timeAgoShort(event.created_at)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
