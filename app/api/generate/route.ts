import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const InputSchema = z.object({
  title: z.string().optional().default("Untitled Invention"),
  field: z.string().optional().default(""),
  assumptions: z.string().optional().default(""),
  priorArt: z.array(z.any()).optional().default([]),
  sourceText: z.string().optional().default(""),
});

async function generateWithOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Graceful fallback: heuristic structuring without AI
    return {
      abstract: "Please set OPENAI_API_KEY to enable AI generation.",
      background: "",
      summary: "",
      detailedDescription: "",
      claims: { independent: [""], dependent: [] },
      embodiments: [],
      diagramPrompts: ["Block diagram of system components", "Flowchart of method steps"],
    };
  }
  const { OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });
  const sys = `You are an expert patent drafter using precise legal language and structure. Use broadest reasonable interpretation, clear antecedent basis, and proper claim hierarchy. Include embodiments and variations. Output compact, high-quality content.`;
  const user = prompt;
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
  });
  const text = completion.choices[0]?.message?.content || "";
  return parseSections(text);
}

function parseSections(text: string) {
  // Very tolerant parser splitting known headings
  const grab = (label: string) => {
    const re = new RegExp(`(?<=^|\n)#?\s*${label}.*?\n([\s\S]*?)(?=\n#|$)`, "i");
    const m = text.match(re);
    return m ? m[1].trim() : "";
  };
  const abstract = grab("Abstract");
  const background = grab("Background");
  const summary = grab("Summary");
  const detailedDescription = grab("Detailed Description");

  const independentRaw = grab("Independent Claim");
  const dependentRaw = grab("Dependent Claims");
  const embodimentsRaw = grab("Embodiments");
  const diagramsRaw = grab("Diagram Prompts");

  const independent = independentRaw ? independentRaw.split(/\n\n+/).map(s => s.trim()).filter(Boolean) : [];
  const dependent = dependentRaw ? dependentRaw.split(/\n+/).map(s => s.replace(/^[-*]\s*/, "").trim()).filter(Boolean) : [];
  const embodiments = embodimentsRaw ? embodimentsRaw.split(/\n+/).map(s => s.replace(/^[-*]\s*/, "").trim()).filter(Boolean) : [];
  const diagramPrompts = diagramsRaw ? diagramsRaw.split(/\n+/).map(s => s.replace(/^[-*]\s*/, "").trim()).filter(Boolean) : [];

  return { abstract, background, summary, detailedDescription, claims: { independent, dependent }, embodiments, diagramPrompts };
}

export async function POST(req: NextRequest) {
  try {
    const input = InputSchema.parse(await req.json());
    const prompt = buildPrompt(input);
    const out = await generateWithOpenAI(prompt);
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Generation error" }, { status: 500 });
  }
}

function buildPrompt(input: z.infer<typeof InputSchema>) {
  const { title, field, assumptions, priorArt, sourceText } = input;
  const priorArtBullets = (priorArt || []).map((p: any, i: number) => `- ${p.title || p.patent_title || p.publication_number || "Result " + (i+1)}${p.publication_number ? ` (PN: ${p.publication_number})` : ""}${p.publication_date ? `, ${p.publication_date}` : ""}${p.abstract ? `\n  Abstract: ${p.abstract}` : ""}`).join("\n");
  const src = sourceText ? sourceText.slice(0, 6000) : ""; // token guard
  return `Draft a patent specification for: ${title}\nField: ${field}\nAssumptions/constraints: ${assumptions}\n\nConsider the following prior art:\n${priorArtBullets || "- (no prior art provided)"}\n\nSource text (may be unstructured, improve clarity, enforceability):\n${src || "(none)"}\n\nOutput the following labeled sections with crisp, legally sound language:\n# Abstract\n# Background\n# Summary\n# Detailed Description\n# Independent Claim\n- Provide at least one independent apparatus or method claim\n# Dependent Claims\n- 8-15 dependent claims with narrowing limitations\n# Embodiments\n- Bullet list of key embodiments and variations\n# Diagram Prompts\n- Bullet list of precise prompts for diagramming tools`;
}
