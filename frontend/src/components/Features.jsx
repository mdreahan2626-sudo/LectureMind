import React from 'react';
import { Sparkles, Terminal, GitBranch, KeyRound, HelpCircle, FileText } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-32 relative z-10 border-t border-studio-border bg-studio-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Asymmetrical Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Left Column - Sticky Philosophical Intro */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-studio-surface border border-studio-border text-studio-purple text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-studio-purple animate-ping"></span>
              THE METHODOLOGY
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold font-space tracking-tight text-studio-textLight leading-tight">
              Stop reading summaries. <br />
              <span className="text-[#A78BFA]">Start answering questions.</span>
            </h2>
            
            <p className="text-base text-studio-slate leading-relaxed">
              Most study assistants act as simple dictation engines. They summarize a two-hour lecture into paragraphs you will glance at once and forget. 
            </p>
            
            <p className="text-base text-studio-slate leading-relaxed">
              LectureMind uses a different approach. It builds a structural model of your lecture and engages you with targeted inquiries, forcing you to recall details and connect raw facts into structured concepts.
            </p>

            <div className="pt-6 border-t border-studio-border">
              <div className="font-mono text-xs text-studio-textMuted flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-studio-purple" />
                <span>active_synthesis_engine v1.0</span>
              </div>
            </div>
          </div>

          {/* Right Column - Asymmetric Capability Blocks */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Feature Block 1 */}
            <div className="bg-studio-surface border border-studio-border p-8 rounded-3xl relative overflow-hidden transition-all hover:border-studio-purple/40">
              <div className="absolute top-0 right-0 w-24 h-24 bg-studio-purple/5 rounded-full blur-xl"></div>
              <div className="font-mono text-xs text-studio-purple mb-4 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                [INGESTION & STRUCTURE]
              </div>
              <h3 className="text-2xl font-bold font-space text-studio-textLight mb-3">
                Multimodal Context Mapping
              </h3>
              <p className="text-studio-slate text-sm leading-relaxed">
                Ingest textbook PDFs, lecture audio, seminar recordings, or raw lecture text. Our parser identifies key concepts, technical nomenclature, and logical hierarchy rather than just pulling keywords.
              </p>
            </div>

            {/* Feature Block 2 */}
            <div className="bg-studio-surface border border-studio-border p-8 rounded-3xl relative overflow-hidden transition-all hover:border-studio-purple/40 lg:translate-x-6">
              <div className="absolute top-0 right-0 w-24 h-24 bg-studio-purple/5 rounded-full blur-xl"></div>
              <div className="font-mono text-xs text-studio-purple mb-4 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                [SOCRATIC TUTORING]
              </div>
              <h3 className="text-2xl font-bold font-space text-studio-textLight mb-3">
                Adaptive Study Dialogue
              </h3>
              <p className="text-studio-slate text-sm leading-relaxed">
                An active chatbot that behaves like an instructor. It prompts you to define terms, identify logical fallacies in your explanation, and guides you toward the answers.
              </p>
            </div>

            {/* Feature Block 3 */}
            <div className="bg-studio-surface border border-studio-border p-8 rounded-3xl relative overflow-hidden transition-all hover:border-studio-purple/40">
              <div className="absolute top-0 right-0 w-24 h-24 bg-studio-purple/5 rounded-full blur-xl"></div>
              <div className="font-mono text-xs text-studio-purple mb-4 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                [VISUAL ASSOCIATION]
              </div>
              <h3 className="text-2xl font-bold font-space text-studio-textLight mb-3">
                Interactive Mind Maps
              </h3>
              <p className="text-studio-slate text-sm leading-relaxed">
                Concepts do not exist in isolation. The visual network links related flashcards, notes, and topics, showing you how changes in one concept cascade into others.
              </p>
            </div>

            {/* Feature Block 4 */}
            <div className="bg-studio-surface border border-studio-border p-8 rounded-3xl relative overflow-hidden transition-all hover:border-studio-purple/40 lg:translate-x-6">
              <div className="absolute top-0 right-0 w-24 h-24 bg-studio-purple/5 rounded-full blur-xl"></div>
              <div className="font-mono text-xs text-studio-purple mb-4 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                [FLEXIBLE MEMORIZATION]
              </div>
              <h3 className="text-2xl font-bold font-space text-studio-textLight mb-3">
                Cloze & Standard Flashcards
              </h3>
              <p className="text-studio-slate text-sm leading-relaxed">
                Generate flashcards on demand. Supports standard Q&A layouts alongside fill-in-the-blank Cloze deletions, ideal for learning formulas, code syntax, and complex technical definitions.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
