import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import EnhancedSpellChecker from './EnhancedSpellChecker';
import GrammarChecker from './GrammarChecker';
import LogoManager from './LogoManager';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  Image, 
  List, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Code,
  Quote,
  Undo,
  Redo
} from 'lucide-react';

interface EmailEditorProps {
  onSave?: (email: any) => void;
  onSend?: (email: any) => void;
  initialData?: any;
}

const EmailEditor = ({ onSave, onSend, initialData }: EmailEditorProps) => {
  const [emailData, setEmailData] = useState({
    to: initialData?.to || '',
    cc: initialData?.cc || '',
    bcc: initialData?.bcc || '',
    subject: initialData?.subject || '',
    content: initialData?.content || '',
    htmlContent: initialData?.htmlContent || '',
    companyLogo: initialData?.companyLogo || '',
    personalLogo: initialData?.personalLogo || ''
  });

  const [activeEditor, setActiveEditor] = useState('visual');

  const handleLogoSelect = (logoUrl: string, logoType: 'company' | 'personal') => {
    if (logoType === 'company') {
      setEmailData({...emailData, companyLogo: logoUrl});
    } else {
      setEmailData({...emailData, personalLogo: logoUrl});
    }
  };


  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: 'bold' },
    { icon: Italic, label: 'Italic', action: 'italic' },
    { icon: Underline, label: 'Underline', action: 'underline' },
    { icon: Link, label: 'Link', action: 'link' },
    { icon: Image, label: 'Image', action: 'image' },
    { icon: List, label: 'List', action: 'list' },
    { icon: AlignLeft, label: 'Align Left', action: 'alignLeft' },
    { icon: AlignCenter, label: 'Align Center', action: 'alignCenter' },
    { icon: AlignRight, label: 'Align Right', action: 'alignRight' },
    { icon: Quote, label: 'Quote', action: 'quote' },
    { icon: Code, label: 'Code', action: 'code' }
  ];

  const handleToolbarAction = (action: string) => {
    // Implement formatting actions
    console.log('Toolbar action:', action);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="to">To</Label>
            <Input 
              id="to" 
              value={emailData.to}
              onChange={(e) => setEmailData({...emailData, to: e.target.value})}
              placeholder="recipient@example.com" 
            />
          </div>
          <div>
            <Label htmlFor="cc">CC</Label>
            <Input 
              id="cc" 
              value={emailData.cc}
              onChange={(e) => setEmailData({...emailData, cc: e.target.value})}
              placeholder="cc@example.com" 
            />
          </div>
          <div>
            <Label htmlFor="bcc">BCC</Label>
            <Input 
              id="bcc" 
              value={emailData.bcc}
              onChange={(e) => setEmailData({...emailData, bcc: e.target.value})}
              placeholder="bcc@example.com" 
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input 
            id="subject" 
            value={emailData.subject}
            onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
            placeholder="Email subject" 
          />
        </div>

        <Tabs value={activeEditor} onValueChange={setActiveEditor}>
          <TabsList>
            <TabsTrigger value="visual">Visual Editor</TabsTrigger>
            <TabsTrigger value="html">HTML Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-2">
            <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-gray-50">
              {toolbarButtons.map((button) => (
                <Button
                  key={button.action}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToolbarAction(button.action)}
                  title={button.label}
                >
                  <button.icon className="w-4 h-4" />
                </Button>
              ))}
              <div className="border-l mx-2" />
              <Button variant="ghost" size="sm" title="Undo">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Redo">
                <Redo className="w-4 h-4" />
              </Button>
            </div>
            <Textarea 
              className="min-h-[400px] font-mono"
              value={emailData.content}
              onChange={(e) => setEmailData({...emailData, content: e.target.value})}
              placeholder="Write your email content here..."
            />
          </TabsContent>

          <TabsContent value="html">
            <Textarea 
              className="min-h-[400px] font-mono"
              value={emailData.htmlContent}
              onChange={(e) => setEmailData({...emailData, htmlContent: e.target.value})}
              placeholder="<html><body>Your HTML content here...</body></html>"
            />
          </TabsContent>
        </Tabs>
        {/* Logo & Branding Integration */}
        <Tabs defaultValue="logos" className="border-t pt-4">
          <TabsList>
            <TabsTrigger value="logos">Logos</TabsTrigger>
            <TabsTrigger value="spellcheck">Spell Check</TabsTrigger>
            <TabsTrigger value="grammar">Grammar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logos">
            <LogoManager onLogoSelect={handleLogoSelect} />
          </TabsContent>
          
          <TabsContent value="spellcheck">
            <EnhancedSpellChecker
              text={emailData.content}
              onTextChange={(text) => setEmailData({...emailData, content: text})}
            />
          </TabsContent>
          
          <TabsContent value="grammar">
            <GrammarChecker 
              text={emailData.content}
              onTextChange={(text) => setEmailData({...emailData, content: text})}
            />
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4">
          <Button onClick={() => onSend?.(emailData)} className="bg-blue-600 hover:bg-blue-700">
            Send Email
          </Button>
          <Button variant="outline" onClick={() => onSave?.(emailData)}>
            Save Draft
          </Button>
          <Button variant="outline">
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailEditor;