import { useContractors, useEngagements } from '@/services/contractorService';
import React, { useState } from 'react';

interface ContractorManagerProps {
  organizationId: number;
}

export const ContractorManager: React.FC<ContractorManagerProps> = ({ organizationId }) => {
  const { contractors, loading, error } = useContractors(organizationId);
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Contractor Management</h2>
      {loading && <div>Loading contractors...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      <ul className="mb-4">
        {contractors.map(c => (
          <li key={c.id} className="mb-2">
            <button className="underline text-blue-600" onClick={() => setSelectedContractor(c.id)}>
              {c.name} ({c.status})
            </button>
          </li>
        ))}
      </ul>
      {selectedContractor && <ContractorEngagements contractorId={selectedContractor} />}
    </div>
  );
};

const ContractorEngagements: React.FC<{ contractorId: string }> = ({ contractorId }) => {
  const { engagements, loading, error } = useEngagements(contractorId);
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Engagements</h3>
      {loading && <div>Loading engagements...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      <ul>
        {engagements.map(e => (
          <li key={e.id} className="mb-2">
            <span className="font-bold">{e.project_name || 'Unnamed Project'}</span> - {e.rate} {e.rate_unit} ({e.is_active ? 'Active' : 'Inactive'})
          </li>
        ))}
      </ul>
    </div>
  );
};
