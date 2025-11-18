import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export const runtime = "nodejs";

async function parsePdf(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default as any;
  const data = await pdfParse(Buffer.from(arrayBuffer));
  return data.text || "";
}

async function parseDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
  return result.value || "";
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const blob = file as File;
    const arrayBuffer = await blob.arrayBuffer();
    const name = blob.name.toLowerCase();

    let text = "";
    if (name.endsWith(".pdf")) text = await parsePdf(arrayBuffer);
    else if (name.endsWith(".docx")) text = await parseDocx(arrayBuffer);
    else if (name.endsWith(".txt")) text = Buffer.from(arrayBuffer).toString("utf8");
    else return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });

    // Basic normalization
    text = text.replace(/[\u0000-\u001F]/g, " ").replace(/\s+$/g, "").trim();
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload error" }, { status: 500 });
  }
}
