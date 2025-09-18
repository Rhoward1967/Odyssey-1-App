import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign, Activity } from 'lucide-react';

interface MarketData {
  trends?: any[];
  competitors?: any[];
  indicators?: any;
  updates?: any[];
}

const MarketIntelligence: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trends');

  const fetchMarketData = async (dataType: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-data-integration', {
        body: { dataType, parameters: {} }
      });
      
      if (error) throw error;
      
      setMarketData(prev => ({ ...prev, [dataType.replace('-', '')]: data[Object.keys(data)[0]] }));
    } catch (error) {
      console.error('Market data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData('market-trends');
    fetchMarketData('competitor-analysis');
    fetchMarketData('economic-indicators');
    fetchMarketData('regulatory-updates');
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 mb-6">
        {['trends', 'competitors', 'indicators', 'regulatory'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {activeTab === 'trends' && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.trends?.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{trend.sector}</p>
                    <p className="text-sm text-gray-400">Confidence: {(trend.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={trend.growth > 10 ? 'default' : 'secondary'}>
                      {trend.growth > 0 ? '+' : ''}{trend.growth}%
                    </Badge>
                    {trend.growth > 0 ? 
                      <TrendingUp className="w-4 h-4 text-green-400" /> : 
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    }
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'competitors' && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              Competitor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.competitors?.map((comp, index) => (
                <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium">{comp.name}</h4>
                    <Badge>{(comp.marketShare * 100).toFixed(0)}% Share</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Win Rate</p>
                      <p className="text-white">{(comp.winRate * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Avg Bid Value</p>
                      <p className="text-white">${(comp.avgBidValue / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketIntelligence;