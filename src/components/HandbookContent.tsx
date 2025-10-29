import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HandbookContentProps {
  activeSection?: string;
}

export default function HandbookContent({ activeSection = 'cover' }: HandbookContentProps) {
  const handbookSections = {
    cover: {
      title: 'HJS Services LLC Employee Handbook',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Employee Handbook</h1>
            <h2 className="text-2xl text-blue-600 mb-2">HJS Services LLC</h2>
            <p className="text-gray-600">Howard Janitorial Services</p>
            <Badge className="mt-4">Updated September 2024</Badge>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Company Information</h3>
            <ul className="space-y-1 text-sm">
              <li>• 36+ years of professional janitorial services</li>
              <li>• BBB Accredited Business</li>
              <li>• Amazon Certified Service Provider</li>
              <li>• Athens Chamber of Commerce Member</li>
            </ul>
          </div>
        </div>
      )
    },
    welcome: {
      title: 'Welcome Message',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Welcome to HJS Services LLC</h2>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Message from Christla Howard, CEO</h3>
            <p className="text-gray-700 leading-relaxed">
              Welcome to the HJS Services family! For over 36 years, we have been committed to 
              providing exceptional janitorial services while maintaining the highest standards 
              of professionalism and integrity. As a new team member, you are now part of a 
              legacy of excellence that has earned us recognition as a BBB Accredited Business 
              and Amazon Certified Service Provider.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Our Mission</h3>
            <p>To provide superior cleaning and maintenance services that exceed our clients' expectations.</p>
            <h3 className="font-semibold">Our Values</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Integrity in all our business dealings</li>
              <li>Excellence in service delivery</li>
              <li>Respect for our employees and clients</li>
              <li>Commitment to continuous improvement</li>
            </ul>
          </div>
        </div>
      )
    },
    about: {
      title: 'About This Manual',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">About This Employee Handbook</h2>
          <p className="text-gray-700">
            This handbook contains important information about your employment with HJS Services LLC. 
            Please read it carefully and keep it for future reference.
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Important Note</h3>
            <p className="text-sm">
              This handbook is not a contract of employment. Employment with HJS Services LLC 
              is at-will, meaning either party may terminate the employment relationship at any time.
            </p>
          </div>
        </div>
      )
    }
  };

  const currentSection = handbookSections[activeSection as keyof typeof handbookSections] || handbookSections.cover;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentSection.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {currentSection.content}
      </CardContent>
    </Card>
  );
}