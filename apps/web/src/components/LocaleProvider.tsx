'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

// Static imports for SSG compatibility
import enMessages from '../../messages/en.json';
import zhTWMessages from '../../messages/zh-TW.json';
import zhCNMessages from '../../messages/zh-CN.json';

type Locale = 'en' | 'zh-TW' | 'zh-CN';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Pre-loaded messages map
const messagesMap = {
  'en': enMessages,
  'zh-TW': zhTWMessages,
  'zh-CN': zhCNMessages,
};

// Valid locales for type checking
const validLocales: Locale[] = ['en', 'zh-TW', 'zh-CN'];

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Initialize with 'en' for SSR, will hydrate from localStorage on client
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  // Load locale from localStorage on mount (client-side only)
  useEffect(() => {
    setMounted(true);
    try {
      const savedLocale = localStorage.getItem('locale') as Locale;
      if (savedLocale && validLocales.includes(savedLocale)) {
        setLocaleState(savedLocale);
      }
    } catch (error) {
      // localStorage not available (SSR or restricted environment)
      console.warn('localStorage not available:', error);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('locale', newLocale);
    } catch (error) {
      // localStorage not available
      console.warn('Failed to save locale to localStorage:', error);
    }
  };

  // Get messages for current locale (statically loaded, always available)
  const messages = messagesMap[locale];

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

