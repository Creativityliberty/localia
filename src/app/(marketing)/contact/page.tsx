import Link from "next/link";
import { ROUTES } from "@/config/routes";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="l-shell-narrow py-16">
      <h1 className="font-display text-display-lg text-ink-900 tracking-tight mb-4">
        Une question, un projet ?
      </h1>
      <p className="text-ink-500 mb-8">
        Localia est l'équipe derrière votre mini-système. Écrivez-nous, on revient sous 24h ouvrées.
      </p>

      <div className="rounded-2xl bg-white border border-cream-300 p-8 space-y-4">
        <a
          href="mailto:hello@localia.app"
          className="flex items-center justify-between p-4 rounded-xl bg-cream-50 hover:bg-moss-50 transition-colors"
        >
          <div>
            <div className="text-xs text-ink-400">Email</div>
            <div className="font-medium text-ink-900">hello@localia.app</div>
          </div>
          <span className="text-ink-300">→</span>
        </a>

        <Link
          href={ROUTES.signup}
          className="flex items-center justify-between p-4 rounded-xl bg-cream-50 hover:bg-moss-50 transition-colors"
        >
          <div>
            <div className="text-xs text-ink-400">Pour démarrer</div>
            <div className="font-medium text-ink-900">Créer mon Localia</div>
          </div>
          <span className="text-ink-300">→</span>
        </Link>
      </div>
    </section>
  );
}
