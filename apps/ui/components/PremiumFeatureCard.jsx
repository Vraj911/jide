"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PremiumFeatureCard({
  title,
  description,
  items = [],
  enabled = false,
  ctaLabel = "Upgrade with Razorpay",
}) {
  return (
    <Card className="border-border/60 bg-card/70 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {enabled ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <Lock className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {enabled ? "Paid active" : "Paid only"}
            </span>
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            enabled
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              : "border-amber-500/30 bg-amber-500/10 text-amber-600"
          )}
        >
          {enabled ? "Available" : "Locked"}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl border border-border/50 bg-background/40 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">{item.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!enabled && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button asChild className="glow-primary">
            <Link href="/auth/signup">{ctaLabel}</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            UI preview only. Billing flow is documented separately.
          </p>
        </div>
      )}
    </Card>
  );
}
