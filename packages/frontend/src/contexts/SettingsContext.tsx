import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { settingsApi, type UserSettings } from '../api/settings';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: UserSettings | null;
  updateSettings: (data: Partial<Pick<UserSettings, 'viewMode' | 'offlineRetention' | 'theme'>>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (user) {
      settingsApi.getSettings().then(setSettings).catch(console.error);
    } else {
      setSettings(null);
    }
  }, [user]);

  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, [settings?.theme]);

  const updateSettings = useCallback(async (data: Partial<Pick<UserSettings, 'viewMode' | 'offlineRetention' | 'theme'>>) => {
    const updated = await settingsApi.updateSettings(data);
    setSettings(updated);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
