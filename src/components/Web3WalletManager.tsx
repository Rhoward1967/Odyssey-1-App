import React, { useState } from 'react';
import { Wallet, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/lib/supabaseClient';

interface WalletAccount {
  id: string;
  name: string;
  address: string;
  balance: string;
  network: string;
  isActive: boolean;
}

export default function Web3WalletManager() {
  const [wallets, setWallets] = useState<WalletAccount[]>([
    {
      id: '1',
      name: 'Main Wallet',
      address: '0x742d35Cc6634C0532925a3b8D0C9e0e7C9F8b8e8',
      balance: '2.5432',
      network: 'Ethereum',
      isActive: true
    }
  ]);
  
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);
  const [loading, setLoading] = useState(false);

  const addWallet = async () => {
    if (!newWalletName.trim() || !newWalletAddress.trim()) {
      return;
    }

    setLoading(true);
    
    try {
      // Call Web3 function to validate and get balance
      const { data, error } = await supabase.functions.invoke('web3-integration', {
        body: { 
          action: 'get_balance', 
          address: newWalletAddress 
        }
      });

      if (error) throw error;

      const newWallet: WalletAccount = {
        id: Date.now().toString(),
        name: newWalletName,
        address: newWalletAddress,
        balance: data.balance || '0',
        network: data.network || 'Ethereum',
        isActive: false
      };

      setWallets(prev => [...prev, newWallet]);
      setNewWalletName('');
      setNewWalletAddress('');
    } catch (error) {
      console.error('Error adding wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeWallet = (id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  const setActiveWallet = (id: string) => {
    setWallets(prev => prev.map(w => ({
      ...w,
      isActive: w.id === id
    })));
  };

  const refreshBalance = async (wallet: WalletAccount) => {
    try {
      const { data } = await supabase.functions.invoke('web3-integration', {
        body: { 
          action: 'get_balance', 
          address: wallet.address 
        }
      });

      setWallets(prev => prev.map(w => 
        w.id === wallet.id 
          ? { ...w, balance: data.balance || w.balance }
          : w
      ));
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Manager
          </CardTitle>
          <CardDescription>
            Manage your Web3 wallets and accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Wallet name"
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
            />
            <Input
              placeholder="Wallet address (0x...)"
              value={newWalletAddress}
              onChange={(e) => setNewWalletAddress(e.target.value)}
            />
          </div>
          <Button 
            onClick={addWallet} 
            disabled={loading || !newWalletName.trim() || !newWalletAddress.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Wallet
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className={wallet.isActive ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{wallet.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {wallet.isActive && (
                    <Badge variant="default">Active</Badge>
                  )}
                  <Badge variant="outline">{wallet.network}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Address:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrivateKeys(!showPrivateKeys)}
                  >
                    {showPrivateKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="font-mono text-xs break-all bg-gray-100 p-2 rounded">
                  {showPrivateKeys ? wallet.address : wallet.address.slice(0, 10) + '...' + wallet.address.slice(-8)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Balance:</span>
                <span className="text-lg font-bold">{wallet.balance} ETH</span>
              </div>

              <div className="flex gap-2">
                {!wallet.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveWallet(wallet.id)}
                  >
                    Set Active
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshBalance(wallet)}
                >
                  Refresh
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeWallet(wallet.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {wallets.length === 0 && (
        <Alert>
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            No wallets added yet. Add your first wallet to get started.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}