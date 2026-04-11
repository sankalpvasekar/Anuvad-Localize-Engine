import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorToastProps {
  message: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

const ErrorToast = ({ message, onClose, onRetry }: ErrorToastProps) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-full max-w-sm"
        >
          <div className="bg-white rounded-3xl p-4 shadow-[0_16px_48px_-12px_rgba(239,68,68,0.15)] border border-red-100 flex items-center gap-4 group">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 flex-shrink-0">
              <AlertCircle size={24} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-red-900 uppercase tracking-wider mb-0.5">Oops! Something failed</h4>
              <p className="text-xs text-red-600 font-bold truncate leading-relaxed">
                {message}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                >
                  <RefreshCw size={18} />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 hover:bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast;
