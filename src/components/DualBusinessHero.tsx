import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, ArrowRight, Sparkles, Building, Zap, Shield, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VideoUploadManager } from './VideoUploadManager';

export const DualBusinessHero: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('');
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Dual Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-purple-600/20 text-purple-300 border-purple-500/50 text-lg px-6 py-2">
              Multi-Industry AI Solutions
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ODYSSEY-1
              </span>
              {' & '}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Howard Janitorial
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Where Revolutionary AI Technology Meets Every Industry. 
              From healthcare to manufacturing, finance to government - one intelligent platform transforming how businesses operate across all sectors.
            </p>
          </div>

          {/* Business Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Odyssey-1 Card */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30 backdrop-blur-sm overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center relative"
                style={{
                  backgroundImage: `url('https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756773026261_bbeec496.webp')`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <Badge className="bg-purple-600/80 text-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Platform
                  </Badge>
                </div>
               </div>
               <CardContent className="p-6">
                 <h3 className="text-2xl font-bold text-white mb-3">ODYSSEY-1 AI Platform</h3>
                 <p className="text-gray-300 mb-4">
                   Cross-industry AI powerhouse serving healthcare, finance, manufacturing, government, 
                   retail, and beyond. Advanced neural processing, predictive analytics, and intelligent automation for any business sector.
                 </p>
                 <div className="flex gap-3">
                   <Link to="/subscription">
                     <Button className="bg-purple-600 hover:bg-purple-700">
                       <Sparkles className="mr-2 h-4 w-4" />
                       Start Free Trial
                     </Button>
                   </Link>
                 </div>
               </CardContent>
            </Card>

            {/* Howard Janitorial Card */}
            <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30 backdrop-blur-sm overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center relative"
                style={{
                  backgroundImage: `url('https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756773030295_c0efd7da.webp')`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <Badge className="bg-green-600/80 text-white">
                    <Building className="w-4 h-4 mr-2" />
                    Professional Services
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">Howard Janitorial Services</h3>
                <p className="text-gray-300 mb-4">
                  Professional commercial cleaning with government contracting expertise, 
                  SAM registration, and comprehensive facility management.
                </p>
                <div className="flex gap-3">
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setActiveVideo('howard-commercial')}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Commercial
                  </Button>
                  <Link to="/bidding-calculator">
                    <Button variant="outline" className="border-green-500/50 text-green-300 hover:bg-green-900/30">
                      Get Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Modal Placeholder */}
          {activeVideo && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 rounded-lg p-6 max-w-4xl w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Howard Janitorial Commercial</h3>
                  <Button 
                    variant="ghost" 
                    onClick={() => setActiveVideo(null)}
                    className="text-white hover:bg-slate-800"
                  >
                    ×
                  </Button>
                </div>
                <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden">
                  {uploadedVideoUrl ? (
                    <video
                      src={uploadedVideoUrl}
                      controls
                      className="w-full h-full"
                      autoPlay
                      muted
                      playsInline
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <VideoUploadManager
                      title="Upload Howard Janitorial Commercial"
                      onVideoUploaded={setUploadedVideoUrl}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};