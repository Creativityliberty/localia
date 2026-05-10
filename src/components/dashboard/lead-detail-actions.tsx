"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { ROUTES } from "@/config/routes";
import type { Lead, LeadStatus } from "@/types/business";

const ACTIONS: { label: string; status: LeadStatus; variant: "primary" | "ghost" | "soft" | "accent" }[] = [
  { label: "Marquer contacté", status: "contacted", variant: "primary" },
  { label: "Marquer converti", status: "converted", variant: "accent" },
  { label: "Archiver", status: "archived", variant: "ghost" },
];

export function LeadDetailActions({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [notes, setNotes] = useState(lead.internalNotes ?? "");
  const [pending, setPending] = useState<string | null>(null);

  async function update(status: LeadStatus, internalNotes?: string) {
    setPending(status);
    try {
      const res = await fetch(ROUTES.apiLead(lead.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internalNotes: internalNotes ?? notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Erreur");
        return;
      }
      toast.success("Mis à jour.");
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  async function saveNotes() {
    setPending("notes");
    try {
      const res = await fetch(ROUTES.apiLead(lead.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: lead.status, internalNotes: notes }),
      });
      if (res.ok) toast.success("Notes enregistrées.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <Field label="Notes internes" htmlFor="notes" hint="Ces notes ne sont visibles que par vous.">
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ajouter une note sur cette demande…"
          rows={3}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button onClick={saveNotes} variant="ghost" size="sm" loading={pending === "notes"}>
          Enregistrer les notes
        </Button>
        {ACTIONS.map((a) => (
          <Button
            key={a.status}
            onClick={() => update(a.status)}
            variant={a.variant}
            size="sm"
            loading={pending === a.status}
            disabled={lead.status === a.status}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
