import { BookCrossReferenceMap } from '@/components/BookCrossReferenceMap';
import { BookLivingIntelligence } from '@/components/BookLivingIntelligence';
import { BookProvenanceExport } from '@/components/BookProvenanceExport';
import { SovereignBooksLibrary } from '@/components/SovereignBooksLibrary';
import { useState } from 'react';

const TABS = [
  { id: 'library',      label: '📚 Library' },
  { id: 'intelligence', label: '🧠 Intelligence' },
  { id: 'crossref',     label: '🔗 Cross-Reference' },
  { id: 'provenance',   label: '🔐 Provenance' },
];

export default function SovereignBooks() {
  const [activeTab, setActiveTab] = useState('library');

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-0 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-1">Sovereign Self Series</h1>
        <p className="text-sm text-gray-400 mb-4">8-Book System · Howard Jones Bloodline Ancestral Trust</p>
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm rounded-t-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'library'      && <SovereignBooksLibrary />}
        {activeTab === 'intelligence' && <BookLivingIntelligence />}
        {activeTab === 'crossref'     && <BookCrossReferenceMap />}
        {activeTab === 'provenance'   && <BookProvenanceExport />}
      </div>
    </div>
  );
}
