import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Zap, Shield, Users, Building, Award, Clock, 
  CheckCircle, Star, ArrowRight 
} from 'lucide-react';

export const BusinessShowcase: React.FC = () => {
  const odysseyFeatures = [
    { icon: Zap, title: 'Universal AI Engine', desc: 'Adapts to any industry - healthcare, finance, manufacturing, retail' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Bank-level protection across all business sectors' },
    { icon: Users, title: 'Cross-Industry Teams', desc: 'Collaborative workflows for diverse business environments' }
  ];

  const janitoralFeatures = [
    { icon: Building, title: 'Commercial Expertise', desc: 'Government & corporate contracts' },
    { icon: Award, title: 'SAM Registered', desc: 'Federal contracting certified' },
    { icon: Clock, title: '24/7 Service', desc: 'Flexible scheduling available' }
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Operations Director',
      company: 'TechCorp Solutions',
      image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756773033587_19f0753b.webp',
      quote: 'ODYSSEY-1 transformed our entire business workflow. The AI capabilities are incredible.',
      service: 'odyssey'
    },
    {
      name: 'Robert Chen',
      role: 'Facility Manager',
      company: 'Downtown Office Complex',
      image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756773035312_af0989aa.webp',
      quote: 'Howard Janitorial provides exceptional service. Our building has never looked better.',
      service: 'janitorial'
    },
    {
      name: 'Lisa Rodriguez',
      role: 'CEO',
      company: 'Innovation Labs',
      image: 'https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756773037316_f56d102c.webp',
      quote: 'Using both services creates perfect synergy - AI efficiency and spotless facilities.',
      service: 'both'
    }
  ];

  return (
    <div className="py-20 bg-slate-900/50">
      <div className="container mx-auto px-4">
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              AI Solutions Across Every Industry
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              ODYSSEY-1 powers businesses in healthcare, finance, manufacturing, government, retail, and more. 
              Plus professional facility management to keep your operations running smoothly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Odyssey-1 Features */}
            <div>
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">ODYSSEY-1 AI Platform</h3>
              </div>
              <div className="space-y-4">
                {odysseyFeatures.map((feature, index) => (
                  <Card key={index} className="bg-slate-800/50 border-purple-500/20">
                    <CardContent className="p-4 flex items-center">
                      <feature.icon className="h-8 w-8 text-purple-400 mr-4" />
                      <div>
                        <h4 className="text-white font-semibold">{feature.title}</h4>
                        <p className="text-gray-400 text-sm">{feature.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Howard Janitorial Features */}
            <div>
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mr-4">
                  <Building className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Howard Janitorial Services</h3>
              </div>
              <div className="space-y-4">
                {janitoralFeatures.map((feature, index) => (
                  <Card key={index} className="bg-slate-800/50 border-green-500/20">
                    <CardContent className="p-4 flex items-center">
                      <feature.icon className="h-8 w-8 text-green-400 mr-4" />
                      <div>
                        <h4 className="text-white font-semibold">{feature.title}</h4>
                        <p className="text-gray-400 text-sm">{feature.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-300">
              See what our clients say about our services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h4 className="text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                      <p className="text-gray-500 text-xs">{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                  <Badge 
                    className={`mt-3 ${
                      testimonial.service === 'odyssey' ? 'bg-purple-600/20 text-purple-300' :
                      testimonial.service === 'janitorial' ? 'bg-green-600/20 text-green-300' :
                      'bg-blue-600/20 text-blue-300'
                    }`}
                  >
                    {testimonial.service === 'both' ? 'Both Services' : 
                     testimonial.service === 'odyssey' ? 'ODYSSEY-1' : 'Janitorial'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-purple-900/50 to-green-900/50 border-purple-500/30">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Experience the power of advanced AI technology and professional facility management. 
                Start with either service or combine both for maximum impact.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/subscription">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-4">
                    Try ODYSSEY-1 Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/cleaning-quote">
                  <Button size="lg" variant="outline" className="border-green-500/50 text-green-300 hover:bg-green-900/30 px-8 py-4">
                    Get Cleaning Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-gray-400 mt-6">
                No contracts required • Flexible scheduling • Professional results guaranteed
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default BusinessShowcase;