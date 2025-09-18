import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaymentSuccessProps {
  planName: string;
  amount: string;
  transactionId?: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  planName,
  amount,
  transactionId = 'TXN-' + Date.now()
}) => {
  return (
    <Card className="max-w-md mx-auto bg-slate-800/50 border-slate-700">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <CardTitle className="text-white text-2xl">Payment Successful!</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 text-center">
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <p className="text-gray-300 mb-2">You've subscribed to:</p>
          <p className="text-xl font-bold text-white">{planName}</p>
          <p className="text-lg text-purple-400">{amount}/month</p>
        </div>

        <div className="text-sm text-gray-400">
          <p>Transaction ID: {transactionId}</p>
          <p>A confirmation email has been sent to you.</p>
        </div>

        <div className="space-y-3 pt-4">
          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            <Mail className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          
          <Link to="/control-panel" className="block">
            <Button variant="outline" className="w-full">
              Access Your Dashboard
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSuccess;