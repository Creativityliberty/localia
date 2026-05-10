import Link from "next/link";
import { ArrowRight, Check, Smartphone, MessageCircle, QrCode, Sparkles, Stars, BarChart3 } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { PLANS } from "@/config/limits";
import { BUSINESS_CATEGORIES } from "@/config/business-categories";

export default function HomePage() {
  return (
    <>
      {/* HERO — éditorial, large, centré */}
      <section className="relative overflow-hidden">
        {/* Texture / grain background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-cream-100 via-cream-100 to-cream-50" />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, #1B3D0A 1px, transparent 1px), radial-gradient(circle at 75% 75%, #1B3D0A 1px, transparent 1px)",
              backgroundSize: "32px 32px, 32px 32px",
              backgroundPosition: "0 0, 16px 16px",
            }}
          />
          {/* Glow accent diagonale */}
          <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-moss-200/30 blur-[120px]" />
          <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-moss-100/40 blur-[100px]" />
        </div>

        <div className="l-shell pt-20 pb-24 md:pt-28 md:pb-32 relative">
          {/* Eyebrow */}
          <div className="flex justify-center mb-7 animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-cream-400 px-4 py-1.5 text-xs font-medium text-ink-500 shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-moss-400 animate-pulse" />
              Le mini-système client des commerces locaux
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-display-2xl text-center text-ink-900 max-w-5xl mx-auto text-balance animate-fade-in stagger-1">
            Transformez votre fiche Google,{" "}
            <em className="text-moss-700 not-italic relative inline-block">
              Instagram et WhatsApp
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-moss-300"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 Q 50 2, 100 6 T 198 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </em>{" "}
            en demandes clients.
          </h1>

          <p className="mt-7 text-lg md:text-xl text-ink-500 text-center max-w-2xl mx-auto leading-relaxed text-pretty animate-fade-in stagger-2">
            Un mini-site mobile, un QR code prêt à imprimer, un formulaire qui vous notifie, une offre de bienvenue et de la relance — sans builder, sans agence chère, sans prise de tête.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in stagger-3">
            <Link
              href={ROUTES.signup}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-moss-300 text-moss-900 font-medium text-[15px] shadow-glow hover:bg-moss-400 hover:-translate-y-0.5 transition-all"
            >
              Créer ma page Localia
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.examples}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-cream-400 text-ink-900 font-medium text-[15px] hover:border-ink-900 transition-all"
            >
              Voir un exemple
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-ink-400 animate-fade-in stagger-4">
            <Check className="h-3.5 w-3.5 text-moss-600" />
            <span>Livré sous 48h</span>
            <span className="mx-1.5 h-1 w-1 rounded-full bg-cream-400" />
            <Check className="h-3.5 w-3.5 text-moss-600" />
            <span>Pas de builder à apprendre</span>
            <span className="mx-1.5 h-1 w-1 rounded-full bg-cream-400" />
            <Check className="h-3.5 w-3.5 text-moss-600" />
            <span>Maintenance optionnelle</span>
          </div>

          {/* Mockup mini-site mobile flottant */}
          <div className="mt-20 max-w-md mx-auto relative animate-fade-in stagger-5">
            <div className="relative bg-ink-900 rounded-[2.75rem] p-2 shadow-shell">
              <div className="bg-cream-50 rounded-[2.25rem] overflow-hidden h-[520px] relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-ink-900 rounded-b-2xl z-10" />

                {/* Mockup mini-site */}
                <div className="pt-12 px-5 h-full overflow-hidden">
                  <div className="rounded-2xl overflow-hidden shadow-card mb-4">
                    <div
                      className="h-32 bg-gradient-to-br from-amber-200 via-amber-300 to-orange-300 relative"
                      style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath fill='%23fff' fill-opacity='0.08' d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5z'/%3E%3C/svg%3E\")",
                      }}
                    />
                  </div>
                  <div className="px-1">
                    <h3 className="font-display text-2xl text-ink-900 mb-1 leading-tight">Le Tacos d'Yvan</h3>
                    <p className="text-xs text-ink-400 mb-4">Snack — 14 rue de la République, Lyon</p>
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1 px-3 py-2.5 bg-moss-300 text-moss-900 rounded-xl text-center text-xs font-medium shadow-glow">
                        WhatsApp
                      </div>
                      <div className="flex-1 px-3 py-2.5 bg-white border border-cream-400 text-ink-900 rounded-xl text-center text-xs font-medium">
                        Appeler
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="rounded-xl bg-white border border-cream-300 p-3 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-amber-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-ink-900 truncate">Tacos signature</div>
                          <div className="text-[10px] text-ink-400 truncate">Bœuf, fromage, sauce maison</div>
                        </div>
                        <div className="text-xs font-medium text-moss-700">9.90€</div>
                      </div>
                      <div className="rounded-xl bg-white border border-cream-300 p-3 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-amber-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-ink-900 truncate">Menu midi</div>
                          <div className="text-[10px] text-ink-400 truncate">Tacos + boisson + frites</div>
                        </div>
                        <div className="text-xs font-medium text-moss-700">12€</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Petits floating tags */}
            <div className="absolute -top-3 -right-6 px-3 py-1.5 bg-white rounded-lg shadow-card text-xs font-medium text-moss-700 flex items-center gap-1.5 rotate-3 animate-subtle-float">
              <MessageCircle className="h-3.5 w-3.5" />
              +24 messages WhatsApp
            </div>
            <div className="absolute -bottom-3 -left-6 px-3 py-1.5 bg-white rounded-lg shadow-card text-xs font-medium text-ink-900 flex items-center gap-1.5 -rotate-3 animate-subtle-float" style={{ animationDelay: "1.5s" }}>
              <Stars className="h-3.5 w-3.5 text-moss-600" />
              142 clients fidèles
            </div>
          </div>
        </div>
      </section>

      {/* PROBLÈME → SOLUTION */}
      <section className="l-shell py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-400 mb-4 block">
              Le constat
            </span>
            <h2 className="font-display text-display-lg text-ink-900 mb-6 text-balance">
              Vous avez déjà un commerce, des clients, une fiche Google. Mais pas de système.
            </h2>
            <ul className="space-y-3 text-ink-500 text-[15px]">
              {[
                "Pas de vrai site, juste une fiche Google sous-exploitée",
                "Un Instagram qui poste, mais qui ne convertit pas",
                "Des clients qui demandent toujours les mêmes infos sur WhatsApp",
                "Pas de formulaire propre, pas de relance, pas de fidélité",
                "Pas le temps d'apprendre Wix, Webflow ou Systeme.io",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-ink-300 flex-shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-moss-100 rounded-3xl rotate-1" />
            <div className="relative bg-white rounded-3xl border border-cream-400 p-8 shadow-card">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-moss-700 mb-4 block">
                La promesse Localia
              </span>
              <p className="font-display text-2xl md:text-3xl text-ink-900 leading-tight tracking-tight text-balance">
                Une page professionnelle pour votre fiche Google, Instagram, WhatsApp et vos QR codes — avec formulaire, offre, relance et analytics simples.
              </p>
              <p className="mt-6 text-sm text-ink-400 leading-relaxed">
                Pas un builder. Une livraison.<br />
                Pas un funnel à apprendre. Un système qui tourne pour vous.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES PRODUIT */}
      <section className="bg-cream-50 py-24 border-y border-cream-300">
        <div className="l-shell">
          <div className="text-center mb-16">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-400 mb-3 block">
              Les modules
            </span>
            <h2 className="font-display text-display-lg text-ink-900 max-w-2xl mx-auto text-balance">
              Six briques simples qui forment un mini-système commercial.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Smartphone, title: "Localia Page", desc: "Mini-site mobile professionnel : hero, services, preuves, CTA, contact." },
              { icon: MessageCircle, title: "Localia Funnel", desc: "Offre de bienvenue, formulaire, page merci, relance email/WhatsApp." },
              { icon: QrCode, title: "Localia QR", desc: "QR code site, offre, avis, fidélité, WhatsApp — PNG, SVG, PDF imprimable." },
              { icon: BarChart3, title: "Localia Leads", desc: "Demandes centralisées, statut, export CSV, notifications email." },
              { icon: Sparkles, title: "Localia Analytics", desc: "Vues, clics WhatsApp, appels, formulaires, scans QR. Sans Google Analytics." },
              { icon: Stars, title: "Localia Fidélité", desc: "Carte digitale, points/tampons, offres retour, clients dormants." },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl bg-white border border-cream-300 p-6 hover:border-moss-300 hover:shadow-card-hover transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-moss-50 group-hover:bg-moss-100 flex items-center justify-center text-moss-700 mb-5 transition-colors">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <h3 className="font-display text-xl text-ink-900 mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÉTIERS COUVERTS */}
      <section className="l-shell py-24">
        <div className="text-center mb-12">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-400 mb-3 block">
            Pour qui
          </span>
          <h2 className="font-display text-display-lg text-ink-900 max-w-2xl mx-auto text-balance">
            Pensé pour les commerces de proximité.
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {BUSINESS_CATEGORIES.filter((c) => c.value !== "OTHER").map((cat) => (
            <span
              key={cat.value}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-cream-400 text-sm text-ink-700 hover:border-moss-300 hover:bg-moss-50 transition-colors"
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </span>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-ink-900 text-cream-50 py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-moss-700/30 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-moss-300/10 blur-[140px]" />
        </div>

        <div className="l-shell relative">
          <div className="text-center mb-14">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-moss-300 mb-3 block">
              Tarifs
            </span>
            <h2 className="font-display text-display-lg max-w-2xl mx-auto text-balance">
              Un setup unique, une maintenance optionnelle.
            </h2>
            <p className="mt-4 text-cream-300 max-w-xl mx-auto">
              Le système ne doit pas devenir une prison. Vous payez à la création, et choisissez ensuite la maintenance qui vous convient.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {(["start", "business", "funnel"] as const).map((tier, idx) => {
              const plan = PLANS[tier];
              const isFeatured = idx === 1;
              return (
                <div
                  key={tier}
                  className={
                    isFeatured
                      ? "rounded-3xl bg-cream-50 text-ink-900 p-8 ring-2 ring-moss-300 shadow-glow relative scale-[1.02]"
                      : "rounded-3xl bg-ink-700/40 backdrop-blur border border-ink-700 p-8"
                  }
                >
                  {isFeatured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-moss-300 text-moss-900 text-xs font-medium">
                      Le plus choisi
                    </span>
                  )}
                  <h3 className={`font-display text-2xl tracking-tight mb-1 ${isFeatured ? "text-ink-900" : "text-cream-50"}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5 mb-5">
                    <span className={`font-display text-4xl ${isFeatured ? "text-ink-900" : "text-cream-50"}`}>
                      {plan.priceSetup}€
                    </span>
                    <span className={`text-sm ${isFeatured ? "text-ink-400" : "text-cream-300"}`}>
                      setup unique
                    </span>
                  </div>
                  <ul className={`space-y-2.5 mb-6 text-sm ${isFeatured ? "text-ink-500" : "text-cream-200"}`}>
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isFeatured ? "text-moss-600" : "text-moss-300"}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={ROUTES.signup}
                    className={
                      isFeatured
                        ? "block text-center w-full px-5 py-3 rounded-xl bg-ink-900 text-cream-50 font-medium hover:bg-ink-700 transition-colors"
                        : "block text-center w-full px-5 py-3 rounded-xl bg-moss-300 text-moss-900 font-medium hover:bg-moss-400 transition-colors"
                    }
                  >
                    Démarrer
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="text-center mt-10 text-sm text-cream-300">
            Maintenance dès <span className="text-moss-300 font-medium">19€/mois</span>. Modifications à la carte dès 19€.{" "}
            <Link href={ROUTES.pricing} className="underline underline-offset-4 hover:text-moss-200">Voir tous les plans</Link>
          </p>
        </div>
      </section>

      {/* CONTRE-POSITIONNEMENT */}
      <section className="l-shell py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-display-lg text-ink-900 mb-12 text-center text-balance">
            Localia n'est pas un nouveau Systeme.io.
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-cream-50 border border-cream-300 p-7">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-3 block">Systeme.io</span>
              <p className="font-display text-2xl text-ink-900 mb-4 leading-tight">
                Un builder pour entrepreneurs digitaux.
              </p>
              <ul className="space-y-2 text-sm text-ink-500">
                <li>• Construire ses propres tunnels</li>
                <li>• Vendre formations, ebooks, abonnements en ligne</li>
                <li>• Apprendre l'outil, configurer, tester</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-moss-50 border-2 border-moss-300 p-7">
              <span className="text-xs font-medium uppercase tracking-wider text-moss-700 mb-3 block">Localia</span>
              <p className="font-display text-2xl text-ink-900 mb-4 leading-tight">
                Un mini-système livré pour commerces locaux.
              </p>
              <ul className="space-y-2 text-sm text-ink-700">
                <li>• Recevoir un système clé-en-main</li>
                <li>• Recevoir plus de demandes WhatsApp / appels / formulaires</li>
                <li>• Aucun outil à apprendre</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="l-shell pb-32">
        <div className="rounded-3xl bg-gradient-to-br from-moss-300 via-moss-200 to-cream-100 p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-6 right-6 text-7xl opacity-30 font-display rotate-12">L</div>
          <h2 className="font-display text-display-lg text-moss-900 max-w-2xl mx-auto mb-4 relative text-balance">
            Votre commerce mérite mieux qu'une fiche Google.
          </h2>
          <p className="text-moss-800 mb-8 max-w-lg mx-auto">
            Créez votre mini-système client en moins de 48h.
          </p>
          <Link
            href={ROUTES.signup}
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-ink-900 text-cream-50 font-medium text-[15px] hover:bg-ink-700 hover:-translate-y-0.5 transition-all shadow-shell"
          >
            Démarrer maintenant
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
