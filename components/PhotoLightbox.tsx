"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Heart, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { savePhoto } from "@/lib/save-photo";

export type LightboxPhoto = {
  id: string;
  created_at: string;
  guest_name: string;
  signed_url: string | null;
  like_count: number;
  liked_by_me: boolean;
};

type Props = {
  photos: LightboxPhoto[];
  /** Index of the currently displayed photo, or null to hide lightbox */
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onToggleLike: (photoId: string) => void;
};

export function PhotoLightbox({
  photos,
  activeIndex,
  onClose,
  onNavigate,
  onToggleLike,
}: Props) {
  const open = activeIndex !== null;
  const photo = open ? photos[activeIndex] : null;
  const [downloading, setDownloading] = useState(false);
  const [direction, setDirection] = useState(0); // -1 = left, 1 = right
  const constraintsRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);

  // Lock body scroll when open: use position fixed so the body doesn’t expand
  // and we can restore scroll position when closing (avoids gallery “expanding” bug).
  useEffect(() => {
    if (open) {
      scrollYRef.current = window.scrollY;
      const body = document.body;
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
    } else {
      const body = document.body;
      const savedScrollY = scrollYRef.current;
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      // Restore scroll after reflow so the browser doesn’t reset scroll to 0
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedScrollY);
        });
      });
    }
    return () => {
      const body = document.body;
      const saved = scrollYRef.current;
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, saved);
        });
      });
    };
  }, [open]);

  const goPrev = useCallback(() => {
    if (activeIndex === null || activeIndex <= 0) return;
    setDirection(-1);
    onNavigate(activeIndex - 1);
  }, [activeIndex, onNavigate]);

  const goNext = useCallback(() => {
    if (activeIndex === null || activeIndex >= photos.length - 1) return;
    setDirection(1);
    onNavigate(activeIndex + 1);
  }, [activeIndex, photos.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose, goPrev, goNext]);

  const handleDownload = useCallback(async () => {
    if (!photo?.signed_url) return;
    setDownloading(true);
    try {
      const res = await fetch(photo.signed_url);
      const blob = await res.blob();
      await savePhoto(blob, photo.id);
    } catch {
      // Fallback: open in new tab
      window.open(photo.signed_url, "_blank");
    } finally {
      setDownloading(false);
    }
  }, [photo]);

  const hasPrev = activeIndex !== null && activeIndex > 0;
  const hasNext = activeIndex !== null && activeIndex < photos.length - 1;

  // Image slide variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence>
      {open && photo ? (
        <motion.div
          key="lightbox-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Content container - stop propagation so clicking the photo doesn't close */}
          <motion.div
            key="lightbox-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative z-10 flex max-h-[90vh] max-w-[92vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
            ref={constraintsRef}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white/80 transition-colors hover:bg-white/25 hover:text-white sm:-right-12 sm:top-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image area */}
            <div className="relative overflow-hidden rounded-2xl bg-espresso/20">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={photo.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                >
                  {photo.signed_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.signed_url}
                      alt={
                        photo.guest_name
                          ? `Photo by ${photo.guest_name}`
                          : "Wedding photo"
                      }
                      className="max-h-[75vh] max-w-[90vw] rounded-2xl object-contain sm:max-w-[80vw]"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-64 w-64 items-center justify-center text-white/50">
                      Photo unavailable
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom bar */}
            <div className="mt-4 flex w-full max-w-md items-center justify-between gap-4 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md">
              {/* Guest info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {photo.guest_name}
                </p>
                <p className="text-xs text-white/60">
                  {new Date(photo.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Heart / Like */}
                <button
                  onClick={() => onToggleLike(photo.id)}
                  className="group flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-white/10"
                  aria-label={photo.liked_by_me ? "Unlike" : "Like"}
                >
                  <motion.div
                    whileTap={{ scale: 1.3 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        photo.liked_by_me
                          ? "fill-red-400 text-red-400"
                          : "text-white/70 group-hover:text-red-300"
                      }`}
                    />
                  </motion.div>
                  {photo.like_count > 0 ? (
                    <span
                      className={`text-sm font-medium ${
                        photo.liked_by_me ? "text-red-300" : "text-white/70"
                      }`}
                    >
                      {photo.like_count}
                    </span>
                  ) : null}
                </button>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                  aria-label="Download"
                >
                  <Download
                    className={`h-5 w-5 ${downloading ? "animate-pulse" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Navigation arrows */}
            {hasPrev ? (
              <button
                onClick={goPrev}
                className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 rounded-full bg-white/15 p-2 text-white/80 transition-colors hover:bg-white/25 hover:text-white max-sm:left-1 max-sm:translate-x-0"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : null}
            {hasNext ? (
              <button
                onClick={goNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full rounded-full bg-white/15 p-2 text-white/80 transition-colors hover:bg-white/25 hover:text-white max-sm:right-1 max-sm:translate-x-0"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
