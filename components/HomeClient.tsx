"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, GalleryHorizontal, Lock } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GalleryMasonry } from "@/components/GalleryMasonry";
import { PasscodeModal } from "@/components/PasscodeModal";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { PrimaryButton } from "@/components/PrimaryButton";
import { UploadForm } from "@/components/UploadForm";
import { VaultCountdown } from "@/components/VaultCountdown";
import { COUPLE_NAMES } from "@/lib/config";
import { getErrorMessage } from "@/lib/get-error-message";
import { getGuestId } from "@/lib/guest-id";
import type { PhotosResult } from "@/lib/photos-server";

const VAULT_FIRST_OPEN_KEY = "wedding-vault-first-open-seen";

export type GalleryPhoto = {
  id: string;
  created_at: string;
  guest_name: string;
  object_path: string;
  signed_url: string | null;
  like_count: number;
};

type Props = {
  initialAuthenticated: boolean;
  initialPhotosResult: PhotosResult | null;
  initialRevealAtIso: string;
};

export function HomeClient({
  initialAuthenticated,
  initialPhotosResult,
  initialRevealAtIso,
}: Props) {
  const uploadRef = useRef<HTMLDivElement | null>(null);
  const vaultOpenSectionRef = useRef<HTMLDivElement | null>(null);
  const vaultOpenHeadingRef = useRef<HTMLParagraphElement | null>(null);
  const hasScrolledToVault = useRef(false);
  const justAuthenticatedRef = useRef(false);
  const hasFetchedOnceWithCountdown = useRef(false);

  const [authChecked, setAuthChecked] = useState(true);
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [showPasscode, setShowPasscode] = useState(false);
  const [showVaultCelebration, setShowVaultCelebration] = useState(false);

  const [vaultLocked, setVaultLocked] = useState<boolean | null>(
    initialPhotosResult?.locked === true
      ? true
      : initialPhotosResult?.locked === false
        ? false
        : null,
  );
  const [revealAtIso, setRevealAtIso] = useState<string | null>(
    initialPhotosResult?.locked === true ? initialPhotosResult.revealAt : null,
  );
  const [photos, setPhotos] = useState<GalleryPhoto[]>(
    initialPhotosResult?.locked === false ? initialPhotosResult.photos : [],
  );
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photosError, setPhotosError] = useState<string | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Likes: set of photo IDs liked by this guest
  const [likedByMe, setLikedByMe] = useState<Set<string>>(new Set());
  const guestIdRef = useRef<string>("");

  // Initialize guest ID on mount
  useEffect(() => {
    guestIdRef.current = getGuestId();
  }, []);

  // Fetch which photos this guest has liked
  const fetchMyLikes = useCallback(async (photoIds: string[]) => {
    if (photoIds.length === 0 || !guestIdRef.current) return;
    try {
      const res = await fetch(
        `/api/my-likes?guest_id=${encodeURIComponent(guestIdRef.current)}&photo_ids=${encodeURIComponent(photoIds.join(","))}`,
      );
      if (res.ok) {
        const data = (await res.json()) as { liked_photo_ids: string[] };
        setLikedByMe(new Set(data.liked_photo_ids));
      }
    } catch {
      // Silently fail – likes are a nice-to-have
    }
  }, []);

  const passcodeOpen = showPasscode && authChecked && !authenticated;

  const galleryPhotos = useMemo(
    () =>
      photos
        .filter((p) => p?.signed_url)
        .map((p) => ({
          ...p,
          liked_by_me: likedByMe.has(p.id),
        })),
    [photos, likedByMe],
  );

  const revealAtForCountdown = revealAtIso ?? initialRevealAtIso;
  const showVaultCountdown =
    revealAtForCountdown &&
    new Date(revealAtForCountdown).getTime() > Date.now();

  const checkSession = useCallback(async () => {
    const res = await fetch("/api/session", { method: "GET" });
    const j = (await res.json()) as { authenticated: boolean };
    setAuthenticated(Boolean(j.authenticated));
    setAuthChecked(true);
  }, []);

  const refreshPhotos = useCallback(async () => {
    setLoadingPhotos(true);
    setPhotosError(null);
    try {
      const res = await fetch("/api/photos", { method: "GET" });
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        throw new Error(getErrorMessage(j, "Failed to fetch gallery"));
      }
      const j = (await res.json()) as PhotosResult;
      if (j.locked) {
        setVaultLocked(true);
        setRevealAtIso(j.revealAt);
        setPhotos([]);
      } else {
        setVaultLocked(false);
        setRevealAtIso(null);
        setPhotos(j.photos);
        // Fetch which photos this guest has liked
        const ids = j.photos.map((p) => p.id);
        fetchMyLikes(ids);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setPhotosError(msg);
      setVaultLocked(null);
      setRevealAtIso(null);
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  }, [fetchMyLikes]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // When countdown is showing, fetch once so the API can set the test reveal cookie
  // (otherwise when countdown hits 0 the next request has no cookie and gets a new 20s).
  useEffect(() => {
    if (
      !authenticated ||
      vaultLocked !== true ||
      hasFetchedOnceWithCountdown.current
    )
      return;
    hasFetchedOnceWithCountdown.current = true;
    refreshPhotos();
  }, [authenticated, vaultLocked, refreshPhotos]);

  // Fetch my likes for initial photos
  useEffect(() => {
    if (photos.length > 0 && guestIdRef.current) {
      fetchMyLikes(photos.map((p) => p.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch likes once guest ID is ready (after mount)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (photos.length > 0 && guestIdRef.current) {
        fetchMyLikes(photos.map((p) => p.id));
      }
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToUpload = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goToVaultOpen = useCallback(() => {
    const el = vaultOpenHeadingRef.current ?? vaultOpenSectionRef.current;
    if (!el) return;
    const offsetPx = 8;
    const durationMs = 1200;
    const startY = window.scrollY;
    const targetY =
      startY + el.getBoundingClientRect().top - offsetPx;
    const startTime = performance.now();
    function easeOutCubic(t: number) {
      return 1 - (1 - t) ** 3;
    }
    function tick(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      window.scrollTo(0, startY + (targetY - startY) * easeOutCubic(t));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, []);

  // Celebration particles for first-time vault open (emoji burst)
  const vaultCelebrationParticles = useMemo(() => {
    const emojis = ["✨", "💫", "🌸", "❤️"];
    return Array.from({ length: 28 }, (_, i) => {
      const angle = (i / 28) * 360 + Math.random() * 25;
      const rad = (angle * Math.PI) / 180;
      const distance = 100 + Math.random() * 120;
      return {
        id: i,
        emoji: emojis[i % emojis.length],
        moveX: Math.cos(rad) * distance,
        moveY: Math.sin(rad) * distance,
        delay: Math.random() * 0.2,
        scale: 0.9 + Math.random() * 0.7,
      };
    });
  }, []);

  // When vault is open: scroll into view (once) and optionally show first-time celebration
  useEffect(() => {
    if (!authenticated || vaultLocked !== false) return;

    const isFirstTime =
      typeof window !== "undefined" &&
      !window.localStorage.getItem(VAULT_FIRST_OPEN_KEY);

    if (isFirstTime) {
      window.localStorage.setItem(VAULT_FIRST_OPEN_KEY, "1");
      setShowVaultCelebration(true);
    }

    if (hasScrolledToVault.current) return;
    hasScrolledToVault.current = true;
    justAuthenticatedRef.current = false;

    // Wait for vault section enter animation to finish (delay 0.15 + duration 0.6)
    // so the scroll target is in its final position and we don’t overshoot
    const t = window.setTimeout(() => {
      goToVaultOpen();
    }, 900);
    return () => window.clearTimeout(t);
  }, [authenticated, vaultLocked, goToVaultOpen]);

  // Auto-dismiss vault celebration after animation
  useEffect(() => {
    if (!showVaultCelebration) return;
    const t = window.setTimeout(() => setShowVaultCelebration(false), 2800);
    return () => window.clearTimeout(t);
  }, [showVaultCelebration]);

  // When user just logged in but vault is still locked, scroll to upload
  useEffect(() => {
    if (
      !justAuthenticatedRef.current ||
      !authenticated ||
      vaultLocked !== true
    )
      return;
    justAuthenticatedRef.current = false;
    const t = window.setTimeout(() => goToUpload(), 150);
    return () => window.clearTimeout(t);
  }, [authenticated, vaultLocked, goToUpload]);

  // Toggle like handler
  const handleToggleLike = useCallback(
    async (photoId: string) => {
      const guestId = guestIdRef.current;
      if (!guestId) return;

      // Optimistic update
      setLikedByMe((prev) => {
        const next = new Set(prev);
        if (next.has(photoId)) {
          next.delete(photoId);
        } else {
          next.add(photoId);
        }
        return next;
      });

      setPhotos((prev) =>
        prev.map((p) => {
          if (p.id !== photoId) return p;
          const wasLiked = likedByMe.has(photoId);
          return {
            ...p,
            like_count: wasLiked
              ? Math.max(0, p.like_count - 1)
              : p.like_count + 1,
          };
        }),
      );

      try {
        const res = await fetch(`/api/photos/${photoId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guest_id: guestId }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            liked: boolean;
            like_count: number;
          };
          // Reconcile with server truth
          setLikedByMe((prev) => {
            const next = new Set(prev);
            if (data.liked) {
              next.add(photoId);
            } else {
              next.delete(photoId);
            }
            return next;
          });
          setPhotos((prev) =>
            prev.map((p) =>
              p.id === photoId ? { ...p, like_count: data.like_count } : p,
            ),
          );
        }
      } catch {
        // Revert optimistic update on error
        setLikedByMe((prev) => {
          const next = new Set(prev);
          if (next.has(photoId)) {
            next.delete(photoId);
          } else {
            next.add(photoId);
          }
          return next;
        });
        // Re-fetch to get truth
        refreshPhotos();
      }
    },
    [likedByMe, refreshPhotos],
  );

  return (
    <div className="min-h-screen">
      <PasscodeModal
        open={passcodeOpen}
        coupleNames={COUPLE_NAMES}
        onAuthenticated={() => {
          setAuthenticated(true);
          setAuthChecked(true);
          setShowPasscode(false);
          justAuthenticatedRef.current = true;
          refreshPhotos();
          // Scroll to vault (if open) or upload (if locked) is handled in useEffect
        }}
        onClose={() => setShowPasscode(false)}
      />

      {/* Lightbox */}
      <PhotoLightbox
        photos={galleryPhotos}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        onToggleLike={handleToggleLike}
      />

      {/* First-time vault open celebration */}
      <AnimatePresence>
        {showVaultCelebration ? (
          <motion.div
            key="vault-celebration"
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-cream/60 backdrop-blur-[2px]" />
            <div className="relative flex flex-col items-center justify-center">
              <motion.p
                className="font-[var(--font-playfair)] text-2xl font-medium text-espresso sm:text-3xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                The vault is open.
              </motion.p>
              <motion.p
                className="mt-2 text-sm text-espresso/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Enjoy the gallery
              </motion.p>
            </div>
            {vaultCelebrationParticles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute text-2xl sm:text-3xl"
                style={{
                  left: "50%",
                  top: "50%",
                  marginLeft: "-0.5em",
                  marginTop: "-0.5em",
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: p.moveX,
                  y: p.moveY,
                  opacity: [0, 1, 1, 0],
                  scale: p.scale,
                }}
                transition={{
                  duration: 2.6,
                  delay: p.delay,
                  opacity: {
                    times: [0, 0.12, 0.55, 1],
                    duration: 2.6,
                  },
                }}
                exit={{ opacity: 0 }}
              >
                {p.emoji}
              </motion.span>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-cream" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(214,195,165,0.35),transparent_45%),radial-gradient(circle_at_90%_15%,rgba(214,195,165,0.25),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(45,36,30,0.08),transparent_55%)]" />
      </div>

      <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-14 sm:pt-20">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[2rem] border border-espresso/10 bg-white/35 p-8 backdrop-blur"
        >
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(214,195,165,0.20),transparent_55%)]" />

          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-medium tracking-[0.28em] uppercase text-espresso/60">
                {COUPLE_NAMES.replace(/\s+and\s+/i, " & ")}
              </p>
              <div className="inline-flex cursor-default items-center gap-2 rounded-full border border-espresso/10 bg-cream/70 px-3 py-1.5 text-xs text-espresso/70">
                <Lock className="h-3.5 w-3.5" />
                Passcode Vault
              </div>
            </div>

            <h1 className="mt-6 font-[var(--font-playfair)] text-3xl leading-tight sm:text-4xl">
              Share a moment for the couple
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-espresso/65 sm:text-base">
              Capture something beautiful—then tuck it into the vault. After the
              celebration, the full gallery reveals as a curated mosaic.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryButton
                type="button"
                onClick={() => {
                  if (!authenticated) {
                    setShowPasscode(true);
                    return;
                  }
                  goToUpload();
                }}
              >
                <Camera className="h-4 w-4" />
                Share a Moment
              </PrimaryButton>

              <PrimaryButton
                variant="ghost"
                type="button"
                onClick={() => {
                  if (!authenticated) {
                    setShowPasscode(true);
                    return;
                  }
                  refreshPhotos();
                }}
                disabled={!authenticated || loadingPhotos}
              >
                <GalleryHorizontal className="h-4 w-4" />
                {loadingPhotos ? "Refreshing…" : "Refresh"}
              </PrimaryButton>
            </div>

            {!authenticated ? (
              <p className="mt-4 text-sm text-espresso/60">
                Tap <span className="font-medium">Share a Moment</span> to enter
                the passcode.
              </p>
            ) : null}
          </div>
        </motion.section>

        <div className="relative mt-8">
          <AnimatePresence>
            {showVaultCountdown ? (
              <motion.div
                key="countdown"
                className="mt-0"
                initial={{ opacity: 1 }}
                exit={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1,
                  opacity: 0,
                  y: -20,
                  transition: {
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }}
              >
                <VaultCountdown
                  revealAtIso={revealAtForCountdown}
                  onReveal={authenticated ? refreshPhotos : undefined}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
          {authenticated && vaultLocked === false ? (
            <motion.div
              ref={vaultOpenSectionRef}
              key="gallery"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.p
                ref={vaultOpenHeadingRef}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="scroll-mt-2 mb-4 text-center font-[var(--font-playfair)] text-lg text-espresso/80"
              >
                The vault is open.
              </motion.p>
              <GalleryMasonry
                photos={galleryPhotos}
                onPhotoClick={(index) => setLightboxIndex(index)}
                onToggleLike={handleToggleLike}
              />
            </motion.div>
          ) : null}
        </div>

        {authenticated ? (
          <div ref={uploadRef} className="mt-8 scroll-mt-20">
            <UploadForm
              onUploaded={refreshPhotos}
              revealAtIso={showVaultCountdown ? revealAtForCountdown ?? null : null}
            />
          </div>
        ) : null}

        <div className="mt-8">
          {photosError ? (
            <section className="rounded-3xl border border-espresso/10 bg-white/25 p-6 backdrop-blur">
              <p className="text-sm text-espresso/70">
                <span className="font-medium">Gallery unavailable.</span>{" "}
                {photosError}
              </p>
            </section>
          ) : null}

          {authenticated && vaultLocked === null && !photosError ? (
            <section className="rounded-3xl border border-espresso/10 bg-white/25 p-6 backdrop-blur">
              <p className="text-sm text-espresso/70">
                Loading the vault…
              </p>
            </section>
          ) : null}
        </div>

        <footer className="mt-12 text-center text-xs tracking-[0.02em] text-espresso/55">
          <p>
            Crafted with care. Photos are stored securely and revealed after the
            vault opens.
          </p>
        </footer>
      </main>
    </div>
  );
}
