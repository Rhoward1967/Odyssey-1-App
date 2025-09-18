import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Stethoscope, 
  Palette, 
  Scale, 
  Beaker, 
  Building, 
  Users,
  Lightbulb,
  BookOpen,
  Briefcase
} from 'lucide-react';

export default function UniversalApplications() {
  const applications = [
    {
      icon: GraduationCap,
      title: "Education & Learning",
      description: "K-12 students, teachers, universities, online learning",
      color: "text-blue-400",
      bg: "from-blue-900/20 to-cyan-900/20",
      border: "border-blue-500/30",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756953872652_57e68110.webp"
    },
    {
      icon: Stethoscope,
      title: "Healthcare & Medicine",
      description: "Medical professionals, researchers, patient care",
      color: "text-green-400",
      bg: "from-green-900/20 to-emerald-900/20",
      border: "border-green-500/30",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756953876568_e5ebe90b.webp"
    },
    {
      icon: Palette,
      title: "Creative Industries",
      description: "Artists, designers, writers, content creators",
      color: "text-purple-400",
      bg: "from-purple-900/20 to-pink-900/20",
      border: "border-purple-500/30",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756953885123_453a1218.webp"
    },
    {
      icon: Scale,
      title: "Legal & Justice",
      description: "Law students, attorneys, legal researchers, courts",
      color: "text-yellow-400",
      bg: "from-yellow-900/20 to-orange-900/20",
      border: "border-yellow-500/30",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756953878305_3ce069db.webp"
    },
    {
      icon: Beaker,
      title: "Science & Research",
      description: "Scientists, researchers, laboratories, innovation",
      color: "text-cyan-400",
      bg: "from-cyan-900/20 to-blue-900/20",
      border: "border-cyan-500/30",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756953893796_a1265d73.webp"
    },
    {
      icon: Building,
      title: "Enterprise & Business",
      description: "Fortune 500, SMEs, startups, entrepreneurs",
      color: "text-red-400",
      bg: "from-red-900/20 to-rose-900/20",
      border: "border-red-500/30",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756953880077_6c0a8046.webp"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Universal Applications
        </h2>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
          ODYSSEY-1 empowers every individual, organization, and industry with advanced AI capabilities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app, index) => (
          <Card key={index} className={`bg-gradient-to-br ${app.bg} ${app.border} hover:scale-105 transition-transform duration-300`}>
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <app.icon className={`w-8 h-8 ${app.color}`} />
                <Badge className={`${app.color} bg-transparent border-current`}>
                  Universal
                </Badge>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden">
                <img 
                  src={app.image} 
                  alt={app.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className={`${app.color} mb-2`}>{app.title}</CardTitle>
              <p className="text-gray-300 text-sm">{app.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}