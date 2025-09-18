import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Plus, Copy, Download, Edit, Trash2, Search } from 'lucide-react';

interface Citation {
  id: string;
  type: 'book' | 'journal' | 'website' | 'conference' | 'thesis';
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  volume?: string;
  pages?: string;
  publisher?: string;
  url?: string;
  doi?: string;
  accessed?: string;
}

const SAMPLE_CITATIONS: Citation[] = [
  {
    id: '1',
    type: 'journal',
    title: 'Machine Learning in Healthcare: A Review',
    authors: ['Smith, J.', 'Johnson, A.'],
    year: 2023,
    journal: 'Journal of Medical AI',
    volume: '15',
    pages: '123-145',
    doi: '10.1000/182'
  },
  {
    id: '2',
    type: 'book',
    title: 'Artificial Intelligence: A Modern Approach',
    authors: ['Russell, S.', 'Norvig, P.'],
    year: 2021,
    publisher: 'Pearson Education'
  },
  {
    id: '3',
    type: 'website',
    title: 'OpenAI GPT-4 Technical Report',
    authors: ['OpenAI Team'],
    year: 2023,
    url: 'https://openai.com/research/gpt-4',
    accessed: '2024-01-15'
  }
];

interface CitationManagerProps {
  onCitationAdd?: (citation: Citation) => void;
  onExportBibliography?: (citations: Citation[], format: string) => void;
}

export default function CitationManager({ onCitationAdd, onExportBibliography }: CitationManagerProps) {
  const [citations, setCitations] = useState<Citation[]>(SAMPLE_CITATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCitation, setNewCitation] = useState<Partial<Citation>>({
    type: 'journal',
    authors: [''],
    year: new Date().getFullYear()
  });

  const filteredCitations = citations.filter(citation =>
    citation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citation.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatAPA = (citation: Citation): string => {
    const authors = citation.authors.join(', ');
    const year = `(${citation.year})`;
    
    switch (citation.type) {
      case 'journal':
        return `${authors} ${year}. ${citation.title}. ${citation.journal}, ${citation.volume}, ${citation.pages}.${citation.doi ? ` https://doi.org/${citation.doi}` : ''}`;
      case 'book':
        return `${authors} ${year}. ${citation.title}. ${citation.publisher}.`;
      case 'website':
        return `${authors} ${year}. ${citation.title}. Retrieved ${citation.accessed} from ${citation.url}`;
      default:
        return `${authors} ${year}. ${citation.title}.`;
    }
  };

  const formatMLA = (citation: Citation): string => {
    const authors = citation.authors[0];
    
    switch (citation.type) {
      case 'journal':
        return `${authors} "${citation.title}." ${citation.journal}, vol. ${citation.volume}, ${citation.year}, pp. ${citation.pages}.`;
      case 'book':
        return `${authors} ${citation.title}. ${citation.publisher}, ${citation.year}.`;
      case 'website':
        return `${authors} "${citation.title}." Web. ${citation.accessed}.`;
      default:
        return `${authors} "${citation.title}." ${citation.year}.`;
    }
  };

  const addCitation = () => {
    if (newCitation.title && newCitation.authors?.[0]) {
      const citation: Citation = {
        id: Date.now().toString(),
        type: newCitation.type as Citation['type'],
        title: newCitation.title,
        authors: newCitation.authors.filter(a => a.trim()),
        year: newCitation.year || new Date().getFullYear(),
        ...newCitation
      };
      
      setCitations([...citations, citation]);
      onCitationAdd?.(citation);
      setNewCitation({ type: 'journal', authors: [''], year: new Date().getFullYear() });
      setShowAddForm(false);
    }
  };

  const copyCitation = (citation: Citation, format: 'apa' | 'mla') => {
    const formatted = format === 'apa' ? formatAPA(citation) : formatMLA(citation);
    navigator.clipboard.writeText(formatted);
  };

  const exportBibliography = (format: string) => {
    const formatted = citations.map(c => format === 'apa' ? formatAPA(c) : formatMLA(c));
    onExportBibliography?.(citations, format);
    
    const blob = new Blob([formatted.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliography_${format}.txt`;
    a.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Citation Manager
          <Badge variant="secondary">{citations.length} citations</Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="Search citations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Citation
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <Card className="border-blue-200">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={newCitation.type}
                    onChange={(e) => setNewCitation({...newCitation, type: e.target.value as Citation['type']})}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="journal">Journal Article</option>
                    <option value="book">Book</option>
                    <option value="website">Website</option>
                    <option value="conference">Conference Paper</option>
                    <option value="thesis">Thesis</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Year</label>
                  <Input
                    type="number"
                    value={newCitation.year}
                    onChange={(e) => setNewCitation({...newCitation, year: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newCitation.title || ''}
                  onChange={(e) => setNewCitation({...newCitation, title: e.target.value})}
                  placeholder="Enter title..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Authors (one per line)</label>
                <Textarea
                  value={newCitation.authors?.join('\n') || ''}
                  onChange={(e) => setNewCitation({...newCitation, authors: e.target.value.split('\n')})}
                  placeholder="Smith, J.\nJohnson, A."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addCitation} className="flex-1">Add Citation</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">Citation List</TabsTrigger>
            <TabsTrigger value="apa">APA Format</TabsTrigger>
            <TabsTrigger value="mla">MLA Format</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-3">
            {filteredCitations.map(citation => (
              <Card key={citation.id} className="hover:shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{citation.title}</h3>
                      <p className="text-sm text-gray-600">{citation.authors.join(', ')} ({citation.year})</p>
                      {citation.journal && (
                        <p className="text-sm text-gray-500">{citation.journal}</p>
                      )}
                    </div>
                    <Badge variant="outline">{citation.type}</Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => copyCitation(citation, 'apa')}>
                      <Copy className="w-3 h-3 mr-1" />
                      APA
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyCitation(citation, 'mla')}>
                      <Copy className="w-3 h-3 mr-1" />
                      MLA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="apa" className="space-y-2">
            <div className="flex justify-end mb-3">
              <Button onClick={() => exportBibliography('apa')}>
                <Download className="w-4 h-4 mr-2" />
                Export APA
              </Button>
            </div>
            {filteredCitations.map(citation => (
              <div key={citation.id} className="p-3 bg-gray-50 rounded text-sm">
                {formatAPA(citation)}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="mla" className="space-y-2">
            <div className="flex justify-end mb-3">
              <Button onClick={() => exportBibliography('mla')}>
                <Download className="w-4 h-4 mr-2" />
                Export MLA
              </Button>
            </div>
            {filteredCitations.map(citation => (
              <div key={citation.id} className="p-3 bg-gray-50 rounded text-sm">
                {formatMLA(citation)}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}