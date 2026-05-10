import * as React from "react";
import { cn, formatNumber } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number | null;
  suffix?: string;
  icon?: React.ReactNode;
  variant?: "default" | "accent";
  className?: string;
}

export function StatCard({
  label, value, delta, suffix, icon, variant = "default", className,
}: StatCardProps) {
  const isAccent = variant === "accent";
  return (
    <div
      className={cn(
        "rounded-2xl p-5 border transition-shadow hover:shadow-card",
        isAccent
          ? "bg-moss-50 border-moss-200"
          : "bg-white border-cream-300",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs text-ink-400 font-medium">{label}</div>
        {icon && (
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            isAccent ? "bg-moss-100 text-moss-700" : "bg-cream-100 text-ink-400"
          )}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn(
          "font-display text-3xl tracking-tight tabular-nums",
          isAccent ? "text-moss-900" : "text-ink-900"
        )}>
          {typeof value === "number" ? formatNumber(value) : value}
        </span>
        {suffix && <span className="text-sm text-ink-400">{suffix}</span>}
      </div>
      {delta !== undefined && delta !== null && (
        <div className={cn(
          "text-xs mt-1.5 font-medium",
          delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-ink-400"
        )}>
          {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"} {Math.abs(delta)}% vs période précédente
        </div>
      )}
    </div>
  );
}
