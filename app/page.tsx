'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Orbit, Lock } from 'lucide-react';
import AISearch from '@/components/AISearch';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handlePremium = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch {
      alert('Error starting checkout');
    }
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-warm/5 rounded-full blur-3xl float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orbit border border-white/10 text-sm mb-6">
            <Orbit className="w-4 h-4 text-accent" />
            <span>2026 Career Orbit</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight mb-4">
            Pivot before
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-warm">
              the orbit collapses
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            AI is rewriting jobs. Get precise, actionable paths to human-edge skills, transitions, and purpose — not generic advice.
          </p>
        </motion.header>

        <AISearch />

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 grid md:grid-cols-3 gap-6"
        >
          {[
            { title: 'Skill Orbit Map', desc: 'Identify which of your skills amplify with AI vs. which get automated.' },
            { title: '90-Day Pivot', desc: 'Concrete weekly actions drawn from real transition playbooks.' },
            { title: 'Purpose Rebuild', desc: 'Rebuild meaning when role identity shifts — practical, not motivational.' },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-orbit/80 border border-white/5 hover:border-accent/30 transition-all">
              <h3 className="font-display text-xl mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </motion.section>

        <div className="mt-16 text-center">
          <button
            onClick={handlePremium}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-void font-medium hover:bg-accent/90 transition disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Opening...' : 'Unlock personalized roadmap — $4.50/mo'}
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Premium: unlimited deep plans, saved history, export.
          </p>
        </div>
      </div>
    </main>
  );
}
