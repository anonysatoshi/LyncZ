'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Coins, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const navItems = [
    { href: '/', icon: Home, label: t('home'), exactMatch: true },
    { href: '/buy', icon: ShoppingCart, label: t('buyTokens') },
    { href: '/sell', icon: Coins, label: t('sellTokens') },
    { href: '/account', icon: User, label: t('myAccount') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Seamless gradient fade from content */}
      <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-white/40 dark:from-slate-950/40 to-transparent pointer-events-none" />
      
      {/* Main nav container - glass effect */}
      <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border-t border-slate-200/20 dark:border-slate-800/20">
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {navItems.map((item) => {
            const active = item.exactMatch 
              ? pathname === item.href 
              : isActive(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                  active
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <div className={`relative p-1.5 rounded-lg transition-all duration-200 ${
                  active 
                    ? 'bg-purple-100/60 dark:bg-purple-900/30' 
                    : ''
                }`}>
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                  {active && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-sm" />
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-all duration-200 ${
                  active ? 'opacity-100' : 'opacity-70'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
