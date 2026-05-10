"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { ROUTES } from "@/config/routes";
import type { Service } from "@/types/business";

export function ServicesEditor({
  businessId, siteId, services, onChange,
}: {
  businessId: string;
  siteId: string;
  services: Service[];
  onChange: (s: Service[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", priceLabel: "" });
  const [pending, setPending] = useState<string | null>(null);

  async function add() {
    if (!draft.title.trim()) {
      toast.error("Titre requis");
      return;
    }
    setPending("add");
    try {
      const res = await fetch(ROUTES.apiServicesEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          siteId,
          title: draft.title.trim(),
          description: draft.description.trim() || null,
          priceLabel: draft.priceLabel.trim() || null,
          position: services.length,
          isVisible: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Erreur");
        return;
      }
      onChange([...services, data.data]);
      setDraft({ title: "", description: "", priceLabel: "" });
      setAdding(false);
      toast.success("Service ajouté.");
    } finally {
      setPending(null);
    }
  }

  async function remove(id: string) {
    setPending(id);
    try {
      const res = await fetch(`${ROUTES.apiServicesEndpoint}/${id}`, { method: "DELETE" });
      if (res.ok) {
        onChange(services.filter((s) => s.id !== id));
        toast.success("Service supprimé.");
      }
    } finally {
      setPending(null);
    }
  }

  async function toggleVisible(svc: Service) {
    setPending(svc.id);
    try {
      const res = await fetch(`${ROUTES.apiServicesEndpoint}/${svc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !svc.isVisible }),
      });
      if (res.ok) {
        const data = await res.json();
        onChange(services.map((s) => (s.id === svc.id ? data.data : s)));
      }
    } finally {
      setPending(null);
    }
  }

  return (
    <Card>
      <div className="px-6 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg text-ink-900 tracking-tight">Services</h2>
            <p className="text-xs text-ink-400">Ce que vous proposez. Visible sur la page publique.</p>
          </div>
          {!adding && (
            <Button onClick={() => setAdding(true)} variant="ghost" size="sm">
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          )}
        </div>

        {/* Liste */}
        {services.length === 0 && !adding && (
          <div className="rounded-xl border border-dashed border-cream-400 p-6 text-center">
            <p className="text-sm text-ink-400 mb-3">Aucun service. Ajoutez vos prestations principales pour aider vos visiteurs à comprendre.</p>
            <Button onClick={() => setAdding(true)} variant="primary" size="sm">
              <Plus className="h-4 w-4" /> Ajouter mon premier service
            </Button>
          </div>
        )}

        {services.length > 0 && (
          <ul className="space-y-2 mb-3">
            {services.map((svc) => (
              <li
                key={svc.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200"
              >
                <GripVertical className="h-4 w-4 text-ink-300 flex-shrink-0 cursor-move" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-sm ${svc.isVisible ? "text-ink-900" : "text-ink-300 line-through"}`}>
                      {svc.title}
                    </span>
                    {svc.priceLabel && (
                      <span className="text-xs text-moss-700 bg-moss-50 px-2 py-0.5 rounded-md">
                        {svc.priceLabel}
                      </span>
                    )}
                  </div>
                  {svc.description && (
                    <div className="text-xs text-ink-400 truncate mt-0.5">{svc.description}</div>
                  )}
                </div>
                <button
                  onClick={() => toggleVisible(svc)}
                  className="p-2 rounded-md hover:bg-cream-200 transition-colors"
                  title={svc.isVisible ? "Masquer" : "Afficher"}
                  disabled={pending === svc.id}
                >
                  {svc.isVisible
                    ? <Eye className="h-4 w-4 text-ink-500" />
                    : <EyeOff className="h-4 w-4 text-ink-300" />}
                </button>
                <button
                  onClick={() => remove(svc.id)}
                  className="p-2 rounded-md hover:bg-red-50 hover:text-red-600 text-ink-300 transition-colors"
                  disabled={pending === svc.id}
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Form add */}
        {adding && (
          <div className="rounded-xl border border-moss-200 bg-moss-50/50 p-4 space-y-3">
            <Field label="Nom du service">
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Coupe + barbe"
                autoFocus
              />
            </Field>
            <Field label="Description (optionnel)">
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Coupe précise + entretien complet de la barbe."
                rows={2}
              />
            </Field>
            <Field label="Prix affiché (optionnel)" hint='ex : "à partir de 25€" ou "sur devis"'>
              <Input
                value={draft.priceLabel}
                onChange={(e) => setDraft({ ...draft, priceLabel: e.target.value })}
                placeholder="à partir de 25€"
              />
            </Field>
            <div className="flex gap-2">
              <Button onClick={add} variant="primary" size="sm" loading={pending === "add"}>
                Ajouter
              </Button>
              <Button onClick={() => { setAdding(false); setDraft({ title: "", description: "", priceLabel: "" }); }} variant="ghost" size="sm">
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
