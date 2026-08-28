import React, { useState } from 'react';
import { Sparkles, UploadCloud, BookOpen, Brain, ArrowRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: "Add your first lecture material",
      description: "Upload an audio recording, textbook PDF, or paste class notes. LectureMind automatically processes the raw input into structured knowledge.",
      icon: UploadCloud,
      preview: (
        <div className="border border-dashed border-border-subtle bg-bg-subtle p-6 rounded-md text-center">
          <UploadCloud className="w-8 h-8 text-accent-primary mx-auto mb-2" />
          <span className="text-xs font-semibold text-text-primary block">Drop MP3, MP4, or PDF</span>
          <span className="text-[11px] text-text-secondary">Or paste your lecture transcript directly</span>
        </div>
      )
    },
    {
      step: 2,
      title: "Explore structured notes & concept maps",
      description: "We don't just summarize — we extract core hierarchies, key definitions, and generate an interactive concept map of related ideas.",
      icon: BookOpen,
      preview: (
        <div className="bg-surface-tint border border-border-subtle p-4 rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary">Key Concept</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-mint/20 text-[#2B7A5C] font-semibold">Grounded</span>
          </div>
          <p className="text-xs text-text-secondary">
            Backpropagation applies the chain rule across network layers to compute weight loss gradients.
          </p>
        </div>
      )
    },
    {
      step: 3,
      title: "Retain with SM-2 spaced repetition",
      description: "Review generated flashcards with timed recall intervals. LectureMind tracks weak concepts so you only spend time on what you need to master.",
      icon: Brain,
      preview: (
        <div className="bg-surface border border-border-subtle p-4 rounded-md shadow-soft space-y-3">
          <div className="flex justify-between items-center text-[11px] text-text-muted">
            <span>SM-2 Interval</span>
            <span className="text-accent-primary font-semibold">Due in 3 days</span>
          </div>
          <p className="text-xs font-semibold text-text-primary">
            "What activation function mitigates the vanishing gradient problem in deep networks?"
          </p>
          <div className="flex gap-1.5 pt-1">
            <span className="px-2 py-1 rounded bg-[#FBF0EE] text-[#C44D37] text-[10px] font-medium">Again</span>
            <span className="px-2 py-1 rounded bg-[#FEF9EC] text-[#977319] text-[10px] font-medium">Hard</span>
            <span className="px-2 py-1 rounded bg-[#EDF8F3] text-[#2B7A5C] text-[10px] font-medium">Good</span>
            <span className="px-2 py-1 rounded bg-[#E4F5EE] text-[#1E674C] text-[10px] font-medium">Easy</span>
          </div>
        </div>
      )
    }
  ];

  const activeStepData = steps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-[#2A2730]/25 backdrop-blur-sm" 
        onClick={onClose} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-surface border border-border-subtle rounded-md shadow-modal p-6 overflow-hidden z-10"
      >
        {/* Header with progress dots & skip */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === currentStep
                    ? 'w-6 bg-accent-primary'
                    : s < currentStep
                    ? 'w-2 bg-accent-mint'
                    : 'w-2 bg-border-subtle'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Skip walkthrough
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4 mb-6">
          <div className="inline-flex p-2.5 rounded-md bg-bg-subtle border border-border-subtle text-accent-primary">
            <activeStepData.icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">
              {activeStepData.title}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {activeStepData.description}
            </p>
          </div>

          <div className="pt-2">
            {activeStepData.preview}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <span className="text-[11px] text-text-muted font-mono">
            Step {currentStep} of 3
          </span>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold transition-colors shadow-soft"
          >
            {currentStep === 3 ? (
              <>
                Start Learning <Check className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
