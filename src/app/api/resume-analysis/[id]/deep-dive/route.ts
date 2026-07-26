import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fetchOgImages } from "@/lib/linkPreview";
import {
  normalizeAdviceItem,
  researchMissingLinks,
  type AdviceItem,
} from "@/lib/resumeMatch";

export const maxDuration = 60;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const row = await prisma.resumeAnalysis.findUnique({ where: { id } });
  if (!row || row.authorId !== user.id) {
    return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  }

  const now = new Date();
  if (user.lastDeepDiveAt) {
    const elapsedMs = now.getTime() - user.lastDeepDiveAt.getTime();
    if (elapsedMs < ONE_DAY_MS) {
      const availableAt = new Date(user.lastDeepDiveAt.getTime() + ONE_DAY_MS);
      return NextResponse.json(
        {
          error: "You can only deep dive once per day.",
          availableAt: availableAt.toISOString(),
        },
        { status: 429 }
      );
    }
  }

  const body = await request.json().catch(() => ({}));
  const itemIndex = body.itemIndex;

  const advice = (JSON.parse(row.advice) as Partial<AdviceItem>[]).map(
    normalizeAdviceItem
  );

  if (
    typeof itemIndex !== "number" ||
    !Number.isInteger(itemIndex) ||
    itemIndex < 0 ||
    itemIndex >= advice.length
  ) {
    return NextResponse.json({ error: "Invalid item." }, { status: 400 });
  }
  if (advice[itemIndex].resourceUrl) {
    return NextResponse.json(
      { error: "This item already has a link." },
      { status: 400 }
    );
  }

  const [result] = await researchMissingLinks(
    [advice[itemIndex]],
    row.jobTitle
  );

  const merged = [...advice];
  if (result?.resourceUrl) {
    merged[itemIndex] = {
      ...merged[itemIndex],
      resourceTitle: result.resourceTitle,
      resourceUrl: result.resourceUrl,
    };

    const [imageUrl] = await fetchOgImages([merged[itemIndex].resourceUrl]);
    if (imageUrl) {
      merged[itemIndex] = { ...merged[itemIndex], resourceImageUrl: imageUrl };
    }
  }

  const availableAt = new Date(now.getTime() + ONE_DAY_MS);
  await prisma.$transaction([
    prisma.resumeAnalysis.update({
      where: { id },
      data: { advice: JSON.stringify(merged) },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { lastDeepDiveAt: now },
    }),
  ]);

  return NextResponse.json({ advice: merged, availableAt: availableAt.toISOString() });
}
