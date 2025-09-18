import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletState {
  connected: boolean;
  address: string;
  balance: string;
  chainId: string;
  network: string;
}

export default function MetaMaskConnector() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: '',
    balance: '',
    chainId: '',
    network: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkIfWalletIsConnected();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet();
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWallet({
        connected: false,
        address: '',
        balance: '',
        chainId: '',
        network: ''
      });
    } else {
      connectWallet();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const getNetworkName = (chainId: string): string => {
    const networks: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai',
      '0xa86a': 'Avalanche Mainnet'
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });

      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);

      setWallet({
        connected: true,
        address: accounts[0],
        balance: balanceInEth,
        chainId,
        network: getNetworkName(chainId)
      });

    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      connected: false,
      address: '',
      balance: '',
      chainId: '',
      network: ''
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          MetaMask Wallet
        </CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to interact with Web3
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {!wallet.connected ? (
          <Button 
            onClick={connectWallet} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Wallet className="w-4 h-4 mr-2" />
            )}
            Connect MetaMask
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">Wallet Connected</span>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Address:</span>
                <p className="text-gray-600 font-mono break-all">
                  {wallet.address}
                </p>
              </div>
              <div>
                <span className="font-medium">Balance:</span>
                <p className="text-gray-600">{wallet.balance} ETH</p>
              </div>
              <div>
                <span className="font-medium">Network:</span>
                <p className="text-gray-600">{wallet.network}</p>
              </div>
            </div>

            <Button 
              onClick={disconnectWallet}
              variant="outline"
              className="w-full"
            >
              Disconnect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}