import Link from "next/link";
import { ROUTES } from "@/config/routes";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-cream-300/60 bg-cream-100/80 backdrop-blur-md">
        <div className="l-shell flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-moss-300 flex items-center justify-center text-moss-900 font-display font-medium text-base shadow-glow">
              L
            </div>
            <span className="font-display text-xl tracking-tight text-ink-900">Localia</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm text-ink-500">
            <Link href={ROUTES.pricing} className="hover:text-ink-900 transition-colors">Tarifs</Link>
            <Link href={ROUTES.examples} className="hover:text-ink-900 transition-colors">Exemples</Link>
            <Link href={ROUTES.about} className="hover:text-ink-900 transition-colors">Pourquoi Localia</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href={ROUTES.login} className="text-sm text-ink-500 hover:text-ink-900 transition-colors hidden sm:inline">
              Se connecter
            </Link>
            <Link
              href={ROUTES.signup}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ink-900 text-cream-50 text-sm font-medium hover:bg-ink-700 transition-colors"
            >
              Créer ma page
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-cream-300 bg-cream-50 mt-24">
        <div className="l-shell py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-moss-300 flex items-center justify-center text-moss-900 font-display font-medium">L</div>
              <span className="font-display text-lg tracking-tight">Localia</span>
            </div>
            <p className="text-ink-400 max-w-sm leading-relaxed">
              Le mini-système client des commerces locaux. Mini-site + funnel + QR + WhatsApp + fidélité, livré prêt à l'emploi.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-ink-900 mb-3">Produit</h4>
            <ul className="space-y-2 text-ink-400">
              <li><Link href={ROUTES.pricing} className="hover:text-ink-900">Tarifs</Link></li>
              <li><Link href={ROUTES.examples} className="hover:text-ink-900">Exemples</Link></li>
              <li><Link href={ROUTES.about} className="hover:text-ink-900">Pourquoi Localia</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-ink-900 mb-3">Légal</h4>
            <ul className="space-y-2 text-ink-400">
              <li>Mentions légales</li>
              <li>CGV</li>
              <li>RGPD</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cream-300">
          <div className="l-shell py-6 text-xs text-ink-300 flex justify-between items-center">
            <span>© {new Date().getFullYear()} Localia. Tous droits réservés.</span>
            <span>Fait avec ♥ pour les commerces locaux.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
