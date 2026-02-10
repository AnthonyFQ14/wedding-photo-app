"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, GalleryHorizontal, Lock } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GalleryMasonry } from "@/components/GalleryMasonry";
import { PasscodeModal } from "@/components/PasscodeModal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { UploadForm } from "@/components/UploadForm";
import { VaultCountdown } from "@/components/VaultCountdown";
import { COUPLE_NAMES } from "@/lib/config";
import { getErrorMessage } from "@/lib/get-error-message";
import type { PhotosResult } from "@/lib/photos-server";

export type GalleryPhoto = {
  id: string;
  created_at: string;
  guest_name: string;
  object_path: string;
  signed_url: string | null;
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

  const [authChecked, setAuthChecked] = useState(true);
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [showPasscode, setShowPasscode] = useState(false);

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

  const passcodeOpen = showPasscode && authChecked && !authenticated;

  const galleryPhotos = useMemo(
    () => photos.filter((p) => p?.signed_url),
    [photos],
  );

  const revealAtForCountdown =
    revealAtIso ?? initialRevealAtIso;
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
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);
  // Initial photos come from server; refetch only on Refresh or after upload

  const goToUpload = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen">
      <PasscodeModal
        open={passcodeOpen}
        coupleNames={COUPLE_NAMES}
        onAuthenticated={() => {
          setAuthenticated(true);
          setAuthChecked(true);
          setShowPasscode(false);
          refreshPhotos();
          setTimeout(goToUpload, 0);
        }}
        onClose={() => setShowPasscode(false)}
      />

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
              <div className="inline-flex items-center gap-2 rounded-full border border-espresso/10 bg-cream/70 px-3 py-1.5 text-xs text-espresso/70">
                <Lock className="h-3.5 w-3.5" />
                Passcode vault
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

        <AnimatePresence mode="wait">
          {showVaultCountdown ? (
            <motion.div
              key="countdown"
              className="mt-8"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.35 } }}
            >
              <VaultCountdown
                revealAtIso={revealAtForCountdown}
                onReveal={authenticated ? refreshPhotos : undefined}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

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

          {authenticated && vaultLocked === false ? (
            <motion.div
              key="gallery"
              className="mt-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mb-4 text-center font-[var(--font-playfair)] text-lg text-espresso/80"
              >
                The vault is open.
              </motion.p>
              <GalleryMasonry photos={galleryPhotos} />
            </motion.div>
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
