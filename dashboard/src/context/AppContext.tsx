import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppSettings } from '../types';
import { getFromStorage, setInStorage } from '../services/storageAdapter';
import { translate } from '../services/translations';

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isLoading: boolean;
  t: (key: string) => string;
}

const defaultSettings: AppSettings = {
  darkMode: false, // Light theme by default
  notifications: true,
  autoScan: false,
  realTimeProtection: true,
  language: 'en',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings from storage
    const loadSettings = async () => {
      try {
        const storedSettings = await getFromStorage<AppSettings>('settings');
        if (storedSettings) {
          setSettings({ ...defaultSettings, ...storedSettings });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    // Apply dark mode class to html element
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await setInStorage('settings', updatedSettings);
  };

  const t = (key: string) => translate(key, settings.language);

  return (
    <AppContext.Provider value={{ settings, updateSettings, isLoading, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
