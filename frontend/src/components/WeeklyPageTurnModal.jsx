import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, Award, Clock, ArrowRight, X, Sparkles } from 'lucide-react';

export default function WeeklyPageTurnModal({ isOpen, onClose, stats = {} }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#2A2730]/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Page Turn Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, rotateY: 8 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.96, rotateY: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg bg-surface border border-border-subtle rounded-lg shadow-modal p-8 z-10 space-y-6 overflow-hidden"
      >
        {/* Top Paper Ruled Header */}
        <div className="flex items-start justify-between border-b border-border-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-accent-primary">
                Weekly Academic Recap
              </span>
              <span className="font-handwriting text-base text-ink-violet transform -rotate-2">
                Turn the page ➔
              </span>
            </div>
            <h3 className="text-xl font-bold font-display text-text-primary mt-1">
              Week in Review
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-sm text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close page recap"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notebook Marginalia & Highlights */}
        <div className="space-y-4 text-xs">
          
          {/* Key Achievements */}
          <div className="p-4 rounded-md bg-surface-tint border border-border-subtle space-y-2 relative">
            <div className="flex justify-between items-center text-[11px] text-text-muted font-mono">
              <span>Retention Velocity</span>
              <span className="font-semibold text-accent-primary">+14% mastery gained</span>
            </div>

            <p className="text-text-primary font-medium leading-relaxed">
              You reviewed <strong className="text-accent-primary">34 flashcards</strong> across Deep Learning and Quantum Physics, maintaining a <strong className="text-success">7-day active streak</strong>.
            </p>

            {/* Handwritten marginal note */}
            <span className="font-handwriting text-sm text-[#977319] block pt-1">
              "Great momentum on backpropagation calculus this week!"
            </span>
          </div>

          {/* Mastered Concepts Inked */}
          <div>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2 font-mono">
              Inked into Long-Term Memory
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded bg-[#EDF8F3] text-[#2B7A5C] font-semibold text-xs border border-[#7FCBAE]/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> ReLU Activations (94%)
              </span>
              <span className="px-2.5 py-1 rounded bg-[#EDF8F3] text-[#2B7A5C] font-semibold text-xs border border-[#7FCBAE]/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Born Probability Density (88%)
              </span>
              <span className="px-2.5 py-1 rounded bg-[#EDF8F3] text-[#2B7A5C] font-semibold text-xs border border-[#7FCBAE]/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> GDP Deflators (90%)
              </span>
            </div>
          </div>

          {/* Next Week's Recommended Page */}
          <div className="pt-3 border-t border-border-subtle">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1 font-mono">
              Next Chapter Focus
            </span>
            <div className="flex items-center justify-between p-3 rounded bg-bg-subtle border border-border-subtle">
              <div>
                <span className="font-bold text-text-primary block">Wavefunction Collapse & Superposition</span>
                <span className="text-[11px] text-text-secondary">3 spaced recall cards scheduled for Monday</span>
              </div>
              <span className="text-accent-primary font-semibold text-xs">Ready ➔</span>
            </div>
          </div>

        </div>

        {/* Footer Action */}
        <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
          <span className="font-handwriting text-sm text-text-muted">
            Signed by LectureMind AI
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-sm bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold shadow-soft transition-colors flex items-center gap-1.5"
          >
            Start Fresh Week <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </motion.div>
    </div>
  );
}
