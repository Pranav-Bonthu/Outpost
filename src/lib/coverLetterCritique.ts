import Anthropic from "@anthropic-ai/sdk";

export const MAX_DRAFT_CHARS = 6000;

export type CoverLetterFeedbackItem = {
  kind: "strength" | "weakness" | "suggestion";
  title: string;
  text: string;
};

export type CoverLetterCritiqueResult = {
  summary: string;
  feedback: CoverLetterFeedbackItem[];
};

// The shared shape fed to the cover letter slide, whether it comes from a
// freshly saved draft or a past one fetched server-side.
export type CoverLetterSummary = {
  draftText: string;
  critique: CoverLetterCritiqueResult | null;
  critiquedAt: string | null;
  updatedAt: string;
};

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    feedback: {
      type: "array",
      items: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["strength", "weakness", "suggestion"] },
          title: { type: "string" },
          text: { type: "string" },
        },
        required: ["kind", "title", "text"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "feedback"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are a career coach reviewing a cover letter draft a job seeker wrote for a specific job posting.

Compare the cover letter against the candidate's resume and the job posting. Do NOT rewrite or rephrase the letter yourself — only critique what's already there.

Return:
- summary: a 1-2 sentence overall take on the draft
- feedback: 3-6 specific items, each tagged with a "kind" of "strength" (something the letter does well), "weakness" (a real problem with the letter as written), or "suggestion" (a concrete way to improve it). For each item also provide:
  - title: a short, specific, skimmable name for the item
  - text: a 1-2 sentence explanation, grounded in specifics from the letter, resume, and job posting rather than generic advice

Respond with only the JSON object described by the schema — no other text before or after it.`;

export function toCoverLetterSummary(row: {
  draftText: string;
  critique: string | null;
  critiquedAt: Date | null;
  updatedAt: Date;
}): CoverLetterSummary {
  return {
    draftText: row.draftText,
    critique: row.critique
      ? (JSON.parse(row.critique) as CoverLetterCritiqueResult)
      : null,
    critiquedAt: row.critiquedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function critiqueCoverLetter(
  draftText: string,
  resumeText: string,
  jobText: string,
  jobTitle: string | null
): Promise<CoverLetterCritiqueResult> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4000,
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: RESULT_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Resume:\n${resumeText}\n\nJob posting${jobTitle ? ` (${jobTitle})` : ""}:\n${jobText}\n\nCover letter draft:\n${draftText}`,
      },
    ],
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

  return JSON.parse(lastText.text) as CoverLetterCritiqueResult;
}
