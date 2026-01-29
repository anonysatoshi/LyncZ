'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AccountEmailSettings {
  wallet: string;
  email: string;
  language: string;
  enabled: boolean;
}

export function NotificationSettings() {
  const t = useTranslations('sell.notifications');
  const { address, isConnected: wagmiConnected } = useAccount();
  const { authenticated, ready } = usePrivy();
  // User is truly connected only if both wagmi AND Privy agree
  const isConnected = wagmiConnected && authenticated && ready;
  
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');
  const [enabled, setEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch existing settings when wallet connects
  useEffect(() => {
    if (address) {
      fetchSettings();
    }
  }, [address]);

  const fetchSettings = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/account/email?address=${address}`);
      const data = await response.json();
      
      if (data && data.email) {
        setEmail(data.email);
        setLanguage(data.language || 'en');
        setEnabled(data.enabled);
        setHasSettings(true);
      } else {
        setHasSettings(false);
      }
    } catch (error) {
      console.error('Failed to fetch email settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!address || !email) return;
    
    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      setMessage({ type: 'error', text: t('invalidEmail') });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch(`${API_URL}/api/account/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address,
          email,
          language,
        }),
      });
      
      if (response.ok) {
        setHasSettings(true);
        setMessage({ type: 'success', text: t('saved') });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || t('saveFailed') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (newEnabled: boolean) => {
    if (!address) return;
    
    setEnabled(newEnabled);
    
    try {
      await fetch(`${API_URL}/api/account/email/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address,
          enabled: newEnabled,
        }),
      });
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      setEnabled(!newEnabled); // Revert on error
    }
  };

  const handleDelete = async () => {
    if (!address) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/account/email?address=${address}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setEmail('');
        setHasSettings(false);
        setMessage({ type: 'success', text: t('deleted') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('deleteFailed') });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-800/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          {t('title')}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Form Fields */}
            <div className="p-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 text-sm font-medium">{t('emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>

              {/* Language Select */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-gray-700 dark:text-gray-300 text-sm font-medium">{t('languageLabel')}</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-11 px-3 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="en">English</option>
                  <option value="zh-CN">简体中文</option>
                  <option value="zh-TW">繁體中文</option>
                </select>
              </div>
            </div>

            {/* Enable/Disable Toggle (only show if settings exist) */}
            {hasSettings && (
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  {enabled ? (
                    <Bell className="h-4 w-4 text-green-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {enabled ? t('notificationsOn') : t('notificationsOff')}
                  </span>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={handleToggle}
                />
              </div>
            )}

            {/* Message */}
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <AlertDescription className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  {message.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !email}
                className="flex-1 h-11 bg-purple-500/8 hover:bg-purple-500/15 text-purple-600 dark:text-purple-400 rounded-xl transition-all duration-500 shadow-sm shadow-purple-500/10 hover:shadow-purple-500/20"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : hasSettings ? (
                  t('update')
                ) : (
                  t('save')
                )}
              </Button>
              
              {hasSettings && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-11 px-6 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('delete')
                  )}
                </Button>
              )}
            </div>

            {/* Info Text */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('infoText')}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

