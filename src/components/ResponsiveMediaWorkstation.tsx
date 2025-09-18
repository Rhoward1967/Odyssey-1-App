import React from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import MediaWorkstation from './MediaWorkstation';
import MobileMediaWorkstation from './MobileMediaWorkstation';

export default function ResponsiveMediaWorkstation() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return isMobile ? <MobileMediaWorkstation /> : <MediaWorkstation />;
}