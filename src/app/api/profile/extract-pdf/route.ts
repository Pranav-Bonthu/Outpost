import { NextResponse } from "next/server";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { getCurrentUser } from "@/lib/session";
import { MAX_INPUT_CHARS } from "@/lib/resumeMatch";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

async function extractPdfText(data: Uint8Array): Promise<string> {
  const doc = await getDocument({ data }).promise;
  const pageTexts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pageTexts.push(
      content.items.map((item) => ("str" in item ? item.str : "")).join(" ")
    );
  }
  return pageTexts.join("\n").trim();
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Please upload a PDF file." },
      { status: 400 }
    );
  }
  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: "PDF must be 10MB or smaller." },
      { status: 400 }
    );
  }

  let text: string;
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    text = await extractPdfText(data);
  } catch {
    return NextResponse.json(
      { error: "Couldn't read that PDF. Try a different file." },
      { status: 400 }
    );
  }

  if (!text) {
    return NextResponse.json(
      { error: "No text found in that PDF." },
      { status: 400 }
    );
  }
  const truncated = text.length > MAX_INPUT_CHARS;
  if (truncated) {
    text = text.slice(0, MAX_INPUT_CHARS);
  }

  return NextResponse.json({ text, truncated });
}
