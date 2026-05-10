import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicSiteBySlug } from "@/server/services/public-site";
import { PublicSite } from "@/components/public/public-site";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicSiteBySlug(slug);

  if (!data) return { title: "Page introuvable" };

  const { business, site } = data;
  const title = site.seoTitle ?? `${business.name} — ${business.city ?? "Commerce local"}`;
  const description = site.seoDescription ?? business.tagline ?? business.description ?? `Découvrez ${business.name} sur Localia.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: site.ogImageUrl ? [{ url: site.ogImageUrl }] : business.bannerUrl ? [{ url: business.bannerUrl }] : undefined,
      type: "website",
      locale: "fr_FR",
    },
  };
}

export default async function PublicSitePage({ params }: Params) {
  const { slug } = await params;
  const data = await getPublicSiteBySlug(slug);

  if (!data) notFound();

  return <PublicSite {...data} />;
}
