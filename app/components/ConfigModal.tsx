'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WODInput } from '@/lib/types';
import { useConfig } from '../hooks/useConfig';

const configSchema = z.object({
  goal: z.string().optional(),
  available_equipment: z.string().optional(),
  preferences: z.string().optional(),
  limitations: z.string().optional(),
  notes: z.string().optional(),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const { config, updateConfig } = useConfig();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      goal: config.goal,
      available_equipment: config.available_equipment,
      preferences: config.preferences,
      limitations: config.limitations,
      notes: config.notes,
    },
  });

  useEffect(() => {
    reset({
      goal: config.goal,
      available_equipment: config.available_equipment,
      preferences: config.preferences,
      limitations: config.limitations,
      notes: config.notes,
    });
  }, [config, reset]);

  const onSubmit = (data: ConfigFormData) => {
    updateConfig(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40 max-h-[80vh] overflow-y-auto safe-area-inset-bottom"
          >
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">Save Preferences</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-900 p-2"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div>
                <label htmlFor="config-goal" className="block text-base font-bold text-gray-900 mb-3">
                  Default Goal
                </label>
                <textarea
                  id="config-goal"
                  {...register('goal')}
                  rows={3}
                  className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none transition-all"
                  placeholder="e.g., Full body CrossFit training, 30-40 minutes"
                />
              </div>

              <div>
                <label htmlFor="config-equipment" className="block text-base font-bold text-gray-900 mb-3">
                  Default Equipment
                </label>
                <textarea
                  id="config-equipment"
                  {...register('available_equipment')}
                  rows={3}
                  className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none transition-all"
                  placeholder="e.g., Parallettes, 16kg kettlebell, 24kg kettlebell"
                />
              </div>

              <div>
                <label htmlFor="config-preferences" className="block text-base font-bold text-gray-900 mb-3">
                  Default Preferences
                </label>
                <textarea
                  id="config-preferences"
                  {...register('preferences')}
                  rows={2}
                  className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none transition-all"
                  placeholder="e.g., Classic CrossFit feel, include warm-up"
                />
              </div>

              <div>
                <label htmlFor="config-limitations" className="block text-base font-bold text-gray-900 mb-3">
                  Default Limitations
                </label>
                <textarea
                  id="config-limitations"
                  {...register('limitations')}
                  rows={2}
                  className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none transition-all"
                  placeholder="e.g., No injuries"
                />
              </div>

              <div>
                <label htmlFor="config-notes" className="block text-base font-bold text-gray-900 mb-3">
                  Default Notes
                </label>
                <textarea
                  id="config-notes"
                  {...register('notes')}
                  rows={2}
                  className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none transition-all"
                  placeholder="e.g., Training at home"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-900 font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

