// =====================================
// Localia — Types Fidélité
// =====================================

export type LoyaltyKind = "STAMP" | "POINTS";

export type CustomerStatus = "ACTIVE" | "DORMANT" | "VIP" | "BLOCKED";

export type CustomerTier = "STANDARD" | "BRONZE" | "SILVER" | "GOLD" | "VIP";

export type TransactionKind =
  | "POINTS_ADDED" | "POINTS_REMOVED"
  | "STAMP_ADDED" | "STAMP_REMOVED"
  | "REWARD_UNLOCKED" | "REWARD_REDEEMED"
  | "MANUAL_ADJUSTMENT";

export type RewardStatus = "AVAILABLE" | "REDEEMED" | "EXPIRED" | "CANCELLED";

export interface LoyaltyCard {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  kind: LoyaltyKind;
  stampsRequired: number | null;
  pointsPerVisit: number | null;
  rewardThresholdPoints: number | null;
  rewardLabel: string;
  rewardDescription: string | null;
  cardColor: string;
  cardAccent: string;
  icon: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  status: CustomerStatus;
  tier: CustomerTier;
  consentMarketing: boolean;
  consentAt: string | null;
  source: string;
  notes: string | null;
  lastVisitAt: string | null;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCard {
  id: string;
  customerId: string;
  businessId: string;
  loyaltyCardId: string;
  publicToken: string;
  pointsBalance: number;
  lifetimePoints: number;
  stampsCount: number;
  lifetimeStamps: number;
  rewardAvailable: boolean;
  rewardsRedeemedCount: number;
  lastVisitAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  businessId: string;
  customerId: string;
  customerCardId: string;
  loyaltyCardId: string;
  kind: TransactionKind;
  pointsDelta: number;
  stampsDelta: number;
  amount: number | null;
  rewardId: string | null;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface Reward {
  id: string;
  businessId: string;
  customerId: string;
  customerCardId: string;
  loyaltyCardId: string;
  title: string;
  description: string | null;
  status: RewardStatus;
  redemptionCode: string | null;
  unlockedAt: string;
  redeemedAt: string | null;
  expiresAt: string | null;
  redeemedBy: string | null;
  createdAt: string;
}
