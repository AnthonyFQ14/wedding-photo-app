"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

import { transitionEditorialSnappy } from "@/lib/motion";

type Props = HTMLMotionProps<"button"> & {
  variant?: "primary" | "ghost";
};

export function PrimaryButton({
  className,
  variant = "primary",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne/60";

  const styles =
    variant === "primary"
      ? "bg-espresso text-cream hover:bg-espresso/90"
      : "border border-espresso/15 bg-transparent text-espresso hover:bg-espresso/[0.04]";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={transitionEditorialSnappy}
      className={[base, styles, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

