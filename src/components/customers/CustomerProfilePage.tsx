import React from 'react';
import CustomerProfile, { CustomerProfileData } from './CustomerProfile';

interface CustomerProfilePageProps {
  customer: CustomerProfileData;
}

const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ customer }) => {
  // In a real app, fetch all related data here (agreements, invoices, jobs, etc.)
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <CustomerProfile customer={customer} />
    </div>
  );
};

export default CustomerProfilePage;
