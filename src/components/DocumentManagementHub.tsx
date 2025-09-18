import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Upload, Search, Filter, Download, 
  Share, Trash2, Eye, Edit, FolderOpen, 
  Calendar, User, Tag, Star
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  created_at: string;
  updated_at: string;
  author: string;
  tags: string[];
  category: string;
  starred: boolean;
  shared: boolean;
}

interface Folder {
  id: string;
  name: string;
  document_count: number;
  created_at: string;
}

export const DocumentManagementHub: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    loadDocuments();
    loadFolders();
  }, []);

  const loadDocuments = async () => {
    // Mock documents for demo
    const mockDocs: Document[] = [
      {
        id: '1',
        name: 'AI Research Proposal.pdf',
        type: 'pdf',
        size: '2.4 MB',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-16T14:20:00Z',
        author: 'Rickey Howard',
        tags: ['research', 'ai', 'proposal'],
        category: 'research',
        starred: true,
        shared: false
      },
      {
        id: '2',
        name: 'System Architecture.docx',
        type: 'docx',
        size: '1.8 MB',
        created_at: '2024-01-14T09:15:00Z',
        updated_at: '2024-01-14T16:45:00Z',
        author: 'System Admin',
        tags: ['architecture', 'system', 'technical'],
        category: 'technical',
        starred: false,
        shared: true
      },
      {
        id: '3',
        name: 'Budget Analysis Q1.xlsx',
        type: 'xlsx',
        size: '890 KB',
        created_at: '2024-01-13T11:20:00Z',
        updated_at: '2024-01-13T15:30:00Z',
        author: 'Finance Team',
        tags: ['budget', 'finance', 'q1'],
        category: 'finance',
        starred: false,
        shared: false
      },
      {
        id: '4',
        name: 'Meeting Notes - Jan 2024.txt',
        type: 'txt',
        size: '45 KB',
        created_at: '2024-01-12T14:00:00Z',
        updated_at: '2024-01-12T16:30:00Z',
        author: 'Team Lead',
        tags: ['meeting', 'notes', 'january'],
        category: 'meetings',
        starred: true,
        shared: true
      }
    ];
    setDocuments(mockDocs);
  };

  const loadFolders = async () => {
    const mockFolders: Folder[] = [
      { id: '1', name: 'Research Papers', document_count: 12, created_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'Technical Docs', document_count: 8, created_at: '2024-01-02T00:00:00Z' },
      { id: '3', name: 'Financial Reports', document_count: 15, created_at: '2024-01-03T00:00:00Z' },
      { id: '4', name: 'Meeting Records', document_count: 24, created_at: '2024-01-04T00:00:00Z' }
    ];
    setFolders(mockFolders);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'xlsx': return '📊';
      case 'txt': return '📋';
      default: return '📄';
    }
  };

  const categories = ['all', 'research', 'technical', 'finance', 'meetings'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Management</h2>
          <p className="text-muted-foreground">Organize and manage your documents</p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Storage Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Used</span>
                <span className="text-sm font-medium">4.2 GB</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
              <div className="text-xs text-muted-foreground">4.2 GB of 10 GB used</div>
            </CardContent>
          </Card>

          {/* Folders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Folders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-48">
                <div className="space-y-1 p-3">
                  {folders.map(folder => (
                    <div key={folder.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{folder.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {folder.document_count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents ({filteredDocuments.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4">
                  {filteredDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50">
                      <div className="text-2xl">{getFileIcon(doc.type)}</div>
                       <div className="flex-1">
                         <div className="flex items-center gap-2">
                           <h4 className="font-medium">{doc.name}</h4>
                           {doc.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                           {doc.shared && <Share className="h-4 w-4 text-blue-500" />}
                         </div>
                         <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                           <span className="flex items-center gap-1">
                             <User className="h-3 w-3" />
                             {doc.author}
                           </span>
                           <span className="flex items-center gap-1">
                             <Calendar className="h-3 w-3" />
                             {new Date(doc.updated_at).toLocaleDateString()}
                           </span>
                           <span>{doc.size}</span>
                         </div>
                         <div className="flex gap-1 mt-2">
                           {doc.tags.map(tag => (
                             <Badge key={tag} variant="outline" className="text-xs">
                               <Tag className="h-2 w-2 mr-1" />
                               {tag}
                             </Badge>
                           ))}
                         </div>
                       </div>
                       <div className="flex gap-1">
                         <Button variant="ghost" size="sm">
                           <Eye className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="sm">
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="sm">
                           <Download className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="sm">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   ))}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </div>
       </div>
     </div>
   );
};

export default DocumentManagementHub;