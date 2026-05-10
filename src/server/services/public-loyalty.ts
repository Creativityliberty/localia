// =====================================
// Localia — Service public loyalty
// =====================================
// Chargement d'une customer_card via son public_token,
// pour la page /c/[token] que le client final consulte.
// =====================================

import { getPublicClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import {
  mapBusiness, mapCustomer, mapCustomerCard,
  mapLoyaltyCard, mapReward,
} from "@/server/db/mappers";
import type { Business } from "@/types/business";
import type {
  Customer, CustomerCard, LoyaltyCard, Reward,
} from "@/types/loyalty";

export interface PublicCustomerCardData {
  business: Business;
  customer: Customer;
  card: CustomerCard;
  program: LoyaltyCard;
  rewards: Reward[];
}

export async function getPublicCustomerCardByToken(
  token: string,
): Promise<PublicCustomerCardData | null> {
  const client = getPublicClient();
  const db: any = (client as any).database ?? client;

  try {
    const cardR = await db
      .from(TABLES.customerCards)
      .select("*")
      .eq("public_token", token)
      .eq("is_active", true)
      .limit(1);
    const cardRows = Array.isArray(cardR?.data) ? cardR.data : [];
    if (cardRows.length === 0) return null;
    const card = mapCustomerCard(cardRows[0]);

    const [bizR, customerR, progR, rewardsR] = await Promise.all([
      db.from(TABLES.businesses).select("*").eq("id", card.businessId).limit(1),
      db.from(TABLES.customers).select("*").eq("id", card.customerId).limit(1),
      db.from(TABLES.loyaltyCards).select("*").eq("id", card.loyaltyCardId).limit(1),
      db
        .from(TABLES.rewards)
        .select("*")
        .eq("customer_card_id", card.id)
        .eq("status", "AVAILABLE"),
    ]);

    const bizRows = Array.isArray(bizR?.data) ? bizR.data : [];
    const customerRows = Array.isArray(customerR?.data) ? customerR.data : [];
    const progRows = Array.isArray(progR?.data) ? progR.data : [];
    const rewardRows = Array.isArray(rewardsR?.data) ? rewardsR.data : [];

    if (bizRows.length === 0 || customerRows.length === 0 || progRows.length === 0) {
      return null;
    }

    return {
      business: mapBusiness(bizRows[0]),
      customer: mapCustomer(customerRows[0]),
      card,
      program: mapLoyaltyCard(progRows[0]),
      rewards: rewardRows.map(mapReward),
    };
  } catch (err) {
    console.error("[localia] getPublicCustomerCardByToken failed:", err);
    return null;
  }
}
