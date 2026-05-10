// =====================================
// Localia — QR generation helpers
// =====================================
// Génère des URLs trackées pour les QR codes et expose les
// utilitaires d'export PNG/SVG/PDF côté client.
// =====================================

import type { QrPurpose } from "@/types/business";

/**
 * Construit l'URL publique vers laquelle un QR pointe :
 * https://localia.app/q/[shortToken]
 *
 * On passe TOUJOURS par /q/[token] pour pouvoir tracer le scan
 * et changer la cible sans réimprimer.
 */
export function buildQrTrackingUrl(shortToken: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://localia.app";
  return `${base.replace(/\/$/, "")}/q/${shortToken}`;
}

/**
 * Construit l'URL cible "naturelle" selon le purpose, à utiliser
 * lors de la création d'un QR : Localia stocke targetUrl, le visiteur
 * passe par /q/[token] qui fera la redirection finale.
 */
export function buildDefaultTargetUrl(opts: {
  purpose: QrPurpose;
  siteSlug?: string | null;
  whatsappNumber?: string | null;
  googleReviewUrl?: string | null;
  bookingUrl?: string | null;
  loyaltyToken?: string | null;
  customUrl?: string | null;
}): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://localia.app").replace(/\/$/, "");

  switch (opts.purpose) {
    case "site":
      return opts.siteSlug ? `${base}/s/${opts.siteSlug}` : base;
    case "menu":
      return opts.siteSlug ? `${base}/s/${opts.siteSlug}#menu` : base;
    case "offer":
      return opts.siteSlug ? `${base}/s/${opts.siteSlug}#offer` : base;
    case "review":
      return opts.googleReviewUrl ?? `${base}/s/${opts.siteSlug ?? ""}`;
    case "booking":
      return opts.bookingUrl ?? `${base}/s/${opts.siteSlug ?? ""}`;
    case "whatsapp":
      if (opts.whatsappNumber) {
        const clean = opts.whatsappNumber.replace(/[^0-9]/g, "");
        return `https://wa.me/${clean}`;
      }
      return base;
    case "loyalty":
      return opts.loyaltyToken
        ? `${base}/c/${opts.loyaltyToken}`
        : opts.siteSlug
          ? `${base}/s/${opts.siteSlug}/fidelite`
          : base;
    case "custom":
    default:
      return opts.customUrl ?? base;
  }
}

/**
 * Télécharge un dataURL en tant que fichier.
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convertit un canvas en PNG dataURL.
 */
export function canvasToPngDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png", 1.0);
}

/**
 * Convertit un SVG element en string.
 */
export function svgElementToString(svg: SVGElement): string {
  const serializer = new XMLSerializer();
  let str = serializer.serializeToString(svg);
  if (!str.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    str = str.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return str;
}

/**
 * Build le label complet pour une affiche QR imprimable.
 */
export function buildQrPosterTitle(purpose: QrPurpose, businessName: string): string {
  const titles: Record<QrPurpose, string> = {
    site: `Découvrez ${businessName}`,
    menu: `Notre menu`,
    offer: `Offre de bienvenue`,
    review: `Laissez-nous un avis`,
    booking: `Réservez en ligne`,
    whatsapp: `Écrivez-nous sur WhatsApp`,
    loyalty: `Notre carte fidélité`,
    custom: businessName,
  };
  return titles[purpose] ?? businessName;
}
