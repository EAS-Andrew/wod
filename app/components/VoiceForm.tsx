'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { WODInput } from '@/lib/types';

interface VoiceFormProps {
  onSubmit: (data: WODInput) => Promise<void>;
  isLoading: boolean;
}

export default function VoiceForm({ onSubmit, isLoading }: VoiceFormProps) {
  const { isListening, transcript, error, startListening, stopListening, clearTranscript, isSupported } =
    useSpeechRecognition();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<WODInput>>({});

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      // Parse the transcript and populate form fields
      parseTranscript(transcript);
      setShowForm(true);
    } else {
      clearTranscript();
      setFormData({});
      setShowForm(false);
      startListening();
    }
  };

  const parseTranscript = (text: string) => {
    const lower = text.toLowerCase();
    const data: Partial<WODInput> = {};

    // Try to extract goal
    const goalPatterns = [
      /(?:goal|want|need|looking for).*?(?:full body|upper body|lower body|cardio|strength|endurance)/i,
      /(?:get|build|improve|work on).*?(?:strength|endurance|cardio|muscle|fitness)/i,
    ];
    for (const pattern of goalPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.goal = match[0];
        break;
      }
    }
    if (!data.goal) {
      data.goal = text.split(/[.!?]/)[0] || text.substring(0, 100);
    }

    // Try to extract equipment
    const equipmentKeywords = [
      'kettlebell', 'dumbbell', 'barbell', 'pull-up bar', 'parallette', 'box', 'rope', 'sandbag',
      'medicine ball', 'battle rope', 'timer', 'clock', 'hiit', 'bands', 'resistance bands',
    ];
    const foundEquipment: string[] = [];
    equipmentKeywords.forEach((keyword) => {
      if (lower.includes(keyword)) {
        foundEquipment.push(keyword);
      }
    });
    if (foundEquipment.length > 0) {
      data.available_equipment = foundEquipment.join(', ');
    }

    // Try to extract preferences
    if (lower.includes('warm') || lower.includes('cooldown')) {
      data.preferences = 'Include warm-up and cooldown';
    }
    if (lower.includes('hard') || lower.includes('challenging') || lower.includes('intense')) {
      data.preferences = (data.preferences || '') + ' Make it challenging';
    }
    if (lower.includes('easy') || lower.includes('light') || lower.includes('moderate')) {
      data.preferences = (data.preferences || '') + ' Moderate intensity';
    }

    // Try to extract limitations
    if (lower.includes('injur') || lower.includes('hurt') || lower.includes('pain')) {
      data.limitations = 'No injuries';
    }
    if (lower.includes('knee') || lower.includes('shoulder') || lower.includes('back')) {
      data.limitations = (data.limitations || '') + ' Avoid ' + text.match(/(knee|shoulder|back)/i)?.[0];
    }

    setFormData(data);
  };

  const handleSubmit = async () => {
    if (!formData.goal || !formData.available_equipment) {
      return;
    }

    await onSubmit({
      goal: formData.goal,
      available_equipment: formData.available_equipment,
      preferences: formData.preferences || '',
      limitations: formData.limitations || '',
      notes: formData.notes || '',
    });
  };

  if (!isSupported) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-600 mb-4">Voice input requires Chrome or Edge browser</p>
        <p className="text-sm text-gray-500">Please use the text form instead</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-black text-gray-900 mb-2">Speak Your Requirements</h3>
        <p className="text-gray-600">Tell us about your goals, equipment, and preferences</p>
      </div>

      <motion.button
        type="button"
        onClick={handleVoiceInput}
        disabled={isLoading}
        whileHover={{ scale: isListening ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-8 px-6 rounded-2xl font-black text-xl transition-all ${
          isListening
            ? 'bg-red-600 text-white animate-pulse shadow-2xl'
            : 'bg-black text-white hover:bg-gray-800 shadow-lg'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex flex-col items-center gap-3">
          {isListening ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="w-8 h-8 bg-white rounded-full"
                />
              </motion.div>
              <span>Listening... Tap to stop</span>
              <p className="text-sm font-normal opacity-90">Speak naturally about your workout needs</p>
            </>
          ) : (
            <>
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span>Tap to Start Speaking</span>
              <p className="text-sm font-normal opacity-90">Describe your goals, equipment, and preferences</p>
            </>
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6"
          >
            <h4 className="text-lg font-bold text-gray-900 mb-3">What you said:</h4>
            <p className="text-base text-gray-700 leading-relaxed mb-4">{transcript}</p>
            {!isListening && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    parseTranscript(transcript);
                    setShowForm(true);
                  }}
                  className="flex-1 bg-black text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Use This
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearTranscript();
                    setFormData({});
                    setShowForm(false);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && Object.keys(formData).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4"
          >
            <h4 className="text-lg font-bold text-gray-900 mb-4">Review & Edit:</h4>
            
            {formData.goal && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Goal</label>
                <textarea
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-base"
                />
              </div>
            )}

            {formData.available_equipment && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Equipment</label>
                <textarea
                  value={formData.available_equipment}
                  onChange={(e) => setFormData({ ...formData, available_equipment: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-base"
                />
              </div>
            )}

            {formData.preferences && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preferences</label>
                <textarea
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-base"
                />
              </div>
            )}

            {formData.limitations && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Limitations</label>
                <textarea
                  value={formData.limitations}
                  onChange={(e) => setFormData({ ...formData, limitations: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-base"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formData.goal || !formData.available_equipment || isLoading}
                className="flex-1 bg-black text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate WOD'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({});
                  clearTranscript();
                }}
                className="px-6 py-4 bg-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
        >
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </motion.div>
      )}
    </div>
  );
}

