import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { supabase } from '../lib/supabase';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  createdAt: string;
  relevanceScore: number;
}

interface SearchFilters {
  type: string[];
  category: string[];
  dateRange: string;
  sortBy: string;
}

export default function AdvancedSearchEngine() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    category: [],
    dateRange: 'all',
    sortBy: 'relevance'
  });

  const searchTypes = ['document', 'conversation', 'research', 'template'];
  const categories = ['AI', 'Business', 'Research', 'Education', 'Technology'];
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const performSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Build Supabase query for live search
      let supaQuery = supabase
        .from('search_index')
        .select('*')
        .textSearch('content', query, { type: 'websearch' });

      // Apply filters
      if (filters.type.length > 0) {
        supaQuery = supaQuery.in('type', filters.type);
      }
      if (filters.category.length > 0) {
        supaQuery = supaQuery.in('category', filters.category);
      }
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let afterDate = null;
        switch (filters.dateRange) {
          case '24h': afterDate = new Date(now.getTime() - 86400000); break;
          case '7d': afterDate = new Date(now.getTime() - 604800000); break;
          case '30d': afterDate = new Date(now.getTime() - 2592000000); break;
          case '90d': afterDate = new Date(now.getTime() - 7776000000); break;
        }
        if (afterDate) {
          supaQuery = supaQuery.gte('createdAt', afterDate.toISOString());
        }
      }

      // Apply sorting
      if (filters.sortBy === 'date') {
        supaQuery = supaQuery.order('createdAt', { ascending: false });
      } else if (filters.sortBy === 'title') {
        supaQuery = supaQuery.order('title', { ascending: true });
      } else {
        supaQuery = supaQuery.order('relevanceScore', { ascending: false });
      }

      const { data, error } = await supaQuery;
      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleArrayFilter = (filterType: 'type' | 'category', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  useEffect(() => {
    if (query.trim()) {
      const debounceTimer = setTimeout(performSearch, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [query, filters]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Search Engine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search across all content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={performSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <div className="space-y-2">
                {searchTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.type.includes(type)}
                      onCheckedChange={() => toggleArrayFilter('type', type)}
                    />
                    <label className="text-sm capitalize">{type}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.category.includes(category)}
                      onCheckedChange={() => toggleArrayFilter('category', category)}
                    />
                    <label className="text-sm">{category}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {query ? 'No results found' : 'Enter a search query to get started'}
              </p>
            ) : (
              results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{result.title}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">{result.type}</Badge>
                      <Badge variant="secondary">{result.category}</Badge>
                      <Badge variant="default">{Math.round(result.relevanceScore * 100)}%</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{result.content}</p>
                  <div className="text-sm text-gray-500">
                    {new Date(result.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}