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

  // Execute token swap (simplified)
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
