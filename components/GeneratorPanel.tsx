"use client";

import { useState } from "react";

type GeneratorPanelProps = {
  priorArt: any[];
  sourceText: string;
  onGenerate: (data: any) => void;
};

export default function GeneratorPanel({ priorArt, sourceText, onGenerate }: GeneratorPanelProps) {
  const [title, setTitle] = useState("");
  const [field, setField] = useState("");
  const [assumptions, setAssumptions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, field, assumptions, priorArt, sourceText }),
      });
      const data = await res.json();
      onGenerate(data);
    } catch (e: any) {
      setError(e?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-3">Generate Patent Draft</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <input type="text" placeholder="Working title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Technical field (e.g., ML, biotech)" value={field} onChange={(e) => setField(e.target.value)} />
        <input type="text" placeholder="Constraints/assumptions" value={assumptions} onChange={(e) => setAssumptions(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate"}</button>
        <span className="text-xs text-gray-600">Uses prior art and uploaded text as context.</span>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </section>
  );
}
