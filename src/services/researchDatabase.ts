import { supabase } from '@/lib/supabase';

export interface ResearchEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  citations: string[];
  created_at: string;
  updated_at: string;
  type: 'finding' | 'conversation' | 'citation' | 'note';
  user_id?: string;
}

export interface SearchOptions {
  query?: string;
  tags?: string[];
  type?: string;
  dateRange?: string;
  limit?: number;
  offset?: number;
}

class ResearchDatabaseService {
  private useLocalStorage = false;

  constructor() {
    this.checkSupabaseConnection();
  }

  private async checkSupabaseConnection() {
    try {
      const { error } = await supabase.from('research_entries').select('count', { count: 'exact', head: true });
      this.useLocalStorage = !!error;
    } catch {
      this.useLocalStorage = true;
    }
  }

  // Local storage fallback methods
  private getLocalEntries(): ResearchEntry[] {
    try {
      return JSON.parse(localStorage.getItem('research_entries') || '[]');
    } catch {
      return [];
    }
  }

  private saveLocalEntries(entries: ResearchEntry[]) {
    localStorage.setItem('research_entries', JSON.stringify(entries));
  }

  private getLocalTags(): string[] {
    try {
      return JSON.parse(localStorage.getItem('research_tags') || '[]');
    } catch {
      return [];
    }
  }

  private saveLocalTags(tags: string[]) {
    localStorage.setItem('research_tags', JSON.stringify(tags));
  }

  async createEntry(entry: Omit<ResearchEntry, 'id' | 'created_at' | 'updated_at'>): Promise<ResearchEntry> {
    const newEntry: ResearchEntry = {
      ...entry,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.useLocalStorage) {
      const entries = this.getLocalEntries();
      entries.unshift(newEntry);
      this.saveLocalEntries(entries);

      // Update tags
      const existingTags = this.getLocalTags();
      const newTags = [...new Set([...existingTags, ...entry.tags])];
      this.saveLocalTags(newTags);

      return newEntry;
    }

    try {
      const { data, error } = await supabase
        .from('research_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;

      // Update tags
      for (const tag of entry.tags) {
        await supabase
          .from('research_tags')
          .upsert({ name: tag }, { onConflict: 'name' });
      }

      return data;
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  }

  async getEntries(options: SearchOptions = {}): Promise<ResearchEntry[]> {
    if (this.useLocalStorage) {
      let entries = this.getLocalEntries();
      
      // Apply filters
      if (options.query) {
        const query = options.query.toLowerCase();
        entries = entries.filter(entry =>
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query) ||
          entry.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      if (options.type && options.type !== 'all') {
        entries = entries.filter(entry => entry.type === options.type);
      }

      if (options.tags && options.tags.length > 0) {
        entries = entries.filter(entry =>
          options.tags!.every(tag => entry.tags.includes(tag))
        );
      }

      if (options.dateRange && options.dateRange !== 'all') {
        const now = new Date();
        const cutoff = new Date();

        switch (options.dateRange) {
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

        entries = entries.filter(entry =>
          new Date(entry.created_at) >= cutoff
        );
      }

      // Apply pagination
      const offset = options.offset || 0;
      const limit = options.limit || 50;
      return entries.slice(offset, offset + limit);
    }

    try {
      let query = supabase
        .from('research_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.type && options.type !== 'all') {
        query = query.eq('type', options.type);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      let entries = data || [];

      // Client-side filtering for complex queries
      if (options.query) {
        const queryLower = options.query.toLowerCase();
        entries = entries.filter(entry =>
          entry.title.toLowerCase().includes(queryLower) ||
          entry.content.toLowerCase().includes(queryLower) ||
          entry.tags.some((tag: string) => tag.toLowerCase().includes(queryLower))
        );
      }

      if (options.tags && options.tags.length > 0) {
        entries = entries.filter(entry =>
          options.tags!.every(tag => entry.tags.includes(tag))
        );
      }

      return entries;
    } catch (error) {
      console.error('Error fetching entries:', error);
      throw error;
    }
  }

  async updateEntry(id: string, updates: Partial<ResearchEntry>): Promise<ResearchEntry> {
    if (this.useLocalStorage) {
      const entries = this.getLocalEntries();
      const index = entries.findIndex(entry => entry.id === id);
      
      if (index === -1) throw new Error('Entry not found');

      entries[index] = {
        ...entries[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      this.saveLocalEntries(entries);
      return entries[index];
    }

    try {
      const { data, error } = await supabase
        .from('research_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }

  async deleteEntry(id: string): Promise<void> {
    if (this.useLocalStorage) {
      const entries = this.getLocalEntries();
      const filtered = entries.filter(entry => entry.id !== id);
      this.saveLocalEntries(filtered);
      return;
    }

    try {
      const { error } = await supabase
        .from('research_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }

  async getTags(): Promise<string[]> {
    if (this.useLocalStorage) {
      return this.getLocalTags();
    }

    try {
      const { data, error } = await supabase
        .from('research_tags')
        .select('name')
        .order('name');

      if (error) throw error;
      return data?.map(t => t.name) || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }

  async saveConversation(messages: any[], title?: string): Promise<ResearchEntry> {
    const content = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const conversationTitle = title || `Conversation ${new Date().toLocaleDateString()}`;
    
    return this.createEntry({
      title: conversationTitle,
      content,
      tags: ['conversation', 'ai-chat'],
      citations: [],
      type: 'conversation'
    });
  }

  async searchFullText(query: string, limit = 20): Promise<ResearchEntry[]> {
    return this.getEntries({ query, limit });
  }

  async getEntriesByTag(tag: string): Promise<ResearchEntry[]> {
    return this.getEntries({ tags: [tag] });
  }

  async getStatistics() {
    const entries = await this.getEntries({ limit: 1000 });
    const tags = await this.getTags();

    const typeStats = entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEntries: entries.length,
      totalTags: tags.length,
      typeBreakdown: typeStats,
      recentEntries: entries.slice(0, 5)
    };
  }
}

export const researchDB = new ResearchDatabaseService();