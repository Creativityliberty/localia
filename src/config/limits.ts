import type { PlanTier } from "@/types/business";

export interface PlanLimits {
  tier: PlanTier;
  name: string;
  priceMonthly: number | null;
  priceSetup: number | null;
  features: string[];
  limits: {
    sites: number;
    sectionsPerSite: number;
    servicesPerSite: number;
    qrCodesPerBusiness: number;
    leadsRetention: number; // jours
    customDomain: boolean;
    aiGeneration: boolean;
    loyaltyModule: boolean;
    monthlyEdits: number;
    analytics: "basic" | "advanced";
  };
}

export const PLANS: Record<PlanTier, PlanLimits> = {
  free: {
    tier: "free",
    name: "Découverte",
    priceMonthly: 0,
    priceSetup: null,
    features: [
      "1 mini-site",
      "Sous-domaine localia.app",
      "QR code site",
      "Formulaire basique",
    ],
    limits: {
      sites: 1,
      sectionsPerSite: 4,
      servicesPerSite: 6,
      qrCodesPerBusiness: 1,
      leadsRetention: 14,
      customDomain: false,
      aiGeneration: false,
      loyaltyModule: false,
      monthlyEdits: 1,
      analytics: "basic",
    },
  },
  start: {
    tier: "start",
    name: "Localia Start",
    priceMonthly: 19,
    priceSetup: 149,
    features: [
      "Mini-site mobile",
      "QR code imprimable",
      "WhatsApp + appel",
      "Lien Google Business",
      "Maintenance basique",
    ],
    limits: {
      sites: 1,
      sectionsPerSite: 6,
      servicesPerSite: 10,
      qrCodesPerBusiness: 3,
      leadsRetention: 90,
      customDomain: false,
      aiGeneration: true,
      loyaltyModule: false,
      monthlyEdits: 1,
      analytics: "basic",
    },
  },
  business: {
    tier: "business",
    name: "Localia Business",
    priceMonthly: 49,
    priceSetup: 299,
    features: [
      "Tout de Start",
      "Jusqu'à 8 sections",
      "Services / tarifs / packs",
      "Galerie photos",
      "Analytics simples",
      "3 modifs / mois",
    ],
    limits: {
      sites: 1,
      sectionsPerSite: 8,
      servicesPerSite: 20,
      qrCodesPerBusiness: 6,
      leadsRetention: 365,
      customDomain: true,
      aiGeneration: true,
      loyaltyModule: false,
      monthlyEdits: 3,
      analytics: "basic",
    },
  },
  funnel: {
    tier: "funnel",
    name: "Localia Funnel",
    priceMonthly: 99,
    priceSetup: 590,
    features: [
      "Tout de Business",
      "Offre de bienvenue",
      "Page merci + relance",
      "Notifications commerçant",
      "Tracking demandes",
      "QR campagne",
    ],
    limits: {
      sites: 2,
      sectionsPerSite: 10,
      servicesPerSite: 30,
      qrCodesPerBusiness: 12,
      leadsRetention: 365,
      customDomain: true,
      aiGeneration: true,
      loyaltyModule: false,
      monthlyEdits: 6,
      analytics: "advanced",
    },
  },
  growth: {
    tier: "growth",
    name: "Localia Growth + Fidélité",
    priceMonthly: 149,
    priceSetup: 590,
    features: [
      "Tout de Funnel",
      "Module fidélité (cartes, points/tampons)",
      "Dashboard clients fidèles",
      "Campagne retour client",
      "Optimisation mensuelle CTA",
      "Recommandations business",
    ],
    limits: {
      sites: 3,
      sectionsPerSite: 12,
      servicesPerSite: 50,
      qrCodesPerBusiness: 24,
      leadsRetention: 730,
      customDomain: true,
      aiGeneration: true,
      loyaltyModule: true,
      monthlyEdits: 12,
      analytics: "advanced",
    },
  },
};

export function getPlan(tier: PlanTier): PlanLimits {
  return PLANS[tier];
}
