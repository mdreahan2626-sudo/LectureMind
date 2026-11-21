import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, AlertCircle, TrendingUp, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationDropdown({ onSelectAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      category: 'processing',
      title: 'Processing complete',
      description: 'Quantum Mechanics lecture notes & 12 flashcards are ready.',
      time: '12m ago',
      unread: true,
      actionTarget: '#/dashboard/subjects'
    },
    {
      id: 2,
      category: 'review',
      title: 'Review due',
      description: '4 flashcards for Deep Learning are due for SM-2 recall.',
      time: '1h ago',
      unread: true,
      actionTarget: '#/dashboard/flashcards'
    },
    {
      id: 3,
      category: 'alert',
      title: 'Recall review alert',
      description: 'Your uploaded lecture material has key concepts ready for spaced repetition review.',
      time: '5h ago',
      unread: false,
      actionTarget: '#/dashboard/metrics'
    },
    {
      id: 4,
      category: 'insight',
      title: 'Weekly insight ready',
      description: 'You completed 14.5 study hours this week — 72% of your goal.',
      time: '1d ago',
      unread: false,
      actionTarget: '#/dashboard/analytics'
    }
  ]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'processing':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#6FBF9A]" />;
      case 'review':
        return <Clock className="w-3.5 h-3.5 text-[#8C7CF0]" />;
      case 'alert':
        return <AlertCircle className="w-3.5 h-3.5 text-[#E0725C]" />;
      case 'insight':
        return <TrendingUp className="w-3.5 h-3.5 text-[#F4CE6B]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#8C7CF0]" />;
    }
  };

  const handleItemClick = (target) => {
    setIsOpen(false);
    if (onSelectAction && target) {
      onSelectAction(target);
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    setHasUnread(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Quiet bell button with small dot */}
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors focus-ring"
      >
        <Bell className="w-4 h-4" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-primary"></span>
        )}
      </button>

      {/* Slim Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border-subtle rounded-md shadow-modal z-50 overflow-hidden"
          >
            {/* Dropdown Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-subtle/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary">Notifications</span>
                <span className="text-[11px] font-medium text-text-secondary">
                  {notifications.filter(n => n.unread).length} new
                </span>
              </div>
              <button
                onClick={markAllRead}
                className="text-[11px] text-accent-primary hover:underline font-medium"
              >
                Mark all read
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.actionTarget)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-bg-subtle/60 ${
                    item.unread ? 'bg-surface-tint/50' : 'bg-surface'
                  }`}
                >
                  <div className="p-1.5 rounded-sm bg-bg-subtle border border-border-subtle shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-medium text-text-primary truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-text-muted shrink-0 tabular-nums">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-snug">
                      {item.description}
                    </p>
                  </div>
                  {item.unread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0 mt-2"></span>
                  )}
                </div>
              ))}
            </div>

            {/* Dropdown Footer */}
            <div className="p-2 border-t border-border-subtle bg-bg-subtle/30 text-center">
              <span className="text-[11px] text-text-muted">
                Notifications auto-archive after 7 days
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
