import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@/config/limits";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Tarifs",
  description: "Localia : setup unique, maintenance optionnelle. Pas de prison contractuelle.",
};

export default function PricingPage() {
  const setup = ["start", "business", "funnel"] as const;
  const monthly = ["start", "business", "funnel", "growth"] as const;

  return (
    <>
      <section className="l-shell pt-16 pb-12 text-center">
        <h1 className="font-display text-display-xl text-ink-900 tracking-tight max-w-3xl mx-auto text-balance">
          Un setup unique. <em className="text-moss-700 not-italic">Une maintenance optionnelle.</em>
        </h1>
        <p className="mt-5 text-ink-500 max-w-2xl mx-auto">
          Vous payez à la création, et choisissez ensuite la maintenance qui vous convient. L'abonnement ne doit pas devenir une prison.
        </p>
      </section>

      <section className="l-shell pb-20">
        <h2 className="font-display text-2xl text-ink-900 mb-6 tracking-tight">1. Création (paiement unique)</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {setup.map((tier, idx) => {
            const plan = PLANS[tier];
            const featured = idx === 1;
            return (
              <div
                key={tier}
                className={
                  featured
                    ? "rounded-3xl bg-ink-900 text-cream-50 p-8 ring-2 ring-moss-300 shadow-shell relative"
                    : "rounded-3xl bg-white border border-cream-300 p-8"
                }
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-moss-300 text-moss-900 text-xs font-medium">
                    Le plus choisi
                  </span>
                )}
                <h3 className={`font-display text-2xl mb-1 tracking-tight ${featured ? "text-cream-50" : "text-ink-900"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mb-5">
                  <span className={`font-display text-4xl ${featured ? "text-cream-50" : "text-ink-900"}`}>
                    {plan.priceSetup}€
                  </span>
                  <span className={`text-sm ${featured ? "text-cream-300" : "text-ink-400"}`}>setup</span>
                </div>
                <ul className={`space-y-2.5 mb-6 text-sm ${featured ? "text-cream-200" : "text-ink-500"}`}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${featured ? "text-moss-300" : "text-moss-600"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={ROUTES.signup}
                  className={
                    featured
                      ? "block text-center w-full px-5 py-3 rounded-xl bg-moss-300 text-moss-900 font-medium hover:bg-moss-400 transition-colors"
                      : "block text-center w-full px-5 py-3 rounded-xl bg-ink-900 text-cream-50 font-medium hover:bg-ink-700 transition-colors"
                  }
                >
                  Choisir
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="l-shell pb-20">
        <h2 className="font-display text-2xl text-ink-900 mb-6 tracking-tight">2. Maintenance (optionnelle)</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {monthly.map((tier) => {
            const plan = PLANS[tier];
            return (
              <div key={tier} className="rounded-2xl bg-white border border-cream-300 p-6">
                <h3 className="font-display text-xl text-ink-900 mb-1 tracking-tight">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-display text-3xl text-ink-900">{plan.priceMonthly}€</span>
                  <span className="text-xs text-ink-400">/mois</span>
                </div>
                <ul className="space-y-1.5 text-xs text-ink-500">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-3 w-3 mt-1 flex-shrink-0 text-moss-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-ink-400 text-center">
          Modifications à la carte aussi possibles : 19€ (texte/horaires), 49€ (multi), 79€ (nouvelle section), 149€ (refonte).
        </p>
      </section>
    </>
  );
}
