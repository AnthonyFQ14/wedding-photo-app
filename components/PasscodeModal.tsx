"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useMemo, useState } from "react";

import { EditorialIconBox } from "@/components/EditorialIconBox";
import { PrimaryButton } from "@/components/PrimaryButton";
import { getErrorMessage } from "@/lib/get-error-message";
import { transitionEditorial } from "@/lib/motion";

type Props = {
  open: boolean;
  coupleNames: string;
  onAuthenticated: () => void;
  onClose: () => void;
};

export function PasscodeModal({
  open,
  coupleNames,
  onAuthenticated,
  onClose,
}: Props) {
  const [passcode, setPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => passcode.trim().length > 0 && !submitting,
    [passcode, submitting],
  );

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        throw new Error(getErrorMessage(j, "Invalid passcode"));
      }
      setPasscode("");
      onAuthenticated();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={transitionEditorial}
            className="relative w-full max-w-md rounded-3xl border border-champagne/30 bg-cream p-7 shadow-[0_18px_55px_rgba(45,36,30,0.20)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-[0.22em] uppercase text-espresso/65">
                  {coupleNames}&apos;s photo vault
                </p>
                <h2 className="mt-2 font-[var(--font-playfair)] text-2xl leading-tight">
                  Enter the shared passcode
                </h2>
              </div>
              <EditorialIconBox className="mt-1">
                <Lock className="h-5 w-5 text-espresso/70" />
              </EditorialIconBox>
            </div>

            <div className="mt-6">
              <label className="text-xs font-medium tracking-wide text-espresso/70">
                Passcode
              </label>
              <input
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder="••••••"
                className="input-editorial mt-2"
                autoFocus
                inputMode="text"
              />

              {error ? (
                <p className="mt-3 text-sm text-espresso/80">
                  <span className="font-medium">Try again.</span> {error}
                </p>
              ) : (
                <p className="mt-3 text-sm text-espresso/60">
                  Ask the hosts for the passcode or find it on the card with the
                  QR code.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <PrimaryButton type="button" onClick={submit} disabled={!canSubmit}>
                {submitting ? "Unlocking…" : "Enter"}
              </PrimaryButton>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

