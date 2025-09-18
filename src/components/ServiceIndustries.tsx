import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, GraduationCap, ShoppingBag, Utensils, Factory, Heart } from 'lucide-react';

const industries = [
  {
    icon: Building,
    title: "Corporate Offices",
    image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756815276391_11645a36.webp",
    services: ["Daily Office Cleaning", "Window Washing", "Carpet Care", "Restroom Maintenance"],
    color: "blue"
  },
  {
    icon: Factory,
    title: "Industrial Facilities",
    image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756815280710_9bf88cc3.webp",
    services: ["Equipment Cleaning", "Floor Maintenance", "Waste Management", "Safety Compliance"],
    color: "orange"
  },
  {
    icon: Heart,
    title: "Healthcare",
    image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756815288213_2411af31.webp",
    services: ["Medical Sanitization", "Infection Control", "Biohazard Cleanup", "OSHA Compliance"],
    color: "red"
  },
  {
    icon: GraduationCap,
    title: "Educational",
    image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756815291373_3a5a9b9f.webp",
    services: ["Classroom Cleaning", "Cafeteria Service", "Gym Maintenance", "Summer Deep Clean"],
    color: "green"
  },
  {
    icon: ShoppingBag,
    title: "Retail Spaces",
    image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756815296806_30d9acc8.webp",
    services: ["Store Front Care", "Customer Area Cleaning", "Inventory Space", "Holiday Hours"],
    color: "purple"
  },
  {
    icon: Utensils,
    title: "Food Service",
    image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756815301190_ae02b9ef.webp",
    services: ["Kitchen Deep Clean", "Health Code Compliance", "Grease Trap Service", "Equipment Care"],
    color: "yellow"
  }
];

export default function ServiceIndustries() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">
            Industries We Serve
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Specialized Cleaning Across All Sectors
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From corporate offices to industrial facilities, we deliver tailored cleaning solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, index) => {
            const IconComponent = industry.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border border-gray-200">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={industry.image} 
                    alt={industry.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute top-4 left-4 p-2 rounded-full bg-${industry.color}-100`}>
                    <IconComponent className={`w-5 h-5 text-${industry.color}-600`} />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{industry.title}</h3>
                  <div className="space-y-2">
                    {industry.services.map((service, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <div className={`w-2 h-2 rounded-full bg-${industry.color}-400 mr-2`} />
                        {service}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}