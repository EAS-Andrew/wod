'use client';

import { useTimer } from '../hooks/useTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { WODOutput } from '@/lib/types';
import { useHaptic } from '../hooks/useHaptic';
import { useOrientation } from '../hooks/useOrientation';

interface WorkoutTimerProps {
  wod: WODOutput;
}

export default function WorkoutTimer({ wod }: WorkoutTimerProps) {
  const timer = useTimer(wod.time_cap_minutes, wod.format);
  const haptic = useHaptic();
  const isLandscape = useOrientation();

  const handleToggle = () => {
    haptic.light();
    if (!timer.isRunning) {
      timer.start();
    } else if (timer.isPaused) {
      timer.resume();
    } else {
      timer.pause();
    }
  };

  const handleReset = () => {
    haptic.light();
    timer.reset();
  };

  const isTimeUp = Boolean(timer.timeCap && timer.elapsed >= timer.timeCap);

  // Portrait: Compact pill at bottom
  if (!isLandscape) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-[76px] left-1/2 transform -translate-x-1/2 z-50 safe-area-inset-bottom"
      >
        <div className={`rounded-full px-4 py-2.5 shadow-lg flex items-center gap-3 ${
          isTimeUp ? 'bg-red-600' : 'bg-black'
        }`}>
          {/* Format Label */}
          <div className="text-[10px] text-white/70 font-medium uppercase tracking-wide">
            {wod.format}
          </div>

          {/* Timer Display */}
          <motion.div
            key={timer.elapsed}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className={`text-base font-bold tabular-nums ${
              isTimeUp ? 'text-red-200' : 'text-white'
            }`}
          >
            {timer.formattedElapsed}
          </motion.div>

          {/* Remaining Time (if time cap) */}
          {timer.formattedRemaining && timer.timeCap && (
            <div className="text-xs text-white/60 font-medium">
              / {timer.formattedRemaining}
            </div>
          )}

          {/* Format-Specific Info */}
          {timer.isAMRAP && (
            <div className="flex items-center gap-1.5">
              <div className="text-xs text-white/80 font-medium">
                {timer.rounds || 0} rounds
              </div>
              {timer.isRunning && (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={timer.subtractRound}
                    className="w-5 h-5 bg-white/20 hover:bg-white/30 text-white rounded text-[10px] font-bold active:scale-95 flex items-center justify-center"
                    disabled={timer.isPaused}
                  >
                    −
                  </button>
                  <button
                    onClick={timer.addRound}
                    className="w-5 h-5 bg-white/20 hover:bg-white/30 text-white rounded text-[10px] font-bold active:scale-95 flex items-center justify-center"
                    disabled={timer.isPaused}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )}

          {timer.isEMOM && timer.emomMinute !== undefined && (
            <div className="text-xs text-white/80 font-medium">
              Min {timer.emomMinute}
            </div>
          )}

          {timer.isTabata && timer.tabataRound !== undefined && (
            <div className="flex items-center gap-1.5">
              <div className={`text-xs font-medium ${
                timer.tabataPhase === 'work' ? 'text-red-300' : 'text-green-300'
              }`}>
                {timer.tabataRound + 1}/8
              </div>
              {timer.tabataPhaseTime !== null && (
                <div className={`text-xs font-bold ${
                  timer.tabataPhase === 'work' ? 'text-red-300' : 'text-green-300'
                }`}>
                  {timer.formatTime(timer.tabataPhaseTime)}
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={handleToggle}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors active:scale-95 ${
                timer.isRunning && !timer.isPaused
                  ? 'bg-red-600 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              disabled={isTimeUp}
            >
              {!timer.isRunning ? 'Start' : timer.isPaused ? 'Resume' : 'Pause'}
            </button>

            {timer.isRunning && (
              <button
                onClick={handleReset}
                className="px-1.5 py-1 text-white/70 hover:text-white transition-colors"
                aria-label="Reset"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Time's Up Indicator */}
        <AnimatePresence>
          {isTimeUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
            >
              Time's Up! 🏁
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Landscape: Rich timer panel (50/50 split)
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed right-0 top-0 bottom-0 w-1/2 bg-black text-white z-40 shadow-2xl safe-area-inset-top safe-area-inset-bottom overflow-y-auto"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-white/20 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-black uppercase tracking-wide">{wod.format}</h3>
            {timer.timeCap && (
              <div className="text-sm text-white/70">
                Cap: {timer.formatTime(timer.timeCap)}
              </div>
            )}
          </div>
          <h4 className="text-sm text-white/60">{wod.wod_title}</h4>
        </div>

        {/* Main Timer */}
        <div className="text-center py-4">
          <motion.div
            key={timer.elapsed}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className={`text-5xl font-bold tabular-nums mb-2 ${
              isTimeUp ? 'text-red-400' : 'text-white'
            }`}
          >
            {timer.formattedElapsed}
          </motion.div>
          {timer.formattedRemaining && timer.timeCap && (
            <div className="text-lg text-white/60">
              {timer.formattedRemaining} remaining
            </div>
          )}
        </div>

        {/* Format-Specific Rich Display */}
        {timer.isAMRAP && (
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-sm text-white/70 mb-3 uppercase tracking-wide">Rounds Completed</div>
            <div className="text-4xl font-black mb-4">{timer.rounds || 0}</div>
            {timer.isRunning && (
              <div className="flex gap-2">
                <button
                  onClick={timer.subtractRound}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 rounded-lg text-lg font-bold active:scale-95"
                  disabled={timer.isPaused}
                >
                  −
                </button>
                <button
                  onClick={timer.addRound}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 rounded-lg text-lg font-bold active:scale-95"
                  disabled={timer.isPaused}
                >
                  +
                </button>
              </div>
            )}
          </div>
        )}

        {timer.isEMOM && (
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-sm text-white/70 mb-3 uppercase tracking-wide">Current Minute</div>
            <div className="text-4xl font-black">{timer.emomMinute || 0}</div>
            <div className="text-xs text-white/60 mt-2">Timer beeps at start of each minute</div>
          </div>
        )}

        {timer.isTabata && timer.tabataRound !== undefined && (
          <div className="space-y-3">
            <div className={`rounded-xl p-4 ${
              timer.tabataPhase === 'work' ? 'bg-red-600/30' : 'bg-green-600/30'
            }`}>
              <div className="text-sm text-white/70 mb-2 uppercase tracking-wide">
                Round {timer.tabataRound + 1} of 8
              </div>
              <div className={`text-3xl font-black mb-2 ${
                timer.tabataPhase === 'work' ? 'text-red-300' : 'text-green-300'
              }`}>
                {timer.tabataPhase === 'work' ? 'WORK' : 'REST'}
              </div>
              {timer.tabataPhaseTime !== null && (
                <div className={`text-2xl font-bold ${
                  timer.tabataPhase === 'work' ? 'text-red-300' : 'text-green-300'
                }`}>
                  {timer.formatTime(timer.tabataPhaseTime)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-3 pt-4 border-t border-white/20">
          <button
            onClick={handleToggle}
            className={`w-full py-4 rounded-xl text-base font-bold transition-colors active:scale-95 ${
              timer.isRunning && !timer.isPaused
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            disabled={isTimeUp}
          >
            {!timer.isRunning ? 'Start Timer' : timer.isPaused ? 'Resume' : 'Pause'}
          </button>

          {timer.isRunning && (
            <button
              onClick={handleReset}
              className="w-full py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors active:scale-95 font-semibold"
            >
              Reset Timer
            </button>
          )}
        </div>

        {/* Time's Up Alert */}
        <AnimatePresence>
          {isTimeUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-600 text-white text-center py-4 px-4 rounded-xl font-bold"
            >
              Time's Up! 🏁
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
