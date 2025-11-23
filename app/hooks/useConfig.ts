'use client';

import { useState, useEffect } from 'react';
import { getConfig, saveConfig, clearConfig, UserConfig } from '@/lib/config';
import { WODInput } from '@/lib/types';

export function useConfig() {
  const [config, setConfig] = useState<UserConfig>(getConfig());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setConfig(getConfig());
    setIsLoading(false);
  }, []);

  const updateConfig = (updates: Partial<WODInput>) => {
    const updated = saveConfig(updates);
    setConfig(updated);
    return updated;
  };

  const resetConfig = () => {
    clearConfig();
    setConfig({
      goal: '',
      available_equipment: '',
      preferences: '',
      limitations: '',
      notes: '',
      updatedAt: '',
    });
  };

  return {
    config,
    isLoading,
    updateConfig,
    resetConfig,
    hasConfig: !!(config.goal || config.available_equipment),
  };
}

