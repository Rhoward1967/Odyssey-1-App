import React, { useState } from 'react';
import { PenTool, Save, Download, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function ResearchNotes() {
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [savedNotes, setSavedNotes] = useState([
    { id: 1, title: 'Research Notes - Project Alpha', content: 'Key findings from today\'s session...', date: '2024-01-15' },
    { id: 2, title: 'Meeting Summary', content: 'Action items and next steps...', date: '2024-01-14' },
    { id: 3, title: 'Literature Review', content: 'Important sources and references...', date: '2024-01-13' }
  ]);

  const saveNote = () => {
    if (noteContent.trim()) {
      const newNote = {
        id: savedNotes.length + 1,
        title: noteTitle.trim() || `Research Notes - ${new Date().toLocaleDateString()}`,
        content: noteContent,
        date: new Date().toISOString().split('T')[0]
      };
      setSavedNotes([newNote, ...savedNotes]);
      setNoteContent('');
      setNoteTitle('');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
              <PenTool className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Research Notes</h1>
              <p className="text-gray-600">Organize and manage your research findings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {savedNotes.length} Notes
            </Badge>
            <Button size="sm" variant="outline" onClick={downloadNotes}>
              <Download className="w-4 h-4 mr-1" />
              Export All
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Note Editor */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">New Note</h2>
            </div>
            
            <div className="space-y-4">
              <Input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title (optional)"
                className="w-full"
              />
              
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your research notes here..."
                className="w-full h-64 resize-none"
              />
              
              <Button onClick={saveNote} disabled={!noteContent.trim()} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
            </div>
          </div>

          {/* Saved Notes */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Saved Notes</h2>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {savedNotes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                    <span className="text-xs text-gray-500 ml-2">{note.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">{note.content}</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setNoteTitle(note.title);
                      setNoteContent(note.content);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}