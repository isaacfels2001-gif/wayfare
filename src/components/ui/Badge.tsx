import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "blue" | "amber" | "green" | "rose" | "slate";

const toneClasses: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
  slate: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

export function Badge({ tone = "slate", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "confirmed":
      return "green";
    case "pending":
      return "amber";
    case "cancelled":
    case "payment_failed":
      return "rose";
    default:
      return "slate";
  }
}
