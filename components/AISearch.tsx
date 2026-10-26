'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2 } from 'lucide-react';

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setAnswer(data.answer || data.error || 'No answer');
    } catch {
      setAnswer('Request failed. Check API keys.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative orbit-glow rounded-2xl bg-orbit border border-white/10 overflow-hidden">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about pivoting careers, AI skills, 2026 job changes..."
            className="w-full bg-transparent px-6 py-5 text-base resize-none focus:outline-none placeholder:text-gray-500 min-h-[100px]"
            rows={3}
          />
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live web search + memory
            </span>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-void text-sm font-medium disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Ask
            </button>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {answer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-6 rounded-2xl bg-orbit/60 border border-accent/20 text-sm leading-relaxed whitespace-pre-wrap"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
