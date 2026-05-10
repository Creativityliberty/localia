import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Icône Lucide ou ReactNode */
  icon?: React.ReactNode;
  /** Titre court */
  title: string;
  /** Description orientée action */
  description: string;
  /** Action principale */
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Action secondaire optionnelle */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

/**
 * Règle UI Localia : chaque empty state doit vendre l'action suivante.
 * Mauvais : "Aucun fichier."
 * Bon : "Votre médiathèque est vide. Ajoutez votre logo, vos photos ou
 * votre menu pour enrichir votre page Localia." [Ajouter des fichiers]
 */
export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-2xl border border-dashed border-cream-400 bg-cream-50",
        "px-6 py-12 sm:py-16",
        className
      )}
    >
      {icon ? (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-50 text-moss-700">
          {icon}
        </div>
      ) : null}

      <h3 className="font-display text-2xl font-medium text-ink-900 tracking-tight mb-2">
        {title}
      </h3>
      <p className="max-w-md text-sm text-ink-400 leading-relaxed mb-6 text-pretty">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction ? (
            primaryAction.href ? (
              <Button asChild variant="primary">
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
            ) : (
              <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
            )
          ) : null}
          {secondaryAction ? (
            secondaryAction.href ? (
              <Button asChild variant="ghost">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant="ghost" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}
