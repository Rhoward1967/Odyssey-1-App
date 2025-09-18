import React, { useState } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Users, Calculator, Shield, Eye } from 'lucide-react';

interface BidderInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zipcode: string;
}

interface ServiceSpecs {
  selectedSpecs: any[];
  services: string[];
  frequency: string;
  contractType: 'one-time' | 'monthly';
  totalEstimate: number;
}

interface PrivacyViewerProps {
  bidderInfo: BidderInfo | null;
  serviceSpecs: ServiceSpecs | null;
}

type ViewType = 'bidder' | 'customer' | 'admin' | null;

const PrivacyViewer: React.FC<PrivacyViewerProps> = ({ bidderInfo, serviceSpecs }) => {
  const [activeView, setActiveView] = useState<ViewType>(null);

  const generateBidderView = () => {
    if (!serviceSpecs) return 'No data available';
    
    const commission = serviceSpecs.totalEstimate * 0.10;
    const dailyRate = serviceSpecs.totalEstimate / 30;
    
    return `BIDDER VIEW - COMMISSION DETAILS
    
🔒 RESTRICTED ACCESS
Commission Amount: $${commission.toFixed(2)} (10%)
Customer Daily Rate: $${dailyRate.toFixed(2)}

Note: This is your commission for this project.
Full project details are confidential.`;
  };

  const generateCustomerView = () => {
    if (!bidderInfo || !serviceSpecs) return 'No data available';
    
    const dailyRate = serviceSpecs.totalEstimate / 30;
    
    return `CUSTOMER VIEW - SERVICE ESTIMATE

📋 SERVICE AGREEMENT
Client: ${bidderInfo.name}
Location: ${bidderInfo.city}, ${bidderInfo.state}

Service Estimate: $${serviceSpecs.totalEstimate.toFixed(2)}
Contract Type: ${serviceSpecs.contractType}
Frequency: ${serviceSpecs.frequency}
Daily Rate: $${dailyRate.toFixed(2)}

Services Included:
${serviceSpecs.services.map(s => `• ${s}`).join('\n')}

Terms: Net 30 days payment
Fully bonded and insured`;
  };

  const generateAdminView = () => {
    if (!bidderInfo || !serviceSpecs) return 'No data available';
    
    const grossRevenue = serviceSpecs.totalEstimate;
    const commission = grossRevenue * 0.10;
    const netRevenue = grossRevenue - commission;
    const expenses = netRevenue * 0.30;
    const profit = netRevenue - expenses;
    const roi = (profit / expenses) * 100;
    
    return `HJS ADMIN VIEW - FULL BREAKDOWN

💰 FINANCIAL ANALYSIS
Gross Revenue: $${grossRevenue.toFixed(2)}
Commission Paid: $${commission.toFixed(2)} (10%)
Net Revenue: $${netRevenue.toFixed(2)}

📊 EXPENSE BREAKDOWN
Estimated Expenses: $${expenses.toFixed(2)} (30% of net)
Labor Costs: $${(expenses * 0.60).toFixed(2)}
Materials: $${(expenses * 0.25).toFixed(2)}
Overhead: $${(expenses * 0.15).toFixed(2)}

📈 PROFIT MARGINS
Gross Profit: $${profit.toFixed(2)}
Profit Margin: ${((profit/grossRevenue)*100).toFixed(1)}%
ROI: ${roi.toFixed(1)}%

👤 CLIENT DETAILS
${bidderInfo.name} - ${bidderInfo.email}
${bidderInfo.address}, ${bidderInfo.city}, ${bidderInfo.state} ${bidderInfo.zipcode}
Phone: ${bidderInfo.phone}`;
  };

  const getViewContent = () => {
    switch (activeView) {
      case 'bidder': return generateBidderView();
      case 'customer': return generateCustomerView();
      case 'admin': return generateAdminView();
      default: return 'Select a view to see the content';
    }
  };

  return (
    <div className="space-y-4">
      {/* View Selector Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant={activeView === 'bidder' ? 'default' : 'outline'}
          onClick={() => setActiveView('bidder')}
          className="flex items-center gap-2 text-sm"
        >
          <Users className="w-4 h-4" />
          Bidder View
        </Button>
        <Button
          variant={activeView === 'customer' ? 'default' : 'outline'}
          onClick={() => setActiveView('customer')}
          className="flex items-center gap-2 text-sm"
        >
          <Calculator className="w-4 h-4" />
          Customer View
        </Button>
        <Button
          variant={activeView === 'admin' ? 'default' : 'outline'}
          onClick={() => setActiveView('admin')}
          className="flex items-center gap-2 text-sm"
        >
          <Shield className="w-4 h-4" />
          HJS Admin View
        </Button>
      </div>

      {/* Content Viewer */}
      <Card className="bg-slate-800/50 border-slate-600">
        <ScrollArea className="h-64 p-4">
          {activeView ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                <Eye className="w-4 h-4" />
                Viewing: {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Perspective
              </div>
              <pre className="text-sm text-white whitespace-pre-wrap font-mono">
                {getViewContent()}
              </pre>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Click a view button above to see the content</p>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default PrivacyViewer;