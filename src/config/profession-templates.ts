// =====================================
// Localia — Profession Templates
// =====================================
// Chaque métier a un template par défaut :
// - sections obligatoires + ordre
// - CTA principal/secondaires
// - ton recommandé pour la génération IA
// Règle : Localia ne doit pas générer la même page pour un
// barber, un snack, un institut et un garagiste.
// =====================================

import type { BusinessCategory, SectionKind, CtaKind } from "@/types/business";

export interface ProfessionTemplate {
  category: BusinessCategory;
  sections: Array<{
    kind: SectionKind;
    required: boolean;
    title: string;
  }>;
  primaryCta: CtaKind;
  secondaryCtas: CtaKind[];
  recommendedTone: "warm" | "professional" | "playful" | "minimal";
  proofType: "reviews" | "before_after" | "gallery" | "credentials" | "stats";
  themePreset: string;
  copyHints: {
    heroHook: string;
    aboutHook: string;
    offerExample: string;
  };
}

export const PROFESSION_TEMPLATES: Record<BusinessCategory, ProfessionTemplate> = {
  BARBER: {
    category: "BARBER",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Prestations" },
      { kind: "gallery", required: false, title: "Galerie coupes" },
      { kind: "testimonials", required: false, title: "Avis clients" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Itinéraire" },
      { kind: "cta", required: true, title: "Réserver" },
    ],
    primaryCta: "whatsapp",
    secondaryCtas: ["booking", "phone"],
    recommendedTone: "warm",
    proofType: "before_after",
    themePreset: "warm",
    copyHints: {
      heroHook: "Le barber {city} qui prend soin de votre style.",
      aboutHook: "Coupe précise, ambiance détendue, retour client garanti.",
      offerExample: "-10€ sur votre première coupe + barbe.",
    },
  },

  HAIRDRESSER: {
    category: "HAIRDRESSER",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Prestations" },
      { kind: "gallery", required: false, title: "Réalisations" },
      { kind: "testimonials", required: false, title: "Avis" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Adresse" },
      { kind: "cta", required: true, title: "Prendre RDV" },
    ],
    primaryCta: "booking",
    secondaryCtas: ["whatsapp", "phone"],
    recommendedTone: "warm",
    proofType: "before_after",
    themePreset: "soft",
    copyHints: {
      heroHook: "Coiffure créative à {city}, conseil personnalisé inclus.",
      aboutHook: "Coloriste passionnée, écoute avant tout.",
      offerExample: "Diagnostic capillaire offert pour la première visite.",
    },
  },

  BEAUTY: {
    category: "BEAUTY",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Soins" },
      { kind: "offer", required: false, title: "Offre découverte" },
      { kind: "testimonials", required: false, title: "Avis" },
      { kind: "gallery", required: false, title: "Galerie" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Adresse" },
      { kind: "cta", required: true, title: "Réserver" },
    ],
    primaryCta: "booking",
    secondaryCtas: ["whatsapp", "phone"],
    recommendedTone: "warm",
    proofType: "reviews",
    themePreset: "soft",
    copyHints: {
      heroHook: "L'institut qui prend le temps. {city}.",
      aboutHook: "Soins sur-mesure, produits sélectionnés, cocon urbain.",
      offerExample: "Soin du visage découverte à -20%.",
    },
  },

  NAILS: {
    category: "NAILS",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Prestations" },
      { kind: "gallery", required: true, title: "Nail art" },
      { kind: "offer", required: false, title: "Offre" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Adresse" },
      { kind: "cta", required: true, title: "Réserver" },
    ],
    primaryCta: "whatsapp",
    secondaryCtas: ["booking", "phone"],
    recommendedTone: "playful",
    proofType: "gallery",
    themePreset: "soft",
    copyHints: {
      heroHook: "Vos ongles, votre style. {city}.",
      aboutHook: "Pose semi-permanent, gel, nail art créatif.",
      offerExample: "Première pose : -15%.",
    },
  },

  SPA: {
    category: "SPA",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Soins & rituels" },
      { kind: "gallery", required: false, title: "Lieu" },
      { kind: "testimonials", required: false, title: "Avis" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "cta", required: true, title: "Réserver" },
    ],
    primaryCta: "booking",
    secondaryCtas: ["phone", "whatsapp"],
    recommendedTone: "professional",
    proofType: "reviews",
    themePreset: "minimal",
    copyHints: {
      heroHook: "Une parenthèse à {city}.",
      aboutHook: "Soins en cabine, sauna, hammam.",
      offerExample: "Forfait découverte 1h30 à 79€.",
    },
  },

  RESTAURANT: {
    category: "RESTAURANT",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Carte / Menu" },
      { kind: "gallery", required: false, title: "Plats" },
      { kind: "testimonials", required: false, title: "Avis" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Itinéraire" },
      { kind: "cta", required: true, title: "Réserver / Contacter" },
    ],
    primaryCta: "booking",
    secondaryCtas: ["phone", "directions"],
    recommendedTone: "warm",
    proofType: "reviews",
    themePreset: "warm",
    copyHints: {
      heroHook: "La cuisine de {city}, avec amour.",
      aboutHook: "Produits frais, carte de saison, accueil maison.",
      offerExample: "Menu midi à 15€ jusqu'à 14h.",
    },
  },

  SNACK: {
    category: "SNACK",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Le menu" },
      { kind: "gallery", required: false, title: "Photos" },
      { kind: "offer", required: false, title: "Promo" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Itinéraire" },
      { kind: "cta", required: true, title: "Commander" },
    ],
    primaryCta: "whatsapp",
    secondaryCtas: ["phone", "directions"],
    recommendedTone: "playful",
    proofType: "gallery",
    themePreset: "warm",
    copyHints: {
      heroHook: "Tacos, burgers, généreux. {city}.",
      aboutHook: "Maison, copieux, frais. Click & collect dispo.",
      offerExample: "Menu midi 9.90€ avec boisson.",
    },
  },

  FOODTRUCK: {
    category: "FOODTRUCK",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Carte" },
      { kind: "gallery", required: false, title: "Photos" },
      { kind: "hours", required: true, title: "Tournée" },
      { kind: "cta", required: true, title: "Privatiser" },
    ],
    primaryCta: "whatsapp",
    secondaryCtas: ["phone", "form"],
    recommendedTone: "playful",
    proofType: "gallery",
    themePreset: "warm",
    copyHints: {
      heroHook: "Le food truck qui débarque à {city}.",
      aboutHook: "Cuisine de rue, événements privés, traiteur.",
      offerExample: "Privatisation événement : devis 24h.",
    },
  },

  BAKERY: {
    category: "BAKERY",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Nos produits" },
      { kind: "gallery", required: false, title: "Galerie" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Adresse" },
      { kind: "cta", required: true, title: "Commande" },
    ],
    primaryCta: "phone",
    secondaryCtas: ["whatsapp", "directions"],
    recommendedTone: "warm",
    proofType: "gallery",
    themePreset: "warm",
    copyHints: {
      heroHook: "Pain au levain, pâtisseries maison. {city}.",
      aboutHook: "Farine bio, pétrissage long, cuisson sur sole.",
      offerExample: "Commandez votre gâteau avant 18h la veille.",
    },
  },

  COFFEE: {
    category: "COFFEE",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Carte" },
      { kind: "gallery", required: false, title: "Le lieu" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Adresse" },
      { kind: "cta", required: true, title: "Venir" },
    ],
    primaryCta: "directions",
    secondaryCtas: ["phone", "whatsapp"],
    recommendedTone: "minimal",
    proofType: "gallery",
    themePreset: "minimal",
    copyHints: {
      heroHook: "Café de spécialité, à {city}.",
      aboutHook: "Torréfaction maison, brunch maison, wifi.",
      offerExample: "Carte fidélité : 1 café offert tous les 10.",
    },
  },

  COACH: {
    category: "COACH",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "about", required: true, title: "À propos" },
      { kind: "services", required: true, title: "Accompagnements" },
      { kind: "testimonials", required: true, title: "Témoignages" },
      { kind: "faq", required: false, title: "FAQ" },
      { kind: "cta", required: true, title: "Premier contact" },
    ],
    primaryCta: "form",
    secondaryCtas: ["booking", "whatsapp"],
    recommendedTone: "professional",
    proofType: "credentials",
    themePreset: "minimal",
    copyHints: {
      heroHook: "Coach {category} à {city}. Méthode claire, suivi humain.",
      aboutHook: "Accompagnement individuel, écoute, résultats concrets.",
      offerExample: "Première séance offerte (45 min, en visio).",
    },
  },

  FITNESS: {
    category: "FITNESS",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Programmes" },
      { kind: "testimonials", required: false, title: "Transformations" },
      { kind: "about", required: false, title: "À propos" },
      { kind: "cta", required: true, title: "Bilan" },
    ],
    primaryCta: "whatsapp",
    secondaryCtas: ["form", "phone"],
    recommendedTone: "professional",
    proofType: "before_after",
    themePreset: "minimal",
    copyHints: {
      heroHook: "Atteignez vos objectifs avec un coaching qui tient ses promesses.",
      aboutHook: "Coach diplômé. Programmes sur-mesure. Suivi hebdomadaire.",
      offerExample: "Bilan forme + plan d'attaque : 49€ (au lieu de 80€).",
    },
  },

  YOGA: {
    category: "YOGA",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Cours" },
      { kind: "about", required: false, title: "Le studio" },
      { kind: "hours", required: true, title: "Planning" },
      { kind: "cta", required: true, title: "Réserver" },
    ],
    primaryCta: "booking",
    secondaryCtas: ["form", "whatsapp"],
    recommendedTone: "minimal",
    proofType: "reviews",
    themePreset: "minimal",
    copyHints: {
      heroHook: "Le yoga sans dogme. {city}.",
      aboutHook: "Vinyasa, hatha, yin. Cours collectifs et privés.",
      offerExample: "1ère semaine illimitée à 19€.",
    },
  },

  PHYSIO: {
    category: "PHYSIO",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Consultations" },
      { kind: "about", required: false, title: "Approche" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Cabinet" },
      { kind: "cta", required: true, title: "RDV" },
    ],
    primaryCta: "booking",
    secondaryCtas: ["phone"],
    recommendedTone: "professional",
    proofType: "credentials",
    themePreset: "minimal",
    copyHints: {
      heroHook: "Cabinet de kinésithérapie à {city}.",
      aboutHook: "Approche manuelle. Suivi sportif et fonctionnel.",
      offerExample: "Conventionné secteur 1.",
    },
  },

  THERAPIST: {
    category: "THERAPIST",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "about", required: true, title: "À propos" },
      { kind: "services", required: true, title: "Séances" },
      { kind: "faq", required: false, title: "FAQ" },
      { kind: "cta", required: true, title: "Contact" },
    ],
    primaryCta: "form",
    secondaryCtas: ["phone", "booking"],
    recommendedTone: "professional",
    proofType: "credentials",
    themePreset: "soft",
    copyHints: {
      heroHook: "Un espace pour vous. {city}.",
      aboutHook: "Écoute bienveillante. Cabinet ou visioconsultation.",
      offerExample: "Première séance d'orientation à tarif réduit.",
    },
  },

  CRAFTSMAN: {
    category: "CRAFTSMAN",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Prestations" },
      { kind: "gallery", required: true, title: "Réalisations" },
      { kind: "testimonials", required: false, title: "Avis clients" },
      { kind: "cta", required: true, title: "Devis gratuit" },
    ],
    primaryCta: "form",
    secondaryCtas: ["phone", "whatsapp"],
    recommendedTone: "professional",
    proofType: "before_after",
    themePreset: "warm",
    copyHints: {
      heroHook: "Artisan à {city}. Du devis au chantier.",
      aboutHook: "Travail soigné, garantie décennale, devis gratuit.",
      offerExample: "Devis sous 48h, déplacement offert.",
    },
  },

  GARAGE: {
    category: "GARAGE",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Prestations" },
      { kind: "testimonials", required: false, title: "Avis" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Adresse" },
      { kind: "cta", required: true, title: "Devis" },
    ],
    primaryCta: "phone",
    secondaryCtas: ["whatsapp", "form"],
    recommendedTone: "professional",
    proofType: "reviews",
    themePreset: "minimal",
    copyHints: {
      heroHook: "Garage de confiance à {city}.",
      aboutHook: "Toutes marques. Diagnostic gratuit. Devis transparent.",
      offerExample: "Vidange + filtres dès 79€.",
    },
  },

  CLEANING: {
    category: "CLEANING",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Prestations" },
      { kind: "testimonials", required: false, title: "Avis" },
      { kind: "cta", required: true, title: "Devis" },
    ],
    primaryCta: "form",
    secondaryCtas: ["phone", "whatsapp"],
    recommendedTone: "professional",
    proofType: "reviews",
    themePreset: "fresh",
    copyHints: {
      heroHook: "Le ménage qui se voit. {city}.",
      aboutHook: "Particuliers et professionnels. Engagement satisfaction.",
      offerExample: "1ère intervention : -20%.",
    },
  },

  PHOTOGRAPHER: {
    category: "PHOTOGRAPHER",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "gallery", required: true, title: "Portfolio" },
      { kind: "services", required: true, title: "Prestations" },
      { kind: "testimonials", required: false, title: "Avis" },
      { kind: "cta", required: true, title: "Devis" },
    ],
    primaryCta: "form",
    secondaryCtas: ["whatsapp", "booking"],
    recommendedTone: "minimal",
    proofType: "gallery",
    themePreset: "minimal",
    copyHints: {
      heroHook: "Photographe à {city}. Mariages, famille, pro.",
      aboutHook: "Une approche posée, des images qui durent.",
      offerExample: "Pré-shooting offert pour les mariages réservés en {month}.",
    },
  },

  SHOP: {
    category: "SHOP",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "L'univers" },
      { kind: "gallery", required: false, title: "Galerie" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Adresse" },
      { kind: "cta", required: true, title: "Visiter" },
    ],
    primaryCta: "directions",
    secondaryCtas: ["whatsapp", "phone"],
    recommendedTone: "warm",
    proofType: "gallery",
    themePreset: "fresh",
    copyHints: {
      heroHook: "Boutique à {city}.",
      aboutHook: "Sélection pointue, conseil personnalisé.",
      offerExample: "-15% sur votre 1ère visite avec code BIENVENUE.",
    },
  },

  BOUTIQUE: {
    category: "BOUTIQUE",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Univers" },
      { kind: "gallery", required: true, title: "Lookbook" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "map", required: true, title: "Adresse" },
      { kind: "cta", required: true, title: "Visiter" },
    ],
    primaryCta: "directions",
    secondaryCtas: ["whatsapp", "instagram"],
    recommendedTone: "minimal",
    proofType: "gallery",
    themePreset: "minimal",
    copyHints: {
      heroHook: "Concept store à {city}.",
      aboutHook: "Marques rares, pièces choisies.",
      offerExample: "Carte cadeau dès 30€.",
    },
  },

  FLORIST: {
    category: "FLORIST",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "services", required: true, title: "Prestations" },
      { kind: "gallery", required: true, title: "Créations" },
      { kind: "hours", required: true, title: "Horaires" },
      { kind: "cta", required: true, title: "Commander" },
    ],
    primaryCta: "whatsapp",
    secondaryCtas: ["phone", "directions"],
    recommendedTone: "warm",
    proofType: "gallery",
    themePreset: "soft",
    copyHints: {
      heroHook: "Le fleuriste de {city}.",
      aboutHook: "Bouquets du jour, mariages, deuil, livraison.",
      offerExample: "Livraison locale dès 39€.",
    },
  },

  OTHER: {
    category: "OTHER",
    sections: [
      { kind: "hero", required: true, title: "Hero" },
      { kind: "about", required: false, title: "À propos" },
      { kind: "services", required: true, title: "Prestations" },
      { kind: "cta", required: true, title: "Contact" },
    ],
    primaryCta: "whatsapp",
    secondaryCtas: ["phone", "form"],
    recommendedTone: "warm",
    proofType: "reviews",
    themePreset: "fresh",
    copyHints: {
      heroHook: "{businessName} à {city}.",
      aboutHook: "Le service local qui prend soin de vous.",
      offerExample: "Première visite : -10%.",
    },
  },
};

export function getProfessionTemplate(category: BusinessCategory): ProfessionTemplate {
  return PROFESSION_TEMPLATES[category] ?? PROFESSION_TEMPLATES.OTHER;
}
