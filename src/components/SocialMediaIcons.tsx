import React from 'react';
import { ExternalLink, MessageCircle, Camera, Users } from 'lucide-react';
import { Button } from './ui/button';

interface SocialMediaIconsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SocialMediaIcons: React.FC<SocialMediaIconsProps> = ({ 
  className = '', 
  size = 'sm' 
}) => {
  // Reduced to 4 essential platforms to prevent overflow
  // Using generic icons to avoid trademark issues
  const socialPlatforms = [
    {
      name: 'Social Network',
      url: 'https://facebook.com/odyssey1platform',
      icon: Users,
      color: 'hover:bg-blue-600',
    },
    {
      name: 'Photo Sharing', 
      url: 'https://instagram.com/odyssey1platform',
      icon: Camera,
      color: 'hover:bg-purple-600',
    },
    {
      name: 'Community Chat',
      url: 'https://discord.gg/odyssey1',
      icon: MessageCircle,
      color: 'hover:bg-indigo-600',
    },
    {
      name: 'Professional Network',
      url: 'https://linkedin.com/company/odyssey1',
      icon: ExternalLink,
      color: 'hover:bg-blue-700',
    }
  ];

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {socialPlatforms.map((platform) => (
        <Button
          key={platform.name}
          variant="ghost"
          size="sm"
          className={`${sizeClasses[size]} ${platform.color} text-slate-300 hover:text-white transition-all duration-200 hover:scale-110 p-2`}
          onClick={() => window.open(platform.url, '_blank', 'noopener,noreferrer')}
          title={platform.name}
        >
          <platform.icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  );
};

export default SocialMediaIcons;