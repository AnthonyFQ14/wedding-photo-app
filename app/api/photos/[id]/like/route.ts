import { NextRequest, NextResponse } from "next/server";

import { sanitizeApiError } from "@/lib/api-error";
import { requireSession } from "@/lib/require-session";
import { supabaseServer } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/photos/[id]/like
 * Body: { guest_id: string }
 *
 * Toggles a like: if the guest hasn't liked it, inserts a row.
 * If the guest already liked it, removes the row.
 * Returns { liked: boolean, like_count: number }.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession();
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: photoId } = await params;

  let body: { guest_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const guestId = body.guest_id;
  if (!guestId || typeof guestId !== "string" || guestId.length > 100) {
    return NextResponse.json(
      { error: "Missing or invalid guest_id" },
      { status: 400 },
    );
  }

  const supabase = supabaseServer();

  // Check if already liked
  const { data: existing, error: fetchErr } = await supabase
    .from("photo_likes")
    .select("id")
    .eq("photo_id", photoId)
    .eq("guest_id", guestId)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json(
      {
        error: sanitizeApiError(
          `Failed to check like: ${fetchErr.message}`,
          "Something went wrong.",
        ),
      },
      { status: 500 },
    );
  }

  if (existing) {
    // Unlike
    const { error: delErr } = await supabase
      .from("photo_likes")
      .delete()
      .eq("id", existing.id);

    if (delErr) {
      return NextResponse.json(
        {
          error: sanitizeApiError(
            `Failed to unlike: ${delErr.message}`,
            "Something went wrong.",
          ),
        },
        { status: 500 },
      );
    }
  } else {
    // Like
    const { error: insErr } = await supabase
      .from("photo_likes")
      .insert({ photo_id: photoId, guest_id: guestId });

    if (insErr) {
      return NextResponse.json(
        {
          error: sanitizeApiError(
            `Failed to like: ${insErr.message}`,
            "Something went wrong.",
          ),
        },
        { status: 500 },
      );
    }
  }

  // Get updated count
  const { count, error: countErr } = await supabase
    .from("photo_likes")
    .select("id", { count: "exact", head: true })
    .eq("photo_id", photoId);

  if (countErr) {
    return NextResponse.json(
      {
        error: sanitizeApiError(
          `Failed to count likes: ${countErr.message}`,
          "Something went wrong.",
        ),
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    liked: !existing,
    like_count: count ?? 0,
  });
}
