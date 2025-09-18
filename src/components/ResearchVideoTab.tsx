import React, { useState } from 'react';
import { BookOpen, PenTool, Save, Download, Search, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import AIResearchAssistant from './AIResearchAssistant';

export default function ResearchVideoTab() {
  const [noteContent, setNoteContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedNotes, setSavedNotes] = useState([
    { id: 1, title: 'Research Notes - Project Alpha', content: 'Key findings from today\'s session...', date: '2024-01-15' },
    { id: 2, title: 'Meeting Summary', content: 'Action items and next steps...', date: '2024-01-14' }
  ]);

  const saveNote = () => {
    if (noteContent.trim()) {
      const newNote = {
        id: savedNotes.length + 1,
        title: `Research Notes - ${new Date().toLocaleDateString()}`,
        content: noteContent,
        date: new Date().toISOString().split('T')[0]
      };
      setSavedNotes([newNote, ...savedNotes]);
      setNoteContent('');
    }
  };

  const downloadNotes = () => {
    const notesText = savedNotes.map(note => 
      `${note.title}\n${note.date}\n${'-'.repeat(50)}\n${note.content}\n\n`
    ).join('');
    
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-notes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Research Studio</h3>
              <p className="text-sm text-gray-500">AI-powered research and note-taking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Lightbulb className="w-3 h-3 mr-1" />
              AI Enhanced
            </Badge>
            <Button size="sm" variant="outline" onClick={downloadNotes}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100%-80px)]">
        {/* AI Research Assistant - Left Panel */}
        <div className="w-1/2 p-4 border-r bg-white">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">AI Research Assistant</h4>
            </div>
            
            <div className="mb-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask anything or search for information..."
                className="w-full"
              />
            </div>

            <div className="flex-1 border rounded-lg bg-gray-50 overflow-hidden">
              <AIResearchAssistant 
                onInsertText={(text) => setNoteContent(prev => prev + (prev ? '\n\n' : '') + text)}
              />
            </div>
          </div>
        </div>

        {/* Notes Panel - Right Panel */}
        <div className="w-1/2 p-4 bg-gray-50">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-gray-900">Research Notes</h4>
              </div>
              <Button size="sm" onClick={saveNote} disabled={!noteContent.trim()}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>

            {/* Active Note Editor */}
            <div className="mb-4">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Take notes during your research session... AI insights will be automatically added here."
                className="w-full h-40 resize-none"
              />
            </div>

            {/* Saved Notes */}
            <div className="flex-1 overflow-y-auto">
              <h5 className="font-medium text-gray-700 mb-2">Saved Notes ({savedNotes.length})</h5>
              <div className="space-y-2">
                {savedNotes.map((note) => (
                  <div key={note.id} className="bg-white p-3 rounded-lg border hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-1">
                      <h6 className="font-medium text-sm text-gray-900 truncate">{note.title}</h6>
                      <span className="text-xs text-gray-500 ml-2">{note.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="mt-2 h-6 px-2 text-xs"
                      onClick={() => setNoteContent(note.content)}
                    >
                      Load to Editor
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}