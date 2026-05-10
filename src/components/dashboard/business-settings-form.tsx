"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { ROUTES } from "@/config/routes";
import { BUSINESS_CATEGORIES, CATEGORY_GROUPS } from "@/config/business-categories";
import type { Business } from "@/types/business";

export function BusinessSettingsForm({ business }: { business: Business }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    name: business.name,
    category: business.category,
    tagline: business.tagline ?? "",
    description: business.description ?? "",
    email: business.email ?? "",
    phone: business.phone ?? "",
    whatsappNumber: business.whatsappNumber ?? "",
    address: business.address ?? "",
    city: business.city ?? "",
    postalCode: business.postalCode ?? "",
    instagramUrl: business.instagramUrl ?? "",
    googleBusinessUrl: business.googleBusinessUrl ?? "",
    googleReviewUrl: business.googleReviewUrl ?? "",
    bookingUrl: business.bookingUrl ?? "",
  });

  function update(key: keyof typeof data, value: string) {
    setData({ ...data, [key]: value });
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(ROUTES.apiBusiness(business.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result?.error?.message ?? "Erreur");
        return;
      }
      toast.success("Enregistré.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Identité */}
      <Card>
        <div className="px-6 pt-5 pb-6 space-y-4">
          <h2 className="font-display text-lg text-ink-900 tracking-tight">Identité</h2>
          <Field label="Nom du commerce">
            <Input value={data.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Catégorie">
            <select
              value={data.category}
              onChange={(e) => update("category", e.target.value)}
              className="flex h-11 w-full rounded-lg border border-cream-400 bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss-200 focus:border-moss-400"
            >
              {CATEGORY_GROUPS.map((group) => (
                <optgroup key={group} label={group}>
                  {BUSINESS_CATEGORIES.filter((c) => c.group === group).map((c) => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label="Accroche courte" hint="Une phrase qui vous décrit. Affichée sous le titre.">
            <Input
              value={data.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              placeholder="Le snack qui régale les Lyonnais."
            />
          </Field>
          <Field label="Description longue">
            <Textarea
              value={data.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              placeholder="Cuisine maison, généreuse. Click & collect dispo. Privatisation possible."
            />
          </Field>
        </div>
      </Card>

      {/* Contact */}
      <Card>
        <div className="px-6 pt-5 pb-6 space-y-4">
          <h2 className="font-display text-lg text-ink-900 tracking-tight">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Email">
              <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Téléphone">
              <Input value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+33 4 78 12 34 56" />
            </Field>
            <Field label="WhatsApp" hint="Format international.">
              <Input value={data.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} placeholder="+33 6 12 34 56 78" />
            </Field>
          </div>
        </div>
      </Card>

      {/* Adresse */}
      <Card>
        <div className="px-6 pt-5 pb-6 space-y-4">
          <h2 className="font-display text-lg text-ink-900 tracking-tight">Adresse</h2>
          <Field label="Adresse">
            <Input value={data.address} onChange={(e) => update("address", e.target.value)} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Code postal" className="col-span-1">
              <Input value={data.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
            </Field>
            <Field label="Ville" className="col-span-2">
              <Input value={data.city} onChange={(e) => update("city", e.target.value)} />
            </Field>
          </div>
        </div>
      </Card>

      {/* Liens externes */}
      <Card>
        <div className="px-6 pt-5 pb-6 space-y-4">
          <h2 className="font-display text-lg text-ink-900 tracking-tight">Liens externes</h2>
          <Field label="Fiche Google Business">
            <Input value={data.googleBusinessUrl} onChange={(e) => update("googleBusinessUrl", e.target.value)} placeholder="https://g.page/..." />
          </Field>
          <Field label="Lien Avis Google" hint="Le lien direct pour laisser un avis.">
            <Input value={data.googleReviewUrl} onChange={(e) => update("googleReviewUrl", e.target.value)} />
          </Field>
          <Field label="Instagram">
            <Input value={data.instagramUrl} onChange={(e) => update("instagramUrl", e.target.value)} placeholder="https://instagram.com/..." />
          </Field>
          <Field label="Lien réservation" hint="Calendly, Planity, Fresha...">
            <Input value={data.bookingUrl} onChange={(e) => update("bookingUrl", e.target.value)} />
          </Field>
        </div>
      </Card>

      {/* Save */}
      <div className="sticky bottom-4 z-10">
        <Button onClick={save} variant="accent" size="lg" loading={saving}>
          <Save className="h-4 w-4" /> Enregistrer
        </Button>
      </div>
    </div>
  );
}
