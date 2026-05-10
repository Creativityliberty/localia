"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Stars, Trash2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/config/routes";
import type { LoyaltyCard, LoyaltyKind } from "@/types/loyalty";

export function LoyaltyManager({ businessId, initialPrograms }: { businessId: string; initialPrograms: LoyaltyCard[] }) {
  const [programs, setPrograms] = useState<LoyaltyCard[]>(initialPrograms);
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "Carte fidélité",
    description: "",
    kind: "STAMP" as LoyaltyKind,
    stampsRequired: 10,
    rewardThresholdPoints: 100,
    pointsPerVisit: 1,
    rewardLabel: "1 prestation offerte",
    rewardDescription: "",
  });

  async function add() {
    if (!draft.name.trim() || !draft.rewardLabel.trim()) {
      return toast.error("Nom et récompense requis.");
    }
    setPending("add");
    try {
      const res = await fetch(ROUTES.apiLoyaltyCards, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          name: draft.name.trim(),
          description: draft.description.trim() || null,
          kind: draft.kind,
          stampsRequired: draft.stampsRequired,
          rewardThresholdPoints: draft.rewardThresholdPoints,
          pointsPerVisit: draft.pointsPerVisit,
          rewardLabel: draft.rewardLabel.trim(),
          rewardDescription: draft.rewardDescription.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Erreur");
        return;
      }
      setPrograms([data.data, ...programs]);
      setAdding(false);
      toast.success("Programme créé.");
    } finally {
      setPending(null);
    }
  }

  async function remove(id: string) {
    setPending(id);
    try {
      const res = await fetch(`${ROUTES.apiLoyaltyCards}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPrograms(programs.filter((p) => p.id !== id));
        toast.success("Programme désactivé.");
      }
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      {!adding && (
        <div className="mb-6">
          <Button onClick={() => setAdding(true)} variant="primary" size="md">
            <Plus className="h-4 w-4" /> Nouveau programme
          </Button>
        </div>
      )}

      {adding && (
        <Card className="mb-6">
          <div className="px-6 pt-5 pb-6 space-y-4">
            <h3 className="font-display text-lg text-ink-900">Nouveau programme fidélité</h3>

            <Field label="Type de programme">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, kind: "STAMP" })}
                  className={`p-4 rounded-xl text-left border-2 transition-colors ${
                    draft.kind === "STAMP" ? "border-moss-400 bg-moss-50" : "border-cream-300 bg-white"
                  }`}
                >
                  <div className="text-sm font-medium text-ink-900 mb-1">Tampons</div>
                  <div className="text-xs text-ink-400">10 visites = 1 cadeau. Simple, visuel.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, kind: "POINTS" })}
                  className={`p-4 rounded-xl text-left border-2 transition-colors ${
                    draft.kind === "POINTS" ? "border-moss-400 bg-moss-50" : "border-cream-300 bg-white"
                  }`}
                >
                  <div className="text-sm font-medium text-ink-900 mb-1">Points</div>
                  <div className="text-xs text-ink-400">100 points = récompense. Plus flexible.</div>
                </button>
              </div>
            </Field>

            <Field label="Nom du programme">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>

            {draft.kind === "STAMP" ? (
              <Field label="Nombre de tampons pour la récompense" hint="Entre 5 et 20 idéalement.">
                <Input
                  type="number"
                  min={2} max={50}
                  value={draft.stampsRequired}
                  onChange={(e) => setDraft({ ...draft, stampsRequired: Number(e.target.value) })}
                />
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Points par visite">
                  <Input
                    type="number" min={1}
                    value={draft.pointsPerVisit}
                    onChange={(e) => setDraft({ ...draft, pointsPerVisit: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Seuil récompense">
                  <Input
                    type="number" min={10}
                    value={draft.rewardThresholdPoints}
                    onChange={(e) => setDraft({ ...draft, rewardThresholdPoints: Number(e.target.value) })}
                  />
                </Field>
              </div>
            )}

            <Field label="Récompense (libellé court)">
              <Input
                value={draft.rewardLabel}
                onChange={(e) => setDraft({ ...draft, rewardLabel: e.target.value })}
                placeholder="1 coupe offerte"
              />
            </Field>
            <Field label="Détails (optionnel)">
              <Textarea
                value={draft.rewardDescription}
                onChange={(e) => setDraft({ ...draft, rewardDescription: e.target.value })}
                placeholder="Valable uniquement en boutique. Non cumulable."
                rows={2}
              />
            </Field>

            <div className="flex gap-2">
              <Button onClick={add} variant="primary" size="sm" loading={pending === "add"}>
                Créer
              </Button>
              <Button onClick={() => setAdding(false)} variant="ghost" size="sm">Annuler</Button>
            </div>
          </div>
        </Card>
      )}

      {programs.length === 0 && !adding ? (
        <EmptyState
          icon={<Stars className="h-6 w-6" />}
          title="Aucun programme fidélité"
          description="Une carte digitale (tampons ou points) fait revenir vos clients. Pas d'app à installer pour eux : juste un QR code et un lien."
          primaryAction={{ label: "Créer mon programme", onClick: () => setAdding(true) }}
        />
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <Card key={p.id}>
              <div className="px-5 py-4 flex items-start gap-4">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: p.cardColor, color: "#FFF" }}
                >
                  <Award className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium text-ink-900">{p.name}</h3>
                    <Badge variant="accent">{p.kind === "STAMP" ? "Tampons" : "Points"}</Badge>
                    {!p.isActive && <Badge variant="default">Inactif</Badge>}
                  </div>
                  <p className="text-sm text-ink-500 mb-1">
                    {p.kind === "STAMP"
                      ? `${p.stampsRequired} tampons → ${p.rewardLabel}`
                      : `${p.rewardThresholdPoints} points → ${p.rewardLabel}`}
                  </p>
                  {p.description && <p className="text-xs text-ink-400">{p.description}</p>}
                </div>
                <Button onClick={() => remove(p.id)} variant="ghost" size="sm" loading={pending === p.id}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
