// App settings: theme, accessibility, preferences. Loaded synchronously from
// storage on start and persisted on every change.
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { setHapticsEnabled } from '@/lib/haptics';
import { storage } from '@/lib/storage';

export type ThemePref = 'auto' | 'light' | 'dark';
export type UnitsPref = 'metric' | 'imperial';
export type FlourStandardPref = 120 | 125;

export interface Settings {
  theme: ThemePref;
  reducedMotion: boolean;
  haptics: boolean;
  soundEffects: boolean;
  units: UnitsPref;
  flourStandard: FlourStandardPref;
  flouredFingers: boolean;
  starterReminders: boolean;
  weeklyTip: boolean;
  /** Whether the baker has finished the first run onboarding. */
  onboarded: boolean;
  /** Ids of first time tips the baker has dismissed. */
  dismissedTips: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  reducedMotion: false,
  haptics: true,
  soundEffects: false,
  units: 'imperial',
  flourStandard: 120,
  flouredFingers: false,
  starterReminders: true,
  weeklyTip: true,
  onboarded: false,
  dismissedTips: [],
};

const STORAGE_KEY = 'doughmate.settings.v1';

function loadSettings(): Settings {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface SettingsContextValue {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const update = useMemo(
    () =>
      <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev) => {
          const next = { ...prev, [key]: value };
          storage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      },
    []
  );

  // Keep the haptics helper in sync with the setting.
  useEffect(() => {
    setHapticsEnabled(settings.haptics);
  }, [settings.haptics]);

  const value = useMemo(() => ({ settings, update }), [settings, update]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used inside a SettingsProvider');
  }
  return ctx;
}
