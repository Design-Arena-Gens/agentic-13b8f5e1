"use client";

import { useState } from "react";

export default function UploadPanel({ onText }: { onText: (t: string) => void }) {
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      onText(data.text || "");
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-2">Upload Patent Document</h2>
      <p className="text-sm text-gray-600 mb-3">PDF, DOCX, or TXT to extract text for improvement.</p>
      <div className="flex items-center gap-2">
        <input type="file" accept=".pdf,.docx,.txt" onChange={onUpload} />
        {loading && <span className="text-sm">Parsing...</span>}
      </div>
      {fileName && <p className="text-xs text-gray-600 mt-1">Selected: {fileName}</p>}
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </section>
  );
}
