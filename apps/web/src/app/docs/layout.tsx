'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, type ReactNode } from 'react';
import { Menu, X, Github, Send, Moon, Sun, ChevronRight, Search } from 'lucide-react';

// Documentation navigation structure
const navigation = [
  { 
    name: 'Introduction', 
    href: '/docs',
    icon: '📖',
  },
  {
    name: 'How It Works',
    href: '/docs/how-it-works',
    icon: '⚙️',
    children: [
      { name: 'Architecture', href: '/docs/how-it-works/architecture' },
      { name: 'ZK-PDF Technology', href: '/docs/how-it-works/zk-pdf' },
      { name: 'Axiom OpenVM', href: '/docs/how-it-works/axiom-openvm' },
    ],
  },
];

// Extract all pages for search
const allPages = navigation.flatMap(item => [
  { name: item.name, href: item.href, icon: item.icon },
  ...(item.children || []).map(child => ({ 
    name: `${item.name} > ${child.name}`, 
    href: child.href, 
    icon: item.icon 
  }))
]);

export default function DocsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    document.documentElement.classList.toggle('dark');
  };

  // Filter pages based on search
  const filteredPages = allPages.filter(page => 
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Smooth scroll to hash on page load
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname]);

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-950 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Link href="/docs" className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LyncZ
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Docs</span>
              </Link>
            </div>

            {/* Center: Search (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
                {/* Search Results Dropdown */}
                {searchOpen && searchQuery && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {filteredPages.length > 0 ? (
                      filteredPages.map((page) => (
                        <Link
                          key={page.href}
                          href={page.href}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                          <span className="text-lg">{page.icon}</span>
                          <span className="text-sm">{page.name}</span>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Links + Dark Mode */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <Search className="h-4 w-4" />
              </button>
              <Link
                href="https://github.com/anonysatoshi/LyncZ"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                <Github className="h-4 w-4" />
                <span className="hidden md:inline">GitHub</span>
              </Link>
              <Link
                href="https://t.me/lyncz"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span className="hidden md:inline">Telegram</span>
              </Link>
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                ← Home
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          {searchOpen && (
            <div className="md:hidden pb-4">
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
              {searchQuery && (
                <div className="mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg max-h-60 overflow-y-auto">
                  {filteredPages.length > 0 ? (
                    filteredPages.map((page) => (
                      <Link
                        key={page.href}
                        href={page.href}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <span className="text-lg">{page.icon}</span>
                        <span className="text-sm">{page.name}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 py-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  const hasChildren = item.children && item.children.length > 0;

                  return (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                        {hasChildren && <ChevronRight className="h-3 w-3 ml-auto" />}
                      </Link>
                      
                      {/* Child items */}
                      {hasChildren && isActive && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.children?.map((child) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`block px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                  isChildActive
                                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                }`}
                              >
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Quick Links */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Resources
                </p>
                <div className="space-y-1">
                  <a
                    href="https://github.com/anonysatoshi/LyncZ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                  <a
                    href="https://t.me/lyncz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="fixed inset-0 bg-gray-600/50" onClick={() => setMobileMenuOpen(false)} />
              <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
                <div className="p-4">
                  <nav className="space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                          pathname === item.href
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-700">
              {children}
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}
