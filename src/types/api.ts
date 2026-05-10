// =====================================
// Localia — Types API
// =====================================

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardStats {
  views30d: number;
  viewsDelta: number;
  whatsappClicks: number;
  whatsappDelta: number;
  leadsCount: number;
  leadsThisWeek: number;
  loyaltyCustomers: number;
  rewardsAvailable: number;
}

export interface LeadInput {
  businessId: string;
  siteId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message: string;
  serviceRequested?: string | null;
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  consentMarketing?: boolean;
}

export interface AiSiteGenerationInput {
  businessName: string;
  category: string;
  location?: string;
  description?: string;
  services?: string[];
  tone?: "warm" | "professional" | "playful" | "minimal";
}

export interface AiSiteGenerationOutput {
  heroTitle: string;
  heroSubtitle: string;
  about: string;
  services: Array<{
    title: string;
    description: string;
    priceLabel?: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  primaryCta: {
    label: string;
    kind: string;
  };
  welcomeOffer: {
    title: string;
    description: string;
    rewardLabel: string;
  };
  seoTitle: string;
  seoDescription: string;
}
