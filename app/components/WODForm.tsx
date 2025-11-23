'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WODInput } from '@/lib/types';
import { motion } from 'framer-motion';
import { useConfig } from '../hooks/useConfig';
import { useEffect } from 'react';

const formSchema = z.object({
  goal: z.string().min(1, 'Goal is required'),
  available_equipment: z.string().min(1, 'Available equipment is required'),
  preferences: z.string().optional(),
  limitations: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface WODFormProps {
  onSubmit: (data: WODInput) => Promise<void>;
  isLoading: boolean;
}

export default function WODForm({ onSubmit, isLoading }: WODFormProps) {
  const { config } = useConfig();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: config.goal || '',
      available_equipment: config.available_equipment || '',
      preferences: config.preferences || '',
      limitations: config.limitations || '',
      notes: config.notes || '',
    },
  });

  // Update form when config changes
  useEffect(() => {
    reset({
      goal: config.goal || '',
      available_equipment: config.available_equipment || '',
      preferences: config.preferences || '',
      limitations: config.limitations || '',
      notes: config.notes || '',
    });
  }, [config, reset]);

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      goal: data.goal,
      available_equipment: data.available_equipment,
      preferences: data.preferences || '',
      limitations: data.limitations || '',
      notes: data.notes || '',
    });
    reset();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6"
    >
      <div>
        <label htmlFor="goal" className="block text-base font-bold text-gray-900 mb-3">
          Goal *
        </label>
        <textarea
          id="goal"
          {...register('goal')}
          rows={4}
          className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none transition-all"
          placeholder="e.g., Get back into CrossFit-style training, full body, around 30–40 minutes total."
        />
        {errors.goal && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm font-medium text-red-600"
          >
            {errors.goal.message}
          </motion.p>
        )}
      </div>

      <div>
        <label htmlFor="available_equipment" className="block text-base font-bold text-gray-900 mb-3">
          Available Equipment *
        </label>
        <textarea
          id="available_equipment"
          {...register('available_equipment')}
          rows={4}
          className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none transition-all"
          placeholder="e.g., Parallettes, 16kg kettlebell, 24kg kettlebell, HIIT clock."
        />
        {errors.available_equipment && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm font-medium text-red-600"
          >
            {errors.available_equipment.message}
          </motion.p>
        )}
      </div>

      <div>
        <label htmlFor="preferences" className="block text-base font-bold text-gray-900 mb-3">
          Preferences
        </label>
        <textarea
          id="preferences"
          {...register('preferences')}
          rows={3}
          className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none transition-all"
          placeholder="e.g., Classic CrossFit feel, include a warm-up and a short cooldown. Don't go too easy."
        />
      </div>

      <div>
        <label htmlFor="limitations" className="block text-base font-bold text-gray-900 mb-3">
          Limitations
        </label>
        <textarea
          id="limitations"
          {...register('limitations')}
          rows={3}
          className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none transition-all"
          placeholder="e.g., No injuries. Conditioning is rusty."
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-base font-bold text-gray-900 mb-3">
          Notes
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none transition-all"
          placeholder="e.g., Happy with for time, AMRAP or EMOM. Training at home."
        />
      </div>

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-black text-white py-5 px-6 rounded-xl text-lg font-bold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
      >
        {isLoading ? 'Generating WOD...' : 'Generate WOD'}
      </motion.button>
    </motion.form>
  );
}
