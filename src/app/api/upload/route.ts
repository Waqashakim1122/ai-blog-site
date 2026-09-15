import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Lightweight magic-byte check — confirms the file's actual bytes are one
// of the allowed image formats, catching a mislabeled/non-image file (a
// .jpg that's actually something else) without pulling in a full
// image-decoding library. Not deep content sniffing, just the standard
// format signatures.
function detectImageMimeFromBytes(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // "RIFF"
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 // "WEBP"
  ) {
    return "image/webp";
  }
  if (
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 && // "GIF8"
    (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61 // "7a" or "9a"
  ) {
    return "image/gif";
  }
  return null;
}

function safeFilename(name: string): string {
  const ext = (name.match(/\.[a-zA-Z0-9]+$/)?.[0] || "").toLowerCase();
  return `${crypto.randomUUID()}${ext}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, and GIF images are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Images must be ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB or smaller.` },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const detectedMime = detectImageMimeFromBytes(new Uint8Array(arrayBuffer));
  if (!detectedMime) {
    return NextResponse.json(
      { error: "This file's contents don't match a supported image format." },
      { status: 400 }
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image uploads aren't configured yet (missing BLOB_READ_WRITE_TOKEN)." },
      { status: 500 }
    );
  }

  const blob = await put(`uploads/${safeFilename(file.name)}`, arrayBuffer, {
    access: "public",
    contentType: detectedMime,
  });

  return NextResponse.json({ url: blob.url });
}
