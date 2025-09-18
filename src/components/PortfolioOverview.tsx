import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Account {
  id: string;
  currency: string;
  balance: string;
  available: string;
  hold: string;
}

interface PortfolioOverviewProps {
  accounts: Account[];
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ accounts }) => {
  const totalBalance = accounts.reduce((sum, account) => {
    return sum + (parseFloat(account.balance) || 0);
  }, 0);

  const filteredAccounts = accounts.filter(account => 
    parseFloat(account.balance) > 0.01
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredAccounts.map((account) => {
            const balance = parseFloat(account.balance) || 0;
            const percentage = totalBalance > 0 ? (balance / totalBalance) * 100 : 0;
            const available = parseFloat(account.available) || 0;
            const hold = parseFloat(account.hold) || 0;
            
            return (
              <div key={account.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{account.currency}</Badge>
                    <span className="font-medium">{balance.toFixed(6)}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{percentage.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">
                      ${(balance * 43287).toFixed(2)}
                    </div>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Available: {available.toFixed(6)}</span>
                  <span>On Hold: {hold.toFixed(6)}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Today</span>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="font-medium">+2.4%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">This Week</span>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="font-medium">+8.7%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">This Month</span>
                <div className="flex items-center text-red-600">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span className="font-medium">-3.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">All Time</span>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="font-medium">+127.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Bought 0.1 BTC</span>
                <span className="text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Sold 2.5 ETH</span>
                <span className="text-muted-foreground">5h ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Bought 100 ADA</span>
                <span className="text-muted-foreground">1d ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Sold 0.05 BTC</span>
                <span className="text-muted-foreground">2d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { PortfolioOverview };
export default PortfolioOverview;