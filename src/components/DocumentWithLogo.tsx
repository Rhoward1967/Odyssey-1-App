import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface DocumentWithLogoProps {
  title: string;
  content: string;
  companyLogo?: string;
  personalLogo?: string;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  documentType: 'estimate' | 'agreement' | 'invoice' | 'email';
}

const DocumentWithLogo = ({ 
  title, 
  content, 
  companyLogo, 
  personalLogo, 
  companyInfo,
  documentType 
}: DocumentWithLogoProps) => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        {/* Header with logos */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {companyLogo && (
              <img 
                src={companyLogo} 
                alt="Company Logo" 
                className="h-16 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{companyInfo?.name || 'Your Company'}</h1>
              <p className="text-sm text-gray-600">{companyInfo?.address}</p>
              <p className="text-sm text-gray-600">{companyInfo?.phone} • {companyInfo?.email}</p>
            </div>
          </div>
          
          {personalLogo && (
            <div className="text-right">
              <img 
                src={personalLogo} 
                alt="Personal Logo" 
                className="h-12 w-auto object-contain ml-auto mb-2"
              />
              <Badge variant="outline">{documentType.charAt(0).toUpperCase() + documentType.slice(1)}</Badge>
            </div>
          )}
        </div>
        
        <Separator />
        
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
        </div>
        
        {/* Footer with logos for official documents */}
        {(documentType === 'estimate' || documentType === 'agreement' || documentType === 'invoice') && (
          <>
            <Separator className="my-8" />
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center gap-2">
                {companyLogo && (
                  <img 
                    src={companyLogo} 
                    alt="Company Logo" 
                    className="h-6 w-auto object-contain opacity-60"
                  />
                )}
                <span>© {new Date().getFullYear()} {companyInfo?.name || 'Your Company'}</span>
              </div>
              
              {personalLogo && (
                <img 
                  src={personalLogo} 
                  alt="Personal Logo" 
                  className="h-6 w-auto object-contain opacity-60"
                />
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentWithLogo;