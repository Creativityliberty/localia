// =====================================
// Localia — Audit Engine + Blocking Gates
// =====================================
// Avant chaque publication, on audite :
//  - les variables critiques sont-elles présentes ?
//  - les CTA pointent-ils vers des destinations valides ?
//  - le score global atteint-il 70 / 100 ?
//
// Si une "blocking gate" échoue, on refuse la publication
// avec un message clair et exploitable côté UI.
// =====================================

import type { Business, Site, Cta, Service } from "@/types/business";

export type AuditSeverity = "info" | "warning" | "blocker";
export type AuditArea =
  | "identity" | "content" | "conversion" | "qr"
  | "lead" | "analytics" | "security" | "seo"
  | "maintenance" | "loyalty" | "accessibility";

export interface AuditFinding {
  id: string;
  severity: AuditSeverity;
  area: AuditArea;
  message: string;
  fix: string;
}

export interface AuditScorecard {
  identity: number;        // /10
  localTrust: number;      // /10
  contentClarity: number;  // /15
  ctaQuality: number;      // /15
  leadCapture: number;     // /10
  qrReadiness: number;     // /10
  googleBusinessReadiness: number; // /10
  analytics: number;       // /10
  securityAccessibility: number;  // /5
  maintenanceReadiness: number;   // /5
  total: number;           // /100
}

export type AuditStatus =
  | "no-go"           // 0-49
  | "draft-fragile"   // 50-69
  | "mvp-acceptable"  // 70-84
  | "ready-preview"   // 85-94
  | "commercial-ready"; // 95-100

export interface AuditReport {
  status: AuditStatus;
  scorecard: AuditScorecard;
  findings: AuditFinding[];
  blockers: AuditFinding[];
  warnings: AuditFinding[];
  canPublish: boolean;
  generatedAt: string;
}

export interface AuditInput {
  business: Business;
  site: Site;
  sections: { kind: string; isVisible: boolean; title: string | null }[];
  services: Service[];
  ctas: Cta[];
  hasOffer: boolean;
  hasQrCode: boolean;
}

const isValidUrl = (s: string | null | undefined): boolean => {
  if (!s) return false;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

const isValidPhone = (s: string | null | undefined): boolean => {
  if (!s) return false;
  const clean = s.replace(/[^0-9+]/g, "");
  return clean.length >= 8 && clean.length <= 15;
};

export function auditSite(input: AuditInput): AuditReport {
  const { business, site, sections, services, ctas, hasOffer, hasQrCode } = input;
  const findings: AuditFinding[] = [];

  // ===== Identity (10 pts) =====
  let identity = 0;
  if (business.name && business.name.length >= 2) identity += 4;
  else findings.push({
    id: "missing_business_name",
    severity: "blocker", area: "identity",
    message: "Le nom du commerce est manquant.",
    fix: "Ajoutez le nom dans les paramètres business.",
  });

  if (business.city) identity += 3;
  else findings.push({
    id: "missing_city",
    severity: "blocker", area: "identity",
    message: "La ville n'est pas renseignée.",
    fix: "Renseignez la ville pour le SEO local et la confiance.",
  });

  if (business.category && business.category !== "OTHER") identity += 3;
  else findings.push({
    id: "generic_category",
    severity: "warning", area: "identity",
    message: "La catégorie est générique.",
    fix: "Choisissez la catégorie précise pour des suggestions adaptées.",
  });

  // ===== Local Trust (10 pts) =====
  let localTrust = 0;
  if (business.address) localTrust += 3;
  else findings.push({
    id: "missing_address",
    severity: "warning", area: "identity",
    message: "Pas d'adresse renseignée.",
    fix: "Ajoutez une adresse pour Google Maps et la confiance locale.",
  });

  if (business.openingHours && Object.keys(business.openingHours).length > 0) localTrust += 3;
  else findings.push({
    id: "missing_hours",
    severity: "warning", area: "content",
    message: "Horaires non renseignés.",
    fix: "Ajoutez vos horaires pour rassurer les visiteurs.",
  });

  if (business.googleBusinessUrl && isValidUrl(business.googleBusinessUrl)) localTrust += 2;
  if (business.googleReviewUrl && isValidUrl(business.googleReviewUrl)) localTrust += 2;
  else findings.push({
    id: "missing_google_review",
    severity: "info", area: "conversion",
    message: "Pas de lien vers vos avis Google.",
    fix: "Ajoutez votre lien Google Reviews pour booster la conversion.",
  });

  // ===== Content Clarity (15 pts) =====
  let contentClarity = 0;
  const visibleSections = sections.filter((s) => s.isVisible);
  if (visibleSections.length >= 4) contentClarity += 5;
  else if (visibleSections.length >= 2) contentClarity += 3;
  else findings.push({
    id: "too_few_sections",
    severity: "blocker", area: "content",
    message: "Le site contient moins de 2 sections visibles.",
    fix: "Ajoutez au moins 4 sections : hero, services, contact, horaires.",
  });

  if (services.filter((s) => s.isVisible).length >= 1) contentClarity += 5;
  else findings.push({
    id: "no_services",
    severity: "blocker", area: "content",
    message: "Aucun service affiché.",
    fix: "Ajoutez vos prestations principales.",
  });

  if (site.heroTitle || visibleSections.find((s) => s.kind === "hero")) contentClarity += 5;
  else findings.push({
    id: "missing_hero",
    severity: "blocker", area: "content",
    message: "Pas de section Hero.",
    fix: "Le Hero est la première impression, indispensable.",
  });

  // ===== CTA Quality (15 pts) =====
  let ctaQuality = 0;
  const activeCtas = ctas.filter((c) => c.isVisible);
  const primaryCtas = activeCtas.filter((c) => c.isPrimary);

  if (primaryCtas.length >= 1) ctaQuality += 6;
  else findings.push({
    id: "no_primary_cta",
    severity: "blocker", area: "conversion",
    message: "Aucun CTA principal.",
    fix: "Marquez un CTA comme principal (WhatsApp, appel ou réservation).",
  });

  // Vérifier la validité de chaque CTA
  for (const cta of activeCtas) {
    if (cta.kind === "whatsapp" && !isValidPhone(cta.value)) {
      findings.push({
        id: `cta_${cta.id}_invalid_whatsapp`,
        severity: "blocker", area: "conversion",
        message: `Le bouton WhatsApp "${cta.label}" a un numéro invalide.`,
        fix: "Utilisez un numéro au format international (ex : +33612345678).",
      });
    }
    if (cta.kind === "phone" && !isValidPhone(cta.value)) {
      findings.push({
        id: `cta_${cta.id}_invalid_phone`,
        severity: "blocker", area: "conversion",
        message: `Le bouton appel "${cta.label}" a un numéro invalide.`,
        fix: "Vérifiez le format du numéro de téléphone.",
      });
    }
    if ((cta.kind === "external" || cta.kind === "booking") && !isValidUrl(cta.value)) {
      findings.push({
        id: `cta_${cta.id}_invalid_url`,
        severity: "blocker", area: "conversion",
        message: `Le bouton "${cta.label}" pointe vers une URL invalide.`,
        fix: "Utilisez une URL complète (https://...).",
      });
    }
  }

  if (activeCtas.length >= 2) ctaQuality += 5;
  if (activeCtas.length >= 3) ctaQuality += 4;

  // ===== Lead Capture (10 pts) =====
  let leadCapture = 0;
  const hasFormCta = activeCtas.some((c) => c.kind === "form");
  const hasContactSection = visibleSections.some((s) => s.kind === "contact" || s.kind === "cta");

  if (hasFormCta || hasContactSection) leadCapture += 5;
  else findings.push({
    id: "no_lead_capture",
    severity: "warning", area: "lead",
    message: "Aucun formulaire ni section contact.",
    fix: "Ajoutez un formulaire pour capturer les demandes.",
  });

  if (business.email || business.phone) leadCapture += 5;
  else findings.push({
    id: "no_owner_contact",
    severity: "warning", area: "lead",
    message: "Pas d'email/téléphone pour vous notifier.",
    fix: "Renseignez votre contact pour recevoir les demandes.",
  });

  // ===== QR Readiness (10 pts) =====
  let qrReadiness = 0;
  if (hasQrCode) qrReadiness += 6;
  if (site.slug && /^[a-z0-9-]+$/.test(site.slug)) qrReadiness += 4;

  // ===== Google Business Readiness (10 pts) =====
  let googleBusinessReadiness = 0;
  if (business.googleBusinessUrl) googleBusinessReadiness += 4;
  if (business.googleMapsUrl) googleBusinessReadiness += 3;
  if (business.address && business.city) googleBusinessReadiness += 3;

  // ===== Analytics (10 pts) =====
  let analytics = 0;
  if (site.status === "published") analytics += 5;
  if (activeCtas.length > 0) analytics += 5;

  // ===== Security & Accessibility (5 pts) =====
  let securityAccessibility = 5;
  for (const cta of activeCtas) {
    if (cta.kind === "external" && cta.value.startsWith("javascript:")) {
      securityAccessibility = 0;
      findings.push({
        id: `cta_${cta.id}_unsafe_url`,
        severity: "blocker", area: "security",
        message: `URL non sécurisée détectée sur le CTA "${cta.label}".`,
        fix: "Les URLs javascript: sont interdites. Utilisez http(s).",
      });
    }
  }

  // ===== Maintenance Readiness (5 pts) =====
  let maintenanceReadiness = 0;
  if (business.email) maintenanceReadiness += 3;
  if (site.title) maintenanceReadiness += 2;

  const total =
    identity + localTrust + contentClarity + ctaQuality + leadCapture +
    qrReadiness + googleBusinessReadiness + analytics +
    securityAccessibility + maintenanceReadiness;

  const scorecard: AuditScorecard = {
    identity, localTrust, contentClarity, ctaQuality,
    leadCapture, qrReadiness, googleBusinessReadiness,
    analytics, securityAccessibility, maintenanceReadiness, total,
  };

  let status: AuditStatus;
  if (total < 50) status = "no-go";
  else if (total < 70) status = "draft-fragile";
  else if (total < 85) status = "mvp-acceptable";
  else if (total < 95) status = "ready-preview";
  else status = "commercial-ready";

  const blockers = findings.filter((f) => f.severity === "blocker");
  const warnings = findings.filter((f) => f.severity === "warning");

  return {
    status,
    scorecard,
    findings,
    blockers,
    warnings,
    canPublish: blockers.length === 0 && total >= 70,
    generatedAt: new Date().toISOString(),
  };
}
