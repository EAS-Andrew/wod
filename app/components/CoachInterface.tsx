'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useConfig } from '../hooks/useConfig';
import { useHaptic } from '../hooks/useHaptic';
import { WODInput } from '@/lib/types';

interface CoachInterfaceProps {
  onSubmit: (data: WODInput) => Promise<void>;
  isLoading: boolean;
}

export default function CoachInterface({ onSubmit, isLoading }: CoachInterfaceProps) {
  const { isListening, transcript, error, startListening, stopListening, clearTranscript, isSupported } =
    useSpeechRecognition();
  const { config } = useConfig();
  const haptic = useHaptic();
  const [hasSpoken, setHasSpoken] = useState(false);
  const [autoSubmitTimer, setAutoSubmitTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-submit after user stops speaking (2 seconds of silence)
  useEffect(() => {
    if (transcript && !isListening && hasSpoken) {
      // Clear any existing timer
      if (autoSubmitTimer) {
        clearTimeout(autoSubmitTimer);
      }

      // Set new timer to auto-submit
      const timer = setTimeout(() => {
        handleAutoSubmit();
      }, 2000);

      setAutoSubmitTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [transcript, isListening, hasSpoken]);

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    haptic.medium();
    clearTranscript();
    setHasSpoken(false);
    
    // Ensure this is called directly from user interaction (required for mobile)
    try {
      startListening();
    } catch (err) {
      console.error('Error in handleStart:', err);
      haptic.error();
    }
  };

  const handleStop = () => {
    haptic.light();
    stopListening();
    setHasSpoken(true);
  };

  const handleAutoSubmit = async () => {
    if (!transcript || !config.available_equipment) {
      return;
    }

    // Parse voice input for goal/intent
    const voiceGoal = parseVoiceInput(transcript);

    // Merge voice input with saved config
    const mergedInput: WODInput = {
      goal: voiceGoal.goal || config.goal || transcript.substring(0, 200),
      available_equipment: config.available_equipment, // Always use saved equipment
      preferences: voiceGoal.preferences || config.preferences || '',
      limitations: config.limitations || '', // Use saved limitations
      notes: voiceGoal.notes || config.notes || '',
    };

    await onSubmit(mergedInput);
    clearTranscript();
    setHasSpoken(false);
  };

  const parseVoiceInput = (text: string): Partial<WODInput> => {
    const lower = text.toLowerCase();
    const parsed: Partial<WODInput> = {};

    // Extract goal/intent
    parsed.goal = text;

    // Extract preferences from voice
    const preferences: string[] = [];
    if (lower.includes('challenging') || lower.includes('hard') || lower.includes('intense')) {
      preferences.push('Make it challenging');
    }
    if (lower.includes('moderate') || lower.includes('medium')) {
      preferences.push('Moderate intensity');
    }
    if (lower.includes('easy') || lower.includes('light')) {
      preferences.push('Light intensity');
    }
    if (lower.includes('warm') || lower.includes('cooldown')) {
      preferences.push('Include warm-up and cooldown');
    }
    if (preferences.length > 0) {
      parsed.preferences = preferences.join('. ');
    }

    return parsed;
  };

  // Text input fallback for unsupported browsers
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  
  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    
    const mergedInput: WODInput = {
      goal: textInput,
      available_equipment: config.available_equipment || '',
      preferences: config.preferences || '',
      limitations: config.limitations || '',
      notes: config.notes || '',
    };
    
    await onSubmit(mergedInput);
    setTextInput('');
  };

  if (!isSupported) {
    const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Coach Prompt */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              What kind of workout do you want today?
            </h2>
            <p className="text-gray-600 text-lg">
              {config.available_equipment
                ? `Using your ${config.available_equipment.split(',')[0]}...`
                : "Tell me your goal and I'll create a workout"}
            </p>
          </motion.div>

          {/* Text Input Fallback */}
          {!showTextInput ? (
            <>
              <motion.button
                type="button"
                onClick={() => setShowTextInput(true)}
                className="w-full py-16 px-8 rounded-3xl font-black text-2xl bg-black text-white hover:bg-gray-800 transition-all shadow-2xl"
              >
                <div className="flex flex-col items-center gap-4">
                  <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Type Your Goal</span>
                </div>
              </motion.button>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
                >
                  <p className="text-sm text-blue-900 font-semibold mb-2">{error}</p>
                  {isIOS && (
                    <p className="text-xs text-blue-800">
                      Safari on iOS 14.5+ supports voice input. If you're on an older version, you can type your workout goals instead!
                    </p>
                  )}
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g., Full body workout, 30 minutes, using kettlebells..."
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-black focus:border-black resize-none"
                rows={4}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || isLoading}
                  className="flex-1 bg-black text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Workout
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg space-y-8"
      >
        {/* Coach Prompt */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center space-y-3"
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
            What kind of workout do you want today?
          </h2>
          <p className="text-gray-600 text-lg">
            {config.available_equipment
              ? `Using your ${config.available_equipment.split(',')[0]}...`
              : "Tell me your goal and I'll create a workout"}
          </p>
        </motion.div>

        {/* Big Voice Button */}
        <motion.button
          type="button"
          onClick={isListening ? handleStop : handleStart}
          disabled={isLoading}
          whileHover={{ scale: isListening ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-16 px-6 rounded-2xl font-black text-xl transition-all shadow-2xl ${
            isListening
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-black text-white hover:bg-gray-800'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center gap-4">
            {isListening ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="w-10 h-10 bg-white rounded-full"
                  />
                </motion.div>
                <span>Listening...</span>
                <p className="text-base font-normal opacity-90">Tap to stop</p>
              </>
            ) : (
              <>
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <span>Tap to Speak</span>
              </>
            )}
          </div>
        </motion.button>

        {/* Transcript Display */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-xl p-5"
            >
              <p className="text-base text-gray-700 leading-relaxed mb-2">{transcript}</p>
              {!isListening && (
                <p className="text-sm text-gray-500">Generating workout...</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4"
          >
            <p className="text-sm text-red-800 font-medium mb-2">{error}</p>
            {error.includes('permission') && (
              <p className="text-xs text-red-700 mt-2">
                On mobile: Go to browser settings → Site permissions → Microphone → Allow
              </p>
            )}
            {error.includes('HTTPS') && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-900 font-semibold mb-1">HTTPS Required</p>
                <p className="text-xs text-yellow-800">
                  Web Speech API requires a secure connection. For development, use <code className="bg-yellow-100 px-1 rounded">localhost</code> or deploy with HTTPS.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

