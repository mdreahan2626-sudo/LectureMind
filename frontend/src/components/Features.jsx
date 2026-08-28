import React from 'react';
import { Terminal, GitBranch, KeyRound, HelpCircle, Brain } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-24 relative z-10 bg-paper border-t border-rule">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8">
        
        {/* Asymmetrical Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column - Sticky Intro */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-soft text-violet text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-violet"></span>
              The Socratic Method
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-charcoal leading-tight tracking-tight">
              Stop reading summaries. <br />
              <span className="italic text-coral font-serif">Synthesize what you learn.</span>
            </h2>
            
            <p className="text-sm text-charcoal-soft leading-relaxed">
              Most study assistants act as passive dictation engines. They summarize a 2-hour lecture into dense bullet points you glance at once and quickly forget.
            </p>
            
            <p className="text-sm text-charcoal-soft leading-relaxed">
              LectureMind constructs a structured knowledge graph of your course materials and engages you with targeted inquiries, prompting you to actively recall details and link raw facts into enduring mental models.
            </p>

            <div className="pt-4 border-t border-rule">
              <div className="text-xs text-charcoal-soft font-mono flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-violet" />
                <span>active_synthesis_engine v2.0</span>
              </div>
            </div>
          </div>

          {/* Right Column - 4 Ink Capability Blocks */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Block 1: Violet (Ingestion) */}
            <div className="bg-card border border-card-border p-6 rounded-md shadow-soft hover:shadow-hover transition-all metric-stripe-violet">
              <div className="text-xs font-bold text-violet mb-2 flex items-center gap-1.5 font-mono">
                <KeyRound className="w-3.5 h-3.5" />
                01 · Multi-Format Ingestion
              </div>
              <h3 className="text-base font-bold font-display text-charcoal mb-1.5">
                Hierarchical Knowledge Structuring
              </h3>
              <p className="text-xs text-charcoal-soft leading-relaxed">
                Ingest textbook PDFs, lecture audio recordings, seminar videos, or typed notes. Our parser extracts concept taxonomy, definitions, and prerequisite chains rather than simple keyword lists.
              </p>
            </div>

            {/* Block 2: Coral (Socratic Inquiry) */}
            <div className="bg-card border border-card-border p-6 rounded-md shadow-soft hover:shadow-hover transition-all metric-stripe-coral">
              <div className="text-xs font-bold text-coral mb-2 flex items-center gap-1.5 font-mono">
                <HelpCircle className="w-3.5 h-3.5" />
                02 · Socratic Diagnostic Inquiry
              </div>
              <h3 className="text-base font-bold font-display text-charcoal mb-1.5">
                Adaptive Dialogue That Probes Weak Spots
              </h3>
              <p className="text-xs text-charcoal-soft leading-relaxed">
                An active voice and text tutor that behaves like an encouraging instructor. It asks you to explain concepts in your own words, catches logical gaps, and guides you with gentle hints.
              </p>
            </div>

            {/* Block 3: Teal (Concept Maps) */}
            <div className="bg-card border border-card-border p-6 rounded-md shadow-soft hover:shadow-hover transition-all metric-stripe-teal">
              <div className="text-xs font-bold text-teal mb-2 flex items-center gap-1.5 font-mono">
                <GitBranch className="w-3.5 h-3.5" />
                03 · Visual Association Maps
              </div>
              <h3 className="text-base font-bold font-display text-charcoal mb-1.5">
                Interactive Concept Graphs
              </h3>
              <p className="text-xs text-charcoal-soft leading-relaxed">
                Ideas don't exist in isolation. Our visual network links related flashcards, lecture timestamps, and chapters so you understand how changing one premise impacts downstream theories.
              </p>
            </div>

            {/* Block 4: Gold (Spaced Repetition) */}
            <div className="bg-card border border-card-border p-6 rounded-md shadow-soft hover:shadow-hover transition-all metric-stripe-gold">
              <div className="text-xs font-bold text-[#9A7412] mb-2 flex items-center gap-1.5 font-mono">
                <Brain className="w-3.5 h-3.5" />
                04 · SM-2 Spaced Repetition
              </div>
              <h3 className="text-base font-bold font-display text-charcoal mb-1.5">
                Active Recall Timed for Long-Term Memory
              </h3>
              <p className="text-xs text-charcoal-soft leading-relaxed">
                Generates cloze deletions and concept flashcards automatically. The SuperMemo SM-2 algorithm schedules reviews right before your brain forgets, locking knowledge into permanent retention.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
