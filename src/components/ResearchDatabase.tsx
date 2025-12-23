import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Save, Tag, FileText, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface ResearchEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  citations: string[];
  created_at: string;
  updated_at: string;
  type: 'finding' | 'conversation' | 'citation' | 'note';
}

interface SearchFilters {
  query: string;
  tags: string[];
  type: string;
  dateRange: string;
}

export const ResearchDatabase = () => {
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ResearchEntry[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    type: 'all',
    dateRange: 'all'
  });
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    tags: '',
    citations: '',
    type: 'finding' as const
  });
  const [isLoading, setIsLoading] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadEntries();
    loadTags();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchFilters]);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('research_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast({
        title: "Error",
        description: "Failed to load research entries",
        variant: "destructive"
      });
    }
  };

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('research_tags')
        .select('name')
        .order('name');

      if (error) throw error;
      setAllTags(data?.map(t => t.name) || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const saveEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const tags = newEntry.tags.split(',').map(t => t.trim()).filter(Boolean);
      const citations = newEntry.citations.split('\n').filter(Boolean);

      const { error } = await supabase
        .from('research_entries')
        .insert({
          title: newEntry.title,
          content: newEntry.content,
          tags,
          citations,
          type: newEntry.type
        });

      if (error) throw error;

      // Save new tags
      for (const tag of tags) {
        if (!allTags.includes(tag)) {
          await supabase
            .from('research_tags')
            .insert({ name: tag });
        }
      }

      setNewEntry({
        title: '',
        content: '',
        tags: '',
        citations: '',
        type: 'finding'
      });

      await loadEntries();
      await loadTags();

      toast({
        title: "Success",
        description: "Research entry saved successfully"
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error",
        description: "Failed to save research entry",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('research_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadEntries();

      toast({
        title: "Success",
        description: "Entry deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive"
      });
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    // Full-text search
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (searchFilters.type !== 'all') {
      filtered = filtered.filter(entry => entry.type === searchFilters.type);
    }

    // Tag filter
    if (searchFilters.tags.length > 0) {
      filtered = filtered.filter(entry =>
        searchFilters.tags.every(tag => entry.tags.includes(tag))
      );
    }

    // Date range filter
    if (searchFilters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();

      switch (searchFilters.dateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(entry =>
        new Date(entry.created_at) >= cutoff
      );
    }

    setFilteredEntries(filtered);
  };

  const toggleTag = (tag: string) => {
    setSearchFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Research Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search & Browse</TabsTrigger>
              <TabsTrigger value="add">Add Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search entries..."
                    value={searchFilters.query}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <select
                  value={searchFilters.type}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="finding">Findings</option>
                  <option value="conversation">Conversations</option>
                  <option value="citation">Citations</option>
                  <option value="note">Notes</option>
                </select>
                <select
                  value={searchFilters.dateRange}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={searchFilters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredEntries.map(entry => (
                  <Card key={entry.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{entry.type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{entry.content}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {entry.citations.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Citations: {entry.citations.length}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Entry title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                />
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value as any }))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="finding">Research Finding</option>
                  <option value="conversation">Conversation</option>
                  <option value="citation">Citation</option>
                  <option value="note">Note</option>
                </select>
              </div>
              <Textarea
                placeholder="Entry content"
                value={newEntry.content}
                onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
              <Input
                placeholder="Tags (comma-separated)"
                value={newEntry.tags}
                onChange={(e) => setNewEntry(prev => ({ ...prev, tags: e.target.value }))}
              />
              <Textarea
                placeholder="Citations (one per line)"
                value={newEntry.citations}
                onChange={(e) => setNewEntry(prev => ({ ...prev, citations: e.target.value }))}
                rows={3}
              />
              <Button onClick={saveEntry} disabled={isLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Entry'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};