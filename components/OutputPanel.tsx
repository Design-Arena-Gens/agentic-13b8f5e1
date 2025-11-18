"use client";

import { useMemo, useState } from "react";

export default function OutputPanel({ generated }: { generated: any | null }) {
  const [copied, setCopied] = useState(false);

  const combinedMarkdown = useMemo(() => {
    if (!generated) return "";
    const parts: string[] = [];
    const push = (label: string, value?: string) => {
      if (value) parts.push(`# ${label}\n\n${value.trim()}\n`);
    };
    push("Abstract", generated?.abstract);
    push("Background / Prior Art", generated?.background);
    push("Summary of the Invention", generated?.summary);
    push("Detailed Description", generated?.detailedDescription);
    push("Independent Claim", generated?.claims?.independent?.join("\n\n"));
    push("Dependent Claims", (generated?.claims?.dependent || []).map((c: string) => `- ${c}`).join("\n"));
    push("Embodiments / Variations", (generated?.embodiments || []).map((e: string) => `- ${e}`).join("\n"));
    push("Diagram Prompts", (generated?.diagramPrompts || []).map((d: string) => `- ${d}`).join("\n"));
    return parts.join("\n");
  }, [generated]);

  const copy = async () => {
    if (!combinedMarkdown) return;
    await navigator.clipboard.writeText(combinedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!generated) return null;

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Draft Output</h2>
        <div className="flex gap-2">
          <button onClick={copy}>{copied ? "Copied" : "Copy Markdown"}</button>
          <a
            className="px-3 py-2 rounded-md border"
            href={`data:text/markdown;charset=utf-8,${encodeURIComponent(combinedMarkdown)}`}
            download="patent-draft.md"
          >
            Download .md
          </a>
        </div>
      </div>
      <pre className="whitespace-pre-wrap text-sm leading-6">{combinedMarkdown}</pre>
    </section>
  );
}
