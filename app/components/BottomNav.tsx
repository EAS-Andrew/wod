'use client';

import { motion } from 'framer-motion';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useHaptic } from '../hooks/useHaptic';

interface BottomNavProps {
  onShowHome: () => void;
  onShowHistory: () => void;
  onShowConfig: () => void;
  currentView?: 'home' | 'history' | 'settings';
}

export default function BottomNav({ onShowHome, onShowHistory, onShowConfig, currentView = 'home' }: BottomNavProps) {
  const { history } = useWorkoutHistory();
  const haptic = useHaptic();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto px-2 py-1.5">
        <div className="flex items-center justify-around">
          <button
            onClick={() => {
              haptic.light();
              onShowHome();
            }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg active:scale-95 transition-transform ${
              currentView === 'home' ? 'text-black' : 'text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className={`text-[10px] leading-tight ${currentView === 'home' ? 'font-bold' : 'font-medium'}`}>
              Start
            </span>
          </button>

          <button
            onClick={() => {
              haptic.light();
              onShowHistory();
            }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg active:scale-95 transition-transform ${
              currentView === 'history' ? 'text-black' : 'text-gray-600'
            }`}
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {history.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </div>
            <span className={`text-[10px] leading-tight ${currentView === 'history' ? 'font-bold' : 'font-medium'}`}>
              History
            </span>
          </button>

          <button
            onClick={() => {
              haptic.light();
              onShowConfig();
            }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg active:scale-95 transition-transform ${
              currentView === 'settings' ? 'text-black' : 'text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`text-[10px] leading-tight ${currentView === 'settings' ? 'font-bold' : 'font-medium'}`}>
              Settings
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

