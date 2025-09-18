import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  School, 
  UserCheck,
  Crown,
  Zap
} from 'lucide-react';

export default function TargetAudiences() {
  const audiences = [
    {
      icon: School,
      title: "Educational Institutions",
      subtitle: "K-12 Schools • Universities • Training Centers",
      features: ["Student Learning", "Teacher Tools", "Research Support", "Administrative AI"],
      color: "text-blue-400",
      bg: "from-blue-900/10 to-blue-800/10"
    },
    {
      icon: Crown,
      title: "Fortune 500 Companies",
      subtitle: "Enterprise • Corporations • Global Organizations",
      features: ["Strategic AI", "Operations", "Innovation", "Competitive Edge"],
      color: "text-purple-400",
      bg: "from-purple-900/10 to-purple-800/10"
    },
    {
      icon: Building2,
      title: "Small & Medium Business",
      subtitle: "Startups • SMEs • Local Business",
      features: ["Growth AI", "Efficiency", "Automation", "Cost Savings"],
      color: "text-green-400",
      bg: "from-green-900/10 to-green-800/10"
    },
    {
      icon: UserCheck,
      title: "Individual Professionals",
      subtitle: "Freelancers • Consultants • Specialists",
      features: ["Personal AI", "Productivity", "Creativity", "Learning"],
      color: "text-orange-400",
      bg: "from-orange-900/10 to-orange-800/10"
    },
    {
      icon: Users,
      title: "Creative Professionals",
      subtitle: "Artists • Writers • Designers • Musicians",
      features: ["Creative AI", "Inspiration", "Tools", "Collaboration"],
      color: "text-pink-400",
      bg: "from-pink-900/10 to-pink-800/10"
    },
    {
      icon: Zap,
      title: "Everyone Else",
      subtitle: "Students • Hobbyists • Curious Minds",
      features: ["Accessible AI", "Learning", "Exploration", "Growth"],
      color: "text-cyan-400",
      bg: "from-cyan-900/10 to-cyan-800/10"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">
          Built for Everyone
        </h2>
        <p className="text-gray-300 max-w-3xl mx-auto">
          From individual creators to Fortune 500 companies, ODYSSEY-1 scales to meet every need
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {audiences.map((audience, index) => (
          <Card key={index} className={`bg-gradient-to-br ${audience.bg} border-gray-700/50 hover:border-gray-600 transition-all duration-300`}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <audience.icon className={`w-8 h-8 ${audience.color}`} />
                <Badge variant="outline" className={`${audience.color} border-current`}>
                  Target
                </Badge>
              </div>
              
              <div>
                <h3 className={`font-bold text-lg ${audience.color} mb-1`}>
                  {audience.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {audience.subtitle}
                </p>
              </div>

              <div className="space-y-2">
                {audience.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${audience.color.replace('text-', 'bg-')}`} />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}