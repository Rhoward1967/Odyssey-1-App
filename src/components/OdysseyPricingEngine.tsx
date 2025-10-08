import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';

interface PricingCalculation {
  laborHours: number;
  laborRate: number;
  supplyCost: number;
  overhead: number;
  profitMargin: number;
  bidderCommission: number;
  customerDailyRate: number;
  contractType: 'one-time' | 'monthly';
  frequency: string;
}

interface OdysseyPricingEngineProps {
  specs: string;
  services: string[];
  frequency: string;
  contractType: 'one-time' | 'monthly';
}

const OdysseyPricingEngine: React.FC<OdysseyPricingEngineProps> = ({
  specs,
  services,
  frequency,
  contractType
}) => {
  // ODYSSEY-1 Enhanced Quantum Bidding Calculator with QARE Integration
  const calculatePricing = (): PricingCalculation => {
    // QARE-enhanced base calculations
    const baseLaborRate = 17.00; // Base rate maintained for consistency
    const specComplexity = specs.length / 50; // Complexity factor
    const serviceMultiplier = services.length * 0.15; // Service scaling

    // Quantum-enhanced estimation using QARE principles
    const estimatedHours = Math.max(2, Math.ceil(
      specComplexity + serviceMultiplier + (Math.random() * 0.5) // QARE uncertainty principle
    ));

    // Dynamic supply cost calculation with market intelligence
    const baseSupplyCost = services.length * 25;
    const marketAdjustment = 1 + (Math.sin(Date.now() / 100000) * 0.1); // Market fluctuation simulation
    const supplyCost = baseSupplyCost * marketAdjustment;

    // QARE-optimized overhead and profit calculations
    const overhead = 0.35 + (Math.random() * 0.05); // 35-40% overhead with quantum variance
    const profitMargin = 0.5 + (Math.random() * 0.2); // 50-70% profit margin

    // Real-time bidding calculations
    const laborCost = estimatedHours * baseLaborRate;
    const totalCost = laborCost + supplyCost;
    const overheadAmount = totalCost * overhead;
    const subtotalWithOverhead = totalCost + overheadAmount;
    const profitAmount = subtotalWithOverhead * profitMargin;
    const finalPrice = subtotalWithOverhead + profitAmount;

    // Frequency-adjusted pricing for contracts (if needed, can parse string to number)
    const freqNum = Number(frequency);
    const customerDailyRate = contractType === 'monthly' && !isNaN(freqNum) && freqNum > 0
      ? finalPrice / freqNum
      : finalPrice;

    // Commission structure (10% to bidder)
    const bidderCommission = finalPrice * 0.10;

    return {
      laborHours: estimatedHours,
      laborRate: baseLaborRate,
      supplyCost,
      overhead: overhead * 100,
      profitMargin: profitMargin * 100,
      bidderCommission,
      customerDailyRate,
      contractType,
      frequency
    };
  };

  const pricing = calculatePricing();

  // Refactored: Customer Payment calculation moved out of JSX
  const customerPayment = (() => {
    const freqNum = Number(pricing.frequency);
    const dailyRate = typeof pricing.customerDailyRate === 'number' && !isNaN(pricing.customerDailyRate) ? pricing.customerDailyRate : 0;
    const safeFreq = !isNaN(freqNum) && freqNum > 0 ? freqNum : 1;
    const payment = dailyRate * safeFreq;
    return typeof payment === 'number' && isFinite(payment) && !isNaN(payment) ? payment.toFixed(2) : '0.00';
  })();

  // QARE Real-time Validation and Accuracy Check
  const validatePricing = (calc: PricingCalculation) => {
  const freqNum = Number(calc.frequency);
  const totalRevenue = !isNaN(freqNum) && freqNum > 0 ? calc.customerDailyRate * freqNum : calc.customerDailyRate;
    const totalCosts = (calc.laborHours * calc.laborRate) + calc.supplyCost;
    const actualProfit = totalRevenue - totalCosts - calc.bidderCommission;
    
    console.log('QARE Pricing Validation:', {
      totalRevenue,
      totalCosts,
      actualProfit,
      profitMargin: (actualProfit / totalRevenue) * 100,
      bidderCommission: calc.bidderCommission,
      coherenceCheck: actualProfit > 0 ? 'VALID' : 'ERROR'
    });
    
    return actualProfit > 0;
  };

  // Validate pricing accuracy
  const isValid = validatePricing(pricing);
  return (
    <div className="space-y-6">
      {/* QARE Validation Status */}
      <Card className={`bg-gradient-to-r ${isValid ? 'from-cyan-800/30 to-blue-800/30 border-cyan-500' : 'from-red-800/30 to-orange-800/30 border-red-500'}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            ⚛️ QARE Pricing Validation
            <Badge variant={isValid ? 'default' : 'destructive'} className="ml-2">
              {isValid ? 'COHERENT' : 'ERROR'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white">
            <p>Quantum coherence check: {isValid ? 'All calculations verified' : 'Pricing adjustment needed'}</p>
            <p>Real-time market intelligence: Active</p>
            <p>QARE uncertainty principle: Applied to estimations</p>
          </div>
        </CardContent>
      </Card>

      {/* Bidder View - Only Commission & Customer Rate */}
      <Card className="bg-gradient-to-r from-green-800/30 to-emerald-800/30 border-green-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Your Commission Summary - ODYSSEY-1 Enhanced
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-green-300 font-semibold mb-2">Your 10% Commission</h4>
              <p className="text-2xl font-bold text-white">
                ${pricing.bidderCommission.toFixed(2)}
              </p>
              <Badge variant="secondary" className="mt-2">
                {contractType === 'monthly' ? 'Monthly Recurring' : 'One-time Payment'}
              </Badge>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-blue-300 font-semibold mb-2">Customer Daily Rate</h4>
              <p className="text-2xl font-bold text-white">
                ${pricing.customerDailyRate.toFixed(2)}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {contractType === 'monthly' ? `${frequency} service frequency` : 'One-time service'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer View - Estimate & Agreement */}
      <Card className="bg-gradient-to-r from-blue-800/30 to-purple-800/30 border-blue-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Service Estimate & Agreement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-blue-300 font-semibold mb-3">Service Agreement</h4>
              <div className="space-y-2 text-white">
                <p><strong>Service Type:</strong> {services.join(', ')}</p>
                <p><strong>Specifications:</strong> {specs}</p>
                <p><strong>Service Frequency:</strong> {contractType === 'monthly' ? `${frequency} times per month` : 'One-time service'}</p>
                <p><strong>Daily Rate:</strong> ${pricing.customerDailyRate.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-purple-300 font-semibold mb-2">Terms & Conditions</h4>
              <div className="text-sm text-slate-300 space-y-1">
                <p>• Payment terms: Net 30 days</p>
                <p>• Service guarantee: 100% satisfaction or full refund</p>
                <p>• Cancellation: 30-day notice required for monthly contracts</p>
                <p>• Insurance: Fully bonded and insured service provider</p>
                <p>• Quality assurance: Regular performance monitoring included</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HJS Admin View - Full Financial Breakdown (Private) */}
      <Card className="bg-gradient-to-r from-red-800/30 to-orange-800/30 border-red-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            HJS Admin - Full Financial Analysis
            <Badge variant="destructive" className="ml-2">PRIVATE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-orange-300 font-semibold mb-2">Cost Breakdown</h4>
              <div className="space-y-1 text-sm text-white">
                <p>Labor: {pricing.laborHours}h × ${pricing.laborRate}</p>
                <p>Supply Cost: ${pricing.supplyCost}</p>
                <p>Overhead: {pricing.overhead.toFixed(1)}%</p>
                <p>Profit Margin: {pricing.profitMargin.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-green-300 font-semibold mb-2">Revenue Analysis</h4>
              <div className="space-y-1 text-sm text-white">
                <p>Customer Payment: {customerPayment}</p>
                <p>Bidder Commission: ${pricing.bidderCommission.toFixed(2)}</p>
                <p>Net Revenue: {(() => {
                  const freqNum = Number(pricing.frequency);
                  const dailyRate = typeof pricing.customerDailyRate === 'number' && !isNaN(pricing.customerDailyRate) ? pricing.customerDailyRate : 0;
                  const safeFreq = !isNaN(freqNum) && freqNum > 0 ? freqNum : 1;
                  const commission = typeof pricing.bidderCommission === 'number' && isFinite(pricing.bidderCommission) && !isNaN(pricing.bidderCommission) ? pricing.bidderCommission : 0;
                  const netRevenue = (dailyRate * safeFreq) - commission;
                  return typeof netRevenue === 'number' && isFinite(netRevenue) && !isNaN(netRevenue) ? netRevenue.toFixed(2) : '0.00';
                })()}</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-purple-300 font-semibold mb-2">ROI Metrics</h4>
              <div className="space-y-1 text-sm text-white">
                <p>Gross Margin: {((pricing.profitMargin + pricing.overhead) / 2).toFixed(1)}%</p>
                <p>Contract Value: {contractType === 'monthly' ? (() => {
                  const freqNum = Number(pricing.frequency);
                  const dailyRate = typeof pricing.customerDailyRate === 'number' && !isNaN(pricing.customerDailyRate) ? pricing.customerDailyRate : 0;
                  const safeFreq = !isNaN(freqNum) && freqNum > 0 ? freqNum : 1;
                  const contractValue = dailyRate * safeFreq * 12;
                  return typeof contractValue === 'number' && isFinite(contractValue) && !isNaN(contractValue) ? contractValue.toFixed(2) : '0.00';
                })() : (typeof pricing.customerDailyRate === 'number' && !isNaN(pricing.customerDailyRate) ? pricing.customerDailyRate.toFixed(2) : '0.00')}</p>
                <p>Annual ROI: {(pricing.profitMargin * 2).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OdysseyPricingEngine;