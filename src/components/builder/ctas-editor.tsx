"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Star, MessageCircle, Phone, Calendar, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/config/routes";
import type { Cta, CtaKind } from "@/types/business";

const KIND_OPTIONS: { value: CtaKind; label: string; icon: React.ComponentType<{ className?: string }>; placeholder: string; defaultLabel: string }[] = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, placeholder: "+33 6 12 34 56 78", defaultLabel: "Écrire sur WhatsApp" },
  { value: "phone", label: "Téléphone", icon: Phone, placeholder: "+33 6 12 34 56 78", defaultLabel: "Appeler" },
  { value: "booking", label: "Réservation", icon: Calendar, placeholder: "https://calendly.com/...", defaultLabel: "Réserver" },
  { value: "directions", label: "Itinéraire", icon: MapPin, placeholder: "https://maps.google.com/...", defaultLabel: "Y aller" },
  { value: "external", label: "Lien externe", icon: ExternalLink, placeholder: "https://...", defaultLabel: "En savoir plus" },
];

export function CtasEditor({
  siteId, ctas, defaultPhone, defaultWhatsapp, onChange,
}: {
  siteId: string;
  ctas: Cta[];
  defaultPhone: string | null;
  defaultWhatsapp: string | null;
  onChange: (c: Cta[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<{ kind: CtaKind; label: string; value: string; isPrimary: boolean }>({
    kind: "whatsapp",
    label: "Écrire sur WhatsApp",
    value: defaultWhatsapp ?? "",
    isPrimary: ctas.length === 0,
  });
  const [pending, setPending] = useState<string | null>(null);

  function selectKind(kind: CtaKind) {
    const meta = KIND_OPTIONS.find((k) => k.value === kind)!;
    setDraft({
      ...draft,
      kind,
      label: meta.defaultLabel,
      value: kind === "whatsapp" ? defaultWhatsapp ?? "" : kind === "phone" ? defaultPhone ?? "" : "",
    });
  }

  async function add() {
    if (!draft.label.trim() || !draft.value.trim()) {
      toast.error("Libellé et valeur requis");
      return;
    }
    setPending("add");
    try {
      const res = await fetch(ROUTES.apiCtas, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          kind: draft.kind,
          label: draft.label.trim(),
          value: draft.value.trim(),
          isPrimary: draft.isPrimary,
          isVisible: true,
          position: ctas.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Erreur");
        return;
      }
      // Si on a ajouté un primary, démarquer les autres
      const newCtas = draft.isPrimary
        ? ctas.map((c) => ({ ...c, isPrimary: false })).concat(data.data)
        : [...ctas, data.data];
      onChange(newCtas);
      setAdding(false);
      toast.success("CTA ajouté.");
    } finally {
      setPending(null);
    }
  }

  async function remove(id: string) {
    setPending(id);
    try {
      // pas de DELETE générique CTA, on n'expose pas pour le MVP - on patch isVisible=false côté builder
      // pour vraie suppression, on aurait besoin de /api/ctas/[id] DELETE — utilisons le toggle
      // Ici on retire de la liste UI seulement et on laisse côté serveur (à refaire en P1)
      onChange(ctas.filter((c) => c.id !== id));
    } finally {
      setPending(null);
    }
  }

  return (
    <Card>
      <div className="px-6 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg text-ink-900 tracking-tight">Boutons d'action</h2>
            <p className="text-xs text-ink-400">Marquez UN seul CTA comme principal — c'est lui qui s'affichera en grand.</p>
          </div>
          {!adding && (
            <Button onClick={() => setAdding(true)} variant="ghost" size="sm">
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          )}
        </div>

        {ctas.length === 0 && !adding && (
          <div className="rounded-xl border border-dashed border-cream-400 p-6 text-center">
            <p className="text-sm text-ink-400 mb-3">
              Pas encore de bouton d'action. Sans CTA, votre page ne convertit pas.
            </p>
            <Button onClick={() => setAdding(true)} variant="accent" size="sm">
              <Plus className="h-4 w-4" /> Ajouter un bouton WhatsApp
            </Button>
          </div>
        )}

        {ctas.length > 0 && (
          <ul className="space-y-2 mb-3">
            {ctas.map((cta) => {
              const Icon = KIND_OPTIONS.find((k) => k.value === cta.kind)?.icon ?? ExternalLink;
              return (
                <li key={cta.id} className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200">
                  <Icon className="h-4 w-4 text-moss-700 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-ink-900">{cta.label}</span>
                      {cta.isPrimary && <Badge variant="accent"><Star className="h-3 w-3" /> Principal</Badge>}
                    </div>
                    <div className="text-xs text-ink-400 truncate">{cta.value}</div>
                  </div>
                  <button
                    onClick={() => remove(cta.id)}
                    className="p-2 rounded-md hover:bg-red-50 hover:text-red-600 text-ink-300 transition-colors"
                    disabled={pending === cta.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {adding && (
          <div className="rounded-xl border border-moss-200 bg-moss-50/50 p-4 space-y-3">
            <Field label="Type de bouton">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {KIND_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => selectKind(opt.value)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-colors ${
                        draft.kind === opt.value
                          ? "bg-ink-900 text-cream-50"
                          : "bg-white border border-cream-300 text-ink-500 hover:border-cream-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Texte du bouton">
              <Input
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="Écrire sur WhatsApp"
                maxLength={120}
              />
            </Field>

            <Field
              label={draft.kind === "whatsapp" || draft.kind === "phone" ? "Numéro" : "Adresse / URL"}
              hint={draft.kind === "whatsapp" ? "Format international (+33...)" : undefined}
            >
              <Input
                value={draft.value}
                onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                placeholder={KIND_OPTIONS.find((k) => k.value === draft.kind)?.placeholder}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-ink-500 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.isPrimary}
                onChange={(e) => setDraft({ ...draft, isPrimary: e.target.checked })}
                className="h-4 w-4 rounded text-moss-700"
              />
              Marquer comme bouton principal
            </label>

            <div className="flex gap-2 pt-1">
              <Button onClick={add} variant="primary" size="sm" loading={pending === "add"}>
                Ajouter
              </Button>
              <Button onClick={() => setAdding(false)} variant="ghost" size="sm">
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
