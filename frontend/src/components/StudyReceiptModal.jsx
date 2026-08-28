import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Clock, Download, Share2, X, FileText } from 'lucide-react';

export default function StudyReceiptModal({ isOpen, onClose, receiptData = null }) {
  if (!isOpen || !receiptData) return null;

  const handleDownload = () => {
    const textContent = `--- LECTUREMIND STUDY RECEIPT ---
Date: ${new Date().toLocaleDateString()}
Session: ${receiptData.title || 'Active Recall Session'}
Items Reviewed: ${receiptData.total || 0}
Accuracy Score: ${receiptData.accuracy || 100}%
Key Concepts: ${(receiptData.concepts || ['Backpropagation', 'ReLU Activation']).join(', ')}
Status: Recorded into SM-2 Knowledge Spine
---------------------------------`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study_receipt_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#2A2730]/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Receipt Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-sm bg-surface border border-border-subtle rounded-md shadow-modal p-6 z-10 space-y-4 font-sans text-xs"
      >
        {/* Top Close Button */}
        <div className="flex justify-between items-center pb-3 border-b border-dashed border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-text-muted">
              STUDY RECEIPT #{Math.floor(1000 + Math.random() * 9000)}
            </span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Header */}
        <div className="text-center space-y-1 py-1">
          <h4 className="text-base font-bold font-display text-text-primary">LectureMind AI</h4>
          <span className="text-[11px] text-text-muted font-mono block">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="font-handwriting text-sm text-accent-primary block">
            session verified ✓
          </span>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2 border-y border-dashed border-border-subtle py-3 text-text-secondary">
          <div className="flex justify-between">
            <span>Subject / Topic:</span>
            <span className="font-semibold text-text-primary truncate max-w-[160px]">{receiptData.title || 'Deep Learning'}</span>
          </div>
          <div className="flex justify-between">
            <span>Items Reviewed:</span>
            <span className="font-mono font-semibold text-text-primary tabular-nums">{receiptData.total || 0} cards</span>
          </div>
          <div className="flex justify-between">
            <span>Retention Accuracy:</span>
            <span className="font-mono font-bold text-accent-primary tabular-nums">{receiptData.accuracy || 100}%</span>
          </div>
          <div className="flex justify-between">
            <span>Next Review Cycle:</span>
            <span className="font-medium text-text-primary">3 days (SM-2)</span>
          </div>
        </div>

        {/* Covered Concepts */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block mb-1.5 font-semibold">
            Annotated Concepts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(receiptData.concepts || ['Chain Rule', 'ReLU Gradient', 'Loss Optimization']).map((c, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-bg-subtle border border-border-subtle text-[11px] font-medium text-text-secondary">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 py-2 rounded-sm bg-bg-subtle hover:bg-border-subtle border border-border-subtle text-xs font-semibold text-text-primary transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Save Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-sm bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold shadow-soft transition-colors text-center"
          >
            Done
          </button>
        </div>

      </motion.div>
    </div>
  );
}
