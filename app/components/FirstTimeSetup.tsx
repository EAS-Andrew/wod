'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useConfig } from '../hooks/useConfig';
import { WODInput } from '@/lib/types';

interface FirstTimeSetupProps {
  onComplete: () => void;
}

export default function FirstTimeSetup({ onComplete }: FirstTimeSetupProps) {
  const { isListening, transcript, startListening, stopListening, clearTranscript, isSupported } =
    useSpeechRecognition();
  const { updateConfig } = useConfig();
  const [step, setStep] = useState<'equipment' | 'complete'>('equipment');
  const [equipment, setEquipment] = useState('');

  const handleEquipmentSubmit = () => {
    if (equipment.trim()) {
      updateConfig({ available_equipment: equipment });
      setStep('complete');
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setEquipment(transcript);
      }
    } else {
      clearTranscript();
      startListening();
    }
  };

  if (step === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">All set!</h2>
        <p className="text-gray-600">You're ready to generate workouts</p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-2"
      >
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">Let's get started</h2>
        <p className="text-gray-600 text-lg">What equipment do you have available?</p>
      </motion.div>

      {isSupported ? (
        <div className="space-y-4">
          <motion.button
            type="button"
            onClick={handleVoiceInput}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-6 px-5 rounded-xl font-bold text-lg transition-all ${
              isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isListening ? 'Listening... Tap to stop' : '🎤 Tell me your equipment'}
          </motion.button>

          {transcript && !isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4"
            >
              <p className="text-gray-700 mb-3 text-base">{transcript}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEquipment(transcript);
                    clearTranscript();
                  }}
                  className="flex-1 bg-black text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800"
                >
                  Use This
                </button>
                <button
                  onClick={clearTranscript}
                  className="px-4 py-2 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">Or type it here:</label>
        <textarea
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none"
          placeholder="e.g., Kettlebell, dumbbells, pull-up bar"
        />
      </div>

      <motion.button
        type="button"
        onClick={handleEquipmentSubmit}
        disabled={!equipment.trim()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-black text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Continue
      </motion.button>
    </div>
  );
}

