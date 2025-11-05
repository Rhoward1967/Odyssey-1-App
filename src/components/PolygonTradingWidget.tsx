import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PolygonMarketService } from '@/services/polygonMarketService';
import { Web3Service } from '@/services/web3Service';
import { useEffect, useState } from 'react';

export default function PolygonTradingWidget() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [maticBalance, setMaticBalance] = useState('0');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [gasFees, setGasFees] = useState({ standard: 30, fast: 35, instant: 40 });
  const [tokenBalances, setTokenBalances] = useState<{ [key: string]: number }>({});

  // Connect to Polygon network
  const connectPolygon = async () => {
    try {
      await Web3Service.initializeWeb3();
      const account = await Web3Service.connectWallet();
      
      if (account) {
        setAccount(account);
        setConnected(true);
        
        // Get MATIC balance
        const matic = await Web3Service.getMaticBalance(account);
        setMaticBalance(matic);
        
        // Get token balances
        const balances = await Web3Service.getMultipleTokenBalances(account);
        setTokenBalances(balances);
      }
    } catch (error) {
      console.error('Failed to connect to Polygon:', error);
    }
  };

  // Get gas fees
  useEffect(() => {
    const fetchGasFees = async () => {
      const fees = await PolygonMarketService.getPolygonGasFees();
      setGasFees(fees);
    };
    
    fetchGasFees();
    const interval = setInterval(fetchGasFees, 30000);
    return () => clearInterval(interval);
  }, []);

  // Execute token swap
  const executeSwap = async () => {
    const result = await Web3Service.swapTokens('USDC', 'MATIC', '100');
    
    if (result.success) {
      alert(`✅ Swap Successful!\n\nTransaction Hash: ${result.txHash}\nGas Used: ${result.gasUsed}`);
      // Refresh balances
      const balances = await Web3Service.getMultipleTokenBalances(account);
      setTokenBalances(balances);
    } else {
      alert(`❌ Swap Failed: ${result.message}`);
    }
  };

  return (
    <Card className="bg-purple-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-purple-300 flex items-center gap-2">
          🔷 Polygon Network Trading
          {connected && <span className="text-xs bg-green-600 px-2 py-1 rounded">LIVE</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <Button onClick={connectPolygon} className="w-full bg-purple-600 hover:bg-purple-700">
            🔷 Connect to Polygon Network
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded">
              <div className="text-sm text-gray-400 mb-2">Wallet Address:</div>
              <div className="font-mono text-xs text-white">{account}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-800 p-2 rounded text-center">
                <div className="text-purple-400 text-xs font-semibold">MATIC</div>
                <div className="font-mono text-white text-sm">{parseFloat(maticBalance).toFixed(4)}</div>
              </div>
              <div className="bg-slate-800 p-2 rounded text-center">
                <div className="text-blue-400 text-xs font-semibold">USDC</div>
                <div className="font-mono text-white text-sm">{(tokenBalances.USDC || 0).toFixed(2)}</div>
              </div>
              <div className="bg-slate-800 p-2 rounded text-center">
                <div className="text-green-400 text-xs font-semibold">USDT</div>
                <div className="font-mono text-white text-sm">{(tokenBalances.USDT || 0).toFixed(2)}</div>
              </div>
            </div>
            
            <div className="bg-slate-800 p-3 rounded">
              <div className="text-gray-400 text-sm mb-2">Gas Fees (Gwei):</div>
              <div className="flex gap-4 text-xs">
                <span>Standard: {gasFees.standard}</span>
                <span>Fast: {gasFees.fast}</span>
                <span>Instant: {gasFees.instant}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={executeSwap} className="flex-1 bg-green-600 hover:bg-green-700 text-xs">
                💱 Swap Tokens
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs">
                💰 DeFi Yield
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
