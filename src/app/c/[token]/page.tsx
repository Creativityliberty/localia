import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicCustomerCardByToken } from "@/server/services/public-loyalty";
import { PublicLoyaltyCardView } from "@/components/public/public-loyalty-card";

interface Params {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const data = await getPublicCustomerCardByToken(token);
  if (!data) return { title: "Carte introuvable" };
  return {
    title: `Carte fidélité — ${data.business.name}`,
    description: `Votre carte fidélité ${data.program.name} chez ${data.business.name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicLoyaltyPage({ params }: Params) {
  const { token } = await params;
  const data = await getPublicCustomerCardByToken(token);

  if (!data) notFound();

  return <PublicLoyaltyCardView {...data} />;
}
