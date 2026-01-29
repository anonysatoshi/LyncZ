'use client';

import { Check, Clock, Circle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type BuyStep = 'info' | 'select' | 'execute' | 'payment' | 'settled';

interface BuyProgressProps {
  currentStep: BuyStep;
}

export function BuyProgress({ currentStep }: BuyProgressProps) {
  const t = useTranslations('buy.progress');
  
  const steps: { key: BuyStep; label: string }[] = [
    { key: 'info', label: t('enterInfo') },
    { key: 'select', label: t('selectOrder') },
    { key: 'execute', label: t('createTrade') },
    { key: 'payment', label: t('submitProof') },
    { key: 'settled', label: t('settled') },
  ];
  
  const currentIndex = steps.findIndex((s) => s.key === currentStep);
  const currentStepData = steps[currentIndex];

  return (
    <div className="w-full py-4 md:py-6">
      {/* Mobile: Simplified current step display */}
      <div className="md:hidden flex items-center justify-center gap-3 bg-purple-500/5 border border-purple-300/30 rounded-xl p-4">
        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index < currentIndex
                  ? 'bg-purple-600'
                  : index === currentIndex
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 w-8'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('step')} {currentIndex + 1}/{steps.length}:
          </span>
          <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {currentStepData?.label}
          </span>
        </div>
      </div>

      {/* Desktop: Full progress bar - seamless design */}
      <div className="hidden md:flex items-center justify-between relative px-4">
        {/* Progress Line - spans between step centers */}
        <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-slate-300/50 dark:bg-slate-600/50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
            style={{
              width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center gap-2.5 relative z-10"
            >
              {/* Circle - transparent with subtle border */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                      : isCurrent
                      ? 'bg-transparent border-2 border-purple-400 text-purple-500 dark:text-purple-400'
                      : 'bg-transparent border-2 border-slate-300/60 dark:border-slate-600/60 text-slate-400 dark:text-slate-500'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                ) : isCurrent ? (
                  <Clock className="h-5 w-5 animate-pulse" />
                ) : (
                  <Circle className="h-4 w-4 opacity-50" />
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-xs font-medium text-center whitespace-nowrap transition-colors duration-300
                  ${
                    isCompleted
                      ? 'text-purple-600 dark:text-purple-400'
                      : isCurrent
                      ? 'text-slate-700 dark:text-slate-200 font-semibold'
                      : 'text-slate-400/80 dark:text-slate-500/80'
                  }
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

