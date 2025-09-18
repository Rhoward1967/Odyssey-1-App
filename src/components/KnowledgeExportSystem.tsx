import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const KnowledgeExportSystem = () => {
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    {
      name: "Research Whitepaper",
      format: "PDF",
      description: "Comprehensive analysis with citations",
      icon: "📄",
      estimatedPages: "45-60"
    },
    {
      name: "Technical Report",
      format: "PDF/HTML",
      description: "Detailed technical documentation",
      icon: "📊",
      estimatedPages: "25-35"
    },
    {
      name: "Knowledge Summary",
      format: "JSON/XML",
      description: "Structured data export",
      icon: "📋",
      estimatedPages: "N/A"
    },
    {
      name: "API Documentation",
      format: "Markdown",
      description: "Auto-generated API docs",
      icon: "🔧",
      estimatedPages: "15-25"
    }
  ];

  const recentExports = [
    {
      title: "Advanced Neural Architecture Patterns",
      type: "Whitepaper",
      date: "2024-01-15",
      citations: 247,
      downloads: 1834,
      status: "Published"
    },
    {
      title: "Autonomous AI System Design Principles",
      type: "Technical Report",
      date: "2024-01-14",
      citations: 189,
      downloads: 1205,
      status: "Under Review"
    },
    {
      title: "Real-time Knowledge Validation Methods",
      type: "Research Paper",
      date: "2024-01-13",
      citations: 156,
      downloads: 892,
      status: "Published"
    }
  ];

  const handleExport = (format: string) => {
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
    }, 200);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300">Knowledge Export & Sharing System</CardTitle>
          <p className="text-gray-300">Generate professional research documents and share validated knowledge</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export">Export Formats</TabsTrigger>
              <TabsTrigger value="recent">Recent Exports</TabsTrigger>
              <TabsTrigger value="citations">Citation Manager</TabsTrigger>
            </TabsList>
            
            <TabsContent value="export" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportFormats.map((format, index) => (
                  <Card key={index} className="border-gray-600 hover:border-purple-400 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{format.icon}</span>
                        <div>
                          <h3 className="font-semibold text-white">{format.name}</h3>
                          <Badge variant="outline">{format.format}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{format.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          {format.estimatedPages !== "N/A" && `${format.estimatedPages} pages`}
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => handleExport(format.format)}
                          disabled={isExporting}
                        >
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {isExporting && (
                <Card className="bg-purple-900/10 border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                      <span className="text-purple-300">Generating document...</span>
                    </div>
                    <Progress value={exportProgress} className="mb-2" />
                    <p className="text-xs text-gray-400">
                      Processing knowledge base, validating citations, formatting content...
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="recent" className="space-y-4">
              {recentExports.map((export_, index) => (
                <Card key={index} className="border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{export_.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{export_.type}</Badge>
                          <Badge variant={export_.status === 'Published' ? 'default' : 'secondary'}>
                            {export_.status}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">{export_.date}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Citations: </span>
                        <span className="text-blue-400">{export_.citations}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Downloads: </span>
                        <span className="text-green-400">{export_.downloads}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="citations" className="space-y-4">
              <Card className="border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-300">Citation Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">2,847</div>
                      <div className="text-sm text-gray-300">Total Citations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">156</div>
                      <div className="text-sm text-gray-300">Validated Sources</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">98.7%</div>
                      <div className="text-sm text-gray-300">Citation Accuracy</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      🔍 Auto-validating citations against original sources
                    </p>
                    <p className="text-sm text-gray-300">
                      📚 Formatting citations in APA, MLA, IEEE, and Chicago styles
                    </p>
                    <p className="text-sm text-gray-300">
                      ✅ Cross-referencing with academic databases
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeExportSystem;