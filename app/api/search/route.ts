import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function searchUSPTO(query: string) {
  const fields = [
    "patent_number",
    "patent_title",
    "patent_date",
    "patent_abstract",
    "patent_type",
    "application_number",
  ];
  const url = new URL("https://api.patentsview.org/patents/query");
  const q = { _text_any: { patent_abstract: query, patent_title: query } } as any;
  url.searchParams.set("q", JSON.stringify(q));
  url.searchParams.set("f", JSON.stringify(fields));
  url.searchParams.set("o", JSON.stringify({ per_page: 10 }));

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error("USPTO search failed");
  const json = await resp.json();
  const list = (json?.patents || []).map((p: any) => ({
    source: "USPTO" as const,
    title: p.patent_title,
    abstract: p.patent_abstract,
    publication_number: p.patent_number,
    publication_date: p.patent_date,
    url: `https://patents.google.com/patent/US${p.patent_number}`,
  }));
  return list;
}

function externalLinks(query: string) {
  const q = encodeURIComponent(query);
  return [
    {
      source: "WIPO" as const,
      title: `WIPO Patentscope search: ${query}`,
      url: `https://patentscope.wipo.int/search/en/result.jsf?q=${q}`,
    },
    {
      source: "GOOGLE" as const,
      title: `Google Patents search: ${query}`,
      url: `https://patents.google.com/?q=${q}`,
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }
    const [uspto] = await Promise.all([searchUSPTO(query)]);
    const results = [...uspto, ...externalLinks(query)];
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Search error" }, { status: 500 });
  }
}
