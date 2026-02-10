"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImageUp, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { EditorialIconBox } from "@/components/EditorialIconBox";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeader } from "@/components/SectionHeader";
import { getErrorMessage } from "@/lib/get-error-message";

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

/** Height in px for the validation card so it fits the message without clipping or extra gap. */
function getValidationCardHeight(message: string | null): number {
  if (!message) return 0;
  if (message.includes("and choose")) return 52; // "Please enter your name and choose at least one photo." (2 lines)
  return 38; // "Please enter your name." or "Please choose at least one photo." (1 line)
}

type Props = {
  onUploaded?: () => void;
  /** When the vault opens (ISO string). If set, show thank-you + check-back message after upload. */
  revealAtIso?: string | null;
};

type FeedbackState = "idle" | "uploading" | "complete" | "thankyou";

const MAX_PHOTOS = 10;

export function UploadForm({ onUploaded, revealAtIso }: Props) {
  const [guestName, setGuestName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [showCelebration, setShowCelebration] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [celebrationRect, setCelebrationRect] = useState<DOMRect | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const uploading = feedback === "uploading" || feedback === "complete";

  function clearTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }
  function addTimer(fn: () => void, ms: number) {
    timersRef.current.push(window.setTimeout(fn, ms));
  }

  useEffect(() => {
    if (!showCelebration || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setCelebrationRect(rect);
    return () => setCelebrationRect(null);
  }, [showCelebration]);

  const celebrationParticles = useMemo(() => {
    const emojis = ["❤️", "🥂"];
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * 360 + Math.random() * 25;
      const rad = (angle * Math.PI) / 180;
      const distance = 80 + Math.random() * 100;
      return {
        id: i,
        emoji: emojis[i % 2],
        moveX: Math.cos(rad) * distance,
        moveY: Math.sin(rad) * distance,
        delay: Math.random() * 0.12,
        scale: 0.9 + Math.random() * 0.5,
      };
    });
    // Regenerate random particles each time celebration shows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCelebration]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function stopProgressAnimation() {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  async function submit() {
    const name = guestName.trim();
    if (!name || files.length === 0) {
      if (!name && files.length === 0) {
        setValidationMessage("Please enter your name and choose at least one photo.");
      } else if (!name) {
        setValidationMessage("Please enter your name.");
      } else {
        setValidationMessage("Please choose at least one photo.");
      }
      return;
    }
    setValidationMessage(null);
    setFeedback("uploading");
    setError(null);
    setUploadCount(0);
    setUploadTotal(files.length);
    setProgress(0);
    const FEEDBACK_HEIGHT = 128;
    setTimeout(() => {
      window.scrollBy({ top: FEEDBACK_HEIGHT, behavior: "smooth" });
    }, 250);
    const total = files.length;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.set("guestName", name);
        fd.set("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const j: unknown = await res.json().catch(() => null);
          throw new Error(getErrorMessage(j, "Upload failed"));
        }
        const done = i + 1;
        setUploadCount(done);
        setProgress(Math.round((done / total) * 100));
      }

      stopProgressAnimation();
      setProgress(100);
      setFeedback("complete");
      setGuestName("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploaded?.();
      clearTimers();

      addTimer(() => setShowCelebration(true), 600);
      addTimer(() => {
        if (revealAtIso) {
          setFeedback("thankyou");
        } else {
          setFeedback("idle");
          setProgress(0);
        }
      }, 1200);
      addTimer(() => setShowCelebration(false), 4500);
    } catch (e: unknown) {
      stopProgressAnimation();
      setProgress(0);
      setFeedback("idle");
      setUploadCount(0);
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
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
                className="absolute text-2xl sm:text-3xl will-change-transform"
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
                  opacity: [0, 1, 0.9, 0],
                  scale: p.scale,
                }}
                transition={{
                  duration: 2.4,
                  delay: p.delay,
                  ease: "easeOut",
                  opacity: {
                    times: [0, 0.08, 0.7, 1],
                    duration: 2.4,
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
            onChange={(e) => {
              setGuestName(e.target.value);
              setValidationMessage(null);
            }}
            placeholder="e.g. Sarah"
            className="input-editorial"
            disabled={uploading}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-medium tracking-wide text-espresso/70">
            Photos (up to {MAX_PHOTOS})
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="photos-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const list = e.target.files;
                if (!list?.length) {
                  setFiles([]);
                } else {
                  setFiles(Array.from(list).slice(0, MAX_PHOTOS));
                }
                setValidationMessage(null);
              }}
              className="sr-only"
              disabled={uploading}
              aria-label="Choose photos"
            />
            <label
              htmlFor={uploading ? undefined : "photos-file-input"}
              className={`inline-flex w-fit cursor-pointer rounded-full border-0 bg-espresso px-4 py-2 text-sm text-cream transition-colors hover:bg-espresso/90 ${
                uploading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Choose files
            </label>
            {files.length === 0 &&
              validationMessage !== null &&
              validationMessage.includes("photo") && (
                <p className="text-sm text-espresso/60">No files selected</p>
              )}
          </div>

          <AnimatePresence initial={false}>
            {previewUrls.length > 0 ? (
              <motion.div
                key="preview"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
                onAnimationComplete={(definition) => {
                  if (
                    typeof definition === "object" &&
                    definition !== null &&
                    "opacity" in definition &&
                    definition.opacity === 1
                  ) {
                    const start = window.scrollY;
                    const end = document.documentElement.scrollHeight - window.innerHeight;
                    if (end <= start) return;
                    const duration = 900;
                    const startTime = performance.now();
                    function step(now: number) {
                      const t = Math.min((now - startTime) / duration, 1);
                      const eased = 1 - (1 - t) ** 2;
                      window.scrollTo(0, start + (end - start) * eased);
                      if (t < 1) requestAnimationFrame(step);
                    }
                    requestAnimationFrame(step);
                  }
                }}
              >
                <div className="mt-3">
                  <p className="mb-2 text-xs text-espresso/60">
                    {previewUrls.length} photo{previewUrls.length === 1 ? "" : "s"} selected
                    {previewUrls.length >= MAX_PHOTOS ? ` (max ${MAX_PHOTOS})` : ""}
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {previewUrls.map((url, i) => (
                      <div
                        key={url}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-espresso/10 bg-cream"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Preview ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {!uploading && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setFiles((prev) => {
                                const next = prev.filter((_, idx) => idx !== i);
                                if (next.length === 0 && fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                                return next;
                              });
                              setValidationMessage(null);
                            }}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/90 transition-colors hover:bg-black/80 hover:text-white"
                            aria-label={`Remove photo ${i + 1}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Single feedback area: fixed height so progress → thank-you doesn't resize */}
        <AnimatePresence initial={false}>
          {feedback !== "idle" ? (
            <motion.div
              key="feedback-container"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 128, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="h-[128px] rounded-2xl border border-champagne/25 bg-champagne/10 p-4">
                <AnimatePresence mode="wait" initial={false}>
                  {(feedback === "uploading" || feedback === "complete") ? (
                    <motion.div
                      key="progress-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-full"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium text-espresso">
                          {feedback === "complete"
                            ? "Memory saved!"
                            : uploadCount > 0 && uploadTotal > 1
                              ? `Uploading ${uploadCount} of ${uploadTotal}…`
                              : "Developing your memory…"}
                        </p>
                        <p className="text-xs text-espresso/60">{progress}%</p>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-espresso/10">
                        <motion.div
                          className="h-full rounded-full bg-espresso"
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  ) : feedback === "thankyou" && revealAtIso ? (
                    <motion.div
                      key="thankyou-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-full"
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
                        onClick={() => {
                          setFeedback("idle");
                          setProgress(0);
                        }}
                        className="mt-3 text-xs font-medium text-espresso/70 underline underline-offset-2 hover:text-espresso"
                      >
                        Dismiss
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {validationMessage ? (
            <motion.div
              key="validation-card"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: getValidationCardHeight(validationMessage), opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-champagne/35 bg-champagne/25 px-4 py-2">
                <p className="text-sm text-espresso/80 leading-tight" role="alert">
                  {validationMessage}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error ? (
          <p className="text-sm text-espresso/80">
            <span className="font-medium">Upload failed.</span> {error}
          </p>
        ) : null}

        <div className="mt-0 flex justify-center">
          <PrimaryButton
            onClick={submit}
            disabled={uploading}
            type="button"
            className="w-full sm:w-auto sm:min-w-[220px]"
          >
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

