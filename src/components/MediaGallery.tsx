import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Download, Upload, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MediaGalleryProps {
  onBack?: () => void;
}

interface MediaItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
  user_liked?: boolean;
}

export default function MediaGallery({ onBack }: MediaGalleryProps = {}) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      user_id: '1',
      title: 'Beautiful Sunset',
      description: 'Captured this amazing sunset yesterday',
      file_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      file_type: 'image',
      likes_count: 15,
      comments_count: 3,
      views_count: 45,
      created_at: new Date().toISOString(),
      profiles: { full_name: 'Sarah Johnson' },
      user_liked: false
    },
    {
      id: '2',
      user_id: '2',
      title: 'Team Meeting',
      description: 'Great discussion today',
      file_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
      file_type: 'image',
      likes_count: 8,
      comments_count: 2,
      views_count: 23,
      created_at: new Date().toISOString(),
      profiles: { full_name: 'Mike Chen' },
      user_liked: true
    }
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newItem: MediaItem = {
        id: Date.now().toString(),
        user_id: '1',
        title: file.name.split('.')[0],
        description: '',
        file_url: URL.createObjectURL(file),
        file_type: file.type.startsWith('image/') ? 'image' : 'video',
        likes_count: 0,
        comments_count: 0,
        views_count: 0,
        created_at: new Date().toISOString(),
        profiles: { full_name: 'You' },
        user_liked: false
      };
      setMediaItems(prev => [newItem, ...prev]);
      setIsUploading(false);
    }, 2000);
  };

  const toggleLike = (itemId: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            user_liked: !item.user_liked,
            likes_count: item.user_liked ? item.likes_count - 1 : item.likes_count + 1
          }
        : item
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {/* Mobile-Optimized Header */}
      {onBack && (
        <div className="flex items-center gap-3 mb-4 bg-white rounded-lg p-3 shadow-sm">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold text-gray-900 flex-1">Media Gallery</h2>
        </div>
      )}
      
      {/* Mobile Upload Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Share Media</h3>
          <p className="text-sm text-gray-600 mb-3">Share photos and videos</p>
          <input
            type="file"
            id="media-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*"
          />
          <Button
            onClick={() => document.getElementById('media-upload')?.click()}
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </Button>
        </div>
      </div>

      {/* Mobile-Optimized Media Grid */}
      <div className="space-y-4">
        {mediaItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* User Info Header */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {item.profiles?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {item.profiles?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {item.views_count}
                </div>
              </div>
            </div>

            {/* Media Content */}
            <div className="relative bg-gray-100">
              <img
                src={item.file_url}
                alt={item.title}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            </div>

            {/* Content & Actions */}
            <div className="p-3">
              <h4 className="font-medium text-gray-900 mb-1 text-sm">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              )}

              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(item.id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors active:scale-95"
                  >
                    <Heart className={`w-4 h-4 ${item.user_liked ? 'fill-red-600 text-red-600' : ''}`} />
                    <span className="text-xs">{item.likes_count}</span>
                  </button>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{item.comments_count}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="p-2">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="p-2">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}