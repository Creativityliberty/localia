import Link from "next/link";
import { ROUTES } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="font-display text-7xl text-moss-700 mb-4 tracking-tight">404</div>
        <h1 className="font-display text-3xl text-ink-900 tracking-tight mb-3">
          Cette page n'existe pas
        </h1>
        <p className="text-ink-400 mb-6">
          Le lien est cassé ou la page a été archivée.
        </p>
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-ink-900 text-cream-50 font-medium hover:bg-ink-700 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
