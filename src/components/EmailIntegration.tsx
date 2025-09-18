import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Inbox, Archive, Star, Paperclip, Users } from 'lucide-react';

export default function EmailIntegration() {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    body: '',
    template: ''
  });

  const emailTemplates = [
    {
      id: 'proposal',
      name: 'Service Proposal',
      subject: 'Professional Janitorial Services Proposal - Howard Janitorial Services',
      body: `Dear [CLIENT_NAME],

Thank you for your interest in Howard Janitorial Services. We are pleased to submit our proposal for comprehensive janitorial and facility maintenance services.

HJS Services LLC has been providing exceptional cleaning solutions since 1990, serving government agencies, healthcare facilities, educational institutions, and commercial businesses.

Our services include:
• Commercial and Industrial Cleaning
• Terminal Cleaning for Healthcare
• Specialized Decontamination (CBRN/Hazmat)
• Floor and Carpet Care
• Post-Construction Cleanup

We are a certified Woman-Owned Small Business (WOSB) with CAGE Code 97K10 and maintain an A+ BBB rating.

Please find our detailed proposal attached. We look forward to discussing how we can serve your facility maintenance needs.

Best regards,
Christla Howard, CEO/President
Howard Janitorial Services
800-403-8492
christla@howardjanitorial.net`
    },
    {
      id: 'followup',
      name: 'Follow-up',
      subject: 'Following Up on Your Janitorial Services Inquiry',
      body: `Dear [CLIENT_NAME],

I wanted to follow up on our recent discussion regarding janitorial services for your facility.

Howard Janitorial Services brings over 35 years of experience and maintains the highest safety and compliance standards. Our certified team is ready to provide exceptional service tailored to your specific needs.

Would you be available for a brief call this week to discuss your requirements in more detail?

Best regards,
Howard Janitorial Services Team
800-403-8492`
    }
  ];

  const recentEmails = [
    {
      id: 1,
      from: 'april.brown@gnssurgery.com',
      subject: 'Re: Terminal Cleaning Schedule',
      preview: 'Thank you for the excellent service...',
      time: '2 hours ago',
      starred: true
    },
    {
      id: 2,
      from: 'procurement@athensclarkecounty.com',
      subject: 'RFP Response Required',
      preview: 'We have a new RFP opportunity...',
      time: '1 day ago',
      starred: false
    }
  ];

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailData({
        ...emailData,
        subject: template.subject,
        body: template.body,
        template: templateId
      });
      setSelectedTemplate(templateId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Email Integration</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Mail className="h-4 w-4 mr-2" />
          Sync Emails
        </Button>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Template</label>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">To</label>
                  <Input
                    placeholder="recipient@email.com"
                    value={emailData.to}
                    onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="Email subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  placeholder="Email content..."
                  rows={12}
                  value={emailData.body}
                  onChange={(e) => setEmailData({...emailData, body: e.target.value})}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach Files
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <CardTitle>Recent Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEmails.map(email => (
                  <div key={email.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{email.from}</span>
                        {email.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      <div className="font-semibold text-sm">{email.subject}</div>
                      <div className="text-gray-600 text-sm">{email.preview}</div>
                    </div>
                    <div className="text-sm text-gray-500">{email.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid gap-4">
            {emailTemplates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {template.name}
                    <Button size="sm" onClick={() => handleTemplateSelect(template.id)}>
                      Use Template
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> {template.subject}
                  </div>
                  <div className="text-sm bg-gray-50 p-3 rounded">
                    {template.body.substring(0, 200)}...
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contact Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded-lg">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium">GNS Surgery Center</div>
                    <div className="text-sm text-gray-600">april.brown@gnssurgery.com</div>
                    <Badge variant="secondary">Healthcare Client</Badge>
                  </div>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <Users className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium">Athens-Clarke County</div>
                    <div className="text-sm text-gray-600">beth.smith@athensclarkecounty.com</div>
                    <Badge variant="secondary">Government Client</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}