import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Plus, Star, Clock, Users } from 'lucide-react';

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

const RESEARCH_TEMPLATES: ResearchTemplate[] = [
  {
    id: 'lit-review',
    title: 'Literature Review',
    description: 'Comprehensive academic literature review template',
    category: 'Academic',
    sections: ['Abstract', 'Introduction', 'Methodology', 'Findings', 'Discussion', 'Conclusion', 'References'],
    estimatedTime: '2-4 weeks',
    difficulty: 'Intermediate',
    popularity: 95
  },
  {
    id: 'case-study',
    title: 'Case Study Analysis',
    description: 'In-depth case study research framework',
    category: 'Business',
    sections: ['Executive Summary', 'Background', 'Problem Statement', 'Analysis', 'Solutions', 'Recommendations'],
    estimatedTime: '1-2 weeks',
    difficulty: 'Beginner',
    popularity: 87
  },
  {
    id: 'experimental',
    title: 'Experimental Research',
    description: 'Scientific experimental research design',
    category: 'Science',
    sections: ['Hypothesis', 'Materials & Methods', 'Data Collection', 'Results', 'Statistical Analysis', 'Discussion'],
    estimatedTime: '4-8 weeks',
    difficulty: 'Advanced',
    popularity: 78
  },
  {
    id: 'market-research',
    title: 'Market Research',
    description: 'Business market analysis template',
    category: 'Business',
    sections: ['Market Overview', 'Target Audience', 'Competitive Analysis', 'SWOT Analysis', 'Recommendations'],
    estimatedTime: '1-3 weeks',
    difficulty: 'Intermediate',
    popularity: 92
  },
  {
    id: 'thesis',
    title: 'Thesis/Dissertation',
    description: 'Complete thesis research structure',
    category: 'Academic',
    sections: ['Title Page', 'Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion'],
    estimatedTime: '6-12 months',
    difficulty: 'Advanced',
    popularity: 85
  },
  {
    id: 'survey-analysis',
    title: 'Survey Analysis',
    description: 'Survey data collection and analysis',
    category: 'Social Science',
    sections: ['Survey Design', 'Data Collection', 'Demographics', 'Results Analysis', 'Insights', 'Recommendations'],
    estimatedTime: '2-6 weeks',
    difficulty: 'Intermediate',
    popularity: 73
  }
];

interface ResearchTemplatesProps {
  onTemplateSelect: (template: ResearchTemplate) => void;
}

export default function ResearchTemplates({ onTemplateSelect }: ResearchTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', ...new Set(RESEARCH_TEMPLATES.map(t => t.category))];
  
  const filteredTemplates = RESEARCH_TEMPLATES.filter(template => {
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
            {filteredTemplates.map(template => (
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