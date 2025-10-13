import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Download, FileText, Plus, Star } from 'lucide-react';

import { supabase } from '../lib/supabase';

interface ResearchTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  sections: string[];
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  popularity: number;
}

interface ResearchTemplatesProps {
  onTemplateSelect: (template: ResearchTemplate) => void;
}

export default function ResearchTemplates({ onTemplateSelect }: ResearchTemplatesProps) {
  const [templates, setTemplates] = useState<ResearchTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('research_templates')
        .select('*');
      setTemplates(data || []);
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))] ;

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Research Templates
        </CardTitle>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        />
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-4 mb-4">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category === 'all' ? 'All' : category}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading templates...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No templates found</div>
            ) : filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{template.title}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs">{template.popularity}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{template.category}</Badge>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.estimatedTime}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Template Sections:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.sections.slice(0, 4).map((section, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                      {template.sections.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.sections.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onTemplateSelect(template)}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
