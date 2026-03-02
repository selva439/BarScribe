import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { type UserSettings } from '../types';
import { getUserSettings, setUserSettings } from '../database/repositories/settingsRepository';

interface SettingsContextValue {
  settings: UserSettings;
  isLoading: boolean;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const DEFAULT_SETTINGS: UserSettings = {
  units: 'kg',
  bodyweight: 80,
  sex: 'M',
  restTimerDuration: 180,
  isInitialized: false,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserSettings(db)
      .then(s => setSettings(s))
      .catch(console.warn)
      .finally(() => setIsLoading(false));
  }, [db]);

  const updateSettings = useCallback(
    async (partial: Partial<UserSettings>) => {
      await setUserSettings(db, partial);
      setSettings(prev => ({ ...prev, ...partial }));
    },
    [db]
  );

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
