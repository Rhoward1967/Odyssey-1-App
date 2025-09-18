import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, MapPin, User } from 'lucide-react';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  photoUrl?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

const ContactPhoneBook: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@howardjanitorial.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Washington DC 20001',
      position: 'Senior Janitor',
      department: 'Federal Buildings',
      emergencyContact: 'Jane Smith',
      emergencyPhone: '(555) 987-6543'
    },
    {
      id: '2',
      name: 'Maria Garcia',
      email: 'maria.garcia@howardjanitorial.com',
      phone: '(555) 234-5678',
      address: '456 Oak Ave, Washington DC 20002',
      position: 'Night Supervisor',
      department: 'County Facilities',
      emergencyContact: 'Carlos Garcia',
      emergencyPhone: '(555) 876-5432'
    },
    {
      id: '3',
      name: 'Robert Johnson',
      email: 'robert.j@howardjanitorial.com',
      phone: '(555) 345-6789',
      address: '789 Pine Rd, Washington DC 20003',
      position: 'Team Lead',
      department: 'State Buildings',
      emergencyContact: 'Linda Johnson',
      emergencyPhone: '(555) 765-4321'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Employee Contact Directory</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, phone, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <Card
            key={contact.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedContact(contact)}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {contact.photoUrl ? (
                  <img src={contact.photoUrl} alt={contact.name} className="w-full h-full rounded-full" />
                ) : (
                  <User className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{contact.name}</h3>
                <p className="text-sm text-gray-600">{contact.position}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {contact.department}
                </Badge>
                
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Contact Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedContact(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{selectedContact.name}</h4>
                  <p className="text-gray-600">{selectedContact.position}</p>
                  <Badge variant="secondary">{selectedContact.department}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedContact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedContact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedContact.address}</span>
                </div>
              </div>

              {selectedContact.emergencyContact && (
                <div className="pt-4 border-t">
                  <h5 className="font-medium mb-2">Emergency Contact</h5>
                  <p className="text-sm">{selectedContact.emergencyContact}</p>
                  <p className="text-sm text-gray-600">{selectedContact.emergencyPhone}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => window.location.href = `tel:${selectedContact.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => window.location.href = `mailto:${selectedContact.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContactPhoneBook;