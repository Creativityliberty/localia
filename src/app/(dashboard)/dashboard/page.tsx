import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, MessageCircle, Inbox, Stars, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { requireUser } from "@/server/auth/get-viewer";
import { getDashboardOverview } from "@/server/services/dashboard-overview";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/config/routes";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const viewer = await requireUser();

  let overview;
  try {
    overview = await getDashboardOverview(viewer.id);
  } catch {
    redirect(ROUTES.dashboardBusiness);
  }

  const { business, site, stats, recentLeads } = overview;
  const isPublished = site?.status === "published";

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Bonjour, ${business.name}`}
        description={isPublished
          ? "Voici où en est votre mini-système client."
          : "Votre Localia est prêt à être lancé. Quelques étapes pour publier."
        }
        actions={
          site && isPublished ? (
            <Button asChild variant="ghost" size="md">
              <Link href={`${ROUTES.publicSite(site.slug)}`} target="_blank">
                <ExternalLink className="h-4 w-4" /> Voir mon site
              </Link>
            </Button>
          ) : (
            <Button asChild variant="accent" size="md">
              <Link href={ROUTES.dashboardBuilder}>
                <Sparkles className="h-4 w-4" /> Configurer mon site
              </Link>
            </Button>
          )
        }
      />

      {/* Site state banner */}
      {!isPublished && (
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-moss-50 to-cream-100 border border-moss-200 p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-moss-700 flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl text-ink-900 tracking-tight mb-1">
                Mettons votre Localia en route
              </h3>
              <p className="text-sm text-ink-500 mb-4">
                Configurez votre commerce, ajoutez vos services et publiez votre mini-site. La génération IA peut le pré-remplir en quelques secondes.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="primary" size="sm">
                  <Link href={ROUTES.dashboardBuilder}>Lancer le builder</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={ROUTES.dashboardBusiness}>Compléter le commerce</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Vues 30j"
          value={stats.views30d}
          delta={stats.viewsDelta}
          icon={<Eye className="h-4 w-4" strokeWidth={1.6} />}
        />
        <StatCard
          label="Clics WhatsApp"
          value={stats.whatsappClicks}
          delta={stats.whatsappDelta}
          icon={<MessageCircle className="h-4 w-4" strokeWidth={1.6} />}
        />
        <StatCard
          label="Demandes"
          value={stats.leadsCount}
          suffix={stats.leadsThisWeek > 0 ? `+${stats.leadsThisWeek} cette sem.` : undefined}
          icon={<Inbox className="h-4 w-4" strokeWidth={1.6} />}
        />
        <StatCard
          label="Clients fidèles"
          value={stats.loyaltyCustomers}
          suffix={stats.rewardsAvailable > 0 ? `${stats.rewardsAvailable} récomp.` : undefined}
          variant="accent"
          icon={<Stars className="h-4 w-4" strokeWidth={1.6} />}
        />
      </section>

      {/* Leads & quick actions grid */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Leads */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-ink-900 tracking-tight">Demandes récentes</h2>
            <Link href={ROUTES.dashboardLeads} className="text-sm text-ink-500 hover:text-ink-900 inline-flex items-center gap-1">
              Tout voir <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="Aucune demande pour l'instant"
              description="Dès qu'un visiteur remplira votre formulaire ou cliquera sur WhatsApp, vous le verrez ici."
              primaryAction={!isPublished ? {
                label: "Publier mon site d'abord",
                href: ROUTES.dashboardBuilder,
              } : undefined}
            />
          ) : (
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={ROUTES.dashboardLead(lead.id)}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white border border-cream-300 hover:border-moss-300 hover:shadow-soft transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-moss-50 text-moss-700 flex items-center justify-center font-display text-sm flex-shrink-0">
                    {(lead.name ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-ink-900 truncate">{lead.name ?? "Anonyme"}</span>
                      {lead.status === "new" && <Badge variant="accent">Nouveau</Badge>}
                    </div>
                    <div className="text-xs text-ink-400 truncate">
                      {lead.serviceRequested ? `${lead.serviceRequested} · ` : ""}
                      {lead.message.slice(0, 80)}
                    </div>
                  </div>
                  <div className="text-xs text-ink-300 flex-shrink-0 whitespace-nowrap">
                    {formatRelativeTime(lead.createdAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <aside className="space-y-4">
          <h2 className="font-display text-2xl text-ink-900 tracking-tight">Raccourcis</h2>
          <div className="space-y-2">
            {[
              { label: "Modifier mon site", href: ROUTES.dashboardBuilder, desc: "Sections, services, CTA" },
              { label: "Créer un QR code", href: ROUTES.dashboardQr, desc: "Vitrine, flyer, comptoir" },
              { label: "Lancer une offre", href: ROUTES.dashboardOffers, desc: "Promo, bienvenue" },
              { label: "Voir les analytics", href: ROUTES.dashboardAnalytics, desc: "Vues, clics, conversion" },
            ].map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="flex items-center gap-3 p-4 rounded-xl bg-white border border-cream-300 hover:border-moss-300 transition-colors group"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink-900">{q.label}</div>
                  <div className="text-xs text-ink-400">{q.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-ink-300 group-hover:text-moss-700 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
