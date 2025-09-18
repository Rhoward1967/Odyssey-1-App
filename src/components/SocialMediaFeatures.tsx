import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Camera, Mic, Video, Share2, MessageSquare, Zap } from 'lucide-react';

const SocialMediaFeatures = () => {
  const features = [
    {
      icon: <Camera className="h-8 w-8" />,
      title: "Smart Camera Integration",
      description: "AI-powered photo analysis, document scanning, and visual learning tools"
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Text-to-Speech Engine",
      description: "Natural voice synthesis for accessibility and content consumption"
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Video Conference AI",
      description: "Real-time transcription, meeting summaries, and collaboration tools"
    },
    {
      icon: <Share2 className="h-8 w-8" />,
      title: "Social Sharing",
      description: "Share insights, collaborate on projects, and build learning communities"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Interactive Chat",
      description: "AI-powered conversations that adapt to your learning style"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Insights",
      description: "Real-time analysis and feedback on your work and ideas"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Social & Media Features</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Built for the Social Generation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Young entrepreneurs and students deserve tools that speak their language. 
            Odyssey combines AI intelligence with social media familiarity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756816867607_57880672.webp"
              alt="Young entrepreneur with social media"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">
              The Future is Social & Sovereign
            </h3>
            <p className="text-lg text-gray-600">
              Young entrepreneurs are the future leaders. They grew up with social media, 
              understand digital sovereignty, and demand tools that are both powerful and intuitive.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">Camera-first design for visual learners</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-gray-700">Voice-enabled for accessibility</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Social sharing built-in</span>
              </div>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Join the Movement
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialMediaFeatures;