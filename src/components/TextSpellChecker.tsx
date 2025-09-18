import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdvancedSpellChecker from './AdvancedSpellChecker';
import GrammarChecker from './GrammarChecker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  Download,
  Upload
} from 'lucide-react';

interface TextSpellCheckerProps {
  onTextChange?: (text: string) => void;
  initialText?: string;
}

const TextSpellChecker: React.FC<TextSpellCheckerProps> = ({ 
  onTextChange, 
  initialText = '' 
}) => {
  const [text, setText] = useState(initialText);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    onTextChange?.(text);
  }, [text, onTextChange]);

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'corrected-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Text Spell & Grammar Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter filename (optional)"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".txt,.md,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button variant="outline" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={downloadText}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <Textarea
            className="min-h-[300px] font-mono"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste or type your text here to check for spelling and grammar errors..."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{text.split(/\s+/).filter(w => w.length > 0).length}</div>
                <div className="text-sm text-gray-500">Words</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{text.length}</div>
                <div className="text-sm text-gray-500">Characters</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{text.split(/[.!?]+/).filter(s => s.trim().length > 0).length}</div>
                <div className="text-sm text-gray-500">Sentences</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="spellcheck" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spellcheck">Spell Check</TabsTrigger>
          <TabsTrigger value="grammar">Grammar & Style</TabsTrigger>
        </TabsList>
        
        <TabsContent value="spellcheck">
          <AdvancedSpellChecker 
            text={text}
            onTextChange={handleTextChange}
          />
        </TabsContent>
        
        <TabsContent value="grammar">
          <GrammarChecker 
            text={text}
            onTextChange={handleTextChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TextSpellChecker;