"use client";

import * as React from "react";
import Image from "next/image";
import { MessageCircle, Phone, MapPin, Calendar, ExternalLink, Star, Clock } from "lucide-react";
import { buildWhatsAppLink, buildPhoneLink } from "@/lib/utils";
import { LeadForm } from "@/components/public/lead-form";
import { AnalyticsTracker } from "@/components/public/analytics-tracker";
import type { Business, Site, Service, Cta, Section, Theme, Offer, OpeningHours, CtaKind } from "@/types/business";

interface PublicSiteProps {
  business: Business;
  site: Site;
  theme: Theme | null;
  sections: Section[];
  services: Service[];
  ctas: Cta[];
  offer: Offer | null;
}

// Map kind -> icon
const ICON_BY_KIND: Record<CtaKind, React.ComponentType<{ className?: string }>> = {
  whatsapp: MessageCircle,
  phone: Phone,
  email: ExternalLink,
  form: ExternalLink,
  booking: Calendar,
  directions: MapPin,
  external: ExternalLink,
  google_review: Star,
  instagram: ExternalLink,
};

function buildCtaHref(cta: Cta): string {
  switch (cta.kind) {
    case "whatsapp":
      return buildWhatsAppLink(cta.value, cta.prefilledMessage ?? undefined);
    case "phone":
      return buildPhoneLink(cta.value);
    case "email":
      return `mailto:${cta.value}`;
    case "directions":
      return cta.value.startsWith("http") ? cta.value : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cta.value)}`;
    default:
      return cta.value;
  }
}

const DAY_LABELS: Record<keyof OpeningHours, string> = {
  mon: "Lundi", tue: "Mardi", wed: "Mercredi", thu: "Jeudi",
  fri: "Vendredi", sat: "Samedi", sun: "Dimanche",
};

export function PublicSite({ business, site, theme, sections, services, ctas, offer }: PublicSiteProps) {
  // Couleurs du thème (avec fallback)
  const colors = {
    background: theme?.backgroundColor ?? "#F4F7F2",
    surface: theme?.surfaceColor ?? "#FFFFFF",
    primary: theme?.primaryColor ?? business.primaryColor ?? "#1B3D0A",
    accent: theme?.accentColor ?? business.accentColor ?? "#A6FF4D",
    textPrimary: theme?.textPrimaryColor ?? "#111611",
    textSecondary: theme?.textSecondaryColor ?? "#5E6B5B",
  };

  const radius = theme?.radius ?? "24px";

  const primaryCta = ctas.find((c) => c.isPrimary) ?? ctas[0];
  const secondaryCtas = ctas.filter((c) => c !== primaryCta).slice(0, 2);

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        backgroundColor: colors.background,
        color: colors.textPrimary,
      }}
    >
      {/* HERO */}
      <header className="relative">
        {site.heroImageUrl || business.bannerUrl ? (
          <div className="relative h-56 sm:h-72 overflow-hidden">
            <Image
              src={site.heroImageUrl ?? business.bannerUrl ?? ""}
              alt={business.name}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent" />
          </div>
        ) : (
          <div
            className="h-40 sm:h-56"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}40, ${colors.background})`,
            }}
          />
        )}

        <div className="px-5 sm:px-8 -mt-12 sm:-mt-16 relative">
          <div
            className="rounded-3xl p-6 sm:p-8 shadow-card"
            style={{ backgroundColor: colors.surface, borderRadius: radius }}
          >
            {business.logoUrl ? (
              <div className="h-16 w-16 -mt-12 sm:-mt-14 mb-4 rounded-2xl overflow-hidden border-4 shadow-soft" style={{ borderColor: colors.surface }}>
                <Image src={business.logoUrl} alt={business.name} width={64} height={64} className="object-cover" />
              </div>
            ) : null}

            <h1
              className="font-display text-3xl sm:text-4xl tracking-tight leading-tight mb-2"
              style={{ color: colors.primary }}
            >
              {site.heroTitle ?? business.name}
            </h1>
            {(site.heroSubtitle || business.tagline) && (
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: colors.textSecondary }}>
                {site.heroSubtitle ?? business.tagline}
              </p>
            )}

            {(business.city || business.address) && (
              <div className="flex items-center gap-1.5 mt-4 text-xs" style={{ color: colors.textSecondary }}>
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {business.address ? `${business.address}, ` : ""}
                  {business.city}
                </span>
              </div>
            )}

            {/* CTAs primaires */}
            {primaryCta && (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <CtaButton cta={primaryCta} primary colors={colors} radius={radius} />
                {secondaryCtas.map((cta) => (
                  <CtaButton key={cta.id} cta={cta} colors={colors} radius={radius} />
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* OFFRE DE BIENVENUE */}
      {offer && offer.isActive && (
        <section className="px-5 sm:px-8 mt-6">
          <div
            className="rounded-2xl p-5 border-2 border-dashed"
            style={{
              backgroundColor: `${colors.accent}20`,
              borderColor: colors.accent,
              borderRadius: radius,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎁</div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: colors.primary }}>
                  Offre de bienvenue
                </div>
                <h3 className="font-display text-xl mb-1.5" style={{ color: colors.primary }}>
                  {offer.title}
                </h3>
                {offer.description && (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {offer.description}
                  </p>
                )}
                {offer.promoCode && (
                  <div
                    className="mt-3 inline-block px-3 py-1.5 rounded-md text-xs font-mono font-medium"
                    style={{ backgroundColor: colors.surface, color: colors.primary }}
                  >
                    Code : {offer.promoCode}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      {services.length > 0 && (
        <section className="px-5 sm:px-8 mt-10">
          <h2 className="font-display text-2xl sm:text-3xl mb-5 tracking-tight" style={{ color: colors.primary }}>
            Nos prestations
          </h2>
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-4 p-4 transition-shadow hover:shadow-card"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius,
                  border: `1px solid ${colors.background}`,
                }}
              >
                {service.imageUrl && (
                  <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-cream-100">
                    <Image src={service.imageUrl} alt={service.title} width={56} height={56} className="object-cover w-full h-full" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base mb-0.5 truncate" style={{ color: colors.textPrimary }}>
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="text-xs sm:text-sm leading-relaxed line-clamp-2" style={{ color: colors.textSecondary }}>
                      {service.description}
                    </p>
                  )}
                </div>
                {service.priceLabel && (
                  <div
                    className="text-sm font-medium flex-shrink-0 px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${colors.accent}30`, color: colors.primary }}
                  >
                    {service.priceLabel}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HORAIRES */}
      {business.openingHours && Object.keys(business.openingHours).length > 0 && (
        <section className="px-5 sm:px-8 mt-10">
          <h2 className="font-display text-2xl mb-4 tracking-tight" style={{ color: colors.primary }}>
            Horaires
          </h2>
          <div
            className="p-5"
            style={{ backgroundColor: colors.surface, borderRadius: radius }}
          >
            <ul className="space-y-2 text-sm">
              {(Object.keys(DAY_LABELS) as Array<keyof OpeningHours>).map((day) => {
                const slots = business.openingHours?.[day];
                if (!slots || slots.length === 0) {
                  return (
                    <li key={day} className="flex justify-between py-1" style={{ color: colors.textSecondary }}>
                      <span>{DAY_LABELS[day]}</span>
                      <span>Fermé</span>
                    </li>
                  );
                }
                return (
                  <li key={day} className="flex justify-between py-1">
                    <span style={{ color: colors.textPrimary }}>{DAY_LABELS[day]}</span>
                    <span style={{ color: colors.textSecondary }}>
                      {slots.map((s) => `${s.open} – ${s.close}`).join(", ")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* SECTIONS CUSTOM (about, faq, etc.) */}
      {sections
        .filter((s) => ["about", "faq", "custom"].includes(s.kind))
        .map((section) => (
          <section key={section.id} className="px-5 sm:px-8 mt-10">
            {section.title && (
              <h2 className="font-display text-2xl mb-3 tracking-tight" style={{ color: colors.primary }}>
                {section.title}
              </h2>
            )}
            {section.body && (
              <div
                className="p-5 prose prose-sm max-w-none"
                style={{ backgroundColor: colors.surface, borderRadius: radius, color: colors.textSecondary }}
              >
                <p className="whitespace-pre-line leading-relaxed">{section.body}</p>
              </div>
            )}
          </section>
        ))}

      {/* CONTACT / LEAD FORM */}
      <section className="px-5 sm:px-8 mt-10">
        <div
          className="p-6"
          style={{ backgroundColor: colors.surface, borderRadius: radius }}
        >
          <h2 className="font-display text-2xl mb-2 tracking-tight" style={{ color: colors.primary }}>
            Une question ?
          </h2>
          <p className="text-sm mb-5" style={{ color: colors.textSecondary }}>
            Écrivez-nous, on revient vers vous rapidement.
          </p>
          <LeadForm
            businessId={business.id}
            siteId={site.id}
            colors={{
              primary: colors.primary,
              accent: colors.accent,
              surface: colors.surface,
              textPrimary: colors.textPrimary,
              textSecondary: colors.textSecondary,
            }}
            radius={radius}
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-5 sm:px-8 mt-16 pb-6">
        <div className="text-center text-xs" style={{ color: colors.textSecondary }}>
          <div className="mb-2">
            {business.name}
            {business.city ? ` · ${business.city}` : ""}
          </div>
          <a href="https://localia.app" target="_blank" rel="noopener" className="opacity-60 hover:opacity-100">
            Site créé avec ♥ par Localia
          </a>
        </div>
      </footer>

      {/* Analytics tracker (invisible) */}
      <AnalyticsTracker businessId={business.id} siteId={site.id} />
    </div>
  );
}

function CtaButton({
  cta,
  primary,
  fullWidth,
  colors,
  radius,
}: {
  cta: Cta;
  primary?: boolean;
  fullWidth?: boolean;
  colors: { surface: string; primary: string; accent: string; textPrimary: string; textSecondary: string };
  radius: string;
}) {
  const Icon = ICON_BY_KIND[cta.kind] ?? ExternalLink;
  const href = buildCtaHref(cta);

  return (
    <a
      href={href}
      target={cta.kind === "external" || cta.kind === "booking" || cta.kind === "google_review" ? "_blank" : undefined}
      rel={cta.kind === "external" ? "noopener" : undefined}
      data-cta-id={cta.id}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 font-medium text-[15px] transition-all hover:scale-[0.99] active:scale-[0.97] ${fullWidth ? "w-full" : ""}`}
      style={{
        backgroundColor: primary ? colors.accent : colors.surface,
        color: primary ? colors.primary : colors.textPrimary,
        border: primary ? "none" : `1px solid ${colors.primary}30`,
        borderRadius: radius,
        boxShadow: primary ? `0 8px 20px ${colors.accent}50` : "none",
      }}
    >
      <Icon className="h-4 w-4" />
      {cta.label}
    </a>
  );
}
