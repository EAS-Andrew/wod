import { WODInput } from './types';

const CONFIG_KEY = 'wod-config';

export interface UserConfig extends WODInput {
  updatedAt: string;
}

export function saveConfig(config: Partial<WODInput>): UserConfig {
  const existingConfig = getConfig();
  const updatedConfig: UserConfig = {
    goal: config.goal || existingConfig.goal || '',
    available_equipment: config.available_equipment || existingConfig.available_equipment || '',
    preferences: config.preferences || existingConfig.preferences || '',
    limitations: config.limitations || existingConfig.limitations || '',
    notes: config.notes || existingConfig.notes || '',
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updatedConfig));
  }

  return updatedConfig;
}

export function getConfig(): UserConfig {
  if (typeof window === 'undefined') {
    return {
      goal: '',
      available_equipment: '',
      preferences: '',
      limitations: '',
      notes: '',
      updatedAt: '',
    };
  }

  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) {
      return {
        goal: '',
        available_equipment: '',
        preferences: '',
        limitations: '',
        notes: '',
        updatedAt: '',
      };
    }
    return JSON.parse(stored) as UserConfig;
  } catch (error) {
    console.error('Error reading config:', error);
    return {
      goal: '',
      available_equipment: '',
      preferences: '',
      limitations: '',
      notes: '',
      updatedAt: '',
    };
  }
}

export function clearConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONFIG_KEY);
}

export function hasConfig(): boolean {
  const config = getConfig();
  return !!(config.goal || config.available_equipment);
}

