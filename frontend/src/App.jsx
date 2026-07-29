import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InteractiveSandbox from './components/InteractiveSandbox';
import Features from './components/Features';
import TechStack from './components/TechStack';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import InteractiveCanvas from './components/InteractiveCanvas';
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
    <div className="min-h-screen bg-[#05070F] relative selection:bg-[#8B5CF6]/30 selection:text-[#C084FC]">
      
      {/* Scroll-driven Canvas background */}
      <InteractiveCanvas />

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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 pt-20"
          >
            {/* HERO SECTION */}
            <section className="relative pt-20 pb-20 sm:pt-28 sm:pb-32">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                
                {/* Announcement Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-studio-surface border border-studio-border text-studio-purple text-xs font-mono mb-8 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Socratic Inquiry Suite
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold font-space tracking-tight mb-8 max-w-5xl mx-auto leading-[1.05] text-[#F8FAFC]">
                  Do not summarize. <br />
                  <span className="text-[#A78BFA]">Synthesize.</span>
                </h1>

                {/* Subtext */}
                <p className="text-base sm:text-lg md:text-xl font-sans text-studio-slate max-w-3xl mx-auto mb-12 leading-relaxed">
                  LectureMind models notes, audio records, and articles into a conceptual schema. It prompts you with inquiries, pushing you to build true retention instead of skim-reading bullet points.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-24">
                  <button 
                    onClick={() => {
                      if (currentUser) {
                        setView('dashboard');
                      } else {
                        setIsAuthOpen(true);
                      }
                    }}
                    className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-semibold tracking-wide text-white bg-studio-purple hover:bg-[#9B70FF] transition-colors duration-300 text-center font-display"
                  >
                    {currentUser ? 'Enter Study Room' : 'Start Socratic Study'}
                  </button>
                  <a 
                    href="#features"
                    className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-semibold tracking-wide text-studio-slate hover:text-white bg-studio-surface border border-studio-border transition-colors duration-300 text-center font-display"
                  >
                    Observe Methodology
                  </a>
                </div>

                {/* Highlight Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto border-t border-studio-border pt-12">
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-studio-textLight font-space mb-1">StateGraph</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-studio-slate">AI pipeline flow</span>
                  </div>
                  <div className="text-center border-t sm:border-t-0 sm:border-x border-studio-border py-4 sm:py-0">
                    <span className="block text-2xl font-bold text-studio-textLight font-space mb-1">Socratic</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-studio-slate">inquiry dialog</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-studio-textLight font-space mb-1">Concept Map</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-studio-slate">interactive links</span>
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
            <section id="pricing" className="py-28 relative overflow-hidden border-t border-studio-border bg-[#05070F]">
              <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative z-10">
                <div className="bg-studio-surface rounded-3xl p-10 sm:p-14 border border-studio-border relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-studio-purple/10 opacity-20 filter blur-2xl rounded-full"></div>
                  
                  <h3 className="text-3xl sm:text-4xl font-bold font-space text-studio-textLight mb-4">
                    Ready to build true comprehension?
                  </h3>
                  <p className="text-studio-slate text-sm sm:text-base max-w-2xl mx-auto mb-8">
                    Skip simple copy-paste notes. Join college students and self-directed researchers mapping ideas with LectureMind.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={() => setIsAuthOpen(true)}
                      className="px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide text-white bg-studio-purple hover:bg-[#9B70FF] transition-colors"
                    >
                      Start Free Trial
                    </button>
                    <button className="px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide text-studio-slate hover:text-white bg-studio-bg border border-studio-border transition-colors">
                      View Documentation
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-studio-border py-12 bg-studio-surface relative z-10">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-studio-purple text-white flex items-center justify-center font-bold">
                    LM
                  </div>
                  <span className="text-sm font-bold text-studio-textLight font-space">
                    LectureMind <span className="text-studio-purple">AI</span>
                  </span>
                </div>
                <p className="text-xs text-studio-textMuted text-center md:text-left font-mono">
                  &copy; {new Date().getFullYear()} LectureMind AI Inc. Distributed under MIT License.
                </p>
                <div className="flex gap-6 font-mono text-xs">
                  <a href="#" className="text-studio-textMuted hover:text-studio-purple transition-colors">Privacy</a>
                  <a href="#" className="text-studio-textMuted hover:text-studio-purple transition-colors">Terms</a>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
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
