/**
 * Type definitions for payment flow components
 */

export interface Trade {
  trade_id: string;
  order_id: string;
  tx_hash?: string;
  alipay_id: string;  // For display (populated from account_id)
  alipay_name: string;  // For display (populated from account_name)
  cny_amount: string;
  expires_at: number;
}

export interface PaymentInstructionsProps {
  trades: Trade[];
  onAllSettled: () => void;
}

export interface TradeStatus {
  status: 
    | 'pending' 
    | 'validating' 
    | 'invalid' 
    | 'generating_proof' 
    | 'proof_failed' 
    | 'settled' 
    | 'expired';
  settlement_tx_hash?: string;
  timeRemaining: number;
  error?: string;
  uploadedFilename?: string;
  validationDetails?: string;
}
