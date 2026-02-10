/**
 * Save one or more photos. On mobile, uses the Web Share API so the user
 * can choose "Save Image" / "Save to Photos" (camera roll). On desktop,
 * falls back to programmatic download.
 */

function getExtension(blob: Blob): string {
  const type = blob.type.split("/")[1]?.replace("jpeg", "jpg");
  return type || "jpg";
}

/**
 * Save a single photo. Prefers Web Share on mobile (opens share sheet with
 * "Save Image" / "Add to Photos"). Falls back to download link.
 */
export async function savePhoto(
  blob: Blob,
  photoId: string,
): Promise<{ ok: boolean; usedShare: boolean }> {
  const ext = getExtension(blob);
  const filename = `wedding-photo-${photoId.slice(0, 8)}.${ext}`;
  const file = new File([blob], filename, { type: blob.type });

  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    navigator.canShare?.({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: "Wedding photo",
      });
      return { ok: true, usedShare: true };
    } catch (err) {
      // User cancelled or share failed – fall back to download
      if ((err as Error).name === "AbortError") return { ok: true, usedShare: true };
    }
  }

  // Fallback: programmatic download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { ok: true, usedShare: false };
}

/**
 * Save multiple photos. On mobile uses Web Share so user can "Save X Images"
 * to camera roll. On desktop, triggers one download at a time with a short
 * delay (some browsers block rapid successive downloads).
 */
export async function savePhotos(
  blobsAndIds: Array<{ blob: Blob; photoId: string }>,
): Promise<{ ok: boolean; usedShare: boolean }> {
  if (blobsAndIds.length === 0) return { ok: false, usedShare: false };

  const files = blobsAndIds.map(({ blob, photoId }) => {
    const ext = getExtension(blob);
    const filename = `wedding-photo-${photoId.slice(0, 8)}.${ext}`;
    return new File([blob], filename, { type: blob.type });
  });

  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    navigator.canShare?.({ files })
  ) {
    try {
      await navigator.share({
        files,
        title: files.length === 1 ? "Wedding photo" : "Wedding photos",
      });
      return { ok: true, usedShare: true };
    } catch (err) {
      if ((err as Error).name === "AbortError") return { ok: true, usedShare: true };
      // Other error – fall through to download fallback
    }
  }

  // Fallback: sequential downloads (desktop; mobile may only get first)
  for (const { blob, photoId } of blobsAndIds) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding-photo-${photoId.slice(0, 8)}.${getExtension(blob)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    await new Promise((r) => setTimeout(r, 400));
  }
  return { ok: true, usedShare: false };
}
