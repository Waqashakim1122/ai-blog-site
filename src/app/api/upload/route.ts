import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

// Requires authentication only for now. MIME-type/size validation and the
// login rate limiter are Phase 3a's explicit scope, not this phase's —
// until that lands, any authenticated admin/author can upload any file
// type/size here. That's a real but bounded risk (auth-gated, not public).
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

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image uploads aren't configured yet (missing BLOB_READ_WRITE_TOKEN)." },
      { status: 500 }
    );
  }

  const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url });
}
