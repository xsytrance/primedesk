import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Paperclip, Pencil, Trash2, ChevronDown, ChevronUp, Clock, User } from 'lucide-react';
import ModalSheet from '@/components/ModalSheet';
import Avatar from '@/components/Avatar';
import StatusBadge from '@/components/StatusBadge';
import { mockTickets, operator1, operator2, timeAgo } from '@/data/mock';
import type { KBArticle } from '@/data/mock';

interface VersionEntry {
  version: number;
  author: string;
  date: string;
  changes: string;
}

interface ArticleDetailProps {
  article: KBArticle | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ArticleDetail({ article, isOpen, onClose, onEdit, onDelete }: ArticleDetailProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!article) return null;

  const users = [operator1, operator2];
  const author = users.find((u) => u.username === article.author) || {
    initials: '??',
    color: '#7a7a94',
    office: 'NYC' as const,
  };
  const officeBorderColor = author.office === 'NYC' ? '#00d9ff' : author.office === 'SF' ? '#ff4fd8' : '#7dff9e';

  const linkedTicketObjs = mockTickets.filter((t) => article.linkedTickets.includes(t.number));

  // Mock version history
  const versions: VersionEntry[] = Array.from({ length: article.version }, (_, i) => ({
    version: article.version - i,
    author: article.author,
    date: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    changes: i === 0 ? 'Current version' : `Updated content and fixed formatting`,
  }));

  const renderBody = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent = '';
    let listItems: string[] = [];
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="my-3 space-y-1">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan mt-2 flex-shrink-0" />
                <span>{item.replace(/^[-*]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushCodeBlock = () => {
      if (codeContent) {
        elements.push(
          <pre
            key={`code-${elements.length}`}
            className="my-3 p-3 rounded-md bg-bg-base font-mono text-xs text-green overflow-x-auto"
          >
            <code>{codeContent.trim()}</code>
          </pre>
        );
        codeContent = '';
      }
    };

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        return;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        inList = true;
        listItems.push(line);
        return;
      } else if (inList && line.trim() === '') {
        flushList();
        return;
      } else if (inList) {
        flushList();
      }

      if (line.trim() === '') {
        elements.push(<div key={`br-${idx}`} className="h-2" />);
        return;
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-lg font-heading font-medium text-text-primary mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-xl font-heading font-medium text-text-primary mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-2xl font-heading font-bold text-text-primary mt-4 mb-2">
            {line.replace('# ', '')}
          </h1>
        );
        return;
      }

      // Inline code
      const processedLine = line.split(/(`[^`]+`)/).map((part, pi) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={pi} className="px-1.5 py-0.5 rounded bg-green/15 text-green text-xs font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        // Bold/italic
        let text = part;
        if (text.includes('**')) {
          const parts = text.split(/(\*\*[^*]+\*\*)/);
          return parts.map((p, ppi) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={ppi} className="font-semibold text-text-primary">{p.slice(2, -2)}</strong>;
            }
            return <span key={ppi}>{p}</span>;
          });
        }
        return <span key={pi}>{text}</span>;
      });

      elements.push(
        <p key={idx} className="text-[15px] text-text-secondary leading-relaxed">
          {processedLine}
        </p>
      );
    });

    flushList();
    flushCodeBlock();

    return <div className="py-2">{elements}</div>;
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan bg-cyan/10 hover:bg-cyan/20 transition-colors"
            >
              <Pencil size={12} />
              Edit
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary bg-bg-surface hover:text-text-primary transition-colors"
            >
              <GitBranch size={12} />
              History
              {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red bg-red/10 hover:bg-red/20 transition-colors"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-heading font-bold text-text-primary leading-tight">
          {article.title}
        </h1>

        {/* Tags */}
        <div className="flex items-center flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs bg-bg-surface text-text-secondary font-body"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Meta row */}
        <div className="flex items-center flex-wrap gap-4 text-sm text-text-secondary py-2 border-y border-[rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-2">
            <Avatar fallback={author.initials} size={28} borderColor={officeBorderColor} className="text-xs font-display font-bold" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch size={14} className="text-cyan" />
            <span className="font-mono text-cyan">v{article.version}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{timeAgo(article.updatedAt)}</span>
          </div>
        </div>

        {/* Version History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl bg-bg-surface p-3 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-text-muted">Version History</h4>
                {versions.map((v) => (
                  <div key={v.version} className="flex items-center gap-3 py-1.5 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                    <span className="font-mono text-xs text-cyan font-semibold">v{v.version}</span>
                    <User size={12} className="text-text-muted" />
                    <span className="text-xs text-text-secondary">{v.author}</span>
                    <span className="text-xs text-text-muted ml-auto">{timeAgo(v.date)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body */}
        <div className="max-h-[40vh] overflow-y-auto pr-1">
          {renderBody(article.content)}
        </div>

        {/* Linked Tickets */}
        {linkedTicketObjs.length > 0 && (
          <div className="pt-2 border-t border-[rgba(255,255,255,0.04)]">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip size={16} className="text-text-muted" />
              <h4 className="text-sm font-medium text-text-secondary">Linked Tickets</h4>
            </div>
            <div className="space-y-2">
              {linkedTicketObjs.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-surface/50 cursor-pointer hover:bg-bg-surface transition-colors"
                >
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs font-mono text-cyan">{ticket.number}</span>
                  <span className="text-sm text-text-primary truncate">{ticket.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[110] flex items-center justify-center px-4"
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
              <div className="relative bg-bg-elevated rounded-xl p-5 w-full max-w-sm border border-[rgba(255,255,255,0.06)] space-y-4">
                <h3 className="font-heading font-medium text-text-primary text-lg">Delete Article?</h3>
                <p className="text-sm text-text-secondary">
                  Delete &ldquo;{article.title}&rdquo;? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary bg-bg-surface hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onDelete(); setShowDeleteConfirm(false); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-red hover:bg-red/80 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModalSheet>
  );
}
