/**
 * Customer Management Page
 * © 2025 Rickey A Howard. All Rights Reserved.
 */

import CustomerProfileModal from '@/components/CustomerProfileModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Users } from 'lucide-react';
import { useState } from 'react';

export default function CustomerManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  
  // Save handler: uses flat schema matching database
  const handleSave = async (form) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in first');
      return;
    }

    const customer = {
      first_name: form.first_name || '',
      last_name: form.last_name || '',
      company_name: form.organization || form.company_name || '',
      email: form.emails?.[0] || form.email || '',
      phone: form.phones?.[0] || form.phone || '',
      address: form.addresses?.[0]?.street || form.address || '',
      billing_city: form.addresses?.[0]?.city || form.billing_city || '',
      billing_state: form.addresses?.[0]?.state || form.billing_state || '',
      billing_zip: form.addresses?.[0]?.postal_code || form.billing_zip || '',
      customer_name: form.organization || `${form.first_name || ''} ${form.last_name || ''}`.trim(),
      status: 'active',
      source: 'customer_management',
      user_id: user.id
    };

    const { error } = await supabase
      .from('customers')
      .insert([customer]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Client profile saved!');
      setModalOpen(false);
    }
  };
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Customer Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
            onClick={() => setModalOpen(true)}
          >
            Add New Client
          </button>
          <p className="text-gray-600 mb-4">
            Add, edit, and manage client profiles here. Use Workforce → Clients tab for complete client management.
          </p>
        </CardContent>
      </Card>
      <CustomerProfileModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}
