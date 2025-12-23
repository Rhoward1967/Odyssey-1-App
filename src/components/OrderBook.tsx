import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Order {
  id: string;
  product_id: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  size: string;
  price?: string;
  status: 'pending' | 'open' | 'done' | 'cancelled';
  created_at: string;
  filled_size?: string;
}

const OrderBook: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Mock data for now since we need to implement getOrders action
      const mockOrders: Order[] = [
        {
          id: '1',
          product_id: 'BTC-USD',
          side: 'buy',
          type: 'limit',
          size: '0.001',
          price: '43000',
          status: 'open',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          product_id: 'ETH-USD',
          side: 'sell',
          type: 'market',
          size: '0.1',
          status: 'done',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          filled_size: '0.1'
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/coinbase-trading-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'cancel_order',
          order_id: orderId 
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'open':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeOrders = orders.filter(order => order.status === 'open' || order.status === 'pending');
  const completedOrders = orders.filter(order => order.status === 'done');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {activeOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active orders</p>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.toUpperCase()}
                          </Badge>
                          <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                            {order.side.toUpperCase()}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelOrder(order.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Pair</p>
                          <p className="font-medium">{order.product_id}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium">{order.type.toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-medium">{parseFloat(order.size).toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium">
                            {order.price ? `$${parseFloat(order.price).toLocaleString()}` : 'Market'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {completedOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No completed orders</p>
              ) : (
                <div className="space-y-4">
                  {completedOrders.slice(0, 10).map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <Badge className={getStatusColor(order.status)}>
                          COMPLETED
                        </Badge>
                        <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                          {order.side.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Pair</p>
                          <p className="font-medium">{order.product_id}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-medium">{parseFloat(order.size).toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Filled</p>
                          <p className="font-medium">{parseFloat(order.filled_size || '0').toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium">
                            {order.price ? `$${parseFloat(order.price).toLocaleString()}` : 'Market'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-medium">
                            ${((parseFloat(order.filled_size || '0')) * (parseFloat(order.price || '0'))).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled">
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {cancelledOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No cancelled orders</p>
              ) : (
                <div className="space-y-4">
                  {cancelledOrders.slice(0, 10).map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 space-y-3 opacity-75">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <Badge className={getStatusColor(order.status)}>
                          CANCELLED
                        </Badge>
                        <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                          {order.side.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Pair</p>
                          <p className="font-medium">{order.product_id}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium">{order.type.toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-medium">{parseFloat(order.size).toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium">
                            {order.price ? `$${parseFloat(order.price).toLocaleString()}` : 'Market'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { OrderBook };
export default OrderBook;