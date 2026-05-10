// =====================================
// Localia — Types domaine
// =====================================

export type BusinessCategory =
  | "BARBER" | "HAIRDRESSER" | "BEAUTY" | "NAILS" | "SPA"
  | "RESTAURANT" | "SNACK" | "FOODTRUCK" | "BAKERY" | "COFFEE"
  | "COACH" | "FITNESS" | "YOGA" | "PHYSIO" | "THERAPIST"
  | "CRAFTSMAN" | "GARAGE" | "CLEANING" | "PHOTOGRAPHER"
  | "SHOP" | "BOUTIQUE" | "FLORIST" | "OTHER";

export type SiteStatus = "draft" | "published" | "archived";

export type SectionKind =
  | "hero" | "about" | "services" | "offer" | "gallery"
  | "testimonials" | "faq" | "contact" | "hours" | "map" | "cta" | "custom";

export type CtaKind =
  | "whatsapp" | "phone" | "email" | "form" | "booking"
  | "directions" | "external" | "google_review" | "instagram";

export type LeadStatus = "new" | "read" | "contacted" | "converted" | "archived" | "spam";

export type QrPurpose =
  | "site" | "offer" | "review" | "loyalty" | "whatsapp"
  | "menu" | "booking" | "custom";

export type PlanTier = "free" | "start" | "business" | "funnel" | "growth";

export type OpeningHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  Array<{ open: string; close: string }>
>;

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
  accentColor: string;
  email: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string;
  timezone: string;
  currency: string;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  googleBusinessUrl: string | null;
  googleReviewUrl: string | null;
  googleMapsUrl: string | null;
  bookingUrl: string | null;
  openingHours: OpeningHours | null;
  plan: PlanTier;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Theme {
  id: string;
  businessId: string;
  name: string;
  preset: string;
  backgroundColor: string;
  surfaceColor: string;
  primaryColor: string;
  primaryDarkColor: string;
  accentColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
  radius: string;
  fontDisplay: string | null;
  fontBody: string | null;
  isDefault: boolean;
}

export interface Site {
  id: string;
  businessId: string;
  themeId: string | null;
  title: string;
  slug: string;
  status: SiteStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroImageUrl: string | null;
  customDomain: string | null;
  aiGenerated: boolean;
  aiPrompt: string | null;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  siteId: string;
  businessId: string;
  kind: SectionKind;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  content: Record<string, unknown>;
  position: number;
  isVisible: boolean;
}

export interface Service {
  id: string;
  businessId: string;
  siteId: string | null;
  title: string;
  description: string | null;
  priceLabel: string | null;
  priceAmount: number | null;
  durationMinutes: number | null;
  imageUrl: string | null;
  badge: string | null;
  position: number;
  isFeatured: boolean;
  isVisible: boolean;
}

export interface Cta {
  id: string;
  siteId: string;
  businessId: string;
  sectionId: string | null;
  label: string;
  kind: CtaKind;
  value: string;
  prefilledMessage: string | null;
  position: number;
  isPrimary: boolean;
  isVisible: boolean;
  clickCount: number;
}

export interface Lead {
  id: string;
  businessId: string;
  siteId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string;
  serviceRequested: string | null;
  status: LeadStatus;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  internalNotes: string | null;
  contactedAt: string | null;
  convertedAt: string | null;
  consentMarketing: boolean;
  createdAt: string;
}

export interface QrCode {
  id: string;
  businessId: string;
  siteId: string | null;
  label: string;
  purpose: QrPurpose;
  shortToken: string;
  targetUrl: string;
  utmSource: string | null;
  utmMedium: string;
  utmCampaign: string | null;
  scanCount: number;
  lastScannedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Offer {
  id: string;
  businessId: string;
  siteId: string | null;
  title: string;
  description: string | null;
  promoCode: string | null;
  rewardLabel: string | null;
  conditions: string | null;
  isWelcome: boolean;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  viewCount: number;
  claimCount: number;
}

export interface AnalyticsEvent {
  id: string;
  businessId: string;
  siteId: string | null;
  anonymousId: string | null;
  sessionId: string | null;
  name: string;
  ctaId: string | null;
  qrCodeId: string | null;
  serviceId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
  path: string | null;
  properties: Record<string, unknown>;
  createdAt: string;
}
