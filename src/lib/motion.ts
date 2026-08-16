import type { Variants, Transition } from "framer-motion";

// Presentation-only motion tokens. Shared so every surface in the app
// eases on the same curve — the thing that separates "animated" from
// "art directed". Curve is a fast-out/slow-in expo, tuned to feel
// settled (not springy) at 60fps.
export const EASE_OUT_EXPO: Transition["ease"] = [0.16, 1, 0.3, 1];

export const transition: Transition = {
  duration: 0.55,
  ease: EASE_OUT_EXPO,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.965 },
  show: { opacity: 1, scale: 1, transition },
};

/** Parent wrapper that cascades children in sequence. */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** Tighter cascade for long lists (table rows, threads). */
export const staggerTight: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.03 },
  },
};

/** Shared-layout spring for the active-nav indicator. */
export const navPillSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
};
