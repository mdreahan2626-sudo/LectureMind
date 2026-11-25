import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import StudyReceiptModal from './StudyReceiptModal';
import { 
  Brain, 
  Clock, 
  Award, 
  Sparkles, 
  HelpCircle,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  X,
  BrainCircuit,
  Zap,
  Check,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Send,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';

export default function FlashcardHub({ currentUser: _currentUser, onShowToast }) {
  const [sets, setSets] = useState([]);
  const [activeSet, setActiveSet] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'agent' | 'mindmap' | 'cards'
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Agentic Revision Coach State
  const [coachTopic, setCoachTopic] = useState('');
  const [coachAction, setCoachAction] = useState('drill'); // 'drill' | 'mistakes' | 'mnemonic' | 'evaluate'
  const [studentAnswer, setStudentAnswer] = useState('');
  const [coachResponse, setCoachResponse] = useState('');
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState({});

  // Quick Flashcard flip state (if in classic card mode)
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Custom Topic Generator
  const [genTitle, setGenTitle] = useState('');
  const [genText, setGenText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchRevisionDecks();
  }, []);

  const fetchRevisionDecks = async () => {
    let combinedSets = [];
    const token = localStorage.getItem('token');
    
    // 1. Fetch DB flashcards if token exists
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
        console.warn("Could not fetch DB flashcards:", err.message);
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

    // 3. Automatically build Summary Revision Decks from ALL uploaded courses in Folder Manager
    try {
      const subjectsRaw = localStorage.getItem('lecturemind_guest_subjects');
      if (subjectsRaw) {
        const subjects = JSON.parse(subjectsRaw);
        subjects.forEach(subj => {
          (subj.chapters || []).forEach(chap => {
            (chap.topics || []).forEach(top => {
              (top.materials || []).forEach(mat => {
                if (!combinedSets.some(s => s.title === subj.name)) {
                  const keyPoints = mat.keyPoints || (mat.content ? mat.content.split('\n\n') : []);
                  const flashcards = mat.flashcards || [];
                  const mains = mat.mainsQuestions || [];
                  
                  combinedSets.unshift({
                    id: `rev-${subj.id}`,
                    title: subj.name,
                    summary: mat.summary || subj.description || `Comprehensive academic summary for ${subj.name}.`,
                    keyPoints: keyPoints,
                    mainsQuestions: mains,
                    mindmap: mat.mindmap || {
                      label: subj.name,
                      children: [
                        { label: "Core Principles", children: keyPoints.slice(0, 3).map(k => k.slice(0, 25)) },
                        { label: "Exam Essentials", children: keyPoints.slice(3, 6).map(k => k.slice(0, 25)) }
                      ]
                    },
                    cards: flashcards.length > 0 ? flashcards : keyPoints.map((kp, idx) => ({
                      id: `c-${idx}`,
                      front: `Key Concept #${idx + 1}: What is crucial to know about ${subj.name}?`,
                      back: kp,
                      hint: 'Review key evaluation criteria',
                      difficulty: 'medium',
                      tags: subj.name
                    }))
                  });
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
      setCoachTopic(combinedSets[0].title);
    } else {
      // Default clean starter revision deck
      const defaultDeck = {
        id: "rev-starter",
        title: "Introduction to Workspace Revision",
        summary: "LectureMind's Agentic Revision Hub synthesizes any textbook, syllabus, or lecture PDF into high-retention summary checkpoints, cognitive mind maps, and interactive diagnostic prompts.",
        keyPoints: [
          "Upload any course lecture or syllabus PDF in Lectures & Folder Manager.",
          "Gemini AI extracts layout, formulas, and critical concepts in seconds.",
          "Review section by section using summary cards, or test your recall with the AI Revision Coach.",
          "Generate instant timed quizzes, Socratic audio voice drills, and track your revision velocity."
        ],
        mindmap: {
          label: "Agentic Revision",
          children: [
            { label: "1. Intake", children: ["Upload PDF", "Text Ingestion", "OCR Layout"] },
            { label: "2. Synthesis", children: ["Key Points", "Concept Mind Map", "Flashcard Sets"] },
            { label: "3. Retention", children: ["AI Coach Evaluation", "SM-2 Spaced Recall", "Timed Simulator"] }
          ]
        },
        cards: [
          { front: "How do you start a new revision module?", back: "Upload any PDF in Folder Manager or paste your notes.", hint: "Simple 1-click upload", difficulty: "easy", tags: "Quickstart" }
        ],
        mainsQuestions: []
      };
      setSets([defaultDeck]);
      setActiveSet(defaultDeck);
      setCoachTopic(defaultDeck.title);
    }
  };

  const handleRunCoach = async (actionType = coachAction, customAnswer = studentAnswer) => {
    if (!activeSet) return;
    setIsCoachLoading(true);
    setCoachResponse('');

    try {
      const res = await fetch(`${API_URL}/api/nemotron/revision-coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          topic: activeSet.title,
          summary: activeSet.summary,
          keyPoints: activeSet.keyPoints,
          studentAnswer: customAnswer
        })
      });

      const data = await res.json();
      if (data.success && data.response) {
        setCoachResponse(data.response);
      } else {
        setCoachResponse("Could not generate response. Please ensure your backend is connected.");
      }
    } catch (err) {
      console.error('Coach error:', err);
      setCoachResponse("Coach service is temporarily unavailable. Check backend connection.");
    } finally {
      setIsCoachLoading(false);
    }
  };

  const handleGenerateSummaryDeck = async (e) => {
    e.preventDefault();
    if (!genTitle.trim() || !genText.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch(`${API_URL}/api/nemotron/parse-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: genTitle,
          text: genText
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        const parsed = data.data;
        const newDeck = {
          id: `rev-${Date.now()}`,
          title: genTitle,
          summary: parsed.summary,
          keyPoints: parsed.keyPoints || [],
          mindmap: parsed.mindmap,
          flashcards: parsed.flashcards || [],
          mainsQuestions: parsed.mainsQuestions || [],
          cards: (parsed.flashcards || []).map((f, i) => ({
            id: `c-${i}`,
            front: f.front,
            back: f.back,
            hint: f.hint || '',
            difficulty: f.difficulty || 'medium',
            tags: genTitle
          }))
        };

        const updated = [newDeck, ...sets];
        setSets(updated);
        setActiveSet(newDeck);
        setGenTitle('');
        setGenText('');
        if (onShowToast) onShowToast(`Generated Summary Revision Deck for "${genTitle}"`, 'success');
      }
    } catch (err) {
      console.error('Generate deck error:', err);
      if (onShowToast) onShowToast('Failed to generate summary deck', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAnswer = (idx) => {
    setExpandedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: Deck Selector & Generation (4 cols) */}
      <div className="lg:col-span-4 space-y-5">
        
        {/* Decks Catalog */}
        <div className="bg-card border border-rule rounded-xl p-5 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-rule mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet" />
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                Revision Modules
              </h4>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal/15 text-teal">
              {sets.length} Active
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {sets.map((s) => {
              const isSelected = activeSet?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSet(s);
                    setCoachTopic(s.title);
                    setCoachResponse('');
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-violet bg-violet/5 text-charcoal shadow-xs'
                      : 'border-rule bg-paper hover:bg-paper-deep text-charcoal-soft'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-charcoal truncate block max-w-[200px]">
                      {s.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-paper-deep text-charcoal-soft shrink-0">
                      {(s.keyPoints || []).length || (s.cards || []).length} Points
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-soft line-clamp-2 leading-relaxed">
                    {s.summary || 'Summary-wise rapid revision module'}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-rule text-center">
            <button
              onClick={() => { window.location.hash = '#/dashboard/subjects'; }}
              className="text-xs font-bold text-violet hover:text-violet-hover inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Upload new PDF in Folder Manager
            </button>
          </div>
        </div>

        {/* Quick Paste Generator */}
        <div className="bg-card border border-rule rounded-xl p-5 shadow-soft">
          <div className="flex items-center gap-2 pb-3 border-b border-rule mb-3">
            <Sparkles className="w-4 h-4 text-coral" />
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
              Quick Topic Ingestion
            </h4>
          </div>

          <form onSubmit={handleGenerateSummaryDeck} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">Topic Name</label>
              <input
                type="text"
                required
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
                placeholder="e.g. Compiler Design — Lexical Analysis"
                className="w-full px-3 py-2 bg-paper border border-rule rounded-lg text-xs text-charcoal focus:outline-none focus:border-violet"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">Paste Notes Excerpt</label>
              <textarea
                rows={3}
                required
                value={genText}
                onChange={(e) => setGenText(e.target.value)}
                placeholder="Paste key formulas, notes, or chapter text…"
                className="w-full p-2.5 bg-paper border border-rule rounded-lg text-xs text-charcoal focus:outline-none focus:border-violet resize-none leading-relaxed"
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-coral hover:bg-coral-hover disabled:opacity-50 transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Zap className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing with Gemini AI…</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Create Revision Deck</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* RIGHT COLUMN: Agentic Summary Revision Studio (8 cols) */}
      <div className="lg:col-span-8 space-y-4">
        
        {activeSet ? (
          <div className="bg-card border border-rule rounded-xl shadow-soft overflow-hidden">
            
            {/* Header & Mode Tabs */}
            <div className="p-5 border-b border-rule bg-paper-deep/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet block mb-0.5">
                  Summary Revision Module
                </span>
                <h3 className="text-base font-serif font-bold text-charcoal leading-tight">
                  {activeSet.title}
                </h3>
              </div>

              {/* Revision Tabs */}
              <div className="flex bg-paper p-1 rounded-lg border border-rule overflow-x-auto shrink-0">
                {[
                  { id: 'summary', label: '📑 Summary Points', icon: FileText },
                  { id: 'agent', label: '🤖 AI Revision Coach', icon: Sparkles },
                  { id: 'mindmap', label: '🧠 Concept Mind Map', icon: BrainCircuit },
                  { id: 'cards', label: '🗂️ Quick Drill', icon: RotateCcw }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-card text-charcoal shadow-xs border border-rule'
                        : 'text-charcoal-soft hover:text-charcoal'
                    }`}
                  >
                    <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-violet' : 'text-charcoal-soft'}`} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT BODY */}
            <div className="p-5 sm:p-6 overflow-y-auto max-h-[640px]">
              
              {/* TAB 1: SUMMARY-WISE SYSTEMATIC REVISION */}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  
                  {/* Executive Summary Box */}
                  <div className="p-4 rounded-xl bg-violet/5 border border-violet/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> 30-Second Rapid Digest
                      </span>
                      <span className="text-[10px] font-mono font-bold text-violet">
                        High Retention Synthesis
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-charcoal leading-relaxed font-sans">
                      {activeSet.summary || 'Summary extracted from uploaded material.'}
                    </p>
                  </div>

                  {/* Key Revision Points Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-rule">
                      <span className="font-bold text-charcoal uppercase tracking-wider font-mono">
                        Key Concept Checkpoints & Exam Essentials
                      </span>
                      <span className="text-[11px] text-charcoal-soft">
                        {(activeSet.keyPoints || []).length} Points Extracted
                      </span>
                    </div>

                    {(activeSet.keyPoints || []).map((point, idx) => (
                      <div 
                        key={idx}
                        className="bg-paper-deep/70 border border-rule rounded-xl p-4 space-y-3 hover:border-violet/40 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-violet text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-charcoal font-medium leading-relaxed">
                              {point}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Agentic Action Bar for this point */}
                        <div className="pt-2 border-t border-rule/50 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setActiveTab('agent');
                                setCoachAction('drill');
                                handleRunCoach('drill');
                              }}
                              className="px-2.5 py-1 rounded bg-card hover:bg-paper border border-rule text-[11px] font-semibold text-charcoal flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <Zap className="w-3 h-3 text-coral" /> Quiz Me
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab('agent');
                                setCoachAction('mistakes');
                                handleRunCoach('mistakes');
                              }}
                              className="px-2.5 py-1 rounded bg-card hover:bg-paper border border-rule text-[11px] font-semibold text-charcoal flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <AlertTriangle className="w-3 h-3 text-[#977319]" /> Common Exam Traps
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab('agent');
                                setCoachAction('mnemonic');
                                handleRunCoach('mnemonic');
                              }}
                              className="px-2.5 py-1 rounded bg-card hover:bg-paper border border-rule text-[11px] font-semibold text-charcoal flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <Lightbulb className="w-3 h-3 text-teal" /> Mnemonic
                            </button>
                          </div>

                          <span className="text-[10px] font-mono text-charcoal-soft">
                            Point #{idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mains Exam Practice Questions */}
                  {activeSet.mainsQuestions && activeSet.mainsQuestions.length > 0 && (
                    <div className="space-y-3 pt-3">
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-rule">
                        <span className="font-bold text-charcoal uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-coral" /> Comprehensive Exam Questions & Model Scoring
                        </span>
                      </div>

                      {activeSet.mainsQuestions.map((mq, mIdx) => (
                        <div key={mIdx} className="p-4 rounded-xl bg-card border border-rule space-y-2.5 shadow-xs">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-serif font-bold text-charcoal leading-snug">
                              Q{mIdx + 1}. {mq.question}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-coral/15 text-coral shrink-0">
                              {mq.type || '10 Marks'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => toggleAnswer(mIdx)}
                              className="text-xs font-bold text-violet hover:text-violet-hover flex items-center gap-1"
                            >
                              {expandedAnswers[mIdx] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{expandedAnswers[mIdx] ? 'Hide Model Answer' : 'Reveal Model Answer & Rubric'}</span>
                            </button>
                          </div>

                          {expandedAnswers[mIdx] && (
                            <div className="pt-3 border-t border-rule space-y-2 animate-in fade-in">
                              {mq.keyEvaluationPoints && (
                                <div className="text-[11px] bg-paper-deep p-2.5 rounded border border-rule">
                                  <span className="font-bold text-charcoal block mb-1">Key Evaluation Points:</span>
                                  <ul className="list-disc list-inside space-y-0.5 text-charcoal-soft">
                                    {mq.keyEvaluationPoints.map((pt, pIdx) => (
                                      <li key={pIdx}>{pt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <p className="text-xs text-charcoal whitespace-pre-line leading-relaxed bg-paper p-3 rounded border border-rule">
                                {mq.modelAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: AGENTIC REVISION COACH (Interactive AI Assistant) */}
              {activeTab === 'agent' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-card border border-rule space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal flex items-center gap-2 font-mono">
                        <Sparkles className="w-4 h-4 text-violet" />
                        Gemini Agentic Revision Coach
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal/15 text-teal">
                        Active on: {activeSet.title}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-soft leading-relaxed">
                      Select a coaching action below. Your AI coach will probe your conceptual understanding, highlight traps where students lose marks, or grade your revision answers.
                    </p>

                    {/* Action Selector Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {[
                        { id: 'drill', label: '🎯 Drill Question', desc: 'Test deep concepts' },
                        { id: 'mistakes', label: '⚠️ Exam Traps', desc: 'Common pitfalls' },
                        { id: 'mnemonic', label: '💡 Mnemonic', desc: 'Memory aid' },
                        { id: 'evaluate', label: '✍️ Grade My Answer', desc: 'Score out of 10' }
                      ].map((act) => (
                        <button
                          key={act.id}
                          onClick={() => {
                            setCoachAction(act.id);
                            if (act.id !== 'evaluate') handleRunCoach(act.id);
                          }}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            coachAction === act.id
                              ? 'border-violet bg-violet/10 text-charcoal shadow-xs'
                              : 'border-rule bg-paper hover:bg-paper-deep text-charcoal-soft'
                          }`}
                        >
                          <span className="text-xs font-bold block">{act.label}</span>
                          <span className="text-[10px] text-charcoal-soft block">{act.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Student Answer Input (for evaluate action) */}
                  {coachAction === 'evaluate' && (
                    <div className="p-4 rounded-xl bg-paper-deep border border-rule space-y-2.5">
                      <label className="block text-xs font-bold text-charcoal">
                        Type Your Answer / Revision Recall:
                      </label>
                      <textarea
                        rows={3}
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        placeholder="Write your explanation in your own words. The coach will evaluate keywords, completeness, and give you a score out of 10…"
                        className="w-full p-3 bg-card border border-rule rounded-lg text-xs text-charcoal focus:outline-none focus:border-violet resize-none leading-relaxed"
                      />
                      <button
                        onClick={() => handleRunCoach('evaluate', studentAnswer)}
                        disabled={isCoachLoading || !studentAnswer.trim()}
                        className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-violet hover:bg-violet-hover disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit for Evaluation
                      </button>
                    </div>
                  )}

                  {/* Coach Response Display */}
                  {isCoachLoading ? (
                    <div className="p-8 rounded-xl bg-paper border border-rule text-center space-y-2">
                      <Sparkles className="w-6 h-6 text-violet animate-spin mx-auto" />
                      <span className="text-xs font-bold text-charcoal block">
                        Gemini AI is analyzing revision concepts…
                      </span>
                    </div>
                  ) : coachResponse ? (
                    <div className="p-5 rounded-xl bg-paper border border-violet/40 space-y-3 shadow-soft animate-in fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-rule">
                        <span className="text-xs font-bold text-violet font-mono uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-teal" /> Coach Guidance & Insights
                        </span>
                        <button
                          onClick={() => handleRunCoach(coachAction)}
                          className="text-[11px] text-charcoal-soft hover:text-charcoal flex items-center gap-1 font-mono"
                        >
                          <RotateCcw className="w-3 h-3" /> Refresh
                        </button>
                      </div>
                      <div className="text-xs sm:text-sm text-charcoal leading-relaxed whitespace-pre-wrap font-sans">
                        {coachResponse}
                      </div>
                    </div>
                  ) : null}

                </div>
              )}

              {/* TAB 3: CONCEPT MIND MAP */}
              {activeTab === 'mindmap' && (
                <div className="space-y-4">
                  <div className="border-b border-rule pb-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-charcoal uppercase tracking-wider font-mono">
                      Cognitive Concept Hierarchy
                    </span>
                    <span className="text-[11px] text-charcoal-soft font-mono">
                      Central Root → Core Branches → Subtopics
                    </span>
                  </div>

                  <div className="p-4 bg-paper border border-rule rounded-xl overflow-x-auto shadow-inner">
                    <div className="min-w-[500px]">
                      {/* Central Root */}
                      <div className="flex justify-center mb-6">
                        <div className="px-6 py-3 rounded-2xl bg-violet text-white text-xs font-bold shadow-soft flex items-center gap-2 border border-violet-hover">
                          <BrainCircuit className="w-4 h-4" />
                          <span>{activeSet.mindmap?.label || activeSet.title}</span>
                        </div>
                      </div>

                      {/* Main Branches */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {(activeSet.mindmap?.children || []).map((branch, bIdx) => (
                          <div key={bIdx} className="bg-card border border-rule rounded-xl p-4 space-y-2 shadow-xs">
                            <div className="border-b border-rule pb-1.5 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-coral" />
                              <span className="text-xs font-bold text-charcoal">{branch.label}</span>
                            </div>
                            <div className="space-y-1.5">
                              {(branch.children || []).map((child, cIdx) => (
                                <div key={cIdx} className="text-[11px] p-2 rounded-md bg-paper-deep text-charcoal border border-rule/50 flex items-center gap-1.5">
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

              {/* TAB 4: QUICK DRILL CARDS (Optional for speed reviews) */}
              {activeTab === 'cards' && (
                <div className="flex flex-col items-center justify-between min-h-[340px] space-y-4">
                  
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="font-mono text-charcoal-soft font-bold">
                      CHECKPOINT {currentCardIndex + 1} OF {(activeSet.cards || []).length}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-coral/15 text-coral font-bold text-[10px] uppercase">
                      Recall Check
                    </span>
                  </div>

                  {(activeSet.cards || []).length > 0 ? (
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="w-full max-w-lg h-56 perspective-1000 cursor-pointer select-none"
                    >
                      <div className={`relative w-full h-full duration-300 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        
                        {/* Front */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl border border-rule bg-paper p-6 shadow-soft flex flex-col justify-between backface-hidden">
                          <span className="text-[10px] font-bold text-violet uppercase tracking-widest font-mono flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" /> REVISION CHECKPOINT
                          </span>
                          <p className="text-sm font-serif font-bold text-charcoal text-center px-4 leading-relaxed">
                            {activeSet.cards[currentCardIndex]?.front}
                          </p>
                          <div className="flex justify-between text-[11px] text-charcoal-soft font-mono">
                            <span>Hint: {activeSet.cards[currentCardIndex]?.hint || 'Think key definition'}</span>
                            <span className="text-violet font-semibold">Click to reveal answer ↻</span>
                          </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl border border-teal/40 bg-paper-deep p-6 shadow-soft flex flex-col justify-between backface-hidden rotate-y-180">
                          <span className="text-[10px] font-bold text-teal uppercase tracking-widest font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> KEY EXPLANATION
                          </span>
                          <p className="text-xs sm:text-sm font-medium text-charcoal text-center px-4 leading-relaxed">
                            {activeSet.cards[currentCardIndex]?.back}
                          </p>
                          <div className="text-center text-[11px] text-charcoal-soft font-mono">
                            Click to flip back
                          </div>
                        </div>

                      </div>
                    </div>
                  ) : null}

                  {/* Navigation */}
                  <div className="w-full flex items-center justify-between pt-4 border-t border-rule">
                    <button
                      onClick={() => {
                        if (currentCardIndex > 0) {
                          setCurrentCardIndex(c => c - 1);
                          setIsFlipped(false);
                        }
                      }}
                      disabled={currentCardIndex === 0}
                      className="px-3.5 py-1.5 rounded-lg border border-rule text-xs font-bold text-charcoal hover:bg-paper-deep disabled:opacity-30 transition-all"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-charcoal-soft">
                      Tap card to reveal answer
                    </span>
                    <button
                      onClick={() => {
                        if (currentCardIndex < (activeSet.cards || []).length - 1) {
                          setCurrentCardIndex(c => c + 1);
                          setIsFlipped(false);
                        }
                      }}
                      disabled={currentCardIndex === (activeSet.cards || []).length - 1}
                      className="px-3.5 py-1.5 rounded-lg border border-rule text-xs font-bold text-charcoal hover:bg-paper-deep disabled:opacity-30 transition-all"
                    >
                      Next
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="bg-card border border-rule rounded-xl p-16 text-center shadow-soft space-y-3">
            <Brain className="w-10 h-10 text-violet mx-auto" />
            <h4 className="text-base font-bold font-serif text-charcoal">Select a Revision Module</h4>
            <p className="text-xs text-charcoal-soft max-w-sm mx-auto leading-relaxed">
              Choose an ingested course on the left to review its summary checkpoints, cognitive mind map, and AI revision coach!
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
