import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type ToolCategory = 'development' | 'business' | 'analytics' | 'ai';

interface Tool {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  category: ToolCategory;
  functionName?: string;
}

const ToolsTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('development');
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const tools: Tool[] = [
    {
      id: '1',
      name: 'Bid Calculator',
      description: 'Advanced bidding calculations and optimization',
      status: 'active',
      category: 'business',
      functionName: 'calculate-bid-total'
    },
    {
      id: '2',
      name: 'Market Research',
      description: 'AI-powered market intelligence and research',
      status: 'active',
      category: 'analytics',
      functionName: 'tavily-research'
    },
    {
      id: '3',
      name: 'Address Validator',
      description: 'Real-time address validation and verification',
      status: 'active',
      category: 'development',
      functionName: 'smarty-address-validation'
    },
    {
      id: '4',
      name: 'Communications Hub',
      description: 'SMS and communication management',
      status: 'active',
      category: 'business',
      functionName: 'twilio-communications'
    }
  ];

  const categories = [
    { key: 'development', label: 'Development', icon: '💻' },
    { key: 'business', label: 'Business', icon: '📊' },
    { key: 'analytics', label: 'Analytics', icon: '📈' },
    { key: 'ai', label: 'AI/ML', icon: '🤖' }
  ];

  const filteredTools = tools.filter(tool => tool.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const launchTool = async (tool: Tool) => {
    if (!tool.functionName) {
      toast({
        title: "Tool Not Available",
        description: "This tool is not yet connected to backend services.",
        variant: "destructive"
      });
      return;
    }

    setLoading(tool.id);
    try {
      const { data, error } = await supabase.functions.invoke(tool.functionName, {
        body: { action: 'test', toolName: tool.name }
      });

      if (error) throw error;

      toast({
        title: `${tool.name} Launched`,
        description: `Successfully connected to ${tool.name}.`,
      });
    } catch (error: any) {
      toast({
        title: `${tool.name} Launch Failed`,
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">Development Tools</h3>
        <p className="text-gray-300">Access your development and business tools</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category.key}
            variant={selectedCategory === category.key ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.key as ToolCategory)}
            className="flex items-center gap-2"
          >
            <span>{category.icon}</span>
            <span className="hidden sm:inline">{category.label}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <Card key={tool.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{tool.name}</CardTitle>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(tool.status)}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{tool.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {tool.status}
                </Badge>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => launchTool(tool)}
                  disabled={loading === tool.id || tool.status !== 'active'}
                >
                  {loading === tool.id ? 'Launching...' : 'Launch'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ToolsTab;