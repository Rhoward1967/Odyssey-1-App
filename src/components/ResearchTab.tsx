import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

const ResearchTab: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'huggingface' | 'openai' | 'anthropic' | 'gemini'>('huggingface');

  // Example: Hugging Face sentiment analysis
  const analyzeWithHuggingFace = async (text: string) => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      const res = await fetch('https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text })
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult('Error connecting to Hugging Face API.');
    }
    setLoading(false);
  };

  // Placeholder for other providers
  const analyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (provider === 'huggingface') {
      await analyzeWithHuggingFace(input);
    } else {
      setResult('Provider not yet implemented.');
    }
  };

  return (
    <Card className="bg-white border-blue-100 shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          Research & Sentiment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={analyze} className="flex gap-2 mb-4">
          <input
            className="flex-1 rounded border border-blue-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Enter news headline, tweet, or text..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <select
            className="rounded border border-blue-200 px-2 py-1 text-xs"
            value={provider}
            onChange={e => setProvider(e.target.value as any)}
            disabled={loading}
          >
            <option value="huggingface">Hugging Face</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Gemini</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
        {result && (
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto max-h-48 mt-2 border border-gray-100">{result}</pre>
        )}
      </CardContent>
    </Card>
  );
};

export default ResearchTab;
