import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { saveAvatarFile } from "@/lib/avatar";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  try {
    const avatarPath = await saveAvatarFile(user.id, file);
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarPath },
    });
    return NextResponse.json({ avatarPath });
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_TYPE") {
      return NextResponse.json(
        { error: "Please upload a PNG, JPEG, WebP, or GIF image." },
        { status: 400 }
      );
    }
    if (err instanceof Error && err.message === "TOO_LARGE") {
      return NextResponse.json(
        { error: "Image must be 5MB or smaller." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
