"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckSquare,
  Download,
  Heart,
  Square,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";

import { SectionHeader } from "@/components/SectionHeader";
import {
  staggerContainer,
  staggerItem,
  transitionEditorialStagger,
} from "@/lib/motion";

export type GalleryPhoto = {
  id: string;
  created_at: string;
  guest_name: string;
  signed_url: string | null;
  like_count: number;
  liked_by_me: boolean;
};

type Props = {
  photos: GalleryPhoto[];
  onPhotoClick: (index: number) => void;
  onToggleLike: (photoId: string) => void;
};

export function GalleryMasonry({ photos, onPhotoClick, onToggleLike }: Props) {
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(photos.map((p) => p.id)));
  }, [photos]);

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelected(new Set());
  }, []);

  const downloadSelected = useCallback(async () => {
    const toDownload = photos.filter(
      (p) => selected.has(p.id) && p.signed_url,
    );
    if (toDownload.length === 0) return;
    setDownloading(true);

    for (const photo of toDownload) {
      if (!photo.signed_url) continue;
      try {
        const res = await fetch(photo.signed_url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ext =
          blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
        a.download = `wedding-photo-${photo.id.slice(0, 8)}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        // Small delay between downloads so browser doesn't block them
        await new Promise((r) => setTimeout(r, 400));
      } catch {
        // Skip failed downloads
      }
    }

    setDownloading(false);
  }, [photos, selected]);

  return (
    <section className="rounded-3xl border border-espresso/10 bg-white/25 p-6 backdrop-blur">
      <SectionHeader
        label="The Gallery"
        title="A living mosaic of the day"
        description={
          selectMode
            ? `${selected.size} of ${photos.length} selected`
            : "Tap any image to view it full size."
        }
        aside={
          <div className="flex items-center gap-2">
            <p className="text-xs text-espresso/55">{photos.length} photos</p>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="mt-4 flex items-center gap-2">
        {!selectMode ? (
          <button
            type="button"
            onClick={() => setSelectMode(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-espresso/15 bg-cream/80 px-3 py-1.5 text-xs font-medium text-espresso/70 transition-colors hover:bg-champagne/30 hover:text-espresso"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Select
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={exitSelectMode}
              className="inline-flex items-center gap-1.5 rounded-full border border-espresso/15 bg-cream/80 px-3 py-1.5 text-xs font-medium text-espresso/70 transition-colors hover:bg-champagne/30 hover:text-espresso"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              type="button"
              onClick={selected.size === photos.length ? deselectAll : selectAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-espresso/15 bg-cream/80 px-3 py-1.5 text-xs font-medium text-espresso/70 transition-colors hover:bg-champagne/30 hover:text-espresso"
            >
              {selected.size === photos.length ? (
                <>
                  <Square className="h-3.5 w-3.5" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-3.5 w-3.5" />
                  Select All
                </>
              )}
            </button>
            <AnimatePresence>
              {selected.size > 0 ? (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={downloadSelected}
                  disabled={downloading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-champagne-2/40 bg-champagne/30 px-3 py-1.5 text-xs font-medium text-espresso transition-colors hover:bg-champagne/50 disabled:opacity-50"
                >
                  <Download
                    className={`h-3.5 w-3.5 ${downloading ? "animate-pulse" : ""}`}
                  />
                  {downloading
                    ? "Downloading…"
                    : `Download ${selected.size}`}
                </motion.button>
              ) : null}
            </AnimatePresence>
          </>
        )}
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mt-6 columns-2 gap-3 sm:columns-3 lg:columns-4"
      >
        {photos.map((p, index) => (
          <motion.div
            key={p.id}
            initial={false}
            variants={staggerItem}
            transition={transitionEditorialStagger}
            className={`group relative mb-3 block cursor-pointer break-inside-avoid overflow-hidden rounded-2xl border bg-cream/60 transition-all ${
              selectMode && selected.has(p.id)
                ? "border-champagne-2 shadow-[0_0_0_2px_rgba(203,180,142,0.4),0_6px_22px_rgba(45,36,30,0.12)]"
                : "border-espresso/10 shadow-[0_6px_22px_rgba(45,36,30,0.08)] hover:shadow-[0_12px_30px_rgba(45,36,30,0.12)]"
            }`}
            onClick={() => {
              if (selectMode) {
                toggleSelect(p.id);
              } else {
                onPhotoClick(index);
              }
            }}
          >
            {/* Selection checkbox overlay */}
            {selectMode ? (
              <div className="absolute left-2 top-2 z-10">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                    selected.has(p.id)
                      ? "border-champagne-2 bg-champagne-2 text-white"
                      : "border-white/80 bg-black/30 text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </div>
              </div>
            ) : null}

            {p.signed_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.signed_url}
                alt={
                  p.guest_name
                    ? `Photo by ${p.guest_name}`
                    : "Wedding photo"
                }
                loading="lazy"
                decoding="async"
                className={`w-full object-cover transition-transform ${
                  selectMode
                    ? selected.has(p.id)
                      ? "scale-[0.96]"
                      : ""
                    : "group-hover:scale-[1.02]"
                }`}
                draggable={false}
              />
            ) : null}

            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-espresso/80">
                  {p.guest_name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Heart – always visible so users can like from 0 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!selectMode) onToggleLike(p.id);
                  }}
                  className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                  aria-label={p.liked_by_me ? "Unlike" : "Like"}
                >
                  <Heart
                    className={`h-3 w-3 ${
                      p.liked_by_me
                        ? "fill-red-400 text-red-400"
                        : "text-espresso/40 hover:text-espresso/60"
                    }`}
                  />
                  {p.like_count > 0 ? (
                    <span
                      className={`${
                        p.liked_by_me
                          ? "font-medium text-red-400"
                          : "text-espresso/50"
                      }`}
                    >
                      {p.like_count}
                    </span>
                  ) : null}
                </button>
                <p className="text-[11px] text-espresso/55">
                  {new Date(p.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
