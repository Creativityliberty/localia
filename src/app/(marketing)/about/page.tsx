import Link from "next/link";
import { ROUTES } from "@/config/routes";

export const metadata = { title: "Pourquoi Localia" };

export default function AboutPage() {
  return (
    <section className="l-shell-narrow py-16">
      <h1 className="font-display text-display-xl text-ink-900 tracking-tight text-balance mb-6">
        Localia n'est pas un nouveau builder.
      </h1>
      <p className="text-lg text-ink-500 leading-relaxed mb-8">
        C'est un mini-système livré pour les commerces qui veulent recevoir plus de demandes — sans rien apprendre, sans payer une agence chère.
      </p>

      <div className="prose prose-ink max-w-none">
        <h2 className="font-display text-2xl text-ink-900 tracking-tight mt-10">Le constat</h2>
        <p className="text-ink-500 leading-relaxed">
          Les petits commerces ont déjà tout ce qu'il faut : une fiche Google, un Instagram, un WhatsApp, des clients réels. Mais pas de système clair pour convertir, suivre, et faire revenir.
        </p>
        <p className="text-ink-500 leading-relaxed">
          Systeme.io, Wix, Webflow sont puissants. Trop souvent, ils sont trop larges pour un commerce local, et demandent un apprentissage que personne n'a le temps de faire.
        </p>

        <h2 className="font-display text-2xl text-ink-900 tracking-tight mt-10">La promesse</h2>
        <p className="text-ink-500 leading-relaxed">
          Une page professionnelle pour votre fiche Google, Instagram, WhatsApp et vos QR codes. Avec formulaire, offre, relance et analytics simples.
        </p>
        <p className="text-ink-500 leading-relaxed">
          Pas de builder. Une livraison. Pas de funnel à comprendre. Un système qui tourne pour vous.
        </p>

        <h2 className="font-display text-2xl text-ink-900 tracking-tight mt-10">Le contre-positionnement</h2>
        <p className="text-ink-500 leading-relaxed">
          <strong>Systeme.io</strong> est fait pour les entrepreneurs digitaux qui veulent construire leurs tunnels.<br />
          <strong>Localia</strong> est fait pour les commerces qui veulent des clients sans toucher à un builder.
        </p>
      </div>

      <div className="mt-12">
        <Link
          href={ROUTES.signup}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-moss-300 text-moss-900 font-medium hover:bg-moss-400 transition-colors shadow-glow"
        >
          Démarrer mon Localia
        </Link>
      </div>
    </section>
  );
}
