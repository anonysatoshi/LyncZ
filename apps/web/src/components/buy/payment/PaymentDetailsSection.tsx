'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink, HelpCircle } from 'lucide-react';
import { getTransactionUrl } from '@/lib/contracts';
import type { Trade, TradeStatus } from './types';
import { useTranslations } from 'next-intl';

interface PaymentDetailsSectionProps {
  trade: Trade;
  status: TradeStatus;
  cnyAmount: string;
  onOpenTutorial: () => void;
}

export function PaymentDetailsSection({ 
  trade, 
  status, 
  cnyAmount,
  onOpenTutorial 
}: PaymentDetailsSectionProps) {
  const t = useTranslations('buy.paymentInstructions');
  
  return (
    <>
      {/* Payment Details - LyncZ Style */}
      <div className="bg-transparent border border-blue-200/15 dark:border-blue-500/10 rounded-2xl overflow-hidden">
        {/* Header with Tutorial Link */}
        {status.status === 'pending' && status.timeRemaining > 0 && (
          <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-b border-slate-200/50 dark:border-slate-700/50">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t('paymentInstructions')}</span>
            <Button
              onClick={onOpenTutorial}
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 gap-1 rounded-lg"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              {t('howToPayAlipay')}
            </Button>
          </div>
        )}
        
        {/* Payment Details Grid */}
        <div className="p-6 space-y-4">
          {/* Alipay Account ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t('alipayAccountId')}
            </label>
            <div className="font-mono text-sm md:text-xl font-bold text-slate-800 dark:text-white bg-white/5 dark:bg-slate-800/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200/15 dark:border-slate-700/10 break-all">
              {trade.alipay_id}
            </div>
          </div>

          {/* Alipay Account Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t('alipayAccountName')}
            </label>
            <div className="text-xl font-bold text-slate-800 dark:text-white bg-white/5 dark:bg-slate-800/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200/15 dark:border-slate-700/10">
              {trade.alipay_name}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t('amountToTransfer')}
            </label>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-4 py-3 rounded-xl border border-emerald-300/40">
              ¥{cnyAmount}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Info - Minimalist Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span className="font-mono">
          ID: {trade.trade_id.slice(0, 8)}...{trade.trade_id.slice(-6)}
        </span>
        {trade.tx_hash && (
          <a
            href={getTransactionUrl(trade.tx_hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {t('viewTrade')}
          </a>
        )}
      </div>
    </>
  );
}
