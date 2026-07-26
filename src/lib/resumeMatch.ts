import Anthropic from "@anthropic-ai/sdk";
import { fetchOgImages } from "@/lib/linkPreview";

export const MAX_INPUT_CHARS = 20000;

export type AdviceItem = {
  kind: "project" | "certification" | "resource";
  title: string;
  timeEstimate: string;
  text: string;
  resourceTitle: string | null;
  resourceUrl: string | null;
  resourceImageUrl: string | null;
};

export type ResumeMatchResult = {
  jobTitle: string | null;
  matchingSkills: string[];
  missingSkills: string[];
  advice: AdviceItem[];
};

// The shared shape fed to the results slideshow, whether it comes from a
// freshly completed check (streamed "done" event) or a past analysis
// fetched server-side — createdAt is always an ISO string in both paths.
export type ResumeAnalysisSummary = {
  id: string;
  jobTitle: string | null;
  matchingSkills: string[];
  missingSkills: string[];
  advice: AdviceItem[];
  createdAt: string;
};

// Fills defaults for rows saved before title/timeEstimate/resourceImageUrl
// existed, so old ResumeAnalysis rows render instead of crashing.
export function normalizeAdviceItem(item: Partial<AdviceItem>): AdviceItem {
  return {
    kind: item.kind ?? "resource",
    title: item.title ?? (item.text ? item.text.slice(0, 60) : "Suggestion"),
    timeEstimate: item.timeEstimate ?? "Varies",
    text: item.text ?? "",
    resourceTitle: item.resourceTitle ?? null,
    resourceUrl: item.resourceUrl ?? null,
    resourceImageUrl: item.resourceImageUrl ?? null,
  };
}

// What the model itself produces — resourceImageUrl is filled in afterward
// from a server-side Open Graph lookup, never by the model.
type ModelAdviceItem = Omit<AdviceItem, "resourceImageUrl">;
type ModelResult = Omit<ResumeMatchResult, "advice"> & { advice: ModelAdviceItem[] };

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    jobTitle: { anyOf: [{ type: "string" }, { type: "null" }] },
    matchingSkills: { type: "array", items: { type: "string" } },
    missingSkills: { type: "array", items: { type: "string" } },
    advice: {
      type: "array",
      items: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["project", "certification", "resource"] },
          title: { type: "string" },
          timeEstimate: { type: "string" },
          text: { type: "string" },
          resourceTitle: { anyOf: [{ type: "string" }, { type: "null" }] },
          resourceUrl: { anyOf: [{ type: "string" }, { type: "null" }] },
        },
        required: ["kind", "title", "timeEstimate", "text", "resourceTitle", "resourceUrl"],
        additionalProperties: false,
      },
    },
  },
  required: ["jobTitle", "matchingSkills", "missingSkills", "advice"],
  additionalProperties: false,
} as const;

const BASE_SYSTEM_PROMPT = `You are a career coach helping a job seeker understand how well their resume matches a specific job posting.

Compare the resume against the job posting and determine:
- jobTitle: the job title from the posting, or null if it isn't clear
- matchingSkills: skills/qualifications from the posting that the resume already demonstrates
- missingSkills: skills/qualifications the posting wants that the resume does not show
- advice: 3-5 concrete, self-directed things the candidate can go do on their own right now to close the gap — project ideas to build, certifications or courses to take, and other self-directed practice (a community, a book, a practice exercise, etc). Tag each item with a "kind" of "project", "certification", or "resource" (use "resource" for anything that isn't specifically a project or a certification/course). For each item also provide:
  - title: a short, specific, skimmable name for the item (e.g. "Build a REST API with Node.js" or "AWS Certified Cloud Practitioner"), not a generic label like "Project idea"
  - timeEstimate: a realistic time commitment as a short human phrase (e.g. "2-3 hours", "1 weekend", "2-3 weeks"), sized appropriately to the item
  - text: a 1-2 sentence description of the specific skill gap this closes and why it matters for this job`;

const SEARCH_INSTRUCTIONS = `For each item, use the web_search tool to find one real, currently available video, article, course page, or certification page that matches it, and include its title and URL. Only include a URL you actually found via search results — never invent, guess, or recall a URL from memory. You have a limited number of searches, so prioritize finding a link for the highest-impact items first; it's fine to leave resourceTitle/resourceUrl null on lower-priority items once you run out.`;

const NO_SEARCH_INSTRUCTIONS = `You do not have web search available for this pass. Leave resourceTitle and resourceUrl null for every advice item — do not guess or recall a URL from memory.`;

const RESPOND_JSON_ONLY = `Respond with only the JSON object described by the schema — no other text before or after it.`;

export type ResumeMatchOptions = {
  strict?: boolean;
  budgetFriendly?: boolean;
  projectsOnly?: boolean;
  timeBoxed?: boolean;
  longTerm?: boolean;
  teamFriendly?: boolean;
};

export type ResumeMatchProgress = {
  message: string;
  percent: number;
};

const MAX_WEB_SEARCHES = 2;

// Vercel's maxDuration on this route is 60s — a hard kill, not a suggestion.
// Real web searches have measured anywhere from ~15s to 100s+ each depending
// on conditions, so capping max_uses alone can't guarantee we land under 60s.
// Instead we self-enforce a deadline: abort the search-enabled attempt after
// SEARCH_TIMEOUT_MS and immediately retry with no tools at all (pure text
// generation, no round trips), which reliably finishes in a few seconds. That
// keeps the worst case at roughly SEARCH_TIMEOUT_MS + the fallback's runtime,
// comfortably inside the 60s window, at the cost of occasionally losing
// resource links on a slow request instead of the whole analysis failing.
const SEARCH_TIMEOUT_MS = 35_000;

function buildSystemPrompt(options: ResumeMatchOptions, withSearch: boolean) {
  const extra: string[] = [];
  if (options.strict) {
    extra.push(
      "Be a highly critical, no-nonsense reviewer. Assume the candidate is competing against many strong applicants — score conservatively, call out weaknesses bluntly, and do not soften the feedback."
    );
  }
  if (options.budgetFriendly) {
    extra.push(
      "When recommending certifications, courses, or practice projects, only suggest free or low-cost (under $50) options. Do not recommend expensive paid courses, bootcamps, or subscriptions."
    );
  }
  if (options.projectsOnly) {
    extra.push(
      'Only suggest hands-on projects to build (every advice item should have kind "project") — do not suggest certifications or courses.'
    );
  }
  if (options.timeBoxed) {
    extra.push(
      "Every advice item should be something completable in about 2 hours or less — small, focused wins only, not multi-week commitments."
    );
  }
  if (options.longTerm) {
    extra.push(
      "Favor deeper, longer-term commitments — multi-week projects or full certification programs — over quick one-off exercises."
    );
  }
  if (options.teamFriendly) {
    extra.push(
      "The candidate is job searching alongside a small group of friends. Where it fits naturally, favor project ideas and activities that group could realistically build or do together, not just solo work."
    );
  }
  return [
    BASE_SYSTEM_PROMPT,
    withSearch ? SEARCH_INSTRUCTIONS : NO_SEARCH_INSTRUCTIONS,
    ...extra,
    RESPOND_JSON_ONLY,
  ].join("\n\n");
}

function isAbortError(err: unknown): boolean {
  return (
    err instanceof Anthropic.APIUserAbortError ||
    (err instanceof Error && err.name === "AbortError")
  );
}

async function runAnalysis(
  resumeText: string,
  jobText: string,
  options: ResumeMatchOptions,
  withSearch: boolean,
  onProgress: ((progress: ResumeMatchProgress) => void) | undefined,
  signal: AbortSignal | undefined
): Promise<ResumeMatchResult> {
  const client = new Anthropic();

  const stream = client.messages.stream(
    {
      model: "claude-sonnet-5",
      max_tokens: 8000,
      ...(withSearch
        ? {
            tools: [
              {
                type: "web_search_20260209" as const,
                name: "web_search" as const,
                max_uses: MAX_WEB_SEARCHES,
              },
            ],
          }
        : {}),
      output_config: {
        effort: options.strict ? "medium" : "low",
        format: { type: "json_schema", schema: RESULT_SCHEMA },
      },
      system: buildSystemPrompt(options, withSearch),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Resume:\n${resumeText}`,
              cache_control: { type: "ephemeral" },
            },
            { type: "text", text: `\n\nJob posting:\n${jobText}` },
          ],
        },
      ],
    },
    { signal }
  );

  let searchCount = 0;
  let wroteWritingStatus = false;
  stream.on("streamEvent", (event) => {
    if (event.type !== "content_block_start") return;
    const block = event.content_block;
    if (withSearch && block.type === "server_tool_use" && block.name === "web_search") {
      searchCount += 1;
      onProgress?.({
        message: `Looking up a helpful resource (${searchCount}/${MAX_WEB_SEARCHES})…`,
        percent: Math.min(10 + searchCount * 15, 70),
      });
    } else if (block.type === "text" && !wroteWritingStatus) {
      wroteWritingStatus = true;
      onProgress?.({ message: "Writing your personalized feedback…", percent: 85 });
    }
  });

  const response = await stream.finalMessage();

  console.log("[resume-analysis] usage", {
    model: response.model,
    withSearch,
    effort: options.strict ? "medium" : "low",
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    cache_creation_input_tokens: response.usage.cache_creation_input_tokens,
    cache_read_input_tokens: response.usage.cache_read_input_tokens,
  });

  if (response.stop_reason !== "end_turn") {
    throw new Error("AI_REQUEST_FAILED");
  }

  const textBlocks = response.content.filter(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  const lastText = textBlocks[textBlocks.length - 1];
  if (!lastText) {
    throw new Error("AI_REQUEST_FAILED");
  }

  const parsed = JSON.parse(lastText.text) as ModelResult;

  return {
    ...parsed,
    advice: parsed.advice.map((item) => ({
      ...item,
      resourceUrl: sanitizeUrl(item.resourceUrl),
      resourceImageUrl: null,
    })),
  };
}

export async function analyzeResumeMatch(
  resumeText: string,
  jobText: string,
  options: ResumeMatchOptions = {},
  onProgress?: (progress: ResumeMatchProgress) => void
): Promise<ResumeMatchResult> {
  onProgress?.({ message: "Comparing your resume to the job posting…", percent: 10 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  let result: ResumeMatchResult;
  try {
    try {
      result = await runAnalysis(
        resumeText,
        jobText,
        options,
        true,
        onProgress,
        controller.signal
      );
    } catch (err) {
      if (!isAbortError(err)) {
        throw new Error("AI_REQUEST_FAILED");
      }
      onProgress?.({
        message: "Resource lookup is taking a while — finishing without extra links…",
        percent: 75,
      });
      try {
        result = await runAnalysis(resumeText, jobText, options, false, onProgress, undefined);
      } catch {
        throw new Error("AI_REQUEST_FAILED");
      }
    }
  } finally {
    clearTimeout(timeout);
  }

  onProgress?.({ message: "Fetching preview images…", percent: 90 });
  const imageUrls = await fetchOgImages(result.advice.map((item) => item.resourceUrl));
  result = {
    ...result,
    advice: result.advice.map((item, i) => ({
      ...item,
      resourceImageUrl: imageUrls[i] ?? null,
    })),
  };

  onProgress?.({ message: "Saving your results…", percent: 95 });
  return result;
}

export type LinkResearchResult = {
  resourceTitle: string | null;
  resourceUrl: string | null;
};

const LINK_RESEARCH_SCHEMA = {
  type: "object",
  properties: {
    resourceTitle: { anyOf: [{ type: "string" }, { type: "null" }] },
    resourceUrl: { anyOf: [{ type: "string" }, { type: "null" }] },
  },
  required: ["resourceTitle", "resourceUrl"],
  additionalProperties: false,
} as const;

// Individually timeboxed so one slow/failed search only costs that one
// item — unlike the combined runAnalysis() call, where a single timeout
// wipes out every link in the result.
const LINK_RESEARCH_TIMEOUT_MS = 25_000;

function buildLinkResearchSystemPrompt(jobTitle: string | null): string {
  return `You are finding one real, currently available online resource for a specific piece of career advice given to a job seeker${
    jobTitle ? ` applying to a "${jobTitle}" role` : ""
  }.

Use the web_search tool exactly once to find the single best resource for the advice item described in the user message: prefer that vendor/tool's official site or documentation if the advice names a specific tool or product; prefer a real YouTube tutorial video if the advice describes a workflow, process, or how-to skill; otherwise a solid article, course page, or certification page. Only return a URL you actually found via search results — never invent, guess, or recall a URL from memory. If you can't find a good match, leave resourceUrl null.

Respond with only the JSON object described by the schema — no other text before or after it.`;
}

// Runs one isolated request per item (each with its own search budget and
// timeout) rather than one combined call, so a slow or failed search never
// costs more than the single item it belongs to. Never rejects.
export async function researchMissingLinks(
  items: Pick<AdviceItem, "kind" | "title" | "text">[],
  jobTitle: string | null
): Promise<LinkResearchResult[]> {
  const system = buildLinkResearchSystemPrompt(jobTitle);

  const settled = await Promise.allSettled(
    items.map(async (item): Promise<LinkResearchResult> => {
      const client = new Anthropic();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), LINK_RESEARCH_TIMEOUT_MS);
      try {
        const response = await client.messages.create(
          {
            model: "claude-sonnet-5",
            max_tokens: 1024,
            tools: [
              {
                type: "web_search_20260209" as const,
                name: "web_search" as const,
                max_uses: 1,
              },
            ],
            output_config: {
              effort: "low",
              format: { type: "json_schema", schema: LINK_RESEARCH_SCHEMA },
            },
            system,
            messages: [
              {
                role: "user",
                content: `Advice kind: ${item.kind}\nTitle: ${item.title}\nDescription: ${item.text}`,
              },
            ],
          },
          { signal: controller.signal }
        );

        if (response.stop_reason !== "end_turn") {
          return { resourceTitle: null, resourceUrl: null };
        }
        const textBlocks = response.content.filter(
          (block): block is Anthropic.TextBlock => block.type === "text"
        );
        const lastText = textBlocks[textBlocks.length - 1];
        if (!lastText) {
          return { resourceTitle: null, resourceUrl: null };
        }
        const parsed = JSON.parse(lastText.text) as LinkResearchResult;
        return {
          resourceTitle: parsed.resourceTitle ?? null,
          resourceUrl: sanitizeUrl(parsed.resourceUrl ?? null),
        };
      } catch {
        return { resourceTitle: null, resourceUrl: null };
      } finally {
        clearTimeout(timeout);
      }
    })
  );

  return settled.map((r) =>
    r.status === "fulfilled" ? r.value : { resourceTitle: null, resourceUrl: null }
  );
}

export function sanitizeUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}
