import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { User, MapPin, Phone, Calendar, Building, Award, Globe } from 'lucide-react';

interface HandbookContentProps {
  activeSection: string;
}

const HandbookContent: React.FC<HandbookContentProps> = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'cover':
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-blue-900">HJS SERVICES LLC</h1>
                <p className="text-xl text-gray-700">dba Howard Janitorial Services</p>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>P.O BOX 80054, ATHENS GA 30606</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>800-403-8492</span>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Employee Handbook
                </Badge>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Updated 09/01/2024</span>
                </div>
                <Separator />
                <div className="text-center">
                  <p className="font-semibold text-gray-700">Central Supply</p>
                  <p className="text-gray-600">159 Oneta Street Athens GA 30601</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        );

      case 'welcome':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900">Welcome to Howard Janitorial Services</CardTitle>
              <div className="flex items-center gap-3 mt-4">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-lg">Christla Howard</h3>
                  <p className="text-gray-600">President/CEO</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Hi, I'm Christla Howard, and I want to welcome you personally to Howard Janitorial Services. 
                I believe you'll find that we are at the forefront of Janitorial Services. Here, we master our 
                trade with conviction and determination, always striving to do the job right the first time, 
                satisfying the cleaning needs of all our clients.
              </p>
              
               <div className="bg-blue-50 p-4 rounded-lg">
                 <h4 className="font-semibold text-blue-900 mb-2">Company Achievements</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                   <Badge variant="secondary" className="justify-start">
                     <Award className="h-3 w-3 mr-1" />
                     36+ Years Experience
                   </Badge>
                   <Badge variant="secondary" className="justify-start">
                     <Building className="h-3 w-3 mr-1" />
                     SAM.GOV Registered
                   </Badge>
                   <Badge variant="secondary" className="justify-start">
                     <Award className="h-3 w-3 mr-1" />
                     BBB Accredited
                   </Badge>
                   <Badge variant="secondary" className="justify-start">
                     <Globe className="h-3 w-3 mr-1" />
                     Amazon Certified
                   </Badge>
                 </div>
               </div>

               <p className="text-gray-700 leading-relaxed">
                 For over 36 years, Howard Janitorial Services has consistently provided clients with the best 
                 in quality cleaning. We are registered with SAM.GOV, the Georgia Marketplace, and Athens Clarke County. 
                 We are BBB Accredited, an Amazon Accredited seller, and a member of the Athens Chamber of Commerce.
               </p>

               <Separator />

               <div className="bg-gray-50 p-4 rounded-lg">
                 <h4 className="font-semibold text-gray-900 mb-2">Our Vision & Mission</h4>
                 <p className="text-gray-700 text-sm leading-relaxed">
                   Our vision, as our founder Rickey A. Howard set out to accomplish, was the ambitious goal of creating 
                   the best cleaning service in the country, servicing the Federal and State sectors. That goal continues today.
                 </p>
               </div>

               <div className="bg-green-50 p-4 rounded-lg">
                 <h4 className="font-semibold text-green-900 mb-2">Training & Education</h4>
                 <p className="text-green-700 text-sm leading-relaxed">
                   We educate our team members in OSHA, Bloodborne Pathogens, HIPAA, floor care, construction cleaning, 
                   safety, and many other safety guidelines, regulations, and training we offer.
                 </p>
               </div>

               <div className="text-center pt-4">
                 <p className="text-sm text-gray-600">
                   Visit us at: <span className="font-semibold text-blue-600">www.howardjanitorial.net</span>
                 </p>
               </div>
             </CardContent>
           </Card>
         );

       case 'about':
         return (
           <Card>
             <CardHeader>
               <CardTitle className="text-2xl text-blue-900">About This Manual/Facility Operations</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <p className="text-gray-700 leading-relaxed">
                 Welcome to HJS Facility Operations. We welcome you to our family. At Facility Operations, 
                 it is our duty to serve our clients with honor, integrity, and trust. This is required of 
                 management and all employees of this company.
               </p>
               
               <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                 <h4 className="font-semibold text-yellow-900 mb-2">Important Notice</h4>
                 <p className="text-yellow-800 text-sm">
                   Because we operate 24 hours a day, all employees or subcontractors are considered and 
                   recognized by agreement as on-call workers. All employees shall be considered and 
                   scheduled as needed for services by HJS.
                 </p>
               </div>

               <div className="bg-blue-50 p-4 rounded-lg">
                 <h4 className="font-semibold text-blue-900 mb-2">Employment Status</h4>
                 <p className="text-blue-800 text-sm">
                   All employees carry the status of temporary employees of HJS SERVICES LLC dba Howard Janitorial Services.
                 </p>
               </div>

               <div className="bg-gray-50 p-4 rounded-lg">
                 <h4 className="font-semibold text-gray-900 mb-2">Management Structure</h4>
                 <p className="text-gray-700 text-sm">
                   All facility workers are under the management of the Director of Facility Operations, 
                   the NE GA Area Supervisor, and the Senior Inspector. These officers are responsible for 
                   the policy enforcement and management of all staff assigned to any facility.
                 </p>
               </div>
             </CardContent>
           </Card>
         );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Section Under Development</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">This section is being updated. Please check back soon.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
};

export default HandbookContent;