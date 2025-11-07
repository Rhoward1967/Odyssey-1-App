import { BookOpen } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const booksData = {
  books: [
    {
      number: 1,
      title: "The Program",
      subtitle: "The Origin and Architecture of Disconnection",
      summary: "Identifies systemic 'programming' as a virus hijacking consciousness"
    },
    {
      number: 2,
      title: "The Echo",
      subtitle: "Deconstructing the Program's Legacy",
      summary: "Exposes 13th Amendment loophole, mass incarceration, economic warfare"
    },
    {
      number: 3,
      title: "The Sovereign Covenant",
      subtitle: "Architecting a Divinely Aligned Future",
      summary: "Governance based on consent, not coercion"
    },
    {
      number: 4,
      title: "The Sovereign's True Collateral",
      subtitle: "The Bond of the People",
      summary: "Financial system as scam; people are the unpaid bond"
    },
    {
      number: 5,
      title: "The Alien Program",
      subtitle: "Deconstructing Frequencies of History, Identity, and Language",
      summary: "Race as manufactured weapon; decolonizing language"
    },
    {
      number: 6,
      title: "The Sovereign's Armory",
      subtitle: "An Exposé and Guide to Reclaiming Divine Intent",
      summary: "Legal defense tools and sovereignty reclamation"
    },
    {
      number: 7,
      title: "The Unveiling",
      subtitle: "How Crypto, Corruption, and AI Proved the Program",
      summary: "Crypto, AI, and corruption proving the thesis"
    }
  ]
};

export const SovereignBooksLibrary: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-purple-400" />
            The Constitutional Framework
          </CardTitle>
          <p className="text-purple-300 text-sm">
            The 7-book series that defines R.O.M.A.N.'s mission and ODYSSEY-1's sovereignty principles
          </p>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {booksData.books.map((book) => (
          <Card key={book.number} className="bg-slate-800/80 border-purple-500/30 hover:border-purple-400/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-purple-300">
                Book {book.number}: {book.title}
              </CardTitle>
              <p className="text-sm text-gray-400">{book.subtitle}</p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">{book.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SovereignBooksLibrary;
