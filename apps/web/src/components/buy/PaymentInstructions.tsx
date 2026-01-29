'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { PaymentTutorialModal } from './payment/PaymentTutorialModal';
import { ReceiptTutorialModal } from './payment/ReceiptTutorialModal';
import { PaymentDetailsSection } from './payment/PaymentDetailsSection';
import { UploadSection } from './payment/UploadSection';
import { ProcessingSection } from './payment/ProcessingSection';
import { ErrorAlerts } from './payment/ErrorAlerts';
import { formatTime, formatCnyAmount } from './payment/utils';
import type { Trade, PaymentInstructionsProps, TradeStatus } from './payment/types';
import { useTranslations } from 'next-intl';

export function PaymentInstructions({ trades, onAllSettled }: PaymentInstructionsProps) {
  const t = useTranslations('buy.paymentInstructions');
  const [tradeStatuses, setTradeStatuses] = useState<Map<string, TradeStatus>>(
    new Map(
      trades.map((t) => [
        t.trade_id,
        {
          status: 'pending',
          timeRemaining: Math.max(0, t.expires_at - Math.floor(Date.now() / 1000)),
        },
      ])
    )
  );

  // Tutorial modal state
  const [tutorialOpen, setTutorialOpen] = useState<string | null>(null);
  const [receiptTutorialOpen, setReceiptTutorialOpen] = useState<string | null>(null);

  // Expose trade statuses to parent via window (for completion screen)
  useEffect(() => {
    (window as any).tradeStatuses = tradeStatuses;
  }, [tradeStatuses]);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTradeStatuses((prev) => {
        const updated = new Map(prev);
        trades.forEach((trade) => {
          const current = updated.get(trade.trade_id);
          if (current && current.status === 'pending') {
            const timeRemaining = Math.max(
              0,
              trade.expires_at - Math.floor(Date.now() / 1000)
            );
            updated.set(trade.trade_id, {
              ...current,
              timeRemaining,
              status: timeRemaining === 0 ? 'expired' : 'pending',
            });
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trades]);

  // Check if all trades are settled
  useEffect(() => {
    const allSettled = Array.from(tradeStatuses.values()).every(
      (s) => s.status === 'settled'
    );
    if (allSettled && trades.length > 0) {
      onAllSettled();
    }
  }, [tradeStatuses, trades.length, onAllSettled]);

  // Poll for settlement status (backend handles proof generation automatically)
  const startPollingForSettlement = (tradeId: string) => {
    let proofGeneratedTime: number | null = null;
    
    const pollInterval = setInterval(async () => {
      try {
        const trade = await api.getTrade(tradeId);
        
        // Check if trade is now settled (status === 1)
        if (trade.status === 1) {
          console.log('✅ Trade settled!', trade);
          clearInterval(pollInterval);
          
          setTradeStatuses((prev) => {
            const updated = new Map(prev);
            updated.set(tradeId, {
              ...prev.get(tradeId)!,
              status: 'settled',
              settlement_tx_hash: trade.settlement_tx_hash,
            });
            return updated;
          });
          return;
        }
        
        // Check if there's a settlement error from the backend
        if (trade.settlement_error) {
          console.error('❌ Settlement failed with error:', trade.settlement_error);
          clearInterval(pollInterval);
          
          // Map error codes to translation keys
          const errorKey = `errors.${trade.settlement_error.toLowerCase()}`;
          const errorMessage = t(errorKey as any) || t('errors.settlementFailed');
          
          setTradeStatuses((prev) => {
            const updated = new Map(prev);
            updated.set(tradeId, {
              ...prev.get(tradeId)!,
              status: 'proof_failed',
              error: errorMessage,
            });
            return updated;
          });
          return;
        }
        
        // Check if proof was generated (proof_generated_at is set)
        if (trade.proof_generated_at && !proofGeneratedTime) {
          proofGeneratedTime = Date.now();
          console.log('📝 Proof generated, waiting for settlement...');
        }
        
        // If proof was generated but settlement hasn't happened after 2 minutes, it might have failed
        // This is a fallback - normally settlement_error would be set first
        if (proofGeneratedTime && Date.now() - proofGeneratedTime > 2 * 60 * 1000) {
          console.error('❌ Settlement timeout - proof generated but trade not settled');
          clearInterval(pollInterval);
          
          setTradeStatuses((prev) => {
            const updated = new Map(prev);
            updated.set(tradeId, {
              ...prev.get(tradeId)!,
              status: 'proof_failed',
              error: t('errors.settlementFailed'),
            });
            return updated;
          });
          return;
        }
        
        // Check if trade expired
        if (trade.status === 2) {
          console.log('⏰ Trade expired');
          clearInterval(pollInterval);
          
          setTradeStatuses((prev) => {
            const updated = new Map(prev);
            updated.set(tradeId, {
              ...prev.get(tradeId)!,
              status: 'expired',
            });
            return updated;
          });
        }
      } catch (error) {
        console.error('Error polling trade status:', error);
      }
    }, 10000); // Poll every 10 seconds

    // Stop polling after 15 minutes (proof should be done by then)
    setTimeout(() => {
      clearInterval(pollInterval);
      
      // If still generating proof after 15 min, show timeout error
      setTradeStatuses((prev) => {
        const current = prev.get(tradeId);
        if (current && current.status === 'generating_proof') {
          const updated = new Map(prev);
          updated.set(tradeId, {
            ...current,
            status: 'proof_failed',
            error: t('errors.proofTimeout'),
          });
          return updated;
        }
        return prev;
      });
    }, 15 * 60 * 1000);
  };

  const handlePdfUpload = async (tradeId: string, file: File) => {
    if (!file) {
      setTradeStatuses((prev) => {
        const updated = new Map(prev);
        updated.set(tradeId, { 
          ...prev.get(tradeId)!, 
          error: 'Please select a PDF file'
        });
        return updated;
      });
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      setTradeStatuses((prev) => {
        const updated = new Map(prev);
        updated.set(tradeId, { 
          ...prev.get(tradeId)!, 
          error: 'Only PDF files are supported'
        });
        return updated;
      });
      return;
    }

    try {
      // Step 1: Upload + Validate (fast, ~10s)
      setTradeStatuses((prev) => {
        const updated = new Map(prev);
        updated.set(tradeId, { 
          ...prev.get(tradeId)!, 
          status: 'validating',
          error: undefined,
          uploadedFilename: file.name,
        });
        return updated;
      });

      console.log('⚡ Uploading and validating PDF...');
      const validationResponse = await api.validateTrade(tradeId, file);
      console.log('Validation result:', validationResponse);
      
      if (validationResponse.is_valid) {
        // PDF is valid - backend automatically starts proof generation in background
        // User can safely leave this page now!
        console.log('✅ Validation successful! Backend is generating proof in background.');
        console.log('📝 Message:', validationResponse.validation_details);
        
        setTradeStatuses((prev) => {
          const updated = new Map(prev);
          updated.set(tradeId, {
            ...prev.get(tradeId)!,
            status: 'generating_proof',
            validationDetails: validationResponse.validation_details,
          });
          return updated;
        });
        
        // Start polling for trade status (settlement happens in background)
        // The polling will detect when status changes to 'settled'
        startPollingForSettlement(tradeId);
        
      } else {
        // PDF is invalid - translate error based on validation_code
        const validationCode = validationResponse.validation_code || 'UNKNOWN';
        
        // Map validation codes to translation keys
        const errorMessages: Record<string, string> = {
          'REPLAY_ATTACK': t('validationErrors.replay_attack'),
          'PAYMENT_TOO_OLD': t('validationErrors.payment_too_old'),
          'HASH_MISMATCH': t('validationErrors.hash_mismatch'),
          'UNKNOWN': t('validationErrors.unknown'),
        };
        
        const translatedError = errorMessages[validationCode] || t('validationErrors.unknown');
        
        setTradeStatuses((prev) => {
          const updated = new Map(prev);
          updated.set(tradeId, {
            ...prev.get(tradeId)!,
            status: 'invalid',
            error: translatedError,
            validationDetails: validationResponse.validation_details,
          });
          return updated;
        });
      }
      
    } catch (error: any) {
      console.error('PDF processing error:', error);
      setTradeStatuses((prev) => {
        const updated = new Map(prev);
        updated.set(tradeId, { 
          ...prev.get(tradeId)!, 
          status: 'pending',
          error: error.response?.data?.error || error.message || 'Failed to process PDF'
        });
        return updated;
      });
    }
  };

  const handleRetry = (tradeId: string) => {
    setTradeStatuses((prev) => {
      const updated = new Map(prev);
      const current = prev.get(tradeId);
      if (current) {
        updated.set(tradeId, {
          ...current,
          status: 'pending',
          error: undefined,
          uploadedFilename: undefined,
          validationDetails: undefined,
        });
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {trades.map((trade) => {
        const status = tradeStatuses.get(trade.trade_id)!;
        const cnyAmount = formatCnyAmount(trade.cny_amount);

        return (
          <Card 
            key={trade.trade_id}
            className="relative overflow-hidden hover:bg-white/5 transition-all duration-300 bg-transparent backdrop-blur-sm border border-purple-200/15 dark:border-purple-500/10 rounded-3xl"
          >
            {/* Top accent line - whisper thin */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
            <CardHeader className="border-b border-slate-200/15 dark:border-slate-700/10 pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  {t('paymentTitle')}: ¥{cnyAmount} CNY
                </CardTitle>
                <div className="flex items-center gap-2">
                  {status.status === 'pending' && status.timeRemaining > 0 && (
                    <div className="flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-300/40 px-3 py-1 rounded-full">
                      <Clock className="h-4 w-4" />
                      {formatTime(status.timeRemaining)}
                    </div>
                  )}
                  {status.status === 'expired' && (
                    <span className="text-xs px-3 py-1.5 bg-red-500/10 text-red-700 dark:text-red-400 border border-red-300/40 rounded-full font-semibold">
                      EXPIRED
                    </span>
                  )}
                  {status.status === 'settled' && (
                    <span className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 rounded-full font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      SETTLED
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
              {/* Payment Details Section */}
              <PaymentDetailsSection
                trade={trade}
                status={status}
                cnyAmount={cnyAmount}
                onOpenTutorial={() => setTutorialOpen(trade.trade_id)}
              />

              {/* Upload Section - Only for pending trades */}
              {status.status === 'pending' && status.timeRemaining > 0 && (
                <UploadSection
                  tradeId={trade.trade_id}
                  error={status.error}
                  onFileUpload={(file) => handlePdfUpload(trade.trade_id, file)}
                  onOpenReceiptTutorial={() => setReceiptTutorialOpen(trade.trade_id)}
                />
              )}

              {/* Processing Section - Phases 1, 2, 3 */}
              <ProcessingSection status={status} />

              {/* Error Alerts - All error states */}
              <ErrorAlerts status={status} onRetry={() => handleRetry(trade.trade_id)} />
            </CardContent>
          </Card>
        );
      })}

      {/* Payment Tutorial Modal */}
      {tutorialOpen && trades.find((t) => t.trade_id === tutorialOpen) && (
        <PaymentTutorialModal
          isOpen={!!tutorialOpen}
          onClose={() => setTutorialOpen(null)}
          alipayId={trades.find((t) => t.trade_id === tutorialOpen)!.alipay_id || ''}
          alipayName={trades.find((t) => t.trade_id === tutorialOpen)!.alipay_name || ''}
          amount={(parseFloat(trades.find((t) => t.trade_id === tutorialOpen)!.cny_amount) / 100).toFixed(2)}
        />
      )}

      {/* Receipt Tutorial Modal */}
      {receiptTutorialOpen && trades.find((t) => t.trade_id === receiptTutorialOpen) && (
        <ReceiptTutorialModal
          isOpen={!!receiptTutorialOpen}
          onClose={() => setReceiptTutorialOpen(null)}
          sellerName={trades.find((t) => t.trade_id === receiptTutorialOpen)!.alipay_name || ''}
        />
      )}
    </div>
  );
}
