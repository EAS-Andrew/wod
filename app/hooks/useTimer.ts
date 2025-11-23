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
  countdown?: number; // countdown in seconds (10, 9, 8, ...)
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
    countdown: undefined,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const emomIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context (must be done on user interaction)
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume if suspended (browsers suspend audio context by default)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  // Play beep sound
  const playBeep = (frequency: number = 800, duration: number = 0.1) => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (err) {
      console.log('Could not play beep sound:', err);
    }
  };

  // Countdown interval
  useEffect(() => {
    if (state.countdown !== undefined && state.countdown > 0 && !state.isRunning) {
      countdownIntervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.countdown === undefined) return prev;
          
          const newCountdown = prev.countdown - 1;
          
          // Beep on 3, 2, 1
          if (newCountdown <= 3 && newCountdown > 0) {
            playBeep(1000, 0.15); // Higher pitch, longer beep for countdown
          }
          
          // Start timer when countdown reaches 0
          if (newCountdown === 0) {
            playBeep(1200, 0.3); // Final beep to start
            return {
              ...prev,
              countdown: undefined,
              isRunning: true,
              isPaused: false,
            };
          }
          
          return {
            ...prev,
            countdown: newCountdown,
          };
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [state.countdown, state.isRunning]);

  // Main timer interval
  useEffect(() => {
    if (state.isRunning && !state.isPaused && state.countdown === undefined) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const newElapsed = prev.elapsed + 1;
          
          // EMOM: Check if new minute started
          if (isEMOM && newElapsed > 0 && newElapsed % 60 === 0) {
            playBeep(880, 0.1); // High pitch beep for new minute
            return {
              ...prev,
              elapsed: newElapsed,
              emomMinute: Math.floor(newElapsed / 60),
            };
          }
          
          // Every minute beep (for non-EMOM timers) - progress indicator
          if (!isEMOM && !isTabata && newElapsed > 0 && newElapsed % 60 === 0) {
            playBeep(600, 0.08); // Lower pitch, shorter beep for minute markers
          }
          
          // Time warnings: Halfway point and final countdown
          if (prev.timeCap) {
            const remaining = prev.timeCap - newElapsed;
            const halfway = prev.timeCap / 2;
            
            // Halfway warning
            if (newElapsed === Math.floor(halfway) && newElapsed > 0) {
              playBeep(700, 0.2); // Medium pitch, longer beep
            }
            
            // Last 30 seconds warning
            if (remaining === 30 && remaining > 0) {
              playBeep(900, 0.15);
            }
            
            // Last 10 seconds countdown
            if (remaining <= 10 && remaining > 0) {
              playBeep(1000, 0.1); // High pitch beep for urgency
            }
          }
          
          // Tabata: Handle work/rest intervals
          if (isTabata) {
            const cycleTime = (prev.tabataWorkTime || 20) + (prev.tabataRestTime || 10);
            const cyclePosition = newElapsed % cycleTime;
            const newTabataRound = Math.floor(newElapsed / cycleTime);
            
            // Beep at start of work and rest periods
            if (cyclePosition === 0) {
              playBeep(1000, 0.1); // High pitch for work start
            } else if (cyclePosition === (prev.tabataWorkTime || 20)) {
              playBeep(440, 0.1); // Lower pitch for rest start
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
            playBeep(220, 0.5); // Low pitch, long beep for time cap
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
  }, [state.isRunning, state.isPaused, state.countdown, isEMOM, isTabata]);

  const start = () => {
    // Activate audio context on user interaction
    getAudioContext();
    setState((prev) => ({
      ...prev,
      countdown: 10, // Start 10 second countdown
      isRunning: false,
      isPaused: false,
    }));
  };

  const pause = () => {
    playBeep(500, 0.1); // Lower pitch beep for pause
    setState((prev) => ({
      ...prev,
      isPaused: true,
    }));
  };

  const resume = () => {
    playBeep(600, 0.1); // Medium pitch beep for resume
    setState((prev) => ({
      ...prev,
      isPaused: false,
    }));
  };

  const reset = () => {
    playBeep(400, 0.15); // Low pitch beep for reset
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
      countdown: undefined,
    });
  };

  const addRound = () => {
    playBeep(800, 0.08); // Quick beep for round added
    setState((prev) => ({
      ...prev,
      rounds: (prev.rounds || 0) + 1,
      currentRound: (prev.currentRound || 0) + 1,
    }));
  };

  const subtractRound = () => {
    playBeep(600, 0.08); // Quick beep for round subtracted
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

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

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
    isCountdown: state.countdown !== undefined,
  };
}

