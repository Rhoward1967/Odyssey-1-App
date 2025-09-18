import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Send } from 'lucide-react';

interface QuoteData {
  clientName: string;
  clientEmail: string;
  services: string[];
  totalAmount: number;
  frequency: string;
  validUntil: string;
}

export default function QuoteGenerationSystem() {
  const [quote, setQuote] = useState<QuoteData>({
    clientName: '',
    clientEmail: '',
    services: [],
    totalAmount: 0,
    frequency: 'weekly',
    validUntil: ''
  });

  const generateQuote = () => {
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 30);
    
    setQuote(prev => ({
      ...prev,
      validUntil: validDate.toISOString().split('T')[0]
    }));
  };

  const downloadQuote = () => {
    const quoteContent = `
CLEANING SERVICE QUOTE

Client: ${quote.clientName}
Email: ${quote.clientEmail}
Date: ${new Date().toLocaleDateString()}
Valid Until: ${quote.validUntil}

Services:
${quote.services.map(service => `• ${service}`).join('\n')}

Total Amount: $${quote.totalAmount}
Frequency: ${quote.frequency}

Terms: Payment due within 30 days of service completion.
    `;

    const blob = new Blob([quoteContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${quote.clientName.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Quote Generation System</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Generate Quote
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={quote.clientName}
                onChange={(e) => setQuote(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={quote.clientEmail}
                onChange={(e) => setQuote(prev => ({ ...prev, clientEmail: e.target.value }))}
                placeholder="Enter client email"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalAmount">Total Amount ($)</Label>
              <Input
                id="totalAmount"
                type="number"
                value={quote.totalAmount}
                onChange={(e) => setQuote(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Service Frequency</Label>
              <select
                id="frequency"
                value={quote.frequency}
                onChange={(e) => setQuote(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full p-2 border rounded"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={generateQuote} className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Generate Quote
            </Button>
            <Button onClick={downloadQuote} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Email Quote
            </Button>
          </div>
        </CardContent>
      </Card>

      {quote.validUntil && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Quote Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Client:</strong> {quote.clientName}</p>
              <p><strong>Email:</strong> {quote.clientEmail}</p>
              <p><strong>Total:</strong> ${quote.totalAmount}</p>
              <p><strong>Frequency:</strong> {quote.frequency}</p>
              <p><strong>Valid Until:</strong> {quote.validUntil}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}