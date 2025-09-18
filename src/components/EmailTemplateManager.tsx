import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Mail,
  Palette,
  Code,
  Smartphone
} from 'lucide-react';

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Welcome Series - Email 1',
      category: 'Welcome',
      subject: 'Welcome to Howard Janitorial Services!',
      preview: 'Thank you for choosing our professional cleaning services...',
      lastModified: '2024-03-15',
      status: 'Active',
      opens: 1247,
      clicks: 89
    },
    {
      id: 2,
      name: 'Spring Cleaning Promotion',
      category: 'Promotional',
      subject: 'Spring Into Clean - 20% Off Deep Cleaning',
      preview: 'Spring is here! Get your facility ready with our special...',
      lastModified: '2024-03-10',
      status: 'Active',
      opens: 2156,
      clicks: 234
    },
    {
      id: 3,
      name: 'Healthcare Compliance Update',
      category: 'Educational',
      subject: 'New Healthcare Cleaning Standards - Stay Compliant',
      preview: 'Important updates on healthcare facility cleaning requirements...',
      lastModified: '2024-03-08',
      status: 'Draft',
      opens: 0,
      clicks: 0
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: '',
    subject: '',
    content: '',
    preheader: ''
  });

  const categories = ['Welcome', 'Promotional', 'Educational', 'Newsletter', 'Follow-up', 'Seasonal'];

  const handleCreateTemplate = () => {
    const template = {
      id: templates.length + 1,
      ...newTemplate,
      lastModified: new Date().toISOString().split('T')[0],
      status: 'Draft',
      opens: 0,
      clicks: 0,
      preview: newTemplate.content.substring(0, 50) + '...'
    };
    setTemplates([...templates, template]);
    setNewTemplate({ name: '', category: '', subject: '', content: '', preheader: '' });
    setIsEditing(false);
  };

  const duplicateTemplate = (template) => {
    const newTemp = {
      ...template,
      id: templates.length + 1,
      name: template.name + ' (Copy)',
      lastModified: new Date().toISOString().split('T')[0],
      status: 'Draft',
      opens: 0,
      clicks: 0
    };
    setTemplates([...templates, newTemp]);
  };

  const deleteTemplate = (id) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Email Templates</h3>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Template Name</label>
                  <Input
                    placeholder="Enter template name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject Line</label>
                  <Input
                    placeholder="Email subject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Preheader Text</label>
                  <Input
                    placeholder="Preview text that appears after subject"
                    value={newTemplate.preheader}
                    onChange={(e) => setNewTemplate({...newTemplate, preheader: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Content</label>
                  <Textarea
                    placeholder="Enter your email content here..."
                    rows={12}
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Palette className="h-4 w-4 mr-2" />
                    Design Mode
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Code className="h-4 w-4 mr-2" />
                    HTML Mode
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate} className="bg-green-600 hover:bg-green-700">
                    Create Template
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map(template => (
          <Card key={template.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{template.name}</h4>
                    <Badge variant={template.status === 'Active' ? 'default' : 'secondary'}>
                      {template.status}
                    </Badge>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{template.subject}</p>
                  <p className="text-sm text-gray-600 mb-3">{template.preview}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Modified: {template.lastModified}</span>
                    <span>{template.opens} opens</span>
                    <span>{template.clicks} clicks</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => duplicateTemplate(template)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteTemplate(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Mail className="h-4 w-4 mr-2" />
                    Use
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-600">Total Templates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">24.8%</div>
              <div className="text-sm text-gray-600">Avg Open Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">3.2%</div>
              <div className="text-sm text-gray-600">Avg Click Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}