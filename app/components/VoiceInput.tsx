'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, placeholder = 'Tap to speak...', disabled }: VoiceInputProps) {
  const { isListening, transcript, error, startListening, stopListening, clearTranscript, isSupported } =
    useSpeechRecognition();
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  const handleToggle = () => {
    if (disabled) return;
    
    if (isListening) {
      stopListening();
      setIsRecording(false);
    } else {
      clearTranscript();
      startListening();
      setIsRecording(true);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        Voice input is not supported in your browser. Please use Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
          isListening
            ? 'bg-red-600 text-white animate-pulse'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center justify-center gap-3">
          {isListening ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-3 h-3 bg-white rounded-full"
              />
              <span>Listening... Tap to stop</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span>{placeholder}</span>
            </>
          )}
        </div>
      </button>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-semibold text-gray-700">You said:</p>
              <button
                type="button"
                onClick={clearTranscript}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Clear"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-base text-gray-900 leading-relaxed">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-xl p-3"
        >
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </motion.div>
      )}
    </div>
  );
}

