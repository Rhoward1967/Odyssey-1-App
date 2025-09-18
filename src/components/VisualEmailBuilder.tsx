import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Type, 
  Image, 
  Layout, 
  Palette, 
  Eye, 
  Save,
  Undo,
  Redo,
  Copy,
  Trash2,
  Plus
} from 'lucide-react';

interface EmailElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer';
  content: string;
  styles: Record<string, string>;
}

export default function VisualEmailBuilder() {
  const [elements, setElements] = useState<EmailElement[]>([
    {
      id: '1',
      type: 'text',
      content: 'Welcome to ODYSSEY-1',
      styles: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#1f2937' }
    },
    {
      id: '2',
      type: 'text',
      content: 'Your AI-powered business intelligence platform.',
      styles: { fontSize: '16px', textAlign: 'center', color: '#6b7280', marginBottom: '20px' }
    }
  ]);
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const elementTypes = [
    { type: 'text', icon: Type, label: 'Text Block' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'button', icon: Layout, label: 'Button' },
    { type: 'divider', icon: Layout, label: 'Divider' },
    { type: 'spacer', icon: Layout, label: 'Spacer' }
  ];

  const addElement = (type: string) => {
    const newElement: EmailElement = {
      id: Date.now().toString(),
      type: type as EmailElement['type'],
      content: type === 'text' ? 'New text block' : type === 'button' ? 'Click Here' : '',
      styles: { marginBottom: '20px' }
    };
    setElements([...elements, newElement]);
  };

  const updateElement = (id: string, updates: Partial<EmailElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const renderElement = (element: EmailElement) => {
    const isSelected = selectedElement === element.id;
    const baseStyles = {
      ...element.styles,
      border: isSelected ? '2px solid #3b82f6' : '1px solid transparent',
      cursor: 'pointer',
      position: 'relative' as const
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={baseStyles}
            onClick={() => setSelectedElement(element.id)}
            className="p-2 hover:bg-gray-50"
          >
            {element.content}
          </div>
        );
      case 'image':
        return (
          <div
            key={element.id}
            style={baseStyles}
            onClick={() => setSelectedElement(element.id)}
            className="p-2 hover:bg-gray-50"
          >
            <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded">
              <Image className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        );
      case 'button':
        return (
          <div
            key={element.id}
            style={baseStyles}
            onClick={() => setSelectedElement(element.id)}
            className="p-2 hover:bg-gray-50 text-center"
          >
            <button className="bg-blue-600 text-white px-6 py-2 rounded">
              {element.content}
            </button>
          </div>
        );
      case 'divider':
        return (
          <div
            key={element.id}
            style={baseStyles}
            onClick={() => setSelectedElement(element.id)}
            className="p-2 hover:bg-gray-50"
          >
            <hr className="border-gray-300" />
          </div>
        );
      case 'spacer':
        return (
          <div
            key={element.id}
            style={{ ...baseStyles, height: '20px' }}
            onClick={() => setSelectedElement(element.id)}
            className="hover:bg-gray-50"
          />
        );
      default:
        return null;
    }
  };

  const selectedEl = elements.find(el => el.id === selectedElement);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen">
      {/* Element Palette */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Elements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {elementTypes.map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                variant="outline"
                className="w-full justify-start"
                onClick={() => addElement(type)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Canvas */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Email Canvas</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Redo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-white min-h-96 max-w-2xl mx-auto">
            {elements.map(renderElement)}
            {elements.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Drag elements here to start building your email</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Properties Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedEl ? (
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label>Content</Label>
                  {selectedEl.type === 'text' ? (
                    <Textarea
                      value={selectedEl.content}
                      onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                    />
                  ) : (
                    <Input
                      value={selectedEl.content}
                      onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                    />
                  )}
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteElement(selectedEl.id)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Element
                </Button>
              </TabsContent>
              
              <TabsContent value="style" className="space-y-4">
                <div>
                  <Label>Font Size</Label>
                  <Input
                    value={selectedEl.styles.fontSize || '16px'}
                    onChange={(e) => updateElement(selectedEl.id, { 
                      styles: { ...selectedEl.styles, fontSize: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Text Color</Label>
                  <Input
                    type="color"
                    value={selectedEl.styles.color || '#000000'}
                    onChange={(e) => updateElement(selectedEl.id, { 
                      styles: { ...selectedEl.styles, color: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Text Align</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedEl.styles.textAlign || 'left'}
                    onChange={(e) => updateElement(selectedEl.id, { 
                      styles: { ...selectedEl.styles, textAlign: e.target.value }
                    })}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select an element to edit its properties</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}