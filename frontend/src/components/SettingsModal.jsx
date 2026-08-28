import React, { useState } from 'react';
import { X, User, Bell, Clock, Sliders, Download, Check, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsModal({ isOpen, onClose, currentUser, onSaveNotification }) {
  const [activeTab, setActiveTab] = useState('general');
  const [weeklyGoal, setWeeklyGoal] = useState(20);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sm2IntervalMultiplier, setSm2IntervalMultiplier] = useState('standard');
  const [fontSize, setFontSize] = useState('medium');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    if (onSaveNotification) {
      onSaveNotification('Settings updated successfully', 'success');
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleExportData = () => {
    const data = {
      user: currentUser?.email || 'guest',
      exportDate: new Date().toISOString(),
      tasks: localStorage.getItem('lecturemind_user_tasks') || '[]',
      stats: localStorage.getItem('lecturemind_guest_stats') || '{}',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lecturemind_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#2A2730]/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-lg bg-surface border border-border-subtle rounded-md shadow-modal overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-subtle/50">
          <div>
            <h3 className="text-base font-semibold text-text-primary">Workspace Preferences</h3>
            <p className="text-xs text-text-secondary">Manage study defaults, reminders, and data settings.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-border-subtle px-6 bg-surface">
          {[
            { id: 'general', label: 'Study & Goals', icon: Clock },
            { id: 'notifications', label: 'Reminders', icon: Bell },
            { id: 'accessibility', label: 'Accessibility', icon: Sliders },
            { id: 'data', label: 'Data & Privacy', icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-accent-primary text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Weekly Study Target (Hours)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="80"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(e.target.value)}
                    className="w-24 px-3 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-sm text-text-primary font-medium focus-ring"
                  />
                  <span className="text-xs text-text-secondary">hours recommended per week for optimal retention</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Spaced Repetition (SM-2) Pacing
                </label>
                <select
                  value={sm2IntervalMultiplier}
                  onChange={(e) => setSm2IntervalMultiplier(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-subtle border border-border-subtle rounded-sm text-xs text-text-primary focus-ring"
                >
                  <option value="relaxed">Relaxed (reviews every 4-8 days)</option>
                  <option value="standard">Standard (SM-2 standard curve: 1d, 3d, 6d)</option>
                  <option value="intensive">Intensive (reviews every 1-2 days)</option>
                </select>
              </div>

              <div className="p-3 bg-surface-tint rounded-sm border border-border-subtle">
                <span className="text-xs font-medium text-text-primary block mb-0.5">Active Session</span>
                <p className="text-xs text-text-secondary">
                  Logged in as: <span className="font-medium text-text-primary">{currentUser?.email || 'Guest Mode'}</span>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-tint rounded-sm border border-border-subtle">
                <div>
                  <span className="text-xs font-medium text-text-primary block">Daily Review Reminders</span>
                  <span className="text-[11px] text-text-secondary">Quiet ping when spaced repetition cards are due</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-tint rounded-sm border border-border-subtle">
                <div>
                  <span className="text-xs font-medium text-text-primary block">Weak Concept Alerts</span>
                  <span className="text-[11px] text-text-secondary">Notify when quiz accuracy drops below 50%</span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary"
                />
              </div>
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Reading Text Scaling
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['default', 'medium', 'comfortable'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFontSize(size)}
                      className={`py-2 px-3 rounded-sm border text-xs font-medium capitalize transition-all ${
                        fontSize === size
                          ? 'border-accent-primary bg-bg-subtle text-text-primary font-semibold'
                          : 'border-border-subtle bg-surface text-text-secondary hover:border-border-subtle'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                LectureMind uses an accessible high-contrast warm palette (WCAG AA compliant) with visible focus rings.
              </p>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-text-primary block mb-1">Data Portability</span>
                <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                  Export all your notes, flashcards, and study history in structured JSON format at any time.
                </p>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-surface border border-border-subtle text-xs font-medium text-text-primary hover:bg-bg-subtle transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-accent-primary" />
                  Download Backup Archive
                </button>
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-sm bg-accent-primary text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-soft"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
