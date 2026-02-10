import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

const baseClass =
  "rounded-2xl border border-espresso/10 bg-espresso/[0.03] p-3";

export function EditorialIconBox({ children, className }: Props) {
  return (
    <div className={className ? `${baseClass} ${className}` : baseClass}>
      {children}
    </div>
  );
}
