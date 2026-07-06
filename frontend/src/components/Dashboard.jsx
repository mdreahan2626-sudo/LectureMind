import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';
import SubjectExplorer from './SubjectExplorer';
import FlashcardHub from './FlashcardHub';
import AnalyticsPanel from './AnalyticsPanel';
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
  User,
  ArrowLeft,
  ChevronRight,
  Brain,
  Zap,
  RotateCcw
} from 'lucide-react';

export default function Dashboard({ currentUser, onBackToHome }) {
  // Today's Study Plan interactive tasks state
  const [tasks, setTasks] = useState([
    { id: 1, text: "Review Quantum Mechanics probability density notes", completed: false, category: "Physics" },
    { id: 2, text: "Practice 12 due flashcards for Deep Learning", completed: true, category: "AI" },
    { id: 3, text: "Complete Macroeconomics Quiz 2 on Monetary Policy", completed: false, category: "Economics" },
    { id: 4, text: "Listen to Neural Architecture lecture segment", completed: false, category: "AI" }
  ]);

  // Study Stats States
  const [studiedToday, setStudiedToday] = useState(0.0);
  const [weeklyHours, setWeeklyHours] = useState(0.0);
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
      setStudiedToday(parsed.studiedToday || 0.0);
      setWeeklyHours(parsed.weeklyHours || 0.0);
      setWeeklyGoal(parsed.weeklyGoal || 20.0);
    } else {
      // Default initial states for new users/guests
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

  // Submit Handler for logging hours
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
          return;
        }
      } catch (err) {
        console.error("Failed to post stats:", err.message);
      }
    }

    // Local fallback updates
    const updatedToday = studiedToday + hours;
    const updatedWeek = weeklyHours + hours;
    setStudiedToday(updatedToday);
    setWeeklyHours(updatedWeek);
    saveLocalStats(updatedToday, updatedWeek, weeklyGoal);
    
    setLogAmount('');
    setIsLoggingTime(false);
  };

  // Submit Handler for changing goals
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
          return;
        }
      } catch (err) {
        console.error("Failed to set weekly goal:", err.message);
      }
    }

    // Local fallback updates
    setWeeklyGoal(goal);
    saveLocalStats(studiedToday, weeklyHours, goal);
    
    setNewGoal('');
    setIsEditingGoal(false);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  // Animations config
  const slideFromLeft = {
    initial: { x: -80, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  const slideFromRight = {
    initial: { x: 80, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  const fadeInUp = {
    initial: { y: 30, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  // Static mock states matching request metrics
  const upcomingExams = [
    { id: 1, title: "Quantum Physics Midterm", date: "July 12, 2026", daysLeft: 6, course: "Physics" },
    { id: 2, title: "Deep Learning Neural Networks Exam", date: "July 15, 2026", daysLeft: 9, course: "AI" },
    { id: 3, title: "Macroeconomic Policy Formulation Quiz", date: "July 20, 2026", daysLeft: 14, course: "Economics" }
  ];

  const subjectsProgress = [
    { name: "Deep Learning & Representation Learning", progress: 75, color: "from-blue-500 to-indigo-500", hours: "12.4 hrs" },
    { name: "Quantum Mechanics & Wave Mechanics", progress: 48, color: "from-cyan-500 to-blue-500", hours: "8.2 hrs" },
    { name: "Macroeconomics (National Accounts)", progress: 88, color: "from-indigo-500 to-cyan-500", hours: "15.1 hrs" }
  ];

  const weakTopics = [
    { topic: "Backpropagation gradient calculus in multi-layer MLPs", accuracy: "38%", status: "critical", subject: "Deep Learning" },
    { topic: "Schrödinger probability density integrals (particle-in-a-box)", accuracy: "52%", status: "warning", subject: "Quantum Physics" },
    { topic: "Central Bank discount rate manipulation mechanics", accuracy: "61%", status: "review", subject: "Macroeconomics" }
  ];

  const revisionSchedule = [
    { time: "10:30 AM", topic: "Re-evaluate Backprop chain rule math", interval: "Spaced Repetition #3" },
    { time: "02:00 PM", topic: "Solve Schrödinger equations for step boundaries", interval: "Spaced Repetition #1" },
    { time: "05:30 PM", topic: "Review Real vs Nominal GDP indicators", interval: "Weekly Review" }
  ];

  const leaderboard = [
    { rank: 1, name: "Aarav Mehta", score: 9840, isCurrentUser: false },
    { rank: 2, name: "Sarah Connor", score: 9510, isCurrentUser: false },
    { rank: 3, name: "Marcus Aurelius", score: 9200, isCurrentUser: false },
    { rank: 4, name: currentUser ? currentUser.email.split('@')[0] : "You (Guest)", score: 8840, isCurrentUser: true },
    { rank: 5, name: "Elena Rostova", score: 8610, isCurrentUser: false }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Header back anchor */}
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Homepage
        </button>

        <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold">
          Active Session: <span className="text-blue-400">{currentUser ? currentUser.email : "Guest Mode"}</span>
        </span>
      </div>

      {/* TOP HEADER: Title & Streak status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Study Room <span className="text-gradient-blue font-extrabold">Console</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Track metrics, schedule revision intervals, and review generated AI study packs.
          </p>
        </div>

        {/* Dynamic Streak Badge */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-2xl">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-950/40 text-orange-400 border border-orange-800/30">
            <Flame className="w-5 h-5 fill-current animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Daily Streak</span>
            <span className="text-sm font-extrabold text-white">7 Days Consistency</span>
          </div>
        </div>
      </div>

      {/* PANEL TOGGLE BUTTONS */}
      <div className="flex gap-3 mb-8 border-b border-slate-900 pb-5">
        <button
          onClick={() => window.location.hash = '#/dashboard/metrics'}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activePanel === 'metrics'
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10'
              : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-800'
          }`}
        >
          Study Metrics Room
        </button>
        <button
          onClick={() => window.location.hash = '#/dashboard/subjects'}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activePanel === 'explorer'
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10'
              : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-800'
          }`}
        >
          Subject & Folder Manager
        </button>
        <button
          onClick={() => window.location.hash = '#/dashboard/flashcards'}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activePanel === 'flashcards'
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10'
              : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-800'
          }`}
        >
          AI Flashcard Hub
        </button>
        <button
          onClick={() => window.location.hash = '#/dashboard/analytics'}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activePanel === 'analytics'
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10'
              : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-800'
          }`}
        >
          Progress Analytics
        </button>
      </div>

      {activePanel === 'metrics' ? (
        <>
          {/* TOP ROW STATS (4 Widgets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Stat 1: Time Studied Today */}
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="glass-panel rounded-2xl p-6 relative overflow-hidden group flex flex-col justify-between min-h-[160px]">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-600/5 filter blur-xl rounded-full"></div>
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Studied Today</span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white">{studiedToday.toFixed(1)}</span>
              <span className="text-slate-400 text-sm font-semibold">hours</span>
            </div>
          </div>

          <div className="mt-3 relative z-10">
            {!isLoggingTime ? (
              <button 
                onClick={() => setIsLoggingTime(true)}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors px-2.5 py-1 rounded-lg bg-blue-950/20 border border-blue-900/30 w-full text-center"
              >
                + Log Study Session
              </button>
            ) : (
              <form onSubmit={handleLogTime} className="pt-2 flex items-center gap-1.5 animate-in slide-in-from-bottom-2 duration-200">
                <input 
                  type="number" 
                  step="0.1" 
                  min="0.1"
                  required
                  value={logAmount}
                  onChange={(e) => setLogAmount(e.target.value)}
                  placeholder="Hrs"
                  className="w-16 px-2 py-1 text-xs rounded-md bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
                <button type="submit" className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-md transition-colors">Log</button>
                <button type="button" onClick={() => setIsLoggingTime(false)} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] rounded-md transition-colors">X</button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Stat 2: Weekly Study Hours */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="glass-panel rounded-2xl p-6 relative overflow-hidden group flex flex-col justify-between min-h-[160px]">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-600/5 filter blur-xl rounded-full"></div>
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Weekly Hours</span>
              <BookMarked className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white">{weeklyHours.toFixed(1)}</span>
              <span className="text-slate-400 text-sm font-semibold">/ {weeklyGoal} hrs</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-550" 
                style={{ width: `${Math.min(100, (weeklyHours / weeklyGoal) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-3 relative z-10">
            {!isEditingGoal ? (
              <button 
                onClick={() => setIsEditingGoal(true)}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors px-2.5 py-1 rounded-lg bg-indigo-950/20 border border-indigo-900/30 w-full text-center"
              >
                Set Weekly Goal
              </button>
            ) : (
              <form onSubmit={handleSetGoal} className="pt-2 flex items-center gap-1.5 animate-in slide-in-from-bottom-2 duration-200">
                <input 
                  type="number" 
                  step="1" 
                  min="1"
                  required
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Goal"
                  className="w-16 px-2 py-1 text-xs rounded-md bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-md transition-colors">Set</button>
                <button type="button" onClick={() => setIsEditingGoal(false)} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] rounded-md transition-colors">X</button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Stat 3: Flashcards Due */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="glass-panel rounded-2xl p-6 relative overflow-hidden group min-h-[160px] flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-cyan-600/5 filter blur-xl rounded-full"></div>
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Flashcards Due</span>
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white">12</span>
              <span className="text-slate-400 text-sm font-semibold">cards today</span>
            </div>
          </div>
          <p className="text-slate-500 text-[10px] mt-2">
            Active recall intervals: <span className="text-cyan-400 font-bold">4 high priority</span>
          </p>
        </motion.div>

        {/* Stat 4: Leaderboard Position */}
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }} className="glass-panel rounded-2xl p-6 relative overflow-hidden group min-h-[160px] flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-600/5 filter blur-xl rounded-full"></div>
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Leaderboard Rank</span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white">#4</span>
              <span className="text-slate-400 text-sm font-semibold">out of 120</span>
            </div>
          </div>
          <p className="text-slate-500 text-[10px] mt-2">
            Score: <span className="text-amber-400 font-bold">8,840 pts</span> &bull; Up 1 place
          </p>
        </motion.div>
      </div>

      {/* DASHBOARD COLUMNS (LEFT & RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: Study Plan, Progress, Weak Topics (Animates from Left) */}
        <motion.div 
          {...slideFromLeft}
          className="lg:col-span-6 flex flex-col gap-8"
        >
          {/* Card 1: Today's Study Plan */}
          <div className="glass-panel rounded-3xl p-6.5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  Today's Study Plan
                </h3>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Daily checklists</span>
              </div>
              <span className="text-xs font-bold text-blue-400 bg-blue-950/40 border border-blue-900/30 px-2.5 py-1 rounded-lg">
                {progressPercent}% Done
              </span>
            </div>

            {/* Checklist elements */}
            <div className="space-y-3.5 mb-6">
              {tasks.map(task => (
                <button 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
                    task.completed 
                      ? 'bg-slate-900/20 border-slate-900 text-slate-500 line-through' 
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-200 hover:border-slate-700/80'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    task.completed 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'border-slate-700 hover:border-slate-500'
                  }`}>
                    {task.completed && <CheckCircle2 className="w-4 h-4 fill-current text-slate-950" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{task.text}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950/40 border border-slate-900 text-slate-500 font-bold uppercase mt-1 inline-block">
                      {task.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Micro-Progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-850">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Card 2: Subjects Progress */}
          <div className="glass-panel rounded-3xl p-6.5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Subjects Progress
            </h3>
            <p className="text-slate-500 text-xs mb-6">Course content coverage details.</p>

            <div className="space-y-5">
              {subjectsProgress.map((sub, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-200 truncate max-w-[280px] sm:max-w-md">{sub.name}</span>
                    <span className="font-semibold text-slate-400">{sub.progress}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-850">
                      <div 
                        className={`bg-gradient-to-r ${sub.color} h-full rounded-full`}
                        style={{ width: `${sub.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0">
                      {sub.hours}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Weak Topics */}
          <div className="glass-panel rounded-3xl p-6.5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Weak Topics (Revision Flags)
            </h3>
            <p className="text-slate-500 text-xs mb-6">Identified by quiz performance metrics.</p>

            <div className="space-y-3.5">
              {weakTopics.map((wt, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border flex items-start gap-3 bg-slate-900/20 ${
                    wt.status === 'critical' 
                      ? 'border-rose-950/40 hover:border-rose-800/40' 
                      : wt.status === 'warning'
                      ? 'border-orange-950/40 hover:border-orange-850/40'
                      : 'border-amber-950/40 hover:border-amber-850/40'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    wt.status === 'critical' 
                      ? 'bg-rose-950/50 text-rose-400 border border-rose-900/30' 
                      : wt.status === 'warning'
                      ? 'bg-orange-950/50 text-orange-400 border border-orange-900/30'
                      : 'bg-amber-950/50 text-amber-400 border border-amber-900/30'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className={`text-[9px] font-bold uppercase tracking-wider block mb-0.5 ${
                      wt.status === 'critical' ? 'text-rose-400' : 'text-orange-400'
                    }`}>
                      {wt.subject}
                    </span>
                    <p className="text-xs font-semibold text-slate-300 leading-normal truncate mb-1">
                      {wt.topic}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      Average Quiz Accuracy: <span className="font-bold text-slate-400">{wt.accuracy}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Exams, Timeline, Quiz accuracy, Leaderboard (Animates from Right) */}
        <motion.div 
          {...slideFromRight}
          className="lg:col-span-6 flex flex-col gap-8"
        >
          {/* Card 4: Upcoming Exams */}
          <div className="glass-panel rounded-3xl p-6.5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-blue-400" />
              Upcoming Exams
            </h3>
            <p className="text-slate-500 text-xs mb-6">Track exam deadlines and schedules.</p>

            <div className="space-y-4">
              {upcomingExams.map(exam => (
                <div 
                  key={exam.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-slate-900"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-900 text-slate-400 font-bold uppercase block w-max mb-1.5">
                      {exam.course}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-sm">{exam.title}</h4>
                    <span className="text-xs text-slate-500">{exam.date}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`block text-xl font-black ${
                      exam.daysLeft <= 7 ? 'text-rose-400' : 'text-blue-400'
                    }`}>{exam.daysLeft}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Days Left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Revision Schedule */}
          <div className="glass-panel rounded-3xl p-6.5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <RotateCcw className="w-5 h-5 text-cyan-400" />
              Revision Schedule (Spaced Repetition)
            </h3>
            <p className="text-slate-500 text-xs mb-6">Review intervals optimized for memory retention.</p>

            {/* Vertical Timeline */}
            <div className="relative pl-5 border-l border-slate-850 ml-2 space-y-6 py-1">
              {revisionSchedule.map((rev, idx) => (
                <div key={idx} className="relative">
                  {/* Bullet */}
                  <div className="absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-cyan-500"></div>

                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-200 leading-snug max-w-[220px] sm:max-w-sm truncate">
                      {rev.topic}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0">
                      {rev.time}
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400/80 font-bold uppercase mt-1 block">
                    {rev.interval}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 6: Quiz Accuracy */}
          <div className="glass-panel rounded-3xl p-6.5 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-amber-400" />
                Quiz Accuracy
              </h3>
              <p className="text-slate-500 text-xs mb-6">Concentric radial metrics showing exam accuracy.</p>
            </div>

            {/* Radial SVG Chart representation */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Base Circle */}
                  <circle cx="72" cy="72" r="54" stroke="rgba(15,23,42,0.6)" strokeWidth="10" fill="transparent" />
                  {/* Progress Circle */}
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="54" 
                    stroke="url(#accuracyGradient)" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - 0.875)}
                    strokeLinecap="round"
                    className="filter drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]"
                  />
                  {/* Defs definition for gradient colors */}
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inner label */}
                <div className="absolute text-center">
                  <span className="block text-2xl font-black text-white leading-none">87.5%</span>
                  <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold block mt-1">Average</span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-400 w-full">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <span className="font-semibold">Deep Learning Quiz</span>
                  <span className="font-bold text-slate-200">92%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <span className="font-semibold">Quantum Mechanics Quiz</span>
                  <span className="font-bold text-slate-200">79%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <span className="font-semibold">Macroeconomics Quiz</span>
                  <span className="font-bold text-slate-200">90%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 7: Leaderboard Position details */}
          <div className="glass-panel rounded-3xl p-6.5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-amber-400" />
              Leaderboard Standing
            </h3>
            <p className="text-slate-500 text-xs mb-6">Compare XP points with peers.</p>

            <div className="space-y-2.5">
              {leaderboard.map((user, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                    user.isCurrentUser 
                      ? 'bg-blue-950/40 border-blue-500/30 text-blue-300' 
                      : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 font-bold ${
                      idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      #{user.rank}
                    </span>
                    <span className={`font-semibold ${user.isCurrentUser ? 'text-white font-bold' : ''}`}>
                      {user.name}
                    </span>
                  </div>

                  <span className="font-bold text-slate-200 shrink-0">
                    {user.score.toLocaleString()} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      {/* HEATMAP CONSISTENCY SECTION AT THE BOTTOM OF THE DASHBOARD */}
      <motion.div {...fadeInUp} transition={{ delay: 0.5 }} className="glass-panel rounded-3xl p-6.5 mt-8 relative overflow-hidden select-none">
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-600/5 filter blur-xl rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Progress Consistency Heatmap
            </h3>
            <p className="text-slate-550 text-xs mt-1">Calendar map of active study hours logged per day.</p>
          </div>
          
          <button 
            onClick={() => window.location.hash = '#/dashboard/analytics'}
            className="text-xs font-bold text-blue-400 hover:text-blue-305 transition-colors bg-blue-950/20 border border-blue-900/30 px-3.5 py-2 rounded-xl flex items-center gap-1 w-max"
          >
            Open Full Analytics Board
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Heatmap calendar grid layout */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-t border-slate-900 pt-5">
          <div className="grid grid-flow-col grid-rows-7 gap-2.5 overflow-x-auto pb-2 pr-1 w-full max-w-2xl">
            {Array.from({ length: 35 }).map((_, idx) => {
              const opacity = idx % 5 === 0 ? 'bg-slate-900/40' : idx % 3 === 0 ? 'bg-emerald-950/40' : idx % 4 === 0 ? 'bg-emerald-500/80' : 'bg-emerald-700/60';
              return (
                <div 
                  key={idx}
                  className={`w-6 h-6 rounded-md ${opacity} border border-slate-950/20`}
                ></div>
              );
            })}
          </div>

          <div className="flex md:flex-col justify-between items-start md:items-end w-full md:w-auto text-[10px] text-slate-500 gap-4">
            <div className="flex gap-1.5 items-center">
              <span>Less</span>
              <div className="w-3.5 h-3.5 rounded bg-slate-900/40 border border-slate-950"></div>
              <div className="w-3.5 h-3.5 rounded bg-emerald-950/30"></div>
              <div className="w-3.5 h-3.5 rounded bg-emerald-900/50"></div>
              <div className="w-3.5 h-3.5 rounded bg-emerald-500/80"></div>
              <span>More</span>
            </div>
            <span>Streak: 7 Days Consistency</span>
          </div>
        </div>
      </motion.div>
      </>
      ) : activePanel === 'explorer' ? (
        <SubjectExplorer currentUser={currentUser} />
      ) : activePanel === 'flashcards' ? (
        <FlashcardHub currentUser={currentUser} />
      ) : (
        <AnalyticsPanel studiedToday={studiedToday} weeklyHours={weeklyHours} weeklyGoal={weeklyGoal} />
      )}
    </div>
  );
}
