import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, DollarSign, Calendar, CheckCircle, AlertCircle, Receipt } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function PaymentProcessing() {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    clientEmail: '',
    description: '',
    paymentType: 'one-time'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const servicePackages = [
    {
      id: 'basic-commercial',
      name: 'Basic Commercial Cleaning',
      price: 1200,
      description: 'Daily cleaning for small offices (up to 5,000 sq ft)',
      features: ['Daily cleaning', 'Trash removal', 'Restroom maintenance', 'Floor care']
    },
    {
      id: 'healthcare-terminal',
      name: 'Healthcare Terminal Cleaning',
      price: 2500,
      description: 'Specialized healthcare facility cleaning',
      features: ['Terminal cleaning', 'Disinfection protocols', 'HIPAA compliance', 'Bloodborne pathogen certified staff']
    },
    {
      id: 'government-facility',
      name: 'Government Facility Services',
      price: 1800,
      description: 'Comprehensive government building maintenance',
      features: ['Security cleared staff', 'Compliance documentation', 'Flexible scheduling', 'Emergency response']
    },
    {
      id: 'decontamination',
      name: 'CBRN Decontamination',
      price: 5000,
      description: 'Specialized hazmat and decontamination services',
      features: ['CBRN certified technicians', 'Emergency response', 'Hazmat disposal', 'Complete documentation']
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      client: 'GNS Surgery Center',
      amount: 2500,
      date: '2024-01-15',
      status: 'completed',
      service: 'Healthcare Terminal Cleaning'
    },
    {
      id: 2,
      client: 'Athens-Clarke County',
      amount: 1800,
      date: '2024-01-10',
      status: 'completed',
      service: 'Government Facility Services'
    },
    {
      id: 3,
      client: 'Westminster Christian School',
      amount: 1200,
      date: '2024-01-05',
      status: 'pending',
      service: 'Basic Commercial Cleaning'
    }
  ];

  const handlePaymentSubmit = async () => {
    if (!paymentData.amount || !paymentData.clientEmail) return;

    setIsProcessing(true);
    setPaymentStatus('idle');

    try {
      const { data, error } = await supabase.functions.invoke('payment-processor', {
        body: {
          action: paymentData.paymentType === 'subscription' ? 'create-subscription' : 'create-payment-intent',
          amount: parseFloat(paymentData.amount),
          clientEmail: paymentData.clientEmail,
          description: paymentData.description || 'Howard Janitorial Services Payment'
        }
      });

      if (error) throw error;

      setPaymentStatus('success');
      // In a real app, you would redirect to Stripe checkout or handle the client secret
      console.log('Payment processed:', data);
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectPackage = (pkg: typeof servicePackages[0]) => {
    setPaymentData({
      ...paymentData,
      amount: pkg.price.toString(),
      description: pkg.name
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Payment Processing</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Stripe Integrated
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            PCI Compliant
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="process" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="process">Process Payment</TabsTrigger>
          <TabsTrigger value="packages">Service Packages</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="process" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Type</label>
                  <Select 
                    value={paymentData.paymentType}
                    onValueChange={(value) => setPaymentData({...paymentData, paymentType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time Payment</SelectItem>
                      <SelectItem value="subscription">Monthly Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Amount ($)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Client Email</label>
                  <Input
                    type="email"
                    placeholder="client@email.com"
                    value={paymentData.clientEmail}
                    onChange={(e) => setPaymentData({...paymentData, clientEmail: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Input
                    placeholder="Service description"
                    value={paymentData.description}
                    onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing || !paymentData.amount || !paymentData.clientEmail}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Payment
                    </>
                  )}
                </Button>

                {paymentStatus === 'success' && (
                  <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Payment processed successfully!
                  </div>
                )}

                {paymentStatus === 'error' && (
                  <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Payment processing failed. Please try again.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Payment Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-lg">Howard Janitorial Services</h3>
                  <p className="text-sm text-gray-600">HJS Services LLC</p>
                  <p className="text-sm">P.O. Box 80054</p>
                  <p className="text-sm">Athens, GA 30608</p>
                  <p className="text-sm font-medium">800-403-8492</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">DUNS Number:</span>
                    <span className="text-sm font-medium">829029292</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">CAGE Code:</span>
                    <span className="text-sm font-medium">97K10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">NAICS Code:</span>
                    <span className="text-sm font-medium">561720</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Badge className="bg-purple-100 text-purple-800">
                    Woman-Owned Small Business (WOSB)
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="packages">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicePackages.map(pkg => (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {pkg.name}
                    <Badge variant="outline">${pkg.price}/month</Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => selectPackage(pkg)}
                    className="w-full"
                    variant="outline"
                  >
                    Select Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{transaction.client}</div>
                      <div className="text-sm text-gray-600">{transaction.service}</div>
                      <div className="text-sm text-gray-500">{transaction.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${transaction.amount.toLocaleString()}</div>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                        className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600">$18,500</div>
                <p className="text-sm text-gray-600">January 2024</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Active Contracts</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600">12</div>
                <p className="text-sm text-gray-600">Current clients</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Pending Payments</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-orange-600">$3,200</div>
                <p className="text-sm text-gray-600">Outstanding invoices</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}