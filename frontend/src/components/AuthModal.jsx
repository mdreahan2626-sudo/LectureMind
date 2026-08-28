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
  Key,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';

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
      if (activeTab === 'signup' && password !== confirmPassword) {
        throw new Error("Passwords do not match. Please re-enter.");
      }

      let endpoint = '/api/auth/login';
      let payload = { email, password };

      if (activeTab === 'signup') {
        endpoint = '/api/auth/signup';
      } else if (activeTab === 'forgot') {
        endpoint = '/api/auth/forgot-password';
        payload = { email };
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('[Auth Service Error]:', text);
        throw new Error(`Authentication service unavailable (${response.status}). Please check API connectivity.`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Unable to authenticate with provided credentials.');
      }

      if (activeTab === 'login' || activeTab === 'signup') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccessMsg(activeTab === 'login' ? 'Signed in successfully.' : 'Account registered successfully.');
        if (onAuthSuccess) onAuthSuccess(data.user);
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }, 1200);
      } else if (activeTab === 'forgot') {
        setSuccessMsg('A password reset link has been dispatched to your email.');
        setEmail('');
      }

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#2A2730]/25 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-md bg-surface border border-border-subtle rounded-md p-8 shadow-modal z-10"
      >
        
        {/* Dismiss Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-accent-primary/10 text-accent-primary mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-text-primary font-display">
            {activeTab === 'login' && 'Sign in to LectureMind'}
            {activeTab === 'signup' && 'Create your workspace'}
            {activeTab === 'forgot' && 'Reset password'}
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            {activeTab === 'login' && 'Enter your credentials to continue your study sessions.'}
            {activeTab === 'signup' && 'Join students and researchers mapping ideas with LectureMind.'}
            {activeTab === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Tabs switcher */}
        {activeTab !== 'forgot' && (
          <div className="flex border-b border-border-subtle mb-6 gap-2">
            <button 
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'login' 
                  ? 'border-accent-primary text-text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'signup' 
                  ? 'border-accent-primary text-text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-sm bg-danger-subtle border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-sm bg-success-subtle border border-success/30 text-success text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-primary">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-9 pr-4 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary placeholder:text-text-muted focus-ring"
              />
            </div>
          </div>

          {activeTab !== 'forgot' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-primary">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary placeholder:text-text-muted focus-ring"
                />
              </div>
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-primary">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary placeholder:text-text-muted focus-ring"
                />
              </div>
            </div>
          )}

          {activeTab === 'login' && (
            <div className="text-right">
              <button 
                type="button"
                onClick={() => { setActiveTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs text-text-secondary hover:text-accent-primary transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {activeTab === 'forgot' && (
            <div className="text-left">
              <button 
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs text-accent-primary hover:underline font-medium"
              >
                &larr; Back to sign in
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-sm text-xs font-semibold text-white bg-accent-primary hover:bg-accent-hover transition-colors shadow-soft flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              'Processing…'
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
                    Create Workspace
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

      </motion.div>
    </div>
  );
}
