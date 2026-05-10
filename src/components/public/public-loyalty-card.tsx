"use client";

import { Stars, Gift, MapPin, Phone, MessageCircle } from "lucide-react";
import { buildPhoneLink, buildWhatsAppLink } from "@/lib/utils";
import type { Business } from "@/types/business";
import type { Customer, CustomerCard, LoyaltyCard, Reward } from "@/types/loyalty";

interface Props {
  business: Business;
  customer: Customer;
  card: CustomerCard;
  program: LoyaltyCard;
  rewards: Reward[];
}

export function PublicLoyaltyCardView({ business, customer, card, program, rewards }: Props) {
  const isStamp = program.kind === "STAMP";
  const target = isStamp ? program.stampsRequired ?? 10 : program.rewardThresholdPoints ?? 100;
  const current = isStamp ? card.stampsCount : card.pointsBalance;
  const progress = Math.min(100, (current / target) * 100);

  // Couleurs perso programme avec fallback
  const cardColor = program.cardColor || business.primaryColor || "#1B3D0A";
  const cardAccent = program.cardAccent || business.accentColor || "#A6FF4D";

  return (
    <div className="min-h-screen bg-cream-100 px-5 py-8">
      <div className="max-w-md mx-auto space-y-5">
        {/* Header business */}
        <div className="flex items-center gap-3">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-12 w-12 rounded-2xl object-cover shadow-soft"
            />
          ) : (
            <div className="h-12 w-12 rounded-2xl bg-moss-300 flex items-center justify-center text-moss-900 font-display text-lg shadow-soft">
              {business.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl text-ink-900 leading-tight tracking-tight truncate">
              {business.name}
            </div>
            {business.city && (
              <div className="text-xs text-ink-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {business.city}
              </div>
            )}
          </div>
        </div>

        {/* Carte fidélité */}
        <div
          className="relative rounded-3xl p-7 shadow-shell overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}DD 60%, ${cardColor}AA 100%)`,
            color: "#FFFFFF",
          }}
        >
          <div
            className="absolute -right-12 -top-12 w-40 h-40 rounded-full opacity-20"
            style={{ background: cardAccent }}
          />
          <div
            className="absolute -left-8 -bottom-12 w-32 h-32 rounded-full opacity-10"
            style={{ background: cardAccent }}
          />

          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] opacity-80 mb-2">
              <Stars className="h-3.5 w-3.5" />
              Carte fidélité
            </div>
            <div className="font-display text-2xl tracking-tight mb-1">{program.name}</div>
            <div className="text-xs opacity-70 mb-6">
              {customer.firstName} {customer.lastName ?? ""}
            </div>

            {isStamp ? (
              <StampGrid count={card.stampsCount} required={target} accent={cardAccent} />
            ) : (
              <PointsBar current={card.pointsBalance} target={target} accent={cardAccent} />
            )}

            <div className="mt-5 text-sm opacity-90">
              {card.rewardAvailable ? (
                <span className="font-medium">🎁 Une récompense vous attend !</span>
              ) : (
                <span>
                  Plus que <strong>{Math.max(0, target - current)}</strong>{" "}
                  {isStamp ? (target - current > 1 ? "tampons" : "tampon") : "points"} pour : <strong>{program.rewardLabel}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Récompense disponible */}
        {rewards.length > 0 && (
          <div className="rounded-2xl bg-white border-2 border-dashed border-moss-300 p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-moss-100 flex items-center justify-center text-moss-700 flex-shrink-0">
                <Gift className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider font-medium text-moss-700 mb-1">
                  Récompense débloquée
                </div>
                <div className="font-display text-xl text-ink-900 leading-tight tracking-tight mb-1">
                  {rewards[0].title}
                </div>
                {rewards[0].description && (
                  <p className="text-sm text-ink-500">{rewards[0].description}</p>
                )}
                {rewards[0].redemptionCode && (
                  <div className="mt-3 inline-block px-3 py-1.5 rounded-md bg-cream-100 text-xs font-mono font-medium text-ink-900">
                    Code : {rewards[0].redemptionCode}
                  </div>
                )}
                <p className="text-xs text-ink-400 mt-3">
                  Présentez cet écran lors de votre visite.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats client */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Visites" value={String(card.lifetimeStamps + Math.floor(card.lifetimePoints / Math.max(1, program.pointsPerVisit ?? 1)))} />
          <StatCard label="Récompenses" value={String(card.rewardsRedeemedCount)} />
        </div>

        {/* Contact business */}
        <div className="rounded-2xl bg-white p-5 space-y-2">
          <div className="text-sm font-medium text-ink-900 mb-2">Nous contacter</div>
          <div className="flex flex-col gap-2">
            {business.whatsappNumber && (
              <a
                href={buildWhatsAppLink(business.whatsappNumber)}
                className="flex items-center gap-2 px-4 py-3 bg-moss-50 hover:bg-moss-100 rounded-xl text-sm text-ink-900 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-moss-700" />
                <span>WhatsApp</span>
              </a>
            )}
            {business.phone && (
              <a
                href={buildPhoneLink(business.phone)}
                className="flex items-center gap-2 px-4 py-3 bg-cream-100 hover:bg-cream-200 rounded-xl text-sm text-ink-900 transition-colors"
              >
                <Phone className="h-4 w-4 text-ink-500" />
                <span>{business.phone}</span>
              </a>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-ink-300 pt-2">
          Carte digitale propulsée par <a href="https://localia.app" className="underline">Localia</a>
        </p>
      </div>
    </div>
  );
}

function StampGrid({ count, required, accent }: { count: number; required: number; accent: string }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: required }).map((_, i) => {
        const filled = i < count;
        return (
          <div
            key={i}
            className="aspect-square rounded-xl flex items-center justify-center transition-all"
            style={{
              backgroundColor: filled ? accent : "rgba(255,255,255,0.15)",
              boxShadow: filled ? `0 4px 14px ${accent}50` : "none",
            }}
          >
            {filled ? (
              <Stars className="h-4 w-4" style={{ color: "#1B3D0A" }} />
            ) : (
              <span className="text-xs opacity-40">{i + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PointsBar({ current, target, accent }: { current: number; target: number; accent: string }) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="text-3xl font-display font-medium tracking-tight">{current}</div>
          <div className="text-xs opacity-70">points</div>
        </div>
        <div className="text-xs opacity-70">objectif {target}</div>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-white/15">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: accent }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center">
      <div className="font-display text-2xl text-ink-900 tracking-tight">{value}</div>
      <div className="text-xs text-ink-400 mt-0.5">{label}</div>
    </div>
  );
}
