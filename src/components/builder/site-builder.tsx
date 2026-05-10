"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, ExternalLink, ArrowUp, Plus, Trash2, GripVertical, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/config/routes";
import { AuditPanel } from "@/components/builder/audit-panel";
import { ServicesEditor } from "@/components/builder/services-editor";
import { CtasEditor } from "@/components/builder/ctas-editor";
import type { Business, Site, Section, Service, Cta } from "@/types/business";
import type { AuditReport } from "@/server/audit/audit-engine";

interface SiteBuilderProps {
  business: Business;
  site: Site;
  initialSections: Section[];
  initialServices: Service[];
  initialCtas: Cta[];
  initialAudit: AuditReport;
}

export function SiteBuilder({
  business, site, initialSections, initialServices, initialCtas, initialAudit,
}: SiteBuilderProps) {
  const router = useRouter();
  const [audit, setAudit] = useState<AuditReport>(initialAudit);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [ctas, setCtas] = useState<Cta[]>(initialCtas);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hero, setHero] = useState({
    title: site.heroTitle ?? "",
    subtitle: site.heroSubtitle ?? "",
  });
  const [savingHero, setSavingHero] = useState(false);

  async function refreshAudit() {
    try {
      const res = await fetch(`/api/sites/${site.id}/audit`);
      const data = await res.json();
      if (data?.data) setAudit(data.data);
    } catch {}
  }

  async function generateWithAi() {
    setGenerating(true);
    try {
      const res = await fetch(ROUTES.apiAi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: business.description ?? business.tagline ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Erreur de génération");
        return;
      }

      const generated = data.data;

      // Pré-remplir hero et patcher le site
      setHero({ title: generated.heroTitle, subtitle: generated.heroSubtitle });
      await fetch(ROUTES.apiSite(site.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroTitle: generated.heroTitle,
          heroSubtitle: generated.heroSubtitle,
          seoTitle: generated.seoTitle,
          seoDescription: generated.seoDescription,
        }),
      });

      // Créer les services générés s'il n'y en a pas déjà beaucoup
      if (services.length < 3 && generated.services?.length) {
        for (const [idx, svc] of generated.services.entries()) {
          const r = await fetch(ROUTES.apiServicesEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessId: business.id,
              siteId: site.id,
              title: svc.title,
              description: svc.description,
              priceLabel: svc.priceLabel ?? null,
              position: idx,
              isVisible: true,
            }),
          });
          const sd = await r.json();
          if (r.ok && sd?.data) setServices((prev) => [...prev, sd.data]);
        }
      }

      // Créer le CTA principal s'il n'existe pas
      if (ctas.length === 0 && generated.primaryCta) {
        const r = await fetch(ROUTES.apiCtas, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteId: site.id,
            label: generated.primaryCta.label,
            kind: generated.primaryCta.kind,
            value: business.whatsappNumber ?? business.phone ?? "+33000000000",
            isPrimary: true,
            isVisible: true,
            position: 0,
          }),
        });
        const cd = await r.json();
        if (r.ok && cd?.data) setCtas((prev) => [...prev, cd.data]);
      }

      // Créer l'offre de bienvenue
      if (generated.welcomeOffer) {
        await fetch(ROUTES.apiOffers, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: business.id,
            siteId: site.id,
            title: generated.welcomeOffer.title,
            description: generated.welcomeOffer.description,
            rewardLabel: generated.welcomeOffer.rewardLabel,
            isWelcome: true,
            isActive: true,
          }),
        });
      }

      toast.success("Site pré-rempli par l'IA. À vous de retoucher !");
      await refreshAudit();
      router.refresh();
    } catch (err) {
      toast.error("Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  }

  async function saveHero() {
    setSavingHero(true);
    try {
      const res = await fetch(ROUTES.apiSite(site.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroTitle: hero.title, heroSubtitle: hero.subtitle }),
      });
      if (res.ok) {
        toast.success("Hero enregistré.");
        await refreshAudit();
      }
    } finally {
      setSavingHero(false);
    }
  }

  async function publish() {
    setPublishing(true);
    try {
      const res = await fetch(ROUTES.apiSitePublish(site.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error?.code === "PUBLISH_BLOCKED" || data?.error?.code === "PUBLISH_SCORE_TOO_LOW") {
          if (data?.error?.details?.audit) setAudit(data.error.details.audit);
          toast.error("Des éléments empêchent la publication. Voir le panneau qualité →");
        } else {
          toast.error(data?.error?.message ?? "Erreur");
        }
        return;
      }
      toast.success("🎉 Site publié !");
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  const isPublished = site.status === "published";

  return (
    <div className="animate-fade-in">
      {/* Header sticky */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-5 border-b border-cream-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-3xl text-ink-900 tracking-tight">Builder</h1>
            <Badge variant={isPublished ? "success" : "warning"}>
              {isPublished ? "Publié" : "Brouillon"}
            </Badge>
          </div>
          <p className="text-sm text-ink-400">
            URL publique : <code className="text-ink-700">/s/{site.slug}</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPublished && (
            <Button asChild variant="ghost" size="md">
              <Link href={ROUTES.publicSite(site.slug)} target="_blank">
                <Eye className="h-4 w-4" /> Aperçu
              </Link>
            </Button>
          )}
          <Button onClick={publish} variant="accent" size="md" loading={publishing}>
            <ArrowUp className="h-4 w-4" />
            {isPublished ? "Republier" : "Publier"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* IA generator */}
          <Card>
            <div className="px-6 py-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-moss-50 flex items-center justify-center text-moss-700 flex-shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg text-ink-900 tracking-tight">Génération IA</h2>
                <p className="text-sm text-ink-400 mb-3">
                  Localia rédige hero, services, offre de bienvenue et SEO depuis le profil de votre commerce.
                </p>
                <Button onClick={generateWithAi} variant="primary" size="sm" loading={generating}>
                  <Sparkles className="h-4 w-4" /> Pré-remplir mon site
                </Button>
              </div>
            </div>
          </Card>

          {/* Hero editor */}
          <Card>
            <div className="px-6 pt-5 pb-6">
              <h2 className="font-display text-lg text-ink-900 tracking-tight mb-4">Hero — la première impression</h2>
              <div className="space-y-4">
                <Field label="Titre principal" htmlFor="heroTitle" hint="Court, direct, qui parle au visiteur.">
                  <Input
                    id="heroTitle"
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    placeholder="Le tacos qui régale les Lyonnais."
                    maxLength={200}
                  />
                </Field>
                <Field label="Sous-titre" htmlFor="heroSubtitle" hint="1 phrase. Ce que vous faites concrètement.">
                  <Textarea
                    id="heroSubtitle"
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    placeholder="Tacos maison, généreux, cuisine ouverte. Click & collect dispo."
                    rows={2}
                    maxLength={320}
                  />
                </Field>
                <Button onClick={saveHero} variant="primary" size="sm" loading={savingHero}>
                  <Check className="h-4 w-4" /> Enregistrer le hero
                </Button>
              </div>
            </div>
          </Card>

          {/* Services */}
          <ServicesEditor
            businessId={business.id}
            siteId={site.id}
            services={services}
            onChange={(s) => { setServices(s); refreshAudit(); }}
          />

          {/* CTAs */}
          <CtasEditor
            siteId={site.id}
            ctas={ctas}
            defaultPhone={business.phone}
            defaultWhatsapp={business.whatsappNumber}
            onChange={(c) => { setCtas(c); refreshAudit(); }}
          />
        </div>

        {/* Audit panel (1 col, sticky) */}
        <aside className="lg:sticky lg:top-6 self-start">
          <AuditPanel audit={audit} />
        </aside>
      </div>
    </div>
  );
}
