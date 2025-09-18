import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Calculator, Calendar, FileText } from 'lucide-react';

interface IndustryDemoProps {
  isOpen: boolean;
  onClose: () => void;
  industry: {
    name: string;
    icon: string;
    revenue: string;
    roi: string;
    clients: string;
    growth: string;
  };
}

const industryFeatures: { [key: string]: string[] } = {
  Healthcare: ['Patient Management AI', 'Medical Records Automation', 'Appointment Scheduling', 'Insurance Processing'],
  Manufacturing: ['Production Optimization', 'Quality Control AI', 'Supply Chain Management', 'Predictive Maintenance'],
  Finance: ['Risk Assessment AI', 'Fraud Detection', 'Portfolio Management', 'Compliance Automation'],
  Retail: ['Inventory Optimization', 'Customer Analytics', 'Sales Forecasting', 'Price Optimization'],
  Government: ['Document Processing', 'Citizen Services', 'Compliance Tracking', 'Budget Analysis'],
  Logistics: ['Route Optimization', 'Fleet Management', 'Delivery Tracking', 'Warehouse Automation']
};

export const IndustryDemo: React.FC<IndustryDemoProps> = ({ isOpen, onClose, industry }) => {
  const features = industryFeatures[industry.name] || ['AI Automation', 'Data Analytics', 'Process Optimization', 'Smart Insights'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center">
            <span className="text-3xl mr-3">{industry.icon}</span>
            How ODYSSEY-1 Works for {industry.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Your Industry-Specific AI Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 text-center">
                <Calculator className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h4 className="font-bold text-white">ROI Calculator</h4>
                <p className="text-sm text-gray-400">See your potential savings</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h4 className="font-bold text-white">Free Demo</h4>
                <p className="text-sm text-gray-400">Schedule consultation</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h4 className="font-bold text-white">Case Study</h4>
                <p className="text-sm text-gray-400">See similar success</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button className="bg-purple-600 hover:bg-purple-700 flex-1">
              Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-purple-500/50 text-purple-300">
              Schedule Demo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};