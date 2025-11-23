'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onShowConfig: () => void;
  onShowHistory: () => void;
}

export default function MobileMenu({ isOpen, onClose, onShowConfig, onShowHistory }: MobileMenuProps) {
  const { history } = useWorkoutHistory();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden min-w-[200px]"
          >
            <div className="py-2">
              <button
                onClick={() => {
                  onShowHistory();
                  onClose();
                }}
                className="w-full px-6 py-4 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-gray-900">History</span>
                {history.length > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {history.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  onShowConfig();
                  onClose();
                }}
                className="w-full px-6 py-4 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold text-gray-900">Settings</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

