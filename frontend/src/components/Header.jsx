import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Settings, 
  LogOut, 
  ArrowRight, 
  LayoutDashboard, 
  Home, 
  BookOpen, 
  Brain, 
  Mic, 
  TrendingUp,
  Menu,
  X
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Header({ 
  currentUser, 
  onOpenAuth, 
  onSignOut, 
  currentView, 
  onToggleView, 
  onOpenCommandPalette,
  onOpenSettings
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileNav = (hashTarget, viewTarget) => {
    if (viewTarget) onToggleView(viewTarget);
    if (hashTarget) window.location.hash = hashTarget;
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* TOP DESKTOP & MOBILE HEADER */}
      <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#FBF6EC]/92 backdrop-blur-md border-b border-[#E7D8BC] shadow-soft' 
          : 'bg-[#FBF6EC]/85 backdrop-blur-sm border-b border-transparent'
      }`}>
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-3.5">
          <div className="flex items-center justify-between">
            
            {/* Left: Brand Logo in Fraunces serif with 3 ink node mark */}
            <div 
              className="flex items-center gap-2.5 group cursor-pointer shrink-0" 
              onClick={() => onToggleView('landing')}
            >
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="12" stroke="#2B2432" strokeWidth="1.4"/>
                <circle cx="13" cy="8" r="2.6" fill="#6C5CE0"/>
                <circle cx="8" cy="16" r="2.6" fill="#F0603E"/>
                <circle cx="18" cy="16" r="2.6" fill="#0F8F86"/>
                <line x1="13" y1="8" x2="8" y2="16" stroke="#2B2432" strokeWidth="1"/>
                <line x1="13" y1="8" x2="18" y2="16" stroke="#2B2432" strokeWidth="1"/>
              </svg>
              <div className="flex items-baseline">
                <span className="text-xl font-bold text-charcoal font-display tracking-tight">
                  LectureMind
                </span>
                <span className="ml-1 text-[10px] font-bold text-violet uppercase tracking-wider font-mono">
                  AI
                </span>
              </div>
            </div>

            {/* Middle: Clean Centered Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              {currentView === 'landing' ? (
                <>
                  <a href="#how" className="nav-link-item text-sm">
                    How it works
                  </a>
                  <a href="#dash" className="nav-link-item text-sm">
                    Features
                  </a>
                  <a href="#sandbox" className="nav-link-item text-sm">
                    PDF & Mind Map Studio
                  </a>
                </>
              ) : (
                <div className="flex items-center gap-1.5 bg-paper-deep p-1 rounded-full border border-rule">
                  <button
                    onClick={() => { onToggleView('landing'); }}
                    className="px-3.5 py-1 rounded-full text-xs font-medium text-charcoal-soft hover:text-charcoal transition-colors flex items-center gap-1.5"
                  >
                    <Home className="w-3.5 h-3.5" />
                    Home
                  </button>
                  <button
                    onClick={() => { onToggleView('dashboard'); window.location.hash = '#/dashboard/metrics'; }}
                    className="px-3.5 py-1 rounded-full text-xs font-semibold bg-card text-charcoal shadow-soft flex items-center gap-1.5 border border-rule/60"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-violet" />
                    Study Console
                  </button>
                </div>
              )}
            </nav>

            {/* Right: Quick Tools, Notifications, Auth & Settings */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Dedicated Study Console Pill Button on Landing Page */}
              {currentView === 'landing' && (
                <button
                  onClick={() => { onToggleView('dashboard'); window.location.hash = '#/dashboard/metrics'; }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-charcoal text-paper hover:bg-coral text-xs font-semibold shadow-soft hover:shadow-hover transition-all group"
                  title="Open Study Workspace"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-paper group-hover:rotate-6 transition-transform" />
                  <span>Study Console</span>
                  <ArrowRight className="w-3 h-3 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Command Palette Trigger */}
              <button
                onClick={onOpenCommandPalette}
                className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-paper-deep hover:bg-rule/50 border border-rule text-xs text-charcoal-soft transition-colors"
                aria-label="Search and quick jump"
              >
                <Search className="w-3.5 h-3.5 text-charcoal-soft" />
                <span className="text-[11px] font-medium">Search</span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-rule text-charcoal-soft">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Dropdown */}
              <NotificationDropdown 
                onSelectAction={(target) => {
                  onToggleView('dashboard');
                  window.location.hash = target;
                }} 
              />

              {/* Settings Button */}
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-full text-charcoal-soft hover:text-charcoal hover:bg-paper-deep transition-colors"
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Auth / Profile Capsule */}
              {currentUser ? (
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-rule">
                  <div className="flex items-center gap-2 bg-paper-deep/80 px-2.5 py-1 rounded-full border border-rule/60">
                    <div className="w-6 h-6 rounded-full bg-violet-soft text-violet flex items-center justify-center font-bold text-xs border border-violet/20">
                      {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-medium text-charcoal max-w-[130px] truncate">
                      {currentUser.email}
                    </span>
                  </div>
                  <button 
                    onClick={onSignOut}
                    className="text-xs text-charcoal-soft hover:text-coral p-1.5 rounded-full hover:bg-paper-deep transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <button 
                    onClick={onOpenAuth}
                    className="text-sm font-semibold text-charcoal-soft hover:text-charcoal transition-colors px-2"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={onOpenAuth}
                    className="btn-primary-notebook text-xs py-2 px-4 shadow-soft"
                  >
                    Get started
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <div className="sm:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-charcoal-soft hover:text-charcoal hover:bg-paper-deep transition-colors"
                  aria-label="Toggle navigation"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-card border-b border-rule p-4 shadow-modal space-y-3">
            <button
              onClick={() => { onToggleView('dashboard'); window.location.hash = '#/dashboard/metrics'; setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-full bg-charcoal text-paper hover:bg-coral text-xs font-semibold shadow-soft transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Enter Study Console</span>
            </button>

            <button
              onClick={() => { onOpenCommandPalette(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between p-2.5 rounded-md bg-paper-deep text-xs text-charcoal font-medium"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-charcoal-soft" /> Quick jump
              </span>
              <kbd className="font-mono text-[10px] bg-card px-1.5 py-0.5 rounded border border-rule">⌘K</kbd>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rule">
              <button
                onClick={() => handleMobileNav('#/', 'landing')}
                className="p-2 text-left rounded-md text-xs font-medium text-charcoal-soft hover:bg-paper-deep"
              >
                Landing Page
              </button>
              <button
                onClick={() => handleMobileNav('#/dashboard/metrics', 'dashboard')}
                className="p-2 text-left rounded-md text-xs font-semibold text-violet hover:bg-paper-deep"
              >
                Study Room Console
              </button>
            </div>

            <div className="pt-2 border-t border-rule flex justify-between items-center">
              {currentUser ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-medium text-charcoal truncate max-w-[200px]">
                    {currentUser.email}
                  </span>
                  <button
                    onClick={() => { onSignOut(); setMobileMenuOpen(false); }}
                    className="text-xs text-coral font-medium hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-charcoal text-paper rounded-full text-xs font-semibold text-center hover:bg-coral transition-colors"
                >
                  Get started
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav aria-label="Mobile Navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-rule py-2 px-3 flex items-center justify-around shadow-modal">
        <button
          onClick={() => { onToggleView('landing'); }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentView === 'landing' ? 'text-violet font-semibold' : 'text-charcoal-soft hover:text-charcoal'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => { onToggleView('dashboard'); window.location.hash = '#/dashboard/subjects'; }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-charcoal-soft hover:text-charcoal transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Lectures</span>
        </button>
        <button
          onClick={() => { onToggleView('dashboard'); window.location.hash = '#/dashboard/voice'; }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-charcoal-soft hover:text-charcoal transition-colors"
        >
          <Mic className="w-4 h-4" />
          <span>Ask AI</span>
        </button>
        <button
          onClick={() => { onToggleView('dashboard'); window.location.hash = '#/dashboard/flashcards'; }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-charcoal-soft hover:text-charcoal transition-colors"
        >
          <Brain className="w-4 h-4" />
          <span>Review</span>
        </button>
        <button
          onClick={() => { onToggleView('dashboard'); window.location.hash = '#/dashboard/analytics'; }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-charcoal-soft hover:text-charcoal transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Progress</span>
        </button>
      </nav>
    </>
  );
}
