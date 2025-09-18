import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '../lib/supabase';
import { Mail, Send, CheckCircle, XCircle, Paperclip, X } from 'lucide-react';
import EmailTemplates from './EmailTemplates';
import SpellChecker from './SpellChecker';

export default function EmailTester() {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    html: ''
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleTemplateSelect = (template: any) => {
    setFormData({
      to: formData.to,
      subject: template.subject,
      html: template.html
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Convert attachments to base64 for sending
      const attachmentData = await Promise.all(
        attachments.map(async (file) => ({
          filename: file.name,
          content: await fileToBase64(file),
          contentType: file.type
        }))
      );

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          ...formData,
          attachments: attachmentData
        }
      });

      if (error) throw error;

      setResult({
        type: 'success',
        message: `Email sent successfully! Message ID: ${data.id}`
      });
      
      setFormData({ to: '', subject: '', html: '' });
      setAttachments([]);
    } catch (error: any) {
      setResult({
        type: 'error',
        message: error.message || 'Failed to send email'
      });
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:type;base64, prefix
      };
      reader.onerror = reject;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">Compose Email</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <EmailTemplates onSelectTemplate={handleTemplateSelect} />
        </TabsContent>
        
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Composer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="to">Recipient Email</Label>
                  <Input
                    id="to"
                    type="email"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    placeholder="recipient@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Email subject"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="html">Message (HTML)</Label>
                  <Textarea
                    id="html"
                    value={formData.html}
                    onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                    placeholder="<p>Your email message here...</p>"
                    rows={8}
                    required
                  />
                </div>

                {/* Spell Checker for email content */}
                <SpellChecker 
                  text={formData.html}
                  onTextChange={(text) => setFormData({ ...formData, html: text })}
                  className="border-t pt-4"
                />

                <div>
                  <Label htmlFor="attachments">Attachments</Label>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </form>

              {result && (
                <Alert className={`mt-4 ${result.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                  {result.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}