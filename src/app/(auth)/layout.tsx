import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <header className="border-b border-cream-300/60">
        <div className="l-shell flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-moss-300 flex items-center justify-center text-moss-900 font-display font-medium text-base">
              L
            </div>
            <span className="font-display text-xl tracking-tight text-ink-900">Localia</span>
          </Link>
          <Link href="/" className="text-sm text-ink-400 hover:text-ink-900 transition-colors">
            ← Retour au site
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}
