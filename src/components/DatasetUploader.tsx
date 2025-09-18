import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DatasetUploaderProps {
  onUploadComplete?: () => void;
}

export default function DatasetUploader({ onUploadComplete }: DatasetUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataType: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('uploading');

    try {
      // Upload file to Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('training-datasets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create dataset record
      const { error: dbError } = await supabase
        .from('training_datasets')
        .insert({
          name: formData.name,
          description: formData.description,
          data_type: formData.dataType,
          file_path: uploadData.path,
          size_mb: file.size / (1024 * 1024),
          sample_count: await estimateSampleCount(file),
          status: 'processing'
        });

      if (dbError) throw dbError;

      setUploadStatus('success');
      setFormData({ name: '', description: '', dataType: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const estimateSampleCount = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        resolve(lines.length);
      };
      reader.readAsText(file.slice(0, 10000)); // Read first 10KB to estimate
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Upload Training Dataset</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dataset Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Custom Dataset"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataType">Data Type</Label>
            <Select value={formData.dataType} onValueChange={(value) => setFormData(prev => ({ ...prev, dataType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text/Documents</SelectItem>
                <SelectItem value="conversation">Conversations</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="research">Research Papers</SelectItem>
                <SelectItem value="qa">Q&A Pairs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your dataset and its intended use..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Dataset File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.json,.jsonl,.csv"
                  className="hidden"
                  onChange={() => {}}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: TXT, JSON, JSONL, CSV
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {uploadStatus === 'success' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600">Upload successful!</span>
                </>
              )}
              {uploadStatus === 'error' && (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-600">Upload failed</span>
                </>
              )}
            </div>
            <Button type="submit" disabled={uploading || !formData.name || !formData.dataType}>
              {uploading ? 'Uploading...' : 'Upload Dataset'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}