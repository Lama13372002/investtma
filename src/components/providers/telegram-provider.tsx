'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TelegramWebApp } from '@/types';

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: TelegramWebApp['initDataUnsafe']['user'] | null;
  startParam: string | null;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  startParam: null,
  isReady: false,
});

export const useTelegram = () => useContext(TelegramContext);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramWebApp['initDataUnsafe']['user'] | null>(null);
  const [startParam, setStartParam] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we're in the browser and Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      // Initialize Telegram WebApp
      tg.ready();

      // Configure the app
      tg.expand();

      // Set theme
      if (tg.colorScheme) {
        document.documentElement.setAttribute('data-theme', tg.colorScheme);
      }

      // Apply Telegram theme colors
      if (tg.themeParams) {
        const root = document.documentElement;
        root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1a1d26');
        root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
        root.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
        root.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2ea043');
        root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2ea043');
        root.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
      }

      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
      setStartParam(tg.initDataUnsafe?.start_param || null);
      setIsReady(true);
    } else {
      // Development mode - create mock data
      if (process.env.NODE_ENV === 'development') {
        setUser({
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'ru',
        });
        setStartParam('ref123456');
        setIsReady(true);
      }
    }
  }, []);

  const value: TelegramContextType = {
    webApp,
    user,
    startParam,
    isReady,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
