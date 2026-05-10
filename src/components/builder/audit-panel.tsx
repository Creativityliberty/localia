"use client";

import { Check, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditReport, AuditSeverity } from "@/server/audit/audit-engine";

const STATUS_LABEL: Record<AuditReport["status"], { label: string; color: string }> = {
  "no-go": { label: "À démarrer", color: "text-red-600" },
  "draft-fragile": { label: "Brouillon fragile", color: "text-amber-600" },
  "mvp-acceptable": { label: "Prêt à publier", color: "text-moss-700" },
  "ready-preview": { label: "Aperçu solide", color: "text-moss-700" },
  "commercial-ready": { label: "Production-ready", color: "text-moss-800" },
};

const SEVERITY_ICON: Record<AuditSeverity, React.ReactNode> = {
  info: <AlertCircle className="h-4 w-4 text-info" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  blocker: <AlertCircle className="h-4 w-4 text-danger" />,
};

export function AuditPanel({ audit }: { audit: AuditReport }) {
  const { scorecard, blockers, warnings, status } = audit;
  const statusInfo = STATUS_LABEL[status];
  const pct = scorecard.total;

  return (
    <div className="rounded-2xl bg-white border border-cream-300 overflow-hidden">
      {/* Score */}
      <div className="p-6 border-b border-cream-200 bg-gradient-to-br from-cream-50 to-white">
        <div className="text-xs uppercase tracking-wider text-ink-400 mb-2">Score de qualité</div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-display text-5xl tracking-tight tabular-nums text-ink-900">{pct}</span>
          <span className="text-ink-400 text-sm">/100</span>
        </div>
        <div className={cn("text-sm font-medium mb-3", statusInfo.color)}>{statusInfo.label}</div>
        <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              pct < 50 ? "bg-red-400" : pct < 70 ? "bg-amber-400" : "bg-moss-400"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Détail scorecard */}
      <div className="p-5 border-b border-cream-200">
        <div className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-3">Détail</div>
        <ul className="space-y-2 text-xs">
          {[
            { label: "Identité", val: scorecard.identity, max: 10 },
            { label: "Confiance locale", val: scorecard.localTrust, max: 10 },
            { label: "Clarté du contenu", val: scorecard.contentClarity, max: 15 },
            { label: "Qualité des CTA", val: scorecard.ctaQuality, max: 15 },
            { label: "Capture de leads", val: scorecard.leadCapture, max: 10 },
            { label: "QR code", val: scorecard.qrReadiness, max: 10 },
            { label: "Google Business", val: scorecard.googleBusinessReadiness, max: 10 },
            { label: "Analytics", val: scorecard.analytics, max: 10 },
            { label: "Sécurité", val: scorecard.securityAccessibility, max: 5 },
            { label: "Maintenance", val: scorecard.maintenanceReadiness, max: 5 },
          ].map((item) => {
            const okPct = (item.val / item.max) * 100;
            return (
              <li key={item.label} className="flex items-center gap-3">
                <span className="text-ink-500 w-32 flex-shrink-0">{item.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-cream-200 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      okPct < 50 ? "bg-red-300" : okPct < 80 ? "bg-amber-300" : "bg-moss-400"
                    )}
                    style={{ width: `${okPct}%` }}
                  />
                </div>
                <span className="text-ink-400 tabular-nums w-10 text-right">
                  {item.val}/{item.max}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Findings */}
      {(blockers.length > 0 || warnings.length > 0) && (
        <div className="p-5">
          {blockers.length > 0 && (
            <>
              <div className="text-xs font-medium uppercase tracking-wider text-danger mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Bloquants ({blockers.length})
              </div>
              <ul className="space-y-2 mb-4">
                {blockers.map((f) => (
                  <li key={f.id} className="text-xs">
                    <div className="flex items-start gap-2">
                      {SEVERITY_ICON[f.severity]}
                      <div>
                        <div className="text-ink-900 font-medium">{f.message}</div>
                        <div className="text-ink-400 mt-0.5">{f.fix}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {warnings.length > 0 && (
            <>
              <div className="text-xs font-medium uppercase tracking-wider text-warning mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> À améliorer ({warnings.length})
              </div>
              <ul className="space-y-2">
                {warnings.map((f) => (
                  <li key={f.id} className="text-xs">
                    <div className="flex items-start gap-2">
                      {SEVERITY_ICON[f.severity]}
                      <div>
                        <div className="text-ink-900 font-medium">{f.message}</div>
                        <div className="text-ink-400 mt-0.5">{f.fix}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {blockers.length === 0 && warnings.length === 0 && (
        <div className="p-5 flex items-start gap-2 text-sm text-moss-800">
          <Check className="h-4 w-4 mt-0.5 text-moss-600" />
          <span>Tout est en ordre. Vous pouvez publier.</span>
        </div>
      )}
    </div>
  );
}
