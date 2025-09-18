import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Shield, Star, Users } from 'lucide-react';

const services = [
  {
    title: "Office Cleaning",
    image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756817373388_fe153a61.webp",
    description: "Complete office maintenance including desks, floors, restrooms, and common areas",
    industries: ["Corporate", "Small Business", "Coworking"],
    features: ["Daily/Weekly", "After Hours", "Eco-Friendly"]
  },
  {
    title: "Industrial Cleaning",
    image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756817376906_79f02c14.webp",
    description: "Heavy-duty cleaning for warehouses, factories, and manufacturing facilities",
    industries: ["Manufacturing", "Warehouses", "Distribution"],
    features: ["Safety Compliant", "Equipment Cleaning", "Floor Care"]
  },
  {
    title: "Medical Facilities",
    image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756817380020_edcb8df7.webp",
    description: "Specialized sanitization for healthcare environments and medical offices",
    industries: ["Hospitals", "Clinics", "Dental Offices"],
    features: ["Medical Grade", "Infection Control", "HIPAA Compliant"]
  }
];

const customerSatisfactionImages = [
  "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756817606364_68bbd164.webp",
  "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756817608174_ba1a75a7.webp",
  "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756817609932_8aa8d867.webp"
];

export const JanitorialServices = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
            Professional Services
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Howard Janitorial Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional cleaning solutions across industries with 40+ years of experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Industries Served:</p>
                  <div className="flex flex-wrap gap-2">
                    {service.industries.map((industry, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Service Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature, idx) => (
                      <Badge key={idx} className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Get Quote
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Customer Satisfaction Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Customer Satisfaction Guaranteed
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Building lasting partnerships through exceptional service quality and professional excellence
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {customerSatisfactionImages.map((image, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg group">
                <img 
                  src={image} 
                  alt={`Customer satisfaction ${index + 1}`}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center text-white">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">Trusted Partnership</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Happy Clients</div>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">40+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600">Insured & Bonded</div>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 text-yellow-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">4.9/5</div>
              <div className="text-sm text-gray-600">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JanitorialServices;