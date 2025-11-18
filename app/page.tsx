"use client";

import { useState } from "react";
import SearchPanel from "@/components/SearchPanel";
import UploadPanel from "@/components/UploadPanel";
import GeneratorPanel from "@/components/GeneratorPanel";
import OutputPanel from "@/components/OutputPanel";

export default function Page() {
  const [priorArt, setPriorArt] = useState<any[]>([]);
  const [sourceText, setSourceText] = useState<string>("");
  const [generated, setGenerated] = useState<any | null>(null);

  return (
    <main className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SearchPanel onResults={setPriorArt} />
        <UploadPanel onText={setSourceText} />
      </div>
      <GeneratorPanel priorArt={priorArt} sourceText={sourceText} onGenerate={setGenerated} />
      <OutputPanel generated={generated} />
    </main>
  );
}
