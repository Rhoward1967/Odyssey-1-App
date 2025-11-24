// Remove Web3 import for now and use window.ethereum directly
declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  private static readonly POLYGON_RPC = 'https://polygon-rpc.com/';
  private static readonly POLYGON_CHAIN_ID = 137;

  // Initialize Web3 with Polygon network (using window.ethereum directly)
  static async initializeWeb3() {
    if (typeof window.ethereum !== 'undefined') {
      // Switch to Polygon network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${this.POLYGON_CHAIN_ID.toString(16)}` }],
        });
      } catch (error: any) {
        // Add Polygon network if not found
        if (error.code === 4902) {
          await this.addPolygonNetwork();
        }
      }
      return true;
    }
    return false;
  }

  // Add Polygon network to MetaMask
  static async addPolygonNetwork() {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${this.POLYGON_CHAIN_ID.toString(16)}`,
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        rpcUrls: [this.POLYGON_RPC],
        blockExplorerUrls: ['https://polygonscan.com/'],
      }],
    });
  }

  // Get MATIC balance (simplified)
  static async getMaticBalance(address: string) {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      // Convert from wei to ether
      return (parseInt(balance, 16) / 1e18).toFixed(4);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0.0000';
    }
  }

  // Connect wallet
  static async connectWallet() {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  // Get token balance (USDC, USDT, etc.) - simplified version
  static async getTokenBalance(address: string, tokenContract: string) {
    try {
      // For demo purposes, return mock token balances
      // In production, you'd use Web3 contract calls
      const mockBalances: { [key: string]: number } = {
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': 1250.50, // USDC
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F': 875.25,  // USDT
        '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619': 2.45,    // WETH
      };
      
      return mockBalances[tokenContract] || 0;
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  }

  // Get multiple token balances at once
  static async getMultipleTokenBalances(address: string) {
    const tokens = {
      USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    };

    const balances: { [key: string]: number } = {};
    
    for (const [symbol, contract] of Object.entries(tokens)) {
      balances[symbol] = await this.getTokenBalance(address, contract);
    }
    
    return balances;
  }

  // QuickSwap Router Contract on Polygon
  private static readonly QUICKSWAP_ROUTER = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';
  
  // Common token addresses on Polygon
  static readonly TOKENS = {
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
  };

  // ERC20 ABI (minimal - for approvals and balance checks)
  private static readonly ERC20_ABI = [
    'function approve(address spender, uint256 amount) public returns (bool)',
    'function allowance(address owner, address spender) public view returns (uint256)',
    'function balanceOf(address account) public view returns (uint256)',
    'function decimals() public view returns (uint8)'
  ];

  // QuickSwap Router ABI (minimal - for swaps)
  private static readonly ROUTER_ABI = [
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'
  ];

  // Get real token balance from blockchain
  static async getRealTokenBalance(walletAddress: string, tokenAddress: string): Promise<number> {
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, this.ERC20_ABI, provider);
      
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      
      return parseFloat(ethers.formatUnits(balance, decimals));
    } catch (error) {
      console.error('Failed to get real token balance:', error);
      return 0;
    }
  }

  // Estimate gas cost for a swap transaction
  static async estimateSwapGas(
    fromToken: string,
    toToken: string,
    amountIn: string,
    slippageTolerance: number = 0.5
  ): Promise<{ gasEstimate: string; gasCostMATIC: string; gasCostUSD: string } | null> {
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const router = new ethers.Contract(this.QUICKSWAP_ROUTER, this.ROUTER_ABI, provider);

      // Get quote first
      const quote = await this.getSwapQuote(fromToken, toToken, amountIn);
      if (!quote) return null;

      const path = [fromToken, toToken];
      const amountInWei = ethers.parseUnits(amountIn, 6); // USDC has 6 decimals
      const minAmountOut = ethers.parseUnits(quote.minimumReceived, 18);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const walletAddress = await signer.getAddress();

      // Estimate gas for swap
      const gasEstimate = await router.swapExactTokensForTokens.estimateGas(
        amountInWei,
        minAmountOut,
        path,
        walletAddress,
        deadline
      );

      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('50', 'gwei');

      // Calculate total gas cost in wei
      const gasCostWei = gasEstimate * gasPrice;
      const gasCostMATIC = ethers.formatEther(gasCostWei);

      // Get MATIC price in USD (approximate)
      const maticPriceUSD = 0.80; // Should fetch real price
      const gasCostUSD = (parseFloat(gasCostMATIC) * maticPriceUSD).toFixed(4);

      return {
        gasEstimate: gasEstimate.toString(),
        gasCostMATIC,
        gasCostUSD
      };
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      return null;
    }
  }

  // Get current gas prices on Polygon
  static async getCurrentGasPrices(): Promise<{
    slow: string;
    standard: string;
    fast: string;
  } | null> {
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const feeData = await provider.getFeeData();

      if (!feeData.gasPrice) return null;

      const baseFee = feeData.gasPrice;
      const slow = ethers.formatUnits(baseFee, 'gwei');
      const standard = ethers.formatUnits(baseFee * BigInt(110) / BigInt(100), 'gwei'); // +10%
      const fast = ethers.formatUnits(baseFee * BigInt(125) / BigInt(100), 'gwei'); // +25%

      return { slow, standard, fast };
    } catch (error) {
      console.error('Failed to get gas prices:', error);
      return null;
    }
  }

  // Validate sufficient balance for trade (including gas)
  static async validateTradeBalance(
    walletAddress: string,
    tokenAddress: string,
    tradeAmount: string,
    estimatedGasCostMATIC: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const { ethers } = await import('ethers');
      
      // Check token balance
      const tokenBalance = await this.getRealTokenBalance(walletAddress, tokenAddress);
      const tradeAmountNum = parseFloat(tradeAmount);

      if (tokenBalance < tradeAmountNum) {
        return {
          valid: false,
          error: `Insufficient token balance. Have: ${tokenBalance.toFixed(6)}, Need: ${tradeAmountNum}`
        };
      }

      // Check MATIC balance for gas
      const maticBalance = await this.getMaticBalance(walletAddress);
      const maticBalanceNum = parseFloat(maticBalance);
      const gasCostNum = parseFloat(estimatedGasCostMATIC);

      if (maticBalanceNum < gasCostNum) {
        return {
          valid: false,
          error: `Insufficient MATIC for gas. Have: ${maticBalanceNum.toFixed(4)} MATIC, Need: ${gasCostNum.toFixed(4)} MATIC`
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Wait for transaction confirmation
  static async waitForConfirmation(
    txHash: string,
    requiredConfirmations: number = 3,
    timeoutSeconds: number = 300
  ): Promise<{
    success: boolean;
    confirmations?: number;
    blockNumber?: number;
    gasUsed?: string;
    error?: string;
  }> {
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);

      console.log(`⏳ Waiting for ${requiredConfirmations} confirmations on tx: ${txHash}`);

      // Wait for transaction with timeout
      const receipt = await provider.waitForTransaction(txHash, requiredConfirmations, timeoutSeconds * 1000);

      if (!receipt) {
        return {
          success: false,
          error: 'Transaction receipt not found'
        };
      }

      if (receipt.status === 0) {
        return {
          success: false,
          error: 'Transaction reverted'
        };
      }

      console.log(`✅ Transaction confirmed! Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed}`);

      return {
        success: true,
        confirmations: requiredConfirmations,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to wait for confirmation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Confirmation timeout'
      };
    }
  }

  // Get quote for token swap
  static async getSwapQuote(fromToken: string, toToken: string, amountIn: string) {
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const router = new ethers.Contract(this.QUICKSWAP_ROUTER, this.ROUTER_ABI, provider);
      
      const path = [fromToken, toToken];
      const amountInWei = ethers.parseUnits(amountIn, 6); // Assuming 6 decimals for USDC
      
      const amounts = await router.getAmountsOut(amountInWei, path);
      const amountOut = ethers.formatUnits(amounts[1], 18); // Assuming 18 decimals for output
      
      return {
        amountOut,
        priceImpact: '0.5%', // Simplified - calculate properly in production
        minimumReceived: (parseFloat(amountOut) * 0.995).toFixed(6) // 0.5% slippage
      };
    } catch (error) {
      console.error('Failed to get swap quote:', error);
      return null;
    }
  }

  // Execute real token swap via QuickSwap with comprehensive error handling
  static async executeRealSwap(
    fromToken: string, 
    toToken: string, 
    amountIn: string,
    slippageTolerance: number = 0.5,
    walletAddress: string
  ): Promise<{
    success: boolean;
    txHash?: string;
    message: string;
    gasUsed?: string;
    blockNumber?: number;
    error?: any;
    stage?: string;
  }> {
    try {
      console.log(`🔄 Executing REAL swap: ${amountIn} ${fromToken} → ${toToken}`);
      
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Validate network is Polygon
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(137)) {
        return {
          success: false,
          message: 'Please switch to Polygon network',
          stage: 'network-check'
        };
      }

      // Get quote and calculate minimum output
      const quote = await this.getSwapQuote(fromToken, toToken, amountIn);
      if (!quote) {
        return {
          success: false,
          message: 'Failed to get swap quote - insufficient liquidity?',
          stage: 'quote'
        };
      }

      const minAmountOut = (parseFloat(quote.amountOut) * (1 - slippageTolerance / 100)).toFixed(6);
      console.log(`� Quote: ${quote.amountOut} expected, ${minAmountOut} minimum (${slippageTolerance}% slippage)`);

      // Step 1: Check allowance first
      console.log('🔍 Checking token allowance...');
      const tokenContract = new ethers.Contract(fromToken, this.ERC20_ABI, signer);
      const amountInWei = ethers.parseUnits(amountIn, 6); // USDC has 6 decimals
      const currentAllowance = await tokenContract.allowance(walletAddress, this.QUICKSWAP_ROUTER);

      // Step 2: Approve token spending if needed
      if (currentAllowance < amountInWei) {
        console.log('📝 Approving token spend...');
        try {
          const approveTx = await tokenContract.approve(this.QUICKSWAP_ROUTER, amountInWei);
          const approveReceipt = await approveTx.wait();
          console.log(`✅ Token approval confirmed in block ${approveReceipt.blockNumber}`);
        } catch (error: any) {
          return {
            success: false,
            message: `Approval failed: ${error.message}`,
            error,
            stage: 'approval'
          };
        }
      } else {
        console.log('✅ Sufficient allowance already exists');
      }
      
      // Step 3: Execute swap
      console.log('💱 Executing swap on QuickSwap...');
      const router = new ethers.Contract(this.QUICKSWAP_ROUTER, this.ROUTER_ABI, signer);
      const path = [fromToken, toToken];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
      const minAmountOutWei = ethers.parseUnits(minAmountOut, 18); // Assuming 18 decimals for output
      
      let swapTx;
      try {
        swapTx = await router.swapExactTokensForTokens(
          amountInWei,
          minAmountOutWei,
          path,
          walletAddress,
          deadline
        );
      } catch (error: any) {
        // Handle specific errors
        if (error.code === 'INSUFFICIENT_FUNDS') {
          return {
            success: false,
            message: 'Insufficient MATIC for gas fees',
            error,
            stage: 'swap-broadcast'
          };
        }
        if (error.code === 'CALL_EXCEPTION' || error.message?.includes('INSUFFICIENT')) {
          return {
            success: false,
            message: 'Trade would fail - insufficient liquidity or amount too high',
            error,
            stage: 'swap-broadcast'
          };
        }
        if (error.code === 'ACTION_REJECTED') {
          return {
            success: false,
            message: 'User rejected transaction',
            error,
            stage: 'swap-broadcast'
          };
        }
        throw error; // Re-throw unknown errors
      }
      
      console.log(`⏳ Transaction broadcast: ${swapTx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      
      // Step 4: Wait for confirmation
      const receipt = await swapTx.wait(3); // Wait for 3 confirmations
      
      if (!receipt || receipt.status === 0) {
        return {
          success: false,
          txHash: swapTx.hash,
          message: 'Transaction reverted on-chain',
          stage: 'confirmation'
        };
      }

      console.log(`✅ Swap confirmed! Block: ${receipt.blockNumber}, Gas: ${receipt.gasUsed}`);
      
      return {
        success: true,
        txHash: receipt.hash,
        message: `Successfully swapped ${amountIn} tokens on QuickSwap`,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        stage: 'complete'
      };
    } catch (error: any) {
      console.error('❌ Swap failed:', error);
      
      // Handle generic errors
      let errorMessage = 'Swap transaction failed';
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error - please check your connection';
      } else if (error.code === 'TIMEOUT') {
        errorMessage = 'Transaction timeout - it may still be pending';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
        error: error,
        stage: 'unknown'
      };
    }
  }

  // Execute token swap (simplified - keeping for backward compatibility)
  static async swapTokens(fromToken: string, toToken: string, amount: string) {
    try {
      // Mock swap execution
      console.log(`🔄 Executing swap: ${amount} ${fromToken} → ${toToken}`);
      
      // In production, this would interact with QuickSwap or 1inch
      return {
        success: true,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        message: `Swapped ${amount} ${fromToken} to ${toToken} on Polygon`,
        gasUsed: Math.floor(Math.random() * 50000) + 100000
      };
    } catch (error) {
      console.error('Swap failed:', error);
      return {
        success: false,
        message: 'Swap transaction failed'
      };
    }
  }
}
