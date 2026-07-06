import React, { useState } from 'react';
import { API_URL } from '../config';
import { 
  X, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Key
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      // Validate signup password matching
      if (activeTab === 'signup' && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      let endpoint = '/api/auth/login';
      let payload = { email, password };

      if (activeTab === 'signup') {
        endpoint = '/api/auth/signup';
      } else if (activeTab === 'forgot') {
        endpoint = '/api/auth/forgot-password';
        payload = { email };
      }

      // Connect to Express backend on port 5001
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (activeTab === 'login' || activeTab === 'signup') {
        // Save session credentials directly
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccessMsg(activeTab === 'login' ? 'Logged in successfully!' : 'Account created and logged in successfully!');
        if (onAuthSuccess) onAuthSuccess(data.user);
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }, 1500);
      } else if (activeTab === 'forgot') {
        setSuccessMsg('Reset link dispatched! Please check your inbox.');
        setEmail('');
      }

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-8 overflow-hidden bg-slate-950/90 border-cyan-500/20 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Glow Element */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-20 filter blur-xl rounded-full"></div>

        {/* Dismiss Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/40 text-blue-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            LectureMind AI Gate
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            {activeTab === 'login' && 'Sign In to LectureMind'}
            {activeTab === 'signup' && 'Create Account'}
            {activeTab === 'forgot' && 'Reset Password'}
          </h3>
        </div>

        {/* Tabs switcher */}
        {activeTab !== 'forgot' && (
          <div className="flex border-b border-slate-900 mb-6 gap-2">
            <button 
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'login' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'signup' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Form Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/30 text-rose-400 text-xs flex items-center gap-2 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:border-blue-500/80 text-sm text-slate-200 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Password Input (Sign in and Signup only) */}
          {activeTab !== 'forgot' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:border-blue-500/80 text-sm text-slate-200 placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          {/* Confirm Password (Signup only) */}
          {activeTab === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:border-blue-500/80 text-sm text-slate-200 placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          {/* Forgot password link */}
          {activeTab === 'login' && (
            <div className="text-right">
              <button 
                type="button"
                onClick={() => { setActiveTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Back to sign in links */}
          {activeTab === 'forgot' && (
            <div className="text-left">
              <button 
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
              >
                &larr; Back to Sign In
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-colors shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                {activeTab === 'login' && (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
                {activeTab === 'signup' && (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Register Account
                  </>
                )}
                {activeTab === 'forgot' && (
                  <>
                    <Key className="w-4 h-4" />
                    Send Reset Link
                  </>
                )}
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
