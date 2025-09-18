import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ContentSection {
  id: string;
  section_name: string;
  title: string;
  subtitle: string;
  content: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
  display_order: number;
}

export default function StaticSiteManager() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from('static_site_content')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load site content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async (section: ContentSection) => {
    try {
      const { error } = await supabase
        .from('static_site_content')
        .upsert({
          ...section,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content updated successfully! Changes will appear on your GoDaddy site within 30 seconds.",
      });

      setEditingSection(null);
      loadSections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive"
      });
    }
  };

  const toggleSection = async (section: ContentSection) => {
    try {
      const { error } = await supabase
        .from('static_site_content')
        .update({ is_active: !section.is_active })
        .eq('id', section.id);

      if (error) throw error;
      loadSections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle section",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading site content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Static Site Manager</h2>
          <p className="text-muted-foreground">
            Manage content for your GoDaddy static site (odyssey-1.ai)
          </p>
        </div>
        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
          ✓ Auto-updates every 30 seconds
        </div>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.id} className={!section.is_active ? 'opacity-50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="capitalize">
                  {section.section_name.replace(/_/g, ' ')}
                </CardTitle>
                <CardDescription>{section.title}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={section.is_active ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSection(section)}
                >
                  {section.is_active ? 'Active' : 'Inactive'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSection(section)}
                >
                  Edit
                </Button>
              </div>
            </CardHeader>
            {editingSection?.id === section.id && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editingSection.title}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        title: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={editingSection.subtitle}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        subtitle: e.target.value
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={editingSection.content}
                    onChange={(e) => setEditingSection({
                      ...editingSection,
                      content: e.target.value
                    })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="button_text">Button Text</Label>
                    <Input
                      id="button_text"
                      value={editingSection.button_text}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        button_text: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="button_link">Button Link</Label>
                    <Input
                      id="button_link"
                      value={editingSection.button_link}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        button_link: e.target.value
                      })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveSection(editingSection)}>
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How Auto-Updates Work</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2 text-sm">
            <li>• Your GoDaddy site checks for updates every 30 seconds</li>
            <li>• Changes made here appear automatically on odyssey-1.ai</li>
            <li>• No manual file uploads needed - everything syncs through Supabase</li>
            <li>• Users see a brief "Content Updated!" notification when changes occur</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}