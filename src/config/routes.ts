// =====================================
// Localia — Routes centralisées
// =====================================

export const ROUTES = {
  // Marketing
  home: "/",
  pricing: "/pricing",
  examples: "/examples",
  about: "/about",
  contact: "/contact",

  // Auth
  login: "/login",
  signup: "/register",
  resetPassword: "/reset-password",
  verifyEmail: "/auth/verify-email",
  authCallback: "/auth/callback",

  // Dashboard
  dashboard: "/dashboard",
  dashboardSite: "/dashboard/site",
  dashboardBuilder: "/dashboard/site/builder",
  dashboardServices: "/dashboard/services",
  dashboardLeads: "/dashboard/leads",
  dashboardLead: (id: string) => `/dashboard/leads/${id}`,
  dashboardQr: "/dashboard/qr",
  dashboardOffers: "/dashboard/offers",
  dashboardAnalytics: "/dashboard/analytics",
  dashboardLoyalty: "/dashboard/loyalty",
  dashboardCustomers: "/dashboard/customers",
  dashboardCustomer: (id: string) => `/dashboard/customers/${id}`,
  dashboardSettings: "/dashboard/settings",
  dashboardBusiness: "/dashboard/business",
  dashboardTheme: "/dashboard/theme",
  dashboardBilling: "/dashboard/billing",

  // Public
  publicSite: (slug: string) => `/s/${slug}`,
  publicLoyaltyCard: (token: string) => `/c/${token}`,
  publicJoinLoyalty: (slug: string) => `/s/${slug}/fidelite`,
  publicQrRedirect: (token: string) => `/q/${token}`,

  // API
  apiAuthLogin: "/api/auth/login",
  apiAuthLogout: "/api/auth/logout",
  apiAuthSignup: "/api/auth/register",

  apiAuthMe: "/api/auth/me",

  apiBusinesses: "/api/businesses",
  apiBusiness: (id: string) => `/api/businesses/${id}`,

  apiSites: "/api/sites",
  apiSite: (id: string) => `/api/sites/${id}`,
  apiSitePublish: (id: string) => `/api/sites/${id}/publish`,

  apiSections: "/api/sections",
  apiSection: (id: string) => `/api/sections/${id}`,
  apiServicesEndpoint: "/api/services",

  apiLeads: "/api/leads",
  apiLead: (id: string) => `/api/leads/${id}`,

  apiCtas: "/api/ctas",
  apiCtaClick: (id: string) => `/api/ctas/${id}/click`,

  apiQrCodes: "/api/qr-codes",
  apiQrCode: (id: string) => `/api/qr-codes/${id}`,
  apiQrScan: (token: string) => `/api/qr/${token}/scan`,

  apiOffers: "/api/offers",
  apiEvents: "/api/events",

  apiDashboardStats: "/api/dashboard/stats",

  apiAi: "/api/ai/generate-site",

  apiPublicSite: (slug: string) => `/api/public/sites/${slug}`,
  apiPublicLoyalty: (token: string) => `/api/public/loyalty/${token}`,

  // Loyalty
  apiLoyaltyCards: "/api/loyalty-cards",
  apiCustomers: "/api/customers",
  apiCustomerCardAddStamp: (id: string) => `/api/customer-cards/${id}/add-stamp`,
  apiCustomerCardAddPoints: (id: string) => `/api/customer-cards/${id}/add-points`,
  apiCustomerCardRedeem: (id: string) => `/api/customer-cards/${id}/redeem`,
} as const;
