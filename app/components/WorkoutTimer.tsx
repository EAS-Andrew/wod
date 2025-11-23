'use client';

import { useTimer } from '../hooks/useTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { WODOutput } from '@/lib/types';

interface WorkoutTimerProps {
  wod: WODOutput;
  onComplete?: () => void;
}

export default function WorkoutTimer({ wod, onComplete }: WorkoutTimerProps) {
  const timer = useTimer(wod.time_cap_minutes, wod.format);

  const handleToggle = () => {
    if (!timer.isRunning) {
      timer.start();
    } else if (timer.isPaused) {
      timer.resume();
    } else {
      timer.pause();
    }
  };

  const isTimeUp = Boolean(timer.timeCap && timer.elapsed >= timer.timeCap);

  // Auto-complete callback
  if (isTimeUp && timer.isRunning && onComplete) {
    setTimeout(() => {
      onComplete();
    }, 100);
  }

  return (
    <div className="bg-black text-white rounded-2xl p-6 shadow-2xl">
      {/* Format Badge */}
      <div className="text-center mb-4">
        <div className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
          {wod.format}
        </div>
        {timer.timeCap && (
          <p className="text-xs text-gray-400 mt-1">
            Time Cap: {timer.formatTime(timer.timeCap)}
          </p>
        )}
      </div>

      {/* Main Timer Display */}
      <div className="text-center mb-6">
        <motion.div
          key={timer.elapsed}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={`text-6xl font-bold tabular-nums mb-2 ${
            isTimeUp ? 'text-red-500' : ''
          }`}
        >
          {timer.formattedElapsed}
        </motion.div>
        
        {/* Remaining Time */}
        {timer.formattedRemaining && (
          <div className="text-sm text-gray-400">
            Remaining: {timer.formattedRemaining}
          </div>
        )}

        {/* EMOM Display */}
        {timer.isEMOM && (
          <div className="mt-3 p-3 bg-gray-900 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Current Minute</div>
            <div className="text-2xl font-bold">{timer.emomMinute || 0}</div>
          </div>
        )}

        {/* Tabata Display */}
        {timer.isTabata && timer.tabataPhase && (
          <div className="mt-3 p-3 bg-gray-900 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">
              Round {timer.tabataRound || 0} / 8
            </div>
            <div className={`text-xl font-bold ${
              timer.tabataPhase === 'work' ? 'text-red-500' : 'text-green-500'
            }`}>
              {timer.tabataPhase === 'work' ? 'WORK' : 'REST'}
            </div>
            {timer.tabataPhaseTime !== null && (
              <div className="text-2xl font-bold mt-1">
                {timer.formatTime(timer.tabataPhaseTime)}
              </div>
            )}
          </div>
        )}

        {/* AMRAP Rounds Counter */}
        {timer.isAMRAP && (
          <div className="mt-3 p-3 bg-gray-900 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Rounds Completed</div>
            <div className="text-3xl font-bold">{timer.rounds || 0}</div>
            <div className="flex gap-2 justify-center mt-2">
              <button
                onClick={timer.subtractRound}
                className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm"
                disabled={!timer.isRunning || timer.isPaused}
              >
                −
              </button>
              <button
                onClick={timer.addRound}
                className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm"
                disabled={!timer.isRunning || timer.isPaused}
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Time's Up Alert */}
      <AnimatePresence>
        {isTimeUp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-600 text-white text-center py-3 px-4 rounded-lg mb-4 font-semibold"
          >
            Time's Up! 🏁
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleToggle}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
          disabled={isTimeUp}
        >
          {!timer.isRunning ? 'Start' : timer.isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={timer.reset}
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-colors active:scale-95"
        >
          Reset
        </button>
      </div>

      {/* Format-specific instructions */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        {timer.isAMRAP && (
          <p className="text-xs text-gray-400 text-center">
            Complete as many rounds as possible. Tap + after each round.
          </p>
        )}
        {timer.isEMOM && (
          <p className="text-xs text-gray-400 text-center">
            Complete the work at the start of each minute. Timer beeps every minute.
          </p>
        )}
        {timer.isTabata && (
          <p className="text-xs text-gray-400 text-center">
            20 seconds work, 10 seconds rest. 8 rounds total.
          </p>
        )}
        {!timer.isAMRAP && !timer.isEMOM && !timer.isTabata && (
          <p className="text-xs text-gray-400 text-center">
            Complete the workout as fast as possible.
          </p>
        )}
      </div>
    </div>
  );
}
