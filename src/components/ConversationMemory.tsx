import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Brain, Search, Plus, Trash2, Share2, Tag, Clock, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  tags: string[];
  personality: string;
  industry: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

interface ConversationMemoryProps {
  onLoadConversation?: (conversation: Conversation) => void;
  onSaveConversation?: (conversation: Conversation) => void;
  currentConversation?: Conversation | null;
}

export default function ConversationMemory({ 
  onLoadConversation, 
  onSaveConversation,
  currentConversation 
}: ConversationMemoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTags, setNewTags] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'tags'>('recent');
  
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversation_memory')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentConversation = async () => {
    if (!currentConversation || !newTitle.trim()) return;
    
    setIsLoading(true);
    try {
      const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const conversationData = {
        title: newTitle,
        messages: currentConversation.messages,
        tags: tags,
        personality: currentConversation.personality || 'casual',
        industry: currentConversation.industry || 'General',
        is_shared: false
      };

      const { data, error } = await supabase
        .from('conversation_memory')
        .insert([conversationData])
        .select()
        .single();
      
      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      setNewTitle('');
      setNewTags('');
      
      if (onSaveConversation) {
        onSaveConversation(data);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const { error } = await supabase
        .from('conversation_memory')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setConversations(prev => prev.filter(conv => conv.id !== id));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const shareConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversation_memory')
        .update({ is_shared: true })
        .eq('id', id);
      
      if (error) throw error;
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === id ? { ...conv, is_shared: true } : conv
        )
      );
    } catch (error) {
      console.error('Error sharing conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery || 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => conv.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'tags':
        return a.tags.length - b.tags.length;
      case 'recent':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  const allTags = [...new Set(conversations.flatMap(conv => conv.tags))];

  return (
    <Card className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-purple-900">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            Conversation Memory
          </div>
          <Badge variant="outline" className="text-purple-600">
            {conversations.length} saved
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Current Conversation */}
        {currentConversation && currentConversation.messages.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-900 mb-3">Save Current Conversation</h4>
            <div className="space-y-3">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter conversation title..."
                className="border-purple-200 focus:ring-purple-500"
              />
              <Input
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Tags (comma-separated): research, ai, analysis..."
                className="border-purple-200 focus:ring-purple-500"
              />
              <Button
                onClick={saveCurrentConversation}
                disabled={isLoading || !newTitle.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Save Conversation
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 border-purple-200 focus:ring-purple-500"
            />
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="tags">Tags</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className="text-xs"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedConversations.map((conversation) => (
            <div key={conversation.id} className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-purple-900 cursor-pointer hover:text-purple-700"
                    onClick={() => onLoadConversation?.(conversation)}>
                  {conversation.title}
                </h4>
                <div className="flex items-center space-x-2">
                  {conversation.is_shared && (
                    <Badge variant="outline" className="text-blue-600">
                      <Share2 className="w-3 h-3 mr-1" />
                      Shared
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => shareConversation(conversation.id)}
                    disabled={conversation.is_shared}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteConversation(conversation.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {conversation.messages.length} messages
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(conversation.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {conversation.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {conversation.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {conversation.messages.length > 0 && (
                <p className="text-sm text-gray-700 line-clamp-2">
                  {conversation.messages[conversation.messages.length - 1]?.content}
                </p>
              )}
            </div>
          ))}
          
          {sortedConversations.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || selectedTags.length > 0 
                ? 'No conversations match your search criteria.'
                : 'No saved conversations yet. Start chatting with ODYSSEY-1 to create your first conversation!'}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 bg-purple-50 p-2 rounded">
          💡 Conversations are automatically saved with full search capabilities and tag organization.
        </div>
      </CardContent>
    </Card>
  );
}