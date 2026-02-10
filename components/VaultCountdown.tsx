"use client";

import { motion } from "framer-motion";
import { Hourglass } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { EditorialIconBox } from "@/components/EditorialIconBox";
import { SectionHeader } from "@/components/SectionHeader";
import { transitionEditorialStagger } from "@/lib/motion";

function clamp(n: number) {
  return Math.max(0, n);
}

function parts(ms: number) {
  const total = Math.floor(clamp(ms) / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

type Props = {
  revealAtIso: string;
  onReveal?: () => void;
};

export function VaultCountdown({ revealAtIso, onReveal }: Props) {
  const revealAt = useMemo(() => new Date(revealAtIso), [revealAtIso]);
  const [now, setNow] = useState(() => new Date());
  const onRevealFired = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const remainingMs = revealAt.getTime() - now.getTime();

  useEffect(() => {
    if (remainingMs <= 0 && onReveal && !onRevealFired.current) {
      onRevealFired.current = true;
      onReveal();
    }
  }, [remainingMs, onReveal]);

  const p = parts(remainingMs);

  return (
    <section className="rounded-3xl border border-espresso/10 bg-white/35 p-6 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          label="The Vault"
          title="Memories revealing in…"
          description="The gallery opens 24 hours after the wedding."
        />
        <EditorialIconBox>
          <Hourglass className="h-5 w-5 text-espresso/70" />
        </EditorialIconBox>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-3">
        {[
          { label: "Days", value: p.days },
          { label: "Hours", value: p.hours },
          { label: "Minutes", value: p.minutes },
          { label: "Seconds", value: p.seconds },
        ].map((x) => (
          <motion.div
            key={x.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionEditorialStagger}
            className="rounded-2xl border border-champagne/25 bg-cream/60 px-3 py-4 text-center"
          >
            <div className="font-[var(--font-playfair)] text-2xl leading-none">
              {String(x.value).padStart(2, "0")}
            </div>
            <div className="mt-2 text-[11px] font-medium tracking-[0.18em] uppercase text-espresso/55">
              {x.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

