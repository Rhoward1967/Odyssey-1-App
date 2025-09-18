import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, AlertTriangle } from 'lucide-react';

interface I9Document {
  type: string;
  number: string;
  expiration?: string;
  issuer: string;
}

export default function I9ComplianceSystem() {
  const [documents, setDocuments] = useState<I9Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState('');

  const listADocs = [
    'US Passport', 'Passport Card', 'Permanent Resident Card', 'Employment Authorization Document'
  ];

  const listBDocs = [
    'Driver\'s License', 'State ID Card', 'Military ID', 'Student ID'
  ];

  const listCDocs = [
    'Social Security Card', 'Birth Certificate', 'Tribal Document'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Form I-9 Employment Eligibility Verification</h2>
        <Badge variant="outline" className="text-red-600 border-red-200">
          IRCA 1986 Required
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Document Category</Label>
              <Select value={selectedDoc} onValueChange={setSelectedDoc}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="listA">List A - Identity & Work Authorization</SelectItem>
                  <SelectItem value="listBC">List B (Identity) + List C (Work Auth)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedDoc === 'listA' && (
              <div className="space-y-3">
                <h4 className="font-medium">List A Documents</h4>
                {listADocs.map((doc) => (
                  <div key={doc} className="flex items-center gap-2">
                    <input type="radio" name="listA" value={doc} />
                    <span className="text-sm">{doc}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedDoc === 'listBC' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">List B - Identity Documents</h4>
                  {listBDocs.map((doc) => (
                    <div key={doc} className="flex items-center gap-2">
                      <input type="radio" name="listB" value={doc} />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium">List C - Work Authorization</h4>
                  {listCDocs.map((doc) => (
                    <div key={doc} className="flex items-center gap-2">
                      <input type="radio" name="listC" value={doc} />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Document Number</Label>
                <Input placeholder="Enter document number" />
              </div>
              <div>
                <Label>Expiration Date</Label>
                <Input type="date" />
              </div>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Documents
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>E-Verify Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">DHS & SSA Verification</p>
                <p className="text-sm text-gray-600">Electronic verification required</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>SSA Verification</span>
                <Badge variant="outline" className="text-orange-600">Pending</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>DHS Verification</span>
                <Badge variant="outline" className="text-orange-600">Pending</Badge>
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              Submit to E-Verify
            </Button>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Compliance Warning</p>
                  <p className="text-sm text-red-700">Form I-9 must be completed within 3 business days of hire date. Failure to comply may result in federal fines.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}