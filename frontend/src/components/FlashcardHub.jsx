import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import StudyReceiptModal from './StudyReceiptModal';
import { 
  Plus, 
  Brain, 
  Clock, 
  Award, 
  Sparkles, 
  ArrowLeft, 
  Star, 
  RotateCcw, 
  HelpCircle,
  BookOpen,
  ArrowRight,
  UploadCloud,
  TrendingUp,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Keyboard,
  Receipt,
  BrainCircuit
} from 'lucide-react';

export default function FlashcardHub({ currentUser: _currentUser, onShowToast }) {
  const [sets, setSets] = useState([]);
  const [activeSet, setActiveSet] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  
  // Filtering & Display States
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  const [tagQuery, setTagQuery] = useState('');

  // Study Modes: 'flip' | 'spaced' | 'exam'
  const [studyMode, setStudyMode] = useState('flip');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Session Summary State (restrained celebration at end of batch)
  const [sessionSummary, setSessionSummary] = useState(null);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, ratings: { again: 0, hard: 0, good: 0, easy: 0 } });

  // Exam Mode Answer States
  const [examAnswers, setExamAnswers] = useState({});
  const [examResult, setExamResult] = useState(null);

  // Generation Panel States
  const [isGenerating, setIsGenerating] = useState(false);
  const [genTitle, setGenTitle] = useState('');
  const [genText, setGenText] = useState('');

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  // Keyboard navigation for power users: Space to flip, 1-4 for SM-2
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if active set and not typing in input
      if (!activeSet || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (studyMode === 'spaced' && isFlipped) {
        if (e.key === '1') handleSm2Review(filteredCards[currentCardIndex]?.id, 'again');
        else if (e.key === '2') handleSm2Review(filteredCards[currentCardIndex]?.id, 'hard');
        else if (e.key === '3') handleSm2Review(filteredCards[currentCardIndex]?.id, 'good');
        else if (e.key === '4') handleSm2Review(filteredCards[currentCardIndex]?.id, 'easy');
      } else if (e.key === 'ArrowRight') {
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        handlePrevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSet, isFlipped, currentCardIndex, studyMode]);

  const fetchFlashcardSets = async () => {
    let combinedSets = [];
    const token = localStorage.getItem('token');
    
    // 1. Fetch from Database if authenticated
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/flashcards`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.sets) && data.sets.length > 0) {
          combinedSets = [...data.sets];
        }
      } catch (err) {
        console.warn("Failed to load DB flashcards:", err.message);
      }
    }

    // 2. Fetch from Local Flashcards Cache
    try {
      const local = localStorage.getItem('lecturemind_guest_flashcards');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          parsed.forEach(p => {
            if (!combinedSets.some(s => s.title === p.title)) {
              combinedSets.push(p);
            }
          });
        }
      }
    } catch (e) {}

    // 3. Automatically extract and build flashcard sets from ANY uploaded courses in Folder Manager
    try {
      const subjectsRaw = localStorage.getItem('lecturemind_guest_subjects');
      if (subjectsRaw) {
        const subjects = JSON.parse(subjectsRaw);
        subjects.forEach(subj => {
          (subj.chapters || []).forEach(chap => {
            (chap.topics || []).forEach(top => {
              (top.materials || []).forEach(mat => {
                if (!combinedSets.some(s => s.title === subj.name)) {
                  let cards = [];
                  if (mat.flashcards && mat.flashcards.length > 0) {
                    cards = mat.flashcards.map((fc, idx) => ({
                      id: `c-${subj.id}-${idx}`,
                      front: fc.front,
                      back: fc.back,
                      type: fc.front && fc.front.includes('{{') ? 'cloze' : 'front_back',
                      hint: fc.hint || '',
                      difficulty: fc.difficulty || 'medium',
                      tags: subj.name,
                      bookmarked: false
                    }));
                  } else if (mat.keyPoints && mat.keyPoints.length > 0) {
                    cards = mat.keyPoints.map((kp, idx) => ({
                      id: `c-kp-${subj.id}-${idx}`,
                      front: `Key Concept #${idx + 1}: What is the core takeaway for ${subj.name}?`,
                      back: kp,
                      type: 'front_back',
                      hint: 'Review key evaluation point',
                      difficulty: idx % 2 === 0 ? 'easy' : 'medium',
                      tags: subj.name,
                      bookmarked: false
                    }));
                  }

                  if (cards.length > 0) {
                    combinedSets.unshift({
                      id: `set-${subj.id}`,
                      title: subj.name,
                      mindmap: mat.mindmap || {
                        label: subj.name,
                        children: [
                          { label: "Core Principles", children: (cards.slice(0, 3).map(c => c.back.slice(0, 25))) },
                          { label: "Exam Points", children: (cards.slice(3, 6).map(c => c.back.slice(0, 25))) }
                        ]
                      },
                      cards
                    });
                  }
                }
              });
            });
          });
        });
      }
    } catch (e) {}

    if (combinedSets.length > 0) {
      setSets(combinedSets);
      setActiveSet(combinedSets[0]);
    } else {
      loadFallbackLocalSets();
    }
  };

  const loadFallbackLocalSets = () => {
    const local = localStorage.getItem('lecturemind_guest_flashcards');
    if (local) {
      setSets(JSON.parse(local));
    } else {
      const defaultSets = [
        {
          id: "set-1",
          title: "Deep Learning & Representation Learning",
          cards: [
            {
              id: "c-1",
              front: "What is the primary role of the Chain Rule in backpropagation?",
              back: "It computes partial derivatives of the scalar loss with respect to each weight layer by layer backwards.",
              type: "front_back",
              hint: "Calculus for composite derivative functions.",
              difficulty: "medium",
              tags: "AI",
              bookmarked: true
            },
            {
              id: "c-2",
              front: "The {{vanishing gradient}} problem causes deep Sigmoid networks to train extremely slowly.",
              back: "vanishing gradient",
              type: "cloze",
              hint: "Gradients shrink exponentially towards zero in early layers.",
              difficulty: "hard",
              tags: "AI",
              bookmarked: false
            },
            {
              id: "c-3",
              front: "What mathematical property makes ReLU effective for hidden layers?",
              back: "Its derivative is a constant 1 for all positive inputs (f'(x)=1 for x>0), preventing signal decay.",
              type: "front_back",
              hint: "Slope is constant 1 above 0.",
              difficulty: "easy",
              tags: "AI",
              bookmarked: false
            }
          ]
        },
        {
          id: "set-2",
          title: "Quantum Mechanics Wave Equation",
          cards: [
            {
              id: "c-4",
              front: "Max Born interpreted |ψ|² as spatial {{probability density}}.",
              back: "probability density",
              type: "cloze",
              hint: "Statistical likelihood of locating a particle.",
              difficulty: "medium",
              tags: "Physics",
              bookmarked: false
            },
            {
              id: "c-5",
              front: "What does Heisenberg's Uncertainty Principle limit?",
              back: "The simultaneous precision of position (Δx) and momentum (Δp): Δx·Δp ≥ ℏ/2.",
              type: "front_back",
              hint: "Product of measurement uncertainties.",
              difficulty: "hard",
              tags: "Physics",
              bookmarked: false
            }
          ]
        }
      ];
      setSets(defaultSets);
      localStorage.setItem('lecturemind_guest_flashcards', JSON.stringify(defaultSets));
    }
  };

  const saveLocalSets = (updatedSets) => {
    setSets(updatedSets);
    localStorage.setItem('lecturemind_guest_flashcards', JSON.stringify(updatedSets));
  };

  // SM-2 Review Handler
  const handleSm2Review = async (cardId, rating) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_URL}/api/flashcards/${cardId}/review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ rating })
        });
      } catch (e) {
        console.error('SM2 review error:', e);
      }
    }

    // Update session stats
    const nextReviewed = sessionStats.reviewed + 1;
    const nextRatings = {
      ...sessionStats.ratings,
      [rating]: sessionStats.ratings[rating] + 1
    };
    setSessionStats({ reviewed: nextReviewed, ratings: nextRatings });

    setIsFlipped(false);
    setShowHint(false);

    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Complete batch session
      setSessionSummary({
        total: nextReviewed,
        ratings: nextRatings,
        accuracy: Math.round(((nextRatings.good + nextRatings.easy) / nextReviewed) * 100)
      });
      setCurrentCardIndex(0);
    }
  };

  // AI Flashcard Generation handler
  const handleGenerateFlashcards = (e) => {
    e.preventDefault();
    if (!genTitle || !genText) return;

    setIsGenerating(true);

    setTimeout(() => {
      const newDeck = {
        id: "set-" + Date.now(),
        title: genTitle,
        cards: [
          {
            id: "gc-" + Date.now() + "-1",
            front: `What is the core premise of: "${genText.substring(0, 50)}…"?`,
            back: "Key foundational definition extracted from your uploaded study notes.",
            type: "front_back",
            hint: "Refer to prompt thesis.",
            difficulty: "easy",
            tags: "General",
            bookmarked: false
          },
          {
            id: "gc-" + Date.now() + "-2",
            front: "This material highlights key variables linked to the study of {{active synthesis}}.",
            back: "active synthesis",
            type: "cloze",
            hint: "Core methodological term.",
            difficulty: "medium",
            tags: "Notes",
            bookmarked: false
          }
        ]
      };

      const updated = [newDeck, ...sets];
      saveLocalSets(updated);
      setGenTitle('');
      setGenText('');
      setIsGenerating(false);
      if (onShowToast) onShowToast(`Generated flashcard deck "${newDeck.title}"`, 'success');
    }, 1200);
  };

  const toggleBookmark = (cardId) => {
    if (!activeSet) return;
    const updatedCards = activeSet.cards.map(c => c.id === cardId ? { ...c, bookmarked: !c.bookmarked } : c);
    const updatedActive = { ...activeSet, cards: updatedCards };
    setActiveSet(updatedActive);
    const updatedSets = sets.map(s => s.id === activeSet.id ? updatedActive : s);
    saveLocalSets(updatedSets);
  };

  const startStudying = (set, mode = 'flip') => {
    setActiveSet(set);
    setStudyMode(mode);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setExamAnswers({});
    setExamResult(null);
    setSessionSummary(null);
    setSessionStats({ reviewed: 0, ratings: { again: 0, hard: 0, good: 0, easy: 0 } });
  };

  const handleNextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleExamSubmit = (e) => {
    e.preventDefault();
    let score = 0;
    const report = [];

    filteredCards.forEach(card => {
      const studentAns = (examAnswers[card.id] || '').trim().toLowerCase();
      const correctAns = card.back.trim().toLowerCase();
      const isCorrect = studentAns === correctAns || (correctAns.includes(studentAns) && studentAns.length > 2);
      if (isCorrect) score++;

      report.push({
        id: card.id,
        front: card.front,
        correctAns: card.back,
        studentAns: examAnswers[card.id] || '(No Answer)',
        isCorrect
      });
    });

    const percentage = Math.round((score / filteredCards.length) * 100);
    setExamResult({ score, total: filteredCards.length, percentage, report });
  };

  const filteredCards = (activeSet ? activeSet.cards : []).filter(card => {
    if (difficultyFilter !== 'all' && card.difficulty !== difficultyFilter) return false;
    if (showOnlyBookmarked && !card.bookmarked) return false;
    if (tagQuery && !card.tags?.toLowerCase().includes(tagQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: Deck generator & Deck list (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Generator Box */}
        <div className="bg-surface border border-border-subtle rounded-md p-6 shadow-soft">
          <div className="flex items-center gap-2 pb-3 border-b border-border-subtle mb-4">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">AI Flashcard Generator</h4>
          </div>

          <form onSubmit={handleGenerateFlashcards} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">Set Title</label>
              <input 
                type="text"
                required
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
                placeholder="e.g. Backprop & Gradient Flow"
                className="w-full px-3 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">Notes / Textbook Excerpt</label>
              <textarea 
                required
                value={genText}
                onChange={(e) => setGenText(e.target.value)}
                placeholder="Paste class notes, definitions, or equations here…"
                className="w-full px-3 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary focus-ring h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 rounded-sm text-xs font-semibold text-white bg-accent-primary hover:bg-accent-hover transition-colors shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Generating Deck…
                </>
              ) : (
                <>
                  <Brain className="w-3.5 h-3.5" />
                  Generate Active Recall Deck
                </>
              )}
            </button>
          </form>
        </div>

        {/* Saved Study Sets */}
        <div className="bg-surface border border-border-subtle rounded-md p-6 shadow-soft">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider pb-3 border-b border-border-subtle mb-3">
            Study Decks ({sets.length})
          </h4>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sets.map(s => (
              <div
                key={s.id}
                onClick={() => startStudying(s, 'spaced')}
                className={`p-3 rounded-sm border cursor-pointer transition-all flex items-center justify-between ${
                  activeSet?.id === s.id
                    ? 'border-accent-primary bg-surface-tint shadow-soft text-text-primary'
                    : 'border-border-subtle bg-surface hover:bg-bg-subtle/50 text-text-secondary'
                }`}
              >
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-text-primary truncate">{s.title}</h5>
                  <span className="text-[10px] text-text-muted">{(s.cards || []).length} Flashcards</span>
                </div>
                <span className="text-xs font-semibold text-accent-primary">Study →</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Study Board (8 cols) */}
      <div className="lg:col-span-8">
        
        {activeSet ? (
          <div className="space-y-6">
            
            {/* Header / Mode Switcher */}
            <div className="bg-surface border border-border-subtle rounded-md p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold font-display text-text-primary">{activeSet.title}</h3>
                <span className="text-[11px] text-text-muted">SM-2 Spaced Repetition deck</span>
              </div>

              {/* Modes */}
              <div className="flex bg-bg-subtle p-1 rounded-sm border border-border-subtle">
                {[
                  { id: 'spaced', label: 'SM-2 Spaced' },
                  { id: 'flip', label: 'Manual Flip' },
                  { id: 'exam', label: 'Quiz Mode' },
                  { id: 'mindmap', label: '🧠 Concept Mind Map' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => startStudying(activeSet, mode.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                      studyMode === mode.id
                        ? 'bg-surface text-text-primary font-semibold shadow-soft'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Bar & Keyboard shortcut hints */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-2 py-1 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary focus-ring"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <button
                  onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                  className={`inline-flex items-center gap-1 font-medium ${showOnlyBookmarked ? 'text-accent-yellow font-bold' : 'text-text-secondary'}`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" /> Starred only
                </button>

                <input
                  type="text"
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  placeholder="Filter by tag…"
                  className="px-2 py-1 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary w-28 focus-ring"
                />
              </div>

              <div className="inline-flex items-center gap-2 text-[11px] text-text-muted">
                <Keyboard className="w-3.5 h-3.5" />
                <span><kbd className="font-mono">Space</kbd> to flip · <kbd className="font-mono">1-4</kbd> to rate</span>
              </div>
            </div>

            {/* CARD VIEWER OR SESSION SUMMARY */}
            {sessionSummary ? (
              /* Session summary screen at end of batch (Restrained celebration per brief) */
              <div className="bg-surface border border-border-subtle rounded-md p-8 text-center shadow-soft space-y-4 animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-full bg-accent-mint/20 text-[#2B7A5C] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold font-display text-text-primary">Review Batch Complete</h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    You reviewed <span className="font-semibold text-text-primary">{sessionSummary.total} cards</span> with an accuracy rating of <span className="font-semibold text-accent-primary">{sessionSummary.accuracy}%</span>.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto pt-3 pb-2 text-center text-xs">
                  <div className="p-2 rounded-sm bg-[#FBF0EE]">
                    <span className="block font-bold text-[#C44D37]">{sessionSummary.ratings.again}</span>
                    <span className="text-[10px] text-text-muted">Again</span>
                  </div>
                  <div className="p-2 rounded-sm bg-[#FEF9EC]">
                    <span className="block font-bold text-[#977319]">{sessionSummary.ratings.hard}</span>
                    <span className="text-[10px] text-text-muted">Hard</span>
                  </div>
                  <div className="p-2 rounded-sm bg-[#EDF8F3]">
                    <span className="block font-bold text-[#2B7A5C]">{sessionSummary.ratings.good}</span>
                    <span className="text-[10px] text-text-muted">Good</span>
                  </div>
                  <div className="p-2 rounded-sm bg-[#E4F5EE]">
                    <span className="block font-bold text-[#1E674C]">{sessionSummary.ratings.easy}</span>
                    <span className="text-[10px] text-text-muted">Easy</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-subtle flex flex-wrap justify-center gap-2.5">
                  <button
                    onClick={() => setIsReceiptOpen(true)}
                    className="px-4 py-2 bg-surface hover:bg-bg-subtle border border-border-subtle text-xs font-semibold text-accent-primary rounded-sm transition-colors flex items-center gap-1.5 shadow-soft"
                  >
                    <Receipt className="w-3.5 h-3.5" /> View Study Receipt
                  </button>
                  <button
                    onClick={() => startStudying(activeSet, studyMode)}
                    className="px-4 py-2 bg-bg-subtle hover:bg-border-subtle border border-border-subtle text-xs font-semibold text-text-primary rounded-sm transition-colors"
                  >
                    Restart Deck
                  </button>
                  <button
                    onClick={() => setActiveSet(null)}
                    className="px-4 py-2 bg-accent-primary text-white text-xs font-semibold rounded-sm hover:bg-accent-hover transition-colors shadow-soft"
                  >
                    Return to Library
                  </button>
                </div>
              </div>
            ) : filteredCards.length > 0 ? (
              <div>
                {/* 1. FLIP & SM-2 MODES */}
                {(studyMode === 'flip' || studyMode === 'spaced') && (
                  <div className="space-y-6">
                    
                    {/* Rotating 3D Card */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={handlePrevCard}
                        disabled={currentCardIndex === 0}
                        className="p-2 rounded-full bg-surface border border-border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30 shadow-soft"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="flex-1 max-w-lg h-72 perspective-1000 cursor-pointer select-none"
                      >
                        <div className={`relative w-full h-full duration-300 preserve-3d rounded-md ${isFlipped ? 'rotate-y-180' : ''}`}>
                          
                          {/* FRONT */}
                          <div className="absolute inset-0 w-full h-full rounded-md border border-border-subtle bg-surface p-7 shadow-soft flex flex-col justify-between backface-hidden dog-ear-container">
                            {/* Tactile Dog-Ear Folded Corner */}
                            <div 
                              className="dog-ear-corner"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(filteredCards[currentCardIndex].id);
                                if (onShowToast) onShowToast('Folded corner / bookmarked card', 'success');
                              }}
                              title="Fold corner / bookmark"
                            />

                            <div className="flex justify-between items-center text-xs pr-6">
                              <span className="text-[11px] uppercase tracking-wider font-mono text-text-muted">
                                Question {currentCardIndex + 1} of {filteredCards.length}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleBookmark(filteredCards[currentCardIndex].id); }}
                                className={`p-1 ${filteredCards[currentCardIndex].bookmarked ? 'text-accent-yellow' : 'text-text-muted'}`}
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                            </div>

                            <div className="text-center py-4">
                              {filteredCards[currentCardIndex].type === 'cloze' ? (
                                <p className="text-base font-semibold text-text-primary leading-relaxed">
                                  {filteredCards[currentCardIndex].front.replace(/\{\{.*?\}\}/g, '[ _________ ]')}
                                </p>
                              ) : (
                                <p className="text-base font-semibold text-text-primary leading-relaxed">
                                  {filteredCards[currentCardIndex].front}
                                </p>
                              )}
                            </div>

                            <span className="text-[10px] text-text-muted text-center uppercase tracking-wider">
                              Click or press Space to flip
                            </span>
                          </div>

                          {/* BACK */}
                          <div className="absolute inset-0 w-full h-full rounded-md border border-accent-primary/40 bg-surface-tint p-7 shadow-soft flex flex-col justify-between backface-hidden rotate-y-180">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[11px] uppercase tracking-wider font-mono text-accent-primary font-bold">
                                Correct Answer
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleBookmark(filteredCards[currentCardIndex].id); }}
                                className={`p-1 ${filteredCards[currentCardIndex].bookmarked ? 'text-accent-yellow' : 'text-text-muted'}`}
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                            </div>

                            <div className="text-center py-3">
                              <p className="text-base font-bold text-text-primary leading-relaxed">
                                {filteredCards[currentCardIndex].back}
                              </p>
                              {showHint && filteredCards[currentCardIndex].hint && (
                                <p className="mt-2 text-xs text-text-secondary italic">
                                  Hint: {filteredCards[currentCardIndex].hint}
                                </p>
                              )}
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-text-muted">
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowHint(!showHint); }}
                                className="text-accent-primary font-semibold hover:underline"
                              >
                                {showHint ? 'Hide hint' : 'Show hint'}
                              </button>
                              <span>Click to flip back</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      <button
                        onClick={handleNextCard}
                        disabled={currentCardIndex === filteredCards.length - 1}
                        className="p-2 rounded-full bg-surface border border-border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30 shadow-soft"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* SM-2 4-Button Spaced Repetition Evaluation Bar */}
                    {studyMode === 'spaced' && isFlipped && (
                      <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto pt-2 animate-in fade-in duration-150">
                        <button
                          onClick={() => handleSm2Review(filteredCards[currentCardIndex].id, 'again')}
                          className="p-2.5 rounded-sm bg-[#FBF0EE] hover:bg-[#F7E1DD] border border-[#E0725C]/30 text-[#C44D37] text-xs font-semibold text-center transition-colors"
                        >
                          <span className="block font-bold">Again</span>
                          <span className="text-[10px] opacity-75">&lt;1 min (1)</span>
                        </button>

                        <button
                          onClick={() => handleSm2Review(filteredCards[currentCardIndex].id, 'hard')}
                          className="p-2.5 rounded-sm bg-[#FEF9EC] hover:bg-[#FDF0D0] border border-[#F4CE6B]/40 text-[#977319] text-xs font-semibold text-center transition-colors"
                        >
                          <span className="block font-bold">Hard</span>
                          <span className="text-[10px] opacity-75">1 day (2)</span>
                        </button>

                        <button
                          onClick={() => handleSm2Review(filteredCards[currentCardIndex].id, 'good')}
                          className="p-2.5 rounded-sm bg-[#EDF8F3] hover:bg-[#DDF1E7] border border-[#7FCBAE]/40 text-[#2B7A5C] text-xs font-semibold text-center transition-colors"
                        >
                          <span className="block font-bold">Good</span>
                          <span className="text-[10px] opacity-75">3 days (3)</span>
                        </button>

                        <button
                          onClick={() => handleSm2Review(filteredCards[currentCardIndex].id, 'easy')}
                          className="p-2.5 rounded-sm bg-[#E4F5EE] hover:bg-[#CEEDE0] border border-[#6FBF9A]/40 text-[#1E674C] text-xs font-semibold text-center transition-colors"
                        >
                          <span className="block font-bold">Easy</span>
                          <span className="text-[10px] opacity-75">6 days (4)</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* 3. MIND MAP VIEW */}
                {studyMode === 'mindmap' && (
                  <div className="bg-paper border border-rule rounded-xl p-6 shadow-soft space-y-6">
                    <div className="border-b border-rule pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                          Cognitive Concept Mind Map
                        </h4>
                        <p className="text-xs text-charcoal-soft">
                          Generated from {activeSet?.title}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-violet/15 text-violet">
                        Nemotron Mind Map
                      </span>
                    </div>

                    {/* Mind Map Tree */}
                    <div className="p-4 bg-card border border-rule rounded-xl overflow-x-auto">
                      <div className="min-w-[500px]">
                        {/* Central Node */}
                        <div className="flex justify-center mb-6">
                          <div className="px-6 py-3 rounded-2xl bg-violet text-white text-xs font-bold shadow-soft flex items-center gap-2 border border-violet-hover">
                            <BrainCircuit className="w-4 h-4" />
                            <span>{activeSet?.mindmap?.label || activeSet?.title}</span>
                          </div>
                        </div>

                        {/* Main Branches */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {(activeSet?.mindmap?.children || [
                            { label: "Core Principles", children: activeSet?.cards?.slice(0, 3).map(c => c.hint || c.front.slice(0, 25)) || ["Core Concepts"] },
                            { label: "Definitions", children: activeSet?.cards?.slice(3, 6).map(c => c.front.slice(0, 25)) || ["Terms"] },
                            { label: "Exam Points", children: ["Problem Solutions", "Evaluation Criteria"] }
                          ]).map((branch, bIdx) => (
                            <div key={bIdx} className="bg-paper-deep/60 border border-rule rounded-xl p-4 space-y-2">
                              <div className="border-b border-rule pb-1.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-coral" />
                                <span className="text-xs font-bold text-charcoal">{branch.label}</span>
                              </div>
                              <div className="space-y-1.5">
                                {(branch.children || []).map((child, cIdx) => (
                                  <div key={cIdx} className="text-[11px] p-2 rounded-md bg-card text-charcoal border border-rule/60 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                                    <span className="truncate">{child}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. EXAM QUIZ MODE */}
                {studyMode === 'exam' && (
                  <div className="bg-surface border border-border-subtle rounded-md p-6 shadow-soft space-y-6">
                    <div className="border-b border-border-subtle pb-3">
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Diagnostic Flashcard Exam</h4>
                      <p className="text-xs text-text-secondary">Type answers to evaluate your accuracy curve.</p>
                    </div>

                    {!examResult ? (
                      <form onSubmit={handleExamSubmit} className="space-y-4">
                        {filteredCards.map((card, idx) => (
                          <div key={card.id} className="p-4 rounded-sm bg-surface-tint border border-border-subtle space-y-2">
                            <span className="text-[10px] font-mono font-semibold text-text-muted">Question {idx + 1}</span>
                            <p className="text-xs font-semibold text-text-primary">{card.front}</p>
                            <input
                              type="text"
                              required
                              value={examAnswers[card.id] || ''}
                              onChange={(e) => setExamAnswers({ ...examAnswers, [card.id]: e.target.value })}
                              placeholder="Type recall response…"
                              className="w-full px-3 py-1.5 bg-surface border border-border-subtle rounded-sm text-xs text-text-primary focus-ring"
                            />
                          </div>
                        ))}
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-accent-primary text-white rounded-sm text-xs font-semibold hover:bg-accent-hover transition-colors shadow-soft"
                        >
                          Grade Exam
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-surface-tint border border-border-subtle rounded-sm flex items-center justify-between">
                          <div>
                            <span className="text-xs text-text-muted block">Score</span>
                            <span className="text-xl font-bold text-text-primary">{examResult.score} / {examResult.total} Correct</span>
                          </div>
                          <span className="text-xl font-bold text-accent-primary tabular-nums">{examResult.percentage}% Accuracy</span>
                        </div>

                        <button
                          onClick={() => { setExamResult(null); setExamAnswers({}); }}
                          className="w-full py-2 bg-bg-subtle border border-border-subtle text-xs font-semibold text-text-primary rounded-sm"
                        >
                          Retry Exam
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. MIND MAP VIEW */}
                {studyMode === 'mindmap' && (
                  <div className="bg-paper border border-rule rounded-xl p-6 shadow-soft space-y-6">
                    <div className="border-b border-rule pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                          Cognitive Concept Mind Map
                        </h4>
                        <p className="text-xs text-charcoal-soft">
                          Generated from {activeSet?.title}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-violet/15 text-violet">
                        Nemotron Mind Map
                      </span>
                    </div>

                    {/* Mind Map Tree */}
                    <div className="p-4 bg-card border border-rule rounded-xl overflow-x-auto">
                      <div className="min-w-[500px]">
                        {/* Central Node */}
                        <div className="flex justify-center mb-6">
                          <div className="px-6 py-3 rounded-2xl bg-violet text-white text-xs font-bold shadow-soft flex items-center gap-2 border border-violet-hover">
                            <BrainCircuit className="w-4 h-4" />
                            <span>{activeSet?.mindmap?.label || activeSet?.title}</span>
                          </div>
                        </div>

                        {/* Main Branches */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {(activeSet?.mindmap?.children || [
                            { label: "Core Principles", children: activeSet?.cards?.slice(0, 3).map(c => c.hint || c.front.slice(0, 25)) || ["Core Concepts"] },
                            { label: "Definitions", children: activeSet?.cards?.slice(3, 6).map(c => c.front.slice(0, 25)) || ["Terms"] },
                            { label: "Exam Points", children: ["Problem Solutions", "Evaluation Criteria"] }
                          ]).map((branch, bIdx) => (
                            <div key={bIdx} className="bg-paper-deep/60 border border-rule rounded-xl p-4 space-y-2">
                              <div className="border-b border-rule pb-1.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-coral" />
                                <span className="text-xs font-bold text-charcoal">{branch.label}</span>
                              </div>
                              <div className="space-y-1.5">
                                {(branch.children || []).map((child, cIdx) => (
                                  <div key={cIdx} className="text-[11px] p-2 rounded-md bg-card text-charcoal border border-rule/60 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                                    <span className="truncate">{child}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-surface border border-border-subtle rounded-md p-16 text-center">
                <HelpCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-secondary">No flashcards found matching your filter criteria.</p>
              </div>
            )}

          </div>
        ) : (
          <div className="bg-surface border border-border-subtle rounded-md p-16 text-center shadow-soft">
            <Brain className="w-10 h-10 text-accent-primary mx-auto mb-3" />
            <h4 className="text-base font-bold font-display text-text-primary">Select a Study Deck</h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1 leading-relaxed">
              Pick an active recall deck from the left catalog or generate a new set from class notes to start spaced repetition!
            </p>
          </div>
        )}

      </div>

      {/* STUDY RECEIPT MODAL */}
      <StudyReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receiptData={{
          title: activeSet?.title,
          total: sessionSummary?.total || filteredCards.length,
          accuracy: sessionSummary?.accuracy || 100,
          concepts: activeSet?.cards?.map(c => c.hint || c.front.slice(0, 20)).slice(0, 4)
        }}
      />

    </div>
  );
}
