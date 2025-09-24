import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (ensure your .env.local file has these)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const AICalculator: React.FC = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return; // Prevent empty submissions

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // CORRECTED: Sending the body with a 'query' property
      const { data, error } = await supabase.functions.invoke("ai-calculator", {
        body: { query: input },
      });

      if (error) throw error;

      // CORRECTED: Looking for the 'answer' property in the response
      setResult(data?.answer ?? "No valid answer returned from the AI.");

    } catch (err: any) {
      setError(err.message || "An unknown error occurred while contacting the AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Ask a financial or calculation question..."
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Calculating..." : "Calculate"}
      </button>
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {result && <div>AI Result: {result}</div>}
    </form>
  );
};

export default AICalculator;