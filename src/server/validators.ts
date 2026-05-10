// =====================================
// Localia — Validators légers maison
// =====================================
// Pas de Zod : on garde le bundle léger.
// Chaque validator retourne soit { ok: true, value }, soit { ok: false, error }.
// =====================================

import type { BusinessCategory, SectionKind, CtaKind, LeadStatus, QrPurpose, SiteStatus } from "@/types/business";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; field?: string };

const isString = (v: unknown): v is string => typeof v === "string";
const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";

const trim = (v: unknown, max?: number): string => {
  if (!isString(v)) return "";
  const t = v.trim();
  return max ? t.slice(0, max) : t;
};

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const isPhone = (s: string) => {
  const clean = s.replace(/[^0-9+]/g, "");
  return clean.length >= 8 && clean.length <= 15;
};

const isSlug = (s: string) => /^[a-z0-9][a-z0-9-]{1,160}[a-z0-9]$/.test(s);

const isHexColor = (s: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(s);

const isSafeUrl = (s: string): boolean => {
  if (!s) return false;
  try {
    const u = new URL(s);
    return ["https:", "http:", "mailto:", "tel:"].includes(u.protocol);
  } catch { return false; }
};

const VALID_CATEGORIES: BusinessCategory[] = [
  "BARBER","HAIRDRESSER","BEAUTY","NAILS","SPA",
  "RESTAURANT","SNACK","FOODTRUCK","BAKERY","COFFEE",
  "COACH","FITNESS","YOGA","PHYSIO","THERAPIST",
  "CRAFTSMAN","GARAGE","CLEANING","PHOTOGRAPHER",
  "SHOP","BOUTIQUE","FLORIST","OTHER",
];

const VALID_SECTION_KINDS: SectionKind[] = [
  "hero","about","services","offer","gallery","testimonials",
  "faq","contact","hours","map","cta","custom",
];

const VALID_CTA_KINDS: CtaKind[] = [
  "whatsapp","phone","email","form","booking",
  "directions","external","google_review","instagram",
];

const VALID_LEAD_STATUS: LeadStatus[] = [
  "new","read","contacted","converted","archived","spam",
];

const VALID_QR_PURPOSES: QrPurpose[] = [
  "site","offer","review","loyalty","whatsapp","menu","booking","custom",
];

const VALID_SITE_STATUS: SiteStatus[] = ["draft", "published", "archived"];

// =====================================
// Lead input
// =====================================
export interface ParsedLead {
  businessId: string;
  siteId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string;
  serviceRequested: string | null;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  consentMarketing: boolean;
}

export function validateLeadInput(raw: unknown): ValidationResult<ParsedLead> {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Données invalides." };
  }
  const r = raw as Record<string, unknown>;

  const businessId = trim(r.businessId);
  if (!businessId || !isUuid(businessId)) {
    return { ok: false, error: "Identifiant commerce invalide.", field: "businessId" };
  }

  const message = trim(r.message, 2000);
  if (!message || message.length < 2) {
    return { ok: false, error: "Le message est requis.", field: "message" };
  }

  const email = trim(r.email, 255) || null;
  if (email && !isEmail(email)) {
    return { ok: false, error: "Email invalide.", field: "email" };
  }

  const phone = trim(r.phone, 40) || null;
  if (phone && !isPhone(phone)) {
    return { ok: false, error: "Téléphone invalide.", field: "phone" };
  }

  if (!email && !phone) {
    return { ok: false, error: "Renseignez au moins un email ou un téléphone." };
  }

  return {
    ok: true,
    value: {
      businessId,
      siteId: trim(r.siteId) && isUuid(trim(r.siteId)) ? trim(r.siteId) : null,
      name: trim(r.name, 160) || null,
      email,
      phone,
      message,
      serviceRequested: trim(r.serviceRequested, 180) || null,
      source: trim(r.source, 80) || null,
      utmSource: trim(r.utmSource, 80) || null,
      utmMedium: trim(r.utmMedium, 80) || null,
      utmCampaign: trim(r.utmCampaign, 80) || null,
      consentMarketing: Boolean(r.consentMarketing),
    },
  };
}

// =====================================
// Site input
// =====================================
export interface ParsedSiteUpdate {
  title?: string;
  slug?: string;
  status?: SiteStatus;
  themeId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
}

export function validateSiteUpdate(raw: unknown): ValidationResult<ParsedSiteUpdate> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Données invalides." };
  const r = raw as Record<string, unknown>;
  const out: ParsedSiteUpdate = {};

  if (r.title !== undefined) {
    const t = trim(r.title, 180);
    if (!t || t.length < 2) return { ok: false, error: "Titre trop court.", field: "title" };
    out.title = t;
  }
  if (r.slug !== undefined) {
    const s = trim(r.slug, 180).toLowerCase();
    if (!isSlug(s)) return { ok: false, error: "Slug invalide (a-z, 0-9, tirets).", field: "slug" };
    out.slug = s;
  }
  if (r.status !== undefined) {
    if (!isString(r.status) || !VALID_SITE_STATUS.includes(r.status as SiteStatus)) {
      return { ok: false, error: "Statut invalide.", field: "status" };
    }
    out.status = r.status as SiteStatus;
  }
  if (r.themeId !== undefined) {
    out.themeId = isString(r.themeId) && isUuid(r.themeId) ? r.themeId : null;
  }
  if (r.seoTitle !== undefined) out.seoTitle = trim(r.seoTitle, 200) || null;
  if (r.seoDescription !== undefined) out.seoDescription = trim(r.seoDescription, 320) || null;
  if (r.ogImageUrl !== undefined) {
    const u = trim(r.ogImageUrl, 500);
    if (u && !isSafeUrl(u)) return { ok: false, error: "URL d'image invalide.", field: "ogImageUrl" };
    out.ogImageUrl = u || null;
  }
  if (r.heroTitle !== undefined) out.heroTitle = trim(r.heroTitle, 200) || null;
  if (r.heroSubtitle !== undefined) out.heroSubtitle = trim(r.heroSubtitle, 320) || null;
  if (r.heroImageUrl !== undefined) {
    const u = trim(r.heroImageUrl, 500);
    if (u && !isSafeUrl(u)) return { ok: false, error: "URL d'image invalide.", field: "heroImageUrl" };
    out.heroImageUrl = u || null;
  }

  return { ok: true, value: out };
}

// =====================================
// Section input
// =====================================
export interface ParsedSectionInput {
  siteId: string;
  kind: SectionKind;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  content?: Record<string, unknown>;
  position?: number;
  isVisible?: boolean;
}

export function validateSectionInput(raw: unknown): ValidationResult<ParsedSectionInput> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Données invalides." };
  const r = raw as Record<string, unknown>;

  const siteId = trim(r.siteId);
  if (!siteId || !isUuid(siteId)) return { ok: false, error: "Site invalide.", field: "siteId" };
  if (!isString(r.kind) || !VALID_SECTION_KINDS.includes(r.kind as SectionKind)) {
    return { ok: false, error: "Type de section invalide.", field: "kind" };
  }

  return {
    ok: true,
    value: {
      siteId,
      kind: r.kind as SectionKind,
      title: trim(r.title, 200) || null,
      subtitle: trim(r.subtitle, 320) || null,
      body: trim(r.body, 8000) || null,
      content: r.content && typeof r.content === "object" ? (r.content as Record<string, unknown>) : {},
      position: isNumber(r.position) ? Math.max(0, Math.floor(r.position)) : 0,
      isVisible: r.isVisible === undefined ? true : Boolean(r.isVisible),
    },
  };
}

// =====================================
// Service input
// =====================================
export interface ParsedServiceInput {
  businessId: string;
  siteId?: string | null;
  title: string;
  description?: string | null;
  priceLabel?: string | null;
  priceAmount?: number | null;
  durationMinutes?: number | null;
  imageUrl?: string | null;
  badge?: string | null;
  position?: number;
  isFeatured?: boolean;
  isVisible?: boolean;
}

export function validateServiceInput(raw: unknown): ValidationResult<ParsedServiceInput> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Données invalides." };
  const r = raw as Record<string, unknown>;

  const businessId = trim(r.businessId);
  if (!businessId || !isUuid(businessId)) return { ok: false, error: "Commerce invalide.", field: "businessId" };

  const title = trim(r.title, 180);
  if (!title || title.length < 2) return { ok: false, error: "Titre requis.", field: "title" };

  const imageUrl = trim(r.imageUrl, 500);
  if (imageUrl && !isSafeUrl(imageUrl)) return { ok: false, error: "URL d'image invalide.", field: "imageUrl" };

  return {
    ok: true,
    value: {
      businessId,
      siteId: trim(r.siteId) && isUuid(trim(r.siteId)) ? trim(r.siteId) : null,
      title,
      description: trim(r.description, 1000) || null,
      priceLabel: trim(r.priceLabel, 60) || null,
      priceAmount: isNumber(r.priceAmount) && r.priceAmount >= 0 ? Number(r.priceAmount) : null,
      durationMinutes: isNumber(r.durationMinutes) && r.durationMinutes > 0 ? Math.floor(r.durationMinutes) : null,
      imageUrl: imageUrl || null,
      badge: trim(r.badge, 40) || null,
      position: isNumber(r.position) ? Math.max(0, Math.floor(r.position)) : 0,
      isFeatured: Boolean(r.isFeatured),
      isVisible: r.isVisible === undefined ? true : Boolean(r.isVisible),
    },
  };
}

// =====================================
// CTA input
// =====================================
export interface ParsedCtaInput {
  siteId: string;
  sectionId?: string | null;
  label: string;
  kind: CtaKind;
  value: string;
  prefilledMessage?: string | null;
  position?: number;
  isPrimary?: boolean;
  isVisible?: boolean;
}

export function validateCtaInput(raw: unknown): ValidationResult<ParsedCtaInput> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Données invalides." };
  const r = raw as Record<string, unknown>;

  const siteId = trim(r.siteId);
  if (!siteId || !isUuid(siteId)) return { ok: false, error: "Site invalide.", field: "siteId" };

  const label = trim(r.label, 120);
  if (!label) return { ok: false, error: "Libellé requis.", field: "label" };

  if (!isString(r.kind) || !VALID_CTA_KINDS.includes(r.kind as CtaKind)) {
    return { ok: false, error: "Type de CTA invalide.", field: "kind" };
  }
  const kind = r.kind as CtaKind;

  const value = trim(r.value, 500);
  if (!value) return { ok: false, error: "Valeur requise.", field: "value" };

  // Validation par type
  if (kind === "whatsapp" || kind === "phone") {
    if (!isPhone(value)) return { ok: false, error: "Numéro invalide.", field: "value" };
  }
  if (kind === "email") {
    if (!isEmail(value)) return { ok: false, error: "Email invalide.", field: "value" };
  }
  if (kind === "external" || kind === "booking" || kind === "google_review" || kind === "instagram") {
    if (!isSafeUrl(value)) return { ok: false, error: "URL invalide.", field: "value" };
  }

  return {
    ok: true,
    value: {
      siteId,
      sectionId: trim(r.sectionId) && isUuid(trim(r.sectionId)) ? trim(r.sectionId) : null,
      label,
      kind,
      value,
      prefilledMessage: trim(r.prefilledMessage, 500) || null,
      position: isNumber(r.position) ? Math.max(0, Math.floor(r.position)) : 0,
      isPrimary: Boolean(r.isPrimary),
      isVisible: r.isVisible === undefined ? true : Boolean(r.isVisible),
    },
  };
}

// =====================================
// Business update
// =====================================
export interface ParsedBusinessUpdate {
  name?: string;
  slug?: string;
  category?: BusinessCategory;
  tagline?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string;
  accentColor?: string;
  email?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  googleBusinessUrl?: string | null;
  googleReviewUrl?: string | null;
  googleMapsUrl?: string | null;
  bookingUrl?: string | null;
  openingHours?: Record<string, Array<{ open: string; close: string }>>;
}

export function validateBusinessUpdate(raw: unknown): ValidationResult<ParsedBusinessUpdate> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Données invalides." };
  const r = raw as Record<string, unknown>;
  const out: ParsedBusinessUpdate = {};

  if (r.name !== undefined) {
    const v = trim(r.name, 160);
    if (v.length < 2) return { ok: false, error: "Nom trop court.", field: "name" };
    out.name = v;
  }
  if (r.slug !== undefined) {
    const v = trim(r.slug, 180).toLowerCase();
    if (!isSlug(v)) return { ok: false, error: "Slug invalide.", field: "slug" };
    out.slug = v;
  }
  if (r.category !== undefined) {
    if (!isString(r.category) || !VALID_CATEGORIES.includes(r.category as BusinessCategory)) {
      return { ok: false, error: "Catégorie invalide.", field: "category" };
    }
    out.category = r.category as BusinessCategory;
  }
  if (r.tagline !== undefined) out.tagline = trim(r.tagline, 200) || null;
  if (r.description !== undefined) out.description = trim(r.description, 2000) || null;
  if (r.logoUrl !== undefined) {
    const v = trim(r.logoUrl, 500);
    if (v && !isSafeUrl(v)) return { ok: false, error: "URL logo invalide.", field: "logoUrl" };
    out.logoUrl = v || null;
  }
  if (r.bannerUrl !== undefined) {
    const v = trim(r.bannerUrl, 500);
    if (v && !isSafeUrl(v)) return { ok: false, error: "URL bannière invalide.", field: "bannerUrl" };
    out.bannerUrl = v || null;
  }
  if (r.primaryColor !== undefined) {
    const v = trim(r.primaryColor);
    if (!isHexColor(v)) return { ok: false, error: "Couleur primaire invalide.", field: "primaryColor" };
    out.primaryColor = v;
  }
  if (r.accentColor !== undefined) {
    const v = trim(r.accentColor);
    if (!isHexColor(v)) return { ok: false, error: "Couleur d'accent invalide.", field: "accentColor" };
    out.accentColor = v;
  }
  if (r.email !== undefined) {
    const v = trim(r.email, 255).toLowerCase();
    if (v && !isEmail(v)) return { ok: false, error: "Email invalide.", field: "email" };
    out.email = v || null;
  }
  if (r.phone !== undefined) {
    const v = trim(r.phone, 40);
    if (v && !isPhone(v)) return { ok: false, error: "Téléphone invalide.", field: "phone" };
    out.phone = v || null;
  }
  if (r.whatsappNumber !== undefined) {
    const v = trim(r.whatsappNumber, 40);
    if (v && !isPhone(v)) return { ok: false, error: "WhatsApp invalide.", field: "whatsappNumber" };
    out.whatsappNumber = v || null;
  }
  if (r.address !== undefined) out.address = trim(r.address, 500) || null;
  if (r.city !== undefined) out.city = trim(r.city, 120) || null;
  if (r.postalCode !== undefined) out.postalCode = trim(r.postalCode, 20) || null;
  if (r.country !== undefined) out.country = trim(r.country, 120) || "France";

  // URLs externes
  for (const key of ["websiteUrl","instagramUrl","facebookUrl","tiktokUrl","googleBusinessUrl","googleReviewUrl","googleMapsUrl","bookingUrl"] as const) {
    if (r[key] !== undefined) {
      const v = trim(r[key], 500);
      if (v && !isSafeUrl(v)) return { ok: false, error: "URL invalide.", field: key };
      out[key] = v || null;
    }
  }

  if (r.openingHours !== undefined && r.openingHours && typeof r.openingHours === "object") {
    out.openingHours = r.openingHours as Record<string, Array<{ open: string; close: string }>>;
  }

  return { ok: true, value: out };
}

// =====================================
// QR code input
// =====================================
export interface ParsedQrInput {
  businessId: string;
  siteId?: string | null;
  label: string;
  purpose: QrPurpose;
  targetUrl: string;
  utmSource?: string | null;
  utmCampaign?: string | null;
}

export function validateQrInput(raw: unknown): ValidationResult<ParsedQrInput> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Données invalides." };
  const r = raw as Record<string, unknown>;

  const businessId = trim(r.businessId);
  if (!businessId || !isUuid(businessId)) return { ok: false, error: "Commerce invalide.", field: "businessId" };

  const label = trim(r.label, 160);
  if (!label) return { ok: false, error: "Libellé requis.", field: "label" };

  if (!isString(r.purpose) || !VALID_QR_PURPOSES.includes(r.purpose as QrPurpose)) {
    return { ok: false, error: "Usage invalide.", field: "purpose" };
  }

  const targetUrl = trim(r.targetUrl, 500);
  if (!targetUrl || !isSafeUrl(targetUrl)) return { ok: false, error: "URL cible invalide.", field: "targetUrl" };

  return {
    ok: true,
    value: {
      businessId,
      siteId: trim(r.siteId) && isUuid(trim(r.siteId)) ? trim(r.siteId) : null,
      label,
      purpose: r.purpose as QrPurpose,
      targetUrl,
      utmSource: trim(r.utmSource, 80) || null,
      utmCampaign: trim(r.utmCampaign, 80) || null,
    },
  };
}

// =====================================
// Offer input
// =====================================
export interface ParsedOfferInput {
  businessId: string;
  siteId?: string | null;
  title: string;
  description?: string | null;
  promoCode?: string | null;
  rewardLabel?: string | null;
  conditions?: string | null;
  isWelcome?: boolean;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export function validateOfferInput(raw: unknown): ValidationResult<ParsedOfferInput> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Données invalides." };
  const r = raw as Record<string, unknown>;

  const businessId = trim(r.businessId);
  if (!businessId || !isUuid(businessId)) return { ok: false, error: "Commerce invalide.", field: "businessId" };

  const title = trim(r.title, 180);
  if (!title) return { ok: false, error: "Titre requis.", field: "title" };

  return {
    ok: true,
    value: {
      businessId,
      siteId: trim(r.siteId) && isUuid(trim(r.siteId)) ? trim(r.siteId) : null,
      title,
      description: trim(r.description, 1000) || null,
      promoCode: trim(r.promoCode, 40) || null,
      rewardLabel: trim(r.rewardLabel, 180) || null,
      conditions: trim(r.conditions, 500) || null,
      isWelcome: Boolean(r.isWelcome),
      isActive: r.isActive === undefined ? true : Boolean(r.isActive),
      startsAt: trim(r.startsAt) || null,
      endsAt: trim(r.endsAt) || null,
    },
  };
}

// =====================================
// Lead status update
// =====================================
export function validateLeadStatusUpdate(raw: unknown): ValidationResult<{ status: LeadStatus; internalNotes?: string | null }> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Données invalides." };
  const r = raw as Record<string, unknown>;

  if (!isString(r.status) || !VALID_LEAD_STATUS.includes(r.status as LeadStatus)) {
    return { ok: false, error: "Statut invalide.", field: "status" };
  }

  return {
    ok: true,
    value: {
      status: r.status as LeadStatus,
      internalNotes: trim(r.internalNotes, 2000) || null,
    },
  };
}

// =====================================
// Event input (analytics)
// =====================================
export interface ParsedEventInput {
  businessId: string;
  siteId?: string | null;
  name: string;
  ctaId?: string | null;
  qrCodeId?: string | null;
  serviceId?: string | null;
  anonymousId?: string | null;
  sessionId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
  path?: string | null;
  properties?: Record<string, unknown>;
}

const VALID_EVENT_NAMES = new Set([
  "page_view","qr_scan","cta_click","cta_whatsapp_click","cta_call_click",
  "cta_booking_click","cta_maps_click","cta_directions_click",
  "lead_submit","offer_view","offer_click","review_link_clicked",
  "loyalty_join_clicked","service_click",
]);

export function validateEventInput(raw: unknown): ValidationResult<ParsedEventInput> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Données invalides." };
  const r = raw as Record<string, unknown>;

  const businessId = trim(r.businessId);
  if (!businessId || !isUuid(businessId)) return { ok: false, error: "Commerce invalide.", field: "businessId" };

  const name = trim(r.name, 80);
  if (!name) return { ok: false, error: "Nom d'événement requis.", field: "name" };
  // On accepte aussi des events custom (préfixés "custom_")
  if (!VALID_EVENT_NAMES.has(name) && !name.startsWith("custom_")) {
    return { ok: false, error: "Événement non reconnu.", field: "name" };
  }

  return {
    ok: true,
    value: {
      businessId,
      siteId: trim(r.siteId) && isUuid(trim(r.siteId)) ? trim(r.siteId) : null,
      name,
      ctaId: trim(r.ctaId) && isUuid(trim(r.ctaId)) ? trim(r.ctaId) : null,
      qrCodeId: trim(r.qrCodeId) && isUuid(trim(r.qrCodeId)) ? trim(r.qrCodeId) : null,
      serviceId: trim(r.serviceId) && isUuid(trim(r.serviceId)) ? trim(r.serviceId) : null,
      anonymousId: trim(r.anonymousId, 120) || null,
      sessionId: trim(r.sessionId, 120) || null,
      utmSource: trim(r.utmSource, 80) || null,
      utmMedium: trim(r.utmMedium, 80) || null,
      utmCampaign: trim(r.utmCampaign, 80) || null,
      referrer: trim(r.referrer, 500) || null,
      path: trim(r.path, 500) || null,
      properties: r.properties && typeof r.properties === "object"
        ? (r.properties as Record<string, unknown>)
        : {},
    },
  };
}
