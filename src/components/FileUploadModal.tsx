/**
 * File Upload Modal Component
 * Drag-and-drop file upload with progress tracking
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    deleteFile,
    downloadFile,
    formatFileSize,
    generateShareLink,
    getFileIcon,
    getUserFiles,
    revokeShareLink,
    UploadedFile,
    UploadProgress,
    uploadUserFile
} from '@/services/fileUploadService';
import { Download, FileText, Link as LinkIcon, Share2, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  // Load files when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    setLoading(true);
    const userFiles = await getUserFiles();
    setFiles(userFiles);
    setLoading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (filesToUpload: File[]) => {
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);

    for (const file of filesToUpload) {
      // Check file size (50MB limit)
      if (file.size > 52428800) {
        toast.error(`${file.name} is too large (max 50MB)`);
        continue;
      }

      // Add to upload queue
      const progress: UploadProgress = {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      };
      setUploadQueue(prev => [...prev, progress]);

      // Upload file
      const result = await uploadUserFile(
        file,
        description || undefined,
        tagArray.length > 0 ? tagArray : undefined,
        (progressUpdate) => {
          setUploadQueue(prev =>
            prev.map(p =>
              p.fileName === progressUpdate.fileName ? progressUpdate : p
            )
          );
        }
      );

      if (result) {
        toast.success(`✅ ${file.name} uploaded!`);
        // Remove from upload queue after 2 seconds
        setTimeout(() => {
          setUploadQueue(prev => prev.filter(p => p.fileName !== file.name));
        }, 2000);
      } else {
        toast.error(`❌ Failed to upload ${file.name}`);
      }
    }

    // Reload files list
    await loadFiles();
    setDescription('');
    setTags('');
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      await downloadFile(file.bucket_name, file.file_path, file.file_name);
      toast.success(`Downloaded ${file.file_name}`);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!confirm(`Delete ${file.file_name}?`)) return;

    const success = await deleteFile(file.id, file.bucket_name, file.file_path);
    if (success) {
      toast.success(`🗑️ Deleted ${file.file_name}`);
      await loadFiles();
    } else {
      toast.error('Failed to delete file');
    }
  };

  const handleShare = async (file: UploadedFile) => {
    if (file.is_shared && file.share_token) {
      // Copy existing link
      const shareUrl = `${window.location.origin}/shared/${file.share_token}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('📋 Share link copied to clipboard!');
    } else {
      // Generate new share link
      const token = await generateShareLink(file.id);
      if (token) {
        const shareUrl = `${window.location.origin}/shared/${token}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('🔗 Share link generated and copied!');
        await loadFiles();
      } else {
        toast.error('Failed to generate share link');
      }
    }
  };

  const handleRevokeShare = async (file: UploadedFile) => {
    const success = await revokeShareLink(file.id);
    if (success) {
      toast.success('🔒 Share link revoked');
      await loadFiles();
    } else {
      toast.error('Failed to revoke share link');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>📁 File Upload & Management</DialogTitle>
          <DialogDescription>
            Upload, manage, and share your files (Max 50MB per file)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upload Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  PDF, DOC, XLS, PPT, Images, Videos (Max 50MB)
                </p>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-input"
                />
                <Button asChild>
                  <label htmlFor="file-input" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Select Files
                  </label>
                </Button>
              </div>

              {/* Optional Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="What is this file about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (optional, comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="homework, math, chapter 5"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {uploadQueue.length > 0 && (
                <div className="space-y-2">
                  {uploadQueue.map((upload, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{upload.fileName}</span>
                        <span className="text-muted-foreground">
                          {upload.status === 'uploading' && 'Uploading...'}
                          {upload.status === 'processing' && 'Processing...'}
                          {upload.status === 'complete' && '✓ Complete'}
                          {upload.status === 'error' && '✗ Error'}
                        </span>
                      </div>
                      <Progress value={upload.progress} />
                      {upload.error && (
                        <p className="text-xs text-destructive">{upload.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Files List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Your Files</CardTitle>
                  <CardDescription>{files.length} files uploaded</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadFiles}>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading files...</div>
                ) : files.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <Card key={file.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl">{getFileIcon(file.file_type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{file.file_name}</p>
                                  {file.description && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {file.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                      {formatFileSize(file.file_size_bytes)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(file.created_at).toLocaleDateString()}
                                    </span>
                                    {file.is_shared && (
                                      <>
                                        <span className="text-xs text-muted-foreground">•</span>
                                        <Badge variant="secondary" className="text-xs">
                                          <LinkIcon className="w-3 h-3 mr-1" />
                                          Shared
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                  {file.tags && file.tags.length > 0 && (
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                      {file.tags.map((tag, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDownload(file)}
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleShare(file)}
                                    title={file.is_shared ? 'Copy share link' : 'Generate share link'}
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                  {file.is_shared && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRevokeShare(file)}
                                      title="Revoke share link"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(file)}
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
