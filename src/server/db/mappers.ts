// =====================================
// Localia — Mappers DB row → domain types
// =====================================
//
// Postgres retourne snake_case. Ces helpers convertissent
// vers les types TS (camelCase) tout en garantissant la
// présence des champs nullable.

import type {
  Business,
  Theme,
  Site,
  Section,
  Service,
  Cta,
  Lead,
  QrCode,
  Offer,
  AnalyticsEvent,
  OpeningHours,
} from "@/types/business";
import type {
  LoyaltyCard,
  Customer,
  CustomerCard,
  Transaction,
  Reward,
} from "@/types/loyalty";

type Row = Record<string, any>;

const str = (v: any): string => (v == null ? "" : String(v));
const strOrNull = (v: any): string | null => (v == null ? null : String(v));
const num = (v: any, fallback = 0): number => (v == null ? fallback : Number(v));
const numOrNull = (v: any): number | null => (v == null ? null : Number(v));
const bool = (v: any, fallback = false): boolean => (v == null ? fallback : Boolean(v));
const json = <T = Record<string, unknown>>(v: any, fallback: T): T => {
  if (v == null) return fallback;
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return fallback; }
  }
  return v as T;
};

export const mapBusiness = (r: Row): Business => ({
  id: str(r.id),
  ownerId: str(r.owner_id),
  name: str(r.name),
  slug: str(r.slug),
  category: r.category,
  tagline: strOrNull(r.tagline),
  description: strOrNull(r.description),
  logoUrl: strOrNull(r.logo_url),
  bannerUrl: strOrNull(r.banner_url),
  primaryColor: str(r.primary_color),
  accentColor: str(r.accent_color),
  email: strOrNull(r.email),
  phone: strOrNull(r.phone),
  whatsappNumber: strOrNull(r.whatsapp_number),
  address: strOrNull(r.address),
  city: strOrNull(r.city),
  postalCode: strOrNull(r.postal_code),
  country: str(r.country),
  timezone: str(r.timezone),
  currency: str(r.currency),
  websiteUrl: strOrNull(r.website_url),
  instagramUrl: strOrNull(r.instagram_url),
  facebookUrl: strOrNull(r.facebook_url),
  tiktokUrl: strOrNull(r.tiktok_url),
  googleBusinessUrl: strOrNull(r.google_business_url),
  googleReviewUrl: strOrNull(r.google_review_url),
  googleMapsUrl: strOrNull(r.google_maps_url),
  bookingUrl: strOrNull(r.booking_url),
  openingHours: json<OpeningHours | null>(r.opening_hours, null),
  plan: r.plan,
  isActive: bool(r.is_active, true),
  createdAt: str(r.created_at),
  updatedAt: str(r.updated_at),
});

export const mapTheme = (r: Row): Theme => ({
  id: str(r.id),
  businessId: str(r.business_id),
  name: str(r.name),
  preset: str(r.preset),
  backgroundColor: str(r.background_color),
  surfaceColor: str(r.surface_color),
  primaryColor: str(r.primary_color),
  primaryDarkColor: str(r.primary_dark_color),
  accentColor: str(r.accent_color),
  textPrimaryColor: str(r.text_primary_color),
  textSecondaryColor: str(r.text_secondary_color),
  radius: str(r.radius),
  fontDisplay: strOrNull(r.font_display),
  fontBody: strOrNull(r.font_body),
  isDefault: bool(r.is_default),
});

export const mapSite = (r: Row): Site => ({
  id: str(r.id),
  businessId: str(r.business_id),
  themeId: strOrNull(r.theme_id),
  title: str(r.title),
  slug: str(r.slug),
  status: r.status,
  seoTitle: strOrNull(r.seo_title),
  seoDescription: strOrNull(r.seo_description),
  ogImageUrl: strOrNull(r.og_image_url),
  heroTitle: strOrNull(r.hero_title),
  heroSubtitle: strOrNull(r.hero_subtitle),
  heroImageUrl: strOrNull(r.hero_image_url),
  customDomain: strOrNull(r.custom_domain),
  aiGenerated: bool(r.ai_generated),
  aiPrompt: strOrNull(r.ai_prompt),
  publishedAt: strOrNull(r.published_at),
  viewCount: num(r.view_count),
  createdAt: str(r.created_at),
  updatedAt: str(r.updated_at),
});

export const mapSection = (r: Row): Section => ({
  id: str(r.id),
  siteId: str(r.site_id),
  businessId: str(r.business_id),
  kind: r.kind,
  title: strOrNull(r.title),
  subtitle: strOrNull(r.subtitle),
  body: strOrNull(r.body),
  content: json(r.content, {}),
  position: num(r.position),
  isVisible: bool(r.is_visible, true),
});

export const mapService = (r: Row): Service => ({
  id: str(r.id),
  businessId: str(r.business_id),
  siteId: strOrNull(r.site_id),
  title: str(r.title),
  description: strOrNull(r.description),
  priceLabel: strOrNull(r.price_label),
  priceAmount: numOrNull(r.price_amount),
  durationMinutes: numOrNull(r.duration_minutes),
  imageUrl: strOrNull(r.image_url),
  badge: strOrNull(r.badge),
  position: num(r.position),
  isFeatured: bool(r.is_featured),
  isVisible: bool(r.is_visible, true),
});

export const mapCta = (r: Row): Cta => ({
  id: str(r.id),
  siteId: str(r.site_id),
  businessId: str(r.business_id),
  sectionId: strOrNull(r.section_id),
  label: str(r.label),
  kind: r.kind,
  value: str(r.value),
  prefilledMessage: strOrNull(r.prefilled_message),
  position: num(r.position),
  isPrimary: bool(r.is_primary),
  isVisible: bool(r.is_visible, true),
  clickCount: num(r.click_count),
});

export const mapLead = (r: Row): Lead => ({
  id: str(r.id),
  businessId: str(r.business_id),
  siteId: strOrNull(r.site_id),
  name: strOrNull(r.name),
  email: strOrNull(r.email),
  phone: strOrNull(r.phone),
  message: str(r.message),
  serviceRequested: strOrNull(r.service_requested),
  status: r.status,
  source: strOrNull(r.source),
  utmSource: strOrNull(r.utm_source),
  utmMedium: strOrNull(r.utm_medium),
  utmCampaign: strOrNull(r.utm_campaign),
  internalNotes: strOrNull(r.internal_notes),
  contactedAt: strOrNull(r.contacted_at),
  convertedAt: strOrNull(r.converted_at),
  consentMarketing: bool(r.consent_marketing),
  createdAt: str(r.created_at),
});

export const mapQrCode = (r: Row): QrCode => ({
  id: str(r.id),
  businessId: str(r.business_id),
  siteId: strOrNull(r.site_id),
  label: str(r.label),
  purpose: r.purpose,
  shortToken: str(r.short_token),
  targetUrl: str(r.target_url),
  utmSource: strOrNull(r.utm_source),
  utmMedium: str(r.utm_medium),
  utmCampaign: strOrNull(r.utm_campaign),
  scanCount: num(r.scan_count),
  lastScannedAt: strOrNull(r.last_scanned_at),
  isActive: bool(r.is_active, true),
  createdAt: str(r.created_at),
});

export const mapOffer = (r: Row): Offer => ({
  id: str(r.id),
  businessId: str(r.business_id),
  siteId: strOrNull(r.site_id),
  title: str(r.title),
  description: strOrNull(r.description),
  promoCode: strOrNull(r.promo_code),
  rewardLabel: strOrNull(r.reward_label),
  conditions: strOrNull(r.conditions),
  isWelcome: bool(r.is_welcome),
  isActive: bool(r.is_active, true),
  startsAt: strOrNull(r.starts_at),
  endsAt: strOrNull(r.ends_at),
  viewCount: num(r.view_count),
  claimCount: num(r.claim_count),
});

export const mapEvent = (r: Row): AnalyticsEvent => ({
  id: str(r.id),
  businessId: str(r.business_id),
  siteId: strOrNull(r.site_id),
  anonymousId: strOrNull(r.anonymous_id),
  sessionId: strOrNull(r.session_id),
  name: str(r.name),
  ctaId: strOrNull(r.cta_id),
  qrCodeId: strOrNull(r.qr_code_id),
  serviceId: strOrNull(r.service_id),
  utmSource: strOrNull(r.utm_source),
  utmMedium: strOrNull(r.utm_medium),
  utmCampaign: strOrNull(r.utm_campaign),
  referrer: strOrNull(r.referrer),
  path: strOrNull(r.path),
  properties: json(r.properties, {}),
  createdAt: str(r.created_at),
});

// ----- Loyalty -----

export const mapLoyaltyCard = (r: Row): LoyaltyCard => ({
  id: str(r.id),
  businessId: str(r.business_id),
  name: str(r.name),
  description: strOrNull(r.description),
  kind: r.kind,
  stampsRequired: numOrNull(r.stamps_required),
  pointsPerVisit: numOrNull(r.points_per_visit),
  rewardThresholdPoints: numOrNull(r.reward_threshold_points),
  rewardLabel: str(r.reward_label),
  rewardDescription: strOrNull(r.reward_description),
  cardColor: str(r.card_color),
  cardAccent: str(r.card_accent),
  icon: str(r.icon),
  isActive: bool(r.is_active, true),
  startsAt: strOrNull(r.starts_at),
  endsAt: strOrNull(r.ends_at),
  createdAt: str(r.created_at),
  updatedAt: str(r.updated_at),
});

export const mapCustomer = (r: Row): Customer => ({
  id: str(r.id),
  businessId: str(r.business_id),
  firstName: str(r.first_name),
  lastName: strOrNull(r.last_name),
  email: strOrNull(r.email),
  phone: strOrNull(r.phone),
  birthday: strOrNull(r.birthday),
  status: r.status,
  tier: r.tier,
  consentMarketing: bool(r.consent_marketing),
  consentAt: strOrNull(r.consent_at),
  source: str(r.source),
  notes: strOrNull(r.notes),
  lastVisitAt: strOrNull(r.last_visit_at),
  visitCount: num(r.visit_count),
  createdAt: str(r.created_at),
  updatedAt: str(r.updated_at),
});

export const mapCustomerCard = (r: Row): CustomerCard => ({
  id: str(r.id),
  customerId: str(r.customer_id),
  businessId: str(r.business_id),
  loyaltyCardId: str(r.loyalty_card_id),
  publicToken: str(r.public_token),
  pointsBalance: num(r.points_balance),
  lifetimePoints: num(r.lifetime_points),
  stampsCount: num(r.stamps_count),
  lifetimeStamps: num(r.lifetime_stamps),
  rewardAvailable: bool(r.reward_available),
  rewardsRedeemedCount: num(r.rewards_redeemed_count),
  lastVisitAt: strOrNull(r.last_visit_at),
  isActive: bool(r.is_active, true),
  createdAt: str(r.created_at),
  updatedAt: str(r.updated_at),
});

export const mapTransaction = (r: Row): Transaction => ({
  id: str(r.id),
  businessId: str(r.business_id),
  customerId: str(r.customer_id),
  customerCardId: str(r.customer_card_id),
  loyaltyCardId: str(r.loyalty_card_id),
  kind: r.kind,
  pointsDelta: num(r.points_delta),
  stampsDelta: num(r.stamps_delta),
  amount: numOrNull(r.amount),
  rewardId: strOrNull(r.reward_id),
  note: strOrNull(r.note),
  createdBy: strOrNull(r.created_by),
  createdAt: str(r.created_at),
});

export const mapReward = (r: Row): Reward => ({
  id: str(r.id),
  businessId: str(r.business_id),
  customerId: str(r.customer_id),
  customerCardId: str(r.customer_card_id),
  loyaltyCardId: str(r.loyalty_card_id),
  title: str(r.title),
  description: strOrNull(r.description),
  status: r.status,
  redemptionCode: strOrNull(r.redemption_code),
  unlockedAt: str(r.unlocked_at),
  redeemedAt: strOrNull(r.redeemed_at),
  expiresAt: strOrNull(r.expires_at),
  redeemedBy: strOrNull(r.redeemed_by),
  createdAt: str(r.created_at),
});
