import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Video, X, Play, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadManagerProps {
  onVideoUploaded?: (videoUrl: string) => void;
  currentVideo?: string;
  title?: string;
}

export const VideoUploadManager: React.FC<VideoUploadManagerProps> = ({
  onVideoUploaded,
  currentVideo,
  title = "Video Manager"
}) => {
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(currentVideo || null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a video file (MP4, MOV, AVI, etc.)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a video smaller than 100MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    // Create object URL for local preview
    const videoUrl = URL.createObjectURL(file);
    
    setTimeout(() => {
      setUploadedVideo(videoUrl);
      setIsUploading(false);
      onVideoUploaded?.(videoUrl);
      
      toast({
        title: "Video Uploaded Successfully",
        description: `${file.name} has been uploaded and is ready to use.`
      });
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeVideo = () => {
    if (uploadedVideo) {
      URL.revokeObjectURL(uploadedVideo);
    }
    setUploadedVideo(null);
    onVideoUploaded?.('');
    
    toast({
      title: "Video Removed",
      description: "The video has been removed successfully."
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedVideo ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop your MP4 commercial here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files (Max 100MB)
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mb-2"
            >
              {isUploading ? 'Uploading...' : 'Choose Video File'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                src={uploadedVideo}
                controls
                className="w-full rounded-lg"
                style={{ maxHeight: '400px' }}
              >
                Your browser does not support the video tag.
              </video>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeVideo}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Replace Video
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};