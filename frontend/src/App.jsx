import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Features from './components/Features';
import TechStack from './components/TechStack';
import InteractiveSandbox from './components/InteractiveSandbox';
import CommandPalette from './components/CommandPalette';
import SettingsModal from './components/SettingsModal';
import OnboardingModal from './components/OnboardingModal';
import AuthModal from './components/AuthModal';
import ToastContainer from './components/ToastContainer';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  CheckCircle2, 
  Clock, 
  Zap, 
  FileText, 
  UploadCloud, 
  Layers, 
  BookOpen, 
  TrendingUp, 
  HelpCircle,
  LayoutDashboard 
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Notification Helper
  const showToast = (message, type = 'info', title = null) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Restore authenticated session on mount & Hash route listener
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }

    // Check first-time visit for onboarding
    const seenOnboarding = localStorage.getItem('lecturemind_seen_onboarding');
    if (!seenOnboarding && !token) {
      const timer = setTimeout(() => setIsOnboardingOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Hash-based view switching
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/dashboard')) {
        setView('dashboard');
      } else {
        setView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // run on mount
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Keyboard Shortcuts (Cmd+K for Palette, ? for shortcuts)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.email}`, 'success', 'Signed In');
    window.location.hash = '#/dashboard/metrics';
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    showToast('You have been signed out.', 'info');
    window.location.hash = '#/';
  };

  const handleNavigateFromCommandPalette = (targetHash) => {
    setView('dashboard');
    window.location.hash = targetHash;
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('lecturemind_seen_onboarding', 'true');
    showToast('Onboarding completed! Welcome to LectureMind.', 'success');
  };

  return (
    <div className="min-h-screen bg-paper text-charcoal relative selection:bg-coral-soft selection:text-coral font-sans">
      
      {/* Navigation Header */}
      <Header 
        currentUser={currentUser} 
        onOpenAuth={() => setIsAuthOpen(true)} 
        onSignOut={handleSignOut} 
        currentView={view}
        onToggleView={(target) => {
          setView(target);
          if (target === 'landing') window.location.hash = '#/';
          else window.location.hash = '#/dashboard/metrics';
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* ROUTING CONTAINER */}
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.main
            key="landing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10"
          >
            {/* 1. HERO SECTION */}
            <header className="relative pt-12 pb-20 sm:pt-20 sm:pb-24 paper-rules">
              <div className="max-w-[1180px] mx-auto px-4 sm:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
                  
                  {/* Left Column: Heading & CTAs */}
                  <div className="lg:col-span-7 space-y-6 text-left">
                    
                    {/* Eyebrow badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-soft text-violet text-xs font-semibold shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse"></span>
                      Now with grounded voice diagnostics
                    </div>

                    {/* Main Fraunces Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-charcoal leading-[1.08]">
                      Turn lectures into<br />
                      <span className="italic text-coral font-serif relative">knowledge</span> you remember.
                    </h1>

                    {/* Supporting Copy */}
                    <p className="text-base sm:text-lg text-charcoal-soft max-w-lg leading-relaxed font-sans">
                      LectureMind turns your recordings, notes, and videos into structured pages, concept maps, and reviews — like a notebook that studies alongside you.
                    </p>

                    {/* Hero CTAs */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button 
                        onClick={() => {
                          setView('dashboard');
                          window.location.hash = '#/dashboard/metrics';
                        }}
                        className="btn-primary-notebook"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Enter Study Console
                      </button>
                      <a 
                        href="#sandbox"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal hover:text-teal transition-colors pb-0.5 border-b-2 border-charcoal hover:border-teal"
                      >
                        Try Interactive Sandbox →
                      </a>
                    </div>

                    {/* Hero Stats Row */}
                    <div className="flex items-center gap-8 sm:gap-10 pt-6 border-t border-rule/70">
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold font-display text-violet tabular-nums">12</div>
                        <div className="text-xs text-charcoal-soft mt-0.5">concepts mapped</div>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold font-display text-coral tabular-nums">87%</div>
                        <div className="text-xs text-charcoal-soft mt-0.5">mastery this week</div>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold font-display text-teal tabular-nums">3</div>
                        <div className="text-xs text-charcoal-soft mt-0.5">reviews today</div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Notebook Page Hero Visual */}
                  <div className="lg:col-span-5 relative mt-4 lg:mt-0">
                    
                    {/* The Notebook Page */}
                    <div className="notebook-page">
                      {/* Washi Tape Strip */}
                      <div className="washi"></div>

                      {/* Header */}
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-rule/60">
                        <div className="text-xs font-semibold text-charcoal-soft">
                          Lecture 12 · <strong className="text-charcoal font-bold">Machine Learning — Clustering</strong>
                        </div>
                        <span className="text-[10px] font-bold text-teal bg-teal-soft px-2.5 py-0.5 rounded-full">
                          Grounded ✓
                        </span>
                      </div>

                      {/* Note Lines with Mint Highlighter */}
                      <div className="bg-paper-deep rounded-md p-4 mb-4 space-y-2">
                        <div className="h-2.5 bg-rule rounded-sm w-[92%] hl-mint"></div>
                        <div className="h-2.5 bg-rule rounded-sm w-[76%]"></div>
                        <div className="h-2.5 bg-rule rounded-sm w-[60%]"></div>
                      </div>

                      {/* Mini Concept Map with 4 Ink Nodes */}
                      <div className="relative h-36 rounded-md bg-paper-deep overflow-hidden mb-4 border border-rule/40">
                        <svg className="absolute inset-0 w-full h-full">
                          <line x1="120" y1="65" x2="40" y2="28" stroke="#DCD2BF" strokeWidth="1.5"/>
                          <line x1="120" y1="65" x2="48" y2="105" stroke="#DCD2BF" strokeWidth="1.5"/>
                          <line x1="120" y1="65" x2="190" y2="30" stroke="#DCD2BF" strokeWidth="1.5"/>
                          <line x1="120" y1="65" x2="195" y2="108" stroke="#DCD2BF" strokeWidth="1.5"/>
                        </svg>
                        
                        {/* Nodes */}
                        <div className="absolute w-12 h-12 rounded-full bg-violet text-white font-bold text-[11px] flex items-center justify-center top-10 left-24 shadow-md">
                          ML
                        </div>
                        <div className="absolute w-7 h-7 rounded-full bg-coral top-3 left-6 shadow-sm"></div>
                        <div className="absolute w-6 h-6 rounded-full bg-teal bottom-4 left-8 shadow-sm"></div>
                        <div className="absolute w-6 h-6 rounded-full bg-gold top-4 right-8 shadow-sm"></div>
                        <div className="absolute w-6 h-6 rounded-full bg-teal bottom-4 right-7 shadow-sm"></div>
                      </div>

                      {/* Footer Chips */}
                      <div className="flex gap-2">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-violet-soft text-violet flex items-center gap-1">
                          ● Clustering
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-coral-soft text-coral flex items-center gap-1">
                          ● Regression
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gold-soft text-[#9A7412] flex items-center gap-1">
                          ● Classify
                        </span>
                      </div>
                    </div>

                    {/* Floating Sticky Notes at Angles */}
                    <div className="float-sticky s1 animate-drift-slow">12 concepts</div>
                    <div className="float-sticky s2 animate-drift-delayed">87% mastery</div>
                    <div className="float-sticky s3 animate-drift-slow">3 reviews today</div>

                  </div>

                </div>
              </div>
            </header>

            {/* 2. THE INK TRAIL SIGNATURE GRADIENT STROKE */}
            <div className="ink-trail-wrap">
              <svg className="ink-trail" viewBox="0 0 6 700" preserveAspectRatio="none" width="6" height="700">
                <defs>
                  <linearGradient id="trailGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6C5CE0"/>
                    <stop offset="35%" stopColor="#F0603E"/>
                    <stop offset="70%" stopColor="#0F8F86"/>
                    <stop offset="100%" stopColor="#E3A62F"/>
                  </linearGradient>
                </defs>
                <rect x="1" y="0" width="4" height="700" rx="2" fill="url(#trailGrad)" opacity="0.45"/>
              </svg>
            </div>

            {/* 3. THE LEARNING LOOP ("HOW IT WORKS") */}
            <section id="how" className="py-24 max-w-[1180px] mx-auto px-4 sm:px-8 relative">
              <div className="mb-14">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-soft mb-2 font-mono">
                  <span className="w-5 h-0.5 bg-coral rounded-full"></span>
                  The learning loop
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-display text-charcoal mb-3">
                  From lecture to long-term memory.
                </h2>
                <p className="text-base text-charcoal-soft max-w-xl leading-relaxed">
                  Four steps, repeated every time you learn something new — each one handed off to the next like pages in the same notebook.
                </p>
              </div>

              {/* 4-Step Row with Connecting Path */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:block absolute top-8 left-[8%] right-[8%] h-0.5 z-0">
                  <svg className="w-full h-5 overflow-visible" viewBox="0 0 1000 20" preserveAspectRatio="none">
                    <path d="M40,10 C 260,-15 340,35 500,10 S 740,-15 960,10" stroke="#DCD2BF" strokeWidth="2" fill="none" strokeDasharray="2 8" strokeLinecap="round"/>
                  </svg>
                </div>

                {/* Step 1: Upload */}
                <div className="relative z-10 space-y-3">
                  <span className="font-handwriting text-base font-bold text-violet absolute -top-3 left-16">
                    drop it in
                  </span>
                  <div className="w-14 h-14 rounded-full bg-violet text-white font-bold font-display text-xl flex items-center justify-center shadow-soft">
                    01
                  </div>
                  <h3 className="text-lg font-bold font-display text-charcoal">Upload</h3>
                  <p className="text-xs text-charcoal-soft leading-relaxed">
                    Drop your lecture recording, textbook PDF, or class notes here.
                  </p>
                </div>

                {/* Step 2: Understand */}
                <div className="relative z-10 space-y-3">
                  <span className="font-handwriting text-base font-bold text-coral absolute -top-3 left-16">
                    it reads closely
                  </span>
                  <div className="w-14 h-14 rounded-full bg-coral text-white font-bold font-display text-xl flex items-center justify-center shadow-soft">
                    02
                  </div>
                  <h3 className="text-lg font-bold font-display text-charcoal">Understand</h3>
                  <p className="text-xs text-charcoal-soft leading-relaxed">
                    LectureMind extracts concepts and builds structured knowledge.
                  </p>
                </div>

                {/* Step 3: Practice */}
                <div className="relative z-10 space-y-3">
                  <span className="font-handwriting text-base font-bold text-teal absolute -top-3 left-16">
                    think it through
                  </span>
                  <div className="w-14 h-14 rounded-full bg-teal text-white font-bold font-display text-xl flex items-center justify-center shadow-soft">
                    03
                  </div>
                  <h3 className="text-lg font-bold font-display text-charcoal">Practice</h3>
                  <p className="text-xs text-charcoal-soft leading-relaxed">
                    Test yourself with Socratic questions and active recall flashcards.
                  </p>
                </div>

                {/* Step 4: Remember */}
                <div className="relative z-10 space-y-3">
                  <span className="font-handwriting text-base font-bold text-[#9A7412] absolute -top-3 left-16">
                    it sticks
                  </span>
                  <div className="w-14 h-14 rounded-full bg-gold text-white font-bold font-display text-xl flex items-center justify-center shadow-soft">
                    04
                  </div>
                  <h3 className="text-lg font-bold font-display text-charcoal">Remember</h3>
                  <p className="text-xs text-charcoal-soft leading-relaxed">
                    SM-2 schedules the right concepts right before you forget them.
                  </p>
                </div>

              </div>
            </section>

            {/* 4. DASHBOARD PREVIEW SECTION */}
            <section id="dash" className="py-16 max-w-[1180px] mx-auto px-4 sm:px-8">
              <div className="mb-10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-soft mb-2 font-mono">
                  <span className="w-5 h-0.5 bg-violet rounded-full"></span>
                  Inside the workspace
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-display text-charcoal mb-3">
                  A dashboard that answers five questions.
                </h2>
                <p className="text-base text-charcoal-soft max-w-xl leading-relaxed">
                  What did I learn, what should I study now, what am I weak at, what's due, and what can AI explain — all in one calm, colorful page.
                </p>
              </div>

              {/* Workspace Shell Preview */}
              <div className="bg-card border border-card-border rounded-lg shadow-lift p-6 sm:p-8 space-y-6">
                
                {/* Top Greet Row */}
                <div className="flex items-center justify-between pb-5 border-b border-rule">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-charcoal">
                      Good morning, Rehan.
                    </h3>
                    <p className="text-xs text-charcoal-soft mt-0.5">
                      Let's continue building what you learned.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet to-coral shadow-soft border-2 border-card"></div>
                </div>

                {/* 4 Colored Metric Cards (Stripe + Sparkline) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Metric 1: Violet */}
                  <div className="bg-paper-deep rounded-md p-4 metric-stripe-violet relative overflow-hidden">
                    <div className="text-2xl font-bold font-display text-charcoal tabular-nums">7</div>
                    <div className="text-xs text-charcoal-soft mt-0.5">Day study streak</div>
                    <svg className="mt-2 w-full h-5" viewBox="0 0 80 20">
                      <polyline points="0,16 12,12 24,14 36,8 48,10 60,4 72,6" fill="none" stroke="#6C5CE0" strokeWidth="2"/>
                    </svg>
                  </div>

                  {/* Metric 2: Coral */}
                  <div className="bg-paper-deep rounded-md p-4 metric-stripe-coral relative overflow-hidden">
                    <div className="text-2xl font-bold font-display text-charcoal tabular-nums">82%</div>
                    <div className="text-xs text-charcoal-soft mt-0.5">Concept mastery</div>
                    <svg className="mt-2 w-full h-5" viewBox="0 0 80 20">
                      <polyline points="0,14 12,13 24,10 36,11 48,7 60,8 72,3" fill="none" stroke="#F0603E" strokeWidth="2"/>
                    </svg>
                  </div>

                  {/* Metric 3: Teal */}
                  <div className="bg-paper-deep rounded-md p-4 metric-stripe-teal relative overflow-hidden">
                    <div className="text-2xl font-bold font-display text-charcoal tabular-nums">12</div>
                    <div className="text-xs text-charcoal-soft mt-0.5">Reviews due</div>
                    <svg className="mt-2 w-full h-5" viewBox="0 0 80 20">
                      <polyline points="0,6 12,10 24,8 36,13 48,9 60,15 72,12" fill="none" stroke="#0F8F86" strokeWidth="2"/>
                    </svg>
                  </div>

                  {/* Metric 4: Gold */}
                  <div className="bg-paper-deep rounded-md p-4 metric-stripe-gold relative overflow-hidden">
                    <div className="text-2xl font-bold font-display text-charcoal tabular-nums">18.5h</div>
                    <div className="text-xs text-charcoal-soft mt-0.5">Hours learned</div>
                    <svg className="mt-2 w-full h-5" viewBox="0 0 80 20">
                      <polyline points="0,15 12,11 24,12 36,7 48,9 60,5 72,4" fill="none" stroke="#E3A62F" strokeWidth="2"/>
                    </svg>
                  </div>

                </div>

                {/* Dashboard Body Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Left Continue Card (7 cols) */}
                  <div className="lg:col-span-7 bg-gradient-to-br from-violet-soft to-paper-deep rounded-md p-5 border border-rule/60 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet font-mono">
                      Continue learning
                    </span>
                    <h4 className="text-lg font-bold font-display text-charcoal">
                      Operating Systems — Process Management & Mutex
                    </h4>
                    <div className="w-full bg-charcoal/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-violet h-full rounded-full w-[72%]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-charcoal-soft font-medium">
                      <span>72% complete</span>
                      <span>Last studied yesterday</span>
                    </div>
                    <button 
                      onClick={() => {
                        setView('dashboard');
                        window.location.hash = '#/dashboard/subjects';
                      }}
                      className="btn-primary-notebook text-xs py-2 px-4 mt-2"
                    >
                      Continue learning →
                    </button>
                  </div>

                  {/* Right Review List (5 cols) */}
                  <div className="lg:col-span-5 bg-paper-deep rounded-md p-5 border border-rule/60 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-soft font-mono block">
                      Today's review
                    </span>
                    <div className="divide-y divide-rule text-xs space-y-2">
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-semibold text-charcoal">Process Scheduling</span>
                        <span className="text-[10px] font-bold text-coral bg-coral-soft px-2 py-0.5 rounded-full">Due today</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-semibold text-charcoal">Deadlocks & Semaphores</span>
                        <span className="text-[10px] font-bold text-coral bg-coral-soft px-2 py-0.5 rounded-full">Due today</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-semibold text-charcoal">Memory Paging</span>
                        <span className="text-[10px] font-bold text-[#8A6A10] bg-gold-soft px-2 py-0.5 rounded-full">Tomorrow</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </section>

            {/* 5. INTERACTIVE SANDBOX SECTION */}
            <InteractiveSandbox />

            {/* 6. METHODOLOGY SECTION */}
            <Features />

            {/* 7. TECHNICAL ARCHITECTURE SECTION */}
            <TechStack />

            {/* 8. MINIMAL BRAND FOOTER */}
            <footer className="border-t border-rule py-12 bg-card relative z-10">
              <div className="max-w-[1180px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-charcoal text-paper flex items-center justify-center font-bold text-xs">
                    LM
                  </div>
                  <span className="text-base font-bold font-display text-charcoal">
                    LectureMind AI
                  </span>
                </div>
                <div className="font-handwriting text-lg text-charcoal-soft text-center sm:text-right">
                  built for people who'd rather understand than memorize.
                </div>
              </div>
            </footer>

          </motion.main>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 pt-16"
          >
            {/* STUDY DASHBOARD SECTION */}
            <Dashboard 
              currentUser={currentUser} 
              onBackToHome={() => {
                setView('landing');
                window.location.hash = '#/';
              }}
              onShowToast={showToast}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMAND PALETTE (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigateFromCommandPalette}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onSaveNotification={(msg, type) => showToast(msg, type)}
      />

      {/* ONBOARDING MODAL */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleCompleteOnboarding}
      />

      {/* AUTHENTICATION MODAL */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
      />

      {/* TOAST NOTIFICATION CONTAINER */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
