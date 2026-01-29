'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ============ SECURITY NOTE ============
// This panel is READ-ONLY. All admin write endpoints have been removed for security.
// Contract modifications must be done directly via cast/forge with the owner wallet.
// 
// Example commands:
// cast send --rpc-url $RPC --private-key $OWNER_KEY $CONTRACT "setMinTradeValue(uint256)" 10000
// cast send --rpc-url $RPC --private-key $OWNER_KEY $FEE_CALC "setPublicFee(uint256)" 20000
// cast send --rpc-url $RPC --private-key $OWNER_KEY $CONTRACT "withdrawFees(address)" $TOKEN
// ============================================

interface ContractConfig {
  min_trade_value_cny: string;
  max_trade_value_cny: string;
  payment_window: string;
  fee_rate_bps: string;
  accumulated_fees_usdc: string;
  accumulated_fees_weth?: string;
  accumulated_fees_cbbtc?: string;
  paused: boolean;
  zk_verifier: string;
  public_key_der_hash: string;
  app_exe_commit?: string;
  app_vm_commit?: string;
  // Fee calculator config
  public_fee_usdc?: string;
  private_fee_usdc?: string;
  eth_price_usdc?: string;
  btc_price_usdc?: string;
  fee_calculator_address?: string;
}

export default function AdminPanel() {
  const [config, setConfig] = useState<ContractConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchConfig = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      const data = await api.getContractConfig(forceRefresh);
      setConfig(data);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch contract config: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (loading && !config) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🔧 Admin Panel (Read-Only)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading contract configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>🔧 Admin Panel (Read-Only)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Notice */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800 text-sm">
            <strong>🔒 Security Notice:</strong> This panel is read-only. All admin write endpoints have been removed for security.
            <br />To modify contract config, use <code className="bg-amber-100 px-1 rounded">cast</code> or <code className="bg-amber-100 px-1 rounded">forge</code> directly with the owner wallet.
          </AlertDescription>
        </Alert>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Configuration */}
        {config && (
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Current Configuration</h3>
              <button 
                onClick={() => fetchConfig(true)}
                disabled={loading}
                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
              >
                🔄 {loading ? 'Refreshing...' : 'Refresh from blockchain'}
              </button>
            </div>
            
            {/* Basic Settings */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Min Trade Value (CNY):</span>
                <p className="font-mono font-semibold">
                  {(parseInt(config.min_trade_value_cny) / 100).toFixed(2)} CNY
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Max Trade Value (CNY):</span>
                <p className="font-mono font-semibold">
                  {(parseInt(config.max_trade_value_cny) / 100).toFixed(2)} CNY
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Window:</span>
                <p className="font-mono font-semibold">{config.payment_window} seconds</p>
              </div>
              <div>
                <span className="text-muted-foreground">Contract Status:</span>
                <p
                  className={`font-mono font-semibold ${
                    config.paused ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {config.paused ? '⏸ PAUSED' : '✅ ACTIVE'}
                </p>
              </div>
            </div>

            {/* Fee Configuration */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">💰 Fee Configuration (Flat Rate)</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Public Order Fee:</span>
                  <p className="font-mono font-semibold text-lg text-green-600">
                    {(parseInt(config.public_fee_usdc || '20000') / 1e6).toFixed(4)} USDC
                    <span className="text-xs text-muted-foreground ml-2">(flat per trade)</span>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Private Order Fee:</span>
                  <p className="font-mono font-semibold text-lg text-green-600">
                    {(parseInt(config.private_fee_usdc || '10000') / 1e6).toFixed(4)} USDC
                    <span className="text-xs text-muted-foreground ml-2">(flat per trade)</span>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">ETH Price (for fee conversion):</span>
                  <p className="font-mono font-semibold text-purple-600">
                    ${parseInt(config.eth_price_usdc || '3000')} USDC
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">BTC Price (for fee conversion):</span>
                  <p className="font-mono font-semibold text-orange-600">
                    ${parseInt(config.btc_price_usdc || '100000')} USDC
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">Fee Calculator:</span>
                  <p className="font-mono text-xs break-all">{config.fee_calculator_address || 'N/A'}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <span className="text-muted-foreground">Accumulated Fees:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="font-mono font-semibold text-blue-600 text-xs break-all">
                        {(() => {
                          const raw = config.accumulated_fees_usdc || '0';
                          const val = BigInt(raw);
                          const whole = val / BigInt(1e6);
                          const frac = val % BigInt(1e6);
                          return `${whole}.${frac.toString().padStart(6, '0')} USDC`;
                        })()}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <p className="font-mono font-semibold text-purple-600 text-xs break-all">
                        {(() => {
                          const raw = config.accumulated_fees_weth || '0';
                          const val = BigInt(raw);
                          const divisor = BigInt('1000000000000000000'); // 1e18
                          const whole = val / divisor;
                          const frac = val % divisor;
                          return `${whole}.${frac.toString().padStart(18, '0')} WETH`;
                        })()}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="font-mono font-semibold text-orange-600 text-xs break-all">
                        {(() => {
                          const raw = config.accumulated_fees_cbbtc || '0';
                          const val = BigInt(raw);
                          const divisor = BigInt(1e8);
                          const whole = val / divisor;
                          const frac = val % divisor;
                          return `${whole}.${frac.toString().padStart(8, '0')} cbBTC`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* zkPDF Configuration */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">🔐 zkPDF Configuration</h4>
              
              <div>
                <span className="text-muted-foreground text-xs">Verifier Contract:</span>
                <p className="font-mono text-xs break-all">{config.zk_verifier}</p>
              </div>
              
              <div>
                <span className="text-muted-foreground text-xs">Public Key DER Hash:</span>
                <p className="font-mono text-xs break-all">{config.public_key_der_hash}</p>
              </div>
              
              <div>
                <span className="text-muted-foreground text-xs">Guest Program Commitment:</span>
                <p className="font-mono text-xs break-all">{config.app_exe_commit}</p>
              </div>
              
              <div>
                <span className="text-muted-foreground text-xs">OpenVM Version Commitment:</span>
                <p className="font-mono text-xs break-all">{config.app_vm_commit}</p>
              </div>
            </div>

            {/* Manual Update Commands */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">📝 Manual Update Commands</h4>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto space-y-3">
                <div>
                  <p className="text-slate-400"># Environment variables</p>
                  <p className="text-green-400">RPC=&quot;https://mainnet.base.org&quot;</p>
                  <p className="text-green-400">KEY=&quot;your_private_key&quot;</p>
                  <p className="text-green-400">ESCROW=&quot;0x73e800bd2d407c23a2C0fa2998475D5fD6bAc0A2&quot;</p>
                  <p className="text-green-400">FEE_CALC=&quot;0x7AACBAdC3750E2e9c61092D57F9956BeCc689737&quot;</p>
                  <p className="text-green-400">USDC=&quot;0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&quot;</p>
                  <p className="text-green-400">WETH=&quot;0x4200000000000000000000000000000000000006&quot;</p>
                  <p className="text-green-400">cbBTC=&quot;0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf&quot;</p>
                </div>
                
                <div>
                  <p className="text-slate-400"># Update trade limits (in CNY cents)</p>
                  <p>cast send $ESCROW &quot;setMinTradeValue(uint256)&quot; 100 --rpc-url $RPC --private-key $KEY</p>
                  <p>cast send $ESCROW &quot;setMaxTradeValue(uint256)&quot; 7200000 --rpc-url $RPC --private-key $KEY</p>
                </div>
                
                <div>
                  <p className="text-slate-400"># Update fees (in USDC micro-units: 200000 = 0.2 USDC)</p>
                  <p>cast send $FEE_CALC &quot;setPublicFee(uint256)&quot; 200000 --rpc-url $RPC --private-key $KEY</p>
                  <p>cast send $FEE_CALC &quot;setPrivateFee(uint256)&quot; 400000 --rpc-url $RPC --private-key $KEY</p>
                </div>
                
                <div>
                  <p className="text-slate-400"># Update token prices for fee conversion</p>
                  <p>cast send $FEE_CALC &quot;setEthPrice(uint256)&quot; 3000 --rpc-url $RPC --private-key $KEY</p>
                  <p>cast send $FEE_CALC &quot;setBtcPrice(uint256)&quot; 100000 --rpc-url $RPC --private-key $KEY</p>
                </div>
                
                <div>
                  <p className="text-slate-400"># Withdraw accumulated fees (by token)</p>
                  <p>cast send $ESCROW &quot;withdrawFees(address)&quot; $USDC --rpc-url $RPC --private-key $KEY</p>
                  <p>cast send $ESCROW &quot;withdrawFees(address)&quot; $WETH --rpc-url $RPC --private-key $KEY</p>
                  <p>cast send $ESCROW &quot;withdrawFees(address)&quot; $cbBTC --rpc-url $RPC --private-key $KEY</p>
                </div>
                
                <div>
                  <p className="text-slate-400"># Update payment window (in seconds)</p>
                  <p>cast send $ESCROW &quot;setPaymentWindow(uint256)&quot; 1500 --rpc-url $RPC --private-key $KEY</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
