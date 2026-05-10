"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Check, ArrowRight, ArrowLeft, Sparkles, Smartphone, MapPin,
  MessageCircle, Goal, ImageIcon, QrCode, Eye, Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { BUSINESS_CATEGORIES, CATEGORY_GROUPS } from "@/config/business-categories";
import { cn } from "@/lib/utils";
import type { Business, BusinessCategory } from "@/types/business";

const STEPS = [
  { id: 1, label: "Bienvenue", icon: Sparkles },
  { id: 2, label: "Type de commerce", icon: Smartphone },
  { id: 3, label: "Adresse & ville", icon: MapPin },
  { id: 4, label: "Description", icon: ImageIcon },
  { id: 5, label: "WhatsApp & contact", icon: MessageCircle },
  { id: 6, label: "Objectif", icon: Goal },
  { id: 7, label: "Génération IA", icon: Sparkles },
  { id: 8, label: "Aperçu", icon: Eye },
  { id: 9, label: "QR code", icon: QrCode },
  { id: 10, label: "Publier", icon: Rocket },
];

export function OnboardingWizard({ business }: { business: Business }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    category: business.category,
    address: business.address ?? "",
    city: business.city ?? "",
    postalCode: business.postalCode ?? "",
    tagline: business.tagline ?? "",
    description: business.description ?? "",
    whatsappNumber: business.whatsappNumber ?? "",
    phone: business.phone ?? "",
    googleReviewUrl: business.googleReviewUrl ?? "",
    objective: "leads" as "leads" | "calls" | "loyalty" | "awareness",
  });

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  function update<K extends keyof typeof data>(key: K, value: (typeof data)[K]) {
    setData({ ...data, [key]: value });
  }

  async function saveBusinessUpdate(payload: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(ROUTES.apiBusiness(business.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result?.error?.message ?? "Erreur");
        return false;
      }
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    // Save current step
    if (step === 2) {
      const ok = await saveBusinessUpdate({ category: data.category });
      if (!ok) return;
    }
    if (step === 3) {
      const ok = await saveBusinessUpdate({
        address: data.address || null,
        city: data.city || null,
        postalCode: data.postalCode || null,
      });
      if (!ok) return;
    }
    if (step === 4) {
      const ok = await saveBusinessUpdate({
        tagline: data.tagline || null,
        description: data.description || null,
      });
      if (!ok) return;
    }
    if (step === 5) {
      const ok = await saveBusinessUpdate({
        whatsappNumber: data.whatsappNumber || null,
        phone: data.phone || null,
        googleReviewUrl: data.googleReviewUrl || null,
      });
      if (!ok) return;
    }

    if (step === STEPS.length) {
      router.push(ROUTES.dashboard);
      return;
    }
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 text-xs text-ink-400">
          <span>Étape {step} sur {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
          <div
            className="h-full bg-moss-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card>
        <div className="px-6 pt-6 pb-6 sm:px-10 sm:pt-10 sm:pb-8">
          {step === 1 && (
            <StepWelcome businessName={business.name} />
          )}

          {step === 2 && (
            <Step
              title="Quel est votre métier ?"
              description="Localia pré-remplira votre site selon votre catégorie."
            >
              <select
                value={data.category}
                onChange={(e) => update("category", e.target.value as BusinessCategory)}
                className="flex h-11 w-full rounded-lg border border-cream-400 bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss-200"
              >
                {CATEGORY_GROUPS.map((group) => (
                  <optgroup key={group} label={group}>
                    {BUSINESS_CATEGORIES.filter((c) => c.group === group).map((c) => (
                      <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Step>
          )}

          {step === 3 && (
            <Step
              title="Où êtes-vous ?"
              description="Adresse et ville servent au SEO local et à la confiance."
            >
              <Field label="Adresse" htmlFor="address">
                <Input id="address" value={data.address} onChange={(e) => update("address", e.target.value)} placeholder="14 rue de la République" />
              </Field>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <Field label="Code postal" className="col-span-1">
                  <Input value={data.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="69002" />
                </Field>
                <Field label="Ville" className="col-span-2">
                  <Input value={data.city} onChange={(e) => update("city", e.target.value)} placeholder="Lyon" />
                </Field>
              </div>
            </Step>
          )}

          {step === 4 && (
            <Step
              title="Décrivez votre commerce"
              description="Quelques phrases. L'IA s'en servira pour rédiger votre site."
            >
              <Field label="Accroche courte" hint="Une phrase qui vous résume.">
                <Input value={data.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Le tacos qui régale les Lyonnais." />
              </Field>
              <Field label="Description" className="mt-3">
                <Textarea
                  value={data.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  placeholder="Cuisine maison, généreuse. Click & collect dispo. Privatisation possible."
                />
              </Field>
            </Step>
          )}

          {step === 5 && (
            <Step
              title="Comment vos clients vous joignent-ils ?"
              description="WhatsApp est la voie la plus efficace pour la majorité des commerces locaux."
            >
              <Field label="Numéro WhatsApp" hint="Format international, ex : +33 6 12 34 56 78">
                <Input value={data.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} placeholder="+33 6 12 34 56 78" />
              </Field>
              <Field label="Téléphone" className="mt-3">
                <Input value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+33 4 78 12 34 56" />
              </Field>
              <Field label="Lien avis Google (optionnel)" className="mt-3" hint="Pour booster votre réputation locale.">
                <Input value={data.googleReviewUrl} onChange={(e) => update("googleReviewUrl", e.target.value)} placeholder="https://g.page/r/..." />
              </Field>
            </Step>
          )}

          {step === 6 && (
            <Step
              title="Quel est votre objectif principal ?"
              description="Localia adapte la mise en avant des CTA en fonction."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { value: "leads", label: "Recevoir plus de demandes", desc: "Formulaire + WhatsApp" },
                  { value: "calls", label: "Recevoir plus d'appels", desc: "Bouton appel mis en avant" },
                  { value: "loyalty", label: "Faire revenir mes clients", desc: "Programme fidélité" },
                  { value: "awareness", label: "Être trouvé localement", desc: "SEO + Google Business" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("objective", opt.value as any)}
                    className={cn(
                      "p-4 rounded-xl text-left border-2 transition-colors",
                      data.objective === opt.value
                        ? "border-moss-400 bg-moss-50"
                        : "border-cream-300 bg-white hover:border-cream-500"
                    )}
                  >
                    <div className="text-sm font-medium text-ink-900 mb-0.5">{opt.label}</div>
                    <div className="text-xs text-ink-400">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </Step>
          )}

          {step === 7 && (
            <Step
              title="Localia rédige votre site"
              description="Hero, services, FAQ, offre de bienvenue, SEO. Vous pourrez tout modifier ensuite."
            >
              <div className="rounded-xl bg-gradient-to-br from-moss-50 to-cream-50 p-5 border border-moss-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-moss-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-ink-700">
                    L'IA va générer un site personnalisé pour <strong>{business.name}</strong> ({BUSINESS_CATEGORIES.find((c) => c.value === data.category)?.label}). Vous arriverez ensuite dans le builder pour retoucher.
                  </div>
                </div>
              </div>
              <Button asChild variant="primary" size="md" className="mt-4">
                <Link href={ROUTES.dashboardBuilder}>
                  <Sparkles className="h-4 w-4" /> Lancer le builder
                </Link>
              </Button>
            </Step>
          )}

          {step === 8 && (
            <Step
              title="Aperçu de votre mini-site"
              description="Avant de publier, regardez le rendu mobile depuis le builder."
            >
              <Button asChild variant="ghost" size="md">
                <Link href={ROUTES.dashboardBuilder}>
                  <Eye className="h-4 w-4" /> Ouvrir le builder
                </Link>
              </Button>
            </Step>
          )}

          {step === 9 && (
            <Step
              title="Créez votre QR code"
              description="Imprimez-le sur votre vitrine, vos cartes, vos flyers. Chaque scan est traçable."
            >
              <Button asChild variant="ghost" size="md">
                <Link href={ROUTES.dashboardQr}>
                  <QrCode className="h-4 w-4" /> Aller dans QR codes
                </Link>
              </Button>
            </Step>
          )}

          {step === 10 && (
            <Step
              title="Vous y êtes !"
              description="Votre Localia est prêt. Publiez quand vous voulez depuis le builder."
            >
              <div className="rounded-xl bg-moss-50 border border-moss-200 p-5">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-moss-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-ink-700">
                    Vous trouverez tout ce dont vous avez besoin dans le menu de gauche : builder, demandes, QR codes, offres, analytics et fidélité.
                  </div>
                </div>
              </div>
            </Step>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-6 py-4 sm:px-10 border-t border-cream-200 bg-cream-50">
          <Button
            onClick={back}
            variant="ghost"
            size="sm"
            disabled={step === 1}
            className={cn(step === 1 && "invisible")}
          >
            <ArrowLeft className="h-4 w-4" /> Précédent
          </Button>

          <div className="flex items-center gap-1">
            {STEPS.map((s) => (
              <span
                key={s.id}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  s.id === step ? "bg-moss-500 w-6" : s.id < step ? "bg-moss-300" : "bg-cream-300"
                )}
              />
            ))}
          </div>

          <Button onClick={next} variant="primary" size="sm" loading={saving}>
            {step === STEPS.length ? "Terminer" : "Suivant"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <p className="text-center mt-6 text-xs">
        <Link href={ROUTES.dashboard} className="text-ink-400 hover:text-ink-700 underline underline-offset-2">
          Passer l'onboarding
        </Link>
      </p>
    </div>
  );
}

function Step({
  title, description, children,
}: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink-900 tracking-tight mb-2">{title}</h1>
      <p className="text-ink-500 mb-6">{description}</p>
      {children}
    </div>
  );
}

function StepWelcome({ businessName }: { businessName: string }) {
  return (
    <div className="text-center py-6">
      <div className="inline-flex h-16 w-16 rounded-2xl bg-moss-300 items-center justify-center text-moss-900 font-display text-3xl shadow-glow mb-5">
        L
      </div>
      <h1 className="font-display text-3xl text-ink-900 tracking-tight mb-2">
        Bienvenue, {businessName}
      </h1>
      <p className="text-ink-500 max-w-md mx-auto">
        En 10 étapes, on configure votre mini-système client. Au bout : un site, un QR code, une offre, prêts à imprimer et partager.
      </p>
    </div>
  );
}
