import React, { useState, useEffect } from 'react';
import { Sparkles, GraduationCap, Menu, X, ArrowRight, LogOut, User, LayoutDashboard, Home } from 'lucide-react';

export default function Header({ currentUser, onOpenAuth, onSignOut, currentView, onToggleView }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'py-3 bg-slate-950/80 backdrop-blur-md border-b border-blue-950/40 shadow-lg shadow-blue-950/10' 
        : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => onToggleView('landing')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <GraduationCap className="w-5.5 h-5.5" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-[2px]"></div>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Lecture<span className="text-gradient-blue font-extrabold">Mind</span>
              <span className="text-xs ml-1 px-1.5 py-0.5 rounded-md bg-blue-950 text-blue-400 border border-blue-800/30 font-medium vertical-super">AI</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {currentView === 'dashboard' ? (
              <button 
                onClick={() => onToggleView('landing')}
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Home className="w-4 h-4 text-blue-400" />
                Landing Page
              </button>
            ) : (
              <>
                <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
                <a href="#sandbox" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Try Sandbox</a>
                <a href="#tech" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Architecture</a>
              </>
            )}
            
            {currentUser && (
              <button 
                onClick={() => onToggleView(currentView === 'landing' ? 'dashboard' : 'landing')}
                className={`text-sm font-semibold transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-950/40 border-blue-500/30 text-blue-400' 
                    : 'bg-slate-900/30 border-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {currentView === 'landing' ? 'Go to Dashboard' : 'Dashboard Active'}
              </button>
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-xl">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  {currentUser.email}
                </span>
                <button 
                  onClick={onSignOut}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={onOpenAuth}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={onOpenAuth}
                  className="relative group px-4.5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-indigo-500/40"
                >
                  <span className="flex items-center gap-1.5">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-x-0 border-b border-blue-900/30 absolute top-full left-0 right-0 py-6 px-4 animate-in fade-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col gap-4 mb-6">
            {currentView === 'dashboard' ? (
              <button 
                onClick={() => { onToggleView('landing'); setMobileMenuOpen(false); }}
                className="text-left text-base font-semibold text-slate-300 hover:text-white transition-colors py-2 border-b border-slate-900/40 flex items-center gap-1.5"
              >
                <Home className="w-4 h-4 text-blue-400" />
                Landing Page
              </button>
            ) : (
              <>
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-slate-300 hover:text-white transition-colors py-2 border-b border-slate-900/40"
                >
                  Features
                </a>
                <a 
                  href="#sandbox" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-slate-300 hover:text-white transition-colors py-2 border-b border-slate-900/40"
                >
                  Try Sandbox
                </a>
                <a 
                  href="#tech" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-slate-300 hover:text-white transition-colors py-2 border-b border-slate-900/40"
                >
                  Architecture
                </a>
              </>
            )}

            {currentUser && (
              <button 
                onClick={() => { onToggleView(currentView === 'landing' ? 'dashboard' : 'landing'); setMobileMenuOpen(false); }}
                className="text-left text-base font-semibold text-blue-400 hover:text-white transition-colors py-2 border-b border-slate-900/40 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                {currentView === 'landing' ? 'Go to Dashboard' : 'Back to Home'}
              </button>
            )}
          </nav>
          
          <div className="flex flex-col gap-3">
            {currentUser ? (
              <div className="flex flex-col gap-2 p-3 bg-slate-900 rounded-xl text-center">
                <span className="text-sm font-semibold text-slate-400 block truncate">{currentUser.email}</span>
                <button 
                  onClick={() => { onSignOut(); setMobileMenuOpen(false); }}
                  className="w-full py-2 rounded-lg text-sm text-rose-400 bg-rose-950/20 border border-rose-900/20 hover:bg-rose-950/40 font-bold transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-900 transition-all"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
