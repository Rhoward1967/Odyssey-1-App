import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Send,
  Globe,
  Shield
} from 'lucide-react';

interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  webhookUrl: string;
}

export default function SendGridIntegration() {
  const [config, setConfig] = useState<SendGridConfig>({
    apiKey: '',
    fromEmail: 'noreply@odyssey-1.ai',
    fromName: 'ODYSSEY-1',
    replyTo: 'support@odyssey-1.ai',
    webhookUrl: 'https://odyssey-1.ai/api/sendgrid/webhook'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      setTestResult('Successfully connected to SendGrid!');
    } catch (error) {
      setTestResult('Failed to connect to SendGrid. Please check your API key.');
    }
    setIsLoading(false);
  };

  const sendTestEmail = async () => {
    setIsLoading(true);
    try {
      // Simulate sending test email
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTestResult('Test email sent successfully!');
    } catch (error) {
      setTestResult('Failed to send test email.');
    }
    setIsLoading(false);
  };

  const dnsRecords = [
    { type: 'CNAME', host: 'em6614.odyssey-1.ai', value: 'u56046226.wl227.sendgrid.net' },
    { type: 'CNAME', host: 's1._domainkey.odyssey-1.ai', value: 's1.domainkey.u56046226.wl227.sendgrid.net' },
    { type: 'CNAME', host: 's2._domainkey.odyssey-1.ai', value: 's2.domainkey.u56046226.wl227.sendgrid.net' },
    { type: 'TXT', host: '_dmarc.odyssey-1.ai', value: 'v=DMARC1; p=reject; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="h-6 w-6 text-blue-600" />
          SendGrid Integration
        </h2>
        <Badge variant={isConnected ? 'default' : 'secondary'} className="flex items-center gap-1">
          {isConnected ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {isConnected ? 'Connected' : 'Not Connected'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey">SendGrid API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="SG.xxxxxxxxxxxxxxxxxxxxx"
                value={config.apiKey}
                onChange={(e) => setConfig({...config, apiKey: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                value={config.fromEmail}
                onChange={(e) => setConfig({...config, fromEmail: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={config.fromName}
                onChange={(e) => setConfig({...config, fromName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="replyTo">Reply To</Label>
              <Input
                id="replyTo"
                type="email"
                value={config.replyTo}
                onChange={(e) => setConfig({...config, replyTo: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConnect} disabled={isLoading || !config.apiKey}>
                {isLoading ? 'Connecting...' : 'Connect'}
              </Button>
              <Button variant="outline" onClick={sendTestEmail} disabled={!isConnected || isLoading}>
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </Button>
            </div>
            {testResult && (
              <Alert>
                <AlertDescription>{testResult}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Domain Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Add these DNS records to authenticate your domain:
              </p>
              <div className="space-y-2">
                {dnsRecords.map((record, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline">{record.type}</Badge>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-xs">
                      <div><strong>Host:</strong> {record.host}</div>
                      <div className="break-all"><strong>Value:</strong> {record.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={config.webhookUrl}
                onChange={(e) => setConfig({...config, webhookUrl: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['delivered', 'opened', 'clicked', 'bounced'].map(event => (
                <Badge key={event} variant="secondary" className="justify-center">
                  {event}
                </Badge>
              ))}
            </div>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Configure Webhooks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}