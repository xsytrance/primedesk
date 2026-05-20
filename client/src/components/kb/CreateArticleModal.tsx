import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FilePlus } from 'lucide-react';
import ModalSheet from '@/components/ModalSheet';

const CATEGORY_OPTIONS = ['Hardware', 'Network', 'Software', 'Procedures', 'Security', 'Infrastructure', 'Process', 'Troubleshooting'];

interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (article: { title: string; category: string; body: string; tags: string[] }) => void;
  editArticle?: { title: string; category: string; content: string; tags: string[] } | null;
}

export default function CreateArticleModal({ isOpen, onClose, onSubmit, editArticle }: CreateArticleModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (editArticle) {
      setTitle(editArticle.title);
      setCategory(editArticle.category);
      setBody(editArticle.content);
      setTags(editArticle.tags);
    } else {
      setTitle('');
      setCategory('Hardware');
      setBody('');
      setTags([]);
    }
  }, [editArticle, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSubmit({ title: title.trim(), category, body: body.trim(), tags });
    setTitle('');
    setCategory('Hardware');
    setBody('');
    setTags([]);
    setTagInput('');
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title={editArticle ? 'Edit Article' : 'New Article'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title..."
            className="w-full px-4 py-3 rounded-lg bg-[#151520] border border-[rgba(255,255,255,0.06)] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan/50 focus:shadow-[0_0_0_3px_var(--cyan-dim)] transition-all"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5 font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#151520] border border-[rgba(255,255,255,0.06)] text-sm text-text-primary focus:outline-none focus:border-cyan/50 focus:shadow-[0_0_0_3px_var(--cyan-dim)] transition-all appearance-none"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5 font-medium">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span key={tag} className="px-2 py-1 rounded-md text-xs bg-cyan-dim text-cyan flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-cyan/60 hover:text-cyan">x</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tag..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#151520] border border-[rgba(255,255,255,0.06)] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan/50 focus:shadow-[0_0_0_3px_var(--cyan-dim)] transition-all"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 rounded-lg bg-bg-surface text-text-secondary text-sm hover:text-text-primary transition-colors"
            >
              Add
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5 font-medium">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the article content... Supports basic formatting."
            rows={6}
            className="w-full px-4 py-3 rounded-lg bg-[#151520] border border-[rgba(255,255,255,0.06)] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan/50 focus:shadow-[0_0_0_3px_var(--cyan-dim)] transition-all resize-none"
          />
        </div>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={!title.trim() || !body.trim()}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #00d9ff, #ff4fd8)' }}
        >
          <FilePlus size={16} />
          {editArticle ? 'Save Changes' : 'Publish Article'}
        </motion.button>
      </form>
    </ModalSheet>
  );
}
