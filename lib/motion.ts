/**
 * Editorial Luxury motion presets for consistent animation across the app.
 */
export const transitionEditorial = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
};

export const transitionEditorialSnappy = {
  type: "spring" as const,
  stiffness: 420,
  damping: 28,
  mass: 0.8,
};

export const transitionEditorialStagger = {
  type: "spring" as const,
  stiffness: 320,
  damping: 28,
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.04 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};
