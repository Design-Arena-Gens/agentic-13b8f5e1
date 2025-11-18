"use client";

import { useState } from "react";

type PatentResult = {
  source: "USPTO" | "WIPO" | "GOOGLE";
  title: string;
  abstract?: string;
  publication_number?: string;
  publication_date?: string;
  url: string;
};

export default function SearchPanel({ onResults }: { onResults: (r: PatentResult[]) => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      onResults(data.results || []);
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-2">Prior Art Search</h2>
      <p className="text-sm text-gray-600 mb-3">Search USPTO and generate WIPO/Google links.</p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="e.g., methods for federated model updates with differential privacy"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={search} disabled={!query || loading}>{loading ? "Searching..." : "Search"}</button>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </section>
  );
}
