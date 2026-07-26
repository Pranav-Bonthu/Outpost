import Anthropic from "@anthropic-ai/sdk";

export const MAX_INPUT_CHARS = 20000;

export type AdviceItem = {
  text: string;
  resourceTitle: string | null;
  resourceUrl: string | null;
};

export type ResumeMatchResult = {
  jobTitle: string | null;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  advice: AdviceItem[];
};

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    jobTitle: { anyOf: [{ type: "string" }, { type: "null" }] },
    matchScore: { type: "integer" },
    matchingSkills: { type: "array", items: { type: "string" } },
    missingSkills: { type: "array", items: { type: "string" } },
    advice: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          resourceTitle: { anyOf: [{ type: "string" }, { type: "null" }] },
          resourceUrl: { anyOf: [{ type: "string" }, { type: "null" }] },
        },
        required: ["text", "resourceTitle", "resourceUrl"],
        additionalProperties: false,
      },
    },
  },
  required: ["jobTitle", "matchScore", "matchingSkills", "missingSkills", "advice"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are a career coach helping a job seeker understand how well their resume matches a specific job posting.

Compare the resume against the job posting and determine:
- jobTitle: the job title from the posting, or null if it isn't clear
- matchScore: an integer 0-100 estimating overall fit
- matchingSkills: skills/qualifications from the posting that the resume already demonstrates
- missingSkills: skills/qualifications the posting wants that the resume does not show
- advice: a list of concrete, specific suggestions for closing the gap

For each piece of advice, if a specific certification, course, or practice project would genuinely help close that particular gap, use the web_search tool to find one real, currently available resource and include its title and URL. Only include a URL you actually found via search results — never invent, guess, or recall a URL from memory. If no good resource is found or none is needed, leave resourceTitle and resourceUrl null.

Respond with only the JSON object described by the schema — no other text before or after it.`;

export type ResumeMatchOptions = {
  strict?: boolean;
  budgetFriendly?: boolean;
};

function buildSystemPrompt(options: ResumeMatchOptions) {
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
  return extra.length > 0
    ? `${SYSTEM_PROMPT}\n\n${extra.join("\n")}`
    : SYSTEM_PROMPT;
}

export async function analyzeResumeMatch(
  resumeText: string,
  jobText: string,
  options: ResumeMatchOptions = {}
): Promise<ResumeMatchResult> {
  const client = new Anthropic();

  let response;
  try {
    response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 8000,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 4 }],
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: RESULT_SCHEMA },
      },
      system: buildSystemPrompt(options),
      messages: [
        {
          role: "user",
          content: `Resume:\n${resumeText}\n\nJob posting:\n${jobText}`,
        },
      ],
    });
  } catch {
    throw new Error("AI_REQUEST_FAILED");
  }

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

  let parsed: ResumeMatchResult;
  try {
    parsed = JSON.parse(lastText.text) as ResumeMatchResult;
  } catch {
    throw new Error("AI_REQUEST_FAILED");
  }

  return {
    ...parsed,
    advice: parsed.advice.map((item) => ({
      ...item,
      resourceUrl: sanitizeUrl(item.resourceUrl),
    })),
  };
}

function sanitizeUrl(url: string | null): string | null {
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
