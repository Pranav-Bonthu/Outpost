import { sanitizeUrl } from "@/lib/resumeMatch";

const FETCH_TIMEOUT_MS = 4_000;
// og:image is always in <head>, so a bounded prefix is enough and keeps
// this fast/cheap even against large pages.
const MAX_HTML_BYTES = 300_000;

const META_TAG_RE = /<meta\s+[^>]*>/gi;
const ATTR_RE = /(\w[\w:-]*)\s*=\s*"([^"]*)"|(\w[\w:-]*)\s*=\s*'([^']*)'/g;
const IMAGE_PROPERTY_PRIORITY = [
  "og:image:secure_url",
  "og:image",
  "twitter:image",
  "twitter:image:src",
];

async function fetchHtmlPrefix(url: string): Promise<string | null> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; OutpostLinkPreview/1.0)" },
  });
  if (!res.ok) return null;

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return null;
  if (!res.body) return await res.text();

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let html = "";
  let bytes = 0;
  while (bytes < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    html += decoder.decode(value, { stream: true });
  }
  await reader.cancel().catch(() => {});
  return html;
}

function extractImageUrl(html: string, baseUrl: string): string | null {
  const found: Record<string, string> = {};
  for (const tagMatch of html.matchAll(META_TAG_RE)) {
    const attrs: Record<string, string> = {};
    for (const attrMatch of tagMatch[0].matchAll(ATTR_RE)) {
      const key = (attrMatch[1] ?? attrMatch[3])?.toLowerCase();
      const value = attrMatch[2] ?? attrMatch[4];
      if (key) attrs[key] = value;
    }
    const key = (attrs.property ?? attrs.name)?.toLowerCase();
    if (key && attrs.content) found[key] = attrs.content;
  }

  for (const key of IMAGE_PROPERTY_PRIORITY) {
    const value = found[key];
    if (!value) continue;
    try {
      const resolved = new URL(value, baseUrl).toString();
      const clean = sanitizeUrl(resolved);
      if (clean) return clean;
    } catch {
      // malformed content= value, try the next candidate
    }
  }
  return null;
}

export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const html = await fetchHtmlPrefix(url);
    return html ? extractImageUrl(html, url) : null;
  } catch {
    return null;
  }
}

// Runs all lookups concurrently; a null url resolves instantly with no
// network call. Never rejects — any failure just yields null for that item.
export async function fetchOgImages(
  urls: (string | null)[]
): Promise<(string | null)[]> {
  const settled = await Promise.allSettled(
    urls.map((url) => (url ? fetchOgImage(url) : Promise.resolve(null)))
  );
  return settled.map((r) => (r.status === "fulfilled" ? r.value : null));
}
