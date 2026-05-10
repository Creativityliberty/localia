export const TABLES = {
  // Core
  businesses: "businesses",
  themes: "themes",
  sites: "sites",
  sections: "sections",
  services: "services",
  ctas: "ctas",
  leads: "leads",
  qrCodes: "qr_codes",
  events: "events",
  mediaAssets: "media_assets",
  offers: "offers",

  // Loyalty
  loyaltyCards: "loyalty_cards",
  customers: "customers",
  customerCards: "customer_cards",
  transactions: "transactions",
  rewards: "rewards",
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];
