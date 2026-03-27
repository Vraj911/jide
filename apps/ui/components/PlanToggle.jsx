"use client";

import { cn } from "@/lib/utils";

export function PlanToggle({ plan, onChange, className = "" }) {
  return (
    <div className={cn("inline-flex rounded-full border border-border/60 bg-background/70 p-1", className)}>
      <button
        type="button"
        onClick={() => onChange("free")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          plan === "free" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Free Preview
      </button>
      <button
        type="button"
        onClick={() => onChange("paid")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          plan === "paid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Paid Preview
      </button>
    </div>
  );
}
