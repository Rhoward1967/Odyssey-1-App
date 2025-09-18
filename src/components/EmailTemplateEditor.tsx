import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, Code, Save, Plus } from 'lucide-react';

const EmailTemplateEditor = () => {
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Welcome Email', type: 'transactional', subject: 'Welcome to our platform!' },
    { id: 2, name: 'Weekly Newsletter', type: 'newsletter', subject: 'This week in tech' },
    { id: 3, name: 'Product Launch', type: 'campaign', subject: 'Introducing our new product' }
  ]);

  const [currentTemplate, setCurrentTemplate] = useState({
    name: '',
    type: 'transactional',
    subject: '',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Hello {{firstName}}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board.</p>
        <a href="{{actionUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a>
    </div>
</body>
</html>`,
    textContent: 'Hello {{firstName}}!\n\nThank you for joining our platform. We\'re excited to have you on board.\n\nGet started: {{actionUrl}}',
    variables: ['firstName', 'actionUrl']
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handleSaveTemplate = () => {
    const template = {
      id: Date.now(),
      name: currentTemplate.name,
      type: currentTemplate.type,
      subject: currentTemplate.subject
    };
    setTemplates([...templates, template]);
    setCurrentTemplate({
      name: '',
      type: 'transactional',
      subject: '',
      htmlContent: '',
      textContent: '',
      variables: []
    });
  };

  const loadTemplate = (template: any) => {
    setCurrentTemplate({
      name: template.name,
      type: template.type,
      subject: template.subject,
      htmlContent: currentTemplate.htmlContent,
      textContent: currentTemplate.textContent,
      variables: currentTemplate.variables
    });
  };

  const renderPreview = () => {
    return currentTemplate.htmlContent
      .replace(/\{\{firstName\}\}/g, 'John Doe')
      .replace(/\{\{actionUrl\}\}/g, '#')
      .replace(/\{\{subject\}\}/g, currentTemplate.subject);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Email Template Editor</h2>
        </div>
        <Button onClick={() => setCurrentTemplate({
          name: '',
          type: 'transactional',
          subject: '',
          htmlContent: '',
          textContent: '',
          variables: []
        })}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => loadTemplate(template)}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-500">{template.subject}</div>
                  <Badge variant="outline" className="mt-1">
                    {template.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Template Editor</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {previewMode ? 'Code' : 'Preview'}
                  </Button>
                  <Button size="sm" onClick={handleSaveTemplate}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={currentTemplate.name}
                    onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                    placeholder="Welcome Email"
                  />
                </div>
                <div>
                  <Label htmlFor="template-type">Template Type</Label>
                  <Select value={currentTemplate.type} onValueChange={(value) => setCurrentTemplate({...currentTemplate, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactional">Transactional</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="campaign">Campaign</SelectItem>
                      <SelectItem value="drip">Drip Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={currentTemplate.subject}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, subject: e.target.value})}
                  placeholder="Welcome to our platform!"
                />
              </div>

              {!previewMode ? (
                <Tabs defaultValue="html">
                  <TabsList>
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="text">Text</TabsTrigger>
                  </TabsList>
                  <TabsContent value="html">
                    <Textarea
                      className="min-h-96 font-mono text-sm"
                      value={currentTemplate.htmlContent}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, htmlContent: e.target.value})}
                      placeholder="Enter HTML content..."
                    />
                  </TabsContent>
                  <TabsContent value="text">
                    <Textarea
                      className="min-h-96"
                      value={currentTemplate.textContent}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, textContent: e.target.value})}
                      placeholder="Enter text content..."
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="border rounded-lg p-4 min-h-96 bg-white">
                  <div dangerouslySetInnerHTML={{ __html: renderPreview() }} />
                </div>
              )}

              <div>
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;