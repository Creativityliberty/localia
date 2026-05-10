import type { BusinessCategory } from "@/types/business";

export interface BusinessCategoryMeta {
  value: BusinessCategory;
  label: string;
  emoji: string;
  group: "Beauté" | "Restauration" | "Bien-être" | "Services" | "Commerce";
  defaultServices: string[];
  defaultCtaPriority: ("whatsapp" | "phone" | "booking" | "form")[];
}

export const BUSINESS_CATEGORIES: BusinessCategoryMeta[] = [
  // Beauté
  {
    value: "BARBER",
    label: "Barbier",
    emoji: "💈",
    group: "Beauté",
    defaultServices: ["Coupe homme", "Barbe", "Coupe + barbe", "Coloration"],
    defaultCtaPriority: ["whatsapp", "booking", "phone"],
  },
  {
    value: "HAIRDRESSER",
    label: "Coiffeur",
    emoji: "💇",
    group: "Beauté",
    defaultServices: ["Coupe", "Couleur", "Mèches", "Brushing"],
    defaultCtaPriority: ["booking", "whatsapp", "phone"],
  },
  {
    value: "BEAUTY",
    label: "Institut de beauté",
    emoji: "✨",
    group: "Beauté",
    defaultServices: ["Soin du visage", "Épilation", "Massage", "Manucure"],
    defaultCtaPriority: ["booking", "whatsapp", "phone"],
  },
  {
    value: "NAILS",
    label: "Onglerie",
    emoji: "💅",
    group: "Beauté",
    defaultServices: ["Pose semi-permanent", "Gel", "French", "Nail art"],
    defaultCtaPriority: ["whatsapp", "booking", "phone"],
  },
  {
    value: "SPA",
    label: "Spa",
    emoji: "🧖",
    group: "Beauté",
    defaultServices: ["Massage", "Sauna", "Hammam", "Soin couple"],
    defaultCtaPriority: ["booking", "phone", "whatsapp"],
  },

  // Restauration
  {
    value: "RESTAURANT",
    label: "Restaurant",
    emoji: "🍽️",
    group: "Restauration",
    defaultServices: ["Menu midi", "À la carte", "Privatisation", "Traiteur"],
    defaultCtaPriority: ["booking", "phone", "whatsapp"],
  },
  {
    value: "SNACK",
    label: "Snack / Tacos",
    emoji: "🌮",
    group: "Restauration",
    defaultServices: ["Tacos", "Burgers", "Menus", "Livraison"],
    defaultCtaPriority: ["whatsapp", "phone"],
  },
  {
    value: "FOODTRUCK",
    label: "Food truck",
    emoji: "🚚",
    group: "Restauration",
    defaultServices: ["Carte du jour", "Privatisation événement", "Catering"],
    defaultCtaPriority: ["whatsapp", "phone"],
  },
  {
    value: "BAKERY",
    label: "Boulangerie",
    emoji: "🥖",
    group: "Restauration",
    defaultServices: ["Pains spéciaux", "Pâtisseries", "Commande gâteau", "Sandwichs"],
    defaultCtaPriority: ["phone", "whatsapp"],
  },
  {
    value: "COFFEE",
    label: "Café",
    emoji: "☕",
    group: "Restauration",
    defaultServices: ["Cafés", "Petit-déjeuner", "Brunch", "Snacks"],
    defaultCtaPriority: ["phone", "whatsapp"],
  },

  // Bien-être
  {
    value: "COACH",
    label: "Coach",
    emoji: "🎯",
    group: "Bien-être",
    defaultServices: ["Séance individuelle", "Programme 1 mois", "Bilan", "En ligne"],
    defaultCtaPriority: ["form", "booking", "whatsapp"],
  },
  {
    value: "FITNESS",
    label: "Coach sportif",
    emoji: "💪",
    group: "Bien-être",
    defaultServices: ["Séance perso", "Programme", "Cours collectif", "Bilan forme"],
    defaultCtaPriority: ["whatsapp", "form", "phone"],
  },
  {
    value: "YOGA",
    label: "Yoga",
    emoji: "🧘",
    group: "Bien-être",
    defaultServices: ["Cours collectif", "Séance privée", "Stage week-end", "En ligne"],
    defaultCtaPriority: ["booking", "form", "whatsapp"],
  },
  {
    value: "PHYSIO",
    label: "Kiné / Ostéo",
    emoji: "🤲",
    group: "Bien-être",
    defaultServices: ["Consultation", "Séance suivi", "Urgence", "À domicile"],
    defaultCtaPriority: ["booking", "phone"],
  },
  {
    value: "THERAPIST",
    label: "Thérapeute",
    emoji: "🌿",
    group: "Bien-être",
    defaultServices: ["Première séance", "Suivi", "Visioconsultation", "Forfait"],
    defaultCtaPriority: ["form", "booking", "phone"],
  },

  // Services
  {
    value: "CRAFTSMAN",
    label: "Artisan",
    emoji: "🔨",
    group: "Services",
    defaultServices: ["Devis gratuit", "Pose", "Rénovation", "Dépannage"],
    defaultCtaPriority: ["form", "phone", "whatsapp"],
  },
  {
    value: "GARAGE",
    label: "Garage / Mécanique",
    emoji: "🔧",
    group: "Services",
    defaultServices: ["Vidange", "Révision", "Pneus", "Diagnostic"],
    defaultCtaPriority: ["phone", "whatsapp", "form"],
  },
  {
    value: "CLEANING",
    label: "Ménage / Pressing",
    emoji: "🧺",
    group: "Services",
    defaultServices: ["À domicile", "Bureaux", "Vitres", "Pressing"],
    defaultCtaPriority: ["form", "phone", "whatsapp"],
  },
  {
    value: "PHOTOGRAPHER",
    label: "Photographe",
    emoji: "📸",
    group: "Services",
    defaultServices: ["Mariage", "Famille", "Pro / portrait", "Événement"],
    defaultCtaPriority: ["form", "whatsapp", "booking"],
  },

  // Commerce
  {
    value: "SHOP",
    label: "Boutique",
    emoji: "🛍️",
    group: "Commerce",
    defaultServices: ["Nouvelle collection", "Click & collect", "Cartes cadeaux"],
    defaultCtaPriority: ["whatsapp", "phone", "directions"],
  },
  {
    value: "BOUTIQUE",
    label: "Concept store",
    emoji: "🎁",
    group: "Commerce",
    defaultServices: ["Nouveautés", "Sur-mesure", "Cartes cadeaux", "Personnalisation"],
    defaultCtaPriority: ["whatsapp", "directions", "phone"],
  },
  {
    value: "FLORIST",
    label: "Fleuriste",
    emoji: "💐",
    group: "Commerce",
    defaultServices: ["Bouquet du jour", "Mariage", "Deuil", "Livraison"],
    defaultCtaPriority: ["whatsapp", "phone", "form"],
  },
  {
    value: "OTHER",
    label: "Autre",
    emoji: "🏪",
    group: "Commerce",
    defaultServices: [],
    defaultCtaPriority: ["whatsapp", "phone", "form"],
  },
];

export function getCategoryMeta(category: BusinessCategory): BusinessCategoryMeta {
  return BUSINESS_CATEGORIES.find((c) => c.value === category) ?? BUSINESS_CATEGORIES.at(-1)!;
}

export const CATEGORY_GROUPS = Array.from(
  new Set(BUSINESS_CATEGORIES.map((c) => c.group))
) as BusinessCategoryMeta["group"][];
