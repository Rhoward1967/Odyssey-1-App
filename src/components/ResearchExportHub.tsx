import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileText, Download, Share2, Mail, Globe, Database, BookOpen } from 'lucide-react';

export default function ResearchExportHub() {
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [exportTitle, setExportTitle] = useState('');

  const exportFormats = [
    {
      id: 'pdf-report',
      name: 'PDF Research Report',
      icon: <FileText className="w-5 h-5" />,
      description: 'Professional formatted report with citations',
      features: ['Auto-formatting', 'Citation management', 'Table of contents'],
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'academic-paper',
      name: 'Academic Paper',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Journal-ready academic format',
      features: ['IEEE/APA formatting', 'Abstract generation', 'Reference list'],
      estimatedTime: '3-4 minutes'
    },
    {
      id: 'presentation',
      name: 'PowerPoint Presentation',
      icon: <Share2 className="w-5 h-5" />,
      description: 'Slide deck with key findings',
      features: ['Auto-slide generation', 'Visual charts', 'Speaker notes'],
      estimatedTime: '1-2 minutes'
    },
    {
      id: 'data-export',
      name: 'Raw Data Export',
      icon: <Database className="w-5 h-5" />,
      description: 'Structured data in JSON/CSV format',
      features: ['Multiple formats', 'API-ready', 'Bulk export'],
      estimatedTime: '30 seconds'
    },
    {
      id: 'web-article',
      name: 'Web Article',
      icon: <Globe className="w-5 h-5" />,
      description: 'Blog-ready HTML content',
      features: ['SEO optimized', 'Social media ready', 'Responsive'],
      estimatedTime: '1 minute'
    },
    {
      id: 'email-summary',
      name: 'Email Summary',
      icon: <Mail className="w-5 h-5" />,
      description: 'Concise email-friendly format',
      features: ['Executive summary', 'Key points', 'Action items'],
      estimatedTime: '30 seconds'
    }
  ];

  const recentExports = [
    {
      title: 'AI Ethics in Healthcare Research',
      format: 'PDF Report',
      date: '2024-01-15',
      size: '2.4 MB',
      downloads: 23,
      status: 'completed'
    },
    {
      title: 'Machine Learning Trends Analysis',
      format: 'Academic Paper',
      date: '2024-01-14',
      size: '1.8 MB',
      downloads: 45,
      status: 'completed'
    },
    {
      title: 'Quantum Computing Overview',
      format: 'Presentation',
      date: '2024-01-13',
      size: '5.2 MB',
      downloads: 12,
      status: 'processing'
    }
  ];

  const handleExport = () => {
    if (!selectedFormat || !exportTitle) return;
    
    setIsExporting(true);
    setExportProgress(0);
    
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-6 h-6" />
            Research Export Hub
          </CardTitle>
          <p className="text-green-100">
            Transform your research into professional documents, presentations, and shareable content
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Create Export</TabsTrigger>
          <TabsTrigger value="recent">Recent Exports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          {/* Export Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configure Your Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Export Title</Label>
                  <Input
                    id="title"
                    value={exportTitle}
                    onChange={(e) => setExportTitle(e.target.value)}
                    placeholder="Enter document title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose format..." />
                    </SelectTrigger>
                    <SelectContent>
                      {exportFormats.map((format) => (
                        <SelectItem key={format.id} value={format.id}>
                          {format.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Options */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportFormats.map((format) => (
              <Card 
                key={format.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedFormat === format.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedFormat(format.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {format.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{format.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {format.estimatedTime}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{format.description}</p>
                  
                  <div className="space-y-1">
                    {format.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Export Button */}
          <Card>
            <CardContent className="p-4">
              {isExporting ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span>Generating your export...</span>
                  </div>
                  <Progress value={exportProgress} />
                  <p className="text-sm text-gray-600">
                    Processing research data, formatting content, generating citations...
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleExport}
                  disabled={!selectedFormat || !exportTitle}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Generate Export
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {recentExports.map((export_, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{export_.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="outline">{export_.format}</Badge>
                          <span>{export_.date}</span>
                          <span>{export_.size}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={export_.status === 'completed' ? 'default' : 'secondary'}>
                        {export_.status}
                      </Badge>
                      {export_.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Academic Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Pre-configured templates for academic writing</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">IEEE Format</Badge>
                    <Badge variant="outline">APA Style</Badge>
                    <Badge variant="outline">MLA Format</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Professional business document formats</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Executive Summary</Badge>
                    <Badge variant="outline">Market Analysis</Badge>
                    <Badge variant="outline">Technical Spec</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}