'use client';

export function useHaptic() {
  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        // Vibration not supported or failed
      }
    }
  };

  const light = () => vibrate(10);
  const medium = () => vibrate(20);
  const heavy = () => vibrate([10, 50, 10]);
  const success = () => vibrate([10, 50, 10, 50, 10]);
  const error = () => vibrate([50, 100, 50]);

  return {
    vibrate,
    light,
    medium,
    heavy,
    success,
    error,
  };
}

