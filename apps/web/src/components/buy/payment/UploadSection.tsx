'use client';

import { useState, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UploadSectionProps {
  tradeId: string;
  error?: string;
  onFileUpload: (file: File) => void;
  onOpenReceiptTutorial?: () => void;
}

export function UploadSection({ tradeId, error, onFileUpload, onOpenReceiptTutorial }: UploadSectionProps) {
  const t = useTranslations('buy.paymentInstructions');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onFileUpload(file);
    }
  };
  
  return (
    <>
      {/* Error Display */}
      {error && (
        <Alert className="mb-2 bg-red-500/10 border border-red-300/40 text-red-700 dark:text-red-400 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('uploadPdf')}
          </label>
          {onOpenReceiptTutorial && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenReceiptTutorial}
              className="h-6 px-2 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700"
            >
              <HelpCircle className="h-3.5 w-3.5 mr-1" />
              {t('howToGetReceipt')}
            </Button>
          )}
        </div>
        
        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          id={`pdf-upload-${tradeId}`}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {/* Upload button row */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleButtonClick}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-purple-500/25"
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('chooseFile')}
          </Button>
          
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {selectedFileName || t('noFileChosen')}
          </span>
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('uploadHelp')}
        </p>
      </div>
    </>
  );
}

