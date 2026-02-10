import { getRevealAt } from "@/lib/config";
import { getPhotosOrLockedState } from "@/lib/photos-server";
import { getSessionStatus } from "@/lib/require-session";
import { HomeClient } from "@/components/HomeClient";

export default async function Home() {
  const { authenticated } = await getSessionStatus();
  const initialPhotosResult = authenticated
    ? await getPhotosOrLockedState()
    : null;
  const initialRevealAtIso = getRevealAt().toISOString();

  return (
    <HomeClient
      initialAuthenticated={authenticated}
      initialPhotosResult={initialPhotosResult}
      initialRevealAtIso={initialRevealAtIso}
    />
  );
}
