import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { settingsApi, type UserSettings } from '../api/settings';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: UserSettings | null;
  updateSettings: (data: Partial<Pick<UserSettings, 'viewMode' | 'offlineRetention' | 'theme'>>) => Promise<void>;
}

const THEME_STORAGE_KEY = 'notg-reader-theme';

function applyTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable
  }
}

// Apply saved theme immediately to avoid flash of wrong theme
function applySavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  } catch {
    // localStorage unavailable
  }
}
applySavedTheme();

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
      applyTheme(settings.theme);
    }
  }, [settings?.theme]);

  const updateSettings = useCallback(async (data: Partial<Pick<UserSettings, 'viewMode' | 'offlineRetention' | 'theme'>>) => {
    if (data.theme) {
      applyTheme(data.theme);
    }
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
