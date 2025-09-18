import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Image, Trash2, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LogoManagerProps {
  onLogoSelect?: (logoUrl: string, logoType: 'company' | 'personal') => void;
}

const LogoManager = ({ onLogoSelect }: LogoManagerProps) => {
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => 
    localStorage.getItem('companyLogo')
  );
  const [personalLogo, setPersonalLogo] = useState<string | null>(() => 
    localStorage.getItem('personalLogo')
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<'company' | 'personal' | null>(null);
  
  const companyInputRef = useRef<HTMLInputElement>(null);
  const personalInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPG, PNG, and SVG files are allowed';
    }
    
    return null;
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (file: File, type: 'company' | 'personal') => {
    setError(null);
    setSuccess(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    try {
      // Convert to base64 for local storage (no server required)
      const base64 = await convertToBase64(file);
      
      // Store in local state and localStorage
      if (type === 'company') {
        setCompanyLogo(base64);
        localStorage.setItem('companyLogo', base64);
      } else {
        setPersonalLogo(base64);
        localStorage.setItem('personalLogo', base64);
      }

      onLogoSelect?.(base64, type);
      setSuccess(`${type === 'company' ? 'Company' : 'Personal'} logo uploaded successfully!`);
    } catch (error: any) {
      console.error('Error processing logo:', error);
      setError('Failed to process logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent, type: 'company' | 'personal') => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, type: 'company' | 'personal') => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0], type);
    }
  };

  const removeLogo = (type: 'company' | 'personal') => {
    if (type === 'company') {
      setCompanyLogo(null);
      localStorage.removeItem('companyLogo');
    } else {
      setPersonalLogo(null);
      localStorage.removeItem('personalLogo');
    }
    setSuccess(`${type === 'company' ? 'Company' : 'Personal'} logo removed`);
  };

  const LogoUploadArea = ({ type, logo, inputRef }: { 
    type: 'company' | 'personal', 
    logo: string | null, 
    inputRef: React.RefObject<HTMLInputElement> 
  }) => (
    <>
      {logo ? (
        <div className="border rounded-lg p-4 bg-gray-50">
          <img 
            src={logo} 
            alt={`${type} Logo`} 
            className="max-h-24 mx-auto mb-3 object-contain"
          />
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => window.open(logo, '_blank')}>
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={() => removeLogo(type)}>
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver === type 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => handleDragOver(e, type)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, type)}
        >
          <Upload className={`w-12 h-12 mx-auto mb-3 ${
            dragOver === type ? 'text-blue-500' : 'text-gray-400'
          }`} />
          <p className="text-sm text-gray-600 mb-3">
            {dragOver === type 
              ? 'Drop your logo here!' 
              : `Drag & drop your ${type} logo here, or click to browse`
            }
          </p>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], type)}
            className="hidden"
            ref={inputRef}
          />
          <Button 
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={type === 'company' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            variant={type === 'company' ? 'default' : 'outline'}
          >
            {uploading ? 'Processing...' : 'Choose File'}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Logo Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Company Logo Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Company Logo</Label>
            <Badge variant="secondary">Official Branding</Badge>
          </div>
          <LogoUploadArea type="company" logo={companyLogo} inputRef={companyInputRef} />
        </div>

        <Separator />

        {/* Personal Logo Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Personal Logo</Label>
            <Badge variant="outline">Individual Use</Badge>
          </div>
          <LogoUploadArea type="personal" logo={personalLogo} inputRef={personalInputRef} />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Logo Storage Info</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Logos stored locally in your browser</li>
            <li>• Max file size: 5MB</li>
            <li>• Formats: JPG, PNG, SVG</li>
            <li>• Available across all app features</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoManager;