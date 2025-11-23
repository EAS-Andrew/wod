'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WODInput } from '@/lib/types';
import { useConfig } from '../hooks/useConfig';
import { useHaptic } from '../hooks/useHaptic';

const configSchema = z.object({
  goal: z.string().optional(),
  available_equipment: z.string().optional(),
  preferences: z.string().optional(),
  limitations: z.string().optional(),
  notes: z.string().optional(),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { config, updateConfig } = useConfig();
  const haptic = useHaptic();
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
    haptic.success();
    updateConfig(data);
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-gray-50 flex flex-col overflow-hidden pb-20"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b-2 border-gray-200 z-30 safe-area-inset-top">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="config-goal" className="block text-base font-bold text-gray-900 mb-2">
              Default Goal
            </label>
            <textarea
              id="config-goal"
              {...register('goal')}
              rows={3}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black resize-none transition-all"
              placeholder="e.g., Full body CrossFit training, 30-40 minutes"
            />
          </div>

          <div>
            <label htmlFor="config-equipment" className="block text-base font-bold text-gray-900 mb-2">
              Default Equipment
            </label>
            <textarea
              id="config-equipment"
              {...register('available_equipment')}
              rows={3}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black resize-none transition-all"
              placeholder="e.g., Parallettes, 16kg kettlebell, 24kg kettlebell"
            />
          </div>

          <div>
            <label htmlFor="config-preferences" className="block text-base font-bold text-gray-900 mb-2">
              Default Preferences
            </label>
            <textarea
              id="config-preferences"
              {...register('preferences')}
              rows={2}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black resize-none transition-all"
              placeholder="e.g., Classic CrossFit feel, include warm-up"
            />
          </div>

          <div>
            <label htmlFor="config-limitations" className="block text-base font-bold text-gray-900 mb-2">
              Default Limitations
            </label>
            <textarea
              id="config-limitations"
              {...register('limitations')}
              rows={2}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black resize-none transition-all"
              placeholder="e.g., No injuries"
            />
          </div>

          <div>
            <label htmlFor="config-notes" className="block text-base font-bold text-gray-900 mb-2">
              Default Notes
            </label>
            <textarea
              id="config-notes"
              {...register('notes')}
              rows={2}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black resize-none transition-all"
              placeholder="e.g., Training at home"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                haptic.light();
                onBack();
              }}
              className="flex-1 bg-gray-100 text-gray-900 font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-black text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Save
            </button>
          </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

