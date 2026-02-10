import { NextResponse } from "next/server";

import { sanitizeApiError } from "@/lib/api-error";
import { getRevealAt } from "@/lib/config";
import { requireSession } from "@/lib/require-session";
import { supabaseServer } from "@/lib/supabase/server";

const BUCKET = "wedding-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

type PhotoRow = {
  id: string;
  created_at: string;
  guest_name: string;
  object_path: string;
};

export async function GET() {
  const session = await requireSession();
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseServer();

  const now = new Date();
  const revealAt = getRevealAt();

  if (now.getTime() < revealAt.getTime()) {
    return NextResponse.json(
      {
        locked: true,
        now: now.toISOString(),
        revealAt: revealAt.toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const { data: rows, error } = await supabase
    .from("wedding_photos")
    .select("id, created_at, guest_name, object_path")
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) {
    return NextResponse.json(
      {
        error: sanitizeApiError(
          `Failed to fetch photos: ${error.message}`,
          "Failed to load gallery. Please try again.",
        ),
      },
      { status: 500 },
    );
  }

  const photos = (rows ?? []) as PhotoRow[];
  const paths = photos.map((p) => p.object_path);

  const signedByPath = new Map<string, string>();

  if (paths.length > 0) {
    const { data: signedList, error: signedErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

    if (signedErr) {
      return NextResponse.json(
        {
          error: sanitizeApiError(
            `Failed to sign URLs: ${signedErr.message}`,
            "Failed to load gallery. Please try again.",
          ),
        },
        { status: 500 },
      );
    }

    for (const entry of signedList ?? []) {
      const path = entry?.path ?? (entry as { name?: string })?.name;
      const url = entry?.signedUrl ?? (entry as { signedURL?: string })?.signedURL;
      if (path && url) {
        signedByPath.set(path, url);
      }
    }

    // Fallback: request a signed URL per path that didn't get one (e.g. newly uploaded)
    for (const p of photos) {
      if (p.object_path && !signedByPath.has(p.object_path)) {
        const { data } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(p.object_path, SIGNED_URL_TTL_SECONDS);
        if (data?.signedUrl) {
          signedByPath.set(p.object_path, data.signedUrl);
        }
      }
    }
  }

  // Fetch like counts per photo
  const likeCountMap = new Map<string, number>();
  const photoIds = photos.map((p) => p.id);

  if (photoIds.length > 0) {
    const { data: likeCounts } = await supabase
      .from("photo_likes")
      .select("photo_id")
      .in("photo_id", photoIds);

    if (likeCounts) {
      for (const row of likeCounts) {
        likeCountMap.set(
          row.photo_id,
          (likeCountMap.get(row.photo_id) ?? 0) + 1,
        );
      }
    }
  }

  return NextResponse.json(
    {
      locked: false,
      photos: photos.map((p) => ({
        ...p,
        signed_url: signedByPath.get(p.object_path) ?? null,
        like_count: likeCountMap.get(p.id) ?? 0,
      })),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

