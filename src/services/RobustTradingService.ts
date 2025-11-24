/**
 * Robust Trading Service - Constitutional Trading with R.O.M.A.N. Validation
 *
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 *
 * Part of the ODYSSEY-1 Genesis Protocol
 * Integrates R.O.M.A.N. validation with blockchain execution
 *
 * SECURITY MODEL:
 * - Paper Trading: Available to ALL users (educational purposes)
 * - Live Trading: ONLY available to authorized wallets (Rickey's trading account)
 * - Users learn with paper trading, owner trades with live trading
 */

import { supabase } from '@/lib/supabaseClient';
import { RomanCommand } from '@/schemas/RomanCommands';
import { SovereignCoreOrchestrator } from './SovereignCoreOrchestrator';
import { Web3Service } from './web3Service';

// AUTHORIZED WALLETS FOR LIVE TRADING (Owner/Admin only)
const AUTHORIZED_LIVE_TRADING_WALLETS = [
  // Rickey's wallet addresses (add your actual wallet addresses here)
  '0xYourWalletAddress1', // Replace with your actual Polygon wallet
  '0xYourWalletAddress2', // Add backup wallet if needed
];

// AUTHORIZED USER IDs FOR LIVE TRADING (Supabase User IDs)
const AUTHORIZED_LIVE_TRADING_USERS = [
  // Rickey's Supabase user ID (get from Supabase Dashboard → Authentication → Users)
  'your-supabase-user-id-here', // Replace with your actual user ID
];

export interface TradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  tradingMode: 'paper' | 'live';
  slippage?: number; // Default 0.5%
  tokenAddress?: string; // For live trading
  userId: string;
  organizationId?: number;
}

export interface TradeResult {
  success: boolean;
  message: string;
  trade?: {
    id: string;
    symbol: string;
    quantity: number;
    price: number;
    value: number;
    txHash?: string;
    gasUsed?: string;
    blockNumber?: number;
  };
  validation?: {
    approved: boolean;
    reason?: string;
  };
  error?: string;
  stage?: string;
}

/**
 * CONSTITUTIONAL TRADING SERVICE
 * Routes all trades through R.O.M.A.N. validation before execution
 */
export class RobustTradingService {
  /**
   * Execute a trade through R.O.M.A.N. validation
   * @param request Trade request parameters
   * @returns Trade result with validation details
   */
  static async executeTrade(request: TradeRequest): Promise<TradeResult> {
    console.log(
      `🎯 Initiating ${request.tradingMode} trade: ${request.side.toUpperCase()} ${request.quantity} ${request.symbol}`
    );

    try {
      // SECURITY CHECK: Live trading authorization
      if (request.tradingMode === 'live') {
        const isAuthorized = await this.validateLiveTradingAuthorization(
          request.userId
        );
        if (!isAuthorized) {
          console.warn(
            '🚨 SECURITY: Unauthorized live trading attempt blocked',
            {
              userId: request.userId,
              timestamp: new Date().toISOString(),
            }
          );

          return {
            success: false,
            message:
              '🚨 Live trading is restricted to authorized accounts only. Paper trading is available for all users to learn and practice.',
            error:
              '🚨 Live trading is restricted to authorized accounts only. Paper trading is available for all users to learn and practice.',
          };
        }
        console.log('✅ Live trading authorization verified');
      }

      // PHASE 1: Build R.O.M.A.N. Command
      const command: RomanCommand = {
        action: 'EXECUTE',
        target: 'TRADE',
        payload: {
          symbol: request.symbol,
          side: request.side,
          quantity: request.quantity,
          tradingMode: request.tradingMode,
          slippage: request.slippage || 0.5,
          tokenAddress: request.tokenAddress,
          organizationId: request.organizationId,
        },
        metadata: {
          requestedBy: request.userId,
          timestamp: new Date().toISOString(),
          intent: `${request.side} ${request.quantity} ${request.symbol} (${request.tradingMode})`,
          organizationId: request.organizationId,
        },
      };

      // PHASE 2: R.O.M.A.N. Constitutional Validation
      console.log('⚖️ Submitting to R.O.M.A.N. for validation...');

      // Build intent string for R.O.M.A.N. processing
      const intent = `${request.side} ${request.quantity} ${request.symbol} (${request.tradingMode} trading)`;

      const validationResult = await SovereignCoreOrchestrator.processIntent(
        intent,
        request.userId,
        request.organizationId
      );

      // If validation failed, return immediately
      if (!validationResult.success) {
        console.error(
          '❌ R.O.M.A.N. rejected trade:',
          validationResult.message
        );
        return {
          success: false,
          message: validationResult.message,
          validation: validationResult.validation,
          stage: 'validation',
        };
      }

      console.log('✅ R.O.M.A.N. approved trade');

      // PHASE 3: Execute trade based on mode
      if (request.tradingMode === 'paper') {
        return await this.executePaperTrade(request);
      } else {
        return await this.executeLiveTrade(request);
      }
    } catch (error) {
      console.error('❌ Trade execution failed:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error during trade execution',
        error: error instanceof Error ? error.message : 'Unknown error',
        stage: 'execution',
      };
    }
  }

  /**
   * Execute a paper trade (database only, no blockchain)
   */
  private static async executePaperTrade(
    request: TradeRequest
  ): Promise<TradeResult> {
    console.log('📄 Executing paper trade...');

    try {
      // Call existing trade-orchestrator Edge Function
      const { data, error } = await supabase.functions.invoke(
        'trade-orchestrator',
        {
          body: {
            action: 'EXECUTE_PAPER_TRADE',
            payload: {
              symbol: request.symbol,
              side: request.side,
              quantity: request.quantity,
              price: 0, // Let orchestrator fetch live price
            },
          },
        }
      );

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      console.log('✅ Paper trade executed successfully');

      return {
        success: true,
        message: `Paper trade executed: ${request.side.toUpperCase()} ${request.quantity} ${request.symbol}`,
        trade: {
          id: data.trade.id,
          symbol: data.trade.symbol,
          quantity: data.trade.quantity,
          price: data.trade.price,
          value: data.trade.value,
        },
      };
    } catch (error) {
      console.error('❌ Paper trade failed:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Paper trade execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        stage: 'paper-execution',
      };
    }
  }

  /**
   * Execute a live trade (blockchain transaction)
   */
  private static async executeLiveTrade(
    request: TradeRequest
  ): Promise<TradeResult> {
    console.log('🔗 Executing live blockchain trade...');

    if (!request.tokenAddress) {
      return {
        success: false,
        message: 'Token address required for live trading',
        stage: 'pre-validation',
      };
    }

    try {
      // Step 1: Connect wallet
      const walletAddress = await Web3Service.connectWallet();
      if (!walletAddress) {
        return {
          success: false,
          message: 'Failed to connect wallet - please connect MetaMask',
          stage: 'wallet-connection',
        };
      }

      console.log(`💼 Connected wallet: ${walletAddress}`);

      // Step 2: Estimate gas costs
      console.log('⛽ Estimating gas costs...');
      const gasEstimate = await Web3Service.estimateSwapGas(
        request.tokenAddress,
        Web3Service.TOKENS.WMATIC, // Example: swap to WMATIC
        request.quantity.toString(),
        request.slippage || 0.5
      );

      if (!gasEstimate) {
        return {
          success: false,
          message: 'Failed to estimate gas - insufficient liquidity?',
          stage: 'gas-estimation',
        };
      }

      console.log(
        `⛽ Estimated gas: ${gasEstimate.gasCostMATIC} MATIC ($${gasEstimate.gasCostUSD})`
      );

      // Step 3: Validate balance (trade amount + gas)
      console.log('💰 Validating balance...');
      const balanceCheck = await Web3Service.validateTradeBalance(
        walletAddress,
        request.tokenAddress,
        request.quantity.toString(),
        gasEstimate.gasCostMATIC
      );

      if (!balanceCheck.valid) {
        return {
          success: false,
          message: balanceCheck.error || 'Insufficient balance for trade',
          stage: 'balance-validation',
        };
      }

      console.log('✅ Balance validation passed');

      // Step 4: Execute blockchain swap
      console.log('🔄 Broadcasting transaction...');
      const swapResult = await Web3Service.executeRealSwap(
        request.tokenAddress,
        Web3Service.TOKENS.WMATIC,
        request.quantity.toString(),
        request.slippage || 0.5,
        walletAddress
      );

      if (!swapResult.success) {
        return {
          success: false,
          message: swapResult.message,
          error: swapResult.error,
          stage: swapResult.stage,
        };
      }

      console.log(`✅ Transaction confirmed: ${swapResult.txHash}`);

      // Step 5: Record in database
      console.log('💾 Recording trade in database...');
      const { data: trade, error: dbError } = await supabase
        .from('trades')
        .insert({
          user_id: request.userId,
          symbol: request.symbol,
          type: request.side,
          quantity: request.quantity,
          price: 0, // TODO: Calculate from swap output
          value: request.quantity, // TODO: Calculate actual value
          status: 'executed',
          is_paper_trade: false,
          tx_hash: swapResult.txHash,
          gas_used: swapResult.gasUsed,
          block_number: swapResult.blockNumber,
        })
        .select()
        .single();

      if (dbError) {
        console.error(
          '⚠️ Database record failed (but trade succeeded on-chain):',
          dbError
        );
        // Trade succeeded on blockchain, but DB failed - this is recoverable
      }

      // Step 6: Record position lot
      if (trade) {
        await supabase.from('position_lots').insert({
          id: `trade_${trade.id}`,
          user_id: request.userId,
          symbol: request.symbol,
          shares: request.side === 'buy' ? request.quantity : -request.quantity,
          purchase_price: 0, // TODO: Calculate
          purchase_date: new Date().toISOString(),
          description: `Live Trade: ${request.side} ${request.quantity} ${request.symbol}`,
        });
      }

      return {
        success: true,
        message: `Live trade executed successfully! Tx: ${swapResult.txHash}`,
        trade: trade
          ? {
              id: trade.id,
              symbol: trade.symbol,
              quantity: trade.quantity,
              price: trade.price,
              value: trade.value,
              txHash: swapResult.txHash,
              gasUsed: swapResult.gasUsed,
              blockNumber: swapResult.blockNumber,
            }
          : undefined,
      };
    } catch (error) {
      console.error('❌ Live trade failed:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Live trade execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        stage: 'live-execution',
      };
    }
  }

  /**
   * Get trade summary before execution (for confirmation dialog)
   */
  static async getTradePreview(request: TradeRequest): Promise<{
    tradeAmount: number;
    estimatedGasMATIC?: string;
    estimatedGasUSD?: string;
    totalCost?: number;
    slippage: number;
    warnings: string[];
  }> {
    const warnings: string[] = [];

    // For paper trading, just return basics
    if (request.tradingMode === 'paper') {
      return {
        tradeAmount: request.quantity,
        slippage: request.slippage || 0.5,
        warnings: [],
      };
    }

    // For live trading, estimate gas
    if (!request.tokenAddress) {
      warnings.push('Token address missing - cannot estimate gas');
      return {
        tradeAmount: request.quantity,
        slippage: request.slippage || 0.5,
        warnings,
      };
    }

    try {
      const gasEstimate = await Web3Service.estimateSwapGas(
        request.tokenAddress,
        Web3Service.TOKENS.WMATIC,
        request.quantity.toString(),
        request.slippage || 0.5
      );

      if (!gasEstimate) {
        warnings.push('Could not estimate gas - insufficient liquidity?');
        return {
          tradeAmount: request.quantity,
          slippage: request.slippage || 0.5,
          warnings,
        };
      }

      const totalCost = request.quantity + parseFloat(gasEstimate.gasCostUSD);

      // Add warnings
      if (parseFloat(gasEstimate.gasCostUSD) / request.quantity > 0.05) {
        warnings.push(
          `⚠️ Gas fees are ${((parseFloat(gasEstimate.gasCostUSD) / request.quantity) * 100).toFixed(1)}% of trade value`
        );
      }

      if (request.quantity < 10) {
        warnings.push('⚠️ Small trades may have high gas-to-value ratio');
      }

      return {
        tradeAmount: request.quantity,
        estimatedGasMATIC: gasEstimate.gasCostMATIC,
        estimatedGasUSD: gasEstimate.gasCostUSD,
        totalCost,
        slippage: request.slippage || 0.5,
        warnings,
      };
    } catch (error) {
      warnings.push('Gas estimation failed - cannot preview trade');
      return {
        tradeAmount: request.quantity,
        slippage: request.slippage || 0.5,
        warnings,
      };
    }
  }

  /**
   * Validate if user is authorized for live trading
   * Live trading is ONLY for authorized accounts (owner/admin)
   * All other users should use paper trading for learning
   *
   * @param userId Supabase user ID
   * @returns true if authorized for live trading
   */
  private static async validateLiveTradingAuthorization(
    userId: string
  ): Promise<boolean> {
    try {
      // Check 1: Is user in authorized list?
      if (AUTHORIZED_LIVE_TRADING_USERS.includes(userId)) {
        return true;
      }

      // Check 2: Check user's role in database
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role, metadata')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to check user authorization:', error);
        return false;
      }

      // Check if user has admin/owner role
      if (profile?.role === 'admin' || profile?.role === 'owner') {
        console.log('✅ User authorized via role:', profile.role);
        return true;
      }

      // Check metadata for live trading permission
      if (profile?.metadata?.liveTradingEnabled === true) {
        console.log('✅ User authorized via metadata flag');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error validating live trading authorization:', error);
      return false; // Fail secure - deny access on error
    }
  }

  /**
   * Check if a wallet address is authorized for live trading
   * Used as secondary validation when connecting wallet
   *
   * @param walletAddress Ethereum wallet address
   * @returns true if wallet is authorized
   */
  static isWalletAuthorized(walletAddress: string): boolean {
    return AUTHORIZED_LIVE_TRADING_WALLETS.map(addr =>
      addr.toLowerCase()
    ).includes(walletAddress.toLowerCase());
  }
}
