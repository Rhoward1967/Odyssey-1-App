import React, { useState, useEffect } from 'react';
import BulkUploadServices from './BulkUploadServices';
import { supabase } from '@/lib/supabaseClient';

type Service = {
  id: string;
  name: string;
  sku?: string;
  default_rate?: number;
};

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
    if (error) setError(error.message);
    else setServices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>Service & Product Manager</h1>
      <BulkUploadServices table='services' onComplete={fetchServices} />
      <div className='mt-8'>
        <h2 className='text-xl font-semibold mb-2'>
          Current Services/Products
        </h2>
        {loading ? (
          <div className='p-4 text-gray-500'>Loading...</div>
        ) : error ? (
          <div className='p-4 text-red-600'>{error}</div>
        ) : services.length === 0 ? (
          <div className='p-4 text-gray-400'>No services/products found.</div>
        ) : (
          <div className='overflow-x-auto border rounded'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr>
                  <th className='px-3 py-2 border-b bg-gray-50'>Name</th>
                  <th className='px-3 py-2 border-b bg-gray-50'>SKU</th>
                  <th className='px-3 py-2 border-b bg-gray-50'>
                    Default Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} className='odd:bg-gray-50'>
                    <td className='px-3 py-2 border-b'>{s.name}</td>
                    <td className='px-3 py-2 border-b'>{s.sku}</td>
                    <td className='px-3 py-2 border-b'>{s.default_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
