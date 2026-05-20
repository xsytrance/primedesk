import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { currentUser, mockTickets, mockKBArticles, mockChatMessages } from '@/data/mock';
import type { User } from '@/data/mock';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StatsGrid from '@/components/profile/StatsGrid';
import XPProgress from '@/components/profile/XPProgress';
import RecentActivity, { type XpEvent } from '@/components/profile/RecentActivity';
import ProfileActions from '@/components/profile/ProfileActions';

// Generate XP events from mock data
function generateMockXpEvents(user: User): XpEvent[] {
  const now = new Date();
  const events: XpEvent[] = [];
  let id = 1;

  // Tickets created by this user
  const userTickets = mockTickets.filter((t) => t.assignee === user.username);
  userTickets.forEach((ticket, i) => {
    events.push({
      id: id++,
      user_id: user.id,
      action_type: 'ticket-created',
      xp_amount: 5,
      description: `Created ticket #${ticket.number}`,
      created_at: new Date(now.getTime() - (i + 1) * 3600000 * 2).toISOString(),
    });
  });

  // KB articles by this user
  const userKbs = mockKBArticles.filter((kb) => kb.author === user.username);
  userKbs.forEach((kb, i) => {
    events.push({
      id: id++,
      user_id: user.id,
      action_type: 'kb-created',
      xp_amount: 30,
      description: `Wrote KB "${kb.title}"`,
      created_at: new Date(now.getTime() - (i + 1) * 86400000).toISOString(),
    });
    if (kb.version > 1) {
      events.push({
        id: id++,
        user_id: user.id,
        action_type: 'kb-updated',
        xp_amount: 10,
        description: `Updated KB "${kb.title}"`,
        created_at: new Date(now.getTime() - (i + 1) * 43200000).toISOString(),
      });
    }
  });

  // Comments (approximate)
  const commentsByUser: XpEvent[] = [];
  mockTickets.forEach((ticket) => {
    ticket.comments.forEach((comment) => {
      if (comment.author === user.username) {
        commentsByUser.push({
          id: id++,
          user_id: user.id,
          action_type: 'comment-added',
          xp_amount: 2,
          description: `Commented on #${ticket.number}`,
          created_at: comment.createdAt,
        });
      }
    });
  });
  events.push(...commentsByUser);

  // Resolved tickets
  const resolvedTickets = mockTickets.filter((t) => t.assignee === user.username && t.status === 'Resolved');
  resolvedTickets.forEach((ticket, i) => {
    events.push({
      id: id++,
      user_id: user.id,
      action_type: 'ticket-resolved',
      xp_amount: 15,
      description: `Resolved ticket #${ticket.number}`,
      created_at: new Date(now.getTime() - (i + 1) * 86400000 * 2).toISOString(),
    });
  });

  // Sort by date descending
  return events
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20);
}

export default function Profile() {
  const user = currentUser;

  // Compute stats from mock data
  const stats = useMemo(() => {
    const ticketsCreated = mockTickets.filter((t) => t.assignee === user.username).length;
    const ticketsResolved = mockTickets.filter(
      (t) => t.assignee === user.username && (t.status === 'Resolved' || t.status === 'Closed')
    ).length;
    const kbArticles = mockKBArticles.filter((kb) => kb.author === user.username).length;
    const messagesSent = mockChatMessages.filter((m) => m.author === user.username).length;
    return { ticketsCreated, ticketsResolved, kbArticles, messagesSent };
  }, [user.username]);

  // Generate XP events
  const xpEvents = useMemo(() => generateMockXpEvents(user), [user]);

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="py-2"
      >
        <h1 className="font-heading font-bold text-h1 text-text-primary">Profile</h1>
      </motion.div>

      {/* Profile Hero Card */}
      <ProfileHeader user={user} />

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <StatsGrid
          ticketsCreated={stats.ticketsCreated}
          ticketsResolved={stats.ticketsResolved}
          kbArticles={stats.kbArticles}
          messagesSent={stats.messagesSent}
        />
      </motion.div>

      {/* XP Progression */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <XPProgress currentXp={user.xp} />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        <RecentActivity events={xpEvents} />
      </motion.div>

      {/* Profile Actions / Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.55 }}
      >
        <ProfileActions />
      </motion.div>
    </div>
  );
}
