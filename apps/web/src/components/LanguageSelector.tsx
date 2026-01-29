'use client';

import { useLocale } from './LocaleProvider';
import { Button } from './ui/button';
import { Globe, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type Locale = 'en' | 'zh-TW' | 'zh-CN';

const languages: { value: Locale; label: string; shortLabel: string }[] = [
  { value: 'en', label: 'English', shortLabel: 'EN' },
  { value: 'zh-TW', label: '繁體中文', shortLabel: '繁中' },
  { value: 'zh-CN', label: '简体中文', shortLabel: '简中' },
];

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();

  const currentLanguage = languages.find(l => l.value === locale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{currentLanguage.shortLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => setLocale(lang.value)}
            className={`flex items-center justify-between ${
              locale === lang.value 
                ? 'bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                : ''
            }`}
          >
            <span>{lang.label}</span>
            {locale === lang.value && (
              <span className="text-purple-600 dark:text-purple-400">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
