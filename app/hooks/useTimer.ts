'use client';

import { useState, useEffect, useRef } from 'react';

export type WODFormat = 'For time' | 'AMRAP' | 'EMOM' | 'Tabata' | 'Rounds for time' | string;

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsed: number; // in seconds
  timeCap?: number; // in minutes, converted to seconds
  format?: WODFormat;
  rounds?: number;
  currentRound?: number;
  emomMinute?: number;
  tabataRound?: number;
  tabataWorkTime?: number;
  tabataRestTime?: number;
}

export function useTimer(timeCapMinutes?: number, format?: WODFormat) {
  const normalizedFormat = format?.toLowerCase() || '';
  const isAMRAP = normalizedFormat.includes('amrap');
  const isEMOM = normalizedFormat.includes('emom');
  const isTabata = normalizedFormat.includes('tabata');
  
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    elapsed: 0,
    timeCap: timeCapMinutes ? timeCapMinutes * 60 : undefined,
    format: format,
    rounds: 0,
    currentRound: 0,
    emomMinute: 0,
    tabataRound: 0,
    tabataWorkTime: 20, // 20 seconds work
    tabataRestTime: 10, // 10 seconds rest
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const emomIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play beep sound
  const playBeep = () => {
    try {
      // Create audio context for beep
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (err) {
      console.log('Could not play beep sound');
    }
  };

  // Main timer interval
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const newElapsed = prev.elapsed + 1;
          
          // EMOM: Check if new minute started
          if (isEMOM && newElapsed > 0 && newElapsed % 60 === 0) {
            playBeep();
            return {
              ...prev,
              elapsed: newElapsed,
              emomMinute: Math.floor(newElapsed / 60),
            };
          }
          
          // Tabata: Handle work/rest intervals
          if (isTabata) {
            const cycleTime = (prev.tabataWorkTime || 20) + (prev.tabataRestTime || 10);
            const cyclePosition = newElapsed % cycleTime;
            const newTabataRound = Math.floor(newElapsed / cycleTime);
            
            // Beep at start of work and rest periods
            if (cyclePosition === 0 || cyclePosition === (prev.tabataWorkTime || 20)) {
              playBeep();
            }
            
            // Check if time cap reached
            if (prev.timeCap && newElapsed >= prev.timeCap) {
              return {
                ...prev,
                elapsed: prev.timeCap,
                isRunning: false,
                tabataRound: newTabataRound,
              };
            }
            
            return {
              ...prev,
              elapsed: newElapsed,
              tabataRound: newTabataRound,
            };
          }
          
          // Check if time cap reached (for For time, AMRAP, etc.)
          if (prev.timeCap && newElapsed >= prev.timeCap) {
            playBeep();
            return {
              ...prev,
              elapsed: prev.timeCap,
              isRunning: false,
            };
          }
          
          return {
            ...prev,
            elapsed: newElapsed,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.isPaused, isEMOM, isTabata]);

  const start = () => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));
  };

  const pause = () => {
    setState((prev) => ({
      ...prev,
      isPaused: true,
    }));
  };

  const resume = () => {
    setState((prev) => ({
      ...prev,
      isPaused: false,
    }));
  };

  const reset = () => {
    setState({
      isRunning: false,
      isPaused: false,
      elapsed: 0,
      timeCap: timeCapMinutes ? timeCapMinutes * 60 : undefined,
      format: format,
      rounds: 0,
      currentRound: 0,
      emomMinute: 0,
      tabataRound: 0,
      tabataWorkTime: 20,
      tabataRestTime: 10,
    });
  };

  const addRound = () => {
    setState((prev) => ({
      ...prev,
      rounds: (prev.rounds || 0) + 1,
      currentRound: (prev.currentRound || 0) + 1,
    }));
  };

  const subtractRound = () => {
    setState((prev) => ({
      ...prev,
      rounds: Math.max(0, (prev.rounds || 0) - 1),
      currentRound: Math.max(0, (prev.currentRound || 0) - 1),
    }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = state.timeCap
    ? Math.max(0, state.timeCap - state.elapsed)
    : undefined;

  // Tabata-specific calculations
  const getTabataPhase = () => {
    if (!isTabata) return null;
    const cycleTime = (state.tabataWorkTime || 20) + (state.tabataRestTime || 10);
    const cyclePosition = state.elapsed % cycleTime;
    return cyclePosition < (state.tabataWorkTime || 20) ? 'work' : 'rest';
  };

  const getTabataPhaseTime = () => {
    if (!isTabata) return null;
    const cycleTime = (state.tabataWorkTime || 20) + (state.tabataRestTime || 10);
    const cyclePosition = state.elapsed % cycleTime;
    if (cyclePosition < (state.tabataWorkTime || 20)) {
      return (state.tabataWorkTime || 20) - cyclePosition;
    } else {
      return cycleTime - cyclePosition;
    }
  };

  return {
    ...state,
    start,
    pause,
    resume,
    reset,
    addRound,
    subtractRound,
    formatTime,
    remainingTime,
    formattedElapsed: formatTime(state.elapsed),
    formattedRemaining: remainingTime !== undefined ? formatTime(remainingTime) : undefined,
    isAMRAP,
    isEMOM,
    isTabata,
    tabataPhase: getTabataPhase(),
    tabataPhaseTime: getTabataPhaseTime(),
  };
}

