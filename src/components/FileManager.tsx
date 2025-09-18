import React, { useState } from 'react';
import { FileText, Download, Upload, Trash2, Eye, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Project_Proposal.pdf',
      size: 2048000,
      type: 'application/pdf',
      uploadedBy: 'Sarah Johnson',
      uploadedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Meeting_Notes.docx',
      size: 512000,
      type: 'application/docx',
      uploadedBy: 'Mike Chen',
      uploadedAt: new Date().toISOString()
    }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: 'You',
        uploadedAt: new Date().toISOString()
      };
      setFiles(prev => [newFile, ...prev]);
      setIsUploading(false);
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('document') || type.includes('word')) return '📝';
    return '📁';
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">File Manager</h3>
            <p className="text-sm text-gray-600">Upload and share files with the team</p>
          </div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <div key={file.id} className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">{getFileIcon(file.type)}</div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Download className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            </div>

            <h4 className="font-medium text-gray-900 mb-2 truncate" title={file.name}>
              {file.name}
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Size</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploaded</span>
                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {file.type.split('/')[1] || 'file'}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No files found' : 'No files uploaded yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try a different search term' : 'Upload your first file to get started'}
          </p>
        </div>
      )}
    </div>
  );
}