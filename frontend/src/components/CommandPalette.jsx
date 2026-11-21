import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, Brain, Mic, Timer, TrendingUp, Sparkles, ArrowRight, CornerDownLeft, Layers, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const storedSubjects = (() => {
    try {
      const raw = localStorage.getItem('lecturemind_guest_subjects');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const dynamicConcepts = storedSubjects.length > 0
    ? storedSubjects.map(s => ({
        id: `concept-${s.id}`,
        label: `Course: ${s.name}`,
        category: 'My Courses',
        icon: FileText,
        target: '#/dashboard/subjects'
      }))
    : [
        { id: 'concept-upload', label: 'Upload PDF / Notes', category: 'Upload', icon: FileText, target: '#/dashboard/subjects' }
      ];

  const actions = [
    { id: 'dashboard', label: 'Go to Study Room Console', category: 'Navigation', icon: BookOpen, target: '#/dashboard/metrics' },
    { id: 'lectures', label: 'Browse Course Lectures & Subjects', category: 'Navigation', icon: Layers, target: '#/dashboard/subjects' },
    { id: 'flashcards', label: 'Open SM-2 Flashcard Hub', category: 'Study Tools', icon: Brain, target: '#/dashboard/flashcards' },
    { id: 'exam', label: 'Start Timed Exam Simulator', category: 'Study Tools', icon: Timer, target: '#/dashboard/exam' },
    { id: 'voice', label: 'Start Voice Socratic Tutor', category: 'AI Tools', icon: Mic, target: '#/dashboard/voice' },
    { id: 'analytics', label: 'View Progress Analytics & Heatmap', category: 'Insights', icon: TrendingUp, target: '#/dashboard/analytics' },
    ...dynamicConcepts
  ];

  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredActions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredActions.length - 1));
      } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredActions[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex]);

  const handleSelect = (action) => {
    onClose();
    if (onNavigate) {
      onNavigate(action.target);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-start justify-center pt-24 sm:pt-32 p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#2A2730]/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -10 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative w-full max-w-xl bg-surface border border-border-subtle rounded-md shadow-modal overflow-hidden z-10"
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border-subtle gap-3">
          <Search className="w-4 h-4 text-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search lectures, concepts, or jump to study tools..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono text-text-muted bg-bg-subtle border border-border-subtle">
            ESC
          </kbd>
        </div>

        {/* Action Results */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border-subtle/50">
          {filteredActions.length > 0 ? (
            filteredActions.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={action.id}
                  onClick={() => handleSelect(action)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-sm cursor-pointer transition-colors ${
                    isSelected ? 'bg-bg-subtle text-text-primary' : 'text-text-secondary hover:bg-bg-subtle/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-sm border ${isSelected ? 'bg-surface border-border-subtle text-accent-primary' : 'bg-surface-tint border-border-subtle text-text-muted'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-text-primary truncate">
                      {action.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">
                      {action.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3 h-3 text-accent-primary" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-text-muted">No matching destinations found for "{query}".</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border-subtle bg-bg-subtle/50 flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono">↑↓</kbd> to navigate</span>
            <span><kbd className="font-mono">↵</kbd> to select</span>
          </div>
          <span>LectureMind Command Palette</span>
        </div>
      </motion.div>
    </div>
  );
}
