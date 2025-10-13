import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, FileText, Send } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ServiceItem {
  name: string;
  frequency: string;
  rate: number;
  difficulty: string;
}

interface AgreementData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  propertyAddress: string;
  squareFootage: number;
  services: ServiceItem[];
  totalMonthlyRate: number;
  startDate: string;
  contractLength: string;
}

interface AgreementGeneratorProps {
  agreementData?: AgreementData;
  onGenerateAgreement?: (agreement: string) => void;
}

export default function AgreementGenerator({ 
  agreementData, 
  onGenerateAgreement 
}: AgreementGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAgreement, setGeneratedAgreement] = useState('');
  const [clientInfo, setClientInfo] = useState({
    name: agreementData?.clientName || '',
    email: agreementData?.clientEmail || '',
    phone: agreementData?.clientPhone || '',
    startDate: agreementData?.startDate || '',
    contractLength: agreementData?.contractLength || '12 months'
  });

  const generateAgreement = async () => {
    setIsGenerating(true);
    try {
      // Compose a prompt for the AI assistant
      const prompt = `Generate a professional janitorial services agreement using the following data:\n\nClient Name: ${clientInfo.name}\nClient Email: ${clientInfo.email}\nClient Phone: ${clientInfo.phone}\nProperty Address: ${agreementData?.propertyAddress || ''}\nSquare Footage: ${agreementData?.squareFootage || ''}\nServices: ${(agreementData?.services || []).map(s => `${s.name} (${s.frequency}, $${s.rate}/month)`).join(', ')}\nTotal Monthly Rate: $${agreementData?.totalMonthlyRate || ''}\nStart Date: ${clientInfo.startDate}\nContract Length: ${clientInfo.contractLength}`;

      // Call the Supabase Edge Function for AI agreement generation
      const { data, error } = await supabase.functions.invoke('ai-assistant-chat', {
        body: {
          message: prompt,
          conversationMode: 'agreement',
          industry: 'Janitorial',
          personality: 'formal'
        }
      });
      if (error) throw error;
      const agreement = data?.response || 'Error: No agreement generated.';
      setGeneratedAgreement(agreement);
      onGenerateAgreement?.(agreement);
    } catch (error) {
      console.error('Error generating agreement:', error);
      setGeneratedAgreement('Error generating agreement. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAgreement = () => {
    const blob = new Blob([generatedAgreement], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `janitorial-agreement-${clientInfo.name.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Agreement Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={clientInfo.name}
              onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
              placeholder="Enter client name"
            />
          </div>
          <div>
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={clientInfo.email}
              onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
              placeholder="client@email.com"
            />
          </div>
          <div>
            <Label htmlFor="clientPhone">Client Phone</Label>
            <Input
              id="clientPhone"
              value={clientInfo.phone}
              onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={clientInfo.startDate}
              onChange={(e) => setClientInfo({...clientInfo, startDate: e.target.value})}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={generateAgreement}
            disabled={isGenerating || !clientInfo.name}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Agreement'}
          </Button>
          
          {generatedAgreement && (
            <>
              <Button 
                onClick={downloadAgreement}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Email to Client
              </Button>
            </>
          )}
        </div>

        {generatedAgreement && (
          <div>
            <Label>Generated Agreement Preview</Label>
            <Textarea
              value={generatedAgreement}
              readOnly
              className="min-h-[400px] font-mono text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}