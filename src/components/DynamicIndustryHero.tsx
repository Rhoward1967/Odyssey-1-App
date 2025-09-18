import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, ArrowRight, Sparkles, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VideoUploadManager } from './VideoUploadManager';

const industries = [
  { name: 'Healthcare', icon: '🏥', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756814512437_a26a1bdb.webp', color: 'from-blue-900/50 to-cyan-900/50', borderColor: 'border-blue-500/30', badgeColor: 'bg-blue-600/80', description: 'AI-powered diagnostics, patient care optimization, and medical research acceleration', revenue: '$2.5M avg', roi: '340%' },
  { name: 'Manufacturing', icon: '🏭', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756814516284_6ef38b1f.webp', color: 'from-orange-900/50 to-red-900/50', borderColor: 'border-orange-500/30', badgeColor: 'bg-orange-600/80', description: 'Intelligent automation, predictive maintenance, and supply chain optimization', revenue: '$4.2M avg', roi: '425%' },
  { name: 'Finance', icon: '💼', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756814522317_a5dcd60e.webp', color: 'from-yellow-900/50 to-amber-900/50', borderColor: 'border-yellow-500/30', badgeColor: 'bg-yellow-600/80', description: 'Advanced trading algorithms, risk analysis, and financial forecasting', revenue: '$8.1M avg', roi: '520%' },
  { name: 'Retail', icon: '🛍️', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756814525707_9e148509.webp', color: 'from-green-900/50 to-emerald-900/50', borderColor: 'border-green-500/30', badgeColor: 'bg-green-600/80', description: 'Smart inventory management, customer analytics, and personalized experiences', revenue: '$3.7M avg', roi: '380%' },
  { name: 'Government', icon: '🏛️', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756814531069_9c9c93c5.webp', color: 'from-indigo-900/50 to-purple-900/50', borderColor: 'border-indigo-500/30', badgeColor: 'bg-indigo-600/80', description: 'Citizen services automation, policy analysis, and administrative efficiency', revenue: '$12.5M avg', roi: '290%' },
  { name: 'Logistics', icon: '🚚', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756814534214_1c74ef2a.webp', color: 'from-teal-900/50 to-blue-900/50', borderColor: 'border-teal-500/30', badgeColor: 'bg-teal-600/80', description: 'Route optimization, warehouse automation, and supply chain intelligence', revenue: '$5.8M avg', roi: '445%' },
  { name: 'Education', icon: '🎓', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756846002534_ccf9c191.webp', color: 'from-purple-900/50 to-pink-900/50', borderColor: 'border-purple-500/30', badgeColor: 'bg-purple-600/80', description: 'Personalized learning, administrative automation, and student analytics', revenue: '$1.8M avg', roi: '310%' },
  { name: 'Real Estate', icon: '🏠', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756846005702_b38b4a07.webp', color: 'from-emerald-900/50 to-teal-900/50', borderColor: 'border-emerald-500/30', badgeColor: 'bg-emerald-600/80', description: 'Property valuation, market analysis, and client relationship management', revenue: '$6.2M avg', roi: '385%' },
  { name: 'Hospitality', icon: '🏨', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756846011054_87af909c.webp', color: 'from-rose-900/50 to-orange-900/50', borderColor: 'border-rose-500/30', badgeColor: 'bg-rose-600/80', description: 'Guest experience optimization, revenue management, and operational efficiency', revenue: '$3.4M avg', roi: '360%' },
  { name: 'Agriculture', icon: '🌾', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756846014948_8182bd69.webp', color: 'from-lime-900/50 to-green-900/50', borderColor: 'border-lime-500/30', badgeColor: 'bg-lime-600/80', description: 'Precision farming, crop monitoring, and yield optimization', revenue: '$2.9M avg', roi: '325%' },
  { name: 'Energy', icon: '⚡', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756846021412_35e6eedc.webp', color: 'from-cyan-900/50 to-blue-900/50', borderColor: 'border-cyan-500/30', badgeColor: 'bg-cyan-600/80', description: 'Smart grid management, renewable energy optimization, and demand forecasting', revenue: '$15.7M avg', roi: '480%' },
  { name: 'Automotive', icon: '🚗', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756846025493_ad5fad69.webp', color: 'from-slate-900/50 to-gray-900/50', borderColor: 'border-slate-500/30', badgeColor: 'bg-slate-600/80', description: 'Autonomous systems, predictive maintenance, and supply chain optimization', revenue: '$9.3M avg', roi: '410%' },
  { name: 'Telecommunications', icon: '📡', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756846028491_764f7457.webp', color: 'from-violet-900/50 to-purple-900/50', borderColor: 'border-violet-500/30', badgeColor: 'bg-violet-600/80', description: 'Network optimization, customer service automation, and infrastructure management', revenue: '$11.2M avg', roi: '395%' },
  { name: 'Media', icon: '🎬', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756846031888_2e80d62d.webp', color: 'from-fuchsia-900/50 to-pink-900/50', borderColor: 'border-fuchsia-500/30', badgeColor: 'bg-fuchsia-600/80', description: 'Content creation, audience analytics, and distribution optimization', revenue: '$4.6M avg', roi: '355%' },
  { name: 'Construction', icon: '🏗️', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756846036084_1bc7a810.webp', color: 'from-amber-900/50 to-yellow-900/50', borderColor: 'border-amber-500/30', badgeColor: 'bg-amber-600/80', description: 'Project management, safety monitoring, and resource optimization', revenue: '$7.4M avg', roi: '370%' },
  { name: 'Startups', icon: '🚀', image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756815032705_26edb6a2.webp', color: 'from-pink-900/50 to-violet-900/50', borderColor: 'border-pink-500/30', badgeColor: 'bg-pink-600/80', description: 'MVP development acceleration, market analysis, and growth optimization', revenue: '$850K avg', roi: '280%' }
];

export const DynamicIndustryHero: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('');
  const [currentIndustry, setCurrentIndustry] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndustry((prev) => (prev + 1) % industries.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const industry = industries[currentIndustry];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className={`bg-gradient-to-br ${industry.color} ${industry.borderColor} backdrop-blur-sm overflow-hidden transition-all duration-1000`}>
              <div 
                className="h-48 bg-cover bg-center relative transition-all duration-1000"
                style={{ backgroundImage: `url('${industry.image}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <Badge className={`${industry.badgeColor} text-white transition-all duration-500`}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {industry.name} AI
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">ODYSSEY-1 for {industry.name}</h3>
                <p className="text-gray-300 mb-4">{industry.description}</p>
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
                  <Link to="/cleaning-quote">
                    <Button variant="outline" className="border-green-500/50 text-green-300 hover:bg-green-900/30">
                      Get Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

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