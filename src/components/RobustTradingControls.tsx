/**
 * Robust Trading Controls Component
 * Integrates R.O.M.A.N. validation + Web3 + Gas estimation
 */

import { useAuth } from '@/components/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
  RobustTradingService,
  TradeRequest,
} from '@/services/RobustTradingService';
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Fuel,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';

interface RobustTradingControlsProps {
  selectedAsset: string;
  quantity: string;
  orderSide: 'buy' | 'sell';
  onTradeComplete: () => void;
}

export function RobustTradingControls({
  selectedAsset,
  quantity,
  orderSide,
  onTradeComplete,
}: RobustTradingControlsProps) {
  const { toast } = useToast();
  const authContext = useAuth();
  const user = authContext?.user;

  // Fallback to Supabase auth if context not available
  const [currentUser, setCurrentUser] = useState<any>(null);

  React.useEffect(() => {
    const getUserId = async () => {
      if (user) {
        setCurrentUser(user);
      } else {
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser();
        setCurrentUser(supabaseUser);
      }
    };
    getUserId();
  }, [user]);

  const [tradingMode, setTradingMode] = useState<'paper' | 'live'>('paper');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tradePreview, setTradePreview] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  // Toggle trading mode with confirmation
  const handleModeToggle = async (checked: boolean) => {
    if (checked) {
      // Switching to live - check authorization first
      const activeUser = currentUser || user;
      if (!activeUser) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to access trading features',
          variant: 'destructive',
        });
        return;
      }

      // Check if user is authorized for live trading
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, metadata')
          .eq('id', activeUser.id)
          .single();

        const isAuthorized =
          profile?.role === 'admin' ||
          profile?.role === 'owner' ||
          profile?.metadata?.liveTradingEnabled === true;

        if (!isAuthorized) {
          toast({
            title: '🚨 Access Restricted',
            description:
              'Live trading is only available for authorized accounts. Use paper trading to learn and practice.',
            variant: 'destructive',
          });
          return;
        }

        // Show warning for authorized users
        if (
          confirm(
            '⚠️ WARNING: You are about to enable LIVE TRADING with real money.\n\nAll trades will execute on the blockchain.\n\nAre you sure you want to continue?'
          )
        ) {
          setTradingMode('live');
          toast({
            title: '🔴 LIVE TRADING ENABLED',
            description:
              'All trades will execute on the blockchain with real funds',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        toast({
          title: 'Authorization Error',
          description: 'Could not verify live trading permissions',
          variant: 'destructive',
        });
      }
    } else {
      setTradingMode('paper');
      toast({
        title: '📄 Paper Trading Enabled',
        description: 'Trades are simulated - no real money used',
      });
    }
  };

  // Initiate trade with preview
  const handleInitiateTrade = async () => {
    if (!selectedAsset || !quantity || parseFloat(quantity) <= 0) {
      toast({
        title: 'Invalid Trade',
        description: 'Please enter a valid symbol and quantity',
        variant: 'destructive',
      });
      return;
    }

    const activeUser = currentUser || user;

    if (!activeUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to trade',
        variant: 'destructive',
      });
      return;
    }

    setIsExecuting(true);

    try {
      const request: TradeRequest = {
        symbol: selectedAsset,
        side: orderSide,
        quantity: parseFloat(quantity),
        tradingMode,
        slippage,
        userId: activeUser.id,
        tokenAddress:
          tradingMode === 'live'
            ? '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
            : undefined, // USDC on Polygon
      };

      // Get trade preview
      const preview = await RobustTradingService.getTradePreview(request);
      setTradePreview({ ...preview, request });
      setShowConfirmDialog(true);
    } catch (error) {
      toast({
        title: 'Preview Failed',
        description:
          error instanceof Error ? error.message : 'Could not preview trade',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Execute confirmed trade
  const handleConfirmTrade = async () => {
    if (!tradePreview || !tradePreview.request) return;

    setIsExecuting(true);
    setShowConfirmDialog(false);

    try {
      console.log('🚀 Executing trade through R.O.M.A.N. validation...');

      const result = await RobustTradingService.executeTrade(
        tradePreview.request
      );

      if (result.success) {
        toast({
          title: '✅ Trade Executed Successfully',
          description: result.message,
          duration: 5000,
        });
        onTradeComplete();
      } else {
        toast({
          title: '❌ Trade Failed',
          description: result.message,
          variant: 'destructive',
          duration: 7000,
        });

        // Show validation details if available
        if (result.validation && !result.validation.approved) {
          console.error(
            'R.O.M.A.N. Validation Failed:',
            result.validation.reason
          );
        }
      }
    } catch (error) {
      toast({
        title: '❌ Trade Error',
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
      setTradePreview(null);
    }
  };

  return (
    <>
      {/* Trading Mode Toggle */}
      <Card className='bg-gray-800 border-gray-700 mb-4'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-white flex items-center gap-2'>
                <Shield className='w-5 h-5' />
                Trading Mode
              </CardTitle>
              <CardDescription className='text-gray-400'>
                {tradingMode === 'paper'
                  ? 'Simulated trades (no real money)'
                  : '🔴 LIVE blockchain trades'}
              </CardDescription>
            </div>
            <div className='flex items-center gap-3'>
              <Label htmlFor='trading-mode' className='text-white'>
                {tradingMode === 'paper' ? '📄 Paper' : '🔴 LIVE'}
              </Label>
              <Switch
                id='trading-mode'
                checked={tradingMode === 'live'}
                onCheckedChange={handleModeToggle}
                className='data-[state=checked]:bg-red-600'
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Live Trading Warning */}
      {tradingMode === 'live' && (
        <Alert className='mb-4 border-red-600 bg-red-900/20'>
          <AlertTriangle className='h-4 w-4 text-red-500' />
          <AlertDescription className='text-red-200'>
            <strong>LIVE TRADING ACTIVE:</strong> Trades will execute on Polygon
            blockchain with real funds. Gas fees will apply. Ensure you have
            sufficient MATIC for gas.
          </AlertDescription>
        </Alert>
      )}

      {/* Execute Trade Button */}
      <Button
        onClick={handleInitiateTrade}
        disabled={isExecuting || !selectedAsset || !quantity}
        className={`w-full ${tradingMode === 'live' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        size='lg'
      >
        {isExecuting ? (
          <>
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
            Processing...
          </>
        ) : (
          <>
            {tradingMode === 'live' ? (
              <Zap className='w-4 h-4 mr-2' />
            ) : (
              <TrendingUp className='w-4 h-4 mr-2' />
            )}
            {orderSide.toUpperCase()} {selectedAsset} (
            {tradingMode === 'paper' ? 'Paper' : 'LIVE'})
          </>
        )}
      </Button>

      {/* Trade Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className='bg-gray-800 border-gray-700 text-white max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              {tradingMode === 'live' ? (
                <>
                  <AlertTriangle className='w-5 h-5 text-red-500' />
                  Confirm LIVE Trade
                </>
              ) : (
                <>
                  <CheckCircle className='w-5 h-5 text-blue-500' />
                  Confirm Paper Trade
                </>
              )}
            </DialogTitle>
            <DialogDescription className='text-gray-400'>
              Review trade details before execution
            </DialogDescription>
          </DialogHeader>

          {tradePreview && (
            <div className='space-y-4 py-4'>
              {/* Trade Summary */}
              <div className='bg-gray-900 p-4 rounded-lg space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Action:</span>
                  <Badge
                    variant={orderSide === 'buy' ? 'default' : 'destructive'}
                  >
                    {orderSide.toUpperCase()} {selectedAsset}
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Quantity:</span>
                  <span className='font-bold'>{tradePreview.tradeAmount}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Mode:</span>
                  <Badge
                    variant={
                      tradingMode === 'live' ? 'destructive' : 'secondary'
                    }
                  >
                    {tradingMode === 'paper' ? '📄 Paper' : '🔴 LIVE'}
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Slippage:</span>
                  <span>{tradePreview.slippage}%</span>
                </div>
              </div>

              {/* Gas Costs (Live Only) */}
              {tradingMode === 'live' && tradePreview.estimatedGasUSD && (
                <div className='bg-gray-900 p-4 rounded-lg space-y-2 border border-yellow-600'>
                  <div className='flex items-center gap-2 text-yellow-400 font-semibold'>
                    <Fuel className='w-4 h-4' />
                    Gas Fees
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-400'>Estimated Gas:</span>
                    <span>
                      {parseFloat(tradePreview.estimatedGasMATIC).toFixed(4)}{' '}
                      MATIC
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-400'>Gas Cost (USD):</span>
                    <span>${tradePreview.estimatedGasUSD}</span>
                  </div>
                  <div className='flex justify-between font-bold border-t border-gray-700 pt-2'>
                    <span className='text-gray-400'>Total Cost:</span>
                    <span className='flex items-center gap-1'>
                      <DollarSign className='w-4 h-4' />
                      {tradePreview.totalCost?.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {tradePreview.warnings && tradePreview.warnings.length > 0 && (
                <Alert className='border-yellow-600 bg-yellow-900/20'>
                  <AlertTriangle className='h-4 w-4 text-yellow-500' />
                  <AlertDescription className='text-yellow-200'>
                    <ul className='list-disc list-inside space-y-1'>
                      {tradePreview.warnings.map(
                        (warning: string, i: number) => (
                          <li key={i} className='text-sm'>
                            {warning}
                          </li>
                        )
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* R.O.M.A.N. Validation Notice */}
              <div className='bg-purple-900/20 border border-purple-600 p-3 rounded-lg'>
                <div className='flex items-center gap-2 text-purple-300 text-sm'>
                  <Shield className='w-4 h-4' />
                  <span className='font-semibold'>
                    R.O.M.A.N. Constitutional Validation
                  </span>
                </div>
                <p className='text-xs text-purple-400 mt-1'>
                  This trade will be validated against constitutional rules
                  before execution
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowConfirmDialog(false)}
              disabled={isExecuting}
              className='border-gray-600'
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTrade}
              disabled={isExecuting}
              className={
                tradingMode === 'live'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {isExecuting ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                  Executing...
                </>
              ) : (
                <>{tradingMode === 'live' ? '⚡' : '✓'} Confirm & Execute</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
