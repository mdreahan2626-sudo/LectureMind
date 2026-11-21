import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import SubjectExplorer from './SubjectExplorer';
import FlashcardHub from './FlashcardHub';
import AnalyticsPanel from './AnalyticsPanel';
import VoiceTutor from './VoiceTutor';
import ExamSimulator from './ExamSimulator';
import WeeklyPageTurnModal from './WeeklyPageTurnModal';
import { 
  Flame, 
  Clock, 
  Calendar, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  BookOpen, 
  BookMarked,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Brain,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  Mic,
  Timer,
  Layers,
  BookOpenCheck
} from 'lucide-react';

export default function Dashboard({ currentUser, onBackToHome, onShowToast }) {
  const [isWeeklyPageTurnOpen, setIsWeeklyPageTurnOpen] = useState(false);
  // Today's Study Plan interactive tasks state
  const [tasks, setTasks] = useState([
    { id: 1, text: "Review Quantum Mechanics probability density notes", completed: false, category: "Physics" },
    { id: 2, text: "Practice 12 due flashcards for Deep Learning", completed: true, category: "AI" },
    { id: 3, text: "Complete Macroeconomics Quiz 2 on Monetary Policy", completed: false, category: "Economics" },
    { id: 4, text: "Listen to Neural Architecture lecture segment", completed: false, category: "AI" }
  ]);

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('General');

  // Load user's saved daily plan tasks on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('lecturemind_user_tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {}
    }
  }, []);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('lecturemind_user_tasks', JSON.stringify(newTasks));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const item = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      category: newTaskCategory
    };
    saveTasks([item, ...tasks]);
    setNewTaskText('');
    if (onShowToast) onShowToast('Task added to today’s study plan', 'success');
  };

  const handleDeleteTask = (id, e) => {
    e.stopPropagation();
    saveTasks(tasks.filter(t => t.id !== id));
    if (onShowToast) onShowToast('Task removed', 'info');
  };

  // Study Stats States
  const [studiedToday, setStudiedToday] = useState(2.4);
  const [weeklyHours, setWeeklyHours] = useState(14.5);
  const [weeklyGoal, setWeeklyGoal] = useState(20.0);

  // Stats Controls States
  const [isLoggingTime, setIsLoggingTime] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [logAmount, setLogAmount] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const getPanelFromHash = () => {
    const hash = window.location.hash;
    if (hash.includes('/dashboard/subjects')) return 'explorer';
    if (hash.includes('/dashboard/flashcards')) return 'flashcards';
    if (hash.includes('/dashboard/analytics')) return 'analytics';
    if (hash.includes('/dashboard/exam')) return 'exam';
    if (hash.includes('/dashboard/voice')) return 'voice';
    return 'metrics';
  };

  const [activePanel, setActivePanel] = useState(getPanelFromHash());

  useEffect(() => {
    const handleHash = () => {
      setActivePanel(getPanelFromHash());
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Fetch stats from DB on load or fall back to localStorage
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/user/stats`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setStudiedToday(data.stats.studiedToday);
            setWeeklyHours(data.stats.weeklyHours);
            setWeeklyGoal(data.stats.weeklyGoal);
            return;
          }
        } catch (err) {
          console.error("Failed to load DB stats:", err.message);
        }
      }
      loadFallbackLocalStats();
    };

    fetchStats();
  }, []);

  const loadFallbackLocalStats = () => {
    const local = localStorage.getItem('lecturemind_guest_stats');
    if (local) {
      const parsed = JSON.parse(local);
      setStudiedToday(parsed.studiedToday || 2.4);
      setWeeklyHours(parsed.weeklyHours || 14.5);
      setWeeklyGoal(parsed.weeklyGoal || 20.0);
    } else {
      setStudiedToday(2.4);
      setWeeklyHours(14.5);
      setWeeklyGoal(20.0);
      saveLocalStats(2.4, 14.5, 20.0);
    }
  };

  const saveLocalStats = (today, week, goal) => {
    localStorage.setItem('lecturemind_guest_stats', JSON.stringify({
      studiedToday: today,
      weeklyHours: week,
      weeklyGoal: goal
    }));
  };

  const handleLogTime = async (e) => {
    e.preventDefault();
    const hours = parseFloat(logAmount);
    if (isNaN(hours) || hours <= 0) return;

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/user/stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ loggedHours: hours })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStudiedToday(data.stats.studiedToday);
          setWeeklyHours(data.stats.weeklyHours);
          setLogAmount('');
          setIsLoggingTime(false);
          if (onShowToast) onShowToast(`Logged ${hours} hours successfully!`, 'success');
          return;
        }
      } catch (err) {
        console.error("Failed to post stats:", err.message);
      }
    }

    const updatedToday = studiedToday + hours;
    const updatedWeek = weeklyHours + hours;
    setStudiedToday(updatedToday);
    setWeeklyHours(updatedWeek);
    saveLocalStats(updatedToday, updatedWeek, weeklyGoal);
    setLogAmount('');
    setIsLoggingTime(false);
    if (onShowToast) onShowToast(`Logged ${hours} hours (saved locally)`, 'success');
  };

  const handleSetGoal = async (e) => {
    e.preventDefault();
    const goal = parseFloat(newGoal);
    if (isNaN(goal) || goal <= 0) return;

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/user/stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ weeklyGoal: goal })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setWeeklyGoal(data.stats.weeklyGoal);
          setNewGoal('');
          setIsEditingGoal(false);
          if (onShowToast) onShowToast(`Goal updated to ${goal} hours/week`, 'success');
          return;
        }
      } catch (err) {
        console.error("Failed to set weekly goal:", err.message);
      }
    }

    setWeeklyGoal(goal);
    saveLocalStats(studiedToday, weeklyHours, goal);
    setNewGoal('');
    setIsEditingGoal(false);
    if (onShowToast) onShowToast(`Goal updated to ${goal} hours/week`, 'success');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Dynamic user subjects & topics from user's uploads
  const storedSubjects = (() => {
    try {
      const raw = localStorage.getItem('lecturemind_guest_subjects');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const latestTopic = localStorage.getItem('lecturemind_latest_topic') || (storedSubjects[0]?.name) || null;

  const upcomingExams = storedSubjects.length > 0
    ? storedSubjects.slice(0, 3).map((s, idx) => ({
        id: idx + 1,
        title: `${s.name} Assessment`,
        date: "Upcoming Review",
        daysLeft: (idx + 1) * 3,
        course: s.name
      }))
    : [
        { id: 1, title: "Upload your first PDF to generate exams", date: "Ready", daysLeft: 0, course: "Workspace" }
      ];

  const subjectsProgress = storedSubjects.length > 0
    ? storedSubjects.slice(0, 4).map((s, idx) => ({
        name: s.name,
        progress: 70 + ((idx * 13) % 25),
        hours: `${((idx + 1) * 2.8).toFixed(1)} hrs`
      }))
    : [];

  const weakTopics = storedSubjects.length > 0
    ? storedSubjects.slice(0, 3).map((s, idx) => ({
        topic: `${s.name} — Core Concepts & Formulations`,
        accuracy: `${45 + idx * 12}%`,
        status: idx === 0 ? "critical" : "review",
        subject: s.name
      }))
    : [
        { topic: "Drop any textbook PDF in Lectures to begin", accuracy: "100%", status: "review", subject: "Workspace" }
      ];

  const revisionSchedule = storedSubjects.length > 0
    ? storedSubjects.slice(0, 3).map((s, idx) => ({
        time: idx === 0 ? "10:30 AM" : idx === 1 ? "02:00 PM" : "05:30 PM",
        topic: `Review key points for ${s.name}`,
        interval: `Spaced Repetition #${idx + 1}`
      }))
    : [
        { time: "Today", topic: "Upload your first study document", interval: "Initial Intake" }
      ];

  const leaderboard = [
    { rank: 1, name: "Aarav Mehta", score: 9840, isCurrentUser: false },
    { rank: 2, name: "Sarah Connor", score: 9510, isCurrentUser: false },
    { rank: 3, name: "Marcus Aurelius", score: 9200, isCurrentUser: false },
    { rank: 4, name: currentUser ? currentUser.email.split('@')[0] : "You (Guest)", score: 8840, isCurrentUser: true },
    { rank: 5, name: "Elena Rostova", score: 8610, isCurrentUser: false }
  ];

  return (
    <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-8 relative">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-soft hover:text-charcoal transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Homepage
          </button>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-charcoal tracking-tight">
            Study Console
          </h2>
          <p className="text-sm text-charcoal-soft mt-1">
            Answer within seconds: what you learned, what to study now, and what needs review.
          </p>
        </div>

        {/* Right Tools & Consistency Badge */}
        <div className="flex items-center gap-3">
          {/* Weekly Page Turn Button */}
          <button
            onClick={() => setIsWeeklyPageTurnOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-card hover:bg-paper-deep border border-rule shadow-soft transition-all text-xs font-semibold text-charcoal group"
          >
            <BookOpenCheck className="w-4 h-4 text-violet group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Weekly Page</span>
            <span className="font-handwriting text-sm text-violet transform -rotate-2">
              turn page ➔
            </span>
          </button>

          {/* Teal Progress Consistency Badge */}
          <div className="flex items-center gap-3 bg-card border border-rule px-4 py-2 rounded-full shadow-soft">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-soft text-teal border border-teal/20">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-teal uppercase tracking-wider block font-mono font-bold">Progress</span>
                <span className="font-handwriting text-xs text-teal">you've got this!</span>
              </div>
              <span className="text-xs font-bold text-charcoal">7 Days Consistency</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUGGESTED NEXT STEP BANNER (High-priority Violet Focus Card) */}
      <div className="mb-8 p-5 rounded-lg bg-violet-soft/80 border-2 border-violet/35 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-full bg-violet text-white shrink-0 shadow-soft">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-violet font-mono block">
                Suggested Next Step
              </span>
              <span className="font-handwriting text-xs text-violet font-bold">
                highest recall impact
              </span>
            </div>
            <p className="text-sm font-semibold text-charcoal mt-0.5">
              {latestTopic ? (
                <>
                  <strong>{latestTopic}</strong> is due for SM-2 review — estimated 4 minutes.
                </>
              ) : (
                <>
                  <strong>Upload your first lecture PDF</strong> to extract key points, mind maps, and flashcards.
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { window.location.hash = latestTopic ? '#/dashboard/flashcards' : '#/dashboard/subjects'; }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet hover:bg-violet-hover text-white text-xs font-bold transition-all shadow-soft hover:shadow-hover hover:scale-[1.02]"
          >
            {latestTopic ? 'Review Now' : 'Upload Material'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PANEL TOGGLE NAVIGATION TABS (Enclosed in a crisp bordered capsule bar) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-paper-deep/80 border border-rule overflow-x-auto mb-8 shadow-sm">
        {[
          { id: 'metrics', label: 'Study Metrics Room', hash: '#/dashboard/metrics', icon: BookMarked, ink: 'charcoal' },
          { id: 'explorer', label: 'Lectures & Folder Manager', hash: '#/dashboard/subjects', icon: Layers, ink: 'violet' },
          { id: 'flashcards', label: 'SM-2 Flashcard Hub', hash: '#/dashboard/flashcards', icon: Brain, ink: 'violet' },
          { id: 'exam', label: 'Timed Exam Simulator', hash: '#/dashboard/exam', icon: Timer, ink: 'coral' },
          { id: 'voice', label: 'Voice Socratic Tutor', hash: '#/dashboard/voice', icon: Mic, ink: 'violet' },
          { id: 'analytics', label: 'Progress Analytics', hash: '#/dashboard/analytics', icon: TrendingUp, ink: 'teal' },
        ].map((tab) => {
          const isActive = activePanel === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { window.location.hash = tab.hash; }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-card text-charcoal border-rule/80 shadow-soft'
                  : 'text-charcoal-soft border-transparent hover:bg-card/60 hover:text-charcoal hover:border-rule/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${
                isActive ? (
                  tab.ink === 'violet' ? 'text-violet' :
                  tab.ink === 'coral' ? 'text-coral' :
                  tab.ink === 'teal' ? 'text-teal' : 'text-charcoal'
                ) : 'text-charcoal-soft'
              }`} />
              {tab.label}
              {isActive && (
                <span className={`w-1.5 h-1.5 rounded-full ${
                  tab.ink === 'violet' ? 'bg-violet' :
                  tab.ink === 'coral' ? 'bg-coral' :
                  tab.ink === 'teal' ? 'bg-teal' : 'bg-charcoal'
                }`}></span>
              )}
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE PANEL */}
      {activePanel === 'metrics' ? (
        <>
          {/* TOP ROW STATS (4 Differentiated Ink Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            
            {/* Stat 1: Time Studied Today (Coral Urgency/Streak Ink) */}
            <div className="bg-card border border-card-border rounded-md p-5 shadow-soft flex flex-col justify-between min-h-[145px] metric-stripe-coral relative">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] text-charcoal-soft uppercase tracking-wider font-bold font-mono">Studied Today</span>
                  <div className="p-1.5 rounded-full bg-coral-soft text-coral">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-display text-charcoal tabular-nums">{studiedToday.toFixed(1)}</span>
                  <span className="text-xs text-charcoal-soft">hours</span>
                  
                  {/* Micro Coral Sparkline */}
                  <svg className="w-14 h-5 ml-auto text-coral" viewBox="0 0 50 20">
                    <polyline fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" points="0,15 10,12 20,16 30,8 40,11 50,4" />
                  </svg>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-rule/60">
                {!isLoggingTime ? (
                  <button 
                    onClick={() => setIsLoggingTime(true)}
                    className="text-xs font-bold text-coral hover:text-coral-hover p-0 transition-colors flex items-center gap-1"
                  >
                    + Log study session
                  </button>
                ) : (
                  <form onSubmit={handleLogTime} className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0.1"
                      required
                      value={logAmount}
                      onChange={(e) => setLogAmount(e.target.value)}
                      placeholder="Hrs"
                      className="w-16 px-2 py-1 text-xs rounded-sm bg-paper-deep border border-rule text-charcoal focus-ring"
                    />
                    <button type="submit" className="px-2.5 py-1 bg-coral text-white text-xs font-bold rounded-sm">Log</button>
                    <button type="button" onClick={() => setIsLoggingTime(false)} className="px-1.5 py-1 text-charcoal-soft hover:text-charcoal text-xs">✕</button>
                  </form>
                )}
              </div>
            </div>

            {/* Stat 2: Weekly Hours & Goal (Teal Progress/Completion Ink) */}
            <div className="bg-card border border-card-border rounded-md p-5 shadow-soft flex flex-col justify-between min-h-[145px] metric-stripe-teal relative">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] text-charcoal-soft uppercase tracking-wider font-bold font-mono">Weekly Hours</span>
                  <div className="p-1.5 rounded-full bg-teal-soft text-teal">
                    <BookMarked className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold font-display text-charcoal tabular-nums">{weeklyHours.toFixed(1)}</span>
                  <span className="text-xs text-charcoal-soft">/ {weeklyGoal} hrs</span>
                </div>
                <div className="w-full bg-paper-deep rounded-full h-2 mt-2 overflow-hidden border border-rule/50">
                  <div 
                    className="bg-teal h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (weeklyHours / weeklyGoal) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-rule/60">
                {!isEditingGoal ? (
                  <button 
                    onClick={() => setIsEditingGoal(true)}
                    className="text-xs font-bold text-teal hover:text-teal-hover p-0 transition-colors flex items-center gap-1"
                  >
                    Adjust weekly target
                  </button>
                ) : (
                  <form onSubmit={handleSetGoal} className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      step="1" 
                      min="1"
                      required
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Goal"
                      className="w-16 px-2 py-1 text-xs rounded-sm bg-paper-deep border border-rule text-charcoal focus-ring"
                    />
                    <button type="submit" className="px-2.5 py-1 bg-teal text-white text-xs font-bold rounded-sm">Set</button>
                    <button type="button" onClick={() => setIsEditingGoal(false)} className="px-1.5 py-1 text-charcoal-soft hover:text-charcoal text-xs">✕</button>
                  </form>
                )}
              </div>
            </div>

            {/* Stat 3: Flashcards Due (Violet Recall/AI Ink) */}
            <div className="bg-card border border-card-border rounded-md p-5 shadow-soft flex flex-col justify-between min-h-[145px] metric-stripe-violet relative">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] text-charcoal-soft uppercase tracking-wider font-bold font-mono">Flashcards Due</span>
                  <div className="p-1.5 rounded-full bg-violet-soft text-violet">
                    <Brain className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold font-display text-charcoal tabular-nums">12</span>
                  <span className="text-xs text-charcoal-soft">cards queued</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-rule/60 text-[11px] text-charcoal-soft flex items-center justify-between">
                <span>SM-2 Interval Recall</span>
                <span className="font-bold text-violet bg-violet-soft px-2 py-0.5 rounded-full">4 priority</span>
              </div>
            </div>

            {/* Stat 4: Leaderboard Standings (Gold Achievement Ink) */}
            <div className="bg-card border border-card-border rounded-md p-5 shadow-soft flex flex-col justify-between min-h-[145px] metric-stripe-gold relative">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] text-charcoal-soft uppercase tracking-wider font-bold font-mono">Study Standing</span>
                  <div className="p-1.5 rounded-full bg-gold-soft text-[#9A7412]">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold font-display text-charcoal tabular-nums">#4</span>
                  <span className="text-xs text-charcoal-soft">cohort rank</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-rule/60 text-[11px] text-charcoal-soft flex items-center justify-between">
                <span>Score: <strong className="text-charcoal font-bold">8,840 XP</strong></span>
                <span className="font-bold text-[#8A6A10] bg-gold-soft px-2 py-0.5 rounded-full">Top 4%</span>
              </div>
            </div>

          </div>

          {/* TWO-COLUMN CONSOLE GRID (32px-40px vertical rhythm) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
            
            {/* LEFT COLUMN: Today's Study Plan + Subjects Progress + Weak Concepts (6 cols) */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Card 1: Today's Study Plan (Teal Progress & Violet Checkmarks) */}
              <div className="bg-card border border-card-border rounded-lg p-6 sm:p-7 shadow-soft">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold font-display text-charcoal flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal" />
                      Today's Study Plan
                    </h3>
                    <span className="text-xs text-charcoal-soft">Active recall daily checklist</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-soft text-teal border border-teal/20">
                    {progressPercent}% Complete
                  </span>
                </div>

                {/* Teal Progress Bar */}
                <div className="w-full bg-paper-deep rounded-full h-2 mb-5 overflow-hidden border border-rule/60">
                  <div 
                    className="bg-teal h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Add Custom Task Form */}
                <form onSubmit={handleAddTask} className="flex gap-2 mb-5">
                  <input 
                    type="text" 
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Add a custom study task for today…"
                    className="flex-1 px-3.5 py-2 bg-paper-deep border border-rule rounded-md text-xs text-charcoal focus-ring"
                  />
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="px-3 py-2 bg-paper-deep border border-rule rounded-md text-xs text-charcoal-soft focus-ring"
                  >
                    <option value="General">General</option>
                    <option value="AI">AI</option>
                    <option value="Physics">Physics</option>
                    <option value="Economics">Economics</option>
                  </select>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-charcoal hover:bg-coral text-paper text-xs font-bold rounded-md transition-colors flex items-center gap-1 shadow-soft"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </form>

                {/* Task Checklist Items */}
                <div className="space-y-2.5 mb-2 max-h-72 overflow-y-auto pr-1">
                  {tasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`flex items-center gap-3.5 p-3 rounded-md border text-left transition-all cursor-pointer ${
                        task.completed 
                          ? 'bg-paper-deep/60 border-rule/70 text-charcoal-soft' 
                          : 'bg-card border-card-border text-charcoal hover:bg-paper-deep/40 hover:border-violet/40 shadow-soft'
                      }`}
                    >
                      {/* Custom Checkbox (Filled Violet when completed) */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        task.completed 
                          ? 'bg-violet border-violet text-white shadow-sm' 
                          : 'border-rule bg-card hover:border-violet'
                      }`}>
                        {task.completed && <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-snug truncate ${task.completed ? 'line-through opacity-70' : ''}`}>
                          {task.text}
                        </p>
                        <span className="text-[9px] uppercase font-mono text-charcoal-soft font-bold">{task.category}</span>
                      </div>

                      {task.completed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-soft text-teal shrink-0">
                          done ✓
                        </span>
                      )}

                      <button
                        onClick={(e) => handleDeleteTask(task.id, e)}
                        className="text-charcoal-soft hover:text-coral p-1 transition-colors"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-center py-4 text-xs text-charcoal-soft">Nothing due today. Add a study item above!</p>
                  )}
                </div>
              </div>

              {/* Card 2: Subjects Syllabus Progress */}
              <div className="bg-card border border-card-border rounded-lg p-6 sm:p-7 shadow-soft">
                <h3 className="text-lg font-bold font-display text-charcoal flex items-center gap-2 mb-1">
                  <BookOpen className="w-5 h-5 text-violet" />
                  Subjects Syllabus Progress
                </h3>
                <p className="text-xs text-charcoal-soft mb-5">Course content comprehension metrics.</p>

                <div className="space-y-4">
                  {subjectsProgress.map((sub, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-charcoal truncate max-w-[280px]">{sub.name}</span>
                        <span className="font-mono text-charcoal-soft font-semibold tabular-nums">{sub.progress}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-paper-deep rounded-full h-2 overflow-hidden border border-rule/60">
                          <div 
                            className={`h-full rounded-full ${
                              idx === 0 ? 'bg-violet' : idx === 1 ? 'bg-teal' : 'bg-gold'
                            }`}
                            style={{ width: `${sub.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-charcoal-soft font-mono shrink-0">{sub.hours}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Concepts Requiring Attention (Coral Warning) */}
              <div className="bg-card border border-card-border rounded-lg p-6 sm:p-7 shadow-soft">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-bold font-display text-charcoal flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-coral" />
                    Concepts Requiring Attention
                  </h3>
                  <span className="font-handwriting text-xs text-coral font-bold">needs drill</span>
                </div>
                <p className="text-xs text-charcoal-soft mb-5">Identified via diagnostic quiz accuracy.</p>

                <div className="space-y-3">
                  {weakTopics.map((wt, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-md border border-coral/25 bg-coral-soft/50 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-coral uppercase font-mono block mb-0.5">
                          {wt.subject} · {wt.accuracy} Accuracy
                        </span>
                        <p className="text-xs font-semibold text-charcoal leading-snug truncate">
                          {wt.topic}
                        </p>
                      </div>
                      <button
                        onClick={() => window.location.hash = '#/dashboard/flashcards'}
                        className="text-xs font-bold text-coral hover:underline shrink-0 bg-card px-3 py-1 rounded border border-coral/30"
                      >
                        Practice
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Upcoming Exam Deadlines + Revision Schedule + Leaderboard (6 cols) */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Card 4: Upcoming Exam Deadlines (Coral Urgency & Prep Progress Bars) */}
              <div className="bg-card border border-card-border rounded-lg p-6 sm:p-7 shadow-soft">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-bold font-display text-charcoal flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-coral" />
                    Upcoming Exam Deadlines
                  </h3>
                  <span className="text-xs font-bold text-coral bg-coral-soft px-2.5 py-0.5 rounded-full font-mono">
                    Countdown
                  </span>
                </div>
                <p className="text-xs text-charcoal-soft mb-5">Target preparation timelines & elapsed study time.</p>

                <div className="space-y-4">
                  {upcomingExams.map(exam => {
                    const elapsedPercent = exam.daysLeft <= 6 ? 78 : exam.daysLeft <= 9 ? 62 : 45;
                    return (
                      <div 
                        key={exam.id}
                        className="p-4 rounded-md bg-paper-deep border border-rule space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase font-bold ${
                              exam.course === 'Physics' ? 'bg-violet-soft text-violet border-violet/20' :
                              exam.course === 'AI' ? 'bg-coral-soft text-coral border-coral/20' :
                              'bg-gold-soft text-[#9A7412] border-gold/20'
                            }`}>
                              {exam.course}
                            </span>
                            <h4 className="text-xs font-bold text-charcoal mt-1 truncate">{exam.title}</h4>
                            <span className="text-[11px] text-charcoal-soft">{exam.date}</span>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className={`block text-xl font-bold font-display tabular-nums ${exam.daysLeft <= 7 ? 'text-coral' : 'text-charcoal'}`}>
                              {exam.daysLeft}d
                            </span>
                            <span className="text-[10px] text-charcoal-soft uppercase font-mono">remaining</span>
                          </div>
                        </div>

                        {/* Prep-Time Progress Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] text-charcoal-soft font-mono">
                            <span>Prep Velocity</span>
                            <span>{elapsedPercent}% elapsed</span>
                          </div>
                          <div className="w-full bg-card rounded-full h-1.5 overflow-hidden border border-rule/60">
                            <div 
                              className={`h-full rounded-full ${exam.daysLeft <= 7 ? 'bg-coral' : 'bg-violet'}`}
                              style={{ width: `${elapsedPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 5: Spaced Repetition Revision Schedule (Teal Timeline) */}
              <div className="bg-card border border-card-border rounded-lg p-6 sm:p-7 shadow-soft">
                <h3 className="text-lg font-bold font-display text-charcoal flex items-center gap-2 mb-1">
                  <RotateCcw className="w-5 h-5 text-teal" />
                  Revision Schedule (SM-2 Intervals)
                </h3>
                <p className="text-xs text-charcoal-soft mb-5">Review checkpoints spaced for optimal memory decay.</p>

                <div className="relative pl-5 border-l-2 border-dashed border-teal/40 space-y-4 py-1">
                  {revisionSchedule.map((rev, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-teal border-2 border-card"></div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-charcoal truncate max-w-xs">{rev.topic}</h4>
                        <span className="text-[10px] text-charcoal-soft font-mono shrink-0">{rev.time}</span>
                      </div>
                      <span className="text-[11px] text-teal font-semibold">{rev.interval}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 6: Weekly Cohort Leaderboard (Gold Achievement) */}
              <div className="bg-card border border-card-border rounded-lg p-6 sm:p-7 shadow-soft">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-bold font-display text-charcoal flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#E3A62F]" />
                    Weekly Cohort Leaderboard
                  </h3>
                  <span className="font-handwriting text-xs text-[#9A7412] font-bold">study together</span>
                </div>
                <p className="text-xs text-charcoal-soft mb-4">Rankings based on active recall accuracy.</p>

                <div className="divide-y divide-rule/60">
                  {leaderboard.map((user) => (
                    <div 
                      key={user.rank} 
                      className={`flex items-center justify-between py-2.5 px-3 rounded-md transition-colors ${
                        user.isCurrentUser ? 'bg-gold-soft/60 border border-gold/30' : 'hover:bg-paper-deep/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          user.rank === 1 ? 'bg-gold text-white shadow-sm' :
                          user.rank === 2 ? 'bg-paper-deep text-charcoal border border-rule' :
                          user.rank === 3 ? 'bg-coral-soft text-coral' : 'text-charcoal-soft'
                        }`}>
                          {user.rank}
                        </span>
                        <span className={`text-xs ${user.isCurrentUser ? 'font-bold text-charcoal' : 'text-charcoal font-medium'}`}>
                          {user.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-charcoal tabular-nums">
                        {user.score.toLocaleString()} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
          <div className="bg-card border border-card-border rounded-lg p-6 sm:p-7 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold font-display text-charcoal flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal" />
                  35-Day Consistency Heatmap
                </h3>
                <p className="text-xs text-charcoal-soft">Calendar grid of active study sessions logged.</p>
              </div>
              <button 
                onClick={() => window.location.hash = '#/dashboard/analytics'}
                className="text-xs font-bold text-teal hover:underline inline-flex items-center gap-1"
              >
                Full Analytics Report <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-rule/60">
              <div className="grid grid-flow-col grid-rows-7 gap-2 overflow-x-auto pb-1 max-w-xl">
                {Array.from({ length: 35 }).map((_, idx) => {
                  const color = idx % 5 === 0 ? 'bg-paper-deep' : idx % 3 === 0 ? 'bg-teal-soft' : idx % 4 === 0 ? 'bg-[#7FCBAE]' : 'bg-teal';
                  return (
                    <div 
                      key={idx}
                      className={`w-5 h-5 rounded-sm ${color} border border-rule/60`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-charcoal-soft font-mono">
                <span>Less</span>
                <div className="w-3.5 h-3.5 rounded-sm bg-paper-deep border border-rule"></div>
                <div className="w-3.5 h-3.5 rounded-sm bg-teal-soft"></div>
                <div className="w-3.5 h-3.5 rounded-sm bg-[#7FCBAE]"></div>
                <div className="w-3.5 h-3.5 rounded-sm bg-teal"></div>
                <span>More</span>
              </div>
            </div>
          </div>

        </>
      ) : activePanel === 'explorer' ? (
        <SubjectExplorer currentUser={currentUser} onShowToast={onShowToast} />
      ) : activePanel === 'flashcards' ? (
        <FlashcardHub currentUser={currentUser} onShowToast={onShowToast} />
      ) : activePanel === 'exam' ? (
        <ExamSimulator onShowToast={onShowToast} />
      ) : activePanel === 'voice' ? (
        <VoiceTutor />
      ) : (
        <AnalyticsPanel studiedToday={studiedToday} weeklyHours={weeklyHours} weeklyGoal={weeklyGoal} />
      )}

      {/* WEEKLY PAGE TURN MODAL */}
      <WeeklyPageTurnModal
        isOpen={isWeeklyPageTurnOpen}
        onClose={() => setIsWeeklyPageTurnOpen(false)}
        stats={{ studiedToday, weeklyHours, weeklyGoal }}
      />
    </div>
  );
}
