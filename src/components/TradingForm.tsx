import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ethers } from 'ethers';
import { useMetaMaskWallet } from './useMetaMaskWallet';

interface Product {
  id: string;
  display_name: string;
  base_currency: string;
  quote_currency: string;
  price: string;
  price_change_24h: string;
}

interface TradingFormProps {
  selectedProduct: string;
  onProductChange: (product: string) => void;
  products: Product[];
}

const TradingForm: React.FC<TradingFormProps> = ({ 
  selectedProduct, 
  onProductChange, 
  products 
}) => {
  const wallet = useMetaMaskWallet();
  // Example: Wrapped XRP (wXRP) contract address on Ethereum mainnet
  const WXRP_ADDRESS = '0x39fBBABf11738317a448031930706cd3e612e1B9';
  const WXRP_ABI = [
    'function transfer(address to, uint256 amount) public returns (bool)'
  ];

  const handleWeb3Trade = async () => {
    if (!wallet.connected || !window.ethereum) {
      alert('Please connect MetaMask first.');
      return;
    }
    if (!amount) {
      alert('Enter an amount to trade.');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(WXRP_ADDRESS, WXRP_ABI, signer);
      // For demo: send to self (replace with recipient for real trading)
      const tx = await contract.transfer(wallet.address, ethers.parseUnits(amount, 18));
      await tx.wait();
      alert('Web3 XRP transfer successful!');
    } catch (err: any) {
      alert('Web3 trade failed: ' + (err.message || err));
    }
  };
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const currentProduct = products.find(p => p.id === selectedProduct);
  const currentPrice = currentProduct ? parseFloat(currentProduct.price) : 0;
  const estimatedTotal = parseFloat(amount) * (orderType === 'market' ? currentPrice : parseFloat(price) || 0);

  const handleSubmitOrder = async () => {
    if (!amount || (orderType === 'limit' && !price)) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('coinbase-trading-engine', {
        body: {
          action: 'placeOrder',
          symbol: selectedProduct,
          side,
          orderType,
          amount,
          ...(orderType === 'limit' && { price })
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setAmount('');
        setPrice('');
        alert('Order placed successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert('Failed to place order: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Trading Pair</Label>
            <Select value={selectedProduct} onValueChange={onProductChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={side} onValueChange={(value) => setSide(value as 'buy' | 'sell')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" className="text-green-600">Buy</TabsTrigger>
              <TabsTrigger value="sell" className="text-red-600">Sell</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="limit">Limit</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label>Amount ({currentProduct?.base_currency})</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {orderType === 'limit' && (
            <div className="space-y-2">
              <Label>Price ({currentProduct?.quote_currency})</Label>
              <Input
                type="number"
                placeholder={currentPrice.toString()}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}

          {currentProduct && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Price:</span>
                <span className="font-medium">${currentPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated Total:</span>
                <span className="font-medium">${estimatedTotal.toLocaleString()}</span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSubmitOrder}
            disabled={loading || !amount || (orderType === 'limit' && !price)}
            className={`w-full ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? 'Placing Order...' : `${side.toUpperCase()} ${currentProduct?.base_currency}`}
          </Button>
          {/* Web3 XRP transfer button, only for XRP or wXRP trading pair */}
          {currentProduct?.base_currency.toUpperCase() === 'XRP' && (
            <Button 
              onClick={handleWeb3Trade}
              variant="outline"
              className="w-full mt-2 border-blue-500 text-blue-700"
              disabled={!wallet.connected}
            >
              {wallet.connected ? 'Web3 Trade (MetaMask XRP)' : 'Connect MetaMask for Web3 Trade'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-red-600 mb-2">Asks (Sell Orders)</h4>
              <div className="space-y-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-red-600">${(currentPrice + (i + 1) * 10).toLocaleString()}</span>
                    <span>{(Math.random() * 2).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-center py-2 bg-gray-100 rounded">
                <span className="font-medium">${currentPrice.toLocaleString()}</span>
                <Badge variant="outline" className="ml-2">
                  {currentProduct?.price_change_24h ? (
                    parseFloat(currentProduct.price_change_24h) > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )
                  ) : null}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-green-600 mb-2">Bids (Buy Orders)</h4>
              <div className="space-y-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-green-600">${(currentPrice - (i + 1) * 10).toLocaleString()}</span>
                    <span>{(Math.random() * 2).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingForm;