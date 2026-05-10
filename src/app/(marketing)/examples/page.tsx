import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { BUSINESS_CATEGORIES } from "@/config/business-categories";

export const metadata = { title: "Exemples" };

export default function ExamplesPage() {
  return (
    <section className="l-shell py-16">
      <h1 className="font-display text-display-xl text-ink-900 tracking-tight max-w-3xl text-balance mb-4">
        Localia s'adapte à votre métier.
      </h1>
      <p className="text-ink-500 max-w-2xl mb-12">
        Chaque catégorie a son template : sections par défaut, CTA prioritaire, ton recommandé.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {BUSINESS_CATEGORIES.filter((c) => c.value !== "OTHER").map((cat) => (
          <div
            key={cat.value}
            className="rounded-2xl bg-white border border-cream-300 p-5 hover:border-moss-300 hover:shadow-soft transition-all"
          >
            <div className="text-3xl mb-2">{cat.emoji}</div>
            <div className="font-medium text-ink-900 mb-1">{cat.label}</div>
            <div className="text-xs text-ink-400">
              CTA : {cat.defaultCtaPriority[0]}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          href={ROUTES.signup}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ink-900 text-cream-50 font-medium hover:bg-ink-700 transition-colors"
        >
          Créer ma page Localia
        </Link>
      </div>
    </section>
  );
}
