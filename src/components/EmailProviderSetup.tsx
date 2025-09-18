import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Mail, Key, Server } from 'lucide-react';

const EmailProviderSetup = () => {
  const [providers, setProviders] = useState([
    { id: 1, name: 'SendGrid', type: 'sendgrid', status: 'active' },
    { id: 2, name: 'AWS SES', type: 'aws_ses', status: 'inactive' },
    { id: 3, name: 'SMTP Server', type: 'smtp', status: 'inactive' }
  ]);

  const [newProvider, setNewProvider] = useState({
    name: '',
    type: 'sendgrid',
    apiKey: '',
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: ''
  });

  const handleAddProvider = () => {
    const provider = {
      id: Date.now(),
      name: newProvider.name,
      type: newProvider.type,
      status: 'inactive'
    };
    setProviders([...providers, provider]);
    setNewProvider({
      name: '',
      type: 'sendgrid',
      apiKey: '',
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPass: ''
    });
  };

  const toggleProviderStatus = (id: number) => {
    setProviders(providers.map(p => 
      p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Email Provider Setup</h2>
      </div>

      {/* Existing Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">{provider.name}</h3>
                    <p className="text-sm text-gray-500">{provider.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                    {provider.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleProviderStatus(provider.id)}
                  >
                    {provider.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Provider */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Provider</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider-name">Provider Name</Label>
              <Input
                id="provider-name"
                value={newProvider.name}
                onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                placeholder="My Email Provider"
              />
            </div>
            <div>
              <Label htmlFor="provider-type">Provider Type</Label>
              <Select value={newProvider.type} onValueChange={(value) => setNewProvider({...newProvider, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="aws_ses">AWS SES</SelectItem>
                  <SelectItem value="mailchimp">Mailchimp</SelectItem>
                  <SelectItem value="smtp">SMTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {newProvider.type !== 'smtp' && (
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="api-key"
                  type="password"
                  className="pl-10"
                  value={newProvider.apiKey}
                  onChange={(e) => setNewProvider({...newProvider, apiKey: e.target.value})}
                  placeholder="Enter API key"
                />
              </div>
            </div>
          )}

          {newProvider.type === 'smtp' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <div className="relative">
                  <Server className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="smtp-host"
                    className="pl-10"
                    value={newProvider.smtpHost}
                    onChange={(e) => setNewProvider({...newProvider, smtpHost: e.target.value})}
                    placeholder="smtp.example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  value={newProvider.smtpPort}
                  onChange={(e) => setNewProvider({...newProvider, smtpPort: e.target.value})}
                  placeholder="587"
                />
              </div>
              <div>
                <Label htmlFor="smtp-user">Username</Label>
                <Input
                  id="smtp-user"
                  value={newProvider.smtpUser}
                  onChange={(e) => setNewProvider({...newProvider, smtpUser: e.target.value})}
                  placeholder="username"
                />
              </div>
              <div>
                <Label htmlFor="smtp-pass">Password</Label>
                <Input
                  id="smtp-pass"
                  type="password"
                  value={newProvider.smtpPass}
                  onChange={(e) => setNewProvider({...newProvider, smtpPass: e.target.value})}
                  placeholder="password"
                />
              </div>
            </div>
          )}

          <Button onClick={handleAddProvider} className="w-full">
            Add Provider
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailProviderSetup;