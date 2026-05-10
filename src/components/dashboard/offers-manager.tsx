"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Sparkles, Trash2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/config/routes";
import type { Offer } from "@/types/business";

export function OffersManager({ businessId, initialOffers }: { businessId: string; initialOffers: Offer[] }) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "", description: "", promoCode: "", rewardLabel: "", isWelcome: false,
  });

  async function add() {
    if (!draft.title.trim()) return toast.error("Titre requis");
    setPending("add");
    try {
      const res = await fetch(ROUTES.apiOffers, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          title: draft.title.trim(),
          description: draft.description.trim() || null,
          promoCode: draft.promoCode.trim() || null,
          rewardLabel: draft.rewardLabel.trim() || null,
          isWelcome: draft.isWelcome,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Erreur");
        return;
      }
      setOffers([data.data, ...offers]);
      setAdding(false);
      setDraft({ title: "", description: "", promoCode: "", rewardLabel: "", isWelcome: false });
      toast.success("Offre créée.");
    } finally {
      setPending(null);
    }
  }

  async function toggle(offer: Offer) {
    setPending(offer.id);
    try {
      const res = await fetch(`${ROUTES.apiOffers}/${offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setOffers(offers.map((o) => (o.id === offer.id ? data.data : o)));
      }
    } finally {
      setPending(null);
    }
  }

  async function remove(id: string) {
    setPending(id);
    try {
      const res = await fetch(`${ROUTES.apiOffers}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOffers(offers.filter((o) => o.id !== id));
        toast.success("Offre supprimée.");
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
            <Plus className="h-4 w-4" /> Nouvelle offre
          </Button>
        </div>
      )}

      {adding && (
        <Card className="mb-6">
          <div className="px-6 pt-5 pb-6 space-y-4">
            <h3 className="font-display text-lg text-ink-900">Nouvelle offre</h3>
            <Field label="Titre" hint="Court, chiffré, percutant.">
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="-10€ sur la première coupe"
              />
            </Field>
            <Field label="Description (optionnel)">
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Valable pour les nouveaux clients sur RDV."
                rows={2}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Code promo (optionnel)">
                <Input
                  value={draft.promoCode}
                  onChange={(e) => setDraft({ ...draft, promoCode: e.target.value.toUpperCase() })}
                  placeholder="BIENVENUE"
                />
              </Field>
              <Field label="Récompense affichée">
                <Input
                  value={draft.rewardLabel}
                  onChange={(e) => setDraft({ ...draft, rewardLabel: e.target.value })}
                  placeholder="-10€ première visite"
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-500 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.isWelcome}
                onChange={(e) => setDraft({ ...draft, isWelcome: e.target.checked })}
                className="h-4 w-4 rounded text-moss-700"
              />
              Marquer comme offre de bienvenue (mise en avant sur le site)
            </label>
            <div className="flex gap-2">
              <Button onClick={add} variant="primary" size="sm" loading={pending === "add"}>
                Créer
              </Button>
              <Button onClick={() => setAdding(false)} variant="ghost" size="sm">Annuler</Button>
            </div>
          </div>
        </Card>
      )}

      {offers.length === 0 && !adding ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="Aucune offre active"
          description="Une offre de bienvenue chiffrée (ex : -10€ première visite) double souvent les conversions. Lancez la vôtre."
          primaryAction={{ label: "Créer mon offre", onClick: () => setAdding(true) }}
        />
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <div className="px-5 py-4 flex items-start gap-4">
                <div className="text-2xl flex-shrink-0">🎁</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium text-ink-900">{offer.title}</h3>
                    {offer.isWelcome && <Badge variant="accent">Bienvenue</Badge>}
                    {!offer.isActive && <Badge variant="default">Pause</Badge>}
                  </div>
                  {offer.description && (
                    <p className="text-sm text-ink-500 mb-1">{offer.description}</p>
                  )}
                  {offer.promoCode && (
                    <code className="inline-block text-xs px-2 py-0.5 bg-cream-100 rounded">
                      {offer.promoCode}
                    </code>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    onClick={() => toggle(offer)} variant="ghost" size="sm"
                    loading={pending === offer.id}
                  >
                    {offer.isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    onClick={() => remove(offer.id)} variant="ghost" size="sm"
                    loading={pending === offer.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
