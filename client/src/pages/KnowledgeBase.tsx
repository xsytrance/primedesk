import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FilePlus } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import GlassCard from '@/components/GlassCard';
import ArticleCard from '@/components/kb/ArticleCard';
import ArticleDetail from '@/components/kb/ArticleDetail';
import ArticleFilters, { CATEGORIES } from '@/components/kb/ArticleFilters';
import CreateArticleModal from '@/components/kb/CreateArticleModal';
import { mockKBArticles, timeAgo } from '@/data/mock';
import type { KBArticle } from '@/data/mock';

// Generate additional mock articles for a richer list
const additionalArticles: KBArticle[] = [
  {
    id: 'kb6', title: 'How to Configure VPN on macOS Sonoma',
    content: 'A complete guide for setting up corporate VPN on M1/M2/M3 MacBooks.\n\n## Prerequisites\n- Admin access to your Mac\n- VPN credentials from IT\n- Corporate CA certificate\n\n## Steps\n1. Open System Settings > VPN\n2. Add a new VPN configuration\n3. Enter server address: `vpn.company.com`\n4. Select certificate-based auth\n5. Import the CA cert\n6. Test connection\n\n## Troubleshooting\nIf you see **Certificate Invalid**, try renewing your device cert.',
    category: 'Network', author: 'operator1', linkedTickets: ['TKT-0042'], version: 3,
    updatedAt: '2024-01-15T10:00:00Z', tags: ['vpn', 'macos', 'network', 'sonoma'],
  },
  {
    id: 'kb7', title: 'Email Setup Guide for Outlook Mobile',
    content: 'Step-by-step guide for configuring corporate email on iOS and Android devices.\n\n## iOS\n- Download Outlook from App Store\n- Sign in with `user@company.com`\n- Enable push notifications\n\n## Android\n- Download Outlook from Play Store\n- Use Microsoft Authenticator for SSO\n\n## Common Issues\n- Sync delays: Check background app refresh\n- Auth errors: Re-register device in Intune',
    category: 'Software', author: 'operator2', linkedTickets: ['TKT-0038'], version: 2,
    updatedAt: '2024-01-14T08:00:00Z', tags: ['email', 'outlook', 'mobile'],
  },
  {
    id: 'kb8', title: 'Printer Network Configuration',
    content: 'Network printer setup and troubleshooting for all offices.\n\n## Adding a Printer\n1. Find printer IP via DHCP table\n2. Add via IPP protocol\n3. Install correct driver\n4. Set default preferences\n\n## Common Problems\n- Print jobs stuck: Restart print spooler\n- Offline status: Check network cable\n- Bad quality: Run calibration cycle',
    category: 'Hardware', author: 'operator2', linkedTickets: ['TKT-0040'], version: 4,
    updatedAt: '2024-01-13T14:00:00Z', tags: ['printer', 'network', 'hardware'],
  },
  {
    id: 'kb9', title: 'Active Directory User Provisioning',
    content: 'Step-by-step guide for creating new AD accounts and granting access.\n\n## Process\n1. Receive HR ticket with user details\n2. Create AD account via PowerShell script\n3. Add to appropriate OU and groups\n4. Assign Office 365 license\n5. Create mailbox\n6. Notify manager\n\n## PowerShell\n```\nNew-ADUser -Name $Name -SamAccountName $Sam -Path $OU\nAdd-ADGroupMember -Identity $Group -Members $Sam\n```',
    category: 'Procedures', author: 'operator1', linkedTickets: ['TKT-0036'], version: 5,
    updatedAt: '2024-01-12T09:00:00Z', tags: ['active-directory', 'provisioning', 'powershell'],
  },
  {
    id: 'kb10', title: 'Firewall Rule Request Process',
    content: 'How to request, review, and implement new firewall rules across all offices.\n\n## Request\n- Submit ticket with Security category\n- Include: source, destination, port, protocol, justification\n\n## Review\n- Security team reviews within 48h\n- Risk assessment performed\n- Approval from network lead required\n\n## Implementation\n- Changes made during maintenance window\n- Backup config before changes\n- Test connectivity after',
    category: 'Security', author: 'operator1', linkedTickets: ['TKT-0033'], version: 2,
    updatedAt: '2024-01-11T11:00:00Z', tags: ['firewall', 'security', 'network'],
  },
  {
    id: 'kb11', title: 'WiFi Troubleshooting for Office Guests',
    content: 'Guide for setting up and troubleshooting guest WiFi access.\n\n## Guest Network\n- SSID: `Company-Guest`\n- Password rotates weekly\n- Bandwidth limited to 10Mbps\n\n## Issues\n- Cannot connect: Check MAC filtering\n- Slow speeds: May be throttled\n- Expired password: Check KB for current week',
    category: 'Troubleshooting', author: 'operator2', linkedTickets: [], version: 1,
    updatedAt: '2024-01-09T16:00:00Z', tags: ['wifi', 'guest', 'troubleshooting'],
  },
  {
    id: 'kb12', title: 'UPS Battery Replacement Procedure',
    content: 'Standard procedure for replacing UPS batteries in server rooms.\n\n## Safety\n- Wear insulated gloves\n- Have backup power ready\n- Notify facilities before starting\n\n## Steps\n1. Put UPS in bypass mode\n2. Disconnect battery pack\n3. Remove old batteries\n4. Install new batteries\n5. Reconnect and test\n6. Exit bypass mode\n\n## Verification\n- Check battery health in management console\n- Run self-test\n- Document replacement date',
    category: 'Hardware', author: 'operator1', linkedTickets: ['TKT-0032'], version: 3,
    updatedAt: '2024-01-07T10:00:00Z', tags: ['ups', 'battery', 'hardware', 'server-room'],
  },
  {
    id: 'kb13', title: 'GitLab Runner Migration to Kubernetes',
    content: 'Migrating legacy GitLab runners to our Kubernetes cluster.\n\n## Prerequisites\n- kubectl access to cluster\n- Helm 3 installed\n- GitLab admin access\n\n## Migration Steps\n1. Backup existing runner configs\n2. Create new runner pods via Helm\n3. Register runners with GitLab\n4. Update CI/CD pipelines\n5. Test builds\n6. Decommission old runners\n\n## Helm Values\n```\nrunners:\n  privileged: true\n  tags: \"k8s,docker\"\n```',
    category: 'Infrastructure', author: 'operator1', linkedTickets: ['TKT-0031'], version: 2,
    updatedAt: '2024-01-06T14:00:00Z', tags: ['gitlab', 'kubernetes', 'infrastructure', 'ci-cd'],
  },
];

const allArticles: KBArticle[] = [...mockKBArticles, ...additionalArticles];

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<KBArticle[]>(allArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editArticle, setEditArticle] = useState<KBArticle | null>(null);

  // Category counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: articles.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== 'All') c[cat] = articles.filter((a) => a.category === cat).length;
    });
    return c;
  }, [articles]);

  // Filter and search
  const filteredArticles = useMemo(() => {
    let result = articles;

    if (activeCategory !== 'All') {
      result = result.filter((a) => a.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [articles, activeCategory, searchQuery]);

  // Featured = most linked article
  const featured = useMemo(() => {
    return [...articles].sort((a, b) => b.linkedTickets.length - a.linkedTickets.length)[0];
  }, [articles]);

  // Recently updated (not featured)
  const recentlyUpdated = useMemo(() => {
    return [...articles]
      .filter((a) => a.id !== featured?.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4);
  }, [articles, featured]);

  const handleCreate = useCallback(
    (data: { title: string; category: string; body: string; tags: string[] }) => {
      const newArticle: KBArticle = {
        id: `kb-${Date.now()}`,
        title: data.title,
        content: data.body,
        category: data.category,
        author: 'operator1',
        linkedTickets: [],
        version: 1,
        updatedAt: new Date().toISOString(),
        tags: data.tags,
      };
      setArticles((prev) => [newArticle, ...prev]);
    },
    []
  );

  const handleDelete = useCallback(() => {
    if (!selectedArticle) return;
    setArticles((prev) => prev.filter((a) => a.id !== selectedArticle.id));
    setSelectedArticle(null);
  }, [selectedArticle]);

  const openEdit = useCallback(() => {
    if (!selectedArticle) return;
    setEditArticle(selectedArticle);
    setSelectedArticle(null);
    setShowCreate(true);
  }, [selectedArticle]);

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between py-2"
      >
        <div>
          <h1 className="font-heading font-bold text-h1 text-text-primary">Knowledge Base</h1>
          <p className="text-sm text-text-secondary font-mono mt-1">
            Shared institutional memory &mdash; {articles.length} articles
          </p>
        </div>
        <button
          onClick={() => {
            setEditArticle(null);
            setShowCreate(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)' }}
        >
          <FilePlus size={16} />
          <span className="hidden sm:inline">Article</span>
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <SearchBar
          placeholder="Search articles, tags, procedures..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </motion.div>

      {/* Category Filters */}
      <ArticleFilters active={activeCategory} onChange={setActiveCategory} counts={counts} />

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <BookOpen size={48} className="text-text-muted mb-4" />
          <h2 className="text-h3 font-heading text-text-secondary mb-2">
            {searchQuery ? `No articles found for "${searchQuery}"` : 'No articles yet'}
          </h2>
          <p className="text-sm text-text-muted max-w-sm">
            {searchQuery
              ? 'Try a different search term or create a new article.'
              : 'Create the first article to build your knowledge base.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                setEditArticle(null);
                setShowCreate(true);
              }}
              className="mt-4 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)' }}
            >
              + Create Article
            </button>
          )}
        </motion.div>
      )}

      {/* Content */}
      {filteredArticles.length > 0 && (
        <>
          {/* Featured Article (only when not searching/filtering) */}
          {featured && activeCategory === 'All' && !searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan">Featured</span>
              </div>
              <GlassCard
                gradientBorder
                topGlow="#00d9ff"
                className="cursor-pointer"
                onClick={() => setSelectedArticle(featured)}
              >
                <div className="p-5">
                  <h2 className="text-h2 font-heading font-medium text-text-primary leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                    {featured.content.substring(0, 200)}
                  </p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {featured.tags.map((tag) => (
                      <span key={tag} className="px-2 py-[2px] rounded-full text-xs bg-bg-surface text-text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
                    <span>by {featured.author}</span>
                    <span>{featured.linkedTickets.length} linked tickets</span>
                    <span>{timeAgo(featured.updatedAt)}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Recently Updated (only when not searching/filtering) */}
          {recentlyUpdated.length > 0 && activeCategory === 'All' && !searchQuery && (
            <div className="py-2">
              <h3 className="text-xs font-mono uppercase tracking-[0.28em] text-text-secondary mb-3">
                Recently Updated
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentlyUpdated.map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                  >
                    <GlassCard
                      className="p-4 cursor-pointer h-full"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <h4 className="text-sm font-medium text-text-primary line-clamp-1">
                        {article.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        {timeAgo(article.updatedAt)}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-[1px] rounded-full text-[11px] bg-bg-surface text-text-secondary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All Articles */}
          <div className="py-2">
            {(activeCategory !== 'All' || searchQuery) && (
              <h3 className="text-xs font-mono uppercase tracking-[0.28em] text-text-secondary mb-3">
                {searchQuery ? `Results (${filteredArticles.length})` : `${activeCategory} Articles`}
              </h3>
            )}
            {!searchQuery && activeCategory === 'All' && (
              <h3 className="text-xs font-mono uppercase tracking-[0.28em] text-text-secondary mb-3">
                All Articles
              </h3>
            )}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredArticles.map((article, i) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    index={i}
                    onClick={() => setSelectedArticle(article)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      {/* Floating Action Button (mobile only) */}
      <button
        onClick={() => {
          setEditArticle(null);
          setShowCreate(true);
        }}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-glow-cyan md:hidden"
        style={{ background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)' }}
      >
        <FilePlus size={24} />
      </button>

      {/* Article Detail Modal */}
      <ArticleDetail
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Modal */}
      <CreateArticleModal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          setEditArticle(null);
        }}
        onSubmit={(data) => {
          if (editArticle) {
            // Apply edit directly
            setArticles((prev) =>
              prev.map((a) =>
                a.id === editArticle.id
                  ? {
                      ...a,
                      title: data.title,
                      content: data.body,
                      category: data.category,
                      tags: data.tags,
                      version: a.version + 1,
                      updatedAt: new Date().toISOString(),
                    }
                  : a
              )
            );
            setEditArticle(null);
            setShowCreate(false);
          } else {
            handleCreate(data);
          }
        }}
        editArticle={editArticle}
      />
    </div>
  );
}
