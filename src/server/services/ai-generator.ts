// =====================================
// Localia — Service IA générateur de mini-site (Gemini)
// =====================================
// Prend un brief structuré et retourne un JSON propre que
// l'éditeur va consommer pour pré-remplir hero/about/services/
// faq/cta/welcome offer/SEO.
// =====================================

import { GoogleGenAI } from "@google/genai";
import type { AiSiteGenerationInput, AiSiteGenerationOutput } from "@/types/api";
import { getProfessionTemplate } from "@/config/profession-templates";
import type { BusinessCategory } from "@/types/business";

export const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

interface GenerationContext extends AiSiteGenerationInput {
  category: BusinessCategory;
}

const SYSTEM_PROMPT = `Tu es l'assistant éditorial de Localia, une plateforme qui crée des mini-sites pour commerces locaux français.

Règles d'écriture :
- Ton chaleureux, concret, jamais corporate ni grandiloquent.
- Phrases courtes. Pas d'adjectifs creux ("incomparable", "premium", "exceptionnel").
- Le hero parle au visiteur : il se demande "est-ce le bon endroit pour moi ?"
- Les services décrivent ce qu'on reçoit, pas ce que le commerce "propose".
- L'offre de bienvenue doit être chiffrée (-10€, -20%, séance offerte, etc.)
- Le SEO title est court (60 caractères max), inclut le métier + ville.
- La FAQ répond aux 3 questions vraiment posées par les clients.

Tu retournes UNIQUEMENT un objet JSON valide qui matche exactement le schéma demandé. Pas de markdown, pas d'explications, pas de \`\`\`json\`\`\`.`;

const RESPONSE_SCHEMA_DOC = `{
  "heroTitle": string,                 // max 80 caractères, accroche directe
  "heroSubtitle": string,              // max 160 caractères, complément concret
  "about": string,                      // 2-3 phrases, max 400 caractères
  "services": [
    {
      "title": string,                  // nom court (ex: "Coupe + barbe")
      "description": string,            // 1 phrase, max 140 caractères
      "priceLabel": string              // ex: "à partir de 25€" (ou laisser "")
    }
    // 3 à 6 services
  ],
  "faq": [
    { "question": string, "answer": string }
    // exactement 3 entrées
  ],
  "primaryCta": {
    "label": string,                    // ex: "Écrire sur WhatsApp"
    "kind": string                      // un de: whatsapp, phone, booking, form
  },
  "welcomeOffer": {
    "title": string,                    // ex: "-10€ sur la première coupe"
    "description": string,              // 1 phrase
    "rewardLabel": string               // récompense en clair
  },
  "seoTitle": string,                  // max 60 caractères
  "seoDescription": string             // max 160 caractères
}`;

function buildUserPrompt(ctx: GenerationContext): string {
  const tpl = getProfessionTemplate(ctx.category);
  const ton = ctx.tone ?? tpl.recommendedTone;

  return `Génère le mini-site Localia suivant.

Commerce: ${ctx.businessName}
Catégorie: ${ctx.category}
Ville: ${ctx.location ?? "Non renseignée"}
Description fournie: ${ctx.description ?? "—"}
Services pressentis: ${ctx.services?.length ? ctx.services.join(", ") : "—"}
Ton à utiliser: ${ton}
CTA principal recommandé: ${tpl.primaryCta}
Type de preuve dominant: ${tpl.proofType}

Hint hero: "${tpl.copyHints.heroHook}"
Hint à propos: "${tpl.copyHints.aboutHook}"
Hint offre exemple: "${tpl.copyHints.offerExample}"

Réponds avec un JSON conforme à ce schéma EXACT (pas de champ en plus, pas de champ manquant) :

${RESPONSE_SCHEMA_DOC}`;
}

/**
 * Génère un site à partir d'un brief.
 * Si la clé Gemini est absente, retourne un fallback déterministe basé sur les templates.
 */
export async function generateSiteContent(
  input: AiSiteGenerationInput,
): Promise<AiSiteGenerationOutput> {
  const category = (input.category as BusinessCategory) ?? "OTHER";
  const ctx: GenerationContext = { ...input, category };

  if (!hasGeminiKey) {
    return buildFallback(ctx);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const userPrompt = buildUserPrompt(ctx);

    const response: any = await (ai as any).models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: userPrompt }] },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const text = response?.text ?? response?.response?.text ?? "";
    if (!text) throw new Error("Empty Gemini response");

    const parsed = JSON.parse(text);
    return normalizeOutput(parsed, ctx);
  } catch (err) {
    console.warn("[localia] Gemini generation failed, using fallback:", err);
    return buildFallback(ctx);
  }
}

/**
 * Fallback déterministe à partir des templates métier.
 * Utilisé quand Gemini n'est pas configuré ou échoue.
 */
function buildFallback(ctx: GenerationContext): AiSiteGenerationOutput {
  const tpl = getProfessionTemplate(ctx.category);
  const city = ctx.location ?? "votre ville";

  const heroTitle = tpl.copyHints.heroHook
    .replace("{city}", city)
    .replace("{businessName}", ctx.businessName)
    .replace("{category}", ctx.category.toLowerCase());

  return {
    heroTitle,
    heroSubtitle: ctx.description?.slice(0, 160) ?? tpl.copyHints.aboutHook,
    about: tpl.copyHints.aboutHook,
    services: (ctx.services?.length
      ? ctx.services
      : ["Service 1", "Service 2", "Service 3"]
    ).slice(0, 6).map((title) => ({
      title,
      description: "À détailler depuis l'éditeur.",
      priceLabel: "",
    })),
    faq: [
      { question: "Comment vous joindre ?", answer: "Via WhatsApp, par téléphone ou en venant directement." },
      { question: "Faut-il prendre rendez-vous ?", answer: "C'est conseillé. Contactez-nous via le bouton principal." },
      { question: "Acceptez-vous les paiements par carte ?", answer: "Oui, espèces et carte." },
    ],
    primaryCta: {
      label:
        tpl.primaryCta === "whatsapp" ? "Écrire sur WhatsApp" :
        tpl.primaryCta === "phone" ? "Nous appeler" :
        tpl.primaryCta === "booking" ? "Réserver" :
        "Envoyer un message",
      kind: tpl.primaryCta,
    },
    welcomeOffer: {
      title: tpl.copyHints.offerExample,
      description: "Offre valable pour les nouveaux clients.",
      rewardLabel: tpl.copyHints.offerExample,
    },
    seoTitle: `${ctx.businessName} — ${city}`.slice(0, 60),
    seoDescription: `${ctx.businessName} à ${city}. ${tpl.copyHints.aboutHook}`.slice(0, 160),
  };
}

/**
 * Normalise une sortie Gemini pour garantir tous les champs.
 */
function normalizeOutput(raw: any, ctx: GenerationContext): AiSiteGenerationOutput {
  const fallback = buildFallback(ctx);
  const safe = (v: unknown, fb: string): string => (typeof v === "string" && v.trim() ? v.trim() : fb);

  return {
    heroTitle: safe(raw?.heroTitle, fallback.heroTitle).slice(0, 200),
    heroSubtitle: safe(raw?.heroSubtitle, fallback.heroSubtitle).slice(0, 320),
    about: safe(raw?.about, fallback.about).slice(0, 800),
    services: Array.isArray(raw?.services) && raw.services.length > 0
      ? raw.services.slice(0, 8).map((s: any) => ({
          title: safe(s?.title, "Service").slice(0, 180),
          description: safe(s?.description, "").slice(0, 300),
          priceLabel: typeof s?.priceLabel === "string" ? s.priceLabel.slice(0, 60) : undefined,
        }))
      : fallback.services,
    faq: Array.isArray(raw?.faq) && raw.faq.length > 0
      ? raw.faq.slice(0, 6).map((f: any) => ({
          question: safe(f?.question, "Question").slice(0, 200),
          answer: safe(f?.answer, "Réponse").slice(0, 600),
        }))
      : fallback.faq,
    primaryCta: {
      label: safe(raw?.primaryCta?.label, fallback.primaryCta.label),
      kind: safe(raw?.primaryCta?.kind, fallback.primaryCta.kind),
    },
    welcomeOffer: {
      title: safe(raw?.welcomeOffer?.title, fallback.welcomeOffer.title).slice(0, 180),
      description: safe(raw?.welcomeOffer?.description, fallback.welcomeOffer.description).slice(0, 500),
      rewardLabel: safe(raw?.welcomeOffer?.rewardLabel, fallback.welcomeOffer.rewardLabel).slice(0, 180),
    },
    seoTitle: safe(raw?.seoTitle, fallback.seoTitle).slice(0, 60),
    seoDescription: safe(raw?.seoDescription, fallback.seoDescription).slice(0, 160),
  };
}
