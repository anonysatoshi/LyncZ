'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { ConnectWalletButton } from '@/components/WalletButton';
import { useSellerOrders } from '@/hooks/useSellerOrders';
import { useBuyerTrades } from '@/hooks/useBuyerTrades';
import { formatAddress } from '@/lib/contracts';
import { MyOrders } from '@/components/seller/MyOrders';
import { MyTrades as BuyerTrades } from '@/components/buyer/MyTrades';
import { NotificationSettings } from '@/components/seller/NotificationSettings';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, ChevronUp, Wallet, ShoppingCart, Store, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SciFiBackground from '@/components/SciFiBackground';

// LocalStorage key for tracking seen settled trades
const SEEN_SETTLED_KEY = 'lyncz_seen_settled_trades';

type ExpandedSection = 'purchases' | 'sales' | 'notifications' | null;

export default function AccountPage() {
  const t = useTranslations('account');
  const { address, isConnected } = useAccount();
  const { authenticated, ready } = usePrivy();
  const { data: orders } = useSellerOrders();
  const { data: buyerTradesData } = useBuyerTrades();
  
  // User is truly connected only if both Privy is authenticated AND wagmi is connected
  const isFullyConnected = ready && authenticated && isConnected;
  
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  const [seenSettledIds, setSeenSettledIds] = useState<Set<string>>(new Set());

  // Load seen settled trades from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEEN_SETTLED_KEY);
      if (stored) {
        setSeenSettledIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Calculate stats
  const activeOrders = orders?.filter(o => parseFloat(o.remaining_amount) > 0).length || 0;
  const totalOrders = orders?.length || 0;
  
  // Buyer trades (trades you initiated as buyer)
  const buyerTrades = buyerTradesData?.trades || [];
  const pendingBuyerTrades = buyerTrades.filter(t => t.status === 0).length;
  const settledBuyerTrades = buyerTrades.filter(t => t.status === 1).length; // Only count settled as "completed purchases"
  
  // NEW: Unseen settled trades (completed but user hasn't viewed them yet)
  const unseenSettledTrades = buyerTrades.filter(t => t.status === 1 && !seenSettledIds.has(t.trade_id));
  const newCompletedCount = unseenSettledTrades.length;
  
  // Trades that actually need action = pending AND no PDF uploaded
  // Trades with PDF uploaded are waiting for proof generation (no action needed)
  const tradesNeedingAction = buyerTrades.filter(t => t.status === 0 && !t.pdf_uploaded_at).length;
  const pendingActions = tradesNeedingAction;

  // Mark trades as seen when user views completed purchases
  const markTradesAsSeen = useCallback((tradeIds: string[]) => {
    setSeenSettledIds(prev => {
      const updated = new Set(prev);
      tradeIds.forEach(id => updated.add(id));
      try {
        localStorage.setItem(SEEN_SETTLED_KEY, JSON.stringify([...updated]));
      } catch {
        // Ignore localStorage errors
      }
      return updated;
    });
  }, []);

  const toggleSection = (section: ExpandedSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!isFullyConnected) {
    return (
      <div className="min-h-screen relative">
        <SciFiBackground />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            {/* Gradient icon container */}
            <motion.div 
              className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-purple-500/10 border-2 border-purple-300/40 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Wallet className="w-10 h-10 text-purple-500" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              {t('connectTitle')}
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-10">{t('connectSubtitle')}</p>
            <div className="flex justify-center">
              <ConnectWalletButton />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <SciFiBackground />
      <div className="container mx-auto px-4 py-6 sm:py-12 max-w-4xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg">
            {t('connected')}: <span className="font-mono text-slate-700 dark:text-slate-300">{formatAddress(address || '')}</span>
          </p>
        </motion.div>

        {/* Stats Cards - Always 3 columns, compact on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-10"
        >
          {/* My Purchases stat */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card 
              className={`relative overflow-hidden bg-transparent backdrop-blur-sm border border-purple-200/15 dark:border-purple-500/10 cursor-pointer transition-all duration-500 rounded-3xl
                ${pendingActions > 0 || newCompletedCount > 0 
                  ? pendingActions > 0 
                    ? 'shadow-sm shadow-red-500/5' 
                    : 'shadow-sm shadow-emerald-500/5'
                  : 'hover:shadow-md hover:shadow-purple-500/5 hover:border-purple-300/20 hover:bg-white/5 dark:hover:bg-slate-800/10'
                }`}
              onClick={() => toggleSection('purchases')}
            >
              {/* Subtle gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
              <CardContent className="p-3 sm:p-6 text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-500/20 dark:to-purple-500/10 flex items-center justify-center border border-purple-200/50 dark:border-purple-400/20">
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-500" />
                </div>
                <p className="text-xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-0.5 sm:mb-1">{settledBuyerTrades}</p>
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{t('stats.myPurchases')}</p>
                <div className="mt-1.5 sm:mt-3 flex flex-wrap justify-center gap-0.5 sm:gap-1">
                  {pendingActions > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-sm">
                      {pendingActions} {t('stats.action')}
                    </span>
                  )}
                  {newCompletedCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full animate-pulse shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {newCompletedCount} {t('stats.new')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* My Sales stat */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card 
              className="relative overflow-hidden bg-transparent backdrop-blur-sm border border-emerald-200/15 dark:border-emerald-500/10 cursor-pointer hover:shadow-md hover:shadow-emerald-500/5 hover:border-emerald-300/20 hover:bg-white/5 dark:hover:bg-slate-800/10 transition-all duration-500 rounded-3xl"
              onClick={() => toggleSection('sales')}
            >
              {/* Subtle gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
              <CardContent className="p-3 sm:p-6 text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-400/20">
                  <Store className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-500" />
                </div>
                <p className="text-xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-0.5 sm:mb-1">{activeOrders}</p>
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{t('stats.mySales')}</p>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Pending Actions stat */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card 
              className={`relative overflow-hidden bg-transparent backdrop-blur-sm border border-blue-200/15 dark:border-blue-500/10 cursor-pointer transition-all duration-500 rounded-3xl
                ${pendingActions > 0 
                  ? 'shadow-sm shadow-amber-500/5 border-amber-200/20' 
                  : 'hover:shadow-md hover:shadow-blue-500/5 hover:border-blue-300/20 hover:bg-white/5 dark:hover:bg-slate-800/10'
                }`}
              onClick={() => toggleSection('purchases')}
            >
              {/* Subtle gradient accent line */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent ${pendingActions > 0 ? 'via-amber-400/40' : 'via-blue-400/40'} to-transparent`} />
              <CardContent className="p-3 sm:p-6 text-center">
                <div className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-3 rounded-xl sm:rounded-2xl flex items-center justify-center border ${pendingActions > 0 ? 'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-500/10 border-amber-200/50 dark:border-amber-400/20' : 'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-500/20 dark:to-blue-500/10 border-blue-200/50 dark:border-blue-400/20'}`}>
                  <span className={`text-sm sm:text-lg font-semibold ${pendingActions > 0 ? 'text-amber-600' : 'text-blue-600'}`}>{pendingActions}</span>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-0.5 sm:mb-1">{pendingActions}</p>
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{t('stats.pendingActions')}</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Collapsible Sections - 3 sections with LyncZ design */}
        <div className="space-y-4">
          
          {/* My Purchases Section (Buyer Trades - need action) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`relative overflow-hidden bg-transparent backdrop-blur-sm border border-purple-100/15 dark:border-purple-500/8 transition-all duration-500 rounded-3xl
              ${tradesNeedingAction > 0 
                ? 'shadow-sm shadow-red-500/5' 
                : 'hover:shadow-md hover:shadow-purple-500/5 hover:border-purple-200/20 hover:bg-white/5 dark:hover:bg-slate-800/10'
              }`}
            >
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400/60 via-purple-300/40 to-purple-400/60 rounded-l-3xl" />
              <button
                onClick={() => toggleSection('purchases')}
                className="w-full p-5 pl-6 flex items-center justify-between hover:bg-white/30 dark:hover:bg-slate-700/30 transition-all duration-500 rounded-3xl"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50/80 dark:from-purple-500/20 dark:to-purple-500/10 flex items-center justify-center border border-purple-200/40 dark:border-purple-400/20">
                    <ShoppingCart className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-slate-800 dark:text-white text-lg">{t('sections.myPurchases')}</span>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {tradesNeedingAction > 0 && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full animate-pulse">
                          {tradesNeedingAction} {t('sections.actionRequired')}
                        </span>
                      )}
                      {newCompletedCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded-full animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          {newCompletedCount} {t('sections.newCompleted')}
                        </span>
                      )}
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {pendingBuyerTrades} {t('sections.pending')} · {settledBuyerTrades} {t('sections.completed')}
                      </span>
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedSection === 'purchases' ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSection === 'purchases' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="border-t border-slate-200/50 dark:border-slate-700/50"
                  >
                    <div className="p-5">
                      <BuyerTrades 
                        unseenTradeIds={new Set(unseenSettledTrades.map(t => t.trade_id))}
                        onTradesSeen={markTradesAsSeen}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* My Sales Section (Orders only - trades shown inside each order) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden bg-transparent backdrop-blur-sm border border-emerald-100/15 dark:border-emerald-500/8 hover:shadow-md hover:shadow-emerald-500/5 hover:border-emerald-200/20 hover:bg-white/5 dark:hover:bg-slate-800/10 transition-all duration-500 rounded-3xl">
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400/60 via-emerald-300/40 to-emerald-400/60 rounded-l-3xl" />
              <button
                onClick={() => toggleSection('sales')}
                className="w-full p-5 pl-6 flex items-center justify-between hover:bg-white/30 dark:hover:bg-slate-700/30 transition-all duration-500 rounded-3xl"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50/80 dark:from-emerald-500/20 dark:to-emerald-500/10 flex items-center justify-center border border-emerald-200/40 dark:border-emerald-400/20">
                    <Store className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-slate-800 dark:text-white text-lg">{t('sections.mySales')}</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {totalOrders} {t('sections.orders')}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedSection === 'sales' ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSection === 'sales' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="border-t border-slate-200/50 dark:border-slate-700/50"
                  >
                    <div className="p-5">
                      <MyOrders />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden bg-transparent backdrop-blur-sm border border-amber-100/15 dark:border-amber-500/8 hover:shadow-md hover:shadow-amber-500/5 hover:border-amber-200/20 hover:bg-white/5 dark:hover:bg-slate-800/10 transition-all duration-500 rounded-3xl">
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400/60 via-amber-300/40 to-amber-400/60 rounded-l-3xl" />
              <button
                onClick={() => toggleSection('notifications')}
                className="w-full p-5 pl-6 flex items-center justify-between hover:bg-white/30 dark:hover:bg-slate-700/30 transition-all duration-500 rounded-3xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50/80 dark:from-amber-500/20 dark:to-amber-500/10 flex items-center justify-center border border-amber-200/40 dark:border-amber-400/20">
                    <Bell className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-slate-800 dark:text-white text-lg">{t('sections.notifications')}</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('sections.emailAlerts')}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedSection === 'notifications' ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSection === 'notifications' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="border-t border-slate-200/50 dark:border-slate-700/50"
                  >
                    <div className="p-5">
                      <NotificationSettings />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
