"use client";

import { motion } from "framer-motion";

import { SectionHeader } from "@/components/SectionHeader";
import { staggerContainer, staggerItem, transitionEditorialStagger } from "@/lib/motion";

type Photo = {
  id: string;
  created_at: string;
  guest_name: string;
  signed_url: string | null;
};

type Props = {
  photos: Photo[];
};

export function GalleryMasonry({ photos }: Props) {
  return (
    <section className="rounded-3xl border border-espresso/10 bg-white/25 p-6 backdrop-blur">
      <SectionHeader
        label="The Gallery"
        title="A living mosaic of the day"
        description="Tap any image to zoom in your browser."
        aside={<p className="text-xs text-espresso/55">{photos.length} photos</p>}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mt-6 columns-2 gap-3 sm:columns-3 lg:columns-4"
      >
        {photos.map((p) => (
          <motion.a
            key={p.id}
            initial={false}
            variants={staggerItem}
            transition={transitionEditorialStagger}
            href={p.signed_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 block break-inside-avoid overflow-hidden rounded-2xl border border-espresso/10 bg-cream/60 shadow-[0_6px_22px_rgba(45,36,30,0.08)] hover:shadow-[0_12px_30px_rgba(45,36,30,0.12)] transition-shadow"
          >
            {p.signed_url ? (
              /* Plain img: signed URLs with tokens don't play well with next/image */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.signed_url}
                alt={p.guest_name ? `Photo by ${p.guest_name}` : "Wedding photo"}
                loading="lazy"
                decoding="async"
                className="w-full object-cover"
              />
            ) : null}
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <p className="truncate text-xs font-medium text-espresso/80">
                {p.guest_name}
              </p>
              <p className="text-[11px] text-espresso/55">
                {new Date(p.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}

