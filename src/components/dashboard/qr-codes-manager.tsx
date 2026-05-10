"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Plus, QrCode, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/config/routes";
import {
  buildQrTrackingUrl, buildDefaultTargetUrl,
  buildQrPosterTitle, downloadDataUrl, canvasToPngDataUrl,
  svgElementToString,
} from "@/lib/qr";
import type { QrCode, QrPurpose } from "@/types/business";

const PURPOSES: { value: QrPurpose; label: string; emoji: string }[] = [
  { value: "site", label: "Mon site", emoji: "🌐" },
  { value: "menu", label: "Menu", emoji: "📋" },
  { value: "offer", label: "Offre du moment", emoji: "🎁" },
  { value: "review", label: "Avis Google", emoji: "⭐" },
  { value: "booking", label: "Réservation", emoji: "📅" },
  { value: "whatsapp", label: "WhatsApp", emoji: "💬" },
  { value: "loyalty", label: "Fidélité", emoji: "✨" },
  { value: "custom", label: "Personnalisé", emoji: "🔗" },
];

interface Props {
  businessId: string;
  siteSlug: string | null;
  siteId: string | null;
  whatsappNumber: string | null;
  googleReviewUrl: string | null;
  bookingUrl: string | null;
  initialQrCodes: QrCode[];
}

export function QrCodesManager({
  businessId, siteSlug, siteId, whatsappNumber, googleReviewUrl, bookingUrl, initialQrCodes,
}: Props) {
  const [qrCodes, setQrCodes] = useState<QrCode[]>(initialQrCodes);
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ purpose: QrPurpose; label: string; customUrl: string }>({
    purpose: "site",
    label: "QR vitrine",
    customUrl: "",
  });

  function selectPurpose(purpose: QrPurpose) {
    const meta = PURPOSES.find((p) => p.value === purpose)!;
    setDraft({ ...draft, purpose, label: `QR ${meta.label}` });
  }

  async function add() {
    if (!draft.label.trim()) {
      toast.error("Libellé requis");
      return;
    }
    const targetUrl = buildDefaultTargetUrl({
      purpose: draft.purpose,
      siteSlug,
      whatsappNumber,
      googleReviewUrl,
      bookingUrl,
      customUrl: draft.customUrl,
    });

    setPending("add");
    try {
      const res = await fetch(ROUTES.apiQrCodes, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId, siteId,
          label: draft.label.trim(),
          purpose: draft.purpose,
          targetUrl,
          utmCampaign: draft.purpose,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Erreur");
        return;
      }
      setQrCodes([data.data, ...qrCodes]);
      setAdding(false);
      setDraft({ purpose: "site", label: "QR vitrine", customUrl: "" });
      toast.success("QR code créé.");
    } finally {
      setPending(null);
    }
  }

  async function remove(id: string) {
    setPending(id);
    try {
      const res = await fetch(`${ROUTES.apiQrCodes}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQrCodes(qrCodes.filter((q) => q.id !== id));
        toast.success("QR code désactivé.");
      }
    } finally {
      setPending(null);
    }
  }

  function downloadPng(qr: QrCode) {
    const canvas = document.querySelector<HTMLCanvasElement>(`canvas[data-qr-id="${qr.id}"]`);
    if (!canvas) return toast.error("Canvas introuvable.");
    const dataUrl = canvasToPngDataUrl(canvas);
    downloadDataUrl(dataUrl, `localia-qr-${qr.shortToken}.png`);
  }

  function downloadSvg(qr: QrCode) {
    const svg = document.querySelector<SVGSVGElement>(`svg[data-qr-id="${qr.id}"]`);
    if (!svg) return toast.error("SVG introuvable.");
    const str = svgElementToString(svg);
    const blob = new Blob([str], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `localia-qr-${qr.shortToken}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Add button */}
      {!adding && (
        <div className="mb-6">
          <Button onClick={() => setAdding(true)} variant="primary" size="md">
            <Plus className="h-4 w-4" /> Créer un QR code
          </Button>
        </div>
      )}

      {/* Form */}
      {adding && (
        <Card className="mb-6">
          <div className="px-6 pt-5 pb-6 space-y-4">
            <h3 className="font-display text-lg text-ink-900">Nouveau QR code</h3>

            <Field label="Type">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PURPOSES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => selectPurpose(p.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors ${
                      draft.purpose === p.value
                        ? "bg-ink-900 text-cream-50"
                        : "bg-white border border-cream-300 text-ink-500 hover:border-cream-500"
                    }`}
                  >
                    <span>{p.emoji}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Libellé interne" hint="Pour vous y retrouver dans la liste.">
              <Input
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="QR vitrine principale"
              />
            </Field>

            {draft.purpose === "custom" && (
              <Field label="URL cible">
                <Input
                  value={draft.customUrl}
                  onChange={(e) => setDraft({ ...draft, customUrl: e.target.value })}
                  placeholder="https://..."
                />
              </Field>
            )}

            <div className="flex gap-2">
              <Button onClick={add} variant="primary" size="sm" loading={pending === "add"}>
                Créer
              </Button>
              <Button onClick={() => setAdding(false)} variant="ghost" size="sm">
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* List */}
      {qrCodes.length === 0 && !adding ? (
        <EmptyState
          icon={<QrCode className="h-6 w-6" />}
          title="Aucun QR code pour l'instant"
          description="Créez un QR pour votre vitrine, votre flyer ou votre comptoir. Chaque scan sera tracé dans vos analytics."
          primaryAction={{ label: "Créer mon premier QR", onClick: () => setAdding(true) }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map((qr) => {
            const url = buildQrTrackingUrl(qr.shortToken);
            const purpose = PURPOSES.find((p) => p.value === qr.purpose);
            return (
              <Card key={qr.id} className="overflow-hidden">
                <div className="bg-cream-50 p-6 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-2xl">
                    <QRCodeCanvas
                      value={url}
                      size={160}
                      level="H"
                      includeMargin={false}
                      data-qr-id={qr.id}
                    />
                    {/* SVG hidden for download */}
                    <div className="hidden">
                      <QRCodeSVG value={url} size={160} level="H" data-qr-id={qr.id} />
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-ink-900 truncate">{qr.label}</div>
                      <div className="text-xs text-ink-400 mt-0.5">
                        {purpose?.emoji} {purpose?.label} · {qr.scanCount} scans
                      </div>
                    </div>
                    {!qr.isActive && <Badge variant="default">Inactif</Badge>}
                  </div>

                  <div className="text-[11px] text-ink-300 truncate font-mono mb-3">
                    /q/{qr.shortToken}
                  </div>

                  <div className="flex gap-1">
                    <Button onClick={() => downloadPng(qr)} variant="ghost" size="sm" className="flex-1">
                      <Download className="h-3.5 w-3.5" /> PNG
                    </Button>
                    <Button onClick={() => downloadSvg(qr)} variant="ghost" size="sm" className="flex-1">
                      <Download className="h-3.5 w-3.5" /> SVG
                    </Button>
                    <Button onClick={() => remove(qr.id)} variant="ghost" size="sm" loading={pending === qr.id}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
