'use client';

import { Loader2, CheckCircle2, Upload, Zap, Send } from 'lucide-react';
import type { TradeStatus } from './types';
import { useTranslations } from 'next-intl';

interface ProcessingSectionProps {
  status: TradeStatus;
}

export function ProcessingSection({ status }: ProcessingSectionProps) {
  const t = useTranslations('buy.processingSection');
  
  // Only show if processing (not pending, expired, or settled)
  if (status.status === 'pending' || status.status === 'expired' || status.status === 'settled') {
    return null;
  }

  // Determine current phase
  const currentPhase = 
    status.status === 'validating' ? 1 :
    status.status === 'generating_proof' ? 2 :
    status.status === 'invalid' ? 1 :
    status.status === 'proof_failed' ? 2 :
    0;

  const isFailed = status.status === 'invalid' || status.status === 'proof_failed';

  const phases = [
    { 
      icon: Upload, 
      label: t('phase1.shortTitle'),
      status: currentPhase > 1 ? 'completed' : currentPhase === 1 ? (isFailed ? 'failed' : 'active') : 'pending'
    },
    { 
      icon: Zap, 
      label: t('phase2.shortTitle'),
      status: currentPhase > 2 ? 'completed' : currentPhase === 2 ? (isFailed ? 'failed' : 'active') : 'pending'
    },
    { 
      icon: Send, 
      label: t('phase3.shortTitle'),
      status: 'pending' as const // Phase 3 happens automatically in backend
    },
  ];

  return (
    <div className="space-y-4 pt-4">
      {/* Compact Horizontal Progress Bar */}
      <div className="flex items-center justify-between gap-2">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const isActive = phase.status === 'active';
          const isCompleted = phase.status === 'completed';
          const isFailed = phase.status === 'failed';
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              {/* Icon Circle */}
              <div className={`
                w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2
                ${isCompleted ? 'bg-emerald-500/10 border border-emerald-300/40' : ''}
                ${isActive ? 'bg-purple-500/10 border border-purple-300/40 ring-2 ring-purple-400/50 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''}
                ${isFailed ? 'bg-red-500/10 border border-red-300/40' : ''}
                ${phase.status === 'pending' ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50' : ''}
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400 animate-spin" />
                ) : isFailed ? (
                  <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                ) : (
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-slate-400 dark:text-slate-500" />
                )}
              </div>
              
              {/* Label */}
              <span className={`text-xs font-medium text-center
                ${isCompleted ? 'text-emerald-700 dark:text-emerald-400' : ''}
                ${isActive ? 'text-purple-700 dark:text-purple-400' : ''}
                ${isFailed ? 'text-red-700 dark:text-red-400' : ''}
                ${phase.status === 'pending' ? 'text-slate-400 dark:text-slate-500' : ''}
              `}>
                {phase.label}
              </span>
              
              {/* Progress Line (except last) */}
              {index < phases.length - 1 && (
                <div className="absolute hidden" /> // Placeholder for future connector lines
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status Message - Simplified */}
      <div className={`p-4 rounded-xl text-center ${
        isFailed ? 'bg-red-500/10 border border-red-300/40' :
        'bg-purple-500/5 border border-purple-300/40'
      }`}>
        {status.status === 'validating' && (
          <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
            {t('phase1.validating')}
          </p>
        )}
        
        {status.status === 'generating_proof' && (
          <div className="space-y-3">
            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
              {t('phase2.generating')}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              ⏰ {t('phase2.estimatedTime')}
            </p>
            <div className="p-3 bg-emerald-500/5 border border-emerald-300/40 rounded-lg">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                ✅ {t('phase2.canLeave')}
              </p>
            </div>
          </div>
        )}

        {status.status === 'invalid' && (
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            {t('phase1.validationFailed')}
          </p>
        )}

        {status.status === 'proof_failed' && (
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            {t('phase2.proofFailed')}
          </p>
        )}
      </div>

      {/* File info if available - compact */}
      {status.uploadedFilename && (
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center truncate">
          📄 {status.uploadedFilename}
        </div>
      )}
    </div>
  );
}
