import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { TrendingUp, TrendingDown, Search, Star, StarOff } from 'lucide-react';

interface Product {
  id: string;
  display_name: string;
  base_currency: string;
  quote_currency: string;
  price: string;
  price_change_24h: string;
}

interface MarketDataProps {
  products: Product[];
}

const MarketData: React.FC<MarketDataProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['BTC-USD', 'ETH-USD']);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter(product =>
    product.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'price':
        aValue = parseFloat(a.price);
        bValue = parseFloat(b.price);
        break;
      case 'change':
        aValue = parseFloat(a.price_change_24h || '0');
        bValue = parseFloat(b.price_change_24h || '0');
        break;
      default:
        aValue = a.display_name;
        bValue = b.display_name;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const favoriteProducts = sortedProducts.filter(product => 
    favorites.includes(product.id)
  );

  const otherProducts = sortedProducts.filter(product => 
    !favorites.includes(product.id)
  );

  const handleSort = (newSortBy: 'name' | 'price' | 'change') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const ProductRow: React.FC<{ product: Product }> = ({ product }) => {
    const priceChange = parseFloat(product.price_change_24h || '0');
    const isPositive = priceChange >= 0;

    return (
      <div className="flex items-center justify-between p-4 border-b hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFavorite(product.id)}
            className="p-1"
          >
            {favorites.includes(product.id) ? (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          <div>
            <div className="font-medium">{product.display_name}</div>
            <div className="text-sm text-muted-foreground">{product.id}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="font-medium">${parseFloat(product.price).toLocaleString()}</div>
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {Math.abs(priceChange).toFixed(2)}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Market Overview
            <Badge variant="outline">
              {products.length} Markets
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('name')}
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('price')}
              >
                Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant={sortBy === 'change' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('change')}
              >
                24h {sortBy === 'change' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </div>

          {favoriteProducts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                Favorites
              </h3>
              <div className="border rounded-lg">
                {favoriteProducts.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              All Markets
            </h3>
            <div className="border rounded-lg">
              {otherProducts.length > 0 ? (
                otherProducts.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {searchTerm ? 'No markets found matching your search.' : 'No markets available.'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Gainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products
                .filter(p => parseFloat(p.price_change_24h || '0') > 0)
                .sort((a, b) => parseFloat(b.price_change_24h || '0') - parseFloat(a.price_change_24h || '0'))
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{product.base_currency}</span>
                    <div className="text-green-600 text-sm flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{parseFloat(product.price_change_24h || '0').toFixed(2)}%
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Losers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products
                .filter(p => parseFloat(p.price_change_24h || '0') < 0)
                .sort((a, b) => parseFloat(a.price_change_24h || '0') - parseFloat(b.price_change_24h || '0'))
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{product.base_currency}</span>
                    <div className="text-red-600 text-sm flex items-center">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {parseFloat(product.price_change_24h || '0').toFixed(2)}%
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Market Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Markets:</span>
                <span className="font-medium">{products.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Gainers:</span>
                <span className="font-medium text-green-600">
                  {products.filter(p => parseFloat(p.price_change_24h || '0') > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Losers:</span>
                <span className="font-medium text-red-600">
                  {products.filter(p => parseFloat(p.price_change_24h || '0') < 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Unchanged:</span>
                <span className="font-medium">
                  {products.filter(p => parseFloat(p.price_change_24h || '0') === 0).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketData;