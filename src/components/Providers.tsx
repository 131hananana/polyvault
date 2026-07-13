"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AppSettings, DEFAULT_SETTINGS, LanguageId } from "@/lib/types";
import { db, ensureSeeded, updateSettings } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

interface AppContextValue {
  settings: AppSettings;
  ready: boolean;
  setLanguage: (id: LanguageId) => void;
  patchSettings: (p: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextValue>({
  settings: DEFAULT_SETTINGS,
  ready: false,
  setLanguage: () => {},
  patchSettings: () => {},
});

export const useApp = () => useContext(AppContext);

function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureSeeded().then(() => setReady(true));
    // register the service worker for offline + install
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const settings = useLiveQuery(() => db.settings.get("app"), [], DEFAULT_SETTINGS) ?? DEFAULT_SETTINGS;

  useEffect(() => {
    document.documentElement.dataset.fontsize = settings.fontSize;
  }, [settings.fontSize]);

  const setLanguage = useCallback((id: LanguageId) => { updateSettings({ activeLanguage: id }); }, []);
  const patchSettings = useCallback((p: Partial<AppSettings>) => { updateSettings(p); }, []);

  return (
    <AppContext.Provider value={{ settings, ready, setLanguage, patchSettings }}>
      {children}
    </AppContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppProvider>{children}</AppProvider>
    </ThemeProvider>
  );
}
