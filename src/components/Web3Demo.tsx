import React, { useState } from 'react';
import { Wallet, Send, Search, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import MetaMaskConnector from './MetaMaskConnector';
import Web3WalletManager from './Web3WalletManager';
export default function Web3Demo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');

  const callWeb3Function = async (action: string, params: any) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/functions/v1/web3-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const checkBalance = () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    callWeb3Function('get_balance', { address: walletAddress });
  };

  const sendPayment = () => {
    if (!recipient.trim() || !amount.trim()) {
      setError('Please enter recipient address and amount');
      return;
    }
    callWeb3Function('send_payment', { 
      to: recipient, 
      amount: parseFloat(amount) 
    });
  };

  const verifyTransaction = () => {
    if (!txHash.trim()) {
      setError('Please enter a transaction hash');
      return;
    }
    callWeb3Function('verify_transaction', { tx_hash: txHash });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Web3 Blockchain Integration Demo
        </h1>
        <p className="text-gray-600 mt-2">
          Test blockchain functionality with real API integration
        </p>
      </div>

      {/* MetaMask Wallet Connection */}
      <div className="mb-8">
        <MetaMaskConnector />
      </div>

      {/* Wallet Manager */}
      <div className="mb-8">
        <Web3WalletManager />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Balance Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Check Balance
            </CardTitle>
            <CardDescription>
              Get wallet balance from blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <Button 
              onClick={checkBalance} 
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Check Balance'}
            </Button>
          </CardContent>
        </Card>

        {/* Send Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Payment
            </CardTitle>
            <CardDescription>
              Send cryptocurrency payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Recipient address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <Input
              placeholder="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button 
              onClick={sendPayment} 
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Send Payment'}
            </Button>
          </CardContent>
        </Card>

        {/* Verify Transaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Verify Transaction
            </CardTitle>
            <CardDescription>
              Check transaction status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Transaction hash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
            <Button 
              onClick={verifyTransaction} 
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Verify Transaction'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Result
              <Badge variant="secondary">Success</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>Web3 Integration Active</span>
            <Badge variant="outline">API Key Configured</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}