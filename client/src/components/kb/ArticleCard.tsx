import { motion } from 'framer-motion';
import { GitBranch, Paperclip } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Avatar from '@/components/Avatar';
import type { KBArticle, User } from '@/data/mock';
import { operator1, operator2, timeAgo } from '@/data/mock';

interface ArticleCardProps {
  article: KBArticle;
  index: number;
  onClick: () => void;
}

export default function ArticleCard({ article, index, onClick }: ArticleCardProps) {
  const users: User[] = [operator1, operator2];
  const author = users.find((u: User) => u.username === article.author) || {
    initials: '??',
    color: '#7a7a94',
    office: 'NYC' as const,
  };

  const officeBorderColor = author.office === 'NYC' ? '#00d9ff' : author.office === 'SF' ? '#ff4fd8' : '#7dff9e';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
    >
      <GlassCard className="p-4 cursor-pointer" onClick={onClick}>
        <h3 className="text-[15px] font-medium text-text-primary font-heading leading-snug line-clamp-1">
          {article.title}
        </h3>
        <p className="text-sm text-text-secondary mt-1 line-clamp-2 leading-relaxed">
          {article.content}
        </p>
        <div className="flex items-center flex-wrap gap-2 mt-3">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-[2px] rounded-full text-xs bg-bg-surface text-text-secondary font-body"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <GitBranch size={12} className="text-cyan" />
            <span className="font-mono text-cyan">v{article.version}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Avatar
              fallback={author.initials}
              size={20}
              borderColor={officeBorderColor}
              className="text-[10px] font-display font-bold"
            />
            <span className="text-xs text-text-secondary">{article.author}</span>
          </div>
          {article.linkedTickets.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-text-secondary ml-auto">
              <Paperclip size={12} />
              <span>{article.linkedTickets.length} ticket{article.linkedTickets.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          <span className="text-xs text-text-muted ml-auto">
            {timeAgo(article.updatedAt)}
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
