import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

export async function saveAvatarFile(userId: string, file: File): Promise<string> {
  const ext = ALLOWED_AVATAR_TYPES[file.type];
  if (!ext) {
    throw new Error("INVALID_TYPE");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("TOO_LARGE");
  }

  await mkdir(AVATAR_DIR, { recursive: true });

  const existing = await readdir(AVATAR_DIR);
  await Promise.all(
    existing
      .filter((name) => name.startsWith(`${userId}-`))
      .map((name) => unlink(path.join(AVATAR_DIR, name)))
  );

  const filename = `${userId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(AVATAR_DIR, filename), buffer);

  return `/uploads/avatars/${filename}`;
}
