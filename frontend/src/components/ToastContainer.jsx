import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToastContainer({ toasts, onDismiss }) {
  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'border-l-[#6FBF9A]';
      case 'warning': return 'border-l-[#F4CE6B]';
      case 'danger':
      case 'error': return 'border-l-[#E0725C]';
      default: return 'border-l-[#8C7CF0]';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-[#6FBF9A] shrink-0" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-[#F4CE6B] shrink-0" />;
      case 'danger':
      case 'error': return <AlertCircle className="w-4 h-4 text-[#E0725C] shrink-0" />;
      default: return <Info className="w-4 h-4 text-[#8C7CF0] shrink-0" />;
    }
  };

  return (
    <aside aria-label="Notifications" className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto bg-surface border border-border-subtle border-l-[3.5px] ${getBorderColor(t.type)} rounded-md p-3.5 shadow-hover flex items-start gap-3 justify-between`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="mt-0.5">{getIcon(t.type)}</div>
              <div className="min-w-0">
                {t.title && <h5 className="text-xs font-semibold text-text-primary">{t.title}</h5>}
                <p className="text-xs text-text-secondary leading-snug">{t.message}</p>
              </div>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-text-muted hover:text-text-primary p-0.5 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
}
