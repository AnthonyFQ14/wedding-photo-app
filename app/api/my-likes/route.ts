import { NextRequest, NextResponse } from "next/server";

import { requireSession } from "@/lib/require-session";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * GET /api/my-likes?guest_id=xxx&photo_ids=id1,id2,id3
 *
 * Returns which of the given photo IDs the guest has liked.
 */
export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const guestId = searchParams.get("guest_id");
  const photoIdsRaw = searchParams.get("photo_ids");

  if (!guestId || !photoIdsRaw) {
    return NextResponse.json(
      { error: "Missing guest_id or photo_ids" },
      { status: 400 },
    );
  }

  const photoIds = photoIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 300); // Limit to avoid huge queries

  if (photoIds.length === 0) {
    return NextResponse.json({ liked_photo_ids: [] });
  }

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("photo_likes")
    .select("photo_id")
    .eq("guest_id", guestId)
    .in("photo_id", photoIds);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    liked_photo_ids: (data ?? []).map((row) => row.photo_id),
  });
}
