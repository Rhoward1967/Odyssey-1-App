import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailEditor from '@/components/EmailEditor';
import LogoManager from '@/components/LogoManager';
import AppointmentWidget from '@/components/AppointmentWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Send, 
  Save, 
  Share2, 
  Eye, 
  Edit3, 
  FileText, 
  Trash2,
  Plus,
  Search,
  Filter,
  Star,
  Archive,
  ArrowLeft,
  Calendar
} from 'lucide-react';
const EmailStudio = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('compose');
  const [drafts, setDrafts] = useState([
    { id: 1, subject: 'Welcome Email Draft', lastModified: '2 hours ago', starred: true },
    { id: 2, subject: 'Product Launch Announcement', lastModified: '1 day ago', starred: false },
    { id: 3, subject: 'Monthly Newsletter', lastModified: '3 days ago', starred: false }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Email Studio</h1>
            <p className="text-gray-600">Create, edit, and manage professional emails</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Drafts
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LogoManager 
                onLogoSelect={(logoUrl, logoType) => console.log('Logo selected:', logoUrl, logoType)}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Email Signature Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="signature-name">Full Name</Label>
                    <Input id="signature-name" placeholder="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="signature-title">Job Title</Label>
                    <Input id="signature-title" placeholder="Senior Manager" />
                  </div>
                  <div>
                    <Label htmlFor="signature-company">Company</Label>
                    <Input id="signature-company" placeholder="Your Company Name" />
                  </div>
                  <div>
                    <Label htmlFor="signature-phone">Phone</Label>
                    <Input id="signature-phone" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <Label htmlFor="signature-email">Email</Label>
                    <Input id="signature-email" placeholder="john@company.com" />
                  </div>
                  <Button className="w-full">Update Signature</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="compose" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <EmailEditor 
                  onSave={(email) => console.log('Saving email:', email)}
                  onSend={(email) => console.log('Sending email:', email)}
                />
              </div>
              <div className="space-y-4">
                <AppointmentWidget context="email-studio" compact />
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      Schedule Follow-up
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      Set Reminder
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      Book Meeting
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="drafts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Draft Emails</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {drafts.map((draft) => (
                <Card key={draft.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {draft.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        <div>
                          <h3 className="font-medium">{draft.subject}</h3>
                          <p className="text-sm text-gray-500">Last modified {draft.lastModified}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Email Templates</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Welcome Email', 'Newsletter', 'Product Launch', 'Thank You', 'Follow Up', 'Promotional'].map((template) => (
                <Card key={template} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{template}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">Professional {template.toLowerCase()} template</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Use Template</Button>
                      <Button size="sm" variant="outline">Preview</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Sent Emails</h2>
              <Badge variant="secondary">24 emails sent this month</Badge>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sent emails yet</h3>
                  <p className="text-gray-500">Your sent emails will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailStudio;