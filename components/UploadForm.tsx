"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImageUp, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { EditorialIconBox } from "@/components/EditorialIconBox";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeader } from "@/components/SectionHeader";
import { getErrorMessage } from "@/lib/get-error-message";
import { transitionEditorialStagger } from "@/lib/motion";

function formatRevealAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

type Props = {
  onUploaded?: () => void;
  /** When the vault opens (ISO string). If set, show thank-you + check-back message after upload. */
  revealAtIso?: string | null;
};

export function UploadForm({ onUploaded, revealAtIso }: Props) {
  const [guestName, setGuestName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationRect, setCelebrationRect] = useState<DOMRect | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!showCelebration || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setCelebrationRect(rect);
    return () => setCelebrationRect(null);
  }, [showCelebration]);

  const celebrationParticles = useMemo(() => {
    const emojis = ["❤️", "🥂"];
    const particles: Array<{
      id: number;
      emoji: string;
      startX: number;
      startY: number;
      moveX: number;
      moveY: number;
      delay: number;
      scale: number;
    }> = [];
    const dist = () => 90 + Math.random() * 80;
    const drift = () => (Math.random() - 0.5) * 50;
    for (let i = 0; i < 28; i++) {
      const edge = i % 4;
      const t = Math.random();
      if (edge === 0) {
        particles.push({
          id: i,
          emoji: emojis[i % 2],
          startX: t * 100,
          startY: 0,
          moveX: drift(),
          moveY: -dist(),
          delay: Math.random() * 0.2,
          scale: 0.8 + Math.random() * 0.6,
        });
      } else if (edge === 1) {
        particles.push({
          id: i,
          emoji: emojis[i % 2],
          startX: 100,
          startY: t * 100,
          moveX: dist(),
          moveY: drift(),
          delay: Math.random() * 0.2,
          scale: 0.8 + Math.random() * 0.6,
        });
      } else if (edge === 2) {
        particles.push({
          id: i,
          emoji: emojis[i % 2],
          startX: t * 100,
          startY: 100,
          moveX: drift(),
          moveY: dist(),
          delay: Math.random() * 0.2,
          scale: 0.8 + Math.random() * 0.6,
        });
      } else {
        particles.push({
          id: i,
          emoji: emojis[i % 2],
          startX: 0,
          startY: t * 100,
          moveX: -dist(),
          moveY: drift(),
          delay: Math.random() * 0.2,
          scale: 0.8 + Math.random() * 0.6,
        });
      }
    }
    return particles;
  }, [showCelebration]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canSubmit = useMemo(() => {
    return guestName.trim().length > 0 && file && !uploading;
  }, [guestName, file, uploading]);

  function startProgressAnimation() {
    setProgress(0);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setProgress((p) =>
        p < 92 ? p + Math.max(1, Math.round((92 - p) / 18)) : p,
      );
    }, 180);
  }

  function stopProgressAnimation(finalValue: number) {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    setProgress(finalValue);
  }

  async function submit() {
    if (!canSubmit || !file) return;
    setUploading(true);
    setError(null);
    startProgressAnimation();
    try {
      const fd = new FormData();
      fd.set("guestName", guestName.trim());
      fd.set("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        throw new Error(getErrorMessage(j, "Upload failed"));
      }
      stopProgressAnimation(100);
      setTimeout(() => stopProgressAnimation(0), 700);
      setGuestName("");
      setFile(null);
      setShowCelebration(true);
      if (revealAtIso) setShowThankYou(true);
      onUploaded?.();
      setTimeout(() => setShowCelebration(false), 5200);
    } catch (e: unknown) {
      stopProgressAnimation(0);
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {showCelebration && celebrationRect ? (
          <motion.div
            key="celebration"
            className="pointer-events-none z-50"
            style={{
              position: "fixed",
              left: celebrationRect.left,
              top: celebrationRect.top,
              width: celebrationRect.width,
              height: celebrationRect.height,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {celebrationParticles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute text-2xl sm:text-3xl"
                style={{
                  left: `${p.startX}%`,
                  top: `${p.startY}%`,
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
                  duration: 2.8,
                  delay: p.delay,
                  opacity: {
                    times: [0, 0.1, 0.6, 1],
                    duration: 2.8,
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

      <section
        ref={sectionRef}
        className="relative overflow-hidden rounded-3xl border border-espresso/10 bg-white/40 p-6 backdrop-blur"
      >

      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          label="Share a moment"
          title="Add a photo to the vault"
          description="Your name helps them remember who captured it."
        />
        <EditorialIconBox>
          <ImageUp className="h-5 w-5 text-espresso/70" />
        </EditorialIconBox>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <label className="text-xs font-medium tracking-wide text-espresso/70">
            Guest Name
          </label>
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="e.g. Sarah"
            className="input-editorial"
            disabled={uploading}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-medium tracking-wide text-espresso/70">
            Photo
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-espresso file:px-4 file:py-2 file:text-cream file:transition-colors file:hover:bg-espresso/90"
              disabled={uploading}
            />
          </div>

          <AnimatePresence>
            {previewUrl ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={transitionEditorialStagger}
                className="mt-3 overflow-hidden rounded-2xl border border-espresso/10 bg-cream"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-48 w-full object-cover"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showThankYou && revealAtIso ? (
            <motion.div
              key="thank-you"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-2xl border border-champagne/30 bg-champagne/15 p-4"
            >
              <p className="text-sm font-medium text-espresso">
                Thank you for your contribution!
              </p>
              <p className="mt-1 text-sm text-espresso/80">
                Check back when the vault opens at{" "}
                <span className="font-medium">
                  {formatRevealAt(revealAtIso)}
                </span>
                .
              </p>
              <button
                type="button"
                onClick={() => setShowThankYou(false)}
                className="mt-3 text-xs font-medium text-espresso/70 underline underline-offset-2 hover:text-espresso"
              >
                Dismiss
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {uploading || progress > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-2xl border border-champagne/25 bg-champagne/10 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-espresso">
                  Developing your memory…
                </p>
                <p className="text-xs text-espresso/60">{progress}%</p>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-espresso/10">
              <motion.div
                className="h-full rounded-full bg-espresso"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={transitionEditorialStagger}
              />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error ? (
          <p className="text-sm text-espresso/80">
            <span className="font-medium">Upload failed.</span> {error}
          </p>
        ) : null}

        <div className="mt-1 flex items-center justify-end">
          <PrimaryButton onClick={submit} disabled={!canSubmit} type="button">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              "Share this moment"
            )}
          </PrimaryButton>
        </div>
      </div>
    </section>
    </>
  );
}

