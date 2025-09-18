import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, CheckCircle, Zap } from 'lucide-react';

const payPerUseServices = [
  {
    title: "Document Analysis",
    price: "$25",
    unit: "per document",
    description: "AI-powered analysis of contracts, proposals, and business documents",
    features: ["Risk Assessment", "Key Terms Extraction", "Compliance Check"],
    icon: <CheckCircle className="w-6 h-6" />
  },
  {
    title: "Market Research",
    price: "$75",
    unit: "per report",
    description: "Comprehensive market analysis and competitive intelligence reports",
    features: ["Industry Trends", "Competitor Analysis", "Market Sizing"],
    icon: <Zap className="w-6 h-6" />
  },
  {
    title: "Bid Calculation",
    price: "$50",
    unit: "per project",
    description: "Professional bid calculation with cost optimization and risk analysis",
    features: ["Cost Breakdown", "Profit Optimization", "Risk Mitigation"],
    icon: <DollarSign className="w-6 h-6" />
  },
  {
    title: "One-Time Consultation",
    price: "$150",
    unit: "per hour",
    description: "Expert consultation on business strategy, operations, or technology",
    features: ["Strategic Planning", "Process Optimization", "Tech Advisory"],
    icon: <Clock className="w-6 h-6" />
  }
];

export default function PayPerUseServices() {
  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">
            Pay-Per-Use Services
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            No Subscription Required
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access Odyssey's powerful tools and expertise on-demand. Pay only for what you use.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {payPerUseServices.map((service, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {service.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{service.price}</div>
                    <div className="text-sm text-gray-500">{service.unit}</div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                
                <div className="mb-6">
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                  Purchase Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose Pay-Per-Use?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Cost Effective</h4>
                <p className="text-gray-600 text-sm">Pay only for services you actually use</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Instant Access</h4>
                <p className="text-gray-600 text-sm">Get results immediately without waiting</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">No Commitment</h4>
                <p className="text-gray-600 text-sm">Use as needed without long-term contracts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}