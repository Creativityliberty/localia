// =====================================
// Localia — Loyalty service
// =====================================
// Logique métier des cartes fidélité :
// - addStamp / addPoints : transaction + recalcul + déblocage récompense
// - redeem : consommation d'une récompense disponible
// =====================================

import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapCustomerCard, mapLoyaltyCard, mapReward, mapTransaction } from "@/server/db/mappers";
import { ApiError } from "@/server/http/api-error";
import { generateToken } from "@/lib/utils";
import type { CustomerCard, LoyaltyCard, Reward, Transaction } from "@/types/loyalty";

interface DbBundle {
  db: any;
}

async function getDb(): Promise<DbBundle> {
  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;
  return { db };
}

/**
 * Charge la customer_card + sa loyalty_card mère (pour connaître les règles).
 */
async function loadCardWithProgram(
  customerCardId: string,
): Promise<{ card: CustomerCard; program: LoyaltyCard }> {
  const { db } = await getDb();

  const cardR = await db.from(TABLES.customerCards).select("*").eq("id", customerCardId).limit(1);
  const cardRows = Array.isArray(cardR?.data) ? cardR.data : [];
  if (cardRows.length === 0) throw new ApiError("CARD_NOT_FOUND", "Carte introuvable.", 404);
  const card = mapCustomerCard(cardRows[0]);

  const progR = await db.from(TABLES.loyaltyCards).select("*").eq("id", card.loyaltyCardId).limit(1);
  const progRows = Array.isArray(progR?.data) ? progR.data : [];
  if (progRows.length === 0) throw new ApiError("PROGRAM_NOT_FOUND", "Programme introuvable.", 404);
  const program = mapLoyaltyCard(progRows[0]);

  return { card, program };
}

/**
 * Ajoute un tampon à une carte STAMP.
 * Si le seuil est atteint, débloque une récompense et reset le compteur.
 */
export async function addStamp(opts: {
  customerCardId: string;
  createdBy: string;
  note?: string;
}): Promise<{
  card: CustomerCard;
  transaction: Transaction;
  unlockedReward: Reward | null;
}> {
  const { card, program } = await loadCardWithProgram(opts.customerCardId);
  if (program.kind !== "STAMP") {
    throw new ApiError("WRONG_PROGRAM_KIND", "Ce programme n'est pas en mode tampons.", 400);
  }

  const stampsRequired = program.stampsRequired ?? 10;
  const newStamps = card.stampsCount + 1;
  const reachesReward = newStamps >= stampsRequired;
  const finalStamps = reachesReward ? 0 : newStamps;

  const { db } = await getDb();

  // 1. update card
  const cardUpdate: Record<string, unknown> = {
    stamps_count: finalStamps,
    lifetime_stamps: card.lifetimeStamps + 1,
    last_visit_at: new Date().toISOString(),
  };
  if (reachesReward) cardUpdate.reward_available = true;

  const cardUpdateR = await db
    .from(TABLES.customerCards)
    .update(cardUpdate)
    .eq("id", card.id)
    .select("*");
  const updatedRows = Array.isArray(cardUpdateR?.data) ? cardUpdateR.data : [];
  const updatedCard = updatedRows.length > 0 ? mapCustomerCard(updatedRows[0]) : card;

  // 2. transaction
  const txR = await db
    .from(TABLES.transactions)
    .insert({
      business_id: card.businessId,
      customer_id: card.customerId,
      customer_card_id: card.id,
      loyalty_card_id: card.loyaltyCardId,
      kind: "STAMP_ADDED",
      stamps_delta: 1,
      points_delta: 0,
      note: opts.note ?? null,
      created_by: opts.createdBy,
    })
    .select("*");
  const txRows = Array.isArray(txR?.data) ? txR.data : [];
  const transaction = mapTransaction(txRows[0] ?? {
    id: "", business_id: card.businessId, customer_id: card.customerId,
    customer_card_id: card.id, loyalty_card_id: card.loyaltyCardId,
    kind: "STAMP_ADDED", points_delta: 0, stamps_delta: 1,
    created_at: new Date().toISOString(),
  });

  // 3. reward unlock
  let unlockedReward: Reward | null = null;
  if (reachesReward) {
    const rewardR = await db
      .from(TABLES.rewards)
      .insert({
        business_id: card.businessId,
        customer_id: card.customerId,
        customer_card_id: card.id,
        loyalty_card_id: card.loyaltyCardId,
        title: program.rewardLabel,
        description: program.rewardDescription,
        status: "AVAILABLE",
        redemption_code: generateToken(8),
      })
      .select("*");
    const rewardRows = Array.isArray(rewardR?.data) ? rewardR.data : [];
    if (rewardRows.length > 0) unlockedReward = mapReward(rewardRows[0]);

    // Trace la transaction reward unlock
    await db.from(TABLES.transactions).insert({
      business_id: card.businessId,
      customer_id: card.customerId,
      customer_card_id: card.id,
      loyalty_card_id: card.loyaltyCardId,
      kind: "REWARD_UNLOCKED",
      points_delta: 0,
      stamps_delta: 0,
      reward_id: unlockedReward?.id ?? null,
      created_by: opts.createdBy,
    });
  }

  return { card: updatedCard, transaction, unlockedReward };
}

/**
 * Ajoute des points à une carte POINTS.
 */
export async function addPoints(opts: {
  customerCardId: string;
  points: number;
  amount?: number;
  createdBy: string;
  note?: string;
}): Promise<{
  card: CustomerCard;
  transaction: Transaction;
  unlockedReward: Reward | null;
}> {
  if (!Number.isFinite(opts.points) || opts.points <= 0) {
    throw new ApiError("INVALID_POINTS", "Le nombre de points doit être positif.", 400);
  }

  const { card, program } = await loadCardWithProgram(opts.customerCardId);
  if (program.kind !== "POINTS") {
    throw new ApiError("WRONG_PROGRAM_KIND", "Ce programme n'est pas en mode points.", 400);
  }

  const threshold = program.rewardThresholdPoints ?? 100;
  const newBalance = card.pointsBalance + opts.points;
  const reachesReward = newBalance >= threshold;
  const finalBalance = reachesReward ? newBalance - threshold : newBalance;

  const { db } = await getDb();

  const cardUpdate: Record<string, unknown> = {
    points_balance: finalBalance,
    lifetime_points: card.lifetimePoints + opts.points,
    last_visit_at: new Date().toISOString(),
  };
  if (reachesReward) cardUpdate.reward_available = true;

  const cardUpdateR = await db
    .from(TABLES.customerCards)
    .update(cardUpdate)
    .eq("id", card.id)
    .select("*");
  const updatedRows = Array.isArray(cardUpdateR?.data) ? cardUpdateR.data : [];
  const updatedCard = updatedRows.length > 0 ? mapCustomerCard(updatedRows[0]) : card;

  const txR = await db
    .from(TABLES.transactions)
    .insert({
      business_id: card.businessId,
      customer_id: card.customerId,
      customer_card_id: card.id,
      loyalty_card_id: card.loyaltyCardId,
      kind: "POINTS_ADDED",
      points_delta: opts.points,
      stamps_delta: 0,
      amount: opts.amount ?? null,
      note: opts.note ?? null,
      created_by: opts.createdBy,
    })
    .select("*");
  const txRows = Array.isArray(txR?.data) ? txR.data : [];
  const transaction = mapTransaction(txRows[0]);

  let unlockedReward: Reward | null = null;
  if (reachesReward) {
    const rewardR = await db
      .from(TABLES.rewards)
      .insert({
        business_id: card.businessId,
        customer_id: card.customerId,
        customer_card_id: card.id,
        loyalty_card_id: card.loyaltyCardId,
        title: program.rewardLabel,
        description: program.rewardDescription,
        status: "AVAILABLE",
        redemption_code: generateToken(8),
      })
      .select("*");
    const rewardRows = Array.isArray(rewardR?.data) ? rewardR.data : [];
    if (rewardRows.length > 0) unlockedReward = mapReward(rewardRows[0]);

    await db.from(TABLES.transactions).insert({
      business_id: card.businessId,
      customer_id: card.customerId,
      customer_card_id: card.id,
      loyalty_card_id: card.loyaltyCardId,
      kind: "REWARD_UNLOCKED",
      points_delta: 0,
      stamps_delta: 0,
      reward_id: unlockedReward?.id ?? null,
      created_by: opts.createdBy,
    });
  }

  return { card: updatedCard, transaction, unlockedReward };
}

/**
 * Consomme une récompense disponible.
 */
export async function redeemReward(opts: {
  customerCardId: string;
  rewardId?: string;
  createdBy: string;
  note?: string;
}): Promise<{ card: CustomerCard; reward: Reward; transaction: Transaction }> {
  const { card } = await loadCardWithProgram(opts.customerCardId);
  if (!card.rewardAvailable) {
    throw new ApiError("NO_REWARD_AVAILABLE", "Aucune récompense à utiliser.", 400);
  }

  const { db } = await getDb();

  // Trouve une récompense AVAILABLE pour cette carte
  let rewardR;
  if (opts.rewardId) {
    rewardR = await db
      .from(TABLES.rewards)
      .select("*")
      .eq("id", opts.rewardId)
      .eq("status", "AVAILABLE")
      .limit(1);
  } else {
    rewardR = await db
      .from(TABLES.rewards)
      .select("*")
      .eq("customer_card_id", card.id)
      .eq("status", "AVAILABLE")
      .order("unlocked_at", { ascending: true })
      .limit(1);
  }
  const rewardRows = Array.isArray(rewardR?.data) ? rewardR.data : [];
  if (rewardRows.length === 0) {
    throw new ApiError("REWARD_NOT_FOUND", "Récompense introuvable.", 404);
  }
  const reward = mapReward(rewardRows[0]);

  // Mettre à jour la reward
  const now = new Date().toISOString();
  const updateR = await db
    .from(TABLES.rewards)
    .update({ status: "REDEEMED", redeemed_at: now, redeemed_by: opts.createdBy })
    .eq("id", reward.id)
    .select("*");
  const updatedRewards = Array.isArray(updateR?.data) ? updateR.data : [];
  const finalReward = updatedRewards.length > 0 ? mapReward(updatedRewards[0]) : reward;

  // Vérifier s'il reste d'autres rewards AVAILABLE pour cette carte
  const remainR = await db
    .from(TABLES.rewards)
    .select("id")
    .eq("customer_card_id", card.id)
    .eq("status", "AVAILABLE");
  const remainCount = Array.isArray(remainR?.data) ? remainR.data.length : 0;

  // Mettre à jour la carte
  const cardUpdateR = await db
    .from(TABLES.customerCards)
    .update({
      reward_available: remainCount > 0,
      rewards_redeemed_count: card.rewardsRedeemedCount + 1,
    })
    .eq("id", card.id)
    .select("*");
  const cardRows = Array.isArray(cardUpdateR?.data) ? cardUpdateR.data : [];
  const updatedCard = cardRows.length > 0 ? mapCustomerCard(cardRows[0]) : card;

  // Transaction
  const txR = await db
    .from(TABLES.transactions)
    .insert({
      business_id: card.businessId,
      customer_id: card.customerId,
      customer_card_id: card.id,
      loyalty_card_id: card.loyaltyCardId,
      kind: "REWARD_REDEEMED",
      points_delta: 0,
      stamps_delta: 0,
      reward_id: finalReward.id,
      note: opts.note ?? null,
      created_by: opts.createdBy,
    })
    .select("*");
  const txRows = Array.isArray(txR?.data) ? txR.data : [];
  const transaction = mapTransaction(txRows[0]);

  return { card: updatedCard, reward: finalReward, transaction };
}
