'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, ExternalLink, Rocket, Database, ArrowRight } from 'lucide-react';
import { BuyFlowData, Trade } from '@/app/buy/page';
import { api } from '@/lib/api';
import { getTransactionUrl } from '@/lib/contracts';
import { parseContractError, CONTRACT_ERRORS, ERROR_TRANSLATION_KEYS } from '@/lib/contractErrors';
import { useTranslations } from 'next-intl';

interface ExecuteTradeProps {
  flowData: BuyFlowData;
  updateFlowData: (data: Partial<BuyFlowData>) => void;
  goBack: () => void;
  goToNextStep: () => void;
}

type ExecuteStatus = 'idle' | 'executing' | 'syncing' | 'success' | 'error';

export function ExecuteTrade({ flowData, updateFlowData, goBack, goToNextStep }: ExecuteTradeProps) {
  const t = useTranslations('buy.executeTrade');
  const tErrors = useTranslations('contractErrors');
  const [status, setStatus] = useState<ExecuteStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [progress, setProgress] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { selectedOrder, amount, tokenDecimals, buyerAddress } = flowData;
  const hasStartedRef = useRef(false);

  // Auto-start when component mounts
  useEffect(() => {
    if (!hasStartedRef.current && selectedOrder && buyerAddress && status === 'idle') {
      hasStartedRef.current = true;
      executeTradeCreation();
    }
  }, [selectedOrder, buyerAddress, status]);

  const executeTradeCreation = async () => {
    if (!selectedOrder || !buyerAddress) {
      setError('Missing order or buyer address');
      setStatus('error');
      return;
    }

    setStatus('executing');
    setError(null);
    setProgress(10);

    try {
      // Amount is now CNY yuan (integer, e.g., "199" for ¥199)
      // Convert to cents for the contract (multiply by 100)
      const amountYuan = parseInt(amount);
      
      if (isNaN(amountYuan) || amountYuan <= 0) {
        throw new Error('Invalid amount');
      }
      
      // Convert yuan to cents (the contract expects cents)
      const fiatAmountCents = amountYuan * 100;

      console.log('Creating trade via relay...', {
        orderId: selectedOrder.order_id,
        buyer: buyerAddress,
        fiatAmountYuan: amountYuan,
        fiatAmountCents,
      });

      setProgress(30);

      // Call backend API to create trade (relay pays gas)
      const result = await api.createTrade(
        selectedOrder.order_id,
        buyerAddress,
        fiatAmountCents.toString()
      );

      console.log('Trade created:', result);
      setTxHash(result.tx_hash);
      setProgress(60);

      // Wait for trade to sync to database
      setStatus('syncing');
      await waitForTradeSync(result.trade_id, result.tx_hash);

    } catch (err: any) {
      console.error('Trade creation error:', err);
      // Decode contract errors and translate them
      const decodedError = parseContractError(err);
      
      // Try to extract the error name and get translated message
      let translatedError = decodedError;
      for (const [errorName, translationKey] of Object.entries(ERROR_TRANSLATION_KEYS)) {
        if (decodedError.includes(errorName)) {
          translatedError = tErrors(translationKey);
          break;
        }
      }
      
      setError(translatedError);
      setStatus('error');
      setProgress(0);
    }
  };

  // Wait for trade to be synced to database
  const waitForTradeSync = async (tradeId: string, txHash: string) => {
    const maxAttempts = 30; // 30 attempts
    const delayMs = 2000; // 2 seconds between attempts = 60 seconds max wait

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      console.log(`Checking if trade synced (attempt ${attempt + 1}/${maxAttempts})...`);
      setProgress(60 + Math.floor((attempt / maxAttempts) * 30));

      try {
        const trade = await api.getTrade(tradeId);
        
        if (trade) {
          console.log('Trade synced to database!', trade);
          
          // Use CNY amount from the synced trade (already calculated on-chain)
          const tradeData: Trade = {
            trade_id: tradeId,
            order_id: selectedOrder!.order_id,
            tx_hash: txHash,
            alipay_id: selectedOrder!.account_id || selectedOrder!.alipay_id || '',
            alipay_name: selectedOrder!.account_name || selectedOrder!.alipay_name || '',
            cny_amount: trade.cny_amount || '0',
            expires_at: trade.expires_at,
          };
          
          setTrades([tradeData]);
          updateFlowData({
            tradeIds: [tradeId],
            trades: [tradeData],
          });
          
          setProgress(100);
          setStatus('success');
          return;
        }
      } catch (err) {
        // Trade not found yet, continue waiting
        console.log(`Trade not synced yet, waiting ${delayMs}ms...`);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // Timeout - but the trade was created on-chain, so proceed anyway
    console.warn('Timeout waiting for trade sync, but trade was created on-chain');
    
    // Create trade data from what we know
    const rateInCents = parseInt(selectedOrder!.exchange_rate);
    const amountNum = parseFloat(amount);
    const cnyAmount = Math.round(amountNum * rateInCents).toString();
    
    const tradeData: Trade = {
      trade_id: tradeId,
      order_id: selectedOrder!.order_id,
      tx_hash: txHash,
      alipay_id: selectedOrder!.account_id || selectedOrder!.alipay_id || '',
      alipay_name: selectedOrder!.account_name || selectedOrder!.alipay_name || '',
      cny_amount: cnyAmount,
      expires_at: Math.floor(Date.now() / 1000) + 900, // Approximate 15 min
    };
    
    setTrades([tradeData]);
    updateFlowData({
      tradeIds: [tradeData.trade_id],
      trades: [tradeData],
    });
    
    setProgress(100);
    setStatus('success');
  };

  const retry = () => {
    hasStartedRef.current = false;
    setStatus('idle');
    setProgress(0);
    setError(null);
    setTxHash(null);
  };

  // Check for missing data
  if (!selectedOrder) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <Card className="bg-transparent backdrop-blur-sm border border-red-200/20 dark:border-red-500/15 rounded-3xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-lg font-semibold mb-2">No Order Selected</p>
            <p className="text-muted-foreground mb-4">Please go back and select an order first.</p>
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!buyerAddress) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <Card className="bg-transparent backdrop-blur-sm border border-red-200/20 dark:border-red-500/15 rounded-3xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-lg font-semibold mb-2">No Buyer Address</p>
            <p className="text-muted-foreground mb-4">Please go back and enter a receive address.</p>
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">
          {(status === 'idle' || status === 'executing' || status === 'syncing') && t('title')}
          {status === 'success' && t('successTitle')}
          {status === 'error' && t('errorTitle')}
        </h2>
        <p className="text-muted-foreground text-lg">
          {(status === 'idle' || status === 'executing') && t('description')}
          {status === 'syncing' && t('syncingDescription')}
          {status === 'error' && t('errorDescription')}
        </p>
      </div>

      {/* Main Card */}
      <Card className="relative overflow-hidden bg-transparent backdrop-blur-sm border border-purple-200/15 dark:border-purple-500/10 rounded-3xl">
        {/* Top accent line - whisper thin */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
        <CardContent className="p-8 space-y-8 pt-10">
          
          {/* Executing/Syncing State */}
          {(status === 'idle' || status === 'executing' || status === 'syncing') && (
            <>
              {/* Loading Animation */}
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-purple-500/10 border border-purple-300/40 flex items-center justify-center">
                    <Rocket className="h-12 w-12 text-purple-600 dark:text-purple-400 animate-pulse" />
                  </div>
                  <Loader2 className="absolute -top-2 -right-2 h-8 w-8 animate-spin text-purple-600" />
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">{t('processingTitle')}</p>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md">
                    {status === 'idle' && (
                      <span className="flex items-center justify-center gap-2">
                        <Rocket className="h-4 w-4" />
                        {t('preparingTx')}
                      </span>
                    )}
                    {status === 'executing' && (
                      <span className="flex items-center justify-center gap-2">
                        <Rocket className="h-4 w-4" />
                        {t('creatingOnChain')}
                      </span>
                    )}
                    {status === 'syncing' && (
                      <span className="flex items-center justify-center gap-2">
                        <Database className="h-4 w-4 animate-pulse" />
                        {t('syncingToDb')}
                      </span>
                    )}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md space-y-2">
                  <Progress value={progress} className="h-3" />
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                    {progress}% {t('complete')}
                  </p>
                </div>

                {txHash && (
                  <div className="bg-blue-500/5 border border-blue-300/40 rounded-xl p-4 max-w-md">
                    <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                      ✅ {t('txSubmitted')}
                    </p>
                    <a
                      href={getTransactionUrl(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 hover:underline flex items-center justify-center gap-1 mt-2"
                    >
                      {t('viewOnExplorer')} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  {t('submittingDescription')}
                </p>
              </div>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              {/* Success Animation */}
              <div className="flex flex-col items-center justify-center py-8 space-y-6">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-300/40 flex items-center justify-center">
                  <CheckCircle2 className="h-14 w-14 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">{t('allSet')}</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t('successMessage')}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200/50 dark:border-slate-700/50"></div>

              {/* Trade Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  {t('createdTrades')} ({trades.length})
                </h3>
                
                <div className="space-y-3">
                  {trades.map((trade, index) => (
                    <div
                      key={trade.trade_id}
                      className="border rounded-xl p-5 bg-emerald-500/5 border-emerald-300/40"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-lg text-slate-800 dark:text-white">{t('trade')} {index + 1}</span>
                        <span className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 rounded-full font-semibold">
                          {t('pendingPayment')}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">{t('amount')}</span>
                          <span className="font-bold text-slate-800 dark:text-white">¥{(parseFloat(trade.cny_amount) / 100).toFixed(2)} CNY</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">{t('paymentTo')}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{trade.alipay_name} ({trade.alipay_id})</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-xs text-slate-500 font-mono">
                            {trade.trade_id.slice(0, 10)}...{trade.trade_id.slice(-8)}
                          </span>
                          {trade.tx_hash && (
                            <a
                              href={getTransactionUrl(trade.tx_hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 text-xs flex items-center gap-1 hover:underline"
                            >
                              {t('viewTx')} <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={goToNextStep}
                  className="flex-1 h-14 text-base bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-purple-500/25 rounded-xl"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  {t('continueToPayment')}
                </Button>
              </div>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              {/* Error Display */}
              <div className="flex flex-col items-center justify-center py-8 space-y-6">
                <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-300/40 flex items-center justify-center">
                  <AlertCircle className="h-14 w-14 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{t('error.title')}</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t('error.description')}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              <Alert className="bg-red-500/10 border border-red-300/40 text-red-700 dark:text-red-400 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={goBack} 
                  className="flex-1 h-14 text-base rounded-xl border-purple-200/50 hover:border-purple-300/70 hover:bg-purple-50/50"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  {t('goBack')}
                </Button>
                <Button 
                  onClick={retry} 
                  className="flex-1 h-14 text-base bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-purple-500/25 rounded-xl"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  {t('retry')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
