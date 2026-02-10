import crypto from "crypto";
import { NextResponse } from "next/server";

import { sanitizeApiError } from "@/lib/api-error";
import { requireSession } from "@/lib/require-session";
import { supabaseServer } from "@/lib/supabase/server";

const BUCKET = "wedding-photos";
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB
const GUEST_NAME_MAX_LENGTH = 100;
const GUEST_NAME_SAFE_REGEX = /^[\p{L}\p{N}\s\-'.]+$/u;

function safeExtFromFilename(name: string): string | null {
  const parts = name.split(".");
  const ext = parts.length > 1 ? parts.at(-1) : null;
  if (!ext) return null;
  const cleaned = ext.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
  return cleaned || null;
}

function sanitizeGuestName(raw: string): string {
  const trimmed = raw.trim().slice(0, GUEST_NAME_MAX_LENGTH);
  if (!GUEST_NAME_SAFE_REGEX.test(trimmed)) {
    return trimmed.replace(/[^\p{L}\p{N}\s\-'.]/gu, "").trim();
  }
  return trimmed;
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseServer();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  const guestNameRaw = form.get("guestName");
  const fileRaw = form.get("file");

  const guestName =
    typeof guestNameRaw === "string"
      ? sanitizeGuestName(guestNameRaw)
      : "";

  if (!guestName) {
    return NextResponse.json(
      { error: "Guest name is required (max 100 characters)" },
      { status: 400 },
    );
  }

  if (!(fileRaw instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (fileRaw.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      {
        error: `File too large. Maximum size is ${MAX_FILE_BYTES / 1024 / 1024}MB.`,
      },
      { status: 400 },
    );
  }

  if (!fileRaw.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image uploads are allowed" },
      { status: 400 },
    );
  }

  const originalFilename = fileRaw.name || "upload";
  const ext = safeExtFromFilename(originalFilename) ?? "jpg";
  const id = crypto.randomUUID();
  const yyyyMm = new Date().toISOString().slice(0, 7); // YYYY-MM
  const objectPath = `photos/${yyyyMm}/${id}.${ext}`;

  const bytes = Buffer.from(await fileRaw.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, bytes, {
      contentType: fileRaw.type,
      upsert: false,
      cacheControl: "31536000",
    });

  if (uploadError) {
    return NextResponse.json(
      {
        error: sanitizeApiError(
          `Upload failed: ${uploadError.message}`,
          "Upload failed. Please try again.",
        ),
      },
      { status: 500 },
    );
  }

  const { data: inserted, error: insertError } = await supabase
    .from("wedding_photos")
    .insert({
      guest_name: guestName,
      object_path: objectPath,
      original_filename: originalFilename,
      mime_type: fileRaw.type,
      size_bytes: fileRaw.size,
    })
    .select("id, created_at, guest_name, object_path")
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([objectPath]);
    return NextResponse.json(
      {
        error: sanitizeApiError(
          `Database insert failed: ${insertError.message}`,
          "Upload failed. Please try again.",
        ),
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, photo: inserted });
}

