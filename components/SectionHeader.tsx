import type { ReactNode } from "react";

type Props = {
  label: string;
  title: string;
  description?: string;
  aside?: ReactNode;
};

export function SectionHeader({
  label,
  title,
  description,
  aside,
}: Props) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-medium tracking-[0.22em] uppercase text-espresso/60">
          {label}
        </p>
        <h2 className="mt-2 font-[var(--font-playfair)] text-xl leading-tight sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-espresso/60">{description}</p>
        ) : null}
      </div>
      {aside ?? null}
    </div>
  );
}
