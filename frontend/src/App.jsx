import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InteractiveSandbox from './components/InteractiveSandbox';
import Features from './components/Features';
import TechStack from './components/TechStack';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Star, 
  GitFork,
  GraduationCap
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Auto-login & hash-based routing on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    const syncViewWithHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/dashboard')) {
        setView('dashboard');
      } else {
        setView('landing');
      }
    };

    syncViewWithHash();
    window.addEventListener('hashchange', syncViewWithHash);
    return () => window.removeEventListener('hashchange', syncViewWithHash);
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    window.location.hash = '#/dashboard/metrics';
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.location.hash = '#/';
  };

  return (
    <div className="min-h-screen bg-slate-950 relative selection:bg-blue-600/30 selection:text-cyan-400">
      
      {/* Decorative Glow Orbs */}
      <div className="glow-orb glow-orb-blue"></div>
      <div className="glow-orb glow-orb-indigo"></div>
      <div className="glow-orb glow-orb-cyan"></div>

      {/* Grid Pattern and Radial Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-0"></div>

      {/* Navigation Header */}
      <Header 
        currentUser={currentUser} 
        onOpenAuth={() => setIsAuthOpen(true)} 
        onSignOut={handleSignOut} 
        currentView={view}
        onToggleView={(target) => setView(target)}
      />

      {/* ROUTING CONTAINER WITH FRAMER MOTION TRANSITIONS */}
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="relative z-10 pt-20"
          >
            {/* HERO SECTION */}
            <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                
                {/* Announcement Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/40 text-blue-400 text-xs font-semibold mb-6 backdrop-blur-sm shadow-inner shadow-blue-500/5 animate-pulse-slow">
                  <Sparkles className="w-3.5 h-3.5" />
                  Unified AI Study Suite
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-5xl mx-auto leading-tight">
                  The Intelligent <span className="text-gradient-blue">AI Console</span> <br />
                  for College & Seminars
                </h1>

                {/* Subtext */}
                <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                  Optimize study performance. Upload lectures, recordings, or PDFs and watch the Gemini API generate clean summaries, interactive 3D flashcards, mind maps, and quiz sets in seconds.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
                  <button 
                    onClick={() => {
                      if (currentUser) {
                        setView('dashboard');
                      } else {
                        setIsAuthOpen(true);
                      }
                    }}
                    className="w-full sm:w-auto relative group px-7 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/40 text-center"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {currentUser ? 'Go to Study Room' : 'Get Started Free'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                  <a 
                    href="#features"
                    className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-bold text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 text-center"
                  >
                    Explore Features
                  </a>
                </div>

                {/* Highlight Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto border-t border-slate-900 pt-10">
                  <div className="text-center">
                    <span className="block text-3xl sm:text-4xl font-extrabold text-white mb-1">99.4%</span>
                    <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">AI Summary Precision</span>
                  </div>
                  <div className="border-l border-slate-900 hidden sm:block h-10 my-auto"></div>
                  <div className="text-center">
                    <span className="block text-3xl sm:text-4xl font-extrabold text-white mb-1">Gemini 1.5</span>
                    <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Model Core</span>
                  </div>
                  <div className="border-l border-slate-900 hidden sm:block h-10 my-auto"></div>
                  <div className="text-center">
                    <span className="block text-3xl sm:text-4xl font-extrabold text-white mb-1">15 Sec</span>
                    <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Avg processing Speed</span>
                  </div>
                </div>

              </div>
            </section>

            {/* SANDBOX SECTION */}
            <InteractiveSandbox />

            {/* FEATURES GRID SECTION */}
            <Features />

            {/* TECHNICAL ARCHITECTURE SECTION */}
            <TechStack />

            {/* PRICING SECTION (Call to Action) */}
            <section id="pricing" className="py-20 relative overflow-hidden border-t border-slate-900 bg-slate-950/20">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <div className="glass-panel-glow rounded-3xl p-10 sm:p-14 border-blue-500/20 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-400 to-indigo-500 opacity-20 filter blur-2xl rounded-full"></div>
                  
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                    Ready to study smarter, not harder?
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-8">
                    Join thousands of students and researchers utilizing LectureMind AI to digest long seminars and textbooks in minutes.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={() => setIsAuthOpen(true)}
                      className="px-6.5 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/10"
                    >
                      Get Started Free
                    </button>
                    <button className="px-6.5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-slate-900 py-10 bg-slate-950 relative z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">
                    LectureMind <span className="text-blue-400">AI</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 text-center md:text-left">
                  &copy; {new Date().getFullYear()} LectureMind AI Inc. Powered by Gemini Generative API. All rights reserved.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Privacy Policy</a>
                  <a href="#" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Terms of Service</a>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="relative z-10 pt-24"
          >
            {/* STUDY DASHBOARD SECTION */}
            <Dashboard 
              currentUser={currentUser} 
              onBackToHome={() => setView('landing')} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTHENTICATION MODAL */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
