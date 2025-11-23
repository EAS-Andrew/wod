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

type Step = 'input' | 'review' | 'generating';

export default function CoachInterface({ onSubmit, isLoading }: CoachInterfaceProps) {
  const { isListening, transcript, error, startListening, stopListening, clearTranscript, isSupported } =
    useSpeechRecognition();
  const { config } = useConfig();
  const haptic = useHaptic();
  const [step, setStep] = useState<Step>('input');
  const [parsedInput, setParsedInput] = useState<WODInput | null>(null);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  // Move to review step when transcript is captured
  useEffect(() => {
    if (transcript && !isListening && step === 'input') {
      const parsed = parseVoiceInput(transcript);
      const mergedInput: WODInput = {
        goal: parsed.goal || config.goal || transcript.substring(0, 200),
        available_equipment: config.available_equipment || '',
        preferences: parsed.preferences || config.preferences || '',
        limitations: config.limitations || '',
        notes: parsed.notes || config.notes || '',
      };
      setParsedInput(mergedInput);
      setStep('review');
    }
  }, [transcript, isListening, step, config]);

  // Move to generating step when loading starts
  useEffect(() => {
    if (isLoading && step === 'review') {
      setStep('generating');
    }
  }, [isLoading, step]);

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic.medium();
    clearTranscript();
    setStep('input');
    setParsedInput(null);
    
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
  };

  const handleConfirm = async () => {
    if (parsedInput) {
      haptic.success();
      await onSubmit(parsedInput);
      // Reset after submission
      setStep('input');
      setParsedInput(null);
      clearTranscript();
    }
  };

  const handleEdit = () => {
    haptic.light();
    setStep('input');
    setShowTextInput(true);
    if (parsedInput) {
      setTextInput(parsedInput.goal);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    
    const mergedInput: WODInput = {
      goal: textInput,
      available_equipment: config.available_equipment || '',
      preferences: config.preferences || '',
      limitations: config.limitations || '',
      notes: config.notes || '',
    };
    
    setParsedInput(mergedInput);
    setStep('review');
    setTextInput('');
    setShowTextInput(false);
  };

  const parseVoiceInput = (text: string): Partial<WODInput> => {
    const lower = text.toLowerCase();
    const parsed: Partial<WODInput> = {};

    parsed.goal = text;

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

  // Step 1: Input (Voice or Text)
  if (step === 'input') {
    if (!isSupported) {
      const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      return (
        <div className="flex flex-col items-center justify-center w-full text-center px-4 py-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-4 sm:space-y-6"
          >
            <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3">
              What kind of workout do you want today?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
                {config.available_equipment
                  ? `Using your ${config.available_equipment.split(',')[0]}...`
                  : "Tell me your goal and I'll create a workout"}
              </p>
            </div>

            {!showTextInput ? (
              <motion.button
                type="button"
                onClick={() => setShowTextInput(true)}
                className="w-full py-8 sm:py-12 md:py-16 px-8 rounded-3xl font-black text-lg sm:text-xl md:text-2xl bg-black text-white hover:bg-gray-800 transition-all shadow-2xl"
              >
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Type Your Goal</span>
                </div>
              </motion.button>
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
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-black focus:border-black resize-none"
                  rows={3}
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
                    disabled={!textInput.trim()}
                    className="flex-1 bg-black text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
              >
                <p className="text-sm text-blue-900 font-semibold">{error}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      );
    }

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg space-y-4 sm:space-y-6"
      >
          {/* Step Indicator */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Step 1 of 2</span>
            </div>
          </div>

          {/* Coach Prompt */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              What kind of workout do you want today?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              {config.available_equipment
                ? `Using your ${config.available_equipment.split(',')[0]}...`
                : "Tell me your goal and I'll create a workout"}
            </p>
          </motion.div>

          {/* Voice Button */}
          <motion.button
            type="button"
            onClick={isListening ? handleStop : handleStart}
            disabled={isLoading}
            whileHover={{ scale: isListening ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-8 sm:py-12 md:py-16 px-6 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-2xl ${
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
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full"
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

          {/* Transcript Preview */}
          <AnimatePresence>
            {transcript && isListening && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5"
              >
                <p className="text-base text-gray-700 leading-relaxed">{transcript}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
            >
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // Step 2: Review
  if (step === 'review' && parsedInput) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col items-center justify-center w-full px-4 py-4"
      >
        <div className="w-full max-w-lg space-y-4 sm:space-y-6">
          {/* Step Indicator */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Step 2 of 2</span>
            </div>
          </div>

          {/* Review Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-black text-gray-900 mb-4">Review Your Workout Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Goal</label>
                <p className="text-base text-gray-900 font-medium">{parsedInput.goal}</p>
              </div>

              {parsedInput.available_equipment && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Equipment</label>
                  <p className="text-base text-gray-900 font-medium">{parsedInput.available_equipment}</p>
                </div>
              )}

              {parsedInput.preferences && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Preferences</label>
                  <p className="text-base text-gray-900 font-medium">{parsedInput.preferences}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleEdit}
              className="flex-1 bg-gray-100 text-gray-900 font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-black text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Workout
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Step 3: Generating (handled by parent LoadingState)
  return null;
}
